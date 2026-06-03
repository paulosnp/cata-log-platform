import api from './api'

export const encomendaService = {
  listarEncomendas: (page = 0, size = 20) =>
    api.get('/admin/encomendas', { params: { page, size } }).then(r => r.data),

  confirmarEntrega: (id) =>
    api.put(`/encomendas/${id}/entregue`).then(r => r.data),
}
