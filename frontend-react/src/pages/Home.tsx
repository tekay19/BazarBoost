import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Fullscreen */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-black to-accent-900/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-light mb-6 tracking-tight animate-fade-in">
            BazarBoost
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 font-light animate-slide-up">
            E-ticaret için AI destekli SEO
          </p>
          <Link
            to="/register"
            className="inline-flex items-center text-xl px-12 py-4 bg-white text-black hover:bg-gray-100 transition-all duration-300 font-light tracking-wide"
          >
            Başla
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Feature 1 - Fullscreen */}
      <section className="h-screen flex items-center relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80" 
            alt="AI SEO" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <div className="text-6xl md:text-8xl font-light mb-8">AI Optimizasyon</div>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
              GPT-4o ile güçlendirilmiş yapay zeka, ürünlerinizi saniyeler içinde optimize eder.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg backdrop-blur-sm border border-white/10 p-12 flex items-center justify-center">
              <SparklesIcon className="w-32 h-32 text-primary-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2 - Fullscreen */}
      <section className="h-screen flex items-center relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80" 
            alt="Analytics" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-lg backdrop-blur-sm border border-white/10 p-12 flex items-center justify-center">
              <ChartBarIcon className="w-32 h-32 text-accent-400" />
            </div>
          </div>
          <div className="text-white order-1 lg:order-2">
            <div className="text-6xl md:text-8xl font-light mb-8">SEO Skoru</div>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
              Her optimizasyon için detaylı analiz ve performans skoru.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 3 - Fullscreen */}
      <section className="h-screen flex items-center relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920&q=80" 
            alt="Speed" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <div className="text-6xl md:text-8xl font-light mb-8">Hızlı</div>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
              Saniyeler içinde profesyonel SEO optimizasyonu.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg backdrop-blur-sm border border-white/10 p-12 flex items-center justify-center">
              <BoltIcon className="w-32 h-32 text-primary-400" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Fullscreen */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80" 
            alt="CTA" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="text-6xl md:text-8xl font-light mb-8">Başla</div>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light">
            Ücretsiz hesap oluştur, ilk optimizasyonunu yap.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center text-xl px-12 py-4 bg-white text-black hover:bg-gray-100 transition-all duration-300 font-light tracking-wide"
          >
            Kayıt Ol
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};
