import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  SparklesIcon, 
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Name - No Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-light text-white tracking-tight hover:text-white/80 transition-colors">
              BazarBoost
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="text-white/70 hover:text-white font-light text-sm tracking-wide transition-colors"
            >
              Ana Sayfa
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white/70 hover:text-white font-light text-sm tracking-wide transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/payment"
                  className="text-white/70 hover:text-white font-light text-sm tracking-wide transition-colors"
                >
                  Paketler
                </Link>
                <div className="flex items-center space-x-6 pl-6 border-l border-white/10">
                  <div className="text-right">
                    <div className="text-xs text-white/50 font-light">Kredi</div>
                    <div className="text-sm font-light text-white">{user?.credits || 0}</div>
                  </div>
                  <div className="relative group">
                    <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors">
                      <span className="text-white font-light text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute right-0 mt-3 w-56 bg-black/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="p-3">
                        <div className="px-4 py-3 text-sm text-white/80 border-b border-white/10 font-light">
                          {user?.email}
                        </div>
                        <Link
                          to="/dashboard"
                          className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg flex items-center space-x-3 transition-colors"
                        >
                          <SparklesIcon className="h-4 w-4" />
                          <span className="font-light">Dashboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center space-x-3 mt-1 transition-colors"
                        >
                          <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                          <span className="font-light">Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white font-light text-sm tracking-wide transition-colors"
                >
                  Giriş
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-white text-black hover:bg-gray-100 transition-all font-light text-sm tracking-wide"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {user ? (
              <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white font-light text-xs">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 transition-all font-light text-xs"
              >
                Giriş
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
