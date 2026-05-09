import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Carregar carrinho ao logar ──
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cartService.getCarrinho();
      setCart(res.data);
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincroniza com auth state
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, loadCart]);

  // ── Adicionar item ao carrinho ──
  const addToCart = useCallback(async (produtoId, quantidade = 1) => {
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
  }, []);

  // ── Remover item do carrinho ──
  const removeFromCart = useCallback(async (produtoId) => {
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
  }, []);

  // ── Limpar carrinho ──
  const clearCart = useCallback(async () => {
    try {
      await cartService.limparCarrinho();
      setCart(null);
      return { success: true };
    } catch (err) {
      console.error('Erro clearCart:', err);
      return { success: false, error: 'Erro ao limpar carrinho.' };
    }
  }, []);

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
    clearCart,
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
