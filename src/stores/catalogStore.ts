import { create } from 'zustand';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  icon: string;
  power: string;
  powerType: 'electric' | 'gas';
  description: string;
  dimensions: string;
  series: string;
  category: 'fryer' | 'range' | 'dishwasher' | 'oven' | 'sink' | 'table' | 'refrigerator' | 'other';
  kw: number;
  price: number;
  inStock: boolean;
  imageUrl?: string;
  features?: string[];
}

interface CatalogFilters {
  search: string;
  series: string[];
  category: string;
  powerType: 'all' | 'electric' | 'gas';
  kwMin: number;
  kwMax: number;
  sortBy: 'name' | 'power' | 'price';
  sortOrder: 'asc' | 'desc';
}

interface CatalogState {
  equipment: Equipment[];
  filters: CatalogFilters;
  currentPage: number;
  itemsPerPage: number;
  selectedEquipment: Equipment | null;
  planItems: Equipment[];
  setFilter: (key: keyof CatalogFilters, value: any) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  selectEquipment: (id: string) => void;
  addToPlan: (id: string) => void;
  removeFromPlan: (id: string) => void;
  getFilteredEquipment: () => Equipment[];
}

const defaultFilters: CatalogFilters = {
  search: '',
  series: [],
  category: '',
  powerType: 'all',
  kwMin: 0,
  kwMax: 100,
  sortBy: 'name',
  sortOrder: 'asc',
};

const allEquipment: Equipment[] = [
  { id: '1', name: 'Doppelfritteuse V-70', code: 'VF-FRY-702-EL', icon: 'refrigerator', power: '18.0 kW', powerType: 'electric', description: '2 x 15L Kapasite', dimensions: '800 × 700 × 900', series: '70er', category: 'fryer', kw: 18, price: 4500, inStock: true, features: ['Dijital kontrol', 'Otomatik yağ filtreleme', 'Enerji tasarruflu'] },
  { id: '2', name: 'Vierer-Herd Pro-Gas', code: 'VF-RNG-704-GS', icon: 'flame', power: '22.5 kW', powerType: 'gas', description: '4 × Yüksek Performans Brülör', dimensions: '700 × 700 × 850', series: '70er', category: 'range', kw: 22.5, price: 5200, inStock: true, features: ['Paslanmaz çelik gövde', 'Termostatik kontrol', 'Kolay temizlik'] },
  { id: '3', name: 'Haubenspülmaschine Titan', code: 'VF-DW-900-H', icon: 'droplets', power: '9.5 kW', powerType: 'electric', description: '60 Sepet/Saat Verim', dimensions: '635 × 750 × 1470', series: '80er', category: 'dishwasher', kw: 9.5, price: 8900, inStock: true, features: ['Yüksek verim', 'Düşük su tüketimi', 'Gürültü yalıtımı'] },
  { id: '4', name: 'Konveksiyonlu Fırın Pro', code: 'VF-OVN-601-EL', icon: 'microwave', power: '12.0 kW', powerType: 'electric', description: '10 Tepsi Kapasiteli', dimensions: '850 × 780 × 1050', series: '60er', category: 'oven', kw: 12, price: 7800, inStock: true, features: ['Buhar enjeksiyonu', 'Dokunmatik ekran', 'Otomatik programlar'] },
  { id: '5', name: 'Endüstriyel Buzdolabı', code: 'VF-REF-700-SS', icon: 'refrigerator', power: '0.8 kW', powerType: 'electric', description: '700L Kapasiteli', dimensions: '700 × 800 × 2050', series: '70er', category: 'refrigerator', kw: 0.8, price: 3200, inStock: true, features: ['Dijital termostat', 'Otomatik defrost', 'LED aydınlatma'] },
  { id: '6', name: 'Çift Hazneli Evye', code: 'VF-SNK-120-SS', icon: 'waves', power: '0 kW', powerType: 'electric', description: 'Paslanmaz Çelik, Alttan Montaj', dimensions: '1200 × 700 × 850', series: '70er', category: 'sink', kw: 0, price: 1800, inStock: true, features: ['304 paslanmaz çelik', 'Sıçrama koruma', 'Süzgeçli tahliye'] },
  { id: '7', name: 'Hazırlık Tezgahı', code: 'VF-TBL-150-SS', icon: 'table', power: '0 kW', powerType: 'electric', description: '150cm Paslanmaz Çelik 304', dimensions: '1500 × 700 × 850', series: '70er', category: 'table', kw: 0, price: 1200, inStock: true, features: ['Ayarlanabilir ayaklar', 'Alt raf', 'Dayanıklı yüzey'] },
  { id: '8', name: 'Gazlı Izgara Pro', code: 'VF-GRL-800-GS', icon: 'flame', power: '16.0 kW', powerType: 'gas', description: 'Çift Zonlu Izgara', dimensions: '800 × 700 × 900', series: '70er', category: 'range', kw: 16, price: 3800, inStock: false, features: ['Çift bölgeli ısıtma', 'Yağ toplama kanalı', 'Çıkarılabilir ızgara'] },
  { id: '9', name: 'Tezgahaltı Bulaşık Makinesi', code: 'VF-DW-500-UC', icon: 'droplets', power: '6.5 kW', powerType: 'electric', description: '40 Sepet/Saat Verim', dimensions: '600 × 600 × 820', series: '60er', category: 'dishwasher', kw: 6.5, price: 4200, inStock: true, features: ['Kompakt tasarım', 'Hızlı yıkama', 'Düşük enerji'] },
  { id: '10', name: 'Kombi Fırın Elite', code: 'VF-CMB-101-EL', icon: 'microwave', power: '24.0 kW', powerType: 'electric', description: 'Buhar + Konveksiyon', dimensions: '880 × 800 × 1100', series: '80er', category: 'oven', kw: 24, price: 15000, inStock: true, features: ['Buhar + konveksiyon', '100 program hafızası', 'HACCP kayıt'] },
  { id: '11', name: 'Walk-in Soğutucu Modül', code: 'VF-WLK-300-CL', icon: 'refrigerator', power: '2.5 kW', powerType: 'electric', description: 'Modüler Walk-in Ünite', dimensions: '3000 × 2000 × 2200', series: '80er', category: 'refrigerator', kw: 2.5, price: 12000, inStock: false, features: ['Modüler panel sistemi', 'Hızlı kurulum', 'Enerji sınıfı A+'] },
  { id: '12', name: 'Masa Tipi Fritöz', code: 'VF-FRY-401-EL', icon: 'refrigerator', power: '8.0 kW', powerType: 'electric', description: '1 x 8L Kapasite', dimensions: '400 × 600 × 400', series: '60er', category: 'fryer', kw: 8, price: 1600, inStock: true, features: ['Kompakt boyut', 'Hızlı ısınma', 'Güvenli kullanım'] },
];

export const useCatalogStore = create<CatalogState>((set, get) => ({
  equipment: allEquipment,
  filters: { ...defaultFilters },
  currentPage: 1,
  itemsPerPage: 6,
  selectedEquipment: null,
  planItems: [],

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    }));
  },

  resetFilters: () => set({ filters: { ...defaultFilters }, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  selectEquipment: (id) => {
    const eq = get().equipment.find((e) => e.id === id) || null;
    set({ selectedEquipment: eq });
  },

  addToPlan: (id) => {
    const eq = get().equipment.find((e) => e.id === id);
    if (eq && !get().planItems.find((p) => p.id === id)) {
      set((state) => ({ planItems: [...state.planItems, eq] }));
    }
  },

  removeFromPlan: (id) => {
    set((state) => ({ planItems: state.planItems.filter((p) => p.id !== id) }));
  },

  getFilteredEquipment: () => {
    const { equipment, filters } = get();
    let filtered = [...equipment];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    if (filters.series.length > 0) {
      filtered = filtered.filter((e) => filters.series.includes(e.series));
    }

    if (filters.category) {
      filtered = filtered.filter((e) => e.category === filters.category);
    }

    if (filters.powerType !== 'all') {
      filtered = filtered.filter((e) => e.powerType === filters.powerType);
    }

    if (filters.kwMin > 0) {
      filtered = filtered.filter((e) => e.kw >= filters.kwMin);
    }

    if (filters.kwMax < 100) {
      filtered = filtered.filter((e) => e.kw <= filters.kwMax);
    }

    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      const mod = filters.sortOrder === 'asc' ? 1 : -1;
      if (typeof aVal === 'string') return aVal.localeCompare(bVal as string) * mod;
      return ((aVal as number) - (bVal as number)) * mod;
    });

    return filtered;
  },
}));
