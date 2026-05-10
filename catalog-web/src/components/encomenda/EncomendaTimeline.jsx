import { Check } from 'lucide-react';

const STEPS = [
  { key: 'solicitada', label: 'Solicitada' },
  { key: 'orcamento', label: 'Orçamento' },
  { key: 'producao', label: 'Em Produção' },
  { key: 'concluida', label: 'Concluída' },
];

const STATUS_PROGRESS = {
  AGUARDANDO_ARTESAO: 1,
  AGUARDANDO_COMPRADOR: 2,
  PRECO_ACORDADO: 3,
  CONCLUIDA: 4,
  CANCELADO_ESTORNO_TOTAL: 0,
  CANCELADO_COM_TAXA: 0,
};

export default function EncomendaTimeline({ status }) {
  if (status === 'CANCELADO_ESTORNO_TOTAL' || status === 'CANCELADO_COM_TAXA') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-red-700">
          ✕
        </span>
        Encomenda cancelada
      </div>
    );
  }

  const progress = STATUS_PROGRESS[status] || 1;

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= progress;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center gap-1">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant/40'
                }`}
              >
                {isActive ? <Check size={14} /> : stepNumber}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium ${
                  isActive ? 'text-on-surface' : 'text-on-surface-variant/40'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`h-0.5 w-6 rounded-full sm:w-10 ${
                  stepNumber < progress
                    ? 'bg-primary'
                    : 'bg-surface-container-low'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
