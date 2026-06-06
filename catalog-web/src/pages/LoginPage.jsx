import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PinInput from '../components/common/PinInput';
import { authService } from '../services/authService';
import logoSvg from '../assets/logo.svg';

function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const maskedUser = user[0] + '***';
  const [domainName, ...ext] = domain.split('.');
  const maskedDomain = domainName[0] + '***';
  return `${maskedUser}@${maskedDomain}.${ext.join('.')}`;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState('login'); // 'login', 'verify', 'success'
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona para onde o user tentou ir, ou para a home
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (step === 'verify') {
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

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

      if (status === 403 && (message?.toLowerCase().includes('verificação') || message?.toLowerCase().includes('verificar'))) {
        setStep('verify');
      } else if (status === 401 || status === 403) {
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

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError('');
    setPinError(false);

    if (pin.length !== 6) {
      setPinError(true);
      return;
    }

    setLoading(true);
    try {
      await authService.verificarCadastro(email.trim(), pin);
      setStep('success');
      try {
        await login(email.trim(), senha);
        navigate(from, { replace: true });
      } catch {
        setStep('login');
        setPin('');
        setError('Conta ativada com sucesso! Digite sua senha para entrar.');
      }
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      setError(message || 'Código inválido ou expirado.');
      setPinError(true);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    setError('');
    try {
      await authService.reenviarVerificacao(email.trim());
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      setError(message || 'Erro ao reenviar código. Tente novamente.');
    } finally {
      setResending(false);
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
              {step === 'login' ? 'Entre na sua conta de comprador' : 'Confirme seu cadastro'}
            </p>
          </div>

          {/* Erro global */}
          {error && (
            <div className="mb-6 rounded-md bg-error-container/30 px-4 py-3 text-sm text-tertiary">
              {error}
            </div>
          )}

          {/* ─── STEP: LOGIN ─── */}
          {step === 'login' && (
            <>
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
            </>
          )}

          {/* ─── STEP: VERIFY ─── */}
          {step === 'verify' && (
            <>
              <div className="mb-6 text-center lg:text-left">
                <div className="mx-auto lg:mx-0 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40">
                  <ShieldCheck size={22} className="text-primary" />
                </div>
                <h1 className="text-xl font-bold font-headline">Verifique seu e-mail</h1>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Sua conta ainda não foi ativada. Enviamos um novo código de confirmação de 6 dígitos para{' '}
                  <span className="font-semibold text-on-surface">{maskEmail(email)}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="flex flex-col gap-6">
                <PinInput
                  value={pin}
                  onChange={(newPin) => {
                    setPin(newPin);
                    setPinError(false);
                  }}
                  error={pinError}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={pin.length !== 6}
                  icon={ArrowRight}
                >
                  Verificar Código
                </Button>
              </form>

              {/* Resend */}
              <div className="mt-5 text-center lg:text-left">
                <p className="text-sm text-on-surface-variant">
                  Não recebeu?{' '}
                  <button
                    type="button"
                    onClick={handleResendPin}
                    disabled={resendTimer > 0 || resending}
                    className={`font-semibold transition-colors ${
                      resendTimer > 0 || resending
                        ? 'text-outline cursor-not-allowed'
                        : 'text-primary hover:text-primary-dim cursor-pointer'
                    }`}
                  >
                    {resending ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCw size={12} className="animate-spin" />
                        Reenviando...
                      </span>
                    ) : resendTimer > 0 ? (
                      `Reenviar código (${resendTimer}s)`
                    ) : (
                      'Reenviar código'
                    )}
                  </button>
                </p>
              </div>

              {/* Back to login form */}
              <p className="mt-4 text-center lg:text-left text-sm text-on-surface-variant">
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setPin('');
                    setError('');
                    setPinError(false);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dim transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Voltar para o login
                </button>
              </p>
            </>
          )}

          {/* ─── STEP: SUCCESS ─── */}
          {step === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold font-headline">Conta ativada!</h1>
              <p className="mt-3 text-on-surface-variant">
                E-mail verificado com sucesso. Entrando na plataforma...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
