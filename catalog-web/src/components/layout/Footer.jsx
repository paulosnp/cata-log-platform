import {
  Heart,
  MapPin,
  Mail,
  Shield,
  CreditCard,
  Truck,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoSvg from '../../assets/logo.svg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* ── Grid 4 Colunas ── */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Coluna 1 — Marca */}
          <div>
            <img
              src={logoSvg}
              alt="Cata Log"
              className="mb-4 h-12 w-auto brightness-0 invert"
            />
            <p className="text-sm leading-relaxed text-inverse-on-surface/70">
              Hub de visibilidade para microempreendedores da cultura
              pernambucana. Conectando artesãos à tecnologia, transformando
              tradição em oportunidade.
            </p>
          </div>

          {/* Coluna 2 — Links Rápidos */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-inverse-primary">
              Navegação
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/vitrine"
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

          {/* Coluna 3 — Institucional */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-inverse-primary">
              Institucional
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <span className="text-sm text-inverse-on-surface/70 cursor-default">
                  Sobre Nós
                </span>
              </li>
              <li>
                <span className="text-sm text-inverse-on-surface/70 cursor-default">
                  Termos de Uso
                </span>
              </li>
              <li>
                <span className="text-sm text-inverse-on-surface/70 cursor-default">
                  Política de Privacidade
                </span>
              </li>
              <li>
                <span className="text-sm text-inverse-on-surface/70 cursor-default">
                  FAQ
                </span>
              </li>
            </ul>
          </div>

          {/* Coluna 4 — Contato & Redes */}
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
            </ul>

            {/* Redes Sociais */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com/catalogpe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface/70 transition-all hover:bg-inverse-primary hover:text-inverse-surface"
                aria-label="Site"
              >
                <Globe size={16} />
              </a>
              <a
                href="https://wa.me/5581999990000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface/70 transition-all hover:bg-inverse-primary hover:text-inverse-surface"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Selos de Segurança ── */}
        <div className="mt-12 border-t border-inverse-on-surface/10 pt-8">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-inverse-on-surface/5 px-4 py-2.5">
              <Shield size={18} className="text-inverse-primary" />
              <span className="text-xs font-medium text-inverse-on-surface/70">
                Site Seguro SSL
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-inverse-on-surface/5 px-4 py-2.5">
              <CreditCard size={18} className="text-inverse-primary" />
              <span className="text-xs font-medium text-inverse-on-surface/70">
                Mercado Pago
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-inverse-on-surface/5 px-4 py-2.5">
              <Truck size={18} className="text-inverse-primary" />
              <span className="text-xs font-medium text-inverse-on-surface/70">
                Melhor Envio
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-inverse-on-surface/50">
              © {currentYear} Cata Log. Todos os direitos reservados.
            </p>
            <p className="flex items-center gap-1 text-xs text-inverse-on-surface/50">
              Feito com{' '}
              <Heart
                size={12}
                className="text-tertiary"
                fill="currentColor"
              />{' '}
              em Pernambuco
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
