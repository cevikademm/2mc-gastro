export type Competitor = {
  slug: string;
  name: string;
  domain: string;
  founded: number;
  origin: string;
  monthlyTraffic: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  pricing: 'low' | 'mid' | 'premium';
  productCount: number;
  brands: string[];
  hasDesignTool: boolean;
  hasROICalc: boolean;
  hasMultiLang: boolean;
  hasInstallation: boolean;
};

export const COMPETITORS: Competitor[] = [
  {
    slug: 'ggm-gastro',
    name: 'GGM Gastro',
    domain: 'ggmgastro.com',
    founded: 2007,
    origin: 'Almanya',
    monthlyTraffic: '~4M',
    positioning: 'Avrupa pazarında geniş ürün yelpazesi, agresif fiyatlandırma',
    strengths: [
      'Çok geniş ürün kataloğu (15.000+)',
      'Güçlü Almanya pazarı varlığı',
      'Hızlı kargo ağı',
      'Çok dilli web sitesi',
    ],
    weaknesses: [
      '3D mutfak tasarım aracı yok',
      'Anahtar teslim kurulum hizmeti sınırlı',
      'Türk pazarına yerel destek yok',
      'AI destekli ürün önerisi yok',
      'HACCP danışmanlığı yok',
    ],
    pricing: 'low',
    productCount: 15000,
    brands: ['GGM (kendi markası)', 'Bartscher', 'çoğunlukla white-label'],
    hasDesignTool: false,
    hasROICalc: false,
    hasMultiLang: true,
    hasInstallation: false,
  },
  {
    slug: 'nisbets',
    name: 'Nisbets',
    domain: 'nisbets.com',
    founded: 1983,
    origin: 'İngiltere',
    monthlyTraffic: '~1.5M',
    positioning: 'İngiltere pazarı lideri, premium markalar + servis odaklı',
    strengths: [
      'Premium marka portföyü (Rational, Hobart, Robot Coupe)',
      'Güçlü B2B servis ağı',
      '40+ yıllık marka',
      'Geniş aksesuar kataloğu',
    ],
    weaknesses: [
      'Türkiye/EU non-UK pazarına sınırlı erişim',
      '3D tasarım stüdyosu yok',
      'Brexit sonrası AB içi gümrük sürtünmesi',
      'AI satış asistanı yok',
      'Anahtar teslim mutfak projesi sunumu zayıf',
    ],
    pricing: 'premium',
    productCount: 30000,
    brands: ['Rational', 'Hobart', 'Robot Coupe', 'Vitamix', 'KitchenAid'],
    hasDesignTool: false,
    hasROICalc: false,
    hasMultiLang: false,
    hasInstallation: true,
  },
  {
    slug: 'biggastro',
    name: 'BigGastro',
    domain: 'biggastro.com',
    founded: 2015,
    origin: 'Polonya',
    monthlyTraffic: '~600K',
    positioning: 'Doğu Avrupa odaklı, fiyat-performans odaklı pazaryeri',
    strengths: [
      'Polonya/Doğu Avrupa lojistik avantajı',
      'Rekabetçi fiyatlar',
      'Hızlı sipariş süreci',
    ],
    weaknesses: [
      'Marka çeşitliliği sınırlı',
      'Türkçe destek yok',
      '3D tasarım aracı yok',
      'Profesyonel proje hizmeti yok',
      'Mobil deneyim zayıf',
      'AI ürün önerisi yok',
    ],
    pricing: 'low',
    productCount: 8000,
    brands: ['Hendi', 'Stalgast', 'jerel markalar'],
    hasDesignTool: false,
    hasROICalc: false,
    hasMultiLang: false,
    hasInstallation: false,
  },
];

export function getCompetitor(slug: string) {
  return COMPETITORS.find((c) => c.slug === slug);
}
