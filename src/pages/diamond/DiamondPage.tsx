import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDiamondStore, type DiamondProduct } from '../../stores/diamondStore';
import { useCartStore } from '../../stores/cartStore';
import { useProjectStore } from '../../stores/projectStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import {
  Search, X, ChevronLeft, ChevronRight, Grid3X3, List,
  Zap, Ruler, Euro, Package, MapPin,
  ShoppingCart, Diamond, Tag, Sparkles, Box,
  Clock, CheckCircle2, Loader2, Columns3
} from 'lucide-react';

function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div className={`bg-surface-container-highest flex items-center justify-center ${className}`}>
        <Package size={32} className="text-on-surface-variant/30" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        className={`w-full h-full object-contain ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
}

// All column definitions matching Excel headers
const ALL_COLUMNS: { key: keyof DiamondProduct | string; label: string; group: string }[] = [
  { key: 'id', label: 'Ürün ID', group: 'Genel' },
  { key: 'name', label: 'Ürün Adı', group: 'Genel' },
  { key: 'description_tech_spec', label: 'Teknik Açıklama', group: 'Genel' },
  { key: 'popup_info', label: 'Ek Bilgi', group: 'Genel' },
  { key: 'currency', label: 'Para Birimi', group: 'Fiyat' },
  { key: 'price_catalog', label: 'Katalog Fiyatı', group: 'Fiyat' },
  { key: 'price_display', label: 'Görüntülenen Fiyat', group: 'Fiyat' },
  { key: 'price_promo', label: 'Promosyon Fiyatı', group: 'Fiyat' },
  { key: 'page_catalog_number', label: 'Katalog Sayfa No', group: 'Fiyat' },
  { key: 'page_promo_number', label: 'Promo Sayfa No', group: 'Fiyat' },
  { key: 'stock', label: 'Stok Miktarı', group: 'Stok' },
  { key: 'restock_info', label: 'Yeniden Stoklama', group: 'Stok' },
  { key: 'supplier_delivery_delay', label: 'Tedarikçi Teslimat (gün)', group: 'Stok' },
  { key: 'days_to_restock_avg', label: 'Ort. Stoklama Süresi (gün)', group: 'Stok' },
  { key: 'length_mm', label: 'Uzunluk (mm)', group: 'Boyut' },
  { key: 'width_mm', label: 'Genişlik (mm)', group: 'Boyut' },
  { key: 'height_mm', label: 'Yükseklik (mm)', group: 'Boyut' },
  { key: 'volume_m3', label: 'Hacim (m³)', group: 'Boyut' },
  { key: 'weight', label: 'Ağırlık', group: 'Boyut' },
  { key: 'weight_unit', label: 'Ağırlık Birimi', group: 'Boyut' },
  { key: 'electric_power_kw', label: 'Elektrik Gücü (kW)', group: 'Teknik' },
  { key: 'electric_connection', label: 'Elektrik Bağlantı', group: 'Teknik' },
  { key: 'electric_connection_2', label: 'Elektrik Bağlantı 2', group: 'Teknik' },
  { key: 'vapor', label: 'Buhar', group: 'Teknik' },
  { key: 'kcal_power', label: 'Kcal Gücü', group: 'Teknik' },
  { key: 'horse_power', label: 'Beygir Gücü', group: 'Teknik' },
  { key: 'product_category_id', label: 'Kategori ID', group: 'Kategori' },
  { key: 'product_range_id', label: 'Ürün Grubu ID', group: 'Kategori' },
  { key: 'product_subrange_id', label: 'Alt Grup ID', group: 'Kategori' },
  { key: 'product_family_id', label: 'Ürün Ailesi ID', group: 'Kategori' },
  { key: 'product_family_name', label: 'Ürün Ailesi Adı', group: 'Kategori' },
  { key: 'product_subfamily_id', label: 'Alt Aile ID', group: 'Kategori' },
  { key: 'product_line_id', label: 'Ürün Hattı ID', group: 'Kategori' },
  { key: 'is_new', label: 'Yeni Ürün', group: 'Durum' },
  { key: 'is_old', label: 'Eski Ürün', group: 'Durum' },
  { key: 'is_good_deal', label: 'Kampanyalı', group: 'Durum' },
  { key: 'product_type', label: 'Ürün Tipi', group: 'Durum' },
  { key: 'has_accessories', label: 'Aksesuar Var', group: 'Durum' },
  { key: 'replacement_product_id', label: 'Yedek Ürün ID', group: 'Durum' },
  { key: 'image_big', label: 'Görsel (Büyük)', group: 'Medya' },
  { key: 'image_thumb', label: 'Görsel (Küçük)', group: 'Medya' },
  { key: 'image_gallery', label: 'Görsel (Galeri)', group: 'Medya' },
  { key: 'image_full', label: 'Görsel (Full)', group: 'Medya' },
];

// Default visible columns for compact view
const DEFAULT_VISIBLE = [
  'id', 'name', 'price_catalog', 'price_promo', 'stock',
  'length_mm', 'width_mm', 'height_mm', 'electric_power_kw',
  'product_family_name', 'is_new', 'is_good_deal',
];

function formatCellValue(key: string, val: any): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Evet' : 'Hayır';
  if (key.startsWith('price_') || key === 'price_display') {
    const n = Number(val);
    return n > 0 ? `€${n.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—';
  }
  if (key.startsWith('image_')) {
    return val ? '✓' : '—';
  }
  return String(val);
}

export default function DiamondPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useDiamondStore();
  const { addItem: addToCart, isInCart } = useCartStore();
  const { projects } = useProjectStore();
  const { setFloorPlanItem } = useEquipmentStore();

  const {
    products, categories, filters, currentPage, itemsPerPage, totalCount,
    isLoading, error,
    fetchProducts, fetchCategories, setFilter, resetFilters, setPage,
  } = store;

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [detailItem, setDetailItem] = useState<DiamondProduct | null>(null);
  const [projectModalItem, setProjectModalItem] = useState<string | null>(null);
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_VISIBLE);
  const [showColPicker, setShowColPicker] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const familyGroups = categories.reduce((acc, c) => {
    const existing = acc.find(a => a.name === c.product_family_name);
    if (existing) existing.count += c.count;
    else acc.push({ name: c.product_family_name, count: c.count });
    return acc;
  }, [] as { name: string; count: number }[]).sort((a, b) => b.count - a.count);

  const formatPrice = (p: number | null) =>
    p && p > 0 ? `€${p.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—';

  const activeProjects = projects.filter(p => p.status !== 'complete');
  const completedProjects = projects.filter(p => p.status === 'complete');

  const handleShowOnFloorPlan = (id: string) => {
    setProjectModalItem(id);
    setDetailItem(null);
  };

  const handleProjectSelect = (projectId: string) => {
    if (projectModalItem) {
      setFloorPlanItem(projectModalItem);
      setProjectModalItem(null);
      navigate(`/projects/${projectId}/design`);
    }
  };

  const toCartItem = (p: DiamondProduct) => ({
    id: p.id,
    name: p.name,
    desc: p.description_tech_spec || '',
    cat: p.product_family_name || 'other',
    sub: p.product_subfamily_id || '',
    fam: p.product_family_name || '',
    img: p.image_big || p.image_thumb || '',
    url: p.image_big || p.image_thumb || p.image_full || '',
    brand: 'Diamond',
    l: Number(p.length_mm) || 0,
    w: Number(p.width_mm) || 0,
    h: String(p.height_mm || '0'),
    kw: Number(p.electric_power_kw) || 0,
    price: p.price_catalog || p.price_display || 0,
    line: p.product_line_id || '',
  });

  const toggleCol = (key: string) => {
    setVisibleCols(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Pagination range
  const maxPages = 7;
  let pageStart = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let pageEnd = Math.min(totalPages, pageStart + maxPages - 1);
  if (pageEnd - pageStart < maxPages - 1) pageStart = Math.max(1, pageEnd - maxPages + 1);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);

  const activeColumns = ALL_COLUMNS.filter(c => visibleCols.includes(c.key));

  return (
    <div className="flex flex-col gap-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Diamond size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-black text-on-surface tracking-tight">Diamond EU Katalog</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {totalCount.toLocaleString()} ürün
              {filters.family ? ` — ${filters.family}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Ürün ara..."
              className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            {filters.search && (
              <button onClick={() => setFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilter('promoOnly', !filters.promoOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.promoOnly ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Tag size={14} /> Promo
          </button>
          <button
            onClick={() => setFilter('newOnly', !filters.newOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.newOnly ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Sparkles size={14} /> Yeni
          </button>
          <button
            onClick={() => setFilter('inStockOnly', !filters.inStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.inStockOnly ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Box size={14} /> Stokta
          </button>
          <div className="flex bg-surface-container-highest rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} title="Kart Görünümü">
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} title="Liste Görünümü">
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} title="Tam Tablo (Tüm Sütunlar)">
              <Columns3 size={16} />
            </button>
          </div>
          {viewMode === 'table' && (
            <div className="relative">
              <button
                onClick={() => setShowColPicker(!showColPicker)}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-all"
              >
                Sütunlar ({visibleCols.length}/{ALL_COLUMNS.length})
              </button>
              {showColPicker && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-700">Görünür Sütunlar</span>
                    <div className="flex gap-2">
                      <button onClick={() => setVisibleCols(ALL_COLUMNS.map(c => c.key))} className="text-[10px] text-indigo-600 font-bold hover:underline">Tümü</button>
                      <button onClick={() => setVisibleCols(DEFAULT_VISIBLE)} className="text-[10px] text-slate-500 font-bold hover:underline">Varsayılan</button>
                    </div>
                  </div>
                  {['Genel', 'Fiyat', 'Stok', 'Boyut', 'Teknik', 'Kategori', 'Durum', 'Medya'].map(group => (
                    <div key={group} className="mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{group}</p>
                      <div className="flex flex-wrap gap-1">
                        {ALL_COLUMNS.filter(c => c.group === group).map(col => (
                          <button
                            key={col.key}
                            onClick={() => toggleCol(col.key)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                              visibleCols.includes(col.key)
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('family', '')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !filters.family ? 'bg-indigo-600 text-white shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tümü ({totalCount.toLocaleString()})
        </button>
        {familyGroups.slice(0, 20).map((fam) => (
          <button
            key={fam.name}
            onClick={() => setFilter('family', filters.family === fam.name ? '' : fam.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filters.family === fam.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {fam.name || 'Diğer'} ({fam.count})
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-indigo-600 mr-2" />
          <span className="text-sm text-slate-500">Ürünler yükleniyor...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Hata: {error}
          <button onClick={fetchProducts} className="ml-3 text-red-600 underline font-bold">Tekrar Dene</button>
        </div>
      )}

      {/* ═══════ GRID VIEW ═══════ */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group relative"
            >
              <div className="absolute top-2 left-2 z-10 flex gap-1">
                {item.is_new && <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">YENİ</span>}
                {item.is_good_deal && <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">FIRSAT</span>}
                {(item.price_promo ?? 0) > 0 && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PROMO</span>}
              </div>
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }} className="p-1.5 rounded-full bg-white/90 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 shadow-sm transition-all" title="Kat planına ekle"><MapPin size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); addToCart(toCartItem(item)); }} className={`p-1.5 rounded-full shadow-sm transition-all ${isInCart(item.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-white/90 text-on-surface-variant/40 hover:text-emerald-600 hover:bg-emerald-50'}`} title="Sepete ekle"><ShoppingCart size={12} /></button>
              </div>
              <ProductImage src={item.image_big || item.image_thumb} alt={item.name} className="w-full h-36 bg-white" />
              <div className="p-3">
                <h3 className="text-xs font-bold text-on-surface line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-mono mb-2">{item.id}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant">{item.product_family_name}</span>
                  {(item.price_promo ?? 0) > 0 ? (
                    <div className="text-right">
                      <span className="text-[9px] text-on-surface-variant line-through mr-1">{formatPrice(item.price_catalog)}</span>
                      <span className="text-xs font-bold text-red-600">{formatPrice(item.price_promo)}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-primary">{formatPrice(item.price_catalog)}</span>
                  )}
                </div>
                {Number(item.electric_power_kw) > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Zap size={10} className="text-amber-500" />
                    <span className="text-[10px] text-on-surface-variant">{item.electric_power_kw} kW</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ LIST VIEW (compact) ═══════ */}
      {!isLoading && !error && viewMode === 'list' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/10">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ürün</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Açıklama</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Boyutlar (mm)</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">kW</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Stok</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Fiyat</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center w-20">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {products.map((item) => (
                <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-surface-container-high/50 cursor-pointer transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ProductImage src={item.image_thumb || item.image_big} alt={item.name} className="w-10 h-10 rounded-md flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          {item.name}
                          {item.is_new && <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1 py-0.5 rounded">YENİ</span>}
                        </div>
                        <div className="text-[10px] font-mono text-on-surface-variant">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-on-surface-variant max-w-xs truncate">{item.description_tech_spec}</td>
                  <td className="py-3 px-4 text-xs text-on-surface font-mono">{item.length_mm}×{item.width_mm}×{item.height_mm}</td>
                  <td className="py-3 px-4 text-xs text-on-surface">{Number(item.electric_power_kw) > 0 ? `${item.electric_power_kw} kW` : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.stock && item.stock !== '0' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.stock || 'Yok'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-primary text-right">{formatPrice(item.price_catalog)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }} className="p-1.5 rounded-lg text-on-surface-variant/30 hover:text-primary hover:bg-primary/10 transition-all"><MapPin size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(toCartItem(item)); }} className={`p-1.5 rounded-lg transition-all ${isInCart(item.id) ? 'text-emerald-600 bg-emerald-50' : 'text-on-surface-variant/30 hover:text-emerald-600 hover:bg-emerald-50'}`}><ShoppingCart size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════ FULL TABLE VIEW (all columns) ═══════ */}
      {!isLoading && !error && viewMode === 'table' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-container border-b border-outline-variant/10">
                <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant sticky left-0 bg-surface-container z-20 min-w-[60px]">İşlem</th>
                <th className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant sticky left-[60px] bg-surface-container z-20 min-w-[50px]">Görsel</th>
                {activeColumns.map(col => (
                  <th key={col.key} className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {products.map((item) => (
                <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-surface-container-high/50 cursor-pointer transition-colors">
                  <td className="py-2 px-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); addToCart(toCartItem(item)); }} className={`p-1 rounded transition-all ${isInCart(item.id) ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-600'}`} title="Sepete ekle"><ShoppingCart size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }} className="p-1 rounded text-slate-300 hover:text-primary transition-all" title="Kat planına ekle"><MapPin size={13} /></button>
                    </div>
                  </td>
                  <td className="py-2 px-3 sticky left-[60px] bg-white z-10">
                    <ProductImage src={item.image_thumb || item.image_big} alt={item.name} className="w-8 h-8 rounded flex-shrink-0" />
                  </td>
                  {activeColumns.map(col => {
                    const val = (item as any)[col.key];
                    return (
                      <td key={col.key} className="py-2 px-3 text-[11px] text-on-surface whitespace-nowrap max-w-[250px] truncate" title={String(val ?? '')}>
                        {col.key === 'name' ? (
                          <span className="font-bold">{val}</span>
                        ) : col.key === 'price_promo' && (item.price_promo ?? 0) > 0 ? (
                          <span className="text-red-600 font-bold">{formatCellValue(col.key, val)}</span>
                        ) : col.key === 'is_new' && val ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Evet</span>
                        ) : col.key === 'is_good_deal' && val ? (
                          <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Evet</span>
                        ) : col.key === 'stock' ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${val && val !== '0' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {val || '—'}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">{formatCellValue(col.key, val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="py-16 text-center">
          <Package size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <h3 className="text-lg font-bold text-on-surface-variant mb-1">Ürün bulunamadı</h3>
          <p className="text-sm text-on-surface-variant/60">Farklı arama terimleri veya filtreler deneyin.</p>
          {(filters.search || filters.family || filters.promoOnly || filters.newOnly || filters.inStockOnly) && (
            <button onClick={resetFilters} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> / {totalCount.toLocaleString()} ürün
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={currentPage === 1} className="px-2 py-1.5 rounded text-xs font-medium text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-colors">«</button>
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map((page) => (
              <button key={page} onClick={() => setPage(page)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${page === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>{page}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
            <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1.5 rounded text-xs font-medium text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-colors">»</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <ProductImage src={detailItem.image_big || detailItem.image_thumb} alt={detailItem.name} className="w-full h-64 bg-white" />
              <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"><X size={18} /></button>
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="bg-black/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Diamond</span>
                {detailItem.is_new && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">YENİ</span>}
                {detailItem.is_good_deal && <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">FIRSAT</span>}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-headline font-black text-on-surface">{detailItem.name}</h2>
                <p className="text-sm font-mono text-on-surface-variant mt-1">{detailItem.id}</p>
              </div>

              {detailItem.description_tech_spec && <p className="text-sm text-on-surface-variant leading-relaxed">{detailItem.description_tech_spec}</p>}
              {detailItem.popup_info && <p className="text-xs text-on-surface-variant/70 leading-relaxed">{detailItem.popup_info}</p>}

              {/* All data in organized grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1"><Ruler size={14} /> Boyutlar (mm)</div>
                  <p className="font-bold text-on-surface text-sm">{detailItem.length_mm} × {detailItem.width_mm} × {detailItem.height_mm}</p>
                  {detailItem.volume_m3 && <p className="text-[10px] text-on-surface-variant mt-0.5">Hacim: {detailItem.volume_m3} m³</p>}
                  {detailItem.weight && <p className="text-[10px] text-on-surface-variant mt-0.5">Ağırlık: {detailItem.weight} {detailItem.weight_unit}</p>}
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1"><Zap size={14} /> Elektrik</div>
                  <p className="font-bold text-on-surface text-sm">{Number(detailItem.electric_power_kw) > 0 ? `${detailItem.electric_power_kw} kW` : 'Yok'}</p>
                  {detailItem.electric_connection && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.electric_connection}</p>}
                  {detailItem.electric_connection_2 && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.electric_connection_2}</p>}
                  {detailItem.kcal_power && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.kcal_power} kcal</p>}
                  {detailItem.horse_power && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.horse_power} HP</p>}
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1"><Euro size={14} /> Fiyat</div>
                  {(detailItem.price_promo ?? 0) > 0 ? (
                    <div>
                      <span className="text-xs text-on-surface-variant line-through mr-2">{formatPrice(detailItem.price_catalog)}</span>
                      <span className="font-bold text-red-600 text-sm">{formatPrice(detailItem.price_promo)}</span>
                    </div>
                  ) : (
                    <p className="font-bold text-primary text-sm">{formatPrice(detailItem.price_catalog)}</p>
                  )}
                  {detailItem.price_display && <p className="text-[10px] text-on-surface-variant mt-0.5">Gösterilen: {formatPrice(detailItem.price_display)}</p>}
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.currency}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1"><Package size={14} /> Stok & Teslimat</div>
                  <p className={`font-bold text-sm ${detailItem.stock && detailItem.stock !== '0' ? 'text-emerald-600' : 'text-slate-400'}`}>{detailItem.stock || 'Stokta Yok'}</p>
                  {detailItem.restock_info && <p className="text-[10px] text-on-surface-variant mt-0.5">Yeniden: {detailItem.restock_info}</p>}
                  {detailItem.supplier_delivery_delay && <p className="text-[10px] text-on-surface-variant mt-0.5">Teslimat: {detailItem.supplier_delivery_delay} gün</p>}
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="text-xs text-on-surface-variant mb-1 font-medium">Kategori</div>
                  <p className="text-xs font-bold text-on-surface">{detailItem.product_family_name}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Kategori: {detailItem.product_category_id}</p>
                  <p className="text-[10px] text-on-surface-variant">Grup: {detailItem.product_range_id}</p>
                  <p className="text-[10px] text-on-surface-variant">Hat: {detailItem.product_line_id}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="text-xs text-on-surface-variant mb-1 font-medium">Durum</div>
                  <div className="flex flex-wrap gap-1">
                    {detailItem.is_new && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Yeni</span>}
                    {detailItem.is_good_deal && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Kampanyalı</span>}
                    {detailItem.has_accessories && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">Aksesuar Var</span>}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">Tip: {detailItem.product_type}</span>
                  </div>
                  {detailItem.replacement_product_id && <p className="text-[10px] text-on-surface-variant mt-1">Yedek: {detailItem.replacement_product_id}</p>}
                  {detailItem.page_catalog_number && <p className="text-[10px] text-on-surface-variant mt-0.5">Katalog Sayfa: {detailItem.page_catalog_number}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => addToCart(toCartItem(detailItem))}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${isInCart(detailItem.id) ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                  <ShoppingCart size={16} /> {isInCart(detailItem.id) ? 'Sepette' : 'Sepete Ekle'}
                </button>
                <button
                  onClick={() => { setDetailItem(null); handleShowOnFloorPlan(detailItem.id); }}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <MapPin size={16} /> Kat Planına Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Selection Modal */}
      {projectModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProjectModalItem(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
              <div>
                <h2 className="text-base font-headline font-black text-on-surface">Projeye Ekle</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Hangi projenin kat planına eklensin?</p>
              </div>
              <button onClick={() => setProjectModalItem(null)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {activeProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2"><Clock size={13} className="text-primary" /><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Devam Eden</span></div>
                  <div className="space-y-2">
                    {activeProjects.map(p => (
                      <button key={p.id} onClick={() => handleProjectSelect(p.id)} className="w-full text-left px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/30 transition-all group">
                        <div className="flex items-center justify-between"><span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{p.name}</span><MapPin size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                        <div className="flex items-center gap-3 mt-1"><span className="text-[10px] text-on-surface-variant">{p.clientName}</span><span className="text-[10px] text-on-surface-variant">{p.area} m²</span></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {completedProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2"><CheckCircle2 size={13} className="text-on-surface-variant/50" /><span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50">Tamamlanan</span></div>
                  <div className="space-y-2">
                    {completedProjects.map(p => (
                      <button key={p.id} onClick={() => handleProjectSelect(p.id)} className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/10 transition-all group opacity-70 hover:opacity-100">
                        <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {projects.length === 0 && (
                <div className="py-10 text-center"><Package size={36} className="mx-auto text-on-surface-variant/20 mb-3" /><p className="text-sm font-bold text-on-surface-variant">Henüz proje yok</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
