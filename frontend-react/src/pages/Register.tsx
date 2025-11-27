import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { LockClosedIcon, EnvelopeIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

type Step = 'email' | 'code' | 'password';

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const levels = [
      { label: 'Çok Zayıf', color: 'bg-red-500' },
      { label: 'Zayıf', color: 'bg-orange-500' },
      { label: 'Orta', color: 'bg-yellow-500' },
      { label: 'İyi', color: 'bg-blue-500' },
      { label: 'Güçlü', color: 'bg-green-500' },
    ];

    return {
      strength: Math.min(strength, 5),
      label: levels[Math.min(strength - 1, 4)]?.label || 'Çok Zayıf',
      color: levels[Math.min(strength - 1, 4)]?.color || 'bg-red-500',
    };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.sendVerificationCode(email);
      setStep('code');
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyCode(email, code);
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Doğrulama kodu geçersiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      await registerAuth(email, password, code);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-3 tracking-tight">Hesap Oluştur</h2>
          <p className="text-lg text-gray-500 font-light">BazarBoost'a katılın</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === 'email' ? 'text-primary-600' : step === 'code' || step === 'password' ? 'text-green-600' : 'text-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'email' ? 'border-primary-600 bg-primary-50' : step === 'code' || step === 'password' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                  {step === 'code' || step === 'password' ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-light">E-posta</span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'code' || step === 'password' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${step === 'code' ? 'text-primary-600' : step === 'password' ? 'text-green-600' : 'text-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'code' ? 'border-primary-600 bg-primary-50' : step === 'password' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                  {step === 'password' ? <CheckCircleIcon className="w-5 h-5" /> : '2'}
                </div>
                <span className="ml-2 text-sm font-light">Kod</span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'password' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${step === 'password' ? 'text-primary-600' : 'text-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'password' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-light">Şifre</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-2">
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : (
                  <>
                    Doğrulama Kodu Gönder
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin
                </p>
                {countdown > 0 && (
                  <p className="text-xs text-gray-500">
                    Yeni kod için {countdown} saniye bekleyin
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-light text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Doğrula
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>

              {countdown === 0 && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-sm text-primary-600 hover:text-primary-700 font-light w-full"
                >
                  Kodu tekrar gönder
                </button>
              )}
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-light text-gray-700 mb-2">
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
                    placeholder="En az 8 karakter"
                    minLength={8}
                  />
                </div>
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-light text-gray-600">Şifre Gücü:</span>
                      <span className={`text-xs font-light ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-light text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Şifreler eşleşiyor
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('code');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kayıt olunuyor...
                    </span>
                  ) : (
                    <>
                      Kayıt Ol
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-light">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
