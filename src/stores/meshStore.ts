/**
 * In-flight MeshAI üretim durumu (UI cache).
 * Kalıcı veri Supabase'de tutulur (product_3d_models tablosu).
 * Bu store sadece aktif sayfada modal/ progress göstermek için kullanılır.
 */
import { create } from 'zustand';
import type { Product3DModel } from '../lib/meshyClient';

interface MeshState {
  /** product_key → satır */
  rows: Record<string, Product3DModel>;
  /** Şu an modal'da gösterilen anahtarlar */
  activeKeys: string[];
  setRow: (row: Product3DModel) => void;
  setRows: (rows: Product3DModel[]) => void;
  setActiveKeys: (keys: string[]) => void;
  clear: () => void;
}

export const useMeshStore = create<MeshState>((set) => ({
  rows: {},
  activeKeys: [],
  setRow: (row) => set((s) => ({ rows: { ...s.rows, [row.product_key]: row } })),
  setRows: (rows) => set((s) => {
    const next = { ...s.rows };
    rows.forEach((r) => { next[r.product_key] = r; });
    return { rows: next };
  }),
  setActiveKeys: (keys) => set({ activeKeys: keys }),
  clear: () => set({ rows: {}, activeKeys: [] }),
}));
