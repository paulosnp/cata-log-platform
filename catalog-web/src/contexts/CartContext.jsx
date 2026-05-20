import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import {
  addGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  enrichGuestCart,
  getGuestCartItems,
} from '../services/guestCartHelper';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const prevAuthRef = useRef(false);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Carregar carrinho (API para logado, localStorage para guest) ──
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.role === 'COMPRADOR') {
        // Logado: carrega do backend
        const res = await cartService.getCarrinho();
        setCart(res.data);
      } else {
        // Guest: enriquece dados do localStorage com info do produto
        const guestCart = await enrichGuestCart();
        setCart(guestCart.itens.length > 0 ? guestCart : null);
      }
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Erro ao carregar carrinho:', err);
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // ── Sync: quando loga, transfere guest cart para o backend ──
  const syncGuestCartToBackend = useCallback(async () => {
    const guestItems = getGuestCartItems();
    if (guestItems.length === 0) return;

    // Adiciona cada item do guest cart ao backend (em paralelo)
    await Promise.allSettled(
      guestItems.map((item) =>
        cartService.addItem(item.produtoId, item.quantidade)
      )
    );

    // Limpa o guest cart após sincronizar
    clearGuestCart();
  }, []);

  // Sincroniza com auth state
  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated && user?.role === 'COMPRADOR') {
      if (!wasAuthenticated) {
        // Acabou de logar → sincroniza guest cart, depois carrega do backend
        syncGuestCartToBackend().then(() => loadCart());
      } else {
        loadCart();
      }
    } else {
      // Guest ou não-COMPRADOR → carrega do localStorage
      loadCart();
    }
  }, [isAuthenticated, user?.role, loadCart, syncGuestCartToBackend]);

  // ── Adicionar item ao carrinho ──
  const addToCart = useCallback(
    async (produtoId, quantidade = 1) => {
      if (isAuthenticated && user?.role === 'COMPRADOR') {
        // Logado: API
        try {
          const res = await cartService.addItem(produtoId, quantidade);
          setCart(res.data);
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.mensagem ||
            err.response?.data?.message ||
            'Erro ao adicionar ao carrinho.';
          console.error('Erro addToCart:', err);
          return { success: false, error: message };
        }
      } else {
        // Guest: localStorage
        addGuestCartItem(produtoId, quantidade);
        const guestCart = await enrichGuestCart();
        setCart(guestCart.itens.length > 0 ? guestCart : null);
        return { success: true };
      }
    },
    [isAuthenticated, user?.role]
  );

  // ── Remover item do carrinho ──
  const removeFromCart = useCallback(
    async (produtoId) => {
      if (isAuthenticated && user?.role === 'COMPRADOR') {
        try {
          const res = await cartService.removeItem(produtoId);
          setCart(res.data);
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.mensagem ||
            err.response?.data?.message ||
            'Erro ao remover do carrinho.';
          console.error('Erro removeFromCart:', err);
          return { success: false, error: message };
        }
      } else {
        removeGuestCartItem(produtoId);
        const guestCart = await enrichGuestCart();
        setCart(guestCart.itens.length > 0 ? guestCart : null);
        return { success: true };
      }
    },
    [isAuthenticated, user?.role]
  );

  // ── Limpar carrinho ──
  const clearCartAction = useCallback(async () => {
    if (isAuthenticated && user?.role === 'COMPRADOR') {
      try {
        await cartService.limparCarrinho();
        setCart(null);
        return { success: true };
      } catch (err) {
        console.error('Erro clearCart:', err);
        return { success: false, error: 'Erro ao limpar carrinho.' };
      }
    } else {
      clearGuestCart();
      setCart(null);
      return { success: true };
    }
  }, [isAuthenticated, user?.role]);

  // ── Getters ──
  const cartCount = cart?.totalItens || 0;
  const cartTotal = cart?.valorTotal || 0;
  const cartItems = cart?.itens || [];

  const value = {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    clearCart: clearCartAction,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um <CartProvider>');
  }
  return context;
}
