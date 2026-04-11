import { create } from 'zustand';

export interface CompareItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  image: string;
  price: number | null;
  promoPrice?: number | null;
  stock: string | number | null;
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
  length_mm: number | null;
  weight: number | null;
  kw: string | number | null;
  connection: string | null;
  category: string | null;
  source: 'diamond' | 'combisteel';
  extra?: Record<string, string | number | null>;
}

interface CompareState {
  items: CompareItem[];
  showPanel: boolean;
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: CompareItem) => void;
  isComparing: (id: string) => boolean;
  clear: () => void;
  setShowPanel: (show: boolean) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  showPanel: false,

  addItem: (item) => set(state => {
    if (state.items.length >= 6) return state;
    if (state.items.find(i => i.id === item.id)) return state;
    return { items: [...state.items, item] };
  }),

  removeItem: (id) => set(state => ({
    items: state.items.filter(i => i.id !== id),
  })),

  toggleItem: (item) => {
    const { items } = get();
    if (items.find(i => i.id === item.id)) {
      get().removeItem(item.id);
    } else {
      get().addItem(item);
    }
  },

  isComparing: (id) => get().items.some(i => i.id === id),

  clear: () => set({ items: [], showPanel: false }),

  setShowPanel: (show) => set({ showPanel: show }),
}));
