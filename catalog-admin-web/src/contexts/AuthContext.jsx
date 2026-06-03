import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

const STORAGE = { TOKEN: 'admin_token', USER: 'admin_user' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE.TOKEN)
      const storedUser = localStorage.getItem(STORAGE.USER)
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      localStorage.removeItem(STORAGE.TOKEN)
      localStorage.removeItem(STORAGE.USER)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, senha) => {
    const data = await authService.loginAdmin(email, senha)
    const userData = {
      id: data.id,
      email: data.nome ?? email,
      role: data.role,
      senhaTemporaria: data.senhaTemporaria,
      permissoes: data.permissoes ?? [],
    }
    localStorage.setItem(STORAGE.TOKEN, data.token)
    localStorage.setItem(STORAGE.USER, JSON.stringify(userData))
    setToken(data.token)
    setUser(userData)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    localStorage.removeItem(STORAGE.TOKEN)
    localStorage.removeItem(STORAGE.USER)
    setToken(null)
    setUser(null)
  }, [])

  const clearTempPassword = useCallback(() => {
    setUser(prev => {
      const updated = { ...prev, senhaTemporaria: false }
      localStorage.setItem(STORAGE.USER, JSON.stringify(updated))
      return updated
    })
  }, [])

  const hasPermission = useCallback(
    (perm) => user?.permissoes?.includes(perm) ?? false,
    [user]
  )

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    clearTempPassword,
    hasPermission,
  }), [user, token, loading, login, logout, clearTempPassword, hasPermission])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
