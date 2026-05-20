/**
 * Resolve a URL de uma imagem do backend.
 * 
 * Em produção (Nginx proxy): /imagens/uuid.jpg → funciona diretamente
 * Em desenvolvimento: /imagens/uuid.jpg → http://localhost:8080/imagens/uuid.jpg
 */
const IMAGE_BASE_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080');

/**
 * Transforma uma URL relativa de imagem (/imagens/...) em URL absoluta quando necessário.
 * @param {string|null} url - URL da imagem retornada pela API
 * @returns {string|null} URL resolvida
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  // Se já for absoluta, retorna como está
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}${url}`;
}
