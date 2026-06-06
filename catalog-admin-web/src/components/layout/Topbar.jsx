import { Menu, LogOut, User, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border glass-light px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-lighter hover:text-text transition-all duration-200"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-medium text-text-muted font-headline tracking-tight">Painel de Curadoria</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-lighter hover:text-text transition-all duration-200"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2.5 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
            {user?.email?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <span className="text-text-muted hidden sm:inline max-w-[180px] truncate">{user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-dim hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
