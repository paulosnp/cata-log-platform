import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'

export default function CategoryFormModal({ open, categoria, onSave, onCancel, loading = false }) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const isEdit = !!categoria

  useEffect(() => {
    if (open) {
      setNome(categoria?.nome ?? '')
      setDescricao(categoria?.descricao ?? '')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, categoria])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = nome.trim()
    if (!trimmed) { setError('Nome da categoria é obrigatório.'); return }
    setError('')
    onSave({ id: categoria?.id, nome: trimmed, descricao: descricao.trim() })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-surface-light p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text">
            {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-text-dim hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-nome" className="block text-xs font-medium text-text-muted mb-1.5">
              Nome *
            </label>
            <input
              ref={inputRef}
              id="cat-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Crochê, Madeira, Cerâmica..."
              disabled={loading}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder-text-dim outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="cat-descricao" className="block text-xs font-medium text-text-muted mb-1.5">
              Descrição
            </label>
            <textarea
              id="cat-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional da categoria..."
              disabled={loading}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder-text-dim outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-xs text-danger">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
