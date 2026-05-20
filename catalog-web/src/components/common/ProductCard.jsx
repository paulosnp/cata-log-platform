import { Link, useNavigate } from 'react-router-dom';
import { Percent, Gem, Star, BadgeCheck, ImageOff, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from './Toast';
import { resolveImageUrl } from '../../services/imageUtils';

/**
 * Formata um valor numérico para moeda brasileira (BRL).
 */
const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * ProductCard — Card de produto para o grid da vitrine.
 *
 * Exibe: imagem (ou placeholder), nome, categoria, preço formatado BRL,
 * badges condicionais (promoção, peça única), selo artesão verificado,
 * avaliação com estrela, overlay de "VENDIDO" e botão ❤️ wishlist.
 *
 * @param {{ produto: ProdutoResponse }} props
 */
export default function ProductCard({ produto }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const {
    id,
    nome,
    preco,
    precoComDesconto,
    percentualDesconto,
    emPromocao,
    pecaUnica,
    vendido,
    categoriaNome,
    artesaoNomeAtelie,
    artesaoSeloVerificado,
    notaMedia,
    totalAvaliacoes,
    imagensUrls,
  } = produto;

  // Primeira imagem do array ou null
  const imagemPrincipal = imagensUrls?.length > 0 ? resolveImageUrl(imagensUrls[0]) : null;
  const wishlisted = isWishlisted(id);

  const handleWishlistClick = async (e) => {
    e.preventDefault(); // Evita navegação do Link pai
    e.stopPropagation();

    const result = await toggleWishlist(id);
    if (result.success) {
      addToast(
        result.action === 'added' ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.',
        result.action === 'added' ? 'success' : 'info'
      );
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <Link
      to={`/produto/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/10 transition-all duration-300 hover:shadow-hover hover:scale-[1.02]"
    >
      {/* ── Imagem com Badges ── */}
      <div className="relative aspect-square overflow-hidden bg-surface-container-low">
        {imagemPrincipal ? (
          <img
            src={imagemPrincipal}
            alt={nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-container">
            <ImageOff size={40} className="text-outline/40" />
          </div>
        )}

        {/* Overlay "VENDIDO" */}
        {vendido && (
          <div className="absolute inset-0 flex items-center justify-center bg-on-surface/60">
            <span className="rounded-full bg-surface-container-lowest px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface">
              Vendido
            </span>
          </div>
        )}

        {/* Badges no canto superior-esquerdo */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {emPromocao && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary shadow-sm">
              <Percent size={10} />
              {percentualDesconto ? `-${percentualDesconto}%` : 'Oferta'}
            </span>
          )}
          {pecaUnica && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              <Gem size={10} />
              Peça Única
            </span>
          )}
        </div>

        {/* ❤️ Botão Wishlist — canto superior-direito */}
        <button
          onClick={handleWishlistClick}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            wishlisted
              ? 'bg-tertiary/90 text-white'
              : 'bg-surface-container-lowest/80 text-on-surface-variant hover:text-tertiary'
          }`}
          aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            size={16}
            fill={wishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* ── Informações ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Categoria */}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
          {categoriaNome}
        </span>

        {/* Nome */}
        <h3 className="font-headline text-sm font-semibold leading-snug text-on-surface line-clamp-2">
          {nome}
        </h3>

        {/* Artesão com selo */}
        {artesaoNomeAtelie && (
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            {artesaoSeloVerificado && (
              <BadgeCheck size={13} className="shrink-0 text-primary" />
            )}
            <span className="truncate">{artesaoNomeAtelie}</span>
          </div>
        )}

        {/* Avaliação */}
        {notaMedia > 0 && (
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="font-medium">{Number(notaMedia).toFixed(1)}</span>
            <span className="text-outline">({totalAvaliacoes})</span>
          </div>
        )}

        {/* Spacer para empurrar o preço pra baixo */}
        <div className="flex-1" />

        {/* Preço */}
        <div className="mt-1 flex items-baseline gap-2">
          {emPromocao && precoComDesconto ? (
            <>
              <span className="text-lg font-bold text-primary">
                {formatPrice(precoComDesconto)}
              </span>
              <span className="text-xs text-outline line-through">
                {formatPrice(preco)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              {formatPrice(preco)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
