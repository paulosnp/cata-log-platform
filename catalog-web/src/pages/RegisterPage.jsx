import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Sparkles, CheckCircle, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [step, setStep] = useState('register'); // 'register', 'verify'
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail inválido.';

    if (!form.senha) newErrors.senha = 'Senha é obrigatória.';
    else if (form.senha.length < 6) newErrors.senha = 'Mínimo de 6 caracteres.';

    if (form.senha !== form.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });

      setStep('verify');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.mensagem || err.response?.data?.message;

      if (status === 409) {
        setGlobalError('Este e-mail já está cadastrado.');
      } else if (status === 400 && message) {
        setGlobalError(message);
      } else {
        setGlobalError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setPinError(false);

    if (pin.length !== 6) {
      setPinError(true);
      return;
    }

    setLoading(true);
    try {
      await authService.verificarCadastro(form.email.trim(), pin);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      setGlobalError(message || 'Código inválido ou expirado.');
      setPinError(true);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    setGlobalError('');
    try {
      await authService.reenviarVerificacao(form.email.trim());
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
      setGlobalError(message || 'Erro ao reenviar código. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  // Tela de sucesso
  if (success) {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline">Conta ativada!</h1>
          <p className="mt-3 text-on-surface-variant">
            Sua conta foi ativada com sucesso. Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-80px)]">
      {/* Coluna Hero — Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-surface-container-low p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-dim">
              Junte-se a nós
            </span>
          </div>

          <h1 className="text-4xl font-bold font-headline leading-tight">
            Crie sua conta e apoie o{' '}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              artesanato local
            </span>
          </h1>

          <p className="mt-6 text-on-surface-variant leading-relaxed">
            Com sua conta você pode comprar peças únicas, acompanhar pedidos,
            salvar favoritos e encomendar peças personalizadas.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Compra segura via Mercado Pago',
              'Acompanhe seus pedidos em tempo real',
              'Encomende peças exclusivas',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-on-surface-variant">
                <CheckCircle size={16} className="text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Orbs decorativos */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
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
              {step === 'register' ? 'Crie sua conta de comprador' : 'Confirme seu cadastro'}
            </p>
          </div>

          {/* Erro global */}
          {globalError && (
            <div className="mb-6 rounded-md bg-error-container/30 px-4 py-3 text-sm text-tertiary">
              {globalError}
            </div>
          )}

          {/* ─── STEP: REGISTER ─── */}
          {step === 'register' && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="Maria da Silva"
                  icon={User}
                  value={form.nome}
                  onChange={handleChange('nome')}
                  error={errors.nome}
                  required
                  autoComplete="name"
                />

                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  icon={Mail}
                  value={form.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  icon={Lock}
                  value={form.senha}
                  onChange={handleChange('senha')}
                  error={errors.senha}
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="Repita a senha"
                  icon={Lock}
                  value={form.confirmarSenha}
                  onChange={handleChange('confirmarSenha')}
                  error={errors.confirmarSenha}
                  required
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  icon={ArrowRight}
                  className="mt-2"
                >
                  Criar Conta
                </Button>
              </form>

              <p className="mt-8 text-center lg:text-left text-sm text-on-surface-variant">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary-dim transition-colors"
                >
                  Entrar
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
                  Enviamos um código de confirmação de 6 dígitos para{' '}
                  <span className="font-semibold text-on-surface">{maskEmail(form.email)}</span>
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

              {/* Back to register */}
              <p className="mt-4 text-center lg:text-left text-sm text-on-surface-variant">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setPin('');
                    setGlobalError('');
                    setPinError(false);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dim transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Corrigir e-mail
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
