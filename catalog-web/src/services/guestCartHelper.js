/**
 * Guest Cart & Wishlist Helper
 *
 * Gerencia carrinho e favoritos no localStorage para visitantes não logados.
 * Ao fazer login, os dados são sincronizados com o backend.
 */
import { productService } from './productService';

const STORAGE_KEYS = {
  GUEST_CART: 'catalog_guest_cart',
  GUEST_WISHLIST: 'catalog_guest_wishlist',
};

// ═══════════════════════════════════════════════════════
// GUEST CART (localStorage)
// Formato: [{ produtoId: number, quantidade: number }]
// ═══════════════════════════════════════════════════════

function getGuestCartItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCartItems(items) {
  localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
}

export function clearGuestCart() {
  localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
}

/**
 * Adiciona item ao guest cart. Se já existe, incrementa quantidade.
 */
export function addGuestCartItem(produtoId, quantidade = 1) {
  const items = getGuestCartItems();
  const existing = items.find((i) => i.produtoId === produtoId);

  if (existing) {
    existing.quantidade += quantidade;
  } else {
    items.push({ produtoId, quantidade });
  }

  saveGuestCartItems(items);
  return items;
}

/**
 * Remove item do guest cart pelo produtoId.
 */
export function removeGuestCartItem(produtoId) {
  const items = getGuestCartItems().filter((i) => i.produtoId !== produtoId);
  saveGuestCartItems(items);
  return items;
}

/**
 * Limpa todo o guest cart.
 */
export function clearGuestCartItems() {
  clearGuestCart();
}

/**
 * Enriquece os itens do guest cart com dados do produto (nome, preço, imagem).
 * Transforma em formato compatível com o CarrinhoResponse do backend.
 */
export async function enrichGuestCart() {
  const items = getGuestCartItems();
  if (items.length === 0) return { itens: [], totalItens: 0, valorTotal: 0 };

  const enriched = [];

  // Busca dados de cada produto em paralelo
  const results = await Promise.allSettled(
    items.map((item) => productService.getById(item.produtoId))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const produto = result.value.data;
      const item = items[index];
      enriched.push({
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario: produto.preco,
        quantidade: item.quantidade,
        subtotal: produto.preco * item.quantidade,
        imagemUrl: produto.imagensUrls?.[0] || null,
        pecaUnica: produto.pecaUnica || false,
      });
    }
    // Se falhou (produto deletado, etc.), ignora silenciosamente
  });

  const totalItens = enriched.reduce((sum, i) => sum + i.quantidade, 0);
  const valorTotal = enriched.reduce((sum, i) => sum + i.subtotal, 0);

  return { itens: enriched, totalItens, valorTotal };
}

/**
 * Retorna os itens crus do guest cart (sem enriquecimento).
 */
export { getGuestCartItems };

// ═══════════════════════════════════════════════════════
// GUEST WISHLIST (localStorage)
// Formato: [produtoId, produtoId, ...]
// ═══════════════════════════════════════════════════════

export function getGuestWishlistIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestWishlistIds(ids) {
  localStorage.setItem(STORAGE_KEYS.GUEST_WISHLIST, JSON.stringify(ids));
}

export function clearGuestWishlist() {
  localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
}

/**
 * Adiciona produto à guest wishlist.
 */
export function addGuestWishlistId(produtoId) {
  const ids = getGuestWishlistIds();
  if (!ids.includes(produtoId)) {
    ids.push(produtoId);
    saveGuestWishlistIds(ids);
  }
  return ids;
}

/**
 * Remove produto da guest wishlist.
 */
export function removeGuestWishlistId(produtoId) {
  const ids = getGuestWishlistIds().filter((id) => id !== produtoId);
  saveGuestWishlistIds(ids);
  return ids;
}

/**
 * Verifica se um produto está na guest wishlist.
 */
export function isGuestWishlisted(produtoId) {
  return getGuestWishlistIds().includes(produtoId);
}

/**
 * Enriquece a guest wishlist com dados dos produtos.
 * Formato compatível com a response da API /desejos.
 */
export async function enrichGuestWishlist() {
  const ids = getGuestWishlistIds();
  if (ids.length === 0) return [];

  const results = await Promise.allSettled(
    ids.map((id) => productService.getById(id))
  );

  const enriched = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const produto = result.value.data;
      enriched.push({
        produtoId: produto.id,
        nomeProduto: produto.nome,
        precoAtual: produto.preco,
        imagemUrl: produto.imagensUrls?.[0] || null,
        dataAdicao: null, // Guest não tem data
      });
    }
  });

  return enriched;
}
