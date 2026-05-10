import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Hammer, BadgeCheck, Layers } from 'lucide-react';
import { encomendaService } from '../../services/encomendaService';
import { useToast } from '../common/Toast';

export default function NovaEncomendaModal({
  isOpen,
  onClose,
  artesaoId,
  artesaoNome,
  produtoReferenciaId,
  produtoNome,
}) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [observacoes, setObservacoes] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!observacoes.trim()) {
      addToast('Descreva a peça que deseja encomendar.', 'error');
      return;
    }

    setEnviando(true);
    try {
      await encomendaService.criar({
        artesaoId,
        produtoReferenciaId: produtoReferenciaId || null,
        observacoesCliente: observacoes.trim(),
      });
      addToast('Encomenda enviada com sucesso! O artesão será notificado.', 'success');
      onClose();
      navigate('/encomendas');
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        'Erro ao criar encomenda. Tente novamente.';
      addToast(msg, 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-fixed">
              <Hammer size={18} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold font-headline">
              Encomendar Peça Sob Medida
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Info Cards */}
          <div className="mb-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 rounded-lg bg-surface-container-low px-4 py-3">
              <BadgeCheck size={16} className="shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">
                  Artesão
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {artesaoNome}
                </p>
              </div>
            </div>
            {produtoNome && (
              <div className="flex items-center gap-2.5 rounded-lg bg-surface-container-low px-4 py-3">
                <Layers size={16} className="shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">
                    Produto Referência
                  </p>
                  <p className="text-sm font-semibold text-on-surface">
                    {produtoNome}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-on-surface">
              Descreva a peça que você deseja
            </span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Gostaria de um vaso semelhante ao da foto, mas em azul marinho, com 30cm de altura..."
              rows={5}
              className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-outline transition-all focus:border-primary focus:shadow-ambient focus:outline-none"
              maxLength={1000}
            />
            <span className="mt-1 block text-right text-xs text-on-surface-variant/50">
              {observacoes.length}/1000
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={enviando || !observacoes.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Hammer size={16} />
                Enviar Solicitação
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
