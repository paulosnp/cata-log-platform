import { useState } from 'react';
import { MapPin, Truck, Loader2 } from 'lucide-react';
import { logisticaService } from '../../services/logisticaService';

/**
 * Formata CEP com máscara XXXXX-XXX.
 */
const formatCep = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

/**
 * Formata preço para BRL.
 */
const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * FreightCalculator — Formulário de cotação de frete embutido.
 *
 * Props:
 *   onFreteSelected — callback quando usuário seleciona uma opção de frete
 *   cartItems — itens do carrinho (para estimar dimensões)
 */
export default function FreightCalculator({ onFreteSelected, cartItems = [] }) {
  const [cep, setCep] = useState('');
  const [opcoes, setOpcoes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    // Reset ao mudar CEP
    if (opcoes.length > 0) {
      setOpcoes([]);
      setSelected(null);
      onFreteSelected?.(null);
    }
  };

  const handleCalcular = async (e) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    setOpcoes([]);
    setSelected(null);

    try {
      // Para o MVP, usamos dimensões padrão estimadas
      const res = await logisticaService.cotarFrete({
        cepOrigem: '50010000', // CEP base de Recife (MVP)
        cepDestino: cleanCep,
        peso: 0.5,        // 500g padrão
        altura: 10,        // 10cm
        largura: 15,       // 15cm
        comprimento: 20,   // 20cm
      });
      setOpcoes(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        'Não foi possível calcular o frete. Verifique o CEP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (opcao) => {
    setSelected(opcao.id);
    onFreteSelected?.(opcao);
  };

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Truck size={16} className="text-primary" />
        Calcular Frete
      </h3>

      {/* Input CEP */}
      <form onSubmit={handleCalcular} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-2.5 pl-9 pr-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || cep.replace(/\D/g, '').length < 8}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            'Calcular'
          )}
        </button>
      </form>

      {/* Erro */}
      {error && (
        <p className="mt-2 text-xs text-tertiary">{error}</p>
      )}

      {/* Opções de frete */}
      {opcoes.length > 0 && (
        <div className="mt-4 space-y-2">
          {opcoes.map((opcao) => (
            <button
              key={opcao.id}
              onClick={() => handleSelect(opcao)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                selected === opcao.id
                  ? 'border-primary bg-primary-fixed/30'
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-on-surface">{opcao.nome}</p>
                <p className="text-xs text-on-surface-variant">
                  Até {opcao.prazoDias} dias úteis
                </p>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatPrice(opcao.valor)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
