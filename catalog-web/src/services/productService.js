import api from './api';

/**
 * Serviço de Produtos — consome os endpoints públicos do ProdutoController.
 *
 * Endpoints utilizados:
 *   GET /api/v1/produtos/vitrine  → busca avançada com filtros (público)
 *   GET /api/v1/produtos/{id}     → detalhe de um produto (público)
 */
export const productService = {

  /**
   * Busca produtos na vitrine com filtros opcionais e paginação.
   * @param {Object}  params
   * @param {string}  [params.termo]        — Texto livre de busca
   * @param {number}  [params.categoriaId]  — Filtrar por categoria
   * @param {number}  [params.precoMin]     — Preço mínimo
   * @param {number}  [params.precoMax]     — Preço máximo
   * @param {number}  [params.page=0]       — Página (0-based)
   * @param {number}  [params.size=20]      — Itens por página
   * @param {string}  [params.sort]         — Campo de ordenação (ex: "notaMedia,desc")
   * @returns {Promise<AxiosResponse<Page<ProdutoResponse>>>}
   */
  getVitrine: ({ termo, categoriaId, precoMin, precoMax, page = 0, size = 20, sort } = {}) =>
    api.get('/produtos/vitrine', {
      params: { termo, categoriaId, precoMin, precoMax, page, size, sort },
    }),

  /**
   * Busca os detalhes de um produto específico pelo ID.
   * @param {number|string} id — ID do produto
   * @returns {Promise<AxiosResponse<ProdutoResponse>>}
   */
  getById: (id) =>
    api.get(`/produtos/${id}`),
};
