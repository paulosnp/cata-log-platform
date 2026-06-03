import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react'

export default function TrocarSenhaPage() {
  const { user, clearTempPassword, logout } = useAuth()
  const navigate = useNavigate()

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }

    if (novaSenha.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      await authService.trocarSenha(senhaAtual, novaSenha)
      clearTempPassword()
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.mensagem
        ?? err.response?.data?.message
        ?? 'Erro ao trocar senha. Verifique a senha atual.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning shadow-lg shadow-warning/25">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Troca de Senha Obrigatória</h1>
          <p className="mt-1 text-sm text-text-muted">
            Defina uma senha pessoal para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-surface-light p-6 shadow-xl"
        >
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-warning-bg border border-warning/20 px-4 py-3 text-sm text-warning">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Está a utilizar uma senha temporária. Precisa defini-la antes de aceder ao painel.</span>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="senhaAtual" className="mb-1.5 block text-sm font-medium text-text-muted">
              Senha Atual (temporária)
            </label>
            <input
              id="senhaAtual"
              type="password"
              required
              autoFocus
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="novaSenha" className="mb-1.5 block text-sm font-medium text-text-muted">
              Nova Senha
            </label>
            <input
              id="novaSenha"
              type="password"
              required
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmar" className="mb-1.5 block text-sm font-medium text-text-muted">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmar"
              type="password"
              required
              minLength={8}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Definir Nova Senha
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-lighter transition-colors"
          >
            Cancelar e Sair
          </button>
        </form>
      </div>
    </div>
  )
}
