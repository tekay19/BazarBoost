import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { seoService } from '../services/api';
import type { SEOOptimizeResponse } from '../services/api';
import { SparklesIcon, DocumentTextIcon, TagIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const Dashboard = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOOptimizeResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await seoService.optimize({
        title,
        description: description || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Optimizasyon başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20">
        <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <SparklesIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Ürün Optimizasyonu</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ürün Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="Örn: Kablosuz Bluetooth Kulaklık"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">{title.length}/500 karakter</p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mevcut Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Ürün özelliklerini ve mevcut açıklamayı buraya ekleyin..."
                    maxLength={5000}
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/5000 karakter</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Optimize ediliyor...
                    </span>
                  ) : (
                    'Optimize Et 🚀'
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Optimizasyon Sonuçları</h3>
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-primary-600" />
                    <span className="text-2xl font-bold text-primary-600">{result.seo_score}</span>
                    <span className="text-gray-500">/100</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Optimize Edilmiş Başlık
                    </label>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <p className="text-gray-900">{result.optimized_title}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.optimized_title)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      📋 Kopyala
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Optimize Edilmiş Açıklama
                    </label>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{result.optimized_description}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.optimized_description)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      📋 Kopyala
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <TagIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Anahtar Kelimeler
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hesap Bilgileri</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <div className="font-semibold text-gray-900">{user?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Plan</div>
                  <div className="font-semibold text-primary-600">{user?.plan || 'Free'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Kredi Bakiyesi</div>
                  <div className="text-2xl font-bold text-primary-600">{user?.credits || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">💡 İpucu</h3>
              <p className="text-sm text-white/90 mb-4">
                Daha iyi sonuçlar için ürün özelliklerini ve teknik detayları açıklamaya ekleyin.
              </p>
            </div>

            {(user?.credits || 0) < 5 && (
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Krediniz Azalıyor!</h3>
                    <p className="text-sm text-white/90">
                      Daha fazla optimizasyon için kredi satın alın.
                    </p>
                  </div>
                  <Link
                    to="/payment"
                    className="flex items-center space-x-2 px-4 py-2 bg-white text-accent-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    <span>Satın Al</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        </Layout>
      </div>
    </div>
  );
};

