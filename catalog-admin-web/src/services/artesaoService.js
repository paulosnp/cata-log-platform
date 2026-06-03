import api from './api'

export const artesaoService = {
  listarArtesaos: (page = 0, size = 20) =>
    api.get('/admin/artesaos', { params: { page, size } }).then(r => r.data),

  verificarArtesao: (id) =>
    api.put(`/admin/artesaos/${id}/verificar`).then(r => r.data),

  removerVerificacao: (id) =>
    api.put(`/admin/artesaos/${id}/remover-verificacao`).then(r => r.data),
}
