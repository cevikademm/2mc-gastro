export type Brand = {
  slug: string;
  name: string;
  origin: string;
  founded: number;
  tagline: string;
  description: string;
  strengths: string[];
  categories: string[]; // category slugs
  productCount: number;
  logo?: string;
};

export const BRANDS: Brand[] = [
  {
    slug: 'diamond',
    name: 'Diamond',
    origin: 'Fransa',
    founded: 1985,
    tagline: 'Fransız mühendislik, dünya kalitesi',
    description:
      'Diamond, 1985\'ten bu yana profesyonel mutfak ekipmanları üreten Fransız markasıdır. Restoran, otel ve catering sektörüne yönelik komple çözümler sunar.',
    strengths: ['CE sertifikalı', '2 yıl garanti', 'Avrupa çapında servis', '10.000+ ürün'],
    categories: ['kombi-firin', 'endustriyel-fritoz', 'endustriyel-ocak', 'bulasik-makinesi', 'sogutucu', 'izgara', 'davlumbaz', 'blast-chiller'],
    productCount: 10000,
  },
  {
    slug: 'combisteel',
    name: 'CombiSteel',
    origin: 'Hollanda',
    founded: 1990,
    tagline: 'Hollanda kalitesi, rekabetçi fiyat',
    description:
      'CombiSteel, Hollanda merkezli profesyonel gastronomi ekipmanları üreticisidir. Geniş ürün yelpazesi ve erişilebilir fiyatları ile bilinir.',
    strengths: ['Uygun fiyat', 'Geniş yelpaze', 'Hızlı teslimat', '2.500+ ürün'],
    categories: ['kombi-firin', 'endustriyel-fritoz', 'endustriyel-ocak', 'bulasik-makinesi', 'sogutucu', 'izgara', 'davlumbaz', 'blast-chiller'],
    productCount: 2500,
  },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
