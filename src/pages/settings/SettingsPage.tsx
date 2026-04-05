import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { Save, Globe, Bell, Palette, Building, User } from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [lang, setLang] = useState(user?.language || 'tr');
  const [region, setRegion] = useState(user?.region || 'EU');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'DD.MM.YYYY');
  const [notifs, setNotifs] = useState(user?.notifications || { email: true, push: true, projectUpdates: true, bomChanges: true });

  const handleSave = () => {
    updateProfile({ language: lang, region, currency, dateFormat, notifications: notifs });
    i18n.changeLanguage(lang);
    (window as any).__2mc_lang = lang;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: t('settings.userProfile'), icon: User },
    { id: 'company', label: t('settings.companyInfo'), icon: Building },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'language', label: t('settings.languageRegion'), icon: Globe },
    { id: 'theme', label: t('settings.themePreference'), icon: Palette },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">{t('settings.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary-fixed-dim/20 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm p-8 border border-outline-variant/10">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-headline font-bold text-primary uppercase tracking-wider text-sm">{t('settings.userProfile')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('auth.fullName')}</label>
                  <input defaultValue={user?.fullName} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('common.email')}</label>
                  <input defaultValue={user?.email} type="email" className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('common.phone')}</label>
                  <input defaultValue={user?.phone} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('common.address')}</label>
                  <input defaultValue={user?.address} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="font-headline font-bold text-primary uppercase tracking-wider text-sm">{t('settings.companyInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('common.company')}</label>
                  <input defaultValue={user?.company} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('auth.taxId')}</label>
                  <input defaultValue={user?.taxId} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="font-headline font-bold text-primary uppercase tracking-wider text-sm">{t('settings.notifications')}</h2>
              {[
                { key: 'email', label: t('settings.emailNotifications') },
                { key: 'push', label: t('settings.pushNotifications') },
                { key: 'projectUpdates', label: t('settings.projectUpdates') },
                { key: 'bomChanges', label: t('settings.bomChanges') },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between py-3 border-b border-outline-variant/10">
                  <span className="text-sm font-medium">{item.label}</span>
                  <button
                    onClick={() => setNotifs({ ...notifs, [item.key]: !(notifs as any)[item.key] })}
                    className={`w-12 h-6 rounded-full transition-colors ${(notifs as any)[item.key] ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${(notifs as any)[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6">
              <h2 className="font-headline font-bold text-primary uppercase tracking-wider text-sm">{t('settings.languageRegion')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('common.language')}</label>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('settings.region')}</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="EU">Avrupa Birliği</option>
                    <option value="TR">Türkiye</option>
                    <option value="US">ABD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('settings.currency')}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{t('settings.dateFormat')}</label>
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="font-headline font-bold text-primary uppercase tracking-wider text-sm">{t('settings.themePreference')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-xl border-2 border-primary bg-white text-center">
                  <div className="w-full h-20 bg-surface-container rounded-lg mb-3" />
                  <span className="text-sm font-bold">{t('common.lightMode')}</span>
                </button>
                <button className="p-6 rounded-xl border-2 border-outline-variant/20 bg-white text-center hover:border-primary/50 transition-colors">
                  <div className="w-full h-20 bg-slate-800 rounded-lg mb-3" />
                  <span className="text-sm font-bold text-on-surface-variant">{t('common.darkMode')}</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-end">
            {saved && <span className="text-emerald-600 text-sm font-medium mr-4 self-center">Kaydedildi!</span>}
            <button onClick={handleSave} className="flex items-center gap-2 brushed-metal text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all">
              <Save size={18} /> {t('settings.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
