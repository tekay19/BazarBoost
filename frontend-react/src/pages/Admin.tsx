import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import type { User } from '../services/api';
import { UserIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];

export const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      setError('Bu sayfaya erişim yetkiniz yok.');
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const response = await adminService.listUsers();
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return;

    setAddingCredits(true);
    setError('');

    try {
      await adminService.addCredits(selectedUser, parseInt(creditAmount));
      await loadUsers();
      setSelectedUser(null);
      setCreditAmount('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kredi eklenemedi.');
    } finally {
      setAddingCredits(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20">
        <Layout title="Admin Paneli">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Add Credits Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2 text-primary-600" />
            Kredi Ekle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kullanıcı Seç
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input-field"
              >
                <option value="">Kullanıcı seçin...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.credits || 0} kredi)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kredi Miktarı
              </label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="input-field"
                placeholder="100"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddCredits}
                disabled={!selectedUser || !creditAmount || addingCredits}
                className="btn-primary w-full"
              >
                {addingCredits ? 'Ekleniyor...' : 'Kredi Ekle'}
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
              Kullanıcılar ({filteredUsers.length})
            </h2>
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="E-posta ile ara..."
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kredi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {u.plan || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary-600">{u.credits || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Kullanıcı bulunamadı.
                </div>
              )}
            </div>
          )}
        </div>
        </Layout>
      </div>
    </div>
  );
};

