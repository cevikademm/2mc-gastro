import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentItem } from './equipmentStore';

export interface CartItem {
  product: EquipmentItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: EquipmentItem, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (id: string) => boolean;
  getItemsByCategory: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter(i => i.product.id !== id) })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.product.id === id ? { ...i, quantity: qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((s, i) => s + i.quantity * (i.product.price || 0), 0),

      isInCart: (id) => get().items.some(i => i.product.id === id),

      getItemsByCategory: () => {
        const groups: Record<string, CartItem[]> = {};
        get().items.forEach(item => {
          const cat = item.product.cat || 'other';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(item);
        });
        return groups;
      },
    }),
    { name: '2mc-cart' }
  )
);
