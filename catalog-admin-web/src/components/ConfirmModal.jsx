import { useEffect, useRef } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

const VARIANT_STYLES = {
  danger: {
    icon: 'bg-danger/10 text-danger',
    button: 'bg-danger hover:bg-danger/80 text-white',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    button: 'bg-warning hover:bg-warning/80 text-black',
  },
}

export default function ConfirmModal({
  open,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const cancelRef = useRef(null)
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.danger

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-surface-light p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 rounded-lg p-1 text-text-dim hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.icon} mb-4`}>
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
          <p className="text-sm text-text-muted leading-relaxed mb-6">{message}</p>

          <div className="flex w-full gap-3">
            <button
              ref={cancelRef}
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-lighter hover:text-text transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-70 ${styles.button}`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
