import api from './api';

/**
 * Serviço de Chat — consome o endpoint de token do Stream Chat.
 *
 * Endpoint: GET /api/v1/chat/token
 * Response: { token: "eyJ..." }
 */
export const chatService = {
  /**
   * Obtém o token JWT do Stream Chat para o usuário autenticado.
   */
  getToken: () => api.get('/chat/token'),
};
