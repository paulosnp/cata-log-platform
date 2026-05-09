import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  ShoppingCart,
  ImageOff,
  ShoppingBag,
} from 'lucide-react';
import { wishlistService } from '../services/wishlistService';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/common/Toast';
import Spinner from '../components/common/Spinner';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function WishlistPage() {
  const { toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ── Carregar favoritos ──
  useEffect(() => {
    setLoading(true);
    wishlistService
      .listar({ page, size: 12 })
      .then((res) => {
        setItems(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        addToast('Erro ao carregar favoritos.', 'error');
      })
      .finally(() => setLoading(false));
  }, [page, addToast]);

  // ── Remover da wishlist ──
  const handleRemove = async (produtoId) => {
    const result = await toggleWishlist(produtoId);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.produtoId !== produtoId));
      addToast('Removido dos favoritos.', 'info');
    } else {
      addToast(result.error, 'error');
    }
  };

  // ── Adicionar ao carrinho ──
  const handleAddToCart = async (produtoId) => {
    const result = await addToCart(produtoId, 1);
    if (result.success) {
      addToast('Adicionado ao carrinho!', 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Vazio ──
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-fixed/30 p-5">
          <Heart size={40} className="text-primary/40" />
        </div>
        <h1 className="text-xl font-bold font-headline">Lista de desejos vazia</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Explore a vitrine e favorite peças que você ama.
        </p>
        <Link
          to="/vitrine"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim"
        >
          <ShoppingBag size={16} />
          Explorar Vitrine
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Heart size={24} className="text-primary" />
        <h1 className="text-2xl font-bold font-headline md:text-3xl">
          Lista de Desejos
        </h1>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-on-primary">
          {items.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.produtoId}
            className="group overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest transition-all hover:shadow-hover"
          >
            {/* Imagem */}
            <Link to={`/produto/${item.produtoId}`} className="block">
              {item.imagemUrl ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.imagemUrl}
                    alt={item.nomeProduto}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface-container">
                  <ImageOff size={40} className="text-outline/30" />
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="p-4">
              <Link
                to={`/produto/${item.produtoId}`}
                className="text-sm font-semibold font-headline text-on-surface hover:text-primary transition-colors line-clamp-2"
              >
                {item.nomeProduto}
              </Link>

              <p className="mt-2 text-lg font-bold text-primary">
                {formatPrice(item.precoAtual)}
              </p>

              {item.dataAdicao && (
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  Adicionado em{' '}
                  {new Date(item.dataAdicao).toLocaleDateString('pt-BR')}
                </p>
              )}

              {/* Ações */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAddToCart(item.produtoId)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-dim"
                >
                  <ShoppingCart size={14} />
                  Comprar
                </button>
                <button
                  onClick={() => handleRemove(item.produtoId)}
                  className="flex items-center justify-center rounded-lg border border-outline-variant/20 px-3 py-2 text-on-surface-variant transition-colors hover:border-tertiary hover:text-tertiary"
                  title="Remover dos favoritos"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-on-surface-variant">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
