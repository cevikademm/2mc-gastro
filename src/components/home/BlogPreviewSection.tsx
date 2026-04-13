import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMin: number;
  image: string;
  href: string;
}

const POSTS: BlogPost[] = [
  {
    id: 'p1',
    title: 'Restoran Mutfağı Kurarken Yapılan 7 Pahalı Hata',
    excerpt: 'Yeni bir mutfak kurulumunda sık karşılaşılan hatalar ve profesyonel çözümleri.',
    category: 'Rehber',
    date: '2026-04-05',
    readMin: 8,
    image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
    href: '/docs',
  },
  {
    id: 'p2',
    title: 'Kombi Fırın Nasıl Seçilir? Kapasite ve Enerji Rehberi',
    excerpt: 'İşletmeniz için doğru kombi fırın kapasitesini hesaplamanın pratik yolları.',
    category: 'Ürün Rehberi',
    date: '2026-03-28',
    readMin: 6,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    href: '/docs',
  },
  {
    id: 'p3',
    title: 'HACCP Uyumlu Soğuk Zincir: Soğutma Ekipmanları',
    excerpt: 'Gıda güvenliği mevzuatına uygun soğutma sistemleri ve sertifikasyon.',
    category: 'Mevzuat',
    date: '2026-03-20',
    readMin: 10,
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
    href: '/docs',
  },
];

export default function BlogPreviewSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-6xl mt-10">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold mb-2">
            <BookOpen size={12} /> {t('blog.badge', 'BLOG')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('blog.title', 'Sektör Rehberleri ve Makaleler')}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {t('blog.subtitle', 'Profesyonellerin hazırladığı içeriklerle işinizi büyütün.')}
          </p>
        </div>
        <a href="/blog" className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
          {t('blog.viewAll', 'Tümünü Gör')} <ArrowRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {POSTS.map((post, i) => (
          <motion.a
            key={post.id}
            href={`#${post.href}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
          >
            <div className="aspect-video bg-slate-100 overflow-hidden relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-sky-600 rounded-full uppercase tracking-wider">
                {post.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition">
                {post.title}
              </h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(post.date).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {post.readMin} dk
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
