import api from './api';

/**
 * Serviço de Encomendas — consome os endpoints do EncomendaController.
 *
 * Endpoints utilizados:
 *   POST /api/v1/encomendas              → cria nova encomenda (COMPRADOR)
 *   GET  /api/v1/encomendas/comprador    → lista encomendas do comprador
 *   PUT  /api/v1/encomendas/{id}/aceitar → aceita contraproposta
 */
export const encomendaService = {

  /**
   * Cria uma nova encomenda personalizada.
   * @param {{ artesaoId: number, produtoReferenciaId?: number, observacoesCliente: string }} dados
   */
  criar: (dados) => api.post('/encomendas', dados),

  /**
   * Lista as encomendas do comprador autenticado.
   * @param {number} [page=0]
   * @param {number} [size=20]
   */
  listarMinhas: (page = 0, size = 20) =>
    api.get('/encomendas/comprador', { params: { page, size } }),

  /**
   * Aceita a contraproposta de uma encomenda.
   * @param {number} id — ID da encomenda
   */
  aceitar: (id) => api.put(`/encomendas/${id}/aceitar`),

  /**
   * Busca uma encomenda específica pelo ID.
   * @param {number} id — ID da encomenda
   */
  getById: (id) => api.get(`/encomendas/${id}`),
};
