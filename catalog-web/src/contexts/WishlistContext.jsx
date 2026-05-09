import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // Set de IDs para lookup O(1)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // ── Carregar wishlist ao logar ──
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      // Busca todas as páginas (size grande para pegar tudo)
      const res = await wishlistService.listar({ page: 0, size: 100 });
      const ids = new Set(res.data.content.map((item) => item.produtoId));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Erro ao carregar wishlist:', err);
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincroniza com auth state
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlistIds(new Set());
    }
  }, [isAuthenticated, loadWishlist]);

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
      } catch (err) {
        const message =
          err.response?.data?.mensagem ||
          err.response?.data?.message ||
          'Erro ao atualizar favoritos.';
        console.error('Erro toggleWishlist:', err);
        return { success: false, error: message };
      }
    },
    [wishlistIds]
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
