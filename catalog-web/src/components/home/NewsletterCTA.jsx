import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="my-12 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-surface-container-low to-primary-fixed/20">
      <div className="flex flex-col items-center px-8 py-14 text-center md:py-16">
        <div className="mb-5 inline-flex items-center justify-center rounded-full bg-primary-fixed p-3">
          <Mail size={24} className="text-primary" />
        </div>

        <h2 className="text-2xl font-bold font-headline md:text-3xl">
          Fique por dentro das novidades
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Receba em primeira mão as novas peças dos nossos artesãos,
          promoções exclusivas e histórias do artesanato pernambucano.
        </p>

        {submitted ? (
          <div className="mt-8 flex items-center gap-2 rounded-full bg-green-100 px-6 py-3 text-sm font-semibold text-green-700">
            ✓ Inscrição realizada com sucesso!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 rounded-full bg-surface-container-lowest px-5 py-3 text-sm text-on-surface placeholder:text-outline shadow-sm transition-all focus:shadow-ambient focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all hover:bg-primary-dim hover:shadow-ambient"
            >
              Inscrever-se
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
