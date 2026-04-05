import { useTranslation } from 'react-i18next';
import { useUIStore } from '../stores/uiStore';
import { Shield } from 'lucide-react';

export default function CookieBanner() {
  const { t } = useTranslation();
  const { cookieConsent, setCookieConsent } = useUIStore();

  if (cookieConsent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container-lowest border-t border-outline-variant/20 shadow-2xl p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-on-surface">{t('gdpr.cookieConsent')}</p>
            <div className="flex gap-4 mt-1">
              <a href="#" className="text-xs text-primary hover:underline">{t('gdpr.privacyPolicy')}</a>
              <a href="#" className="text-xs text-primary hover:underline">{t('gdpr.cookiePolicy')}</a>
              <a href="#" className="text-xs text-primary hover:underline">{t('gdpr.impressum')}</a>
            </div>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setCookieConsent(false)} className="px-5 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
            {t('gdpr.decline')}
          </button>
          <button onClick={() => setCookieConsent(true)} className="px-5 py-2 text-sm font-bold brushed-metal text-white rounded-lg shadow-sm hover:opacity-90 transition-all">
            {t('gdpr.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
