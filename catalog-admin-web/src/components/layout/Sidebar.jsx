import { NavLink, useLocation } from 'react-router-dom'
import logoSvg from '../../assets/logo.svg'
import {
  LayoutDashboard,
  Palette,
  Users,
  ShoppingBag,
  Package,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', perm: 'VER_DASHBOARD' },
  { to: '/artesaos', icon: Palette, label: 'Artesãos', perm: 'GERENCIAR_ARTESAOS' },
  { to: '/compradores', icon: Users, label: 'Compradores', perm: 'GERENCIAR_COMPRADORES' },
  { to: '/categorias', icon: ShoppingBag, label: 'Categorias', perm: null },
  { to: '/encomendas', icon: Package, label: 'Encomendas', perm: null },
  { to: '/administradores', icon: Shield, label: 'Admins', perm: 'GERENCIAR_ADMINS' },
]

export default function Sidebar() {
  const { hasPermission } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.perm || hasPermission(item.perm)
  )

  return (
    <aside
      className={`
        fixed top-0 left-0 z-30 flex h-dvh flex-col
        border-r border-border bg-surface-light transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <img src={logoSvg} alt="Cata Log" className="h-9 w-auto shrink-0" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {visibleItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)

            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary/10 text-primary shadow-sm dark:bg-primary/15'
                      : 'text-text-muted hover:bg-surface-lighter hover:text-text'}
                  `}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-text-dim hover:bg-surface-lighter hover:text-text transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  )
}
