import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './tr.json';
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import nl from './nl.json';

const savedLang = typeof window !== 'undefined' ? (window as any).__2mc_lang || 'tr' : 'tr';

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    nl: { translation: nl },
  },
  lng: savedLang,
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
