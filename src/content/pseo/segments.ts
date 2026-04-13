export type Segment = {
  slug: string;
  name: string;
  namePlural: string;
  description: string;
  keyEquipment: string[];
  avgAreaPerGuest: number;
  avgBudgetRange: [number, number];
  faqs: Array<{ question: string; answer: string }>;
};

export type City = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  population: number;
};

export const SEGMENTS: Segment[] = [
  {
    slug: 'restoran',
    name: 'Restoran',
    namePlural: 'Restoranlar',
    description:
      'Küçük ve orta ölçekli restoranlar için endüstriyel mutfak çözümleri. Kombi fırın, ocak, fritöz ve soğutma üniteleri dahil komple kurulum.',
    keyEquipment: ['Kombi Fırın', 'Endüstriyel Ocak', 'Fritöz', 'Soğutucu', 'Davlumbaz', 'Bulaşık Makinesi'],
    avgAreaPerGuest: 0.45,
    avgBudgetRange: [50000, 250000],
    faqs: [
      {
        question: 'Restoran mutfağı kurulumu ne kadar sürer?',
        answer: 'Proje büyüklüğüne göre 4-12 hafta arasında değişir. 2MC Gastro olarak anahtar teslim kurulumu ortalama 6 haftada tamamlıyoruz.',
      },
      {
        question: 'Restoran mutfağı için hangi sertifikalar gerekli?',
        answer: 'CE işareti, HACCP uyumluluğu ve yerel sağlık müdürlüğü onayı temel gerekliliklerdir.',
      },
    ],
  },
  {
    slug: 'otel',
    name: 'Otel',
    namePlural: 'Oteller',
    description:
      'Otel mutfakları için kahvaltı, açık büfe, banket ve oda servisi gereksinimlerini karşılayan yüksek kapasiteli endüstriyel çözümler.',
    keyEquipment: ['20-GN Kombi Fırın', 'Bain-Marie', 'Büfe Ekipmanları', 'Soğuk Oda', 'Blast Chiller', 'Bulaşık Tüneli'],
    avgAreaPerGuest: 0.55,
    avgBudgetRange: [200000, 1500000],
    faqs: [
      {
        question: 'Otel mutfağı için kaç kombi fırın gerekir?',
        answer: '4 yıldız 100 oda için minimum 2 adet 10-GN veya 1 adet 20-GN kombi fırın önerilir.',
      },
    ],
  },
  {
    slug: 'catering',
    name: 'Catering',
    namePlural: 'Catering İşletmeleri',
    description:
      'Yüksek hacimli catering, toplu yemek ve endüstriyel ölçekli hazır yemek üretimi için profesyonel mutfak çözümleri.',
    keyEquipment: ['20-GN Kombi Fırın', 'Tilt Kaynatıcı', 'Basınçlı Kazan', 'Blast Chiller', 'Vakum Paketleme', 'Palet Raf Sistemi'],
    avgAreaPerGuest: 0.70,
    avgBudgetRange: [300000, 2000000],
    faqs: [
      {
        question: 'Catering mutfağı için hangi kapasitede ekipman gerekir?',
        answer: 'Günlük 1000+ porsiyon için 20-GN kombi fırın, 150L tilt kaynatıcı ve blast chiller standart ekipmanlardır.',
      },
    ],
  },
  {
    slug: 'kafe',
    name: 'Kafe',
    namePlural: 'Kafeler',
    description:
      'Kafe ve bistro işletmeleri için kompakt endüstriyel mutfak: tatlı hazırlık, panini, hafif menü ve içecek ekipmanları.',
    keyEquipment: ['Panini Izgara', 'Konveksiyon Fırın', 'Espresso Makinesi', 'Teşhir Soğutucu', 'Blender', 'Buz Makinesi'],
    avgAreaPerGuest: 0.30,
    avgBudgetRange: [25000, 100000],
    faqs: [
      {
        question: 'Kafe açmak için minimum mutfak ekipmanı nedir?',
        answer: 'Espresso makinesi, teşhir soğutucu, konveksiyon fırın, panini ızgara ve buz makinesi temel ekipmanlardır.',
      },
    ],
  },
  {
    slug: 'hastane',
    name: 'Hastane',
    namePlural: 'Hastaneler',
    description:
      'Hastane mutfakları için diyet planlama, hijyen standardı yüksek ve kesintisiz üretim gerektiren endüstriyel çözümler.',
    keyEquipment: ['20-GN Kombi Fırın', 'Tepsi Montaj Hattı', 'Blast Chiller', 'Dezenfeksiyon Üniteleri', 'HACCP Kontrol Sistemi'],
    avgAreaPerGuest: 0.80,
    avgBudgetRange: [500000, 3000000],
    faqs: [
      {
        question: 'Hastane mutfağında HACCP neden kritik?',
        answer: 'Hastane mutfakları bağışıklığı zayıf hastalara hizmet verdiğinden HACCP uyumu zorunludur ve daha sıkı denetime tabidir.',
      },
    ],
  },
  {
    slug: 'okul',
    name: 'Okul',
    namePlural: 'Okullar',
    description:
      'Okul kantinleri ve yemekhane mutfakları için çocuk beslenmesine uygun, yüksek hacimli ve güvenli endüstriyel çözümler.',
    keyEquipment: ['20-GN Kombi Fırın', 'Büfe Ekipmanları', 'Bulaşık Tüneli', 'Tilt Kaynatıcı', 'Soğuk Depo'],
    avgAreaPerGuest: 0.60,
    avgBudgetRange: [150000, 800000],
    faqs: [
      {
        question: 'Okul mutfağı için kaç kişilik kapasite planlamalı?',
        answer: 'Aynı anda servis edilecek öğrenci sayısının %120\'si için kapasite planlaması yapılmalıdır.',
      },
    ],
  },
];

export const CITIES: City[] = [
  { slug: 'istanbul', name: 'İstanbul', country: 'Türkiye', countryCode: 'TR', region: 'Marmara', population: 15500000 },
  { slug: 'ankara', name: 'Ankara', country: 'Türkiye', countryCode: 'TR', region: 'İç Anadolu', population: 5700000 },
  { slug: 'izmir', name: 'İzmir', country: 'Türkiye', countryCode: 'TR', region: 'Ege', population: 4400000 },
  { slug: 'antalya', name: 'Antalya', country: 'Türkiye', countryCode: 'TR', region: 'Akdeniz', population: 2600000 },
  { slug: 'bursa', name: 'Bursa', country: 'Türkiye', countryCode: 'TR', region: 'Marmara', population: 3200000 },
  { slug: 'koln', name: 'Köln', country: 'Almanya', countryCode: 'DE', region: 'Nordrhein-Westfalen', population: 1090000 },
  { slug: 'berlin', name: 'Berlin', country: 'Almanya', countryCode: 'DE', region: 'Berlin', population: 3700000 },
  { slug: 'munchen', name: 'München', country: 'Almanya', countryCode: 'DE', region: 'Bayern', population: 1500000 },
  { slug: 'frankfurt', name: 'Frankfurt', country: 'Almanya', countryCode: 'DE', region: 'Hessen', population: 750000 },
  { slug: 'hamburg', name: 'Hamburg', country: 'Almanya', countryCode: 'DE', region: 'Hamburg', population: 1900000 },
  { slug: 'amsterdam', name: 'Amsterdam', country: 'Hollanda', countryCode: 'NL', region: 'Noord-Holland', population: 900000 },
  { slug: 'rotterdam', name: 'Rotterdam', country: 'Hollanda', countryCode: 'NL', region: 'Zuid-Holland', population: 650000 },
  { slug: 'paris', name: 'Paris', country: 'Fransa', countryCode: 'FR', region: 'Île-de-France', population: 2100000 },
  { slug: 'lyon', name: 'Lyon', country: 'Fransa', countryCode: 'FR', region: 'Auvergne-Rhône-Alpes', population: 520000 },
  { slug: 'london', name: 'London', country: 'Birleşik Krallık', countryCode: 'GB', region: 'Greater London', population: 9000000 },
];

export function getSegment(slug: string): Segment | undefined {
  return SEGMENTS.find((s) => s.slug === slug);
}

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getAllSegmentCityPairs(): Array<{ segment: Segment; city: City }> {
  const pairs: Array<{ segment: Segment; city: City }> = [];
  for (const segment of SEGMENTS) {
    for (const city of CITIES) {
      pairs.push({ segment, city });
    }
  }
  return pairs;
}
