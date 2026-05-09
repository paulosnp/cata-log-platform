import api from './api';

/**
 * Serviço de Categorias — consome os endpoints públicos do CategoriaController.
 *
 * Endpoints utilizados:
 *   GET /api/v1/categorias  → lista todas as categorias ativas (público)
 */
export const categoryService = {

  /**
   * Lista todas as categorias ativas (para chips de filtro na vitrine).
   * @returns {Promise<AxiosResponse<CategoriaResponse[]>>}
   */
  listarAtivas: () =>
    api.get('/categorias'),
};
