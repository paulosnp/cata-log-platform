import { useState, useEffect } from 'react';
import { Palette, ShieldCheck, Truck } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import HeroBanner from '../components/home/HeroBanner';
import CategoryShowcase from '../components/home/CategoryShowcase';
import ProductCarousel from '../components/common/ProductCarousel';
import NewsletterCTA from '../components/home/NewsletterCTA';

export default function HomePage() {
  const [categorias, setCategorias] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [maisAvaliados, setMaisAvaliados] = useState([]);
  const [promocoes, setPromocoes] = useState([]);

  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingLanc, setLoadingLanc] = useState(true);
  const [loadingAval, setLoadingAval] = useState(true);
  const [loadingPromo, setLoadingPromo] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled([
        categoryService.listarAtivas(),
        productService.getVitrine({ sort: 'criadoEm,desc', size: 10 }),
        productService.getVitrine({ sort: 'notaMedia,desc', size: 10 }),
        productService.getVitrine({ emPromocao: true, size: 10 }),
      ]);

      if (results[0].status === 'fulfilled') setCategorias(results[0].value.data);
      setLoadingCat(false);

      if (results[1].status === 'fulfilled') setLancamentos(results[1].value.data.content);
      setLoadingLanc(false);

      if (results[2].status === 'fulfilled') setMaisAvaliados(results[2].value.data.content);
      setLoadingAval(false);

      if (results[3].status === 'fulfilled') setPromocoes(results[3].value.data.content);
      setLoadingPromo(false);
    };

    load();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <HeroBanner />

      {/* ── Conteúdo Dinâmico ── */}
      <div className="mx-auto max-w-7xl px-6">
        {/* Carrossel: Lançamentos */}
        <ProductCarousel
          title="Lançamentos"
          subtitle="As peças mais recentes dos nossos artesãos"
          products={lancamentos}
          loading={loadingLanc}
          viewAllLink="/vitrine"
        />

        {/* Carrossel: Em Promoção */}
        <ProductCarousel
          title="Em Promoção"
          subtitle="Ofertas imperdíveis por tempo limitado"
          products={promocoes}
          loading={loadingPromo}
          viewAllLink="/vitrine"
        />

        {/* Carrossel: Mais Avaliados */}
        <ProductCarousel
          title="Mais Avaliados"
          subtitle="Peças que encantaram nossos compradores"
          products={maisAvaliados}
          loading={loadingAval}
          viewAllLink="/vitrine"
        />

        {/* Categorias */}
        <CategoryShowcase categorias={categorias} loading={loadingCat} />

        {/* Newsletter */}
        <NewsletterCTA />
      </div>

      {/* ── Features Section ── */}
      <section className="bg-surface py-22">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Por que escolher o{' '}
            <span className="text-primary">Cata Log</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-on-surface-variant">
            Uma plataforma pensada para valorizar quem produz e encantar quem
            compra.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-bold">Peças Autênticas</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Cada obra é feita à mão por artesãos verificados. Nada de
                produção em massa — é a cultura viva em cada detalhe.
              </p>
            </div>

            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">Compra Segura</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Pagamento via Mercado Pago com PIX ou cartão. Seus dados
                protegidos do início ao fim.
              </p>
            </div>

            <div className="group rounded-lg bg-surface-container-lowest p-8 transition-all hover:shadow-ambient">
              <div className="mb-5 inline-flex rounded-md bg-primary-fixed p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Truck size={24} />
              </div>
              <h3 className="text-lg font-bold">Entrega Rastreada</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Cotação automática de frete via Melhor Envio. Acompanhe cada
                etapa até a sua porta.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
