import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    taxId: '',
    sector: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password || !form.company) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    const success = await register(form);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary uppercase tracking-wider font-headline">2MC Gastro</h1>
          <p className="text-on-surface-variant mt-2 font-medium">{t('brand.tagline')}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-lg p-8 border border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-6">{t('auth.register')}</h2>

          {error && (
            <div className="bg-error-container text-error px-4 py-3 rounded-lg mb-4 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('auth.fullName')} *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('common.email')} *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('auth.companyName')} *</label>
              <input name="company" value={form.company} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('auth.taxId')}</label>
                <input name="taxId" value={form.taxId} onChange={handleChange} placeholder="DE123456789" className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('auth.sector')}</label>
                <select name="sector" value={form.sector} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Seçiniz</option>
                  <option value="restaurant">Restoran</option>
                  <option value="hotel">Otel</option>
                  <option value="catering">Catering</option>
                  <option value="hospital">Hastane</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('common.password')} *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('auth.confirmPassword')} *</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full brushed-metal text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  {t('auth.register')}
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
