import { useState } from 'react';
import { Layout } from '../components/Layout';
import { paymentService } from '../services/api';
import type { PaymentCreateResponse } from '../services/api';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const PACKAGES = [
  { id: 1, credits: 10, amount: 49, label: 'Başlangıç Paketi' },
  { id: 2, credits: 50, amount: 149, label: 'Profesyonel Paket' },
  { id: 3, credits: 200, amount: 399, label: 'Kurumsal Paket' },
];

export const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async (packageId: number) => {
    setError('');
    setLoading(true);

    try {
      const response: PaymentCreateResponse = await paymentService.createSession({
        package_id: packageId,
      });
      
      // Redirect to payment URL
      window.location.href = response.checkout_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ödeme oturumu oluşturulamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20">
        <Layout title="Kredi Paketleri">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Kredi Paketleri</h2>
          <p className="text-lg text-gray-600">İhtiyacınıza uygun paketi seçin</p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm relative hover:shadow-xl hover:border-gray-300 transition-all duration-300"
            >

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full mb-4">
                  <CreditCardIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.label}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {pkg.credits}
                </div>
                <div className="text-sm text-gray-500">Kredi</div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    ₺{pkg.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ₺{(pkg.amount / pkg.credits).toFixed(2)} / kredi
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yönlendiriliyor...
                  </span>
                ) : (
                  'Satın Al'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border border-gray-200 p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Nasıl Çalışır?</h3>
            <p className="text-gray-600 text-sm">
              Paketi seçtikten sonra ödeme sayfasına yönlendirileceksiniz. Ödeme tamamlandıktan sonra kredileriniz hesabınıza otomatik olarak eklenecektir.
            </p>
          </div>
        </div>
      </div>
        </Layout>
      </div>
    </div>
  );
};

