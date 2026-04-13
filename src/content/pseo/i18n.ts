// Localized strings for programmatic SEO pages — DE + EN.
// Kept separate from src/i18n/*.json (which is owned by another workflow).
// Turkish is the default (source of truth in segments.ts / categories.ts).

export type PseoLocale = 'tr' | 'de' | 'en';

export const PSEO_LOCALES: PseoLocale[] = ['tr', 'de', 'en'];

// URL prefix per locale. Turkish is root (no prefix).
export const LOCALE_PREFIX: Record<PseoLocale, string> = {
  tr: '',
  de: '/de',
  en: '/en',
};

// Localized path segments ("sektor" in TR, "branche" in DE, "industry" in EN).
export const PATH_SEGMENTS: Record<PseoLocale, { sector: string; category: string; brand: string }> = {
  tr: { sector: 'sektor', category: 'kategori', brand: 'marka' },
  de: { sector: 'branche', category: 'kategorie', brand: 'marke' },
  en: { sector: 'industry', category: 'category', brand: 'brand' },
};

// Common UI strings used in pSEO page templates.
export const PSEO_UI: Record<PseoLocale, {
  home: string;
  ctaDesign: string;
  ctaCalculator: string;
  ctaCatalog: string;
  ctaFree: string;
  whyUs: string;
  features: string;
  brands: string;
  useCases: string;
  cities: string;
  faq: string;
  priceRange: string;
  readyHeading: (segment: string, city: string) => string;
  readyText: string;
}> = {
  tr: {
    home: 'Ana Sayfa',
    ctaDesign: 'Ücretsiz 3D Mutfak Tasarla',
    ctaCalculator: 'ROI Hesapla',
    ctaCatalog: 'Kataloğu İncele',
    ctaFree: 'Ücretsiz Başla',
    whyUs: 'Neden 2MC Gastro?',
    features: 'Öne Çıkan Özellikler',
    brands: 'Hangi Markalar?',
    useCases: 'Kullanım Alanları',
    cities: 'Hizmet Verdiğimiz Şehirler',
    faq: 'Sıkça Sorulan Sorular',
    priceRange: 'Fiyat aralığı',
    readyHeading: (s, c) => `${c}'da ${s} Mutfağı Kurmaya Hazır mısınız?`,
    readyText:
      'Ücretsiz 3D tasarım stüdyomuzla projenizi birkaç dakika içinde planlayın. 10.000+ ekipman, anahtar teslim kurulum.',
  },
  de: {
    home: 'Startseite',
    ctaDesign: 'Kostenlose 3D-Küche entwerfen',
    ctaCalculator: 'ROI berechnen',
    ctaCatalog: 'Katalog ansehen',
    ctaFree: 'Jetzt starten',
    whyUs: 'Warum 2MC Gastro?',
    features: 'Hauptmerkmale',
    brands: 'Welche Marken?',
    useCases: 'Anwendungsbereiche',
    cities: 'Unsere Servicestädte',
    faq: 'Häufig gestellte Fragen',
    priceRange: 'Preisspanne',
    readyHeading: (s, c) => `Bereit für Ihre ${s}-Küche in ${c}?`,
    readyText:
      'Planen Sie Ihr Projekt in wenigen Minuten mit unserem kostenlosen 3D-Studio. 10.000+ Geräte, schlüsselfertige Installation.',
  },
  en: {
    home: 'Home',
    ctaDesign: 'Design your free 3D kitchen',
    ctaCalculator: 'Calculate ROI',
    ctaCatalog: 'Browse catalog',
    ctaFree: 'Start free',
    whyUs: 'Why 2MC Gastro?',
    features: 'Key features',
    brands: 'Which brands?',
    useCases: 'Use cases',
    cities: 'Cities we serve',
    faq: 'Frequently asked questions',
    priceRange: 'Price range',
    readyHeading: (s, c) => `Ready to build a ${s} kitchen in ${c}?`,
    readyText:
      'Plan your project in minutes with our free 3D studio. 10,000+ equipment items and turnkey installation.',
  },
};

// Segment name translations
export const SEGMENT_I18N: Record<string, Record<PseoLocale, { name: string; namePlural: string; description: string }>> = {
  restoran: {
    tr: {
      name: 'Restoran',
      namePlural: 'Restoranlar',
      description:
        'Küçük ve orta ölçekli restoranlar için endüstriyel mutfak çözümleri.',
    },
    de: {
      name: 'Restaurant',
      namePlural: 'Restaurants',
      description:
        'Gastronomie-Küchenlösungen für kleine und mittelgroße Restaurants.',
    },
    en: {
      name: 'Restaurant',
      namePlural: 'Restaurants',
      description:
        'Commercial kitchen solutions for small and mid-size restaurants.',
    },
  },
  otel: {
    tr: { name: 'Otel', namePlural: 'Oteller', description: 'Otel mutfakları için yüksek kapasiteli çözümler.' },
    de: { name: 'Hotel', namePlural: 'Hotels', description: 'Hochleistungsküchen für Hotels.' },
    en: { name: 'Hotel', namePlural: 'Hotels', description: 'High-capacity kitchen solutions for hotels.' },
  },
  catering: {
    tr: { name: 'Catering', namePlural: 'Catering İşletmeleri', description: 'Toplu yemek ve catering için endüstriyel çözümler.' },
    de: { name: 'Catering', namePlural: 'Catering-Betriebe', description: 'Großküchen für Catering und Massenverpflegung.' },
    en: { name: 'Catering', namePlural: 'Catering businesses', description: 'Industrial kitchens for catering and large-volume meal production.' },
  },
  kafe: {
    tr: { name: 'Kafe', namePlural: 'Kafeler', description: 'Kafe ve bistrolar için kompakt çözümler.' },
    de: { name: 'Café', namePlural: 'Cafés', description: 'Kompakte Lösungen für Cafés und Bistros.' },
    en: { name: 'Café', namePlural: 'Cafés', description: 'Compact solutions for cafés and bistros.' },
  },
  hastane: {
    tr: { name: 'Hastane', namePlural: 'Hastaneler', description: 'Hastane mutfakları için hijyen odaklı çözümler.' },
    de: { name: 'Krankenhaus', namePlural: 'Krankenhäuser', description: 'Hygieneorientierte Küchen für Krankenhäuser.' },
    en: { name: 'Hospital', namePlural: 'Hospitals', description: 'Hygiene-focused kitchens for hospitals.' },
  },
  okul: {
    tr: { name: 'Okul', namePlural: 'Okullar', description: 'Okul kantinleri için yüksek hacimli çözümler.' },
    de: { name: 'Schule', namePlural: 'Schulen', description: 'Hochvolumige Lösungen für Schulkantinen.' },
    en: { name: 'School', namePlural: 'Schools', description: 'High-volume solutions for school canteens.' },
  },
};

export function getSegmentI18n(segmentSlug: string, locale: PseoLocale) {
  return SEGMENT_I18N[segmentSlug]?.[locale] || SEGMENT_I18N[segmentSlug]?.tr;
}

export function buildPseoPath(
  locale: PseoLocale,
  type: 'sector' | 'category' | 'brand',
  ...parts: string[]
): string {
  const prefix = LOCALE_PREFIX[locale];
  const seg = PATH_SEGMENTS[locale][type];
  return `${prefix}/${seg}${parts.length ? '/' + parts.join('/') : ''}`;
}
