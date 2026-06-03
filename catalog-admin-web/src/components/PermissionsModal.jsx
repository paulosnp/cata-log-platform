import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

const ALL_PERMISSIONS = [
  { key: 'VER_DASHBOARD',          label: 'Ver Dashboard' },
  { key: 'GERENCIAR_ARTESAOS',     label: 'Gerenciar Artesãos' },
  { key: 'GERENCIAR_COMPRADORES',  label: 'Gerenciar Compradores' },
  { key: 'VER_RELATORIOS',         label: 'Ver Relatórios' },
  { key: 'GERENCIAR_ADMINS',       label: 'Gerenciar Admins' },
]

export default function PermissionsModal({ open, admin, onSave, onCancel, loading = false }) {
  const [selected, setSelected] = useState(new Set())

  useEffect(() => {
    if (open && admin) {
      setSelected(new Set(admin.permissoes ?? []))
    }
  }, [open, admin])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleSubmit = () => {
    onSave(admin.id, [...selected])
  }

  if (!open || !admin) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface-light p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-text">Editar Permissões</h3>
            <p className="text-xs text-text-muted mt-0.5">{admin.email}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-text-dim hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {ALL_PERMISSIONS.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                selected.has(key)
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:border-border-light hover:bg-surface-lighter/30'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(key)}
                disabled={loading}
                className="h-4 w-4 rounded border-border text-primary accent-primary"
              />
              <span className="text-sm font-medium text-text">{label}</span>
              <span className="ml-auto text-[10px] font-mono text-text-dim">{key}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
