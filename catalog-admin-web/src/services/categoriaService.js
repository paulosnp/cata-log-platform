import api from './api'

export const categoriaService = {
  listarTodas: () =>
    api.get('/categorias/admin').then(r => r.data),

  criar: (nome, descricao = '') =>
    api.post('/categorias', { nome, descricao }).then(r => r.data),

  atualizar: (id, nome, descricao = '') =>
    api.put(`/categorias/${id}`, { nome, descricao }).then(r => r.data),

  desativar: (id) =>
    api.delete(`/categorias/${id}`).then(r => r.data),
}
