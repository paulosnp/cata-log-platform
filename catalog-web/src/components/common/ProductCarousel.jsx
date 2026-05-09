import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

/**
 * ProductCarousel — Carrossel horizontal de produtos com setas de navegação.
 *
 * Props:
 *   title     — Título da seção (ex: "Novidades", "Cerâmica e Barro")
 *   subtitle  — Subtítulo opcional
 *   products  — Array de ProdutoResponse
 *   viewAllLink — Link para "Ver todos" (opcional, ex: "/vitrine?categoria=1")
 *   loading   — Se true, exibe skeleton cards
 */
export default function ProductCarousel({
  title,
  subtitle,
  products = [],
  viewAllLink,
  loading = false,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Verifica se pode scrollar em cada direção
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      // Recheck on window resize
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll por ~3 cards de largura
    const cardWidth = el.querySelector(':scope > *')?.offsetWidth || 280;
    const scrollAmount = cardWidth * 3;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Não renderiza se não tem produtos e não está carregando
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-8">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold font-headline md:text-2xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary-dim"
          >
            Ver todos →
          </Link>
        )}
      </div>

      {/* Carousel container */}
      <div className="group relative">
        {/* Seta Esquerda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-ambient text-on-surface-variant transition-all hover:bg-surface-container hover:shadow-hover opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Seta Direita */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-ambient text-on-surface-variant transition-all hover:bg-surface-container hover:shadow-hover opacity-0 group-hover:opacity-100"
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Scroll area */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? // Skeleton cards
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="w-[220px] shrink-0 animate-pulse rounded-xl bg-surface-container-low sm:w-[240px]"
                >
                  <div className="aspect-square rounded-t-xl bg-surface-container" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 rounded bg-surface-container" />
                    <div className="h-4 w-full rounded bg-surface-container" />
                    <div className="h-4 w-3/4 rounded bg-surface-container" />
                    <div className="h-5 w-20 rounded bg-surface-container" />
                  </div>
                </div>
              ))
            : products.map((produto) => (
                <div
                  key={produto.id}
                  className="w-[220px] shrink-0 sm:w-[240px]"
                >
                  <ProductCard produto={produto} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
