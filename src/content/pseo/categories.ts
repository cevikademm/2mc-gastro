export type EquipmentCategory = {
  slug: string;
  name: string;
  namePlural: string;
  shortDesc: string;
  longDesc: string;
  brands: string[];
  priceFrom: number;
  priceTo: number;
  keyFeatures: string[];
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const CATEGORIES: EquipmentCategory[] = [
  {
    slug: 'kombi-firin',
    name: 'Kombi Fırın',
    namePlural: 'Kombi Fırınlar',
    shortDesc: 'Konveksiyon + buhar + nem kontrollü profesyonel pişirme.',
    longDesc:
      'Kombi fırınlar modern endüstriyel mutfağın kalbidir. Konveksiyon, buhar ve nem kontrolünü tek cihazda birleştirerek rosto, haşlama, buğulama, fırınlama ve tütsüleme gibi tüm pişirme tekniklerini karşılar. 6-GN, 10-GN ve 20-GN kapasitelerde sunulur.',
    brands: ['Diamond', 'CombiSteel', 'Rational', 'Unox', 'Electrolux'],
    priceFrom: 3500,
    priceTo: 45000,
    keyFeatures: [
      'Otomatik pişirme programları',
      'HACCP kayıt sistemi',
      'Self-clean yıkama',
      '%30 enerji tasarrufu',
      'Çoklu seviye pişirme',
      'Core temperature probe',
    ],
    useCases: ['Restoran', 'Otel', 'Catering', 'Hastane', 'Okul', 'Pastane'],
    faqs: [
      {
        question: 'Kombi fırın fiyatları ne kadar?',
        answer: '6-GN modeller €3.500\'den, 10-GN €8.000\'den, 20-GN €18.000\'den başlar. Marka ve özelliklere göre değişir.',
      },
      {
        question: '6-GN, 10-GN, 20-GN farkı nedir?',
        answer: 'GN = Gastronorm tepsi sayısı. 6-GN ~50 kişi, 10-GN ~100 kişi, 20-GN ~200+ kişiye hizmet kapasitesi sunar.',
      },
    ],
  },
  {
    slug: 'endustriyel-fritoz',
    name: 'Endüstriyel Fritöz',
    namePlural: 'Endüstriyel Fritözler',
    shortDesc: 'Gaz ve elektrikli, yüksek kapasiteli kızartma çözümleri.',
    longDesc:
      'Endüstriyel fritözler, restoran ve fast-food işletmelerinin vazgeçilmez ekipmanıdır. 5L\'den 40L\'ye kadar kapasiteler, filtrasyon sistemleri ve hassas sıcaklık kontrolü ile üretim verimliliğini artırır.',
    brands: ['Diamond', 'CombiSteel', 'Valentine', 'Frymaster'],
    priceFrom: 600,
    priceTo: 12000,
    keyFeatures: [
      'Elektrikli / Gazlı seçenekler',
      'Yağ filtrasyon sistemi',
      'Çift hazne',
      'Dijital termostat',
      'Taşma koruması',
    ],
    useCases: ['Fast-food', 'Restoran', 'Kafe', 'Catering'],
    faqs: [
      {
        question: 'Fritözde yağ ne sıklıkla değişmeli?',
        answer: 'Ortalama 5-7 günde bir, yoğun kullanımda ise günlük filtrasyon gereklidir. Modern filtrasyon sistemleri yağ ömrünü 2-3 katına çıkarır.',
      },
    ],
  },
  {
    slug: 'endustriyel-ocak',
    name: 'Endüstriyel Ocak',
    namePlural: 'Endüstriyel Ocaklar',
    shortDesc: '2, 4, 6, 8 gözlü gazlı ve elektrikli profesyonel ocaklar.',
    longDesc:
      'Endüstriyel ocaklar, mutfağın ana pişirme üniteleridir. Gazlı, elektrikli ve indüksiyon seçenekleri ile her işletme tipine uygun çözüm sunar.',
    brands: ['Diamond', 'CombiSteel', 'Bertos', 'MBM'],
    priceFrom: 800,
    priceTo: 15000,
    keyFeatures: ['Dökme demir ızgara', 'Güvenlik valfli', 'Fırınlı modeller', 'İndüksiyon opsiyonu'],
    useCases: ['Restoran', 'Otel', 'Catering', 'Kafe'],
    faqs: [],
  },
  {
    slug: 'blast-chiller',
    name: 'Blast Chiller',
    namePlural: 'Blast Chillerlar',
    shortDesc: 'Hızlı soğutma ve şoklama — HACCP kritik gereklilik.',
    longDesc:
      'Blast chiller (şok soğutucu), pişmiş gıdaların +90°C\'den +3°C\'ye en fazla 90 dakikada düşürülmesini sağlar. HACCP uyumu için kritik bir ekipmandır.',
    brands: ['Diamond', 'CombiSteel', 'Irinox', 'Friulinox'],
    priceFrom: 2500,
    priceTo: 35000,
    keyFeatures: ['+90°C → +3°C / 90 dk', 'HACCP logging', 'Core probe', '5/10/20-GN kapasiteler'],
    useCases: ['Catering', 'Hastane', 'Otel', 'Pastane', 'Restoran'],
    faqs: [
      {
        question: 'Blast chiller neden zorunlu?',
        answer: 'HACCP standardına göre pişmiş gıdalar 90 dakika içinde +3°C\'ye indirilmelidir. Normal buzdolabı bunu yapamaz, mikrobiyolojik risk oluşur.',
      },
    ],
  },
  {
    slug: 'bulasik-makinesi',
    name: 'Endüstriyel Bulaşık Makinesi',
    namePlural: 'Endüstriyel Bulaşık Makineleri',
    shortDesc: 'Kapaklı, tünel ve bardak yıkama — tüm kapasiteler.',
    longDesc:
      'Endüstriyel bulaşık makineleri; 40-60 saniye yıkama süreleri, yüksek sıcaklık dezenfeksiyonu ve saatlik 500-2000 tabak kapasiteleri ile profesyonel mutfakların olmazsa olmazıdır.',
    brands: ['Diamond', 'CombiSteel', 'Winterhalter', 'Hobart'],
    priceFrom: 1200,
    priceTo: 25000,
    keyFeatures: ['Kapaklı / Tünel tipleri', 'Su yumuşatıcı', 'Atık ısı geri kazanım', 'Thermo-Stop'],
    useCases: ['Restoran', 'Otel', 'Catering', 'Okul', 'Hastane'],
    faqs: [],
  },
  {
    slug: 'davlumbaz',
    name: 'Endüstriyel Davlumbaz',
    namePlural: 'Endüstriyel Davlumbazlar',
    shortDesc: 'Kanal tipi, ada tipi ve kondensasyonlu davlumbazlar.',
    longDesc:
      'Endüstriyel davlumbazlar, mutfaktaki duman, yağ, buhar ve kokuları tahliye ederek HACCP ve yangın güvenliği gereksinimlerini karşılar.',
    brands: ['Diamond', 'CombiSteel', 'Halton'],
    priceFrom: 900,
    priceTo: 20000,
    keyFeatures: ['UV filtre', 'Kondensasyon', 'Motor + fan entegre', 'Ada / duvar tipi'],
    useCases: ['Restoran', 'Otel', 'Catering', 'Kafe'],
    faqs: [],
  },
  {
    slug: 'sogutucu',
    name: 'Endüstriyel Soğutucu',
    namePlural: 'Endüstriyel Soğutucular',
    shortDesc: 'Dik, tezgahaltı ve soğuk oda çözümleri.',
    longDesc:
      'Dik tip buzdolabı, tezgahaltı chef base, pizza hazırlama tezgahı ve soğuk oda panelleri. 2°C ile -22°C arası sıcaklık kontrolü ile gıda güvenliği sağlar.',
    brands: ['Diamond', 'CombiSteel', 'Tefcold', 'Liebherr'],
    priceFrom: 700,
    priceTo: 18000,
    keyFeatures: ['Dinamik soğutma', 'Dijital termostat', 'HACCP alarm', '600/700 serisi'],
    useCases: ['Restoran', 'Otel', 'Catering', 'Pastane', 'Kafe'],
    faqs: [],
  },
  {
    slug: 'izgara',
    name: 'Endüstriyel Izgara',
    namePlural: 'Endüstriyel Izgaralar',
    shortDesc: 'Lavataş, pleyt, char-broil ve panini ızgaraları.',
    longDesc:
      'Endüstriyel ızgaralar; lavataş (taş ızgara), pleyt (düz), char-broil (yivli) ve panini modelleri ile her mutfağa uygun seçenek sunar.',
    brands: ['Diamond', 'CombiSteel', 'Bertos'],
    priceFrom: 500,
    priceTo: 8000,
    keyFeatures: ['Lavataş / Pleyt / Char-broil', 'Gaz / Elektrik', 'Yağ çekmecesi'],
    useCases: ['Restoran', 'Kafe', 'Fast-food'],
    faqs: [],
  },
];

export function getCategory(slug: string): EquipmentCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
