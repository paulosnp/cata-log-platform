import { useSearchParams, Link } from 'react-router-dom';
import { Clock, Package, ShoppingBag } from 'lucide-react';
import Button from '../../components/common/Button';

export default function PaymentPendingPage() {
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get('external_reference');

  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Clock size={44} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold font-headline md:text-3xl">Pagamento em análise</h1>
        {externalReference && (
          <p className="mt-3 text-on-surface-variant">
            Seu pedido <span className="font-bold text-on-surface">#{externalReference}</span> foi registrado.
          </p>
        )}
        <p className="mt-2 text-sm text-on-surface-variant">
          Seu pagamento está sendo processado. Isso pode levar até 2 dias úteis.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/pedidos">
            <Button variant="primary" size="lg" fullWidth icon={Package}>Ver Meus Pedidos</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="lg" fullWidth icon={ShoppingBag}>Voltar para a Loja</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
