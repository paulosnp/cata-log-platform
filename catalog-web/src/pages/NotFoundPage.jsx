import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold font-headline text-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-on-surface-variant">
        A página que você procura não existe ou foi movida.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient"
        >
          <Home size={16} />
          Ir para Início
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-md border border-outline-variant/20 bg-surface-container-lowest px-6 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>
    </div>
  );
}
