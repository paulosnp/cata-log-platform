import { useState, useEffect, useCallback } from 'react'
import { Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react'
import { compradorService } from '../services/compradorService'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const maskCpf = (cpf) =>
  cpf?.length >= 11 ? `***.***.*${cpf.slice(-4, -2)}-${cpf.slice(-2)}` : cpf ?? '—'

export default function CompradoresPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, comprador: null, action: null })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await compradorService.listarCompradores(p, 20)
      setData(res.content)
      setTotalPages(res.totalPages)
      setPage(res.number)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar compradores.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const openModal = (comprador, action) => setModal({ open: true, comprador, action })
  const closeModal = () => { if (!actionLoading) setModal({ open: false, comprador: null, action: null }) }

  const handleConfirm = async () => {
    if (!modal.comprador || !modal.action) return
    setActionLoading(true)
    try {
      const fn = modal.action === 'bloquear'
        ? compradorService.bloquearComprador
        : compradorService.desbloquearComprador
      await fn(modal.comprador.id)
      closeModal()
      await fetchData(page)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao executar ação.')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    {
      key: 'cpf',
      label: 'CPF',
      render: (row) => <span className="font-mono text-text-muted">{maskCpf(row.cpf)}</span>,
    },
    {
      key: 'local',
      label: 'Local',
      render: (row) => row.cidade && row.estado ? `${row.cidade}/${row.estado}` : row.estado ?? '—',
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            row.ativo
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          {row.ativo ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {row.ativo ? 'Ativo' : 'Bloqueado'}
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
          {row.ativo ? (
            <button
              onClick={() => openModal(row, 'bloquear')}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Bloquear
              </span>
            </button>
          ) : (
            <button
              onClick={() => openModal(row, 'desbloquear')}
              className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Unlock className="h-3.5 w-3.5" />
                Desbloquear
              </span>
            </button>
          )}
        </div>
      ),
    },
  ]

  const modalConfig = modal.action === 'bloquear'
    ? {
        title: 'Bloquear Comprador',
        message: `Confirma o bloqueio de "${modal.comprador?.nome}"? O comprador não poderá realizar novas compras.`,
        variant: 'danger',
        confirmLabel: 'Bloquear',
      }
    : {
        title: 'Desbloquear Comprador',
        message: `Desbloquear "${modal.comprador?.nome}"? O acesso às compras será restaurado.`,
        variant: 'warning',
        confirmLabel: 'Desbloquear',
      }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Compradores</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar bloqueio de contas</p>
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
        emptyMessage="Nenhum comprador cadastrado."
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
