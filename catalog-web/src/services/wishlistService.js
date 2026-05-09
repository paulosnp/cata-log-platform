import api from './api';

export const wishlistService = {
  /**
   * Lista os favoritos do comprador autenticado (paginado).
   * GET /api/v1/desejos?page=0&size=20 → Page<ItemDesejoResponse>
   */
  listar: (params = {}) => api.get('/desejos', { params }),

  /**
   * Adiciona produto aos favoritos.
   * POST /api/v1/desejos/{produtoId} → ItemDesejoResponse (201)
   */
  adicionar: (produtoId) => api.post(`/desejos/${produtoId}`),

  /**
   * Remove produto dos favoritos.
   * DELETE /api/v1/desejos/{produtoId} → 204 No Content
   */
  remover: (produtoId) => api.delete(`/desejos/${produtoId}`),
};
