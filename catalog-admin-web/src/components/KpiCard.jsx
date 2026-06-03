export default function KpiCard({ icon: Icon, label, value, subtitle, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
    danger: 'bg-danger/10 text-danger',
  }

  const iconBg = colorMap[color] ?? colorMap.primary

  return (
    <div className="rounded-xl border border-border bg-surface-light p-5 shadow-ambient transition-all hover:shadow-hover hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-muted truncate">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text font-headline">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-dim">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
