import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Lock,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PinInput from '../components/common/PinInput';
import logoSvg from '../assets/logo.svg';

const STEPS = ['email', 'pin', 'password', 'done'];

const STEP_LABELS = ['E-mail', 'Código', 'Nova Senha'];

function maskEmail(email) {
  const [user, domain] = email.split('@');
  const maskedUser = user[0] + '***';
  const [domainName, ...ext] = domain.split('.');
  const maskedDomain = domainName[0] + '***';
  return `${maskedUser}@${maskedDomain}.${ext.join('.')}`;
}

function Stepper({ currentStep }) {
  const stepIndex = STEPS.indexOf(currentStep);
  const activeIndex = Math.min(stepIndex, 2);

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                  ${isCompleted
                    ? 'bg-primary/20 text-primary'
                    : isActive
                      ? 'bg-primary text-on-primary shadow-ambient'
                      : 'bg-surface-container text-outline'
                  }
                `}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-on-surface-variant' : 'text-outline'
                }`}
              >
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 rounded-full transition-colors duration-300 ${
                  i < activeIndex ? 'bg-primary' : 'bg-outline-variant/30'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (step === 'pin') {
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

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await authService.esqueciSenha(email.trim());
      setStep('pin');
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      setError(message || 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    setError('');
    setPinError(false);

    if (pin.length !== 6) {
      setPinError(true);
      return;
    }

    setStep('password');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.redefinirSenha({
        email: email.trim(),
        pin,
        novaSenha,
      });
      setStep('done');
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      if (message?.toLowerCase().includes('pin') || message?.toLowerCase().includes('código')) {
        setError(message);
        setPinError(true);
        setPin('');
        setStep('pin');
      } else {
        setError(message || 'Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    setError('');
    try {
      await authService.esqueciSenha(email.trim());
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
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPin('');
    setNovaSenha('');
    setConfirmarSenha('');
    setError('');
    setPinError(false);
  };

  const isPasswordValid = novaSenha.length >= 6;
  const isPasswordMatch = novaSenha === confirmarSenha && confirmarSenha.length > 0;
  const canSubmitPassword = isPasswordValid && isPasswordMatch;

  // ─── STEP: DONE ───
  if (step === 'done') {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline">Senha redefinida com sucesso!</h1>
          <p className="mt-3 text-on-surface-variant">
            Sua senha foi atualizada. Faça login com sua nova senha.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={ArrowRight}
            className="mt-8"
            onClick={() => navigate('/login')}
          >
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center">
            <img src={logoSvg} alt="Cata Log" className="h-14 w-auto" />
          </Link>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-md bg-error-container/30 px-4 py-3 text-sm text-tertiary">
            {error}
          </div>
        )}

        {/* ─── STEP: EMAIL ─── */}
        {step === 'email' && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40">
                <Mail size={22} className="text-primary" />
              </div>
              <h1 className="text-xl font-bold font-headline">Esqueceu a senha?</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Informe seu e-mail e enviaremos um código de recuperação.
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col gap-5">
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={ArrowRight}
              >
                Enviar Código
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dim transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </p>
          </>
        )}

        {/* ─── STEP: PIN ─── */}
        {step === 'pin' && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40">
                <ShieldCheck size={22} className="text-primary" />
              </div>
              <h1 className="text-xl font-bold font-headline">Verifique seu e-mail</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Enviamos um código de 6 dígitos para{' '}
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
                disabled={pin.length !== 6}
                icon={ArrowRight}
              >
                Verificar Código
              </Button>
            </form>

            {/* Resend */}
            <div className="mt-5 text-center">
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

            {/* Back to email */}
            <p className="mt-4 text-center text-sm text-on-surface-variant">
              <button
                type="button"
                onClick={handleBackToEmail}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dim transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Usar outro e-mail
              </button>
            </p>
          </>
        )}

        {/* ─── STEP: PASSWORD ─── */}
        {step === 'password' && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40">
                <Lock size={22} className="text-primary" />
              </div>
              <h1 className="text-xl font-bold font-headline">Criar nova senha</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Escolha uma senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                icon={Lock}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
              />

              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Digite novamente"
                icon={Lock}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
              />

              {/* Validation indicators */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {isPasswordValid ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-tertiary" />
                  )}
                  <span className={isPasswordValid ? 'text-green-600' : 'text-on-surface-variant'}>
                    Mínimo 6 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isPasswordMatch ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-tertiary" />
                  )}
                  <span className={isPasswordMatch ? 'text-green-600' : 'text-on-surface-variant'}>
                    Senhas coincidem
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!canSubmitPassword}
                icon={ArrowRight}
              >
                Redefinir Senha
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setPin('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                  setError('');
                }}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dim transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Voltar para o código
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
