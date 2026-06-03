import api from './api'

export const adminService = {
  registrar: (email) =>
    api.post('/admin/registrar', { email }).then(r => r.data),

  listarTodos: () =>
    api.get('/admin/admins').then(r => r.data),

  atualizarPermissoes: (id, permissoes) =>
    api.put(`/admin/admins/${id}/permissoes`, { permissoes }).then(r => r.data),
}
