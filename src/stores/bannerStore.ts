import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** CSS background — used when no image is set. Can be a gradient or solid color. */
  gradient: string;
  /** Optional image URL or data URL. When set, replaces the gradient background. */
  image?: string;
  enabled: boolean;
}

interface BannerState {
  slides: BannerSlide[];
  intervalMs: number;
  setSlides: (slides: BannerSlide[]) => void;
  updateSlide: (id: string, patch: Partial<BannerSlide>) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, dir: -1 | 1) => void;
  setIntervalMs: (ms: number) => void;
  resetToDefaults: () => void;
}

// Açık tema (beyaz arka plan) için light gradient'lar
const LIGHT_EQUIPMENT = 'linear-gradient(120deg, #e0f2fe 0%, #ffffff 55%, #dbeafe 100%)';
const LIGHT_DESIGN = 'linear-gradient(120deg, #fef3c7 0%, #ffffff 55%, #fde68a 100%)';
const LIGHT_DELIVERY = 'linear-gradient(120deg, #d1fae5 0%, #ffffff 55%, #a7f3d0 100%)';
const LIGHT_SUPPORT = 'linear-gradient(120deg, #ede9fe 0%, #ffffff 55%, #ddd6fe 100%)';

const DEFAULT_SLIDES: BannerSlide[] = [
  // ===== 01 / EQUIPMENT — Endüstriyel Mutfak Ekipmanları =====
  {
    id: 'equipment-1',
    eyebrow: '01 / EQUIPMENT — Variant A',
    title: 'Endüstriyel Mutfak Ekipmanları',
    subtitle: 'Combisteel · Rational · Hobart — Avrupa standartlarında ekipman tedariği',
    gradient: LIGHT_EQUIPMENT,
    image: 'https://design.canva.ai/XL6wN7dMOP80774',
    enabled: true,
  },
  {
    id: 'equipment-2',
    eyebrow: '01 / EQUIPMENT — Variant B',
    title: 'Endüstriyel Mutfak Ekipmanları',
    subtitle: 'Combisteel · Rational · Hobart — Avrupa standartlarında ekipman tedariği',
    gradient: LIGHT_EQUIPMENT,
    image: 'https://design.canva.ai/VonbAmX9JewISyn',
    enabled: true,
  },
  {
    id: 'equipment-3',
    eyebrow: '01 / EQUIPMENT — Variant C',
    title: 'Endüstriyel Mutfak Ekipmanları',
    subtitle: 'Combisteel · Rational · Hobart — Avrupa standartlarında ekipman tedariği',
    gradient: LIGHT_EQUIPMENT,
    image: 'https://design.canva.ai/Wa_IMeAfBVOtyNc',
    enabled: true,
  },
  {
    id: 'equipment-4',
    eyebrow: '01 / EQUIPMENT — Variant D',
    title: 'Endüstriyel Mutfak Ekipmanları',
    subtitle: 'Combisteel · Rational · Hobart — Avrupa standartlarında ekipman tedariği',
    gradient: LIGHT_EQUIPMENT,
    image: 'https://design.canva.ai/2FLu99VhVIIGiJL',
    enabled: true,
  },

  // ===== 02 / DESIGN — 3D Mutfak Tasarımı =====
  {
    id: 'design-1',
    eyebrow: '02 / DESIGN — Variant A',
    title: '3D Mutfak Tasarımı',
    subtitle: 'HACCP uyumlu, akış optimize edilmiş profesyonel mutfak projeleri',
    gradient: LIGHT_DESIGN,
    image: 'https://design.canva.ai/e0LtHyZFTkbuWbp',
    enabled: true,
  },
  {
    id: 'design-2',
    eyebrow: '02 / DESIGN — Variant B',
    title: '3D Mutfak Tasarımı',
    subtitle: 'HACCP uyumlu, akış optimize edilmiş profesyonel mutfak projeleri',
    gradient: LIGHT_DESIGN,
    image: 'https://design.canva.ai/K_OoMyl_QuXjEqn',
    enabled: true,
  },
  {
    id: 'design-3',
    eyebrow: '02 / DESIGN — Variant C',
    title: '3D Mutfak Tasarımı',
    subtitle: 'HACCP uyumlu, akış optimize edilmiş profesyonel mutfak projeleri',
    gradient: LIGHT_DESIGN,
    image: 'https://design.canva.ai/bQ_IgC5bDC2Ty-4',
    enabled: true,
  },
  {
    id: 'design-4',
    eyebrow: '02 / DESIGN — Variant D',
    title: '3D Mutfak Tasarımı',
    subtitle: 'HACCP uyumlu, akış optimize edilmiş profesyonel mutfak projeleri',
    gradient: LIGHT_DESIGN,
    image: 'https://design.canva.ai/I1w8OTH4guwxRYN',
    enabled: true,
  },

  // ===== 03 / DELIVERY — Anahtar Teslim Kurulum =====
  {
    id: 'delivery-1',
    eyebrow: '03 / DELIVERY — Variant A',
    title: 'Anahtar Teslim Kurulum',
    subtitle: 'Antalya merkezli, Avrupa geneli teslimat ve montaj hizmeti',
    gradient: LIGHT_DELIVERY,
    image: 'https://design.canva.ai/tc6L8r57KrrzESN',
    enabled: true,
  },
  {
    id: 'delivery-2',
    eyebrow: '03 / DELIVERY — Variant B',
    title: 'Anahtar Teslim Kurulum',
    subtitle: 'Antalya merkezli, Avrupa geneli teslimat ve montaj hizmeti',
    gradient: LIGHT_DELIVERY,
    image: 'https://design.canva.ai/ljZR1mu83mtr_6M',
    enabled: true,
  },
  {
    id: 'delivery-3',
    eyebrow: '03 / DELIVERY — Variant C',
    title: 'Anahtar Teslim Kurulum',
    subtitle: 'Antalya merkezli, Avrupa geneli teslimat ve montaj hizmeti',
    gradient: LIGHT_DELIVERY,
    image: 'https://design.canva.ai/VcqV8em0Pj8By7r',
    enabled: true,
  },
  {
    id: 'delivery-4',
    eyebrow: '03 / DELIVERY — Variant D',
    title: 'Anahtar Teslim Kurulum',
    subtitle: 'Antalya merkezli, Avrupa geneli teslimat ve montaj hizmeti',
    gradient: LIGHT_DELIVERY,
    image: 'https://design.canva.ai/kEZQVEk-9WHbXq-',
    enabled: true,
  },

  // ===== 04 / SUPPORT — 7/24 Teknik Destek =====
  {
    id: 'support-1',
    eyebrow: '04 / SUPPORT — Variant A',
    title: '7/24 Teknik Destek',
    subtitle: 'Garanti süresince yedek parça ve servis güvencesi',
    gradient: LIGHT_SUPPORT,
    image: 'https://design.canva.ai/oiEzJ9XSaQ_9_sM',
    enabled: true,
  },
  {
    id: 'support-2',
    eyebrow: '04 / SUPPORT — Variant B',
    title: '7/24 Teknik Destek',
    subtitle: 'Garanti süresince yedek parça ve servis güvencesi',
    gradient: LIGHT_SUPPORT,
    image: 'https://design.canva.ai/JD8MfgPIbkNQOYT',
    enabled: true,
  },
  {
    id: 'support-3',
    eyebrow: '04 / SUPPORT — Variant C',
    title: '7/24 Teknik Destek',
    subtitle: 'Garanti süresince yedek parça ve servis güvencesi',
    gradient: LIGHT_SUPPORT,
    image: 'https://design.canva.ai/5V_3XAF1mRwIdts',
    enabled: true,
  },
  {
    id: 'support-4',
    eyebrow: '04 / SUPPORT — Variant D',
    title: '7/24 Teknik Destek',
    subtitle: 'Garanti süresince yedek parça ve servis güvencesi',
    gradient: LIGHT_SUPPORT,
    image: 'https://design.canva.ai/NceVtI7s8Uu55F3',
    enabled: true,
  },
];

export const useBannerStore = create<BannerState>()(
  persist(
    (set, get) => ({
      slides: DEFAULT_SLIDES,
      intervalMs: 10000,
      setSlides: (slides) => set({ slides }),
      updateSlide: (id, patch) =>
        set({ slides: get().slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
      addSlide: () =>
        set({
          slides: [
            ...get().slides,
            {
              id: `slide-${Date.now()}`,
              eyebrow: 'NEW / SLIDE',
              title: 'Yeni Banner',
              subtitle: 'Açıklama metni',
              gradient: 'linear-gradient(120deg, #64748b 0%, #1e293b 55%, #020817 100%)',
              enabled: true,
            },
          ],
        }),
      removeSlide: (id) => set({ slides: get().slides.filter((s) => s.id !== id) }),
      moveSlide: (id, dir) => {
        const slides = [...get().slides];
        const idx = slides.findIndex((s) => s.id === id);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= slides.length) return;
        [slides[idx], slides[target]] = [slides[target], slides[idx]];
        set({ slides });
      },
      setIntervalMs: (ms) => set({ intervalMs: ms }),
      resetToDefaults: () => set({ slides: DEFAULT_SLIDES, intervalMs: 10000 }),
    }),
    {
      name: '2mc-banner-slides',
      version: 3,
      migrate: (_persisted, _ver) => ({ slides: DEFAULT_SLIDES, intervalMs: 10000 } as any),
    }
  )
);
