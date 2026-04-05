import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectStore, type ProductItem } from '../../stores/projectStore';
import {
  ArrowLeft, Ruler, ClipboardList, Calendar, Building,
  Plus, Trash2, Package, Flame, Droplets, Refrigerator,
  Table, Microwave, Waves, Eye, Settings2, Users, FileText, Download, Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

function QuoteTab({ project }: { project: import('../../stores/projectStore').Project }) {
  const { products, name, clientName, id } = project;
  const quoteNo = `TKF-${id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const vatRate = 0.19;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  const fmt = (n: number) => n > 0 ? `€${n.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—';
  const quoteRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportQuotePDF = async () => {
    if (!quoteRef.current) return;
    setExporting(true);
    try {
      // A4 portrait: 210mm × 297mm at 96dpi ≈ 794 × 1123px
      const canvas = await html2canvas(quoteRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 5000,
      });
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();   // 210mm
      const pageH = doc.internal.pageSize.getHeight();  // 297mm
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;

      if (imgH <= pageH) {
        doc.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      } else {
        // Multi-page: slice the canvas into A4-height chunks
        const pxPerPage = (canvas.width * pageH) / pageW;
        let offsetY = 0;
        while (offsetY < canvas.height) {
          if (offsetY > 0) doc.addPage();
          const sliceH = Math.min(pxPerPage, canvas.height - offsetY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, -offsetY);
          doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, (sliceH * pageW) / canvas.width);
          offsetY += pxPerPage;
        }
      }
      doc.save(`Teklif_${quoteNo}_${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-xl text-on-surface">Teklif Formu</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{clientName || 'Müşteri'} — {name} <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">{quoteNo}</span></p>
        </div>
        <button
          onClick={exportQuotePDF}
          disabled={exporting}
          className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm border border-primary/20 self-start disabled:opacity-60"
        >
          {exporting ? <><Loader2 size={16} className="animate-spin" /> Hazırlanıyor...</> : <><Download size={16} /> PDF İndir</>}
        </button>
      </div>

      {/* Quote Document — captured by html2canvas for PDF */}
      <div ref={quoteRef} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Hologram watermark — new circular logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src="/logo-hologram.png"
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo-icon.png'; }}
            className="w-80 h-80 object-contain select-none"
            style={{ opacity: 0.06, filter: 'saturate(0.3) hue-rotate(200deg)' }}
          />
        </div>

        {/* Document header with logo */}
        <div className="relative z-10 bg-primary px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo-icon.png" alt="2MC" className="h-12 w-12 object-contain bg-white rounded-full p-1.5 shadow" />
            <div>
              <img src="/logo-werbung.png" alt="2MC Werbung" className="h-7 object-contain brightness-0 invert" />
              <p className="text-white/70 text-[10px] mt-0.5">Professionelle Großküchentechnik</p>
            </div>
          </div>
          <div className="text-right text-white">
            <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Teklif No</p>
            <p className="font-black text-lg font-mono">{quoteNo}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Client info bar */}
        <div className="relative z-10 bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Müşteri</span>
            <span className="font-bold text-slate-700">{clientName || '—'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Proje</span>
            <span className="font-bold text-slate-700">{name}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Teklif Tarihi</span>
            <span className="font-bold text-slate-700">{new Date().toLocaleDateString('tr-TR')}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Geçerlilik</span>
            <span className="font-bold text-slate-700">30 Gün</span>
          </div>
        </div>

        {/* Product list */}
        {products.length === 0 ? (
          <div className="relative z-10 py-20 text-center">
            <Package size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">Teklif için ürün ekleyin</p>
            <Link to={`/projects/${project.id}/products/add`} className="text-primary text-sm font-bold hover:underline mt-2 inline-block">
              Ürün ekle →
            </Link>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Table header */}
            <div className="hidden sm:grid px-6 py-2.5 bg-primary/5 border-b border-slate-200 text-[9px] font-black uppercase tracking-widest text-primary" style={{ gridTemplateColumns: '64px 1fr 80px 90px 60px 90px' }}>
              <div>Görsel</div>
              <div>Ürün Bilgileri</div>
              <div>Ölçü (cm)</div>
              <div>Güç / Tip</div>
              <div className="text-center">Adet</div>
              <div className="text-right">Fiyat</div>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((prod, idx) => {
                const Icon = ICON_MAP[prod.icon] || Package;
                return (
                  <div key={prod.id} className={`px-4 sm:px-6 py-4 ${idx % 2 !== 0 ? 'bg-slate-50/50' : ''}`}>
                    {/* Mobile */}
                    <div className="flex items-start gap-4 sm:hidden">
                      <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {prod.imageData ? (
                          <img src={prod.imageData} alt={prod.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Icon size={24} style={{ color: CATEGORY_COLORS[prod.category] }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-800">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{prod.code}</p>
                        {prod.brand && <p className="text-[10px] text-slate-400">{prod.brand}</p>}
                        {prod.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span className="font-bold">{prod.dimensions.width}×{prod.dimensions.height}cm</span>
                          {prod.kw > 0 && <><span>·</span><span>{prod.kw}kW</span></>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-base text-primary">{prod.price > 0 ? fmt(prod.price) : '—'}</p>
                        <p className="text-[9px] text-slate-400">Adet: 1</p>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:grid items-center gap-4" style={{ gridTemplateColumns: '64px 1fr 80px 90px 60px 90px' }}>
                      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                        {prod.imageData ? (
                          <img src={prod.imageData} alt={prod.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Icon size={20} style={{ color: CATEGORY_COLORS[prod.category] }} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{prod.code}{prod.brand ? ` · ${prod.brand}` : ''}</p>
                        {prod.description && <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{prod.description}</p>}
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">{prod.dimensions.width}×{prod.dimensions.height}</span>
                        {prod.dimensions.depth > 0 && <span className="text-[10px] text-slate-400">×{prod.dimensions.depth}</span>}
                      </div>
                      <div className="text-sm text-slate-600">
                        {prod.kw > 0 ? <><span className="font-medium">{prod.kw} kW</span><span className="text-[10px] text-slate-400 block">{prod.powerType}</span></> : <span className="text-slate-300">—</span>}
                      </div>
                      <div className="text-center">
                        <span className="font-black text-primary text-lg">1</span>
                      </div>
                      <div className="text-right">
                        {prod.price > 0 ? (
                          <span className="font-black text-sm text-primary">{fmt(prod.price)}</span>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Ara Toplam</span>
                  <span className="font-bold">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>KDV (%19)</span>
                  <span className="font-bold">{fmt(vat)}</span>
                </div>
                <div className="flex justify-between items-center bg-primary rounded-xl px-4 py-3 mt-3">
                  <span className="font-black text-sm text-white uppercase tracking-wide">Genel Toplam</span>
                  <span className="font-black text-2xl text-white">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer with logo */}
        <div className="relative z-10 px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="2MC" className="h-7 w-7 object-contain opacity-60" />
            <span className="text-[10px] text-slate-400">2MC Gastro · info@2mcgastro.com</span>
          </div>
          <div className="text-[10px] text-slate-400 text-right">
            Bu teklif 30 gün geçerlidir.<br />Fiyatlara KDV dahil değildir.
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">Notlar & Koşullar</h3>
        <ul className="text-xs text-on-surface-variant space-y-1.5">
          <li>• Bu teklif hazırlanış tarihinden itibaren 30 gün geçerlidir.</li>
          <li>• Fiyatlara KDV dahil değildir. %19 KDV ayrıca uygulanır.</li>
          <li>• Teslimat süresi sipariş tarihinden itibaren 4-8 haftadır.</li>
          <li>• Montaj ve devreye alma hizmetleri ayrıca fiyatlandırılır.</li>
        </ul>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, selectedProject, selectProject, clearSelection, removeProductFromProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'quote' | 'settings'>('overview');
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
            { key: 'quote', label: 'Teklif', icon: FileText },
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

      {/* Quote Tab */}
      {activeTab === 'quote' && (
        <QuoteTab project={p} />
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
