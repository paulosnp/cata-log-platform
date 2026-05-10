import { useNavigate } from 'react-router-dom';
import {
  Palette,
  BookOpen,
  Scissors,
  TreePine,
  Briefcase,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Cerâmica e Barro': Palette,
  'Xilogravura e Cordel': BookOpen,
  'Rendas e Bordados': Scissors,
  'Entalhe em Madeira': TreePine,
  'Arte em Couro': Briefcase,
};

export default function CategoryShowcase({ categorias = [], loading = false }) {
  const navigate = useNavigate();

  if (!loading && categorias.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold font-headline md:text-2xl">
            Explore por Categoria
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Encontre peças do seu estilo
          </p>
        </div>
        <button
          onClick={() => navigate('/vitrine')}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dim sm:inline-flex"
        >
          Ver todas
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 py-2 pb-4" style={{ scrollbarWidth: 'none' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex w-40 shrink-0 animate-pulse flex-col items-center gap-3 rounded-xl bg-surface-container-low p-6"
            >
              <div className="h-14 w-14 rounded-full bg-surface-container" />
              <div className="h-3 w-20 rounded bg-surface-container" />
            </div>
          ))}
        </div>
      ) : (
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 py-2 pb-4" style={{ scrollbarWidth: 'none' }}>
          {categorias.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.nome] || Sparkles;

            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/vitrine?categoria=${cat.id}`)}
                className="group flex w-40 shrink-0 flex-col items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-hover hover:scale-[1.03]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <Icon size={24} />
                </div>
                <span className="text-center text-xs font-semibold leading-tight text-on-surface">
                  {cat.nome}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
