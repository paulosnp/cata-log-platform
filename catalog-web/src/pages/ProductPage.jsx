import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  BadgeCheck,
  Percent,
  Gem,
  Ruler,
  Weight,
  Clock,
  Layers,
  ImageOff,
  AlertTriangle,
  Heart,
  Hammer,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import NovaEncomendaModal from '../components/encomenda/NovaEncomendaModal';

/**
 * Formata um valor numérico para moeda brasileira (BRL).
 */
const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Formata as dimensões do produto (CxLxA cm).
 */
const formatDimensoes = (produto) => {
  const { comprimentoCm, larguraCm, alturaCm } = produto;
  if (!comprimentoCm && !larguraCm && !alturaCm) return null;
  const parts = [];
  if (comprimentoCm) parts.push(`${comprimentoCm}`);
  if (larguraCm) parts.push(`${larguraCm}`);
  if (alturaCm) parts.push(`${alturaCm}`);
  return `${parts.join(' × ')} cm`;
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [encomendaModalOpen, setEncomendaModalOpen] = useState(false);

  // ── Carregar produto ao montar ou trocar de ID ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedImage(0);

    productService
      .getById(id)
      .then((res) => setProduto(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Produto não encontrado.');
        } else {
          setError('Erro ao carregar os detalhes do produto. Tente novamente.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Estado de Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Estado de Erro ──
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-error-container/30 p-4">
          <AlertTriangle size={32} className="text-tertiary" />
        </div>
        <h1 className="text-xl font-bold font-headline">{error}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Verifique o link ou volte para a vitrine.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim"
        >
          <ArrowLeft size={16} />
          Voltar à vitrine
        </Link>
      </div>
    );
  }

  // ── Desestruturação dos dados ──
  const {
    nome,
    descricao,
    preco,
    precoComDesconto,
    percentualDesconto,
    emPromocao,
    pecaUnica,
    vendido,
    material,
    pesoGramas,
    comprimentoCm,
    larguraCm,
    alturaCm,
    tempoProducaoDias,
    artesaoId,
    categoriaNome,
    artesaoNomeAtelie,
    artesaoSeloVerificado,
    notaMedia,
    totalAvaliacoes,
    imagensUrls,
  } = produto;

  // Imagens disponíveis
  const imagens = imagensUrls?.length > 0 ? imagensUrls : [];
  const imagemAtual = imagens[selectedImage] || null;
  const wishlisted = isWishlisted(Number(id));

  // Ficha técnica (filtra campos não-nulos)
  const fichaTecnica = [
    { icon: Layers, label: 'Material', value: material },
    { icon: Weight, label: 'Peso', value: pesoGramas ? `${pesoGramas}g` : null },
    { icon: Ruler, label: 'Dimensões', value: formatDimensoes(produto) },
    { icon: Clock, label: 'Tempo de produção', value: tempoProducaoDias ? `${tempoProducaoDias} dias` : null },
  ].filter((item) => item.value);

  // ── Adicionar ao Carrinho ──
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(Number(id), 1);
    setAddingToCart(false);

    if (result.success) {
      addToast('Adicionado ao carrinho!', 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  // ── Toggle Wishlist ──
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const result = await toggleWishlist(Number(id));
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
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* ── Breadcrumb / Voltar ── */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* ── Layout Principal: Split (imagem + detalhes) ── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Coluna Esquerda: Imagens ── */}
        <div>
          {/* Imagem Principal */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low">
            {imagemAtual ? (
              <img
                src={imagemAtual}
                alt={nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container">
                <ImageOff size={64} className="text-outline/30" />
              </div>
            )}

            {/* Overlay "VENDIDO" */}
            {vendido && (
              <div className="absolute inset-0 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm">
                <span className="rounded-full bg-surface-container-lowest px-6 py-2 text-sm font-bold uppercase tracking-widest text-on-surface">
                  Vendido
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {emPromocao && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-on-tertiary shadow-sm">
                  <Percent size={12} />
                  {percentualDesconto ? `-${percentualDesconto}%` : 'Oferta'}
                </span>
              )}
              {pecaUnica && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  <Gem size={12} />
                  Peça Única
                </span>
              )}
            </div>

            {/* ❤️ Botão Wishlist — canto superior-direito */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                wishlisted
                  ? 'bg-tertiary/90 text-white'
                  : 'bg-surface-container-lowest/80 text-on-surface-variant hover:text-tertiary'
              }`}
              aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                size={20}
                fill={wishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Thumbnails (se mais de 1 imagem) */}
          {imagens.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {imagens.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${nome} - foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Coluna Direita: Detalhes ── */}
        <div className="flex flex-col">
          {/* Categoria */}
          <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70">
            {categoriaNome}
          </span>

          {/* Nome */}
          <h1 className="text-3xl font-bold font-headline leading-tight md:text-4xl">
            {nome}
          </h1>

          {/* Avaliação + Artesão */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {notaMedia > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold">{Number(notaMedia).toFixed(1)}</span>
                <span className="text-on-surface-variant">
                  ({totalAvaliacoes} avaliação{totalAvaliacoes !== 1 ? 'ões' : ''})
                </span>
              </div>
            )}

            {artesaoNomeAtelie && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                {artesaoSeloVerificado && (
                  <BadgeCheck size={16} className="text-primary" />
                )}
                <span>{artesaoNomeAtelie}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-outline-variant/15" />

          {/* Preço */}
          <div className="flex items-baseline gap-3">
            {emPromocao && precoComDesconto ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(precoComDesconto)}
                </span>
                <span className="text-lg text-outline line-through">
                  {formatPrice(preco)}
                </span>
                {percentualDesconto && (
                  <span className="rounded-full bg-tertiary/10 px-2.5 py-0.5 text-xs font-bold text-tertiary">
                    -{percentualDesconto}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {formatPrice(preco)}
              </span>
            )}
          </div>

          {/* Descrição */}
          {descricao && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant/70">
                Sobre a peça
              </h2>
              <p className="text-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
                {descricao}
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="mt-8 flex gap-3">
            {/* Adicionar ao Carrinho */}
            <button
              onClick={handleAddToCart}
              disabled={vendido || addingToCart}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
              ) : (
                <ShoppingCart size={20} />
              )}
              {vendido ? 'Produto Vendido' : addingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
            </button>

            {/* Wishlist */}
            <button
              onClick={handleWishlistToggle}
              className={`flex items-center justify-center rounded-lg border px-4 py-4 transition-all hover:scale-105 ${
                wishlisted
                  ? 'border-tertiary/30 bg-tertiary/10 text-tertiary'
                  : 'border-outline-variant/20 text-on-surface-variant hover:border-tertiary hover:text-tertiary'
              }`}
              aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                size={20}
                fill={wishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Botão Encomendar Peça Similar */}
          {!vendido && (
            <div style={{ paddingTop: '1.25rem' }}>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate(`/login?returnUrl=/produto/${id}`);
                    return;
                  }
                  setEncomendaModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-outline-variant/20 px-8 py-3.5 text-sm font-semibold text-on-surface-variant transition-all hover:border-primary hover:text-primary hover:shadow-ambient"
              >
                <Hammer size={18} />
                Encomendar Peça Similar
              </button>
            </div>
          )}

          {/* Ficha Técnica */}
          {fichaTecnica.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-on-surface-variant/70">
                Ficha Técnica
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {fichaTecnica.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4"
                  >
                    <div className="shrink-0 rounded-md bg-primary-fixed p-2">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">{label}</p>
                      <p className="text-sm font-semibold text-on-surface">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal de Encomenda */}
      <NovaEncomendaModal
        isOpen={encomendaModalOpen}
        onClose={() => setEncomendaModalOpen(false)}
        artesaoId={artesaoId}
        artesaoNome={artesaoNomeAtelie}
        produtoReferenciaId={Number(id)}
        produtoNome={nome}
      />
    </div>
  );
}
