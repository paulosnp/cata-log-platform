import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function DataTable({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-light overflow-hidden shadow-ambient">
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-light/70 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-dim ${col.className ?? ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-text-dim">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={row.id ?? rowIdx}
                    className="border-b border-border/40 last:border-0 transition-colors hover:bg-surface-lighter/50"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-text ${col.className ?? ''}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-border/40">
          {data.length === 0 && !loading ? (
            <div className="px-4 py-12 text-center text-sm text-text-dim">
              {emptyMessage}
            </div>
          ) : (
            data.map((row, rowIdx) => (
              <div key={row.id ?? rowIdx} className="p-4 space-y-2.5">
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim sm:text-xs">
                      {col.label || 'Ações'}
                    </span>
                    <div className={`text-sm text-text sm:text-right ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-text-dim">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-lighter hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-lighter hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
