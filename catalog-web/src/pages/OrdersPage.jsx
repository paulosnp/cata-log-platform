import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  RefreshCw,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import Spinner from '../components/common/Spinner';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const STATUS_PAGAMENTO = {
  PENDENTE:     { label: 'Pendente',     color: 'text-amber-600 bg-amber-100',  icon: Clock },
  APROVADO:     { label: 'Aprovado',     color: 'text-green-600 bg-green-100',  icon: CheckCircle },
  RECUSADO:     { label: 'Recusado',     color: 'text-red-600 bg-red-100',      icon: XCircle },
  CANCELADO:    { label: 'Cancelado',    color: 'text-gray-500 bg-gray-100',    icon: Ban },
  REEMBOLSADO:  { label: 'Reembolsado',  color: 'text-blue-600 bg-blue-100',   icon: RefreshCw },
};

const STATUS_ENTREGA = {
  AGUARDANDO_ENVIO:       'Aguardando Envio',
  AGUARDANDO_PAGAMENTO:   'Aguardando Pagamento',
  EM_PREPARACAO:          'Em Preparação',
  ENVIADO:                'Enviado',
  EM_TRANSITO:            'Em Trânsito',
  ENTREGUE:               'Entregue',
  DEVOLVIDO:              'Devolvido',
};

function StatusBadge({ status }) {
  const config = STATUS_PAGAMENTO[status] || STATUS_PAGAMENTO.PENDENTE;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getMeusPedidos();
      setPedidos(res.data);
    } catch (err) {
      setError('Erro ao carregar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="mb-4 text-tertiary" />
        <p className="text-sm text-on-surface-variant">{error}</p>
        <button
          onClick={loadPedidos}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-surface-container-low p-5">
          <Package size={40} className="text-outline/40" />
        </div>
        <h1 className="text-xl font-bold font-headline">Nenhum pedido ainda</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Quando você fizer sua primeira compra, seus pedidos aparecerão aqui.
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Package size={24} className="text-primary" />
        <h1 className="text-2xl font-bold font-headline md:text-3xl">Meus Pedidos</h1>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-on-primary">
          {pedidos.length}
        </span>
      </div>

      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest overflow-hidden"
          >
            {/* Header do pedido */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 bg-surface-container-low/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-headline text-on-surface">
                  Pedido #{pedido.id}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {formatDate(pedido.criadoEm)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={pedido.statusPagamento} />
                {pedido.statusEntrega && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                    <Truck size={12} />
                    {STATUS_ENTREGA[pedido.statusEntrega] || pedido.statusEntrega}
                  </span>
                )}
              </div>
            </div>

            {/* Itens */}
            <div className="divide-y divide-outline-variant/10 px-6">
              {pedido.itens?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/produto/${item.produtoId}`}
                      className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
                    >
                      {item.produtoNome}
                    </Link>
                    <p className="text-xs text-on-surface-variant">
                      {formatPrice(item.precoUnitario)} × {item.quantidade}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-sm font-semibold text-on-surface">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer com total */}
            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20 px-6 py-4">
              <span className="text-sm text-on-surface-variant">Total do pedido</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(pedido.valorTotal)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
