import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEquipmentStore, CATEGORIES, type EquipmentItem } from '../stores/equipmentStore';
import {
  Search, X, ChevronLeft, ChevronRight, Grid3X3, List,
  Refrigerator, Flame, Droplets, Microwave, Waves, Table,
  Zap, Ruler, Euro, Package, ExternalLink, Heart, MapPin
} from 'lucide-react';

const iconMap: Record<string, any> = {
  refrigerator: Refrigerator,
  flame: Flame,
  droplets: Droplets,
  microwave: Microwave,
  waves: Waves,
  table: Table,
};

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

export default function Catalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useEquipmentStore();
  const {
    selectedCategory, selectedSubrange, searchQuery, currentPage,
    setCategory, setSubrange, setSearch, setPage,
    getFilteredItems, getSubranges, getTotalPages,
    toggleFavorite, favorites, setFloorPlanItem,
  } = store;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailItem, setDetailItem] = useState<EquipmentItem | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleShowOnFloorPlan = (id: string) => {
    setFloorPlanItem(id);
    navigate('/design');
  };

  let items = getFilteredItems();
  const subranges = getSubranges();
  let totalPages = getTotalPages();

  // Count total filtered (without pagination)
  let allFiltered = store.allItems;
  if (selectedCategory) allFiltered = allFiltered.filter(i => i.cat === selectedCategory);
  if (selectedSubrange) allFiltered = allFiltered.filter(i => i.sub === selectedSubrange);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    allFiltered = allFiltered.filter(i =>
      i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) ||
      i.desc.toLowerCase().includes(q) || i.fam.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
    );
  }

  // Apply favorites filter
  if (showFavoritesOnly) {
    allFiltered = allFiltered.filter(i => favorites.includes(i.id));
    items = items.filter(i => favorites.includes(i.id));
    totalPages = Math.ceil(allFiltered.length / 24);
  }
  const totalFiltered = allFiltered.length;

  const formatPrice = (p: number) => p > 0 ? `€${p.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—';

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
        <div>
          <h1 className="text-3xl font-headline font-black text-on-surface tracking-tight">Ekipman Kataloğu</h1>
          <p className="text-on-surface-variant text-sm mt-1">{totalFiltered.toLocaleString()} ürün{selectedCategory ? ` — ${CATEGORIES.find(c => c.id === selectedCategory)?.name}` : ''}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara (isim, kod, açıklama)..."
              className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              showFavoritesOnly ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Heart size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            {favorites.length > 0 && <span>{favorites.length}</span>}
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
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !selectedCategory
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tümü ({store.allItems.length.toLocaleString()})
        </button>
        {CATEGORIES.filter(c => c.count > 0).map((cat) => {
          const Icon = iconMap[cat.icon] || Package;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(isActive ? '' : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
              style={isActive ? { backgroundColor: cat.color } : {}}
            >
              <Icon size={13} />
              {cat.name} ({cat.count})
            </button>
          );
        })}
      </div>

      {/* Subrange Filter */}
      {subranges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-on-surface-variant font-medium self-center mr-2">Alt Grup:</span>
          <button
            onClick={() => setSubrange('')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              !selectedSubrange ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tümü
          </button>
          {subranges.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubrange(selectedSubrange === sub ? '' : sub)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedSubrange === sub ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group relative"
            >
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                  className={`p-1.5 rounded-full shadow-sm transition-all ${isFav ? 'bg-pink-50 text-pink-500' : 'bg-white/90 text-on-surface-variant/40 hover:text-pink-500'}`}
                >
                  <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }}
                  className="p-1.5 rounded-full bg-white/90 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 shadow-sm transition-all"
                  title="Kat planina ekle"
                >
                  <MapPin size={12} />
                </button>
              </div>
              {/* Favorite indicator (always visible when favorited) */}
              {isFav && (
                <div className="absolute top-2 left-2 z-10">
                  <Heart size={12} fill="#ec4899" className="text-pink-500" />
                </div>
              )}
              <ProductImage
                src={item.img}
                alt={item.name}
                className="w-full h-36 bg-white"
              />
              <div className="p-3">
                <h3 className="text-xs font-bold text-on-surface line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-mono mb-2">{item.id}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant">{item.brand}</span>
                  {item.price > 0 && (
                    <span className="text-xs font-bold text-primary">{formatPrice(item.price)}</span>
                  )}
                </div>
                {item.kw > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Zap size={10} className="text-amber-500" />
                    <span className="text-[10px] text-on-surface-variant">{item.kw} kW</span>
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/10">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ürün</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Açıklama</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Boyutlar (mm)</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">kW</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Fiyat</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center w-24">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {items.map((item) => {
                const isFav = favorites.includes(item.id);
                return (
                <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-surface-container-high/50 cursor-pointer transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ProductImage src={item.img} alt={item.name} className="w-10 h-10 rounded-md flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          {item.name}
                          {isFav && <Heart size={10} fill="#ec4899" className="text-pink-500 flex-shrink-0" />}
                        </div>
                        <div className="text-[10px] font-mono text-on-surface-variant">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-on-surface-variant max-w-xs truncate">{item.desc}</td>
                  <td className="py-3 px-4 text-xs text-on-surface font-mono">{item.l}x{item.w}x{item.h}</td>
                  <td className="py-3 px-4 text-xs text-on-surface">{item.kw > 0 ? `${item.kw} kW` : '—'}</td>
                  <td className="py-3 px-4 text-xs font-bold text-primary text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                        className={`p-1.5 rounded-lg transition-all ${isFav ? 'text-pink-500 bg-pink-50' : 'text-on-surface-variant/30 hover:text-pink-500 hover:bg-pink-50'}`}
                        title={isFav ? 'Favorilerden cikar' : 'Favorilere ekle'}
                      >
                        <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShowOnFloorPlan(item.id); }}
                        className="p-1.5 rounded-lg text-on-surface-variant/30 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Kat planina ekle"
                      >
                        <MapPin size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="py-16 text-center">
          <Package size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <h3 className="text-lg font-bold text-on-surface-variant mb-1">Ürün bulunamadı</h3>
          <p className="text-sm text-on-surface-variant/60">Farklı arama terimleri veya filtreler deneyin.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface">{((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalFiltered)}</span> / {totalFiltered.toLocaleString()} ürün
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
                  page === currentPage ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
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
              <ProductImage src={detailItem.img} alt={detailItem.name} className="w-full h-64 bg-white" />
              <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                <X size={18} />
              </button>
              {detailItem.brand && (
                <span className="absolute top-3 left-3 bg-black/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{detailItem.brand}</span>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-headline font-black text-on-surface">{detailItem.name}</h2>
                <p className="text-sm font-mono text-on-surface-variant mt-1">{detailItem.id}</p>
              </div>

              {detailItem.desc && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{detailItem.desc}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Ruler size={14} /> Boyutlar (mm)
                  </div>
                  <p className="font-bold text-on-surface text-sm">{detailItem.l} × {detailItem.w} × {detailItem.h}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Zap size={14} /> Elektrik Gücü
                  </div>
                  <p className="font-bold text-on-surface text-sm">{detailItem.kw > 0 ? `${detailItem.kw} kW` : 'Yok'}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Euro size={14} /> Katalog Fiyatı
                  </div>
                  <p className="font-bold text-primary text-sm">{formatPrice(detailItem.price)}</p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                    <Package size={14} /> Kategori
                  </div>
                  <p className="font-bold text-on-surface text-sm">{CATEGORIES.find(c => c.id === detailItem.cat)?.name || detailItem.cat}</p>
                </div>
              </div>

              {(detailItem.sub || detailItem.fam || detailItem.line) && (
                <div className="flex flex-wrap gap-2">
                  {detailItem.sub && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.sub}</span>}
                  {detailItem.fam && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.fam}</span>}
                  {detailItem.line && <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[11px] font-medium text-on-surface-variant">{detailItem.line}</span>}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setDetailItem(null); handleShowOnFloorPlan(detailItem.id); }}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <MapPin size={16} /> Kat Planina Ekle
                </button>
                <button
                  onClick={() => toggleFavorite(detailItem.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    favorites.includes(detailItem.id)
                      ? 'bg-pink-50 text-pink-600 border border-pink-200'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-pink-50 hover:text-pink-500'
                  }`}
                >
                  <Heart size={16} fill={favorites.includes(detailItem.id) ? 'currentColor' : 'none'} />
                  {favorites.includes(detailItem.id) ? 'Favori' : 'Favori'}
                </button>
              </div>

              {detailItem.img && (
                <a href={detailItem.img} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
                  <ExternalLink size={12} /> Tam boyut gorsel
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
