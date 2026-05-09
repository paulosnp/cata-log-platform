import api from './api';

export const cartService = {
  /**
   * Busca o carrinho do comprador autenticado.
   * GET /api/v1/carrinho → CarrinhoResponse
   */
  getCarrinho: () => api.get('/carrinho'),

  /**
   * Adiciona item ao carrinho.
   * POST /api/v1/carrinho/itens { produtoId, quantidade } → CarrinhoResponse
   */
  addItem: (produtoId, quantidade = 1) =>
    api.post('/carrinho/itens', { produtoId, quantidade }),

  /**
   * Remove item do carrinho pelo produtoId.
   * DELETE /api/v1/carrinho/itens/{produtoId} → CarrinhoResponse
   */
  removeItem: (produtoId) => api.delete(`/carrinho/itens/${produtoId}`),

  /**
   * Limpa todo o carrinho.
   * DELETE /api/v1/carrinho → { mensagem: string }
   */
  limparCarrinho: () => api.delete('/carrinho'),
};
