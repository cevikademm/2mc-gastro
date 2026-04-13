import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useBannerStore } from '../../stores/bannerStore';
import {
  Ruler, Refrigerator, Shield, BarChart3,
  ArrowRight, Sparkles, Star,
  Award, CheckCircle2,
  Menu, ChevronDown, Heart, Repeat, Gem, Box, PencilRuler, ListOrdered, FileText, FolderKanban,
  Flame, Snowflake, Droplets, Scissors, Armchair, Coffee, UtensilsCrossed, Package,
  Home, LayoutGrid, ShoppingCart, CreditCard, Search, User, Building2, Newspaper, PhoneCall,
  Info, HelpCircle, Scale, Calculator,
  Pizza, Sandwich, Utensils, Cookie, Soup, Martini, IceCream, Beef, ShoppingBasket, Truck,
  Globe, Tag, Zap, ChefHat, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import NewsletterSection from '../../components/home/NewsletterSection';
import BlogPreviewSection from '../../components/home/BlogPreviewSection';
import LiveChatWidget from '../../components/LiveChatWidget';
import SiteFooter from '../../components/SiteFooter';
import './welcome-2mc.css';

const FEATURES_KEYS = [
  { icon: Refrigerator, titleKey: 'welcome.featureEquipment', descKey: 'welcome.featureEquipmentDescLong' },
  { icon: Ruler, titleKey: 'welcome.featureDesign', descKey: 'welcome.featureDesignDesc' },
  { icon: BarChart3, titleKey: 'welcome.featureQuoteLong', descKey: 'welcome.featureQuoteLongDesc' },
  { icon: Shield, titleKey: 'welcome.featureHACCP', descKey: 'welcome.featureHACCPDescLong' },
];

// Video listesi — public/videos/ klasörüne yeni .mp4 ekleyince buraya da ekle
const VIDEO_URLS = [
  '/videos/Dough_mixer_exploding_202604100954.mp4',
  '/videos/Industrial_dough_mixer_202604100951.mp4',
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { slides: allSlides, intervalMs } = useBannerStore();
  const slides = allSlides.filter((s) => s.enabled);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setBannerIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  useEffect(() => {
    if (bannerIdx >= slides.length) setBannerIdx(0);
  }, [slides.length, bannerIdx]);

  const advanceBanner = () => setBannerIdx((i) => (i + 1) % Math.max(1, slides.length));
  const currentSlide = slides[bannerIdx];

  // Video carousel
  const videoUrls = VIDEO_URLS;
  const [videoIdx, setVideoIdx] = useState(0);
  const [exploreTab, setExploreTab] = useState<'categories' | 'pages'>('categories');
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── 3D showcase modelleri (GLB) ──
  type ShowcaseItem = {
    id: string;
    src: string;
    title: string;
    subtitle: string;
    desc: string;
    accent: string;
    ring: string;
    text: string;
    tag: string;
    specs: Array<{ k: string; v: string }>;
    features: string[];
    priceLabel: string | null;
  };
  const SHOWCASE_3D: ShowcaseItem[] = [
    {
      id: 'planetary-mixer-60l',
      src: '/models/Meshy_AI_Commercial_Planetary__0411175135_texture.glb',
      title: 'Planetary Mixer 60L',
      subtitle: t('welcome.showcase3d.item1.subtitle', 'Yüksek kapasite endüstriyel'),
      desc: t('welcome.showcase3d.item1.desc', 'Endüstriyel fırın, pastane ve büyük catering işletmeleri için 60 litre kazan kapasiteli profesyonel planet mikser.'),
      accent: 'from-emerald-500/25 via-teal-600/10 to-cyan-700/5',
      ring: 'border-emerald-400/40',
      text: 'text-emerald-300',
      tag: t('welcome.showcase3d.tagEquipment', 'EKİPMAN'),
      specs: [
        { k: t('welcome.spec.capacity', 'Kapasite'),  v: '60 L kazan · 20 kg un' },
        { k: t('welcome.spec.power', 'Güç'),           v: '3.0 kW · 400 V' },
        { k: t('welcome.spec.rpm', 'Devir'),            v: '3 kademe · 80-320 rpm' },
        { k: t('welcome.spec.dimensions', 'Boyutlar'),  v: '720 × 820 × 1320 mm' },
        { k: t('welcome.spec.weight', 'Ağırlık'),       v: '240 kg' },
        { k: t('welcome.spec.material', 'Malzeme'),     v: t('welcome.showcase3d.item1.material', 'AISI 304 Paslanmaz') },
      ],
      features: [
        t('welcome.showcase3d.item1.feat1', 'Planet hareket · homojen yoğurma'),
        t('welcome.showcase3d.item1.feat2', 'Otomatik kazan yükseltme'),
        t('welcome.showcase3d.item1.feat3', 'Zaman ayarlı dijital kontrol'),
        t('welcome.showcase3d.item1.feat4', 'CE sertifikalı · 2 yıl garanti'),
      ],
      priceLabel: '€ 4.690,00 *',
    },
    {
      id: 'rainbow-bottles',
      src: '/models/Meshy_AI_Rainbow_Bottles_in_a__0411175104_texture.glb',
      title: t('welcome.showcase3d.item2.title', 'Şişe Teşhir Vitrini'),
      subtitle: t('welcome.showcase3d.item2.subtitle', 'Bar & içecek sunum rafı'),
      desc: t('welcome.showcase3d.item2.desc', 'Bar ve restoranlar için renkli içecek şişelerini estetik bir şekilde sergileyen profesyonel teşhir vitrini.'),
      accent: 'from-rose-500/25 via-pink-600/10 to-fuchsia-700/5',
      ring: 'border-rose-400/40',
      text: 'text-rose-300',
      tag: t('welcome.showcase3d.tagPresentation', 'SUNUM'),
      specs: [
        { k: t('welcome.spec.category', 'Kategori'),    v: t('welcome.showcase3d.item2.catVal', 'Bar ekipmanı') },
        { k: t('welcome.spec.capacity', 'Kapasite'),    v: t('welcome.showcase3d.item2.capVal', 'Çok katlı teşhir') },
        { k: t('welcome.spec.lighting', 'Aydınlatma'),  v: t('welcome.showcase3d.item2.lightVal', 'LED arka plan') },
        { k: t('welcome.spec.material', 'Malzeme'),     v: t('welcome.showcase3d.item2.matVal', 'Paslanmaz · temperli cam') },
      ],
      features: [
        t('welcome.showcase3d.item2.feat1', 'LED arkadan aydınlatma'),
        t('welcome.showcase3d.item2.feat2', 'Ayarlanabilir raf sistemi'),
        t('welcome.showcase3d.item2.feat3', 'Temperli cam paneller'),
        t('welcome.showcase3d.item2.feat4', 'Bar ve restoranlar için ideal'),
      ],
      priceLabel: '€ 1.250,00 *',
    },
    {
      id: 'showroom-display',
      src: '/models/Meshy_AI_ddd_0411175109_texture.glb',
      title: t('welcome.showcase3d.item3.title', 'Showroom Konsept Modeli'),
      subtitle: t('welcome.showcase3d.item3.subtitle', 'Sergi & tanıtım modülü'),
      desc: t('welcome.showcase3d.item3.desc', 'Mağaza ve showroomlar için özel tasarlanmış konsept ekipman. Ürünlerinizi profesyonel bir şekilde sergilemenizi sağlar.'),
      accent: 'from-violet-500/25 via-purple-600/10 to-indigo-700/5',
      ring: 'border-violet-400/40',
      text: 'text-violet-300',
      tag: t('welcome.showcase3d.tagConcept', 'KONSEPT'),
      specs: [
        { k: t('welcome.spec.category', 'Kategori'),   v: t('welcome.showcase3d.item3.catVal', 'Showroom ekipmanı') },
        { k: t('welcome.spec.usage', 'Kullanım'),      v: t('welcome.showcase3d.item3.useVal', 'Sergi · tanıtım') },
        { k: t('welcome.spec.installation', 'Montaj'), v: t('welcome.showcase3d.item3.installVal', 'Modüler sistem') },
        { k: t('welcome.spec.material', 'Malzeme'),    v: t('welcome.showcase3d.item3.matVal', 'Paslanmaz çelik') },
      ],
      features: [
        t('welcome.showcase3d.item3.feat1', 'Modüler tasarım'),
        t('welcome.showcase3d.item3.feat2', 'Kolay kurulum'),
        t('welcome.showcase3d.item3.feat3', 'Profesyonel görünüm'),
        t('welcome.showcase3d.item3.feat4', 'Dayanıklı yapı'),
      ],
      priceLabel: '€ 2.450,00 *',
    },
  ];
  const [view3D, setView3D] = useState<null | typeof SHOWCASE_3D[number]>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('script[data-model-viewer]')) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    s.setAttribute('data-model-viewer', 'true');
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!view3D) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setView3D(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view3D]);

  const handleVideoEnd = () => {
    setVideoIdx((i) => (i + 1) % Math.max(1, videoUrls.length));
  };

  // Banner JSX — BigGastro düzeninde kategori çubuklarının altında render edilir
  const bannerBlock = currentSlide && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      onClick={advanceBanner}
      title={t('welcome.bannerHint', 'Sonraki banner için tıkla')}
      className="group relative w-full max-w-6xl mb-12 overflow-hidden cursor-pointer aspect-[820/312] rounded-xl sm:rounded-2xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full flex flex-col justify-center px-5 sm:px-10 md:px-16"
          style={
            currentSlide.image
              ? { backgroundImage: `url(${currentSlide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: currentSlide.gradient }
          }
        >
          {!currentSlide.image && (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}
          {!currentSlide.image && (
            <div className="relative z-10 max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/70 mb-4">
                {currentSlide.eyebrow}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3 drop-shadow">
                {currentSlide.title}
              </h2>
              <p className="text-sm md:text-base text-white/80 max-w-xl">
                {currentSlide.subtitle}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#020817] to-transparent pointer-events-none" />
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setBannerIdx(i);
              }}
              aria-label={`Banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === bannerIdx ? 'w-8 bg-sky-300' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
        click → next
      </div>
    </motion.div>
  );

  return (
    <div className="welcome-2mc min-h-screen overflow-hidden relative">

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-3 sm:px-6 pt-4 sm:pt-8 pb-10">
        {/* ====== 2mcwerbung tarzı nav ====== */}
        <div className="wd-header w-full max-w-6xl mb-8 sm:mb-12 border-x border-b border-black/[0.06] bg-white">
          <div className="px-4 sm:px-8 h-[64px] flex items-center justify-between gap-4">
            {/* Left: nav links */}
            <nav className="flex items-center gap-6 sm:gap-8">
              {[
                { key: 'home', label: t('welcome.nav.home', 'Anasayfa'), to: '/dashboard', active: true },
                { key: 'contact', label: t('welcome.nav.contact', 'İletişim'), to: '#contact' },
                { key: 'enter', label: t('welcome.enterPlatform', 'Platforma Gir'), to: '/dashboard' },
                { key: 'login', label: t('welcome.nav.loginRegister', 'Giriş / Kayıt'), to: '/login' },
              ].map((n) => (
                <button
                  key={n.key}
                  onClick={() => n.to.startsWith('#') ? null : navigate(n.to)}
                  className={`text-[11px] sm:text-[13px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    n.active ? 'text-[rgb(40,120,191)]' : 'text-[#333] hover:text-[rgb(40,120,191)]'
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </nav>

            {/* Right: language selector */}
            <div className="flex items-center">
              <LanguageSelector variant="light" />
            </div>
          </div>

          {/* Modül ikonları şeridi */}
          <div className="border-t border-black/[0.04] bg-[#fafafa]">
            <div className="px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {[
                { Icon: Gem, label: 'DIAMOND', sub: t('welcome.modules.diamond', 'Katalog'), to: '/diamond' },
                { Icon: Box, label: 'COMBISTEEL', sub: t('welcome.modules.combisteel', 'Mağaza'), to: '/combisteel' },
                { Icon: PencilRuler, label: 'STUDIO', sub: t('welcome.modules.studio', 'Tasarım'), to: '/design' },
                { Icon: Repeat, label: t('welcome.modules.compareLabel', 'KARŞILAŞTIR'), sub: t('welcome.modules.compare', 'Ürün'), to: '/compare' },
                { Icon: FileText, label: t('welcome.modules.quoteLabel', 'TEKLİF'), sub: t('welcome.modules.quote', 'PDF'), to: '/payment' },
                { Icon: FolderKanban, label: t('welcome.modules.projectsLabel', 'PROJELER'), sub: t('welcome.modules.projects', 'Yönetim'), to: '/projects' },
              ].map((m) => {
                const Icon = m.Icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => navigate(m.to)}
                    className="group flex flex-col items-center gap-2 py-3 transition-all"
                  >
                    <Icon
                      strokeWidth={1.5}
                      className="text-[rgb(40,120,191)] group-hover:scale-110 transition-transform w-8 h-8 sm:w-12 sm:h-12"
                    />
                    <div className="text-[10px] sm:text-[13px] font-bold uppercase tracking-wider text-[#333] group-hover:text-[rgb(40,120,191)] text-center leading-tight">
                      {m.label}
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#999] hidden sm:block">{m.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== Banner ===== */}
        {bannerBlock}

        {/* ===== En Popüler Kategoriler — büyük daire ikonlar (BigGastro tarzı) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mb-16"
        >
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {t('welcome.popularCategories', 'En Popüler Kategoriler')}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
              ↓ Top 6
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {[
              { Icon: Flame,           label: t('welcome.cat.pizzaGrill', 'Pizza & Grill'),       q: 'pizza',     from: 'from-rose-500/20',   to: 'to-rose-600/5',   ring: 'border-rose-400/30',   text: 'text-rose-300' },
              { Icon: Snowflake,       label: t('welcome.cat.cooling', 'Soğutma'),              q: 'kühl',      from: 'from-sky-500/20',    to: 'to-sky-600/5',    ring: 'border-sky-400/30',    text: 'text-sky-300' },
              { Icon: Droplets,        label: t('welcome.cat.washing', 'Yıkama & Temizlik'),    q: 'spül',      from: 'from-cyan-500/20',   to: 'to-cyan-600/5',   ring: 'border-cyan-400/30',   text: 'text-cyan-300' },
              { Icon: Armchair,        label: t('welcome.cat.steelFurniture', 'Paslanmaz Mobilya'), q: 'edelstahl', from: 'from-slate-400/20',  to: 'to-slate-500/5',  ring: 'border-slate-300/30',  text: 'text-slate-200' },
              { Icon: Scissors,        label: t('welcome.cat.doughMachines', 'Hamur Makineleri'),   q: 'teig',      from: 'from-amber-500/20',  to: 'to-amber-600/5',  ring: 'border-amber-400/30',  text: 'text-amber-300' },
              { Icon: UtensilsCrossed, label: t('welcome.cat.cookingDevices', 'Pişirme Cihazları'), q: 'herd',      from: 'from-orange-500/20', to: 'to-orange-600/5', ring: 'border-orange-400/30', text: 'text-orange-300' },
            ].map((c, i) => {
              const Icon = c.Icon;
              return (
                <motion.button
                  key={c.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    navigate(`/diamond?q=${encodeURIComponent(c.q)}&concept=${encodeURIComponent(c.label)}`);
                  }}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${c.from} ${c.to} border-2 ${c.ring} flex items-center justify-center group-hover:scale-105 group-hover:border-opacity-80 transition-all shadow-lg shadow-black/30`}>
                    <div className="absolute inset-0 rounded-full bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
                    <Icon size={38} strokeWidth={1.6} className={`${c.text} relative z-10 group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-white/80 font-bold text-xs sm:text-sm tracking-tight group-hover:text-sky-300 transition-colors">
                    {c.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ===== Unsere Bestseller — ürün kartları şeridi (BigGastro tarzı) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mb-20"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {t('welcome.bestsellers', 'Unsere Bestseller')}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
              ↓ Top 4
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                id: 'BMIV15/R2',
                name: 'Kühltisch, Umluft, 2 Türen (245 L.)',
                img: 'https://diamond-eu-prod.s3.eu-central-1.amazonaws.com/media/76541/conversions/001-BMIV15-R2-big.jpg',
                price: 2082,
                badges: ['PREMIUM', 'EXPRESS'],
              },
              {
                id: '03D/6H',
                name: 'Geschirrspülmaschine, Korb 500×600 mm',
                img: 'https://diamond-eu-prod.s3.eu-central-1.amazonaws.com/media/61702/conversions/001-03D6H-big.jpg',
                price: 4029,
                badges: ['ANGEBOT', 'PREMIUM'],
              },
              {
                id: '015-25D/6',
                name: 'Durchschubspülmaschine, Korb 500×500 mm',
                img: 'https://diamond-eu-prod.s3.eu-central-1.amazonaws.com/media/61937/conversions/001-D6-big.jpg',
                price: 5175,
                badges: ['EMPFEHLUNG', 'PREMIUM'],
              },
              {
                id: 'DF45',
                name: 'Perforierter Ablageboden für Pizza Ø 450 mm',
                img: 'https://diamond-eu-prod.s3.eu-central-1.amazonaws.com/media/62426/conversions/001-DF26-big.jpg',
                price: 16,
                badges: ['EXPRESS'],
              },
            ].map((p, i) => {
              const badgeColor = (b: string) =>
                b === 'PREMIUM'    ? 'bg-amber-400 text-amber-950' :
                b === 'EXPRESS'    ? 'bg-rose-500 text-white' :
                b === 'ANGEBOT'    ? 'bg-red-600 text-white' :
                b === 'EMPFEHLUNG' ? 'bg-green-500 text-green-950' :
                                     'bg-sky-400 text-sky-950';
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate('/diamond')}
                  className="group relative bg-white rounded-xl overflow-hidden border border-white/10 hover:border-sky-400/60 hover:shadow-xl hover:shadow-sky-500/10 transition-all text-left flex flex-col"
                >
                  {/* Badges (sol üst, sarı-turuncu ribbon tarzı) */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5">
                    {p.badges.map((b) => (
                      <span
                        key={b}
                        className={`relative text-[9px] font-black uppercase tracking-wider px-2 py-0.5 ${badgeColor(b)}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%)' }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Resim */}
                  <div className="aspect-square bg-white flex items-center justify-center p-4">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Meta */}
                  <div className="p-3 bg-white flex-1 flex flex-col border-t border-black/[0.05]">
                    <h4 className="text-[#222] font-semibold text-[12px] leading-snug line-clamp-2 min-h-[32px] group-hover:text-[rgb(40,120,191)] transition-colors">
                      {p.name}
                    </h4>
                    <div className="text-[10px] text-[#888] mt-1">Art.Nr.: {p.id}</div>
                    <div className="mt-2 text-[rgb(200,30,40)] font-black text-base">
                      {p.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € *
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ===== Araçlarımız — AI Planlayıcı + Hesap Aracı + 3D Tasarım ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mb-20"
        >
          <div className="text-center mb-12">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full mb-4">
              {t('welcome.tools.badge', 'Araçlar')}
            </span>
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {t('welcome.toolsTitle', 'Akıllı Mutfak Araçları')}
            </h3>
            <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">
              {t('welcome.tools.subtitle', 'AI planlama, kapasite hesabı ve 3D tasarım — tek platformda')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Sparkles,
                title: t('welcome.tools.aiPlanner.title', 'AI Mutfak Planlayıcı'),
                desc: t('welcome.tools.aiPlanner.desc', 'Yapay zeka işletme tipinize göre eksiksiz ekipman listesi çıkarır. Metrekare, kapasite ve bütçeye göre öneriler.'),
                badge: t('welcome.tools.aiPlanner.badge', 'YAPAY ZEKA'),
                gradient: 'from-sky-500 to-blue-600',
                iconColor: 'text-sky-400',
                steps: [
                  { Icon: Building2,  label: t('welcome.tools.aiPlanner.step1', 'İşletme tipi') },
                  { Icon: Ruler,      label: t('welcome.tools.aiPlanner.step2', 'Alan & kuver') },
                  { Icon: ListOrdered,label: t('welcome.tools.aiPlanner.step3', 'Ekipman listesi') },
                ],
              },
              {
                Icon: Calculator,
                title: t('welcome.tools.capacity.title', 'Kapasite Hesap Aracı'),
                desc: t('welcome.tools.capacity.desc', 'Günlük kuver, menü tipi ve alan bilgileriyle ocak, fırın, soğutma ve bulaşık kapasitelerini anında hesaplayın.'),
                badge: t('welcome.tools.capacity.badge', 'HESAPLAMA'),
                gradient: 'from-emerald-500 to-teal-600',
                iconColor: 'text-emerald-400',
                steps: [
                  { Icon: UtensilsCrossed, label: t('welcome.tools.capacity.step1', 'Menü tipi') },
                  { Icon: Flame,           label: t('welcome.tools.capacity.step2', 'Pişirme') },
                  { Icon: Snowflake,       label: t('welcome.tools.capacity.step3', 'Soğutma') },
                  { Icon: Droplets,        label: t('welcome.tools.capacity.step4', 'Bulaşık') },
                ],
              },
              {
                Icon: PencilRuler,
                title: t('welcome.tools.studio3d.title', '3D Tasarım Stüdyosu'),
                desc: t('welcome.tools.studio3d.desc', 'Mutfağınızı sürükle-bırak ile 3D modelleyin, ekipmanları yerleştirin ve teklifinizi tek tıkla PDF olarak alın.'),
                badge: '3D STUDIO',
                gradient: 'from-fuchsia-500 to-purple-600',
                iconColor: 'text-fuchsia-400',
                steps: [
                  { Icon: LayoutGrid, label: t('welcome.tools.studio3d.step1', 'Plan çiz') },
                  { Icon: Box,        label: t('welcome.tools.studio3d.step2', '3D yerleştir') },
                  { Icon: FileText,   label: t('welcome.tools.studio3d.step3', 'PDF teklif') },
                ],
              },
            ].map((tool, i) => {
              const Icon = tool.Icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] p-7 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
                >
                  {/* hover glow */}
                  <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-[0.08] blur-3xl transition-opacity duration-700 pointer-events-none`} />

                  <div className="relative z-10 flex flex-col h-full min-h-[260px]">
                    {/* icon + badge row */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon size={22} strokeWidth={1.8} className="text-white" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${tool.iconColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <h4 className="text-white font-bold text-xl tracking-tight mb-2">
                      {tool.title}
                    </h4>
                    <p className="text-white/45 text-[13.5px] leading-relaxed flex-1">
                      {tool.desc}
                    </p>

                    {/* steps */}
                    <div className="mt-6 flex items-center gap-2">
                      {tool.steps.map((s, idx) => {
                        const SIcon = s.Icon;
                        return (
                          <div key={s.label} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/[0.05] rounded-full px-3 py-1.5">
                              <SIcon size={13} strokeWidth={2} className={tool.iconColor} />
                              <span className="text-[11px] font-medium text-white/60">
                                {s.label}
                              </span>
                            </div>
                            {idx < tool.steps.length - 1 && (
                              <ArrowRight size={11} className="text-white/20 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ===== 3D Showcase Banner — GLB model görüntüleyici ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mb-20"
        >
          <div className="mb-8">
            <h3 className="text-white font-black text-3xl md:text-4xl tracking-tight leading-none">
              {t('welcome.showcase3d.title', '3D Ürün')} <span className="text-sky-300">{t('welcome.showcase3d.titleAccent', 'Vitrini')}</span>
            </h3>
            <p className="text-white/50 text-sm mt-3 max-w-md">
              {t('welcome.showcase3d.subtitle', 'Modelleri döndürün, yakınlaştırın · karta tıklayın ve tüm detayları inceleyin')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {SHOWCASE_3D.map((m, i) => (
              <motion.button
                key={m.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setView3D(m)}
                className="group relative text-left rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="relative p-5 sm:p-6">
                  <div className="relative aspect-[5/4] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                    <span className="absolute top-3 left-3 z-10 text-[9px] font-mono uppercase tracking-[0.18em] px-2 py-1 rounded-full border border-slate-200 bg-white/90 text-slate-700 backdrop-blur">
                      {m.tag}
                    </span>
                    {/* @ts-expect-error model-viewer custom element */}
                    <model-viewer
                      src={m.src}
                      alt={m.title}
                      auto-rotate
                      auto-rotate-delay="0"
                      rotation-per-second="22deg"
                      camera-controls
                      interaction-prompt="none"
                      disable-zoom
                      shadow-intensity="1"
                      shadow-softness="0.9"
                      exposure="1.1"
                      environment-image="neutral"
                      style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 font-black text-lg sm:text-xl tracking-tight truncate">
                        {m.title}
                      </h4>
                      <p className="text-slate-500 text-[12px] mt-1 truncate font-medium">
                        {m.priceLabel ?? m.subtitle}
                      </p>
                    </div>
                    <div className="shrink-0 w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-sky-500 group-hover:border-sky-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ===== Entdecken Sie unsere Themenwelten — iş kolu odaklı kategoriler ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mb-16"
        >
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400/70 mb-2">
                // THEMENWELTEN
              </div>
              <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
                {t('welcome.themedWorlds', 'İşletmenize Özel Çözümler')}
              </h3>
              <p className="text-white/40 text-sm mt-1">
                {t('welcome.themedWorlds.subtitle', '14 iş kolu · her konsept için eksiksiz ekipman seti')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
            {[
              { Icon: ChefHat,        label: t('welcome.theme.doner', 'Dönerci'),           q: 'döner',       gradient: 'from-orange-500/30 via-red-500/20 to-amber-700/10', ring: 'border-orange-400/40' },
              { Icon: Pizza,          label: t('welcome.theme.pizzeria', 'Pizzeria'),       q: 'pizza',       gradient: 'from-red-500/30 via-rose-600/20 to-yellow-600/10', ring: 'border-red-400/40' },
              { Icon: Sandwich,       label: t('welcome.theme.imbiss', 'Büfe'),             q: 'fritöz',      gradient: 'from-yellow-500/30 via-orange-500/20 to-red-500/10', ring: 'border-yellow-400/40' },
              { Icon: Utensils,       label: t('welcome.theme.restaurant', 'Restoran'),     q: 'ocak',        gradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-600/10', ring: 'border-emerald-400/40' },
              { Icon: Coffee,         label: t('welcome.theme.cafe', 'Café'),               q: 'kahve',       gradient: 'from-amber-700/30 via-amber-600/20 to-stone-700/10', ring: 'border-amber-500/40' },
              { Icon: IceCream,       label: t('welcome.theme.iceCream', 'Dondurmacı'),     q: 'dondurma',    gradient: 'from-pink-400/30 via-rose-400/20 to-fuchsia-500/10', ring: 'border-pink-400/40' },
              { Icon: Soup,           label: t('welcome.theme.asian', 'Asya Mutfağı'),      q: 'wok',         gradient: 'from-lime-500/30 via-green-600/20 to-emerald-700/10', ring: 'border-lime-400/40' },
              { Icon: Cookie,         label: t('welcome.theme.bakery', 'Pastane'),          q: 'fırın',       gradient: 'from-amber-400/30 via-yellow-500/20 to-orange-500/10', ring: 'border-amber-300/40' },
              { Icon: Beef,           label: t('welcome.theme.butcher', 'Kasap'),           q: 'et',          gradient: 'from-rose-600/30 via-red-700/20 to-red-900/10', ring: 'border-rose-500/40' },
              { Icon: Martini,        label: t('welcome.theme.bar', 'Bar & Pub'),           q: 'bar',         gradient: 'from-fuchsia-500/30 via-purple-600/20 to-indigo-700/10', ring: 'border-fuchsia-400/40' },
              { Icon: ShoppingBasket, label: t('welcome.theme.market', 'Market'),           q: 'buzdolabı',   gradient: 'from-green-500/30 via-emerald-600/20 to-teal-700/10', ring: 'border-green-400/40' },
              { Icon: Package,        label: t('welcome.theme.catering', 'Catering'),       q: 'gastronorm',  gradient: 'from-sky-500/30 via-blue-600/20 to-indigo-700/10', ring: 'border-sky-400/40' },
              { Icon: Building2,      label: t('welcome.theme.hotel', 'Otel'),              q: 'hotel',       gradient: 'from-violet-500/30 via-indigo-600/20 to-slate-700/10', ring: 'border-violet-400/40' },
              { Icon: Truck,          label: t('welcome.theme.foodTruck', 'Food Truck'),    q: 'truck',       gradient: 'from-cyan-500/30 via-sky-600/20 to-blue-800/10', ring: 'border-cyan-400/40' },
            ].map((w, i) => {
              const Icon = w.Icon;
              return (
                <motion.button
                  key={w.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                  onClick={() => navigate(`/diamond?q=${encodeURIComponent(w.q)}&concept=${encodeURIComponent(w.label)}`)}
                  className="group flex flex-col items-center gap-2.5"
                >
                  <div className={`relative w-full aspect-square rounded-full bg-gradient-to-br ${w.gradient} border-2 ${w.ring} flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all shadow-lg shadow-black/20`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/5 blur-2xl" />
                    <Icon size={28} strokeWidth={1.6} className="relative z-10 text-white/95 group-hover:scale-110 transition-transform drop-shadow" />
                  </div>
                  <span className="text-white/70 font-semibold text-[11px] sm:text-xs tracking-tight text-center group-hover:text-sky-300 transition-colors">
                    {w.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Trust badges — BigGastro tarzı 4'lü güven şeridi */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden">
            {[
              { Icon: Globe, title: t('welcome.trust.euroBiggest', 'Avrupa\'nın En Büyük'), sub: t('welcome.trust.euroBiggestSub', 'Endüstriyel gastro tedarikçisi') },
              { Icon: Truck, title: t('welcome.trust.freeShipping', 'Ücretsiz Teslimat'),    sub: t('welcome.trust.freeShippingSub', 'Tüm Avrupa geneli') },
              { Icon: Tag,   title: t('welcome.trust.priceGuarantee', 'Düşük Fiyat Garantisi'), sub: t('welcome.trust.priceGuaranteeSub', 'En iyi fiyat taahhüdü') },
              { Icon: Zap,   title: t('welcome.trust.expressCargo', 'Ekspres Kargo'),         sub: t('welcome.trust.expressCargoSub', '24-48 saat içinde') },
            ].map((b, i) => {
              const Icon = b.Icon;
              return (
                <div
                  key={b.title}
                  className="bg-[#020817] px-5 py-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center">
                    <Icon size={18} className="text-sky-300" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-[12px] tracking-tight leading-tight">{b.title}</div>
                    <div className="text-white/40 text-[10px] leading-tight mt-0.5">{b.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ===== Video Carousel ===== */}
        {videoUrls.length > 0 && (
          <div className="w-full max-w-6xl mb-20">
            {/* Top meta bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 border-b border-white/[0.06] pb-3 mb-10"
            >
              <span>// 2MC—GASTRO / INDEX_001</span>
              <span className="hidden md:block">EST. 2010 · ANTALYA / TR</span>
              <span className="text-sky-400">● ONLINE</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full rounded-2xl overflow-hidden bg-black"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={videoIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full aspect-video"
                >
                  <video
                    ref={videoRef}
                    src={videoUrls[videoIdx]}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Video indicators */}
              {videoUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {videoUrls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setVideoIdx(i)}
                      aria-label={`Video ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === videoIdx ? 'w-8 bg-sky-300' : 'w-1.5 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur">
                    {String(videoIdx + 1).padStart(2, '0')} / {String(videoUrls.length).padStart(2, '0')}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ===== Stats ticker strip ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-6xl mb-20 border-y border-white/[0.08] py-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { value: '10.000+', labelKey: 'welcome.statProducts', n: '01' },
              { value: '50+', labelKey: 'welcome.statBrands', n: '02' },
              { value: '3D', labelKey: 'welcome.statPlanning', n: '03' },
              { value: '∞', labelKey: 'welcome.statProjects', n: '04' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="px-6 group"
              >
                <div className="text-[10px] font-mono text-sky-400/60 mb-2">[{s.n}]</div>
                <div className="font-headline text-4xl md:text-5xl font-black text-white tracking-tight group-hover:text-sky-300 transition-colors">
                  {s.value}
                </div>
                <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.18em] mt-2">
                  {t(s.labelKey)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== Explore — Categories + Site Map (unified) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-6xl mb-20"
        >
          {/* Header + tab switch */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400/70 mb-2">
                // EXPLORE / 2MC—GASTRO
              </div>
              <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
                {exploreTab === 'categories' ? t('welcome.explore.catHeading', 'Ürün Kategorileri') : t('welcome.explore.pagesHeading', 'Site Mimarisi')}
              </h3>
              <p className="text-white/40 text-sm mt-1">
                {exploreTab === 'categories'
                  ? t('welcome.explore.catSubtitle', '8 ana kategori · 6.300+ ürün')
                  : t('welcome.explore.pagesSubtitle', '14 sayfa · tüm deneyim noktaları')}
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur self-start sm:self-end">
              {([
                { k: 'categories', label: t('welcome.explore.tabCategories', 'Kategoriler') },
                { k: 'pages',      label: t('welcome.explore.tabPages', 'Sayfalar') },
              ] as const).map((tab) => {
                const active = exploreTab === tab.k;
                return (
                  <button
                    key={tab.k}
                    onClick={() => setExploreTab(tab.k)}
                    className={`relative px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] rounded-full transition-colors ${
                      active ? 'text-[#020817]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="exploreTabPill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-300 to-blue-400"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {exploreTab === 'categories' ? (
              <motion.div
                key="cats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06]"
              >
                {[
                  { Icon: Flame,            name: t('welcome.explore.cat1', 'Pişirme Ekipmanları'), sub: t('welcome.explore.cat1Sub', 'Ocak, Fırın, Izgara, Fritöz, Pizza Fırını') },
                  { Icon: Snowflake,        name: t('welcome.explore.cat2', 'Soğutma & Dondurma'),  sub: t('welcome.explore.cat2Sub', 'Buzdolabı, Dondurucu, Salatbar, Blast Chiller') },
                  { Icon: Droplets,         name: t('welcome.explore.cat3', 'Yıkama & Hijyen'),     sub: t('welcome.explore.cat3Sub', 'Bulaşık & Bardak Makinesi, El Yıkama') },
                  { Icon: Scissors,         name: t('welcome.explore.cat4', 'Hazırlama & Kesme'),   sub: t('welcome.explore.cat4Sub', 'Sebze Doğrama, Et Kıyma, Dilimleyici') },
                  { Icon: Armchair,         name: t('welcome.explore.cat5', 'Mobilya & Paslanmaz'), sub: t('welcome.explore.cat5Sub', 'Tezgah, Raf, Arabalar, Evye, Davlumbaz') },
                  { Icon: Coffee,           name: t('welcome.explore.cat6', 'İçecek & Bar'),        sub: t('welcome.explore.cat6Sub', 'Espresso, Blender, Sıkacak, Bar') },
                  { Icon: UtensilsCrossed,  name: t('welcome.explore.cat7', 'Servis & Sunum'),      sub: t('welcome.explore.cat7Sub', 'Tabak, Bardak, Servis Arabası, Chafing') },
                  { Icon: Package,          name: t('welcome.explore.cat8', 'Paketleme & Teslimat'),sub: t('welcome.explore.cat8Sub', 'Vakum, Folyo, Teslimat Çantası') },
                ].map((cat, i) => {
                  const Icon = cat.Icon;
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <motion.button
                      key={cat.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate('/diamond')}
                      className="group relative bg-[#020817] p-6 hover:bg-white/[0.03] transition-all text-left min-h-[170px] flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-600/5 border border-sky-400/20 flex items-center justify-center group-hover:border-sky-300/50 group-hover:from-sky-400/25 transition-all">
                          <Icon size={20} strokeWidth={1.8} className="text-sky-300 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-[9px] font-mono text-white/25">[{num}]</span>
                      </div>
                      <h4 className="text-white font-bold text-sm tracking-tight mb-1.5 group-hover:text-sky-300 transition-colors">{cat.name}</h4>
                      <p className="text-white/40 text-[11px] leading-snug flex-1">{cat.sub}</p>
                      <ArrowRight size={14} className="mt-3 text-white/20 group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="pages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06]"
              >
                {[
                  { Icon: Home,            title: t('welcome.explore.page.home', 'Anasayfa'),           desc: t('welcome.explore.page.homeDesc', 'Hero, kategoriler, öneriler'),       tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/welcome' },
                  { Icon: LayoutGrid,      title: t('welcome.explore.page.catList', 'Kategori Listesi'), desc: t('welcome.explore.page.catListDesc', 'Filtreleme, sıralama, grid/list'),   tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/diamond' },
                  { Icon: Box,             title: t('welcome.explore.page.prodDetail', 'Ürün Detay'),    desc: t('welcome.explore.page.prodDetailDesc', 'Galeri, spec, fiyat, stok'),         tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/diamond' },
                  { Icon: ShoppingCart,    title: t('welcome.explore.page.cart', 'Sepet'),               desc: t('welcome.explore.page.cartDesc', 'Slide-over + tam sayfa, özet'),      tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/cart' },
                  { Icon: CreditCard,      title: t('welcome.explore.page.payment', 'Ödeme'),           desc: t('welcome.explore.page.paymentDesc', '3 adım: bilgi → kargo → ödeme'),     tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/payment' },
                  { Icon: Search,          title: t('welcome.explore.page.search', 'Arama Sonuçları'),  desc: t('welcome.explore.page.searchDesc', 'Anlık öneriler, filtreler'),         tag: t('welcome.explore.tagCritical', 'KRİTİK'),       tagType: 'critical', to: '/diamond' },
                  { Icon: User,            title: t('welcome.explore.page.account', 'Kullanıcı Hesabı'),desc: t('welcome.explore.page.accountDesc', 'Siparişler, adres, favoriler'),      tag: t('welcome.explore.tagImportant', 'ÖNEMLİ'),       tagType: 'important', to: '/profile' },
                  { Icon: Building2,       title: t('welcome.explore.page.b2b', 'B2B Portal'),          desc: t('welcome.explore.page.b2bDesc', 'Toplu fiyat, teklif, fatura'),       tag: t('welcome.explore.tagImportant', 'ÖNEMLİ'),       tagType: 'important', to: '/projects' },
                  { Icon: Newspaper,       title: t('welcome.explore.page.blog', 'Blog / Rehber'),      desc: t('welcome.explore.page.blogDesc', 'SEO içerikleri, rehberler'),         tag: t('welcome.explore.tagImportant', 'ÖNEMLİ'),       tagType: 'important', to: '/docs' },
                  { Icon: Scale,           title: t('welcome.explore.page.compare', 'Karşılaştırma'),   desc: t('welcome.explore.page.compareDesc', '2–4 ürün yan yana'),                 tag: t('welcome.explore.tagDifferentiator', 'FARK YARATAN'), tagType: 'differentiator', to: '/diamond' },
                  { Icon: Calculator,      title: t('welcome.explore.page.planner', 'Mutfak Planlayıcı'),desc: t('welcome.explore.page.plannerDesc', 'AI-destekli ekipman planlama'),      tag: t('welcome.explore.tagDifferentiator', 'FARK YARATAN'), tagType: 'differentiator', to: '/design' },
                ].map((p, i) => {
                  const Icon = p.Icon;
                  const ring =
                    p.tagType === 'critical'       ? 'from-rose-500/15 to-rose-600/5 border-rose-400/25 text-rose-300' :
                    p.tagType === 'important'      ? 'from-amber-500/15 to-amber-600/5 border-amber-400/25 text-amber-300' :
                    p.tagType === 'differentiator' ? 'from-sky-500/15 to-blue-600/5 border-sky-400/25 text-sky-300' :
                                                     'from-white/10 to-white/0 border-white/15 text-white/60';
                  const tagColor =
                    p.tagType === 'critical'       ? 'text-rose-300 bg-rose-500/10 border-rose-500/20' :
                    p.tagType === 'important'      ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' :
                    p.tagType === 'differentiator' ? 'text-sky-300 bg-sky-500/10 border-sky-500/20' :
                                                     'text-white/50 bg-white/[0.03] border-white/10';
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <motion.button
                      key={p.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => navigate(p.to)}
                      className="group relative bg-[#020817] p-5 hover:bg-white/[0.03] transition-all text-left min-h-[180px] flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ring} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <span className="text-[9px] font-mono text-white/25">[{num}]</span>
                      </div>
                      <h4 className="text-white font-bold text-sm tracking-tight mb-1.5 group-hover:text-sky-300 transition-colors">{p.title}</h4>
                      <p className="text-white/40 text-[11px] leading-snug flex-1">{p.desc}</p>
                      <span className={`mt-3 inline-flex self-start text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${tagColor}`}>
                        {p.tag}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== Features — numbered editorial list ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-6xl mb-20"
        >
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {t('welcome.featuresHeading', 'Capabilities')}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
              ↓ 04 Modules
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
            {FEATURES_KEYS.map((f, i) => {
              const Icon = f.icon;
              const num = String(i + 1).padStart(2, '0');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="group relative bg-[#020817] p-7 hover:bg-white/[0.03] transition-all cursor-default"
                >
                  <div className="flex items-start gap-5">
                    <div className="text-[10px] font-mono text-sky-400/60 pt-1">[{num}]</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon size={20} className="text-sky-300 group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-bold text-base tracking-tight">{t(f.titleKey)}</h4>
                      </div>
                      <p className="text-white/45 text-sm leading-relaxed">{t(f.descKey)}</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ============ ABOUT / CONTACT / REVIEWS ============ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl mt-8 mb-16"
        >
          {/* Section heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
                {t('welcome.aboutBadge', '2MC Gastro Hakkında')}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
              {t('welcome.aboutTitle', 'Endüstriyel Mutfağın')}{' '}
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                {t('welcome.aboutTitleAccent', 'Dijital Çözüm Ortağı')}
              </span>
            </h3>
            <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
              {t('welcome.aboutDescription', '15+ yıllık tecrübemizle Türkiye ve Avrupa\'nın önde gelen markalarına profesyonel mutfak ekipmanları, 3D tasarım ve teklif hazırlama hizmetleri sunuyoruz.')}
            </p>
          </div>

          {/* Stats / highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Award, value: '15+', label: t('welcome.aboutYears', 'Yıl Tecrübe') },
              { icon: CheckCircle2, value: '500+', label: t('welcome.aboutProjects', 'Tamamlanan Proje') },
              { icon: Refrigerator, value: '10.000+', label: t('welcome.aboutEquipment', 'Ekipman Modeli') },
              { icon: Star, value: '4.9/5', label: t('welcome.aboutRating', 'Müşteri Puanı') },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-blue-500/30 transition-all"
                >
                  <Icon size={20} className="text-blue-400 mb-2" />
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-white/40 text-xs mt-1">{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Google Reviews — full-width banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/[0.10] via-amber-500/[0.04] to-transparent border border-white/[0.08] backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 md:gap-10 items-center">
              {/* Left — rating */}
              <div className="flex flex-col items-start md:items-center md:border-r md:border-white/[0.08] md:pr-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                    <Star size={22} className="text-amber-400 fill-amber-400" />
                  </div>
                  <h4 className="text-white font-bold text-xl">{t('welcome.reviewsTitle', 'Google Yorumları')}</h4>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-black text-white leading-none">4.9</span>
                  <span className="text-white/40 text-base pb-2">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/50 text-xs">
                  {t('welcome.reviewsCount', '320+ doğrulanmış Google yorumu')}
                </p>
              </div>

              {/* Middle — bar chart */}
              <div className="space-y-3 w-full max-w-xl">
                {[
                  { label: '5★', pct: 92 },
                  { label: '4★', pct: 6 },
                  { label: '3★', pct: 2 },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3 text-sm">
                    <span className="text-white/60 w-8">{r.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                      />
                    </div>
                    <span className="text-white/50 w-10 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Right — CTA */}
              <div className="flex md:justify-end">
                <a
                  href="https://www.google.com/search?q=2mc+gastro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 hover:text-amber-100 text-sm font-semibold transition-all whitespace-nowrap"
                >
                  {t('welcome.reviewsCta', 'Tüm yorumları gör')}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Blog Preview */}
        <BlogPreviewSection />

        {/* Newsletter */}
        <NewsletterSection />

        {/* ===== Bottom Quick Links (Contact / About / FAQ) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mt-8 mb-10"
        >
          <div className="flex items-baseline justify-between mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400/70">
              // QUICK LINKS
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
              ↓ {t('welcome.quickLinks.heading', 'Yardım & İletişim')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06]">
            {[
              { Icon: PhoneCall,  title: t('welcome.quickLinks.contact', 'İletişim'),   desc: t('welcome.quickLinks.contactDesc', 'Form, harita, telefon, WhatsApp'), tag: t('welcome.explore.tagImportant', 'ÖNEMLİ'),   to: '/support', ring: 'from-amber-500/15 to-amber-600/5 border-amber-400/25 text-amber-300', tagColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
              { Icon: Info,       title: t('welcome.quickLinks.about', 'Hakkımızda'), desc: t('welcome.quickLinks.aboutDesc', 'Hikâye, değerler, ekip'),          tag: t('welcome.quickLinks.tagStandard', 'STANDART'), to: '/brand',   ring: 'from-white/10 to-white/0 border-white/15 text-white/70',             tagColor: 'text-white/60 bg-white/[0.03] border-white/10' },
              { Icon: HelpCircle, title: t('welcome.quickLinks.faq', 'SSS / Yardım'), desc: t('welcome.quickLinks.faqDesc', 'Sık sorulanlar, kargo, iade'),   tag: t('welcome.quickLinks.tagStandard', 'STANDART'), to: '/docs',    ring: 'from-white/10 to-white/0 border-white/15 text-white/70',             tagColor: 'text-white/60 bg-white/[0.03] border-white/10' },
            ].map((q, i) => {
              const Icon = q.Icon;
              const num = String(i + 1).padStart(2, '0');
              return (
                <motion.button
                  key={q.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(q.to)}
                  className="group relative bg-[#020817] p-6 hover:bg-white/[0.03] transition-all text-left flex items-start gap-4"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${q.ring} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm tracking-tight group-hover:text-sky-300 transition-colors">{q.title}</h4>
                      <span className="text-[9px] font-mono text-white/25">[{num}]</span>
                    </div>
                    <p className="text-white/40 text-[11px] leading-snug mb-2">{q.desc}</p>
                    <span className={`inline-flex text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${q.tagColor}`}>
                      {q.tag}
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-sky-300 group-hover:translate-x-1 transition-all mt-1" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-white/20 text-xs text-center pt-6 border-t border-white/[0.04] w-full max-w-6xl"
        >
          <div className="pt-6">{t('welcome.copyright')}</div>
        </motion.div>
      </div>

      {/* 3D Showcase Detail Modal */}
      <AnimatePresence>
        {view3D && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setView3D(null)}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-[#0b1220] via-[#0a0f1e] to-[#05080f] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

              <div className={`relative flex-1 bg-gradient-to-br ${view3D.accent} border-b md:border-b-0 md:border-r ${view3D.ring}`}>
                <div className="absolute inset-0 bg-[#020817]/40 pointer-events-none" />
                {/* @ts-expect-error model-viewer custom element */}
                <model-viewer
                  src={view3D.src}
                  alt={view3D.title}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1.1"
                  exposure="1.1"
                  style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/15 bg-black/50 text-white/60">
                  {t('welcome.showcase3d.modal.hint', 'Döndür · Yakınlaştır · Sürükle')}
                </div>
              </div>

              <div className="relative w-full md:w-[380px] shrink-0 flex flex-col overflow-y-auto">
                <button
                  onClick={() => setView3D(null)}
                  aria-label={t('welcome.showcase3d.modal.close', 'Kapat')}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                >
                  <span className="text-lg leading-none">×</span>
                </button>

                <div className="p-6 pb-4">
                  <div className={`inline-flex self-start text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-1 rounded-full border ${view3D.ring} bg-black/40 ${view3D.text} mb-4`}>
                    {view3D.tag} · 3D
                  </div>

                  <h3 className="text-white font-black text-2xl tracking-tight leading-tight mb-2">
                    {view3D.title}
                  </h3>
                  <p className={`text-sm font-semibold ${view3D.text} mb-3`}>{view3D.subtitle}</p>
                  <p className="text-white/60 text-[13px] leading-relaxed">{view3D.desc}</p>

                  {view3D.priceLabel && (
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">{t('welcome.showcase3d.modal.catalogPrice', 'Katalog fiyatı')}</span>
                      <span className={`text-xl font-black ${view3D.text}`}>{view3D.priceLabel}</span>
                    </div>
                  )}
                </div>

                {/* Teknik özellikler */}
                <div className="px-6 py-4 border-t border-white/5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40 mb-3">
                    {t('welcome.showcase3d.modal.techSpecs', 'Teknik Özellikler')}
                  </div>
                  <div className="space-y-1">
                    {view3D.specs.map((r) => (
                      <div key={r.k} className="flex items-center justify-between text-[12px] py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-white/45 font-mono uppercase tracking-wider text-[10px]">{r.k}</span>
                        <span className="text-white/85 font-semibold text-right">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Öne çıkan özellikler */}
                <div className="px-6 py-4 border-t border-white/5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40 mb-3">
                    {t('welcome.showcase3d.modal.highlights', 'Öne Çıkan Özellikler')}
                  </div>
                  <ul className="space-y-1.5">
                    {view3D.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-white/70 leading-snug">
                        <CheckCircle2 size={13} className={`${view3D.text} mt-0.5 shrink-0`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

<div className="mt-auto p-6 pt-4 flex flex-col gap-2 border-t border-white/5 bg-black/20">
                  <button
                    onClick={() => { setView3D(null); navigate('/diamond'); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {t('welcome.showcase3d.modal.exploreBtn', 'Katalogda Keşfet')} <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setView3D(null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors"
                  >
                    {t('welcome.showcase3d.modal.closeBtn', 'Kapat')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Live Chat (global) */}
      <LiveChatWidget />

      <SiteFooter />
    </div>
  );
}
