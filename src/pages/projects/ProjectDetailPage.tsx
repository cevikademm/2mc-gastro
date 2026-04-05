import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectStore, type ProductItem } from '../../stores/projectStore';
import {
  ArrowLeft, Ruler, ClipboardList, Calendar, Building,
  Plus, Trash2, Edit, Package, Flame, Droplets, Refrigerator,
  Table, Microwave, Waves, Image as ImageIcon, Eye, Settings2, Users
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  refrigerator: Refrigerator, flame: Flame, droplets: Droplets,
  microwave: Microwave, waves: Waves, table: Table,
};

const CATEGORY_LABELS: Record<string, string> = {
  cooking: 'Pişirme', cold: 'Soğutma', cleaning: 'Temizlik', neutral: 'Nötr', other: 'Diğer',
};

const CATEGORY_COLORS: Record<string, string> = {
  cooking: '#ef4444', cold: '#3b82f6', cleaning: '#06b6d4', neutral: '#6b7280', other: '#8b5cf6',
};

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, selectedProject, selectProject, clearSelection, removeProductFromProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'settings'>('overview');
  const [viewProduct, setViewProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (id) selectProject(id);
    return () => clearSelection();
  }, [id, projects]);

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto w-full text-center py-20">
        <p className="text-on-surface-variant">{t('common.noData')}</p>
        <Link to="/projects" className="text-primary font-medium hover:underline mt-4 inline-block">{t('common.back')}</Link>
      </div>
    );
  }

  const p = project;
  const statusColors: Record<string, string> = {
    drafting: 'bg-blue-100 text-primary',
    quoted: 'bg-amber-100 text-amber-900',
    complete: 'bg-emerald-100 text-emerald-900',
    inProgress: 'bg-violet-100 text-violet-900',
  };

  const totalKW = p.products.reduce((sum, prod) => sum + prod.kw, 0);
  const totalPrice = p.products.reduce((sum, prod) => sum + prod.price, 0);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
        <ArrowLeft size={18} /> Projeler
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">{p.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${statusColors[p.status]}`}>
              {p.status}
            </span>
            <span className="text-sm text-on-surface-variant">{p.products.length} ürün</span>
            <span className="text-sm text-on-surface-variant">•</span>
            <span className="text-sm text-on-surface-variant">{p.area} m²</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/projects/${p.id}/products/add`}
            className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high text-primary px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm border border-primary/20"
          >
            <Plus size={18} /> Ürün Ekle
          </Link>
          <Link
            to={`/projects/${p.id}/design`}
            className="flex items-center gap-2 brushed-metal text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:opacity-90 transition-all"
          >
            <Ruler size={18} /> Kat Planı
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant/20">
        <div className="flex gap-6">
          {[
            { key: 'overview', label: 'Genel Bakış', icon: Building },
            { key: 'products', label: `Ürünler (${p.products.length})`, icon: Package },
            { key: 'settings', label: 'Ayarlar', icon: Settings2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${
                  isActive ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Ürün Sayısı</div>
                <div className="text-2xl font-black text-primary mt-1">{p.products.length}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Güç</div>
                <div className="text-2xl font-black text-primary mt-1">{totalKW.toFixed(1)} <span className="text-sm">kW</span></div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Fiyat</div>
                <div className="text-2xl font-black text-primary mt-1">€{totalPrice.toLocaleString()}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Alan</div>
                <div className="text-2xl font-black text-primary mt-1">{p.area} <span className="text-sm">m²</span></div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/10">
              <h2 className="font-headline font-bold text-primary text-sm uppercase tracking-wider mb-4">Proje Detayları</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Building size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-xs text-on-surface-variant font-bold uppercase">Proje Tipi</div>
                    <div className="text-sm font-medium mt-1 capitalize">{p.type}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-xs text-on-surface-variant font-bold uppercase">Sorumlu</div>
                    <div className="text-sm font-medium mt-1">{p.lead || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-xs text-on-surface-variant font-bold uppercase">Teslim Tarihi</div>
                    <div className="text-sm font-medium mt-1">{p.deadline || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-xs text-on-surface-variant font-bold uppercase">Müşteri</div>
                    <div className="text-sm font-medium mt-1">{p.clientName || '-'}</div>
                  </div>
                </div>
              </div>
              {p.notes && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                  <div className="text-xs text-on-surface-variant font-bold uppercase mb-1">Notlar</div>
                  <p className="text-sm text-on-surface">{p.notes}</p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/10">
              <h2 className="font-headline font-bold text-primary text-sm uppercase tracking-wider mb-4">İlerleme</h2>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="flex justify-between mt-3 text-xs text-on-surface-variant">
                <span>{p.startDate || '-'}</span>
                <span className="font-bold text-primary">{p.progress}%</span>
                <span>{p.deadline || '-'}</span>
              </div>
            </div>
          </div>

          {/* Quick product preview */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-bold text-primary text-sm uppercase tracking-wider">Ürünler</h2>
                <button onClick={() => setActiveTab('products')} className="text-xs text-primary font-bold hover:underline">Tümü →</button>
              </div>
              {p.products.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">Henüz ürün eklenmedi</p>
                  <Link to={`/projects/${p.id}/products/add`} className="text-xs text-primary font-bold hover:underline mt-2 inline-block">
                    İlk ürünü ekle →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {p.products.slice(0, 5).map((prod) => {
                    const Icon = ICON_MAP[prod.icon] || Package;
                    return (
                      <div key={prod.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        {prod.imageData ? (
                          <img src={prod.imageData} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Icon size={16} style={{ color: CATEGORY_COLORS[prod.category] }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-700 truncate">{prod.name}</div>
                          <div className="text-[10px] text-slate-400">{prod.dimensions.width}×{prod.dimensions.height}cm</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{prod.kw}kW</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-on-surface-variant">{p.products.length} ürün mevcut</p>
            <Link
              to={`/projects/${p.id}/products/add`}
              className="flex items-center gap-2 brushed-metal text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              <Plus size={16} /> Yeni Ürün Ekle
            </Link>
          </div>

          {p.products.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-16 text-center border border-outline-variant/10">
              <Package size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="font-bold text-lg text-slate-500 mb-2">Henüz ürün eklenmedi</h3>
              <p className="text-sm text-slate-400 mb-6">Bu projeye ürün ekleyerek başlayın. Görsel, teknik özellik ve fiyat bilgilerini girin.</p>
              <Link
                to={`/projects/${p.id}/products/add`}
                className="inline-flex items-center gap-2 brushed-metal text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all"
              >
                <Plus size={18} /> İlk Ürünü Ekle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {p.products.map((prod) => {
                const Icon = ICON_MAP[prod.icon] || Package;
                return (
                  <div key={prod.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden group">
                    {/* Product Image */}
                    <div className="h-40 bg-slate-50 relative flex items-center justify-center">
                      {prod.imageData ? (
                        <img src={prod.imageData} alt={prod.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Icon size={40} style={{ color: CATEGORY_COLORS[prod.category] }} className="opacity-30" />
                      )}
                      <div className="absolute top-2 left-2">
                        <span
                          className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[prod.category] }}
                        >
                          {CATEGORY_LABELS[prod.category]}
                        </span>
                      </div>
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => setViewProduct(prod)}
                          className="p-1.5 bg-white/90 text-slate-500 hover:text-primary rounded-md shadow-sm"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => removeProductFromProject(p.id, prod.id)}
                          className="p-1.5 bg-white/90 text-slate-500 hover:text-red-500 rounded-md shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-on-surface">{prod.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{prod.code}</p>
                      {prod.description && <p className="text-xs text-slate-500 mt-2">{prod.description}</p>}

                      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                        <span className="font-bold">{prod.dimensions.width}×{prod.dimensions.height}cm</span>
                        {prod.kw > 0 && <span>•</span>}
                        {prod.kw > 0 && <span className="font-bold">{prod.kw} kW</span>}
                        {prod.price > 0 && <span>•</span>}
                        {prod.price > 0 && <span className="font-bold text-primary">€{prod.price.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/10">
            <h2 className="font-headline font-bold text-primary text-sm uppercase tracking-wider mb-4">Oda Boyutları</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Uzunluk (cm)</label>
                <input type="number" defaultValue={p.roomWidthCm} className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Genişlik (cm)</label>
                <input type="number" defaultValue={p.roomHeightCm} className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {viewProduct.imageData && (
              <img src={viewProduct.imageData} alt={viewProduct.name} className="w-full h-56 object-contain bg-slate-50 rounded-t-2xl" />
            )}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="font-bold text-xl text-on-surface">{viewProduct.name}</h2>
                <p className="text-sm text-slate-400 font-mono">{viewProduct.code}</p>
              </div>
              {viewProduct.description && <p className="text-sm text-slate-600">{viewProduct.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Boyutlar</span>
                  <p className="font-medium">{viewProduct.dimensions.width} × {viewProduct.dimensions.height} × {viewProduct.dimensions.depth} cm</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Güç</span>
                  <p className="font-medium">{viewProduct.kw} kW ({viewProduct.powerType})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Marka</span>
                  <p className="font-medium">{viewProduct.brand || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fiyat</span>
                  <p className="font-medium text-primary">€{viewProduct.price.toLocaleString()}</p>
                </div>
              </div>
              {viewProduct.features.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Özellikler</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewProduct.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setViewProduct(null)} className="w-full py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
