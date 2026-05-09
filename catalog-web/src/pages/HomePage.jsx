import { ArrowRight, Palette, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      {/* ======================== HERO SECTION ======================== */}
      <section className="relative overflow-hidden bg-surface-container-low">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-22 text-center md:py-30">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-dim">
              Artesanato Pernambucano
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Descubra a arte feita{' '}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              à mão
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Conectamos você diretamente aos artesãos de Pernambuco. Peças
            únicas, feitas com amor, entregues na sua porta.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/"
              className="gradient-primary inline-flex items-center gap-2 rounded-md px-8 py-3.5 text-sm font-semibold text-on-primary shadow-ambient transition-all hover:shadow-hover hover:scale-[1.02]"
            >
              Explorar Vitrine
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 rounded-md border border-outline-variant/20 bg-surface-container-lowest px-8 py-3.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container hover:shadow-ambient"
            >
              Criar Conta
            </Link>
          </div>
        </div>

        {/* Decorative gradient orb */}
        <div className="pointer-events-none absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* ======================== FEATURES SECTION ======================== */}
      <section className="bg-surface py-22">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Por que escolher o{' '}
            <span className="text-primary">Cata Log</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-on-surface-variant">
            Uma plataforma pensada para valorizar quem produz e encantar quem
            compra.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-bold">Peças Autênticas</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Cada obra é feita à mão por artesãos verificados. Nada de
                produção em massa — é a cultura viva em cada detalhe.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">Compra Segura</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Pagamento via Mercado Pago com PIX ou cartão. Seus dados
                protegidos do início ao fim.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Truck size={24} />
              </div>
              <h3 className="text-lg font-bold">Entrega Rastreada</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Cotação automática de frete via Melhor Envio. Acompanhe cada
                etapa até a sua porta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA SECTION ======================== */}
      <section className="bg-surface-container-low py-22">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Pronto para descobrir obras únicas?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-on-surface-variant">
            Navegue pela vitrine, encontre a peça perfeita e apoie
            diretamente quem faz arte com as mãos.
          </p>
          <Link
            to="/"
            className="gradient-primary mt-10 inline-flex items-center gap-2 rounded-md px-8 py-3.5 text-sm font-semibold text-on-primary shadow-ambient transition-all hover:shadow-hover hover:scale-[1.02]"
          >
            Ver Vitrine Completa
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
