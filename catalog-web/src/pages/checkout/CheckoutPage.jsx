import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ImageOff,
  Gem,
  Lock,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/common/Toast';
import { orderService } from '../../services/orderService';
import FreightCalculator from '../../components/cart/FreightCalculator';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, clearCart, loading: cartLoading } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('idle');

  if (cartLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0 && step === 'idle') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-surface-container-low p-5">
          <CreditCard size={40} className="text-outline/40" />
        </div>
        <h1 className="text-xl font-bold font-headline">Nenhum item para checkout</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Adicione produtos ao carrinho antes de finalizar a compra.
        </p>
        <Link
          to="/vitrine"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim"
        >
          Explorar Vitrine
        </Link>
      </div>
    );
  }

  const freteValor = freteSelecionado?.valor || 0;
  const totalFinal = Number(cartTotal) + freteValor;

  const handleFinalizarCompra = async () => {
    setProcessing(true);

    try {
      setStep('checkout');
      const checkoutRes = await orderService.checkout();
      const pedido = checkoutRes.data;

      setStep('payment');
      const pagamentoRes = await orderService.gerarPagamento(pedido.id);
      const { paymentUrl } = pagamentoRes.data;

      if (!paymentUrl) {
        throw new Error('URL de pagamento não retornada pelo servidor.');
      }

      setStep('redirect');
      clearCart();

      window.location.href = paymentUrl;
    } catch (err) {
      setProcessing(false);
      setStep('idle');

      const message =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.message ||
        'Erro ao processar compra. Tente novamente.';

      addToast(message, 'error');

      if (
        message.toLowerCase().includes('carrinho') &&
        message.toLowerCase().includes('vazio')
      ) {
        navigate('/carrinho');
      }
    }
  };

  const stepMessages = {
    checkout: 'Criando pedido...',
    payment: 'Gerando link de pagamento...',
    redirect: 'Redirecionando para o Mercado Pago...',
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck size={24} className="text-primary" />
        <h1 className="text-2xl font-bold font-headline md:text-3xl">
          Finalizar Compra
        </h1>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-8 shadow-hover">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-sm font-semibold text-on-surface">
              {stepMessages[step] || 'Processando...'}
            </p>
            <div className="flex items-center gap-2">
              {['checkout', 'payment', 'redirect'].map((s, i) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    ['checkout', 'payment', 'redirect'].indexOf(step) >= i
                      ? 'bg-primary'
                      : 'bg-outline-variant/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Coluna Esquerda: Itens (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do comprador */}
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-lg font-bold font-headline">Dados do Comprador</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{user?.nome}</p>
                <p className="text-xs text-on-surface-variant">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Itens do pedido */}
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-lg font-bold font-headline">
              Itens do Pedido ({cartCount})
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.produtoId}
                  className="flex items-center gap-4 rounded-xl bg-surface-container-low/50 p-3"
                >
                  <Link
                    to={`/produto/${item.produtoId}`}
                    className="shrink-0 overflow-hidden rounded-lg"
                  >
                    {item.imagemUrl ? (
                      <img
                        src={item.imagemUrl}
                        alt={item.produtoNome}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center bg-surface-container">
                        <ImageOff size={20} className="text-outline/30" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface line-clamp-1">
                      {item.produtoNome}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {item.pecaUnica && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                          <Gem size={10} />
                          Peça Única
                        </span>
                      )}
                      <span className="text-xs text-on-surface-variant">
                        {formatPrice(item.precoUnitario)} × {item.quantidade}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Coluna Direita: Resumo (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Frete */}
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
              <FreightCalculator
                onFreteSelected={setFreteSelecionado}
                cartItems={cartItems}
              />
              {freteSelecionado && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-primary-fixed/20 p-3">
                  <span className="text-sm text-on-surface-variant">
                    {freteSelecionado.nome} — até {freteSelecionado.prazoDias} dias
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(freteSelecionado.valor)}
                  </span>
                </div>
              )}
            </div>

            {/* Resumo */}
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
              <h2 className="mb-5 text-lg font-bold font-headline">Resumo</h2>

              <div className="space-y-3 border-b border-outline-variant/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">
                    Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="text-sm font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Frete</span>
                  <span className="text-sm font-semibold">
                    {freteSelecionado
                      ? formatPrice(freteSelecionado.valor)
                      : 'A calcular'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(totalFinal)}
                </span>
              </div>

              <Button
                onClick={handleFinalizarCompra}
                variant="primary"
                size="lg"
                fullWidth
                loading={processing}
                disabled={processing}
                icon={Lock}
                className="mt-6"
              >
                Finalizar e Pagar
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                <ShieldCheck size={14} className="text-primary" />
                Pagamento seguro via Mercado Pago
              </div>
            </div>

            <Link
              to="/carrinho"
              className="flex items-center justify-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Voltar para o Carrinho
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
