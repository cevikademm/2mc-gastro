import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface AdminOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: AdminOrderStatus;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_price: number;
  total_items: number;
  notes: string | null;
  shipping_address: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; company: string | null; email: string | null } | null;
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  company: string | null;
  tax_id: string | null;
  sector: string | null;
  role: 'b2c' | 'b2b' | 'admin';
  approved: boolean;
  created_at: string;
}

interface AdminState {
  orders: AdminOrder[];
  users: AdminUser[];
  ordersLoading: boolean;
  usersLoading: boolean;
  error: string | null;

  fetchAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: AdminOrderStatus, note?: string) => Promise<boolean>;
  updateOrderTracking: (orderId: string, carrier: string, number: string) => Promise<boolean>;
  addOrderNote: (orderId: string, note: string) => Promise<boolean>;

  fetchAllUsers: () => Promise<void>;
  approveUser: (userId: string) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  setUserRole: (userId: string, role: 'b2c' | 'b2b' | 'admin') => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  orders: [],
  users: [],
  ordersLoading: false,
  usersLoading: false,
  error: null,

  fetchAllOrders: async () => {
    if (!supabase) return;
    set({ ordersLoading: true, error: null });
    const { data, error } = await supabase
      .from('gastro_orders')
      .select('*, profile:profiles!gastro_orders_user_id_fkey(full_name,company,email)')
      .order('created_at', { ascending: false });

    if (error) {
      const { data: fallback, error: fallbackErr } = await supabase
        .from('gastro_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (fallbackErr) {
        set({ ordersLoading: false, error: fallbackErr.message });
        return;
      }
      set({ orders: (fallback || []) as AdminOrder[], ordersLoading: false });
      return;
    }

    set({ orders: (data || []) as AdminOrder[], ordersLoading: false });
  },

  updateOrderStatus: async (orderId, newStatus, note) => {
    if (!supabase) return false;
    const prev = get().orders.find((o) => o.id === orderId);
    const { error } = await supabase
      .from('gastro_orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (error) {
      set({ error: error.message });
      return false;
    }

    await supabase.from('gastro_order_events').insert({
      order_id: orderId,
      event_type: 'status_change',
      old_value: prev?.status || null,
      new_value: newStatus,
      note: note || null,
    });

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o,
      ),
    }));
    return true;
  },

  updateOrderTracking: async (orderId, carrier, number) => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('gastro_orders')
      .update({ tracking_carrier: carrier, tracking_number: number })
      .eq('id', orderId);
    if (error) {
      set({ error: error.message });
      return false;
    }
    await supabase.from('gastro_order_events').insert({
      order_id: orderId,
      event_type: 'tracking_added',
      new_value: `${carrier}:${number}`,
    });
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, tracking_carrier: carrier, tracking_number: number } : o,
      ),
    }));
    return true;
  },

  addOrderNote: async (orderId, note) => {
    if (!supabase) return false;
    const prev = get().orders.find((o) => o.id === orderId);
    const merged = prev?.notes ? `${prev.notes}\n---\n${note}` : note;
    const { error } = await supabase
      .from('gastro_orders')
      .update({ notes: merged })
      .eq('id', orderId);
    if (error) {
      set({ error: error.message });
      return false;
    }
    await supabase.from('gastro_order_events').insert({
      order_id: orderId,
      event_type: 'note_added',
      note,
    });
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, notes: merged } : o)),
    }));
    return true;
  },

  fetchAllUsers: async () => {
    if (!supabase) return;
    set({ usersLoading: true, error: null });
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, company, tax_id, sector, role, approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      set({ usersLoading: false, error: error.message });
      return;
    }
    set({ users: (data || []) as AdminUser[], usersLoading: false });
  },

  approveUser: async (userId) => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', userId);
    if (error) {
      set({ error: error.message });
      return false;
    }
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, approved: true } : u)),
    }));
    return true;
  },

  rejectUser: async (userId) => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ approved: false })
      .eq('id', userId);
    if (error) {
      set({ error: error.message });
      return false;
    }
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, approved: false } : u)),
    }));
    return true;
  },

  setUserRole: async (userId, role) => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    if (error) {
      set({ error: error.message });
      return false;
    }
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)),
    }));
    return true;
  },
}));
