import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
        config: err.config
      });
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', '));
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError(err.response.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
      } else if (err.request) {
        // Request made but no response - Backend çalışmıyor olabilir
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (http://localhost:8000)');
        } else {
          setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        }
      } else {
        // Something else happened
        setError(err.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-light text-gray-900 mb-3 tracking-tight">Hoş Geldiniz</h2>
          <p className="text-lg text-gray-500 font-light">BazarBoost'a giriş yapın</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-lg max-w-md w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

