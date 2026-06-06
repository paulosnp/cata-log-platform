import { useState, useEffect, useCallback, useRef } from 'react'
import { UserPlus, KeyRound, AlertCircle, RefreshCw, X, Loader2 } from 'lucide-react'
import { adminService } from '../services/adminService'
import DataTable from '../components/DataTable'
import PermissionsModal from '../components/PermissionsModal'

const PERM_COLORS = {
  VER_DASHBOARD:         'bg-info/10 text-info',
  GERENCIAR_ARTESAOS:    'bg-success/10 text-success',
  GERENCIAR_COMPRADORES: 'bg-warning/10 text-warning',
  VER_RELATORIOS:        'bg-primary/10 text-primary',
  GERENCIAR_ADMINS:      'bg-danger/10 text-danger',
}

const PERM_LABELS = {
  VER_DASHBOARD:         'Dashboard',
  GERENCIAR_ARTESAOS:    'Artesãos',
  GERENCIAR_COMPRADORES: 'Compradores',
  VER_RELATORIOS:        'Relatórios',
  GERENCIAR_ADMINS:      'Admins',
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

export default function AdminsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [permModal, setPermModal] = useState({ open: false, admin: null })
  const [permLoading, setPermLoading] = useState(false)

  const [registerModal, setRegisterModal] = useState(false)
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const emailRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.listarTodos()
      setData(res)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar administradores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePermSave = async (id, permissoes) => {
    setPermLoading(true)
    try {
      await adminService.atualizarPermissoes(id, permissoes)
      setPermModal({ open: false, admin: null })
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao atualizar permissões.')
    } finally {
      setPermLoading(false)
    }
  }

  const openRegister = () => {
    setRegisterEmail('')
    setRegisterError('')
    setRegisterModal(true)
    setTimeout(() => emailRef.current?.focus(), 50)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const trimmed = registerEmail.trim()
    if (!trimmed) { setRegisterError('Email é obrigatório.'); return }
    setRegisterLoading(true)
    setRegisterError('')
    try {
      await adminService.registrar(trimmed)
      setRegisterModal(false)
      await fetchData()
    } catch (err) {
      setRegisterError(err.response?.data?.mensagem ?? err.response?.data?.email ?? 'Erro ao registrar admin.')
    } finally {
      setRegisterLoading(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (row) => <span className="text-text-dim font-mono text-xs">#{row.id}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'senhaTemporaria',
      label: 'Senha',
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            row.senhaTemporaria
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          }`}
        >
          {row.senhaTemporaria ? 'Temporária' : 'Definida'}
        </span>
      ),
    },
    {
      key: 'permissoes',
      label: 'Permissões',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {(row.permissoes ?? []).map((p) => (
            <span
              key={p}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${PERM_COLORS[p] ?? 'bg-surface-lighter text-text-dim'}`}
            >
              {PERM_LABELS[p] ?? p}
            </span>
          ))}
          {(!row.permissoes || row.permissoes.length === 0) && (
            <span className="text-xs text-text-dim">Nenhuma</span>
          )}
        </div>
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
        <div className="flex items-center justify-end">
          <button
            onClick={() => setPermModal({ open: true, admin: row })}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Permissões
            </span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Administradores</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar curadores e permissões</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={openRegister}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Novo Admin
          </button>
        </div>
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
        page={0}
        totalPages={1}
        onPageChange={() => {}}
        loading={loading}
        emptyMessage="Nenhum administrador cadastrado."
      />

      <PermissionsModal
        open={permModal.open}
        admin={permModal.admin}
        onSave={handlePermSave}
        onCancel={() => !permLoading && setPermModal({ open: false, admin: null })}
        loading={permLoading}
      />

      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={registerLoading ? undefined : () => setRegisterModal(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-surface-light p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text">Novo Administrador</h3>
              <button
                onClick={() => setRegisterModal(false)}
                disabled={registerLoading}
                className="rounded-lg p-1 text-text-dim hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-medium text-text-muted mb-1.5">
                  Email *
                </label>
                <input
                  ref={emailRef}
                  id="admin-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="admin@prismcode.site"
                  disabled={registerLoading}
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder-text-dim outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
              </div>

              <p className="text-xs text-text-dim leading-relaxed">
                Uma senha temporária será gerada automaticamente e enviada por e-mail. O novo admin será forçado a trocá-la no primeiro acesso.
              </p>

              {registerError && (
                <p className="text-xs text-danger">{registerError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRegisterModal(false)}
                  disabled={registerLoading}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-70"
                >
                  {registerLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
