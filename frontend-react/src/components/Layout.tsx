import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-light text-gray-900 tracking-tight hover:text-gray-700 transition-colors">
                BazarBoost
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/payment"
                className="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 font-light text-sm"
              >
                <CreditCardIcon className="h-4 w-4" />
                <span>Kredi Satın Al</span>
              </Link>
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500 font-light">Kredi</div>
                <div className="text-sm font-light text-gray-900">{user?.credits || 0}</div>
              </div>
              <div className="relative group">
                <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <span className="text-gray-700 font-light text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute right-0 mt-3 w-56 bg-white backdrop-blur-xl rounded-lg border border-gray-200 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-3">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 font-light">
                      {user?.email}
                    </div>
                    <Link
                      to="/dashboard"
                      className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-light"
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {title && (
          <div className="mb-10">
            <h2 className="text-4xl font-light text-gray-900 tracking-tight">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </>
  );
};

