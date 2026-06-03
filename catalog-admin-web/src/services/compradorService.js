import api from './api'

export const compradorService = {
  listarCompradores: (page = 0, size = 20) =>
    api.get('/admin/compradores', { params: { page, size } }).then(r => r.data),

  bloquearComprador: (id) =>
    api.put(`/admin/compradores/${id}/bloquear`).then(r => r.data),

  desbloquearComprador: (id) =>
    api.put(`/admin/compradores/${id}/desbloquear`).then(r => r.data),
}
