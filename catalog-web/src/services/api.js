import axios from 'axios';

// Em produção: path relativo /api/v1 (Nginx proxy reverso, mesmo domínio = sem CORS)
// Em dev: http://localhost:8080/api/v1 (acesso direto ao Spring Boot)
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');

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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/');

      if ((status === 401 || status === 403) && !isAuthRoute) {
        localStorage.removeItem('catalog_token');
        localStorage.removeItem('catalog_user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
