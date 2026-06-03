import { useState, useEffect, useCallback } from 'react'
import { PackageCheck, AlertCircle, RefreshCw, Filter } from 'lucide-react'
import { encomendaService } from '../services/encomendaService'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'

const STATUS_CONFIG = {
  AGUARDANDO_ARTESAO:  { label: 'Aguardando Artesão',   color: 'bg-info/10 text-info' },
  AGUARDANDO_COMPRADOR:{ label: 'Aguardando Comprador',  color: 'bg-info/10 text-info' },
  PRECO_ACORDADO:      { label: 'Preço Acordado',        color: 'bg-primary/10 text-primary' },
  EM_PRODUCAO:         { label: 'Em Produção',           color: 'bg-warning/10 text-warning' },
  ENVIADO:             { label: 'Enviado',               color: 'bg-primary-light/10 text-primary-light' },
  ENTREGUE:            { label: 'Entregue',              color: 'bg-success/10 text-success' },
  CANCELADO_ESTORNO_TOTAL: { label: 'Cancelado (Estorno)', color: 'bg-danger/10 text-danger' },
  CANCELADO_COM_TAXA:  { label: 'Cancelado (Taxa)',      color: 'bg-danger/10 text-danger' },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG)

const formatBRL = (value) =>
  value != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    : '—'

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

export default function EncomendasPage() {
  const [allData, setAllData] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modal, setModal] = useState({ open: false, encomenda: null })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await encomendaService.listarEncomendas(p, 20)
      setAllData(res.content)
      setTotalPages(res.totalPages)
      setPage(res.number)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar encomendas.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredData = statusFilter
    ? allData.filter(e => e.status === statusFilter)
    : allData

  const openModal = (encomenda) => setModal({ open: true, encomenda })
  const closeModal = () => { if (!actionLoading) setModal({ open: false, encomenda: null }) }

  const handleConfirm = async () => {
    if (!modal.encomenda) return
    setActionLoading(true)
    try {
      await encomendaService.confirmarEntrega(modal.encomenda.id)
      closeModal()
      await fetchData(page)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao confirmar entrega.')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (row) => <span className="text-text-dim font-mono text-xs">#{row.id}</span>,
    },
    {
      key: 'nomeComprador',
      label: 'Comprador',
    },
    {
      key: 'nomeArtesao',
      label: 'Artesão',
    },
    {
      key: 'observacoesCliente',
      label: 'Observações',
      render: (row) => (
        <span className="text-text-muted text-xs line-clamp-2 max-w-[200px] inline-block">
          {row.observacoesCliente || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status] ?? { label: row.status, color: 'bg-surface-lighter text-text-dim' }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'precoProposto',
      label: 'Valor',
      className: 'text-right',
      render: (row) => <span className="font-medium text-text">{formatBRL(row.precoProposto)}</span>,
    },
    {
      key: 'criadoEm',
      label: 'Criado Em',
      render: (row) => <span className="text-text-muted">{formatDate(row.criadoEm)}</span>,
    },
    {
      key: 'acoes',
      label: 'Ações',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end">
          {row.status === 'ENVIADO' && (
            <button
              onClick={() => openModal(row)}
              className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5" />
                Confirmar Entrega
              </span>
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Encomendas</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar encomendas personalizadas e liberação de pagamentos</p>
        </div>
        <button
          onClick={() => fetchData(page)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-text-dim" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos os status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchData(p)}
        loading={loading}
        emptyMessage="Nenhuma encomenda encontrada."
      />

      <ConfirmModal
        open={modal.open}
        title="Confirmar Entrega"
        message={`Confirmar a entrega da encomenda #${modal.encomenda?.id}? Esta ação libera o pagamento retido (${formatBRL(modal.encomenda?.precoProposto)}) para o artesão "${modal.encomenda?.nomeArtesao}".`}
        variant="warning"
        confirmLabel="Confirmar Entrega"
        onConfirm={handleConfirm}
        onCancel={closeModal}
        loading={actionLoading}
      />
    </div>
  )
}
