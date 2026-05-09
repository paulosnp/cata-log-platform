import { Heart, Globe, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Coluna 1 — Marca */}
          <div>
            <div className="mb-4 flex items-center">
              <img src="/logo.svg" alt="Cata Log" className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed text-inverse-on-surface/70">
              Hub de visibilidade para microempreendedores da cultura
              pernambucana. Conectando artesãos à tecnologia, transformando
              tradição em oportunidade.
            </p>
          </div>

          {/* Coluna 2 — Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-inverse-primary">
              Navegação
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/"
                  className="text-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                >
                  Vitrine
                </Link>
              </li>
              <li>
                <Link
                  to="/carrinho"
                  className="text-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                >
                  Carrinho
                </Link>
              </li>
              <li>
                <Link
                  to="/pedidos"
                  className="text-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                >
                  Meus Pedidos
                </Link>
              </li>
              <li>
                <Link
                  to="/desejos"
                  className="text-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                >
                  Lista de Desejos
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 — Contato */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-inverse-primary">
              Contato
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-2 text-sm text-inverse-on-surface/70">
                <MapPin size={14} className="shrink-0" />
                Recife, Pernambuco — Brasil
              </li>
              <li className="flex items-center gap-2 text-sm text-inverse-on-surface/70">
                <Mail size={14} className="shrink-0" />
                contato@catalog.com.br
              </li>
              <li className="flex items-center gap-2 text-sm text-inverse-on-surface/70">
                <Globe size={14} className="shrink-0" />
                @catalogpe
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="mt-12 border-t border-inverse-on-surface/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-inverse-on-surface/50">
              © {currentYear} Cata Log. Todos os direitos reservados.
            </p>
            <p className="flex items-center gap-1 text-xs text-inverse-on-surface/50">
              Feito com <Heart size={12} className="text-tertiary" fill="currentColor" /> em Pernambuco
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
