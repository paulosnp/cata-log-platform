import { useState, useEffect, useCallback } from 'react'
import { ScrollText, RefreshCw, AlertCircle, Filter } from 'lucide-react'
import { logService } from '../services/logService'
import DataTable from '../components/DataTable'

const ACOES = [
  { value: '', label: 'Todas as ações' },
  { value: 'VERIFICAR_ARTESAO', label: 'Verificar Artesão' },
  { value: 'REMOVER_VERIFICACAO', label: 'Remover Verificação' },
  { value: 'BLOQUEAR_COMPRADOR', label: 'Bloquear Comprador' },
  { value: 'DESBLOQUEAR_COMPRADOR', label: 'Desbloquear Comprador' },
  { value: 'ALTERAR_PERMISSOES', label: 'Alterar Permissões' },
]

const ACAO_COLORS = {
  VERIFICAR_ARTESAO: 'bg-success/10 text-success',
  REMOVER_VERIFICACAO: 'bg-warning/10 text-warning',
  BLOQUEAR_COMPRADOR: 'bg-danger/10 text-danger',
  DESBLOQUEAR_COMPRADOR: 'bg-info/10 text-info',
  ALTERAR_PERMISSOES: 'bg-primary/10 text-primary',
}

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

const formatAcao = (acao) =>
  acao
    ?.replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()) ?? '—'

export default function LogsPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filtroAcao, setFiltroAcao] = useState('')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  const fetchData = useCallback(
    async (p = page) => {
      setLoading(true)
      setError('')
      try {
        const filtros = {}
        if (filtroAcao) filtros.acao = filtroAcao
        if (filtroInicio) filtros.inicio = `${filtroInicio}T00:00:00`
        if (filtroFim) filtros.fim = `${filtroFim}T23:59:59`

        const res = await logService.listarLogs(p, 20, filtros)
        setData(res.content)
        setTotalPages(res.totalPages)
        setPage(res.number)
      } catch (err) {
        setError(err.response?.data?.mensagem ?? 'Erro ao carregar logs de auditoria.')
      } finally {
        setLoading(false)
      }
    },
    [page, filtroAcao, filtroInicio, filtroFim]
  )

  useEffect(() => {
    fetchData(0)
  }, [filtroAcao, filtroInicio, filtroFim])

  const columns = [
    {
      key: 'dataHora',
      label: 'Data/Hora',
      render: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {formatDateTime(row.dataHora)}
        </span>
      ),
    },
    {
      key: 'adminEmail',
      label: 'Admin',
      render: (row) => (
        <span className="text-text truncate max-w-[200px] inline-block" title={row.adminEmail}>
          {row.adminEmail}
        </span>
      ),
    },
    {
      key: 'acao',
      label: 'Ação',
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            ACAO_COLORS[row.acao] ?? 'bg-surface-lighter text-text-dim'
          }`}
        >
          {formatAcao(row.acao)}
        </span>
      ),
    },
    {
      key: 'entidadeAfetada',
      label: 'Entidade',
      render: (row) =>
        row.entidadeAfetada ? (
          <span className="text-text-muted text-xs">
            {row.entidadeAfetada} #{row.entidadeId}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'detalhes',
      label: 'Detalhes',
      render: (row) => (
        <span
          className="text-text-muted text-xs max-w-[300px] inline-block truncate"
          title={row.detalhes}
        >
          {row.detalhes ?? '—'}
        </span>
      ),
    },
  ]

  const handleClearFilters = () => {
    setFiltroAcao('')
    setFiltroInicio('')
    setFiltroFim('')
  }

  const hasFilters = filtroAcao || filtroInicio || filtroFim

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">Logs de Auditoria</h1>
            <p className="text-sm text-text-muted mt-0.5">Histórico imutável de ações administrativas</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(page)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end rounded-xl border border-border bg-surface-light p-4">
        <div className="flex items-center gap-2 text-text-dim mb-1 sm:mb-0">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
        </div>

        <div className="flex-1 min-w-0">
          <label className="mb-1 block text-xs text-text-dim">Ação</label>
          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            {ACOES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-text-dim">De</label>
          <input
            type="date"
            value={filtroInicio}
            onChange={(e) => setFiltroInicio(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-text-dim">Até</label>
          <input
            type="date"
            value={filtroFim}
            onChange={(e) => setFiltroFim(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="rounded-md border border-border px-3 py-2 text-xs text-text-dim hover:bg-surface-lighter hover:text-text transition-colors whitespace-nowrap"
          >
            Limpar
          </button>
        )}
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
        emptyMessage="Nenhum log de auditoria registrado."
      />
    </div>
  )
}
