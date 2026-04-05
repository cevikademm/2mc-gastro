import { create } from 'zustand';

export interface BOMItem {
  id: string;
  quantity: number;
  code: string;
  description: string;
  status: 'inStock' | 'ordered' | 'processing';
  unitPrice: number;
  category: string;
}

interface BOMState {
  items: BOMItem[];
  searchQuery: string;
  projectId: string;
  setSearch: (query: string) => void;
  addItem: (item: Omit<BOMItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, data: Partial<BOMItem>) => void;
  getFilteredItems: () => BOMItem[];
  getTotalItems: () => number;
  getUniqueSKUs: () => number;
}

const initialItems: BOMItem[] = [
  { id: '1', quantity: 12, code: 'VLC-CAB-600-L', description: 'Alt Dolap 600mm Sol Versiyon, Paslanmaz Çelik', status: 'inStock', unitPrice: 450, category: 'furniture' },
  { id: '2', quantity: 4, code: 'VLC-HND-SS-22', description: 'Ağır Hizmet Tutma Çubuğu, Fırçalı Paslanmaz Çelik', status: 'inStock', unitPrice: 85, category: 'hardware' },
  { id: '3', quantity: 1, code: 'IND-700-ULTRA', description: 'İndüksiyon Ocak 700mm Yüksek Performans', status: 'ordered', unitPrice: 3200, category: 'cooking' },
  { id: '4', quantity: 2, code: 'SINK-PROF-80', description: 'Profesyonel Çift Hazneli Evye, Tezgah Altı', status: 'inStock', unitPrice: 890, category: 'plumbing' },
  { id: '5', quantity: 8, code: 'LEG-ADJ-ST', description: 'Ayarlanabilir Ayak, Ağır Hizmet Çelik', status: 'inStock', unitPrice: 35, category: 'hardware' },
  { id: '6', quantity: 1, code: 'WORK-GRNT-30', description: 'Tezgah Granit Nero Assoluto, 30mm', status: 'processing', unitPrice: 2800, category: 'surface' },
  { id: '7', quantity: 24, code: 'SCR-M6-25-SS', description: 'Makine Vidası M6x25, Paslanmaz Çelik A4', status: 'inStock', unitPrice: 2.5, category: 'hardware' },
  { id: '8', quantity: 6, code: 'VLC-SHF-800-SS', description: 'Duvar Rafı 800mm, Paslanmaz Çelik', status: 'inStock', unitPrice: 180, category: 'furniture' },
  { id: '9', quantity: 2, code: 'VLC-FAN-EXT-60', description: 'Havalandırma Aspiratörü 60cm', status: 'ordered', unitPrice: 1200, category: 'ventilation' },
  { id: '10', quantity: 3, code: 'LED-PNL-120', description: 'LED Panel Aydınlatma 120cm, IP65', status: 'inStock', unitPrice: 145, category: 'electrical' },
];

export const useBOMStore = create<BOMState>((set, get) => ({
  items: initialItems,
  searchQuery: '',
  projectId: 'VK-2024-08',

  setSearch: (query) => set({ searchQuery: query }),

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, { ...item, id: Date.now().toString() }],
    }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  updateItem: (id, data) => {
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
    }));
  },

  getFilteredItems: () => {
    const { items, searchQuery } = get();
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  },

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getUniqueSKUs: () => new Set(get().items.map((i) => i.code)).size,
}));
