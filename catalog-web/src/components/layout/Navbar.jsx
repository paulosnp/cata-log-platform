import { Search, ShoppingCart, Heart, User, Menu, X, LogOut, Package, ChevronDown, ArrowRight, ImageOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/productService';
import logoSvg from '../../assets/logo.svg';

/**
 * Formata preço para BRL.
 */
const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();

  // ── Search State ──
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Busca com debounce (300ms) ──
  const fetchSuggestions = useCallback((term) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!term || term.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await productService.getVitrine({
          termo: term.trim(),
          page: 0,
          size: 6,
        });
        setSuggestions(res.data.content || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  // ── Submit: navega para /vitrine?termo= ──
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      navigate(`/vitrine?termo=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/vitrine');
    }
    setMobileMenuOpen(false);
  };

  // ── Click numa sugestão: navega para o produto ──
  const handleSuggestionClick = (produto) => {
    setShowSuggestions(false);
    setSearchTerm('');
    navigate(`/produto/${produto.id}`);
    setMobileMenuOpen(false);
  };

  // ── Fechar dropdowns ao clicar fora ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpar debounce ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // ── Componente do Dropdown de Sugestões ──
  const SuggestionsDropdown = () => {
    if (!showSuggestions) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-surface-container-lowest border border-outline-variant/15 shadow-hover overflow-hidden z-[60]">
        {loadingSuggestions ? (
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-on-surface-variant">Buscando...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <p className="text-sm text-on-surface-variant">
              Nenhum resultado para "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
            {/* Lista de sugestões de produtos */}
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => handleSuggestionClick(produto)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low"
                >
                  {/* Mini thumbnail */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                    {produto.imagensUrls?.length > 0 ? (
                      <img
                        src={produto.imagensUrls[0]}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff size={16} className="text-outline/40" />
                      </div>
                    )}
                  </div>
                  {/* Texto */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">
                      {produto.nome}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {produto.categoriaNome}
                    </p>
                  </div>
                  {/* Preço */}
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {formatPrice(produto.emPromocao && produto.precoComDesconto ? produto.precoComDesconto : produto.preco)}
                  </span>
                </button>
              ))}
            </div>

            {/* Link "Ver todos os resultados" */}
            <button
              onClick={handleSearchSubmit}
              className="flex w-full items-center justify-center gap-2 border-t border-outline-variant/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-fixed/30"
            >
              Ver todos os resultados
              <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-outline-variant/15">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src={logoSvg} alt="Cata Log" className="h-12 w-auto" />
        </Link>

        {/* Search Bar — Desktop (com dropdown) */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) setShowSuggestions(true);
                }}
                placeholder="Buscar artesanato..."
                className="w-full rounded-full bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:shadow-ambient focus:outline-none"
                autoComplete="off"
              />
            </div>
          </form>
          <SuggestionsDropdown />
        </div>

        {/* Actions — Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate('/desejos')}
            className="relative rounded-lg p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            aria-label="Lista de desejos"
          >
            <Heart size={20} />
          </button>
          <button
            onClick={() => navigate('/carrinho')}
            className="relative rounded-lg p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            aria-label="Carrinho"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tertiary px-1 text-[10px] font-bold text-on-tertiary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate font-medium">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg bg-surface-container-lowest border border-outline-variant/15 shadow-ambient overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10">
                    <p className="text-sm font-medium text-on-surface truncate">{user?.nome}</p>
                    <p className="text-xs text-on-surface-variant">{user?.role}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/pedidos"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Package size={16} />
                      Meus Pedidos
                    </Link>
                    <Link
                      to="/desejos"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Heart size={16} />
                      Lista de Desejos
                    </Link>
                  </div>
                  <div className="border-t border-outline-variant/10 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-tertiary hover:bg-error-container/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="ml-2 flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient"
            >
              <User size={16} />
              <span>Entrar</span>
            </button>
          )}
        </div>

        {/* Hamburger — Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-on-surface-variant md:hidden hover:bg-surface-container-low"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-outline-variant/15 bg-surface-container-lowest px-6 py-4 md:hidden">
          {/* Mobile Search (com dropdown) */}
          <div ref={mobileSearchRef} className="relative mb-4">
            <form onSubmit={handleSearchSubmit}>
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) setShowSuggestions(true);
                }}
                placeholder="Buscar artesanato..."
                className="w-full rounded-full bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                autoComplete="off"
              />
            </form>
            <SuggestionsDropdown />
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col gap-1">
            {isAuthenticated && (
              <div className="mb-3 flex items-center gap-3 rounded-md bg-surface-container-low px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{user?.nome}</p>
                  <p className="text-xs text-on-surface-variant">{user?.role}</p>
                </div>
              </div>
            )}

            <Link
              to="/vitrine"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low"
            >
              <Search size={18} />
              Explorar Vitrine
            </Link>
            <Link
              to="/desejos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low"
            >
              <Heart size={18} />
              Lista de Desejos
            </Link>
            <Link
              to="/carrinho"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low"
            >
              <ShoppingCart size={18} />
              Carrinho
              {cartCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-tertiary px-1 text-[10px] font-bold text-on-tertiary">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link
                to="/pedidos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low"
              >
                <Package size={18} />
                Meus Pedidos
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center justify-center gap-2 rounded-md border border-tertiary/20 px-4 py-2.5 text-sm font-semibold text-tertiary hover:bg-error-container/20 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
              >
                <User size={16} />
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
