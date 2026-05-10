import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ImageOff,
  Gem,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/common/Toast';
import Spinner from '../components/common/Spinner';

/**
 * Formata preço para BRL.
 */
const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, cartCount, removeFromCart, clearCart, loading } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [removingId, setRemovingId] = useState(null);

  // ── Não logado ──
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-fixed/30 p-4">
          <ShoppingCart size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold font-headline">Acesse sua conta</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Faça login para ver seu carrinho de compras.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim"
        >
          Entrar
        </Link>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Carrinho Vazio ──
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-surface-container-low p-5">
          <ShoppingBag size={40} className="text-outline/40" />
        </div>
        <h1 className="text-xl font-bold font-headline">Seu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Explore a vitrine e adicione peças artesanais incríveis.
        </p>
        <Link
          to="/vitrine"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim"
        >
          <ShoppingBag size={16} />
          Explorar Vitrine
        </Link>
      </div>
    );
  }

  // ── Remover item ──
  const handleRemove = async (produtoId) => {
    setRemovingId(produtoId);
    const result = await removeFromCart(produtoId);
    setRemovingId(null);

    if (result.success) {
      addToast('Item removido do carrinho.', 'info');
    } else {
      addToast(result.error, 'error');
    }
  };

  // ── Limpar carrinho ──
  const handleClear = async () => {
    const result = await clearCart();
    if (result.success) {
      addToast('Carrinho limpo com sucesso.', 'info');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart size={24} className="text-primary" />
          <h1 className="text-2xl font-bold font-headline md:text-3xl">
            Meu Carrinho
          </h1>
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-on-primary">
            {cartCount}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="text-sm font-medium text-on-surface-variant transition-colors hover:text-tertiary"
        >
          Limpar tudo
        </button>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Coluna Esquerda: Itens (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.produtoId}
              className={`flex items-center gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 transition-all ${
                removingId === item.produtoId ? 'opacity-50' : ''
              }`}
            >
              {/* Thumbnail */}
              <Link
                to={`/produto/${item.produtoId}`}
                className="shrink-0 overflow-hidden rounded-lg"
              >
                {item.imagemUrl ? (
                  <img
                    src={item.imagemUrl}
                    alt={item.produtoNome}
                    className="h-20 w-20 object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center bg-surface-container">
                    <ImageOff size={24} className="text-outline/30" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/produto/${item.produtoId}`}
                  className="text-sm font-semibold font-headline text-on-surface hover:text-primary transition-colors line-clamp-1"
                >
                  {item.produtoNome}
                </Link>

                <div className="mt-1 flex items-center gap-2">
                  {item.pecaUnica && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                      <Gem size={10} />
                      Peça Única
                    </span>
                  )}
                  <span className="text-xs text-on-surface-variant">
                    Qtd: {item.quantidade}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-on-surface-variant">
                    {formatPrice(item.precoUnitario)} un.
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>

              {/* Remover */}
              <button
                onClick={() => handleRemove(item.produtoId)}
                disabled={removingId === item.produtoId}
                className="shrink-0 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-tertiary/10 hover:text-tertiary disabled:opacity-50"
                title="Remover item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {/* Continuar comprando */}
          <Link
            to="/vitrine"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Continuar comprando
          </Link>
        </div>

        {/* ── Coluna Direita: Resumo (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
            <h2 className="mb-5 text-lg font-bold font-headline">Resumo</h2>

            {/* Subtotal */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
              <span className="text-sm text-on-surface-variant">
                Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
              </span>
              <span className="text-sm font-semibold">{formatPrice(cartTotal)}</span>
            </div>

            {/* Frete — calculado no checkout */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 py-4">
              <span className="text-sm text-on-surface-variant">Frete</span>
              <span className="text-xs text-on-surface-variant">Calculado no checkout</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-base font-bold">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* CTA Pagamento */}
            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient"
            >
              Ir para Pagamento
              <ArrowRight size={16} />
            </button>

            <Link
              to="/vitrine"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
