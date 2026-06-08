import api from './api'

export const logService = {
  listarLogs: async (page = 0, size = 20, filtros = {}) => {
    const params = { page, size }
    if (filtros.acao) params.acao = filtros.acao
    if (filtros.adminId) params.adminId = filtros.adminId
    if (filtros.inicio) params.inicio = filtros.inicio
    if (filtros.fim) params.fim = filtros.fim

    const res = await api.get('/admin/logs', { params })
    return res.data
  },
}
