export type LeadMagnet = {
  slug: string;
  title: string;
  description: string;
  pages: number;
  bullets: string[];
  downloadUrl: string;
  image?: string;
};

export const LEAD_MAGNETS: LeadMagnet[] = [
  {
    slug: 'haccp-checklist-2026',
    title: 'HACCP Uyumlu Mutfak Kurulum Kontrol Listesi 2026',
    description:
      'Endüstriyel mutfak kurulumu öncesi, sırasında ve sonrasında HACCP uyumunu garanti edecek 47 maddelik kontrol listesi.',
    pages: 12,
    bullets: [
      '47 maddelik adım adım kontrol listesi',
      'Bölgeleme (zoning) şeması örnekleri',
      'Sıcaklık takip kayıt şablonları',
      'Denetim öncesi son kontrol özeti',
    ],
    downloadUrl: '/downloads/haccp-checklist-2026.pdf',
    image: '/logo-2mc-gastro.jpeg',
  },
  {
    slug: 'kitchen-budget-template',
    title: 'Restoran Mutfağı Bütçe Şablonu (Excel + PDF)',
    description:
      '100, 200 ve 500 kişilik restoran mutfakları için detaylı ekipman ve kurulum bütçe şablonu.',
    pages: 8,
    bullets: [
      '3 kapasite için hazır bütçe şablonu',
      'Her ekipman için tipik fiyat aralığı',
      'Kurulum, eğitim, servis masrafları',
      'ROI hesaplama formülleri',
    ],
    downloadUrl: '/downloads/kitchen-budget-template.pdf',
    image: '/logo-2mc-gastro.jpeg',
  },
  {
    slug: 'equipment-buying-guide',
    title: 'Endüstriyel Mutfak Ekipmanı Satın Alma Rehberi',
    description:
      '20 kritik ekipman kategorisi için marka karşılaştırması, enerji verimliliği ve ömür-maliyet analizi.',
    pages: 24,
    bullets: [
      '20 ekipman kategorisi analizi',
      'Diamond vs CombiSteel vs Rational karşılaştırması',
      'Enerji verimliliği rehberi (kWh/gün)',
      '10 yıllık toplam sahip olma maliyeti',
    ],
    downloadUrl: '/downloads/equipment-buying-guide.pdf',
    image: '/logo-2mc-gastro.jpeg',
  },
];

export function getLeadMagnet(slug: string) {
  return LEAD_MAGNETS.find((m) => m.slug === slug);
}
