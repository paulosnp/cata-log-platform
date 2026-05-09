import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ======================== REQUEST INTERCEPTOR ========================
// Injeta o token JWT do localStorage em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('catalog_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================== RESPONSE INTERCEPTOR ========================
// Trata erros globais: 401 (token expirado) redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Token expirado ou inválido → limpa sessão e redireciona
      if (status === 401) {
        localStorage.removeItem('catalog_token');
        localStorage.removeItem('catalog_user');

        // Evita redirect loop se já estiver na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
