import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dim to-primary-container">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10 md:py-14">
        {/* Left — Text Content */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
            <Sparkles size={12} className="text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
              Artesanato Pernambucano
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl" style={{ color: '#ffffff' }}>
            Peças únicas, feitas à mão,
            <br />
            entregues na sua porta.
          </h1>

          <Link
            to="/vitrine"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:scale-[1.03]"
          >
            Explorar Vitrine
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Right — Feature Cards */}
        <div className="relative z-10 hidden gap-3 md:flex">
          <div className="flex w-44 flex-col items-center rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
            <span className="text-3xl font-bold text-white">100%</span>
            <span className="mt-1 text-xs font-medium text-white/80">Artesanal</span>
          </div>
          <div className="flex w-44 flex-col items-center rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
            <span className="text-3xl font-bold text-white">PIX</span>
            <span className="mt-1 text-xs font-medium text-white/80">ou Cartão</span>
          </div>
          <div className="flex w-44 flex-col items-center rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
            <span className="text-3xl font-bold text-white">Frete</span>
            <span className="mt-1 text-xs font-medium text-white/80">Rastreado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
