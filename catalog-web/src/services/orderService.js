import api from './api';

const PEDIDOS_PREFIX = '/pedidos';
const PAGAMENTOS_PREFIX = '/pagamentos';

export const orderService = {
  /**
   * Finalizar compra (converte carrinho em pedido).
   * POST /api/v1/pedidos/checkout
   * Não envia body — backend pega o carrinho do usuário logado via JWT.
   * @returns {Promise<{data: PedidoResponse}>}
   */
  checkout() {
    return api.post(`${PEDIDOS_PREFIX}/checkout`);
  },

  /**
   * Gerar link de pagamento do Mercado Pago.
   * POST /api/v1/pagamentos/{pedidoId}
   * @returns {Promise<{data: {paymentUrl: string}}>}
   */
  gerarPagamento(pedidoId) {
    return api.post(`${PAGAMENTOS_PREFIX}/${pedidoId}`);
  },

  /**
   * Listar pedidos do comprador logado.
   * GET /api/v1/pedidos/meus
   * @returns {Promise<{data: PedidoResponse[]}>}
   */
  getMeusPedidos() {
    return api.get(`${PEDIDOS_PREFIX}/meus`);
  },
};
