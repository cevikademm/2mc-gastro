import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Geçersiz e-posta veya şifre');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary uppercase tracking-wider font-headline">2MC Gastro</h1>
          <p className="text-on-surface-variant mt-2 font-medium">{t('brand.tagline')}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-lg p-8 border border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-6">{t('auth.login')}</h2>

          {error && (
            <div className="bg-error-container text-error px-4 py-3 rounded-lg mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {t('common.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {t('common.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" />
                <span className="text-sm text-on-surface-variant">{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full brushed-metal text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  {t('auth.login')}
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
