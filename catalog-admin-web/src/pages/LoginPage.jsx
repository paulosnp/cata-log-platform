import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { LogIn, Eye, EyeOff, AlertCircle, Sun, Moon } from 'lucide-react'
import logoSvg from '../assets/logo.svg'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, senha)
      if (data.senhaTemporaria) {
        navigate('/trocar-senha', { replace: true })
      } else {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.mensagem
        ?? err.response?.data?.message
        ?? 'Credenciais inválidas. Verifique e tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-surface px-4">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-lg text-text-dim hover:bg-surface-lighter hover:text-text transition-colors"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4">
            <img src={logoSvg} alt="Cata Log" className="mx-auto h-14 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-text font-headline">Painel de Curadoria</h1>
          <p className="mt-1 text-sm text-text-muted">Acesso restrito à equipa de administração</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-surface-light p-6 shadow-ambient"
        >
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-muted">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@catalog.com.br"
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-text-muted">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-text placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md gradient-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-ambient"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-dim">
          Cata Log &copy; {new Date().getFullYear()} — Painel Administrativo
        </p>
      </div>
    </div>
  )
}
