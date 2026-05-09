import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import Button from '../../components/common/Button';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Animated icon */}
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={44} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold font-headline md:text-3xl">
          Pagamento Aprovado!
        </h1>

        {externalReference && (
          <p className="mt-3 text-on-surface-variant">
            Seu pedido{' '}
            <span className="font-bold text-on-surface">#{externalReference}</span>{' '}
            está sendo processado.
          </p>
        )}

        <p className="mt-2 text-sm text-on-surface-variant">
          Você receberá atualizações sobre o status da entrega.
        </p>

        {paymentId && (
          <p className="mt-4 rounded-lg bg-surface-container-low px-4 py-2 text-xs text-outline">
            ID do pagamento: {paymentId}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/pedidos">
            <Button variant="primary" size="lg" fullWidth icon={Package}>
              Ver Meus Pedidos
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="lg" fullWidth icon={ShoppingBag}>
              Voltar para a Loja
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
