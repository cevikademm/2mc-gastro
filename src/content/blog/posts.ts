export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  datePublished: string;
  readingMinutes: number;
  image: string;
  body: string; // markdown-lite: paragraphs split by \n\n, ## for headings, - for bullets
  faq?: Array<{ question: string; answer: string }>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'endustriyel-mutfak-kurulum-rehberi-2026',
    title: 'Endüstriyel Mutfak Kurulum Rehberi: Sıfırdan Profesyonel Mutfağa',
    description:
      'Restoran, otel ve catering için endüstriyel mutfak kurulumunun tüm aşamaları: alan planlama, ekipman seçimi, HACCP uyumu ve bütçeleme.',
    excerpt:
      'Yeni bir restoran mı açıyorsunuz ya da mevcut mutfağınızı yenilemek mi istiyorsunuz? Bu rehber, sıfırdan profesyonel mutfak kurulumunun her aşamasını adım adım anlatıyor.',
    category: 'Kurulum',
    tags: ['endüstriyel mutfak', 'kurulum', 'HACCP', 'planlama'],
    author: '2MC Gastro',
    datePublished: '2026-01-15',
    readingMinutes: 12,
    image: '/logo-2mc-gastro.jpeg',
    body: `## 1. Alan ve Kapasite Planlaması

Endüstriyel mutfak kurulumunun ilk adımı, mekânın günlük kaç kişiye hizmet vereceğini netleştirmektir. 100 kişilik bir restoran ile 500 kişilik bir catering işletmesi için gereken ekipman, enerji ve alan ihtiyacı tamamen farklıdır.

## 2. Bölgeleme (Zoning) İlkeleri

Profesyonel mutfaklar 5 ana bölgeye ayrılır: teslim alma, depolama, hazırlık, pişirme, servis. HACCP prensipleri gereği çiğ ve pişmiş ürün akışları kesişmemelidir.

## 3. Ekipman Seçimi

- Kombi fırınlar (kapasite: personel sayısına göre 6/10/20 tabak)
- Endüstriyel ocaklar ve fritözler
- Soğutma ve şoklama üniteleri
- Bulaşık ve hijyen istasyonları

## 4. Enerji ve Havalandırma

Toplam kurulu gücün doğru hesaplanması, hem elektrik altyapısı hem de havalandırma (davlumbaz) tasarımı için kritiktir. Kural: mutfak alanının her m² için minimum 150-200 W.

## 5. HACCP Uyumu ve Sertifikasyon

CE işareti, NSF sertifikası ve yerel sağlık müdürlüğü onayı olmadan bir endüstriyel mutfak faaliyete geçemez.`,
    faq: [
      {
        question: '100 kişilik bir restoran için mutfak alanı ne kadar olmalı?',
        answer:
          'Genel kural olarak toplam restoran alanının %30-35\'i mutfağa ayrılır. 100 kişilik bir restoran için 40-60 m² mutfak alanı idealdir.',
      },
      {
        question: 'Kombi fırın kapasitesi nasıl seçilir?',
        answer:
          'Pik saatte aynı anda pişirilecek tabak sayısını hesaplayın. 6-GN kombi ~50 kişi, 10-GN ~100 kişi, 20-GN ~200+ kişi için uygundur.',
      },
    ],
  },
  {
    slug: 'kombi-firin-secimi-6-10-20-gn-karsilastirma',
    title: 'Kombi Fırın Seçimi: 6-GN, 10-GN ve 20-GN Karşılaştırması',
    description:
      'Kombi fırın kapasitesi nasıl seçilir? 6-GN, 10-GN ve 20-GN modellerinin kapasite, enerji tüketimi ve maliyet karşılaştırması.',
    excerpt:
      'Kombi fırın, modern endüstriyel mutfağın kalbidir. Ancak yanlış kapasite seçimi, hem operasyonel verimliliği hem de yatırım geri dönüşünü olumsuz etkiler.',
    category: 'Ekipman',
    tags: ['kombi fırın', 'pişirme', 'ekipman seçimi'],
    author: '2MC Gastro',
    datePublished: '2026-01-22',
    readingMinutes: 8,
    image: '/logo-2mc-gastro.jpeg',
    body: `## 6-GN Kombi Fırın

Küçük restoranlar, kafe ve butik oteller için idealdir. Tek servis döneminde ~50 kişiye kadar kapasite sunar. Enerji tüketimi düşük, tezgâh üstü veya zemin modeli seçilebilir.

## 10-GN Kombi Fırın

Orta ölçekli restoranlar, bistrolar ve oteller için en çok tercih edilen kapasitedir. ~100 kişilik servisi rahatlıkla karşılar.

## 20-GN Kombi Fırın

Büyük oteller, catering işletmeleri, hastaneler ve okul mutfakları için tasarlanmıştır. 200+ kişilik servisler, çift kapılı ve yüksek enerji verimli modelleri ile standarttır.

## Karar Matrisi

- Günlük < 80 kişi → 6-GN
- Günlük 80-200 kişi → 10-GN
- Günlük 200+ kişi → 20-GN veya 2×10-GN`,
  },
  {
    slug: 'haccp-uyumlu-mutfak-tasarimi-10-kritik-nokta',
    title: 'HACCP Uyumlu Mutfak Tasarımı: 10 Kritik Nokta',
    description:
      'HACCP standartlarına uygun endüstriyel mutfak tasarımında dikkat edilmesi gereken 10 kritik kontrol noktası.',
    excerpt:
      'HACCP (Hazard Analysis and Critical Control Points) yalnızca bir sertifika değil, gıda güvenliğinin temelidir. Mutfak tasarımınız HACCP uyumlu değilse sertifika almanız imkânsızdır.',
    category: 'HACCP',
    tags: ['HACCP', 'gıda güvenliği', 'sertifikasyon'],
    author: '2MC Gastro',
    datePublished: '2026-02-01',
    readingMinutes: 10,
    image: '/logo-2mc-gastro.jpeg',
    body: `## 1. Tek Yönlü Akış

Çiğ malzeme → hazırlık → pişirme → servis yolu kesişmemelidir.

## 2. Sıcaklık Kontrol Noktaları

Her depolama ve pişirme noktasında dijital sıcaklık logları tutulmalıdır.

## 3. El Yıkama İstasyonları

Her bölgede ayrı el yıkama lavabosu bulunmalıdır.

## 4. Yüzey Malzemeleri

Tüm çalışma yüzeyleri 304 paslanmaz çelik, gözeneksiz, dezenfektan dayanıklı olmalıdır.

## 5. Havalandırma ve Hava Basıncı

Temiz alanlar pozitif, kirli alanlar negatif basınçta tutulmalıdır.

## 6. Atık Yönetimi

Atık akışı hiçbir zaman temiz akışı kesmemelidir.

## 7. Ekipman Aralıkları

Temizlik için ekipmanlar arası minimum 5 cm boşluk bırakılmalıdır.

## 8. Aydınlatma

Çalışma yüzeyinde minimum 500 lux aydınlatma.

## 9. Zemin ve Drenaj

Islak zonlarda %2 eğimli, drenajlı zemin.

## 10. Kaydedilebilir Kontroller

Tüm kontroller dijital olarak loglanabilir olmalıdır.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}
