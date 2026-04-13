import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './tr.json';
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import nl from './nl.json';
import it from './it.json';
import es from './es.json';
import pt from './pt.json';
import pl from './pl.json';
import cs from './cs.json';
import ro from './ro.json';
import el from './el.json';
import sv from './sv.json';
import da from './da.json';
import hu from './hu.json';

const SUPPORTED = ['tr','en','de','fr','nl','it','es','pt','pl','cs','ro','el','sv','da','hu'];

function detectLang(): string {
  if (typeof window === 'undefined') return 'tr';
  try {
    const stored = localStorage.getItem('2mc_lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  const nav = (navigator.language || 'tr').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : 'tr';
}

const savedLang = detectLang();

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    nl: { translation: nl },
    it: { translation: it },
    es: { translation: es },
    pt: { translation: pt },
    pl: { translation: pl },
    cs: { translation: cs },
    ro: { translation: ro },
    el: { translation: el },
    sv: { translation: sv },
    da: { translation: da },
    hu: { translation: hu },
  },
  lng: savedLang,
  fallbackLng: ['en', 'tr'],
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    try { localStorage.setItem('2mc_lang', lng); } catch {}
    try { document.documentElement.lang = lng; } catch {}
  });
  try { document.documentElement.lang = savedLang; } catch {}
}

export default i18n;
