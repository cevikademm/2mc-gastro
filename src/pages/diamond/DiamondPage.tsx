import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Diamond, Plus, Trash2, RefreshCw, Bell, ChevronDown, ChevronUp, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SyncLog {
  id: number;
  product_id: string;
  product_name: string;
  change_type: 'added' | 'updated' | 'deleted' | 'summary';
  details: any;
  synced_at: string;
}

const CHANGE_CONFIG = {
  added: { label: 'Yeni Ürün', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  updated: { label: 'Güncellendi', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  deleted: { label: 'Silindi', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  summary: { label: 'Sync Özeti', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Ürün Adı',
  price_catalog: 'Katalog Fiyat',
  price_display: 'Görünen Fiyat',
  price_promo: 'Promo Fiyat',
  stock: 'Stok',
  length_mm: 'Uzunluk (mm)',
  width_mm: 'Genişlik (mm)',
  height_mm: 'Yükseklik (mm)',
  weight: 'Ağırlık',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DiamondPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadLogs();
    loadProductCount();
  }, []);

  async function loadLogs() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(200);
    setLogs(data || []);
    setLoading(false);
  }

  async function loadProductCount() {
    if (!supabase) return;
    const { count } = await supabase
      .from('diamond_products')
      .select('*', { count: 'exact', head: true });
    setTotalProducts(count || 0);
  }

  const summaries = logs.filter((l) => l.change_type === 'summary');
  const lastSync = summaries[0];
  const changes = logs.filter((l) => l.change_type !== 'summary');
  const filtered = filter === 'all' ? changes : changes.filter((l) => l.change_type === filter);

  const stats = {
    added: changes.filter((l) => l.change_type === 'added').length,
    updated: changes.filter((l) => l.change_type === 'updated').length,
    deleted: changes.filter((l) => l.change_type === 'deleted').length,
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Diamond size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Diamond EU Sync</h1>
            <p className="text-sm text-slate-500">Ürün senkronizasyon bildirimleri</p>
          </div>
        </div>
        <button
          onClick={() => { loadLogs(); loadProductCount(); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Package size={16} />
            Toplam Ürün
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalProducts.toLocaleString('tr-TR')}</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-sm mb-1">
            <Plus size={16} />
            Eklenen
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.added}</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
            <TrendingUp size={16} />
            Güncellenen
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.updated}</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
            <Trash2 size={16} />
            Silinen
          </div>
          <div className="text-2xl font-bold text-red-700">{stats.deleted}</div>
        </div>
      </div>

      {/* Son Sync Bilgisi */}
      {lastSync && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-purple-600" />
            <div>
              <span className="text-sm font-medium text-purple-800">Son Senkronizasyon: </span>
              <span className="text-sm text-purple-600">{formatDate(lastSync.synced_at)}</span>
              <span className="text-xs text-purple-400 ml-2">({timeAgo(lastSync.synced_at)})</span>
            </div>
          </div>
          {lastSync.details && (
            <div className="text-xs text-purple-600">
              {lastSync.details.total_products} ürün · {lastSync.details.duration_seconds}s
            </div>
          )}
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'added', label: 'Eklenen' },
          { key: 'updated', label: 'Güncellenen' },
          { key: 'deleted', label: 'Silinen' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bildirim Listesi */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>Henüz bildirim yok.</p>
            <p className="text-xs mt-1">İlk senkronizasyon sonrası burada değişiklikler görünecek.</p>
          </div>
        ) : (
          filtered.map((log) => {
            const config = CHANGE_CONFIG[log.change_type];
            const Icon = config.icon;
            const isExpanded = expandedId === log.id;

            return (
              <div
                key={log.id}
                className={`${config.bg} border ${config.border} rounded-xl overflow-hidden transition-all`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} className={config.color} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {log.product_name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        ID: {log.product_id} · {timeAgo(log.synced_at)}
                      </div>
                    </div>
                  </div>
                  {log.details && (
                    isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {isExpanded && log.details && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-white/70 rounded-lg p-3 text-sm space-y-1">
                      {log.change_type === 'updated' ? (
                        Object.entries(log.details).map(([field, val]: [string, any]) => (
                          <div key={field} className="flex items-center gap-2 text-slate-600">
                            <span className="font-medium w-32">{FIELD_LABELS[field] || field}:</span>
                            <span className="line-through text-red-400">{val.old ?? '—'}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-semibold text-emerald-700">{val.new ?? '—'}</span>
                          </div>
                        ))
                      ) : log.change_type === 'added' ? (
                        <div className="text-slate-600">
                          <span className="font-medium">Fiyat:</span> {log.details.price_catalog ?? '—'} EUR ·
                          <span className="font-medium ml-2">Stok:</span> {log.details.stock ?? '—'}
                        </div>
                      ) : (
                        <pre className="text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
