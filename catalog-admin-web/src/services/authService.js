import api from './api'

const PREFIX = '/auth'

export const authService = {
  loginAdmin: async (email, senha) => {
    const { data } = await api.post(`${PREFIX}/admin/login`, { email, senha })
    return data
  },

  trocarSenha: async (senhaAtual, novaSenha) => {
    const { data } = await api.post(`${PREFIX}/trocar-senha`, { senhaAtual, novaSenha })
    return data
  },

  logout: async () => {
    const { data } = await api.post(`${PREFIX}/logout`)
    return data
  },
}
