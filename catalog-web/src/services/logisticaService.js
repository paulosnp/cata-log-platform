import api from './api';

export const logisticaService = {
  /**
   * Calcula opções de frete via Melhor Envio.
   * POST /api/v1/logistica/cotacao → List<OpcaoFreteResponse>
   *
   * @param {Object} dados
   * @param {string} dados.cepOrigem   — CEP do artesão
   * @param {string} dados.cepDestino  — CEP do comprador
   * @param {number} dados.peso        — Peso em kg
   * @param {number} dados.altura      — Altura em cm
   * @param {number} dados.largura     — Largura em cm
   * @param {number} dados.comprimento — Comprimento em cm
   */
  cotarFrete: (dados) => api.post('/logistica/cotacao', dados),
};
