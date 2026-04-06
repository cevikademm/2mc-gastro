import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debouncedSyncUserPrefs, loadUserPrefs } from '../lib/gastroSync';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  cookieConsent: boolean | null;
  notifications: Notification[];
  notificationPanelOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setCookieConsent: (value: boolean) => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleNotificationPanel: () => void;
  unreadCount: () => number;
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'BOM Dışa Aktarıldı', message: 'The Grand Bistro - L3 projesi için BOM başarıyla dışa aktarıldı.', type: 'success', read: false, createdAt: '2024-05-20T10:00:00' },
  { id: '2', title: 'Revizyon Kaydedildi', message: 'Riverside Hotel Kitchen v2.4 revizyonu kaydedildi.', type: 'info', read: false, createdAt: '2024-05-20T07:00:00' },
  { id: '3', title: 'Yeni Ekipman', message: 'Vulcan VC4G Gas Oven kataloğa eklendi.', type: 'info', read: true, createdAt: '2024-05-19T15:00:00' },
  { id: '4', title: 'Stok Uyarısı', message: 'Walk-in Soğutucu Modül stokta kalmadı.', type: 'warning', read: false, createdAt: '2024-05-19T09:00:00' },
];

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,
      cookieConsent: null,
      notifications: initialNotifications,
      notificationPanelOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      setCookieConsent: (value) => set({ cookieConsent: value }),

      addNotification: (n) => {
        set((state) => ({
          notifications: [
            { ...n, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() },
            ...state.notifications,
          ],
        }));
      },

      markRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      toggleNotificationPanel: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: '2mc-gastro-ui',
      version: 1,
      partialize: (state) => ({
        cookieConsent: state.cookieConsent,
        notifications: state.notifications,
      }),
    }
  )
);

// Sync notifications to Supabase
useUIStore.subscribe((state) => {
  debouncedSyncUserPrefs({
    notifications: state.notifications,
    cookieConsent: state.cookieConsent,
  });
});

loadUserPrefs().then((remote) => {
  if (!remote) return;
  const local = useUIStore.getState();
  if (remote.notifications?.length > local.notifications.length) {
    useUIStore.setState({ notifications: remote.notifications });
  }
});
