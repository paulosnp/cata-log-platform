import api from './api'

const PREFIX = '/admin'

export const dashboardService = {
  obterDashboard: async () => {
    const { data } = await api.get(`${PREFIX}/dashboard`)
    return data
  },

  obterFaturamento: async (inicio, fim) => {
    const { data } = await api.get(`${PREFIX}/relatorios/faturamento`, {
      params: { inicio, fim },
    })
    return data
  },

  obterTopArtesaos: async (limite = 5) => {
    const { data } = await api.get(`${PREFIX}/relatorios/top-artesaos`, {
      params: { limite },
    })
    return data
  },
}
