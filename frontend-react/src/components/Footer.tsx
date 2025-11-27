import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-light text-white">BazarBoost</span>
            </div>
            <p className="text-white/40 mb-4 max-w-md font-light">
              E-ticaret ürünleriniz için yapay zeka destekli SEO optimizasyonu. 
              Daha fazla görünürlük, daha fazla satış.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-light mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors font-light">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors font-light">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/payment" className="hover:text-white transition-colors font-light">
                  Paketler
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-light mb-4">Hesap</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-white transition-colors font-light">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors font-light">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40 font-light">
          <p>&copy; {currentYear} BazarBoost. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

