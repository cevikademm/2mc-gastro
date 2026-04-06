import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDiamondStore, type DiamondProduct } from '../../stores/diamondStore';
import { useCartStore } from '../../stores/cartStore';
import { useProjectStore } from '../../stores/projectStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import {
  Search, X, ChevronLeft, ChevronRight, Grid3X3, List,
  Zap, Ruler, Euro, Package, Heart, MapPin,
  ShoppingCart, Diamond, RefreshCw, Tag, Sparkles, Box,
  Clock, CheckCircle2, Loader2
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailItem, setDetailItem] = useState<DiamondProduct | null>(null);
  const [projectModalItem, setProjectModalItem] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Unique family names for category bar
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

  // Convert DiamondProduct to cart-compatible format
  const toCartItem = (p: DiamondProduct) => ({
    id: p.id,
    name: p.name,
    desc: p.description_tech_spec || '',
    cat: p.product_family_name || 'other',
    sub: p.product_subfamily_id || '',
    fam: p.product_family_name || '',
    img: p.image_big || p.image_thumb || '',
    brand: 'Diamond',
    l: parseInt(p.length_mm) || 0,
    w: parseInt(p.width_mm) || 0,
    h: p.height_mm || '0',
    kw: p.electric_power_kw || 0,
    price: p.price_catalog || p.price_display || 0,
    line: p.product_line_id || '',
  });

  // Pagination range
  const maxPages = 7;
  let pageStart = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let pageEnd = Math.min(totalPages, pageStart + maxPages - 1);
  if (pageEnd - pageStart < maxPages - 1) pageStart = Math.max(1, pageEnd - maxPages + 1);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
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
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Ürün ara (isim, kod, açıklama)..."
              className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            {filters.search && (
              <button onClick={() => setFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          {/* Quick filters */}
          <button
            onClick={() => setFilter('promoOnly', !filters.promoOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.promoOnly ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Tag size={14} />
            Promo
          </button>
          <button
            onClick={() => setFilter('newOnly', !filters.newOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.newOnly ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Sparkles size={14} />
            Yeni
          </button>
          <button
            onClick={() => setFilter('inStockOnly', !filters.inStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filters.inStockOnly ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Box size={14} />
            Stokta
          </button>
          <div className="flex bg-surface-container-highest rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter('family', ''); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !filters.family
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tümü ({totalCount.toLocaleString()})
        </button>
        {familyGroups.slice(0, 20).map((fam) => (
          <button
            key={fam.name}
            onClick={() => setFilter('family', filters.family === fam.name ? '' : fam.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filters.family === fam.name
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
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

      {/* Product Grid / List */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group relative"
            >
              {/* Badges */}
              <div className="absolute top-2 left-2 z-10 flex gap-1">
                {item.is_new && (
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">YENİ</span>
                )}
                {item.is_good_deal && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">FIRSAT</span>
                )}
                {item.price_promo && item.price_promo > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PROMO</span>
                )}
              </div>

              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }}
                  className="p-1.5 rounded-full bg-white/90 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 shadow-sm transition-all"
                  title="Kat planına ekle"
                >
                  <MapPin size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(toCartItem(item)); }}
                  className={`p-1.5 rounded-full shadow-sm transition-all ${isInCart(item.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-white/90 text-on-surface-variant/40 hover:text-emerald-600 hover:bg-emerald-50'}`}
                  title="Sepete ekle"
                >
                  <ShoppingCart size={12} />
                </button>
              </div>

              <ProductImage
                src={item.image_big || item.image_thumb}
                alt={item.name}
                className="w-full h-36 bg-white"
              />
              <div className="p-3">
                <h3 className="text-xs font-bold text-on-surface line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-mono mb-2">{item.id}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant">{item.product_family_name}</span>
                  {(item.price_promo && item.price_promo > 0) ? (
                    <div className="text-right">
                      <span className="text-[9px] text-on-surface-variant line-through mr-1">{formatPrice(item.price_catalog)}</span>
                      <span className="text-xs font-bold text-red-600">{formatPrice(item.price_promo)}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-primary">{formatPrice(item.price_catalog)}</span>
                  )}
                </div>
                {(item.electric_power_kw ?? 0) > 0 && (
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

      {/* List View */}
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
                  <td className="py-3 px-4 text-xs text-on-surface">{(item.electric_power_kw ?? 0) > 0 ? `${item.electric_power_kw} kW` : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.stock && item.stock !== '0' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.stock || 'Yok'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-primary text-right">{formatPrice(item.price_catalog)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }}
                        className="p-1.5 rounded-lg text-on-surface-variant/30 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Kat planına ekle"
                      >
                        <MapPin size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(toCartItem(item)); }}
                        className={`p-1.5 rounded-lg transition-all ${isInCart(item.id) ? 'text-emerald-600 bg-emerald-50' : 'text-on-surface-variant/30 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title="Sepete ekle"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </td>
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
            <button
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1.5 rounded text-xs font-medium text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                  page === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1.5 rounded text-xs font-medium text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <ProductImage src={detailItem.image_big || detailItem.image_thumb} alt={detailItem.name} className="w-full h-64 bg-white" />
              <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                <X size={18} />
              </button>
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

              {detailItem.description_tech_spec && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{detailItem.description_tech_spec}</p>
              )}

              {detailItem.popup_info && (
                <p className="text-xs text-on-surface-variant/70 leading-relaxed">{detailItem.popup_info}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Ruler size={14} /> Boyutlar (mm)
                  </div>
                  <p className="font-bold text-on-surface text-sm">{detailItem.length_mm} × {detailItem.width_mm} × {detailItem.height_mm}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Zap size={14} /> Elektrik Gücü
                  </div>
                  <p className="font-bold text-on-surface text-sm">{(detailItem.electric_power_kw ?? 0) > 0 ? `${detailItem.electric_power_kw} kW` : 'Yok'}</p>
                  {detailItem.electric_connection && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.electric_connection}</p>}
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Euro size={14} /> Fiyat
                  </div>
                  {detailItem.price_promo && detailItem.price_promo > 0 ? (
                    <div>
                      <span className="text-xs text-on-surface-variant line-through mr-2">{formatPrice(detailItem.price_catalog)}</span>
                      <span className="font-bold text-red-600 text-sm">{formatPrice(detailItem.price_promo)}</span>
                    </div>
                  ) : (
                    <p className="font-bold text-primary text-sm">{formatPrice(detailItem.price_catalog)}</p>
                  )}
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Package size={14} /> Stok
                  </div>
                  <p className={`font-bold text-sm ${detailItem.stock && detailItem.stock !== '0' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {detailItem.stock || 'Stokta Yok'}
                  </p>
                  {detailItem.restock_info && <p className="text-[10px] text-on-surface-variant mt-0.5">{detailItem.restock_info}</p>}
                </div>
              </div>

              {/* Extra info */}
              <div className="flex flex-wrap gap-2">
                {detailItem.product_family_name && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.product_family_name}</span>}
                {detailItem.weight && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.weight} {detailItem.weight_unit}</span>}
                {detailItem.volume_m3 && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.volume_m3} m³</span>}
                {detailItem.kcal_power && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.kcal_power} kcal</span>}
                {detailItem.horse_power && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.horse_power} HP</span>}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => addToCart(toCartItem(detailItem))}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    isInCart(detailItem.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
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
                <p className="text-xs text-on-surface-variant mt-0.5">Ürünü hangi projenin kat planına eklemek istiyorsunuz?</p>
              </div>
              <button onClick={() => setProjectModalItem(null)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {activeProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={13} className="text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Devam Eden Projeler</span>
                  </div>
                  <div className="space-y-2">
                    {activeProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleProjectSelect(p.id)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{p.name}</span>
                          <MapPin size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-on-surface-variant">{p.clientName}</span>
                          <span className="text-[10px] text-on-surface-variant">{p.area} m²</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{p.progress}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {completedProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={13} className="text-on-surface-variant/50" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50">Tamamlanan Projeler</span>
                  </div>
                  <div className="space-y-2">
                    {completedProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleProjectSelect(p.id)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/10 transition-all group opacity-70 hover:opacity-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{p.name}</span>
                          <MapPin size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-on-surface-variant/70">{p.clientName}</span>
                          <span className="text-[10px] text-on-surface-variant/70">{p.area} m²</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {projects.length === 0 && (
                <div className="py-10 text-center">
                  <Package size={36} className="mx-auto text-on-surface-variant/20 mb-3" />
                  <p className="text-sm font-bold text-on-surface-variant">Henüz proje yok</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Önce bir proje oluşturun.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
