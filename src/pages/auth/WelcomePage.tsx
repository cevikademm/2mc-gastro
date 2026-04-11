import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useBannerStore } from '../../stores/bannerStore';
import {
  Ruler, Refrigerator, Shield, BarChart3,
  ArrowRight, Sparkles, Star, MapPin, Phone, Mail, Clock,
  Instagram, Facebook, Linkedin, Youtube, ExternalLink, Award, CheckCircle2,
  Menu, ChevronDown, Heart, Repeat, Gem, Box, PencilRuler, ListOrdered, FileText, FolderKanban
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
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

const SOCIAL_LINKS = [
  { Icon: Instagram, href: 'https://www.instagram.com/2mcwerbung', label: 'Instagram' },
  { Icon: Facebook, href: 'https://www.facebook.com/2mcwerbung', label: 'Facebook' },
  { Icon: Youtube, href: 'https://www.tiktok.com/@2mcwerbung', label: 'TikTok' },
  { Icon: Linkedin, href: 'https://api.whatsapp.com/send/?phone=4917670295844', label: 'WhatsApp' },
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setVideoIdx((i) => (i + 1) % Math.max(1, videoUrls.length));
  };

  return (
    <div className="welcome-2mc min-h-screen overflow-hidden relative">

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-3 sm:px-6 pt-4 sm:pt-8 pb-10">
        {/* ===== Top Banner Carousel (managed via Settings → Banners) ===== */}
        {currentSlide && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            onClick={advanceBanner}
            title={t('welcome.bannerHint', 'Sonraki banner için tıkla')}
            className="group relative w-full max-w-6xl mb-0 overflow-hidden cursor-pointer aspect-[820/312] rounded-xl sm:rounded-2xl"
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
                    ? {
                        backgroundImage: `url(${currentSlide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
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
                {/* Text overlay yalnızca image YOKSA gösterilir.
                    Canva banner görselleri başlığı zaten içerdiği için
                    image varken overlay basmak çift metin yaratıyordu. */}
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
        )}

        {/* ====== 2mcwerbung tarzı nav (banner ALTI) ====== */}
        <div className="wd-header w-full max-w-6xl mb-8 sm:mb-12 border-x border-b border-black/[0.06] bg-white">
          <div className="px-3 sm:px-6 py-3 sm:h-[60px] flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {[
              { key: 'home', label: t('welcome.nav.home', 'Anasayfa'), to: '/dashboard', active: true },
              { key: 'contact', label: t('welcome.nav.contact', 'İletişim'), to: '#contact' },
              { key: 'enter', label: t('welcome.enterPlatform', 'Platforma Gir'), to: '/dashboard' },
              { key: 'login', label: t('welcome.nav.loginRegister', 'Giriş / Kayıt'), to: '/login' },
            ].map((n) => (
              <button
                key={n.key}
                onClick={() => n.to.startsWith('#') ? null : navigate(n.to)}
                className={`text-[11px] sm:text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                  n.active ? 'text-[rgb(40,120,191)]' : 'text-[#333] hover:text-[rgb(40,120,191)]'
                }`}
              >
                {n.label}
              </button>
            ))}
            <button className="relative flex items-center gap-2 text-[11px] sm:text-[13px] font-semibold uppercase tracking-wider text-[#333] hover:text-[rgb(40,120,191)]">
              <span className="relative">
                <Repeat size={18} />
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[rgb(40,120,191)] text-white text-[9px] font-bold flex items-center justify-center">0</span>
              </span>
              <span>{t('welcome.nav.compare', 'Karşılaştır')}</span>
            </button>
            <LanguageSelector variant="light" />
          </div>

          {/* Modül ikonları şeridi */}
          <div className="border-t border-black/[0.04] bg-[#fafafa]">
            <div className="px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {[
                { Icon: Gem, label: 'DIAMOND', sub: t('welcome.modules.diamond', 'Katalog'), to: '/diamond' },
                { Icon: Box, label: 'COMBISTEEL', sub: t('welcome.modules.combisteel', 'Mağaza'), to: '/combisteel' },
                { Icon: PencilRuler, label: 'STUDIO', sub: t('welcome.modules.studio', 'Tasarım'), to: '/design' },
                { Icon: Repeat, label: 'KARŞILAŞTIR', sub: t('welcome.modules.compare', 'Ürün'), to: '/compare' },
                { Icon: FileText, label: 'TEKLIF', sub: t('welcome.modules.quote', 'PDF'), to: '/payment' },
                { Icon: FolderKanban, label: 'PROJELER', sub: t('welcome.modules.projects', 'Yönetim'), to: '/projects' },
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
              { value: '6.800+', labelKey: 'welcome.statProducts', n: '01' },
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

        {/* ===== Category Grid ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="w-full max-w-6xl mb-20"
        >
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {t('welcome.categoriesTitle', 'Ürün Kategorileri')}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
              ↓ 6.300+ {t('welcome.statProducts', 'Ürün')}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06]">
            {[
              { emoji: '❄️', name: t('welcome.cat_cooling', 'Soğutma'), count: 1775 },
              { emoji: '🔥', name: t('welcome.cat_cooking', 'Pişirme'), count: 1439 },
              { emoji: '🧹', name: t('welcome.cat_prep', 'Hazırlık & Hijyen'), count: 615 },
              { emoji: '🍕', name: t('welcome.cat_pizza', 'Pizza & Pasta'), count: 401 },
              { emoji: '🍽️', name: t('welcome.cat_selfservice', 'Self Servis'), count: 499 },
              { emoji: '⚡', name: t('welcome.cat_dynamic', 'Dinamik Hazırlık'), count: 359 },
              { emoji: '🧊', name: t('welcome.cat_icecream', 'Dondurma'), count: 82 },
              { emoji: '☕', name: t('welcome.cat_coffee', 'Kahve & Çay'), count: 95 },
            ].map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                onClick={() => navigate('/diamond')}
                className="group relative bg-[#020817] p-5 sm:p-6 hover:bg-white/[0.03] transition-all text-left"
              >
                <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform inline-block">{cat.emoji}</span>
                <h4 className="text-white font-bold text-sm tracking-tight mb-1 group-hover:text-sky-300 transition-colors">{cat.name}</h4>
                <p className="text-white/30 text-xs font-mono">{cat.count.toLocaleString('tr-TR')} {t('welcome.products', 'ürün')}</p>
              </motion.button>
            ))}
          </div>
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
              { icon: Refrigerator, value: '6.800+', label: t('welcome.aboutEquipment', 'Ekipman Modeli') },
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

          {/* 3-column: Contact / Address+Hours / Google Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/[0.08] to-transparent border border-white/[0.08] backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Phone size={18} className="text-blue-400" />
                </div>
                <h4 className="text-white font-bold text-lg">{t('welcome.contactTitle', 'İletişim')}</h4>
              </div>
              <div className="space-y-3">
                <a href="tel:+4917670295844" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group">
                  <Phone size={14} className="text-blue-400/70 group-hover:text-blue-400" />
                  <span>+49 176 70295844</span>
                </a>
                <a href="https://api.whatsapp.com/send/?phone=4917670295844" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group">
                  <Mail size={14} className="text-blue-400/70 group-hover:text-blue-400" />
                  <span>WhatsApp Destek</span>
                </a>
                <a href="https://www.2mcwerbung.com/tr_tr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group">
                  <ExternalLink size={14} className="text-blue-400/70 group-hover:text-blue-400" />
                  <span>www.2mcwerbung.com</span>
                </a>
              </div>
              <div className="h-px bg-white/[0.06] my-5" />
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-blue-500/15 hover:border-blue-500/30 transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Address & Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/[0.08] to-transparent border border-white/[0.08] backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <MapPin size={18} className="text-indigo-400" />
                </div>
                <h4 className="text-white font-bold text-lg">{t('welcome.addressTitle', 'Adres')}</h4>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                {t('welcome.addressLine', 'Bergisch Gladbacher Str. 172\n51063 Köln\nDeutschland')}
              </p>
              <div className="h-px bg-white/[0.06] my-5" />
              <div className="flex items-center gap-3 mb-3">
                <Clock size={14} className="text-indigo-400/70" />
                <h5 className="text-white/80 text-sm font-semibold">{t('welcome.hoursTitle', 'Çalışma Saatleri')}</h5>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>{t('welcome.weekdays', 'Pazartesi - Cumartesi')}</span>
                  <span className="text-white/80 font-medium">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>{t('welcome.sunday', 'Pazar')}</span>
                  <span>{t('welcome.closed', 'Kapalı')}</span>
                </div>
              </div>
            </motion.div>

            {/* Google Reviews */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-white/[0.08] backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg">{t('welcome.reviewsTitle', 'Google Yorumları')}</h4>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-white leading-none">4.9</span>
                  <span className="text-white/40 text-sm pb-1">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/50 text-xs mb-5">
                  {t('welcome.reviewsCount', '320+ doğrulanmış Google yorumu')}
                </p>
                <div className="space-y-2.5 mb-5">
                  {[
                    { label: '5★', pct: 92 },
                    { label: '4★', pct: 6 },
                    { label: '3★', pct: 2 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      <span className="text-white/50 w-6">{r.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${r.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                        />
                      </div>
                      <span className="text-white/40 w-8 text-right">{r.pct}%</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://www.google.com/search?q=2mc+gastro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-semibold transition-colors"
                >
                  {t('welcome.reviewsCta', 'Tüm yorumları gör')}
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>

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
    </div>
  );
}
