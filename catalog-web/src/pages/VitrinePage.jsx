import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PackageOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import Spinner from '../components/common/Spinner';

export default function VitrinePage() {
  // ── URL Search Params (busca vinda da Navbar) ──
  const [searchParams, setSearchParams] = useSearchParams();
  const termoFromUrl = searchParams.get('termo') || '';
  const categoriaFromUrl = searchParams.get('categoria') || '';

  // ── State ──
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(
    categoriaFromUrl ? Number(categoriaFromUrl) : null
  );
  const [termoBusca, setTermoBusca] = useState(termoFromUrl);
  const [termoInput, setTermoInput] = useState(termoFromUrl);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Sincroniza termo da URL com o state local
  useEffect(() => {
    setTermoBusca(termoFromUrl);
    setTermoInput(termoFromUrl);
    setPage(0);
  }, [termoFromUrl]);

  useEffect(() => {
    if (categoriaFromUrl) {
      setCategoriaAtiva(Number(categoriaFromUrl));
    }
  }, [categoriaFromUrl]);

  // ── Carregar Categorias (uma vez ao montar) ──
  useEffect(() => {
    categoryService
      .listarAtivas()
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error('Erro ao carregar categorias:', err));
  }, []);

  // ── Carregar Produtos (reativo a filtros e página) ──
  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getVitrine({
        termo: termoBusca || undefined,
        categoriaId: categoriaAtiva || undefined,
        page,
        size: 20,
      });
      setProdutos(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, [termoBusca, categoriaAtiva, page]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  // ── Handlers ──
  const handleCategoriaClick = (catId) => {
    setCategoriaAtiva(catId);
    setPage(0);
  };

  const handleBuscaSubmit = (e) => {
    e.preventDefault();
    setTermoBusca(termoInput.trim());
    setPage(0);
    // Atualiza URL sem recarregar
    const params = new URLSearchParams();
    if (termoInput.trim()) params.set('termo', termoInput.trim());
    if (categoriaAtiva) params.set('categoria', categoriaAtiva);
    setSearchParams(params);
  };

  const limparFiltros = () => {
    setCategoriaAtiva(null);
    setTermoBusca('');
    setTermoInput('');
    setPage(0);
    setSearchParams({});
  };

  const temFiltrosAtivos = categoriaAtiva !== null || termoBusca !== '';

  return (
    <div className="min-h-[70vh] bg-surface py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* ── Header da Vitrine ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <SlidersHorizontal size={20} className="text-primary" />
            <h1 className="text-3xl font-bold font-headline md:text-4xl">
              Vitrine
            </h1>
          </div>
          <p className="text-on-surface-variant">
            {termoBusca ? (
              <>
                Resultados para "<strong className="text-on-surface">{termoBusca}</strong>"
              </>
            ) : (
              'Explore peças de artesãos verificados de Pernambuco.'
            )}
          </p>
        </div>

        {/* ── Barra de Busca + Filtros ── */}
        <div className="mb-8 flex flex-col gap-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-5 shadow-sm">
          {/* Busca inline */}
          <form onSubmit={handleBuscaSubmit}>
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
              />
              <input
                type="text"
                value={termoInput}
                onChange={(e) => setTermoInput(e.target.value)}
                placeholder="Buscar por nome, material, artesão..."
                className="w-full rounded-full bg-surface-container-low py-3 pl-11 pr-24 text-sm text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:shadow-ambient focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-dim"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Chips de Categoria */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoriaClick(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                categoriaAtiva === null
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/40'
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoriaClick(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  categoriaAtiva === cat.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/40'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback de filtros ativos */}
        {temFiltrosAtivos && !loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              {totalElements} resultado{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
              {categoriaAtiva && categorias.length > 0 && (
                <span>
                  {' '}em{' '}
                  <strong className="text-on-surface">
                    {categorias.find((c) => c.id === categoriaAtiva)?.nome}
                  </strong>
                </span>
              )}
            </p>
            <button
              onClick={limparFiltros}
              className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* ── Grid de Produtos ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-surface-container-low p-4">
              <PackageOpen size={40} className="text-outline" />
            </div>
            <h3 className="text-lg font-semibold font-headline">
              Nenhum produto encontrado
            </h3>
            <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
              Tente outro termo de busca ou selecione uma categoria diferente.
            </p>
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="mt-6 rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/20 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <span className="rounded-lg bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/20 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
