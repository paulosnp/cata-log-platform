import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Power, AlertCircle, RefreshCw } from 'lucide-react'
import { categoriaService } from '../services/categoriaService'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'
import CategoryFormModal from '../components/CategoryFormModal'

export default function CategoriasPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formModal, setFormModal] = useState({ open: false, categoria: null })
  const [formLoading, setFormLoading] = useState(false)

  const [confirmModal, setConfirmModal] = useState({ open: false, categoria: null })
  const [confirmLoading, setConfirmLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await categoriaService.listarTodas()
      setData(res)
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async ({ id, nome, descricao }) => {
    setFormLoading(true)
    try {
      if (id) {
        await categoriaService.atualizar(id, nome, descricao)
      } else {
        await categoriaService.criar(nome, descricao)
      }
      setFormModal({ open: false, categoria: null })
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao salvar categoria.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDesativar = async () => {
    if (!confirmModal.categoria) return
    setConfirmLoading(true)
    try {
      await categoriaService.desativar(confirmModal.categoria.id)
      setConfirmModal({ open: false, categoria: null })
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.mensagem ?? 'Erro ao desativar categoria.')
    } finally {
      setConfirmLoading(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (row) => <span className="text-text-dim font-mono text-xs">#{row.id}</span>,
    },
    { key: 'nome', label: 'Nome' },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (row) => (
        <span className="text-text-muted text-xs">{row.descricao || '—'}</span>
      ),
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            row.ativo
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          {row.ativo ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setFormModal({ open: true, categoria: row })}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-info hover:bg-info/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </span>
          </button>
          {row.ativo && (
            <button
              onClick={() => setConfirmModal({ open: true, categoria: row })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Power className="h-3.5 w-3.5" />
                Desativar
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
          <h1 className="text-2xl font-bold text-text">Categorias</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar categorias de produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setFormModal({ open: true, categoria: null })}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Categoria
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
        emptyMessage="Nenhuma categoria cadastrada."
      />

      <CategoryFormModal
        open={formModal.open}
        categoria={formModal.categoria}
        onSave={handleSave}
        onCancel={() => !formLoading && setFormModal({ open: false, categoria: null })}
        loading={formLoading}
      />

      <ConfirmModal
        open={confirmModal.open}
        title="Desativar Categoria"
        message={`Confirma a desativação da categoria "${confirmModal.categoria?.nome}"? Produtos vinculados perderão a classificação.`}
        variant="danger"
        confirmLabel="Desativar"
        onConfirm={handleDesativar}
        onCancel={() => !confirmLoading && setConfirmModal({ open: false, categoria: null })}
        loading={confirmLoading}
      />
    </div>
  )
}
