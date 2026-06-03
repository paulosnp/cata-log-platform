import { useState, useEffect, useCallback } from 'react'
import { BadgeCheck, BadgeX, AlertCircle, RefreshCw } from 'lucide-react'
import { artesaoService } from '../services/artesaoService'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

export default function ArtesaosPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, artesao: null, action: null })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await artesaoService.listarArtesaos(p, 20)
      setData(res.content)
      setTotalPages(res.totalPages)
      setPage(res.number)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar artesãos.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const openModal = (artesao, action) => setModal({ open: true, artesao, action })
  const closeModal = () => { if (!actionLoading) setModal({ open: false, artesao: null, action: null }) }

  const handleConfirm = async () => {
    if (!modal.artesao || !modal.action) return
    setActionLoading(true)
    try {
      const fn = modal.action === 'verificar'
        ? artesaoService.verificarArtesao
        : artesaoService.removerVerificacao
      await fn(modal.artesao.id)
      closeModal()
      await fetchData(page)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao executar ação.')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'nomeAtelie', label: 'Ateliê' },
    { key: 'email', label: 'Email' },
    {
      key: 'local',
      label: 'Local',
      render: (row) => row.cidade && row.estado ? `${row.cidade}/${row.estado}` : row.estado ?? '—',
    },
    {
      key: 'seloVerificado',
      label: 'Verificado',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            row.seloVerificado
              ? 'bg-success/10 text-success'
              : 'bg-surface-lighter text-text-dim'
          }`}
        >
          {row.seloVerificado ? <BadgeCheck className="h-3.5 w-3.5" /> : <BadgeX className="h-3.5 w-3.5" />}
          {row.seloVerificado ? 'Verificado' : 'Pendente'}
        </span>
      ),
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
        <div className="flex items-center justify-end gap-2">
          {row.seloVerificado ? (
            <button
              onClick={() => openModal(row, 'remover')}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/10 transition-colors"
            >
              Remover Selo
            </button>
          ) : (
            <button
              onClick={() => openModal(row, 'verificar')}
              className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors"
            >
              Verificar ✓
            </button>
          )}
        </div>
      ),
    },
  ]

  const modalConfig = modal.action === 'verificar'
    ? {
        title: 'Verificar Artesão',
        message: `Confirma a verificação do ateliê "${modal.artesao?.nomeAtelie}"? O selo de verificação será exibido publicamente.`,
        variant: 'warning',
        confirmLabel: 'Verificar',
      }
    : {
        title: 'Remover Verificação',
        message: `Remover o selo de verificação do ateliê "${modal.artesao?.nomeAtelie}"? O selo deixará de ser exibido.`,
        variant: 'danger',
        confirmLabel: 'Remover',
      }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Artesãos</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar selos de verificação</p>
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

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchData(p)}
        loading={loading}
        emptyMessage="Nenhum artesão cadastrado."
      />

      <ConfirmModal
        open={modal.open}
        onCancel={closeModal}
        onConfirm={handleConfirm}
        loading={actionLoading}
        {...modalConfig}
      />
    </div>
  )
}
