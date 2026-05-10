import { Clock, MessageSquare, CheckCircle, XCircle, Trophy } from 'lucide-react';

const STATUS_MAP = {
  AGUARDANDO_ARTESAO: {
    label: 'Aguardando Artesão',
    icon: Clock,
    className: 'text-amber-700 bg-amber-100',
  },
  AGUARDANDO_COMPRADOR: {
    label: 'Orçamento Recebido',
    icon: MessageSquare,
    className: 'text-blue-700 bg-blue-100',
  },
  PRECO_ACORDADO: {
    label: 'Em Produção',
    icon: CheckCircle,
    className: 'text-green-700 bg-green-100',
  },
  CANCELADO_ESTORNO_TOTAL: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'text-red-700 bg-red-100',
  },
  CANCELADO_COM_TAXA: {
    label: 'Cancelada (c/ taxa)',
    icon: XCircle,
    className: 'text-red-700 bg-red-100',
  },
  CONCLUIDA: {
    label: 'Concluída',
    icon: Trophy,
    className: 'text-primary bg-primary-fixed',
  },
};

export default function EncomendaStatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.AGUARDANDO_ARTESAO;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}
