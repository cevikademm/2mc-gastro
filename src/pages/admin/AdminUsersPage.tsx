import { useEffect, useMemo, useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Shield, User as UserIcon, Building, Loader2 } from 'lucide-react';
import { useAdminStore, type AdminUser } from '../../stores/adminStore';

const ROLE_META = {
  b2c:   { label: 'B2C',   cls: 'bg-surface-container text-on-surface border-outline-variant/20' },
  b2b:   { label: 'B2B',   cls: 'bg-info-container text-on-info-container border-info/20' },
  admin: { label: 'Admin', cls: 'bg-primary-fixed text-primary border-primary/20' },
} as const;

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', { dateStyle: 'medium' });
}

export default function AdminUsersPage() {
  const {
    users, usersLoading, error,
    fetchAllUsers, approveUser, rejectUser, setUserRole,
  } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { fetchAllUsers(); }, [fetchAllUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filter === 'pending' && u.approved) return false;
      if (filter === 'approved' && !u.approved) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.company?.toLowerCase().includes(q) ||
        u.tax_id?.toLowerCase().includes(q)
      );
    });
  }, [users, search, filter]);

  const counts = useMemo(
    () => ({
      all: users.length,
      pending: users.filter((u) => !u.approved).length,
      approved: users.filter((u) => u.approved).length,
    }),
    [users],
  );

  const handleApprove = async (u: AdminUser) => {
    setBusy(u.id);
    await approveUser(u.id);
    setBusy(null);
  };

  const handleReject = async (u: AdminUser) => {
    if (!confirm(`${u.full_name || u.email} onayını kaldırmak istediğinize emin misiniz?`)) return;
    setBusy(u.id);
    await rejectUser(u.id);
    setBusy(null);
  };

  const handleRoleChange = async (u: AdminUser, role: 'b2c' | 'b2b' | 'admin') => {
    if (u.role === role) return;
    setBusy(u.id);
    await setUserRole(u.id, role);
    setBusy(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tight flex items-center gap-2">
            <Users size={28} /> Yönetici — Kullanıcılar
          </h1>
          <p className="text-on-surface-variant mt-1">Yeni kayıtları onayla, rol ata, hesapları yönet.</p>
        </div>
        <button
          onClick={fetchAllUsers}
          className="px-4 py-2 text-sm font-bold rounded-lg border border-outline-variant/20 hover:bg-surface-container-low"
        >
          Yenile
        </button>
      </header>

      {error && (
        <div className="bg-error-container text-error border border-error/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {([
          { k: 'pending',  l: 'Onay bekleyen' },
          { k: 'approved', l: 'Onaylı' },
          { k: 'all',      l: 'Tümü' },
        ] as const).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === f.k
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant/20 hover:bg-surface-container-low'
            }`}
          >
            {f.l} · {counts[f.k]}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim, e-posta, firma veya vergi no ara..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
        {usersLoading ? (
          <div className="p-12 text-center text-on-surface-variant">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            Kullanıcı bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {filtered.map((u) => (
              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-on-surface truncate flex items-center gap-2">
                        {u.full_name || '(isimsiz)'}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_META[u.role].cls}`}>
                          {ROLE_META[u.role].label}
                        </span>
                        {u.approved ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-success-container text-on-success-container border-success/20">
                            Onaylı
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-warning-container text-on-warning-container border-warning/20">
                            Beklemede
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-on-surface-variant truncate">{u.email}</div>
                      {u.company && (
                        <div className="text-xs text-on-surface-variant truncate flex items-center gap-1 mt-0.5">
                          <Building size={11} /> {u.company}
                          {u.tax_id && <span className="opacity-60">· {u.tax_id}</span>}
                        </div>
                      )}
                      <div className="text-[10px] text-on-surface-variant/60 mt-0.5">Kayıt: {fmtDate(u.created_at)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Role selector */}
                  <div className="inline-flex rounded-lg border border-outline-variant/20 overflow-hidden">
                    {(['b2c', 'b2b', 'admin'] as const).map((r) => {
                      const Icon = r === 'admin' ? Shield : r === 'b2b' ? Building : UserIcon;
                      return (
                        <button
                          key={r}
                          disabled={busy === u.id}
                          onClick={() => handleRoleChange(u, r)}
                          className={`px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                            u.role === r
                              ? 'bg-primary text-white'
                              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <Icon size={12} /> {ROLE_META[r].label}
                        </button>
                      );
                    })}
                  </div>

                  {u.approved ? (
                    <button
                      disabled={busy === u.id}
                      onClick={() => handleReject(u)}
                      className="px-3 py-1.5 rounded-lg border border-error/20 bg-error-container text-error font-bold text-xs inline-flex items-center gap-1 hover:opacity-80 disabled:opacity-50"
                    >
                      <XCircle size={13} /> Onayı kaldır
                    </button>
                  ) : (
                    <button
                      disabled={busy === u.id}
                      onClick={() => handleApprove(u)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold text-xs inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                    >
                      {busy === u.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      Onayla
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
