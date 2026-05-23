import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Layers, DollarSign, Clock, Calendar } from 'lucide-react';
import { encomendaService } from '../services/encomendaService';
import { useToast } from '../components/common/Toast';
import EncomendaStatusBadge from '../components/encomenda/EncomendaStatusBadge';
import EncomendaTimeline from '../components/encomenda/EncomendaTimeline';
import ChatPanel from '../components/chat/ChatPanel';
import Spinner from '../components/common/Spinner';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function EncomendaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [encomenda, setEncomenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aceitando, setAceitando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await encomendaService.getById(id);
      setEncomenda(res.data);
    } catch (err) {
      console.error('Erro ao carregar encomenda:', err);
      addToast('Encomenda não encontrada.', 'error');
      navigate('/encomendas');
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleAceitar = async () => {
    setAceitando(true);
    try {
      await encomendaService.aceitar(id);
      addToast('Orçamento aceito! O artesão começará a produção.', 'success');
      carregar();
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        'Erro ao aceitar encomenda.';
      addToast(msg, 'error');
    } finally {
      setAceitando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!encomenda) return null;

  const {
    status,
    observacoesCliente,
    precoProposto,
    tempoProducaoDias,
    nomeArtesao,
    nomeProdutoReferencia,
    streamChannelId,
    criadoEm,
    atualizadoEm,
  } = encomenda;

  const chatStatuses = ['PRECO_ACORDADO', 'EM_PRODUCAO', 'ENVIADO', 'ENTREGUE', 'CONCLUIDA'];
  const showChat = chatStatuses.includes(status);

  return (
    <div className="min-h-[70vh] bg-surface py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Voltar */}
        <button
          onClick={() => navigate('/encomendas')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Voltar às Encomendas
        </button>

        {/* Split Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ── Coluna Esquerda: Detalhes (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold font-headline">
                  Encomenda #{id}
                </h1>
                <EncomendaStatusBadge status={status} />
              </div>

              {/* Artesão */}
              <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-surface-container-low px-4 py-3">
                <BadgeCheck size={16} className="shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">
                    Artesão
                  </p>
                  <p className="text-sm font-semibold">{nomeArtesao}</p>
                </div>
              </div>

              {/* Produto Referência */}
              {nomeProdutoReferencia && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-surface-container-low px-4 py-3">
                  <Layers size={16} className="shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">
                      Produto Referência
                    </p>
                    <p className="text-sm font-semibold">{nomeProdutoReferencia}</p>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
                  Descrição do pedido
                </h3>
                <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
                  "{observacoesCliente}"
                </p>
              </div>

              {/* Contraproposta — Preço e Prazo */}
              {precoProposto && (
                <div className="mb-6 flex gap-3">
                  <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 px-4 py-3">
                    <DollarSign size={18} className="shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-dim">
                        Preço
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(precoProposto)}
                      </p>
                    </div>
                  </div>
                  {tempoProducaoDias && (
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
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="mb-6">
                <EncomendaTimeline status={status} />
              </div>

              {/* Ação: Aceitar */}
              {status === 'AGUARDANDO_COMPRADOR' && (
                <button
                  onClick={handleAceitar}
                  disabled={aceitando}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient disabled:opacity-50"
                >
                  {aceitando ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  ) : (
                    'Aceitar Orçamento'
                  )}
                </button>
              )}

              {/* Datas */}
              <div className="mt-6 flex flex-col gap-1 text-xs text-on-surface-variant/50">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  Criado em {formatDate(criadoEm)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  Atualizado em {formatDate(atualizadoEm)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Coluna Direita: Chat (3/5) ── */}
          <div className="lg:col-span-3">
            <div className="sticky top-24" style={{ height: 'calc(100vh - 12rem)' }}>
              {showChat ? (
                <ChatPanel
                  channelId={streamChannelId}
                  compradorId={encomenda.compradorId}
                  artesaoId={encomenda.artesaoId}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 text-center">
                  <div>
                    <p className="text-sm font-semibold text-on-surface-variant">
                      Chat será liberado após o orçamento ser aceito
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant/60">
                      Quando ambas as partes concordarem com o preço e prazo, o
                      chat será ativado automaticamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
