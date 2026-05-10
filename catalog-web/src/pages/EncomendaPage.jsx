import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Hammer, PackageOpen } from 'lucide-react';
import { encomendaService } from '../services/encomendaService';
import { useToast } from '../components/common/Toast';
import EncomendaCard from '../components/encomenda/EncomendaCard';
import Spinner from '../components/common/Spinner';

export default function EncomendaPage() {
  const { addToast } = useToast();
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aceitandoId, setAceitandoId] = useState(null);

  const carregarEncomendas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await encomendaService.listarMinhas();
      setEncomendas(res.data.content);
    } catch (err) {
      console.error('Erro ao carregar encomendas:', err);
      addToast('Erro ao carregar encomendas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarEncomendas();
  }, [carregarEncomendas]);

  const handleAceitar = async (id) => {
    setAceitandoId(id);
    try {
      await encomendaService.aceitar(id);
      addToast('Orçamento aceito! O artesão começará a produção.', 'success');
      carregarEncomendas();
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        'Erro ao aceitar encomenda.';
      addToast(msg, 'error');
    } finally {
      setAceitandoId(null);
    }
  };

  return (
    <div className="min-h-[70vh] bg-surface py-10 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Hammer size={20} className="text-primary" />
            <h1 className="text-3xl font-bold font-headline md:text-4xl">
              Minhas Encomendas
            </h1>
          </div>
          <p className="text-on-surface-variant">
            Acompanhe o status das suas peças sob medida.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : encomendas.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-surface-container-low p-4">
              <PackageOpen size={40} className="text-outline" />
            </div>
            <h3 className="text-lg font-semibold font-headline">
              Nenhuma encomenda ainda
            </h3>
            <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
              Navegue pela vitrine e encomende uma peça sob medida diretamente
              com o artesão.
            </p>
            <Link
              to="/vitrine"
              className="mt-6 rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
            >
              Explorar Vitrine
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {encomendas.map((enc) => (
              <EncomendaCard
                key={enc.id}
                encomenda={enc}
                onAceitar={handleAceitar}
                aceitando={aceitandoId === enc.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
