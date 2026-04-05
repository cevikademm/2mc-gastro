import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useCartStore } from '../stores/cartStore';
import NotificationPanel from './NotificationPanel';
import {
  Bell, Settings, LayoutDashboard, Ruler, Refrigerator,
  ClipboardList, SlidersHorizontal, HelpCircle, BookOpen, PlusCircle,
  Menu, X, LogOut, User, Globe, CreditCard, FolderOpen, ShoppingCart, PenLine
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.project', id: 'project' },
  { path: '/catalog', labelKey: 'nav.inventory', id: 'inventory' },
  { path: '/design', labelKey: 'nav.design', id: 'design' },
  { path: '/bom', labelKey: 'nav.bom', id: 'bom' },
];

const SIDE_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { path: '/projects', labelKey: 'nav.project', icon: FolderOpen, id: 'projects' },
  { path: '/design', labelKey: 'nav.floorPlan', icon: Ruler, id: 'design' },
  { path: '/catalog', labelKey: 'nav.equipment', icon: Refrigerator, id: 'inventory' },
  { path: '/bom', labelKey: 'nav.materials', icon: ClipboardList, id: 'bom' },
  { path: '/cart', labelKey: 'nav.cart', icon: ShoppingCart, id: 'cart' },
  { path: '/sketch', labelKey: 'nav.sketch', icon: PenLine, id: 'sketch' },
  { path: '/settings', labelKey: 'nav.settings', icon: SlidersHorizontal, id: 'settings' },
  { path: '/payment', labelKey: 'nav.payment', icon: CreditCard, id: 'payment' },
];

// Alt tab bar için sadece önemli 5 sayfa
const BOTTOM_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Ana Sayfa' },
  { path: '/catalog', icon: Refrigerator, label: 'Katalog' },
  { path: '/sketch', icon: PenLine, label: 'Kat Planı' },
  { path: '/design', icon: Ruler, label: 'Çizim' },
  { path: '/bom', icon: ClipboardList, label: 'BOM' },
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { mobileMenuOpen, toggleMobileMenu, toggleNotificationPanel, unreadCount } = useUIStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Design sayfaları: tam ekran canvas gerektirir
  const isDesign = ['/design', '/sketch'].some(p =>
    location.pathname === p || location.pathname.endsWith(p)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLang = () => {
    const langs = ['tr', 'en', 'de'];
    const idx = langs.indexOf(i18n.language);
    const next = langs[(idx + 1) % langs.length];
    i18n.changeLanguage(next);
    (window as any).__2mc_lang = next;
  };

  const langLabel: Record<string, string> = { tr: 'TR', en: 'EN', de: 'DE' };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/10 flex justify-between items-center w-full px-4 md:px-6 py-3 h-14 md:h-16 fixed top-0 z-50">
        <div className="flex items-center gap-3 md:gap-8">
          {/* Hamburger sadece tablet'te (md) göster, mobilde alt nav var */}
          <button onClick={toggleMobileMenu} className="hidden md:flex lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="2MC" className="h-8 w-8 object-contain" />
            <img src="/logo-werbung.png" alt="2MC Werbung" className="h-7 object-contain hidden sm:block" style={{ filter: 'brightness(0) saturate(100%) invert(24%) sepia(89%) saturate(700%) hue-rotate(210deg) brightness(90%)' }} />
            <span className="sm:hidden text-lg font-black text-primary uppercase tracking-wider font-headline">2MC</span>
          </Link>
          <nav className="hidden lg:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`font-headline font-bold tracking-tight transition-colors text-sm ${
                    isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden md:flex gap-2">
            <Link to="/projects" className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors rounded-lg">
              {t('nav.saveRevision')}
            </Link>
            <button className="px-3 py-1.5 text-sm font-bold text-white brushed-metal rounded-lg shadow-sm hover:opacity-90 transition-all">
              {t('nav.exportDWG')}
            </button>
          </div>
          <Link to="/cart" className="relative p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <button onClick={changeLang} className="p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1" title="Dil">
            <Globe size={16} />
            <span className="text-xs font-bold hidden sm:inline">{langLabel[i18n.language] || 'TR'}</span>
          </button>
          <div className="relative">
            <button onClick={toggleNotificationPanel} className="p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={18} />
              {unreadCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount()}
                </span>
              )}
            </button>
            <NotificationPanel />
          </div>
          <Link to="/settings" className="p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Settings size={18} />
          </Link>
        </div>
      </header>

      {/* Tablet/Desktop Sidebar Overlay (md only) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 hidden md:flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={toggleMobileMenu} />
          <div className="absolute top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-surface-container-low p-4 shadow-xl overflow-y-auto">
            <nav className="space-y-1">
              {SIDE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={18} /> {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-1">
              <Link to="/profile" onClick={toggleMobileMenu} className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 rounded-md text-sm font-medium">
                <User size={18} /> {t('nav.profile')}
              </Link>
              <button onClick={() => { toggleMobileMenu(); handleLogout(); }} className="w-full flex items-center gap-3 text-error px-4 py-2 hover:bg-error-container rounded-md text-sm font-medium">
                <LogOut size={18} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-14 md:pt-16">
        {/* Desktop Sidebar — lg ve üzeri */}
        <aside className="bg-surface-container-low fixed top-14 md:top-16 left-0 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-64 flex-col space-y-2 p-4 hidden lg:flex z-40 border-r border-outline-variant/10">
          <div className="mb-4 px-2">
            <img src="/logo-werbung.png" alt="2MC Werbung" className="h-8 w-full object-contain object-left" style={{ filter: 'brightness(0) saturate(100%) invert(24%) sepia(89%) saturate(700%) hue-rotate(210deg) brightness(90%)' }} />
            <p className="font-body text-xs text-on-surface-variant mt-1 px-2">{t('brand.phase')}</p>
          </div>

          <nav className="flex-1 space-y-1">
            {SIDE_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/') || (item.path === '/dashboard' && location.pathname === '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary border-r-4 border-primary'
                      : 'text-slate-500 hover:bg-slate-200 hover:translate-x-1'
                  }`}
                >
                  <Icon size={18} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {location.pathname === '/dashboard' && (
            <Link to="/projects/new" className="mx-4 mt-4 py-3 brushed-metal text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 shadow-lg text-sm">
              <PlusCircle size={18} /> {t('nav.newSpecification')}
            </Link>
          )}

          <div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/20">
            <Link to="/support" className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 transition-all rounded-md text-sm font-medium">
              <HelpCircle size={18} /> {t('nav.support')}
            </Link>
            <Link to="/docs" className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 transition-all rounded-md text-sm font-medium">
              <BookOpen size={18} /> {t('nav.documentation')}
            </Link>
            <Link to="/profile" className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 transition-all rounded-md text-sm font-medium">
              <User size={18} /> {t('nav.profile')}
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 text-error px-4 py-2 hover:bg-error-container transition-all rounded-md text-sm font-medium">
              <LogOut size={18} /> {t('nav.logout')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={[
            'flex-1 flex flex-col min-w-0',
            isDesign
              ? 'lg:ml-64 overflow-hidden'
              : 'lg:ml-64 p-4 md:p-6 lg:p-8 pb-20 md:pb-8',
          ].join(' ')}
          style={isDesign ? { height: 'calc(100vh - 3.5rem)' } : undefined}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation — sadece telefon (<md) */}
      {!isDesign && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex md:hidden safe-area-inset-bottom">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[9px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
