import { Link } from 'react-router-dom';
import { BadgeCheck, Calendar, DollarSign, Clock, MessageCircle } from 'lucide-react';
import EncomendaStatusBadge from './EncomendaStatusBadge';
import EncomendaTimeline from './EncomendaTimeline';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function EncomendaCard({ encomenda, onAceitar, aceitando }) {
  const {
    id,
    status,
    observacoesCliente,
    precoProposto,
    tempoProducaoDias,
    nomeArtesao,
    nomeProdutoReferencia,
    criadoEm,
  } = encomenda;

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-ambient">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold font-headline">
            Encomenda #{id}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <BadgeCheck size={14} className="shrink-0 text-primary" />
            <span>{nomeArtesao}</span>
          </div>
          {nomeProdutoReferencia && (
            <p className="mt-0.5 text-xs text-on-surface-variant/70">
              Ref: {nomeProdutoReferencia}
            </p>
          )}
        </div>
        <EncomendaStatusBadge status={status} />
      </div>

      {/* Observações */}
      <p className="mb-4 rounded-lg bg-surface-container-low px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
        "{observacoesCliente}"
      </p>

      {/* Contraproposta — Destaque de Preço e Prazo */}
      {status === 'AGUARDANDO_COMPRADOR' && precoProposto && (
        <div className="mb-4 flex gap-3">
          <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 px-4 py-3">
            <DollarSign size={18} className="shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-dim">
                Preço Proposto
              </p>
              <p className="text-lg font-bold text-primary">
                {formatPrice(precoProposto)}
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 px-4 py-3">
            <Clock size={18} className="shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-dim">
                Prazo
              </p>
              <p className="text-lg font-bold text-primary">
                {tempoProducaoDias} dias
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-4">
        <EncomendaTimeline status={status} />
      </div>

      {/* Ações */}
      {status === 'AGUARDANDO_COMPRADOR' && (
        <button
          onClick={() => onAceitar(id)}
          disabled={aceitando}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient disabled:opacity-50"
        >
          {aceitando ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
          ) : (
            'Aceitar Orçamento'
          )}
        </button>
      )}

      {status === 'PRECO_ACORDADO' && (
        <div className="mt-auto space-y-2.5">
          <div className="rounded-lg bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700">
            Sua peça está sendo produzida pelo artesão
          </div>
          <Link
            to={`/encomendas/${id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-on-primary"
          >
            <MessageCircle size={16} />
            Abrir Chat
          </Link>
        </div>
      )}

      {status === 'CONCLUIDA' && (
        <Link
          to={`/encomendas/${id}`}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/20 px-6 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:border-primary hover:text-primary"
        >
          <MessageCircle size={16} />
          Ver Detalhes
        </Link>
      )}

      {/* Footer — Data */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-on-surface-variant/60">
        <Calendar size={12} />
        Criado em {formatDate(criadoEm)}
      </div>
    </div>
  );
}
