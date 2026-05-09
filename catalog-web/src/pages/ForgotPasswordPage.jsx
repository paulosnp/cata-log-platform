import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import logoSvg from '../assets/logo.svg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    setLoading(true);

    try {
      await authService.esqueciSenha(email.trim());
      setSent(true);
    } catch (err) {
      const message = err.response?.data?.mensagem || err.response?.data?.message;
      setError(message || 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline">E-mail enviado!</h1>
          <p className="mt-3 text-on-surface-variant">
            Se o e-mail estiver cadastrado, você receberá um PIN de recuperação.
            Verifique sua caixa de entrada e spam.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center">
              <img src={logoSvg} alt="Cata Log" className="h-14 w-auto" />
            </Link>
          <h1 className="mt-4 text-xl font-bold font-headline">Esqueceu a senha?</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Informe seu e-mail e enviaremos um PIN de recuperação.
          </p>
        </div>

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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
          >
            Enviar PIN
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
      </div>
    </div>
  );
}
