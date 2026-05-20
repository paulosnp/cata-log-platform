import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import {
  getGuestWishlistIds,
  addGuestWishlistId,
  removeGuestWishlistId,
  clearGuestWishlist,
} from '../services/guestCartHelper';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const prevAuthRef = useRef(false);

  // Set de IDs para lookup O(1)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // ── Carregar wishlist (API para logado, localStorage para guest) ──
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Logado: carrega do backend
        const res = await wishlistService.listar({ page: 0, size: 100 });
        const ids = new Set(res.data.content.map((item) => item.produtoId));
        setWishlistIds(ids);
      } else {
        // Guest: carrega do localStorage
        const ids = new Set(getGuestWishlistIds());
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error('Erro ao carregar wishlist:', err);
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── Sync: quando loga, transfere guest wishlist para o backend ──
  const syncGuestWishlistToBackend = useCallback(async () => {
    const guestIds = getGuestWishlistIds();
    if (guestIds.length === 0) return;

    // Adiciona cada item da guest wishlist ao backend
    await Promise.allSettled(
      guestIds.map((produtoId) => wishlistService.adicionar(produtoId))
    );

    // Limpa a guest wishlist após sincronizar
    clearGuestWishlist();
  }, []);

  // Sincroniza com auth state
  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated) {
      if (!wasAuthenticated) {
        // Acabou de logar → sincroniza guest wishlist, depois carrega do backend
        syncGuestWishlistToBackend().then(() => loadWishlist());
      } else {
        loadWishlist();
      }
    } else {
      // Guest → carrega do localStorage
      loadWishlist();
    }
  }, [isAuthenticated, loadWishlist, syncGuestWishlistToBackend]);

  // ── Verifica se produto está favoritado ──
  const isWishlisted = useCallback(
    (produtoId) => wishlistIds.has(produtoId),
    [wishlistIds]
  );

  // ── Toggle favorito (adiciona/remove) ──
  const toggleWishlist = useCallback(
    async (produtoId) => {
      const alreadyWishlisted = wishlistIds.has(produtoId);

      try {
        if (isAuthenticated) {
          // Logado: API
          if (alreadyWishlisted) {
            await wishlistService.remover(produtoId);
            setWishlistIds((prev) => {
              const next = new Set(prev);
              next.delete(produtoId);
              return next;
            });
            return { success: true, action: 'removed' };
          } else {
            await wishlistService.adicionar(produtoId);
            setWishlistIds((prev) => new Set(prev).add(produtoId));
            return { success: true, action: 'added' };
          }
        } else {
          // Guest: localStorage
          if (alreadyWishlisted) {
            removeGuestWishlistId(produtoId);
            setWishlistIds((prev) => {
              const next = new Set(prev);
              next.delete(produtoId);
              return next;
            });
            return { success: true, action: 'removed' };
          } else {
            addGuestWishlistId(produtoId);
            setWishlistIds((prev) => new Set(prev).add(produtoId));
            return { success: true, action: 'added' };
          }
        }
      } catch (err) {
        const message =
          err.response?.data?.mensagem ||
          err.response?.data?.message ||
          'Erro ao atualizar favoritos.';
        console.error('Erro toggleWishlist:', err);
        return { success: false, error: message };
      }
    },
    [wishlistIds, isAuthenticated]
  );

  const value = {
    wishlistIds,
    loading,
    isWishlisted,
    toggleWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist deve ser usado dentro de um <WishlistProvider>');
  }
  return context;
}
