import api from './api';

const AUTH_PREFIX = '/auth';

export const authService = {
  /**
   * Login do comprador
   * POST /auth/comprador/login
   * @returns {{ token, role, nome, senhaTemporaria }}
   */
  async loginComprador(email, senha) {
    const { data } = await api.post(`${AUTH_PREFIX}/comprador/login`, { email, senha });
    return data;
  },

  /**
   * Registro do comprador
   * POST /auth/comprador/registrar
   * @returns {{ mensagem }}
   */
  async registrarComprador({ nome, email, senha }) {
    const { data } = await api.post(`${AUTH_PREFIX}/comprador/registrar`, { nome, email, senha });
    return data;
  },

  /**
   * Solicitar PIN de recuperação de senha
   * POST /auth/esqueci-senha
   * @returns {{ mensagem }}
   */
  async esqueciSenha(email) {
    const { data } = await api.post(`${AUTH_PREFIX}/esqueci-senha`, { email });
    return data;
  },

  /**
   * Redefinir senha com PIN recebido por e-mail
   * POST /auth/redefinir-senha
   * @returns {{ mensagem }}
   */
  async redefinirSenha({ email, pin, novaSenha }) {
    const { data } = await api.post(`${AUTH_PREFIX}/redefinir-senha`, { email, pin, novaSenha });
    return data;
  },

  /**
   * Trocar senha (requer token JWT)
   * POST /auth/trocar-senha
   * @returns {{ mensagem }}
   */
  async trocarSenha({ senhaAtual, novaSenha }) {
    const { data } = await api.post(`${AUTH_PREFIX}/trocar-senha`, { senhaAtual, novaSenha });
    return data;
  },
};
