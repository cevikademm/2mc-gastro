export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  rating: number;
  body: string;
  segment: 'restoran' | 'otel' | 'catering' | 'kafe' | 'hastane' | 'okul';
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Murat Şahin',
    role: 'İşletme Sahibi',
    company: 'Şahin Steakhouse',
    city: 'İstanbul',
    rating: 5,
    body: '3D tasarım stüdyosu sayesinde mutfağımızı kurmadan önce her detayı gördük. Ekipman seçimi, yerleşim, hatta personel akışı bile planlandı. 6 ay sonra hâlâ tek bir parça yer değiştirmedik.',
    segment: 'restoran',
  },
  {
    id: 't2',
    name: 'Ayşe Demir',
    role: 'F&B Müdürü',
    company: 'Bodrum Bay Resort',
    city: 'Bodrum',
    rating: 5,
    body: '120 odalı otelimizin mutfak yenilemesi için 3 firmadan teklif aldık. 2MC Gastro hem fiyat hem de profesyonellik açısından açık ara öndeydi. Anahtar teslim teslimat 4 hafta erken bitti.',
    segment: 'otel',
  },
  {
    id: 't3',
    name: 'Kemal Yıldız',
    role: 'Operasyon Direktörü',
    company: 'Yıldız Catering',
    city: 'Ankara',
    rating: 5,
    body: 'Günlük 2.500 öğün üreten bir mutfağız. Ekipmanların güvenilirliği bizim için her şey. Diamond ve CombiSteel kombinasyonu mükemmel çalışıyor — 18 ayda sıfır arıza.',
    segment: 'catering',
  },
  {
    id: 't4',
    name: 'Deniz Aksoy',
    role: 'Kurucu',
    company: 'Mavi Kafe',
    city: 'İzmir',
    rating: 5,
    body: 'Kafe açmak ilk defa girişimci olan bizim için çok riskliydi. ROI hesaplayıcı ve AI satış asistanı tam olarak hangi ekipmana ihtiyacımız olduğunu gösterdi. Bütçenin altında kaldık.',
    segment: 'kafe',
  },
  {
    id: 't5',
    name: 'Dr. Mehmet Korkmaz',
    role: 'Satınalma Müdürü',
    company: 'Anadolu Hastanesi',
    city: 'Bursa',
    rating: 5,
    body: 'HACCP uyumu hastane mutfağımız için kritikti. 2MC Gastro ekibi tüm denetim süreçlerinde yanımızda oldu. Tek bir uygunsuzluk bildirimi almadık.',
    segment: 'hastane',
  },
  {
    id: 't6',
    name: 'Stefan Müller',
    role: 'Restaurantleiter',
    company: 'Brauhaus am Dom',
    city: 'Köln',
    rating: 5,
    body: '2MC Gastro hat unsere komplette Küchenrenovierung in Köln betreut — von der 3D-Planung bis zur Inbetriebnahme. Professionell, pünktlich und faire Preise. Klare Empfehlung.',
    segment: 'restoran',
  },
];

export function aggregateRating() {
  const total = TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0);
  const avg = total / TESTIMONIALS.length;
  return { value: Number(avg.toFixed(1)), count: TESTIMONIALS.length };
}
