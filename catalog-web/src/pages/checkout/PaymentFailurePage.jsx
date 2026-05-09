import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import Button from '../../components/common/Button';

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle size={44} className="text-tertiary" />
        </div>

        <h1 className="text-2xl font-bold font-headline md:text-3xl">
          Pagamento não aprovado
        </h1>

        <p className="mt-3 text-on-surface-variant">
          Houve um problema com seu pagamento. Não se preocupe, nenhuma cobrança foi
          realizada.
        </p>

        <p className="mt-2 text-sm text-on-surface-variant">
          Você pode tentar novamente com outro método de pagamento ou entrar em
          contato conosco.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/carrinho">
            <Button variant="primary" size="lg" fullWidth icon={RefreshCw}>
              Tentar Novamente
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
