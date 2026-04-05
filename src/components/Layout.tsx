import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import NotificationPanel from './NotificationPanel';
import {
  Bell, Settings, LayoutDashboard, Ruler, Refrigerator,
  ClipboardList, SlidersHorizontal, HelpCircle, BookOpen, PlusCircle,
  Menu, X, LogOut, User, Globe, CreditCard
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.project', id: 'project' },
  { path: '/catalog', labelKey: 'nav.inventory', id: 'inventory' },
  { path: '/design', labelKey: 'nav.design', id: 'design' },
  { path: '/bom', labelKey: 'nav.bom', id: 'bom' },
];

const SIDE_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { path: '/design', labelKey: 'nav.floorPlan', icon: Ruler, id: 'design' },
  { path: '/catalog', labelKey: 'nav.equipment', icon: Refrigerator, id: 'inventory' },
  { path: '/bom', labelKey: 'nav.materials', icon: ClipboardList, id: 'bom' },
  { path: '/settings', labelKey: 'nav.settings', icon: SlidersHorizontal, id: 'settings' },
  { path: '/payment', labelKey: 'nav.payment', icon: CreditCard, id: 'payment' },
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mobileMenuOpen, toggleMobileMenu, toggleNotificationPanel, unreadCount } = useUIStore();

  const isDesign = location.pathname === '/design';

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
      <header className="bg-surface-container-lowest border-b border-outline-variant/10 flex justify-between items-center w-full px-4 md:px-6 py-3 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="text-xl font-black text-primary uppercase tracking-wider font-headline">
            {t('brand.name')}
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`font-headline font-bold tracking-tight transition-colors ${
                    isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex gap-2">
            <Link to="/projects" className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors rounded-lg">
              {t('nav.saveRevision')}
            </Link>
            <button className="px-4 py-2 text-sm font-bold text-white brushed-metal rounded-lg shadow-sm hover:opacity-90 transition-all">
              {t('nav.exportDWG')}
            </button>
          </div>
          <button onClick={changeLang} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1" title="Dil Değiştir">
            <Globe size={16} />
            <span className="text-xs font-bold">{langLabel[i18n.language] || 'TR'}</span>
          </button>
          <div className="relative">
            <button onClick={toggleNotificationPanel} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              {unreadCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount()}
                </span>
              )}
            </button>
            <NotificationPanel />
          </div>
          <Link to="/settings" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={toggleMobileMenu} />
          <div className="absolute top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-surface-container-low p-4 shadow-xl overflow-y-auto">
            <nav className="space-y-1">
              {SIDE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                      isActive ? 'bg-primary-fixed-dim/20 text-primary font-bold' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={18} /> {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-1">
              <Link to="/support" onClick={toggleMobileMenu} className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 rounded-md text-sm font-medium">
                <HelpCircle size={18} /> {t('nav.support')}
              </Link>
              <Link to="/docs" onClick={toggleMobileMenu} className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 rounded-md text-sm font-medium">
                <BookOpen size={18} /> {t('nav.documentation')}
              </Link>
              <Link to="/profile" onClick={toggleMobileMenu} className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:bg-slate-200 rounded-md text-sm font-medium">
                <User size={18} /> {t('nav.profile')}
              </Link>
              <button onClick={() => { toggleMobileMenu(); handleLogout(); }} className="w-full flex items-center gap-3 text-error px-4 py-2 hover:bg-error-container rounded-md text-sm font-medium">
                <LogOut size={18} /> {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* SideNavBar */}
        <aside className="bg-surface-container-low fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 flex-col space-y-2 p-4 hidden md:flex z-40 border-r border-outline-variant/10">
          <div className="mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white font-headline font-black text-sm">
                2M
              </div>
              <div>
                <p className="font-body text-sm font-bold text-primary leading-tight">{t('brand.studioVersion')}</p>
                <p className="font-body text-xs text-on-surface-variant">{t('brand.phase')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {SIDE_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-primary-fixed-dim/20 text-primary border-r-4 border-primary'
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
            <Link to="/projects/new" className="mx-4 mt-4 py-3 brushed-metal text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 shadow-lg">
              <PlusCircle size={18} /> {t('nav.newSpecification')}
            </Link>
          )}

          <div className="mt-auto pt-6 space-y-1 border-t border-outline-variant/20">
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

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col min-w-0 ${!isDesign ? 'md:ml-64 p-6 md:p-8' : 'md:ml-64 overflow-hidden'}`} style={isDesign ? { height: 'calc(100vh - 4rem)' } : undefined}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
