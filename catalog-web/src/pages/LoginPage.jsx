import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import logoSvg from '../assets/logo.svg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona para onde o user tentou ir, ou para a home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !senha) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, senha);

      // Se o backend sinalizar senha temporária, redireciona (futuro)
      if (data.senhaTemporaria) {
        navigate('/trocar-senha', { replace: true });
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.mensagem || err.response?.data?.message;

      if (status === 401 || status === 403) {
        setError('E-mail ou senha incorretos.');
      } else if (status === 409) {
        setError('Conta bloqueada. Entre em contato com o suporte.');
      } else if (message) {
        setError(message);
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-80px)]">
      {/* Coluna Hero — Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-surface-container-low p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-dim">
              Bem-vindo de volta
            </span>
          </div>

          <h1 className="text-4xl font-bold font-headline leading-tight">
            Descubra peças{' '}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              feitas à mão
            </span>{' '}
            por artesãos de Pernambuco
          </h1>

          <p className="mt-6 text-on-surface-variant leading-relaxed">
            Acesse sua conta para acompanhar pedidos, salvar favoritos e
            encomendar peças exclusivas diretamente com artesãos verificados.
          </p>
        </div>

        {/* Orb decorativo */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-fixed blur-3xl opacity-50" />
      </div>

      {/* Coluna Formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center">
              <img src={logoSvg} alt="Cata Log" className="h-14 w-auto" />
            </Link>
            <p className="mt-2 text-sm text-on-surface-variant">
              Entre na sua conta de comprador
            </p>
          </div>

          {/* Erro global */}
          {error && (
            <div className="mb-6 rounded-md bg-error-container/30 px-4 py-3 text-sm text-tertiary">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to="/esqueci-senha"
                className="text-xs font-medium text-primary hover:text-primary-dim transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
            >
              Entrar
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Não tem uma conta?{' '}
            <Link
              to="/registro"
              className="font-semibold text-primary hover:text-primary-dim transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
