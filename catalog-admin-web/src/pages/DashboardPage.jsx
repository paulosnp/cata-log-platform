import { useState, useEffect, useCallback } from 'react'
import {
  Palette,
  Users,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  Trophy,
  Calendar,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Percent,
  ReceiptText,
} from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import KpiCard from '../components/KpiCard'

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)

const formatNumber = (value) =>
  new Intl.NumberFormat('pt-BR').format(value ?? 0)

const toLocalDateTimeISO = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 19)
}

const getDefaultRange = () => {
  const fim = new Date()
  const inicio = new Date()
  inicio.setMonth(inicio.getMonth() - 1)
  return {
    inicio: inicio.toISOString().slice(0, 10),
    fim: fim.toISOString().slice(0, 10),
  }
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null)
  const [faturamento, setFaturamento] = useState(null)
  const [topArtesaos, setTopArtesaos] = useState([])
  const [dateRange, setDateRange] = useState(getDefaultRange)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dashData, fatData, topData] = await Promise.all([
        dashboardService.obterDashboard(),
        dashboardService.obterFaturamento(
          toLocalDateTimeISO(dateRange.inicio),
          toLocalDateTimeISO(dateRange.fim)
        ),
        dashboardService.obterTopArtesaos(5),
      ])
      setKpis(dashData)
      setFaturamento(fatData)
      setTopArtesaos(topData)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar dados do dashboard.')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  if (loading && !kpis) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Visão geral da plataforma</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50 w-full sm:w-auto"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Palette}
          label="Artesãos"
          value={formatNumber(kpis?.totalArtesaos)}
          subtitle="Cadastrados na plataforma"
          color="primary"
        />
        <KpiCard
          icon={Users}
          label="Compradores"
          value={formatNumber(kpis?.totalCompradores)}
          subtitle="Contas ativas"
          color="info"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Produtos"
          value={formatNumber(kpis?.totalProdutos)}
          subtitle="No catálogo"
          color="success"
        />
        <KpiCard
          icon={ClipboardList}
          label="Pedidos"
          value={formatNumber(kpis?.totalPedidos)}
          subtitle="Total realizado"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-light p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h2 className="text-lg font-semibold text-text">Faturamento</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="h-4 w-4 text-text-dim" />
              <input
                type="date"
                value={dateRange.inicio}
                onChange={(e) => handleDateChange('inicio', e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary"
              />
              <span className="text-text-dim text-xs">até</span>
              <input
                type="date"
                value={dateRange.fim}
                onChange={(e) => handleDateChange('fim', e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-surface p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-text-muted">Total Bruto</span>
              </div>
              <p className="text-xl font-bold text-text">{formatBRL(faturamento?.totalFaturamento)}</p>
            </div>
            <div className="rounded-lg bg-surface p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-warning" />
                <span className="text-xs font-medium text-text-muted">Taxa Plataforma</span>
              </div>
              <p className="text-xl font-bold text-text">{formatBRL(faturamento?.taxaPlataforma)}</p>
            </div>
            <div className="rounded-lg bg-surface p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ReceiptText className="h-4 w-4 text-info" />
                <span className="text-xs font-medium text-text-muted">Pedidos</span>
              </div>
              <p className="text-xl font-bold text-text">{formatNumber(faturamento?.totalPedidos)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-light p-5">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-text">Top Artesãos</h2>
          </div>

          {topArtesaos.length === 0 ? (
            <p className="text-sm text-text-dim py-8 text-center">Sem dados no período selecionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-text-muted">#</th>
                    <th className="pb-3 text-left font-medium text-text-muted">Artesão</th>
                    <th className="pb-3 text-right font-medium text-text-muted">Vendido</th>
                    <th className="pb-3 text-right font-medium text-text-muted">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {topArtesaos.map((artesao, idx) => (
                    <tr key={artesao.artesaoId} className="border-b border-border/50 last:border-0">
                      <td className="py-3">
                        <span className={`
                          inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                          ${idx === 0 ? 'bg-warning/20 text-warning' : ''}
                          ${idx === 1 ? 'bg-text-muted/20 text-text-muted' : ''}
                          ${idx === 2 ? 'bg-warning/10 text-warning/70' : ''}
                          ${idx > 2 ? 'bg-surface-lighter text-text-dim' : ''}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-text">{artesao.nomeArtesao}</td>
                      <td className="py-3 text-right text-success font-medium">{formatBRL(artesao.totalVendido)}</td>
                      <td className="py-3 text-right text-text-muted">{formatNumber(artesao.quantidadePedidos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
