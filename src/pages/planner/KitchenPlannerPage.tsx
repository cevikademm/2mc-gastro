import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ChefHat, Coffee, Pizza, Utensils, Hotel, Store,
  ChevronRight, ChevronLeft, Loader2, Plus, Trash2, ShoppingCart,
  Ruler, Wallet, Check, Zap, Bot, Calculator,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatWithAI } from '../../lib/ai';
import { useCartStore } from '../../stores/cartStore';
import { supabase } from '../../lib/supabase';
import type { DiamondProduct } from '../../stores/diamondStore';
import { diamondToEquipment } from '../../lib/diamondAdapter';

type BusinessType = 'restaurant' | 'cafe' | 'hotel' | 'fastfood' | 'bakery' | 'other';

// Hesaplayıcı modülü için segment katsayıları (eski /tools/kitchen-calculator sayfasından taşındı)
type CalcSegment = 'restaurant' | 'hotel' | 'catering' | 'cafe';
const SEGMENT_FACTORS: Record<CalcSegment, { area: number; power: number; label: string }> = {
  restaurant: { area: 0.45, power: 180, label: 'Restoran' },
  hotel:      { area: 0.55, power: 220, label: 'Otel' },
  catering:   { area: 0.70, power: 260, label: 'Catering' },
  cafe:       { area: 0.30, power: 120, label: 'Kafe / Bistro' },
};

const BUSINESS_TYPES: { id: BusinessType; icon: any; label: string; desc: string }[] = [
  { id: 'restaurant', icon: Utensils, label: 'Restoran', desc: 'Tam servis mutfak' },
  { id: 'cafe',       icon: Coffee,   label: 'Kafe',     desc: 'İçecek ve hafif mönü' },
  { id: 'hotel',      icon: Hotel,    label: 'Otel',     desc: 'Büyük ölçek kahvaltı/akşam' },
  { id: 'fastfood',   icon: Pizza,    label: 'Fast Food', desc: 'Yüksek sirkülasyon' },
  { id: 'bakery',     icon: ChefHat,  label: 'Pastane',   desc: 'Fırın ve hamur işi' },
  { id: 'other',      icon: Store,    label: 'Diğer',    desc: 'Özel işletme' },
];

interface Recommendation {
  name: string;
  category: string;
  quantity: number;
  estimated_price: number;
  reason: string;
  matched_product?: DiamondProduct;
}

export default function KitchenPlannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [business, setBusiness] = useState<BusinessType | null>(null);
  const [size, setSize] = useState(50);
  const [budget, setBudget] = useState(25000);
  const [seats, setSeats] = useState(40);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Kapasite & ROI hesaplayıcı state
  const [calcSegment, setCalcSegment]     = useState<CalcSegment>('restaurant');
  const [calcGuests, setCalcGuests]       = useState(100);
  const [calcAvgTicket, setCalcAvgTicket] = useState(25);
  const [calcDaysOpen, setCalcDaysOpen]   = useState(26);
  const [calcInvest, setCalcInvest]       = useState(150000);

  const calcResult = useMemo(() => {
    const f = SEGMENT_FACTORS[calcSegment];
    const area = Math.round(calcGuests * f.area);
    const power = Math.round(area * f.power);
    const monthlyRevenue = calcGuests * calcAvgTicket * calcDaysOpen;
    const foodCost = monthlyRevenue * 0.32;
    const laborCost = monthlyRevenue * 0.28;
    const operational = monthlyRevenue * 0.15;
    const monthlyProfit = monthlyRevenue - foodCost - laborCost - operational;
    const paybackMonths = monthlyProfit > 0 ? calcInvest / monthlyProfit : Infinity;
    return { area, power, monthlyRevenue, monthlyProfit, paybackMonths };
  }, [calcSegment, calcGuests, calcAvgTicket, calcDaysOpen, calcInvest]);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setStreamText('');
    setRecommendations([]);
    try {
      const prompt = `Ben bir ${BUSINESS_TYPES.find(b => b.id === business)?.label} işletmesi açıyorum.
Mutfak alanı: ${size} m²
Koltuk/müşteri kapasitesi: ${seats}
Bütçe: ${budget.toLocaleString('tr-TR')} €

Lütfen bu işletme için gerekli mutfak ekipmanlarını öner. Cevabını SADECE aşağıdaki JSON formatında ver (başka hiçbir metin yazma):

{
  "items": [
    {"name": "ekipman adı", "category": "kategori", "quantity": 1, "estimated_price": 1500, "reason": "neden gerekli (kısa)"}
  ]
}`;

      let full = '';
      for await (const chunk of chatWithAI({
        messages: [{ role: 'user', content: prompt }],
        context: 'kitchen-planner',
      })) {
        full += chunk;
        setStreamText(full);
      }

      const match = full.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('AI yanıtı ayrıştırılamadı');
      const parsed = JSON.parse(match[0]);
      const recs: Recommendation[] = parsed.items || [];

      // Match with real Diamond products
      if (supabase) {
        for (const rec of recs) {
          const { data } = await supabase
            .from('diamond_products')
            .select('*')
            .or(`name.ilike.%${rec.name.split(' ')[0]}%,product_family_name.ilike.%${rec.category}%`)
            .eq('is_old', false)
            .limit(1)
            .maybeSingle();
          if (data) rec.matched_product = data as DiamondProduct;
        }
      }

      setRecommendations(recs);
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Plan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = recommendations.reduce((s, r) => s + r.estimated_price * r.quantity, 0);

  const addAllToCart = () => {
    recommendations.forEach((r) => {
      if (r.matched_product) addItem(diamondToEquipment(r.matched_product), r.quantity);
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-purple-50/30 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-sky-100 text-purple-700 text-xs font-bold mb-3">
            <Sparkles size={14} /> AI DESTEKLİ · RAKİPLERDE YOK
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Mutfağını <span className="bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">AI ile Planla</span>
          </h1>
          <p className="text-slate-500 mt-2">4 adımda, sektöre özgü ekipman listesi ve bütçe. Sağdaki hesaplayıcı ile alan, güç ve ROI'yi anında gör.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n}
              className={`h-1.5 rounded-full transition-all ${step >= n ? 'bg-sky-500 w-12' : 'bg-slate-200 w-6'}`} />
          ))}
        </div>

        {/* 2 sütun: sol = AI planlayıcı sihirbazı, sağ = kapasite & ROI hesaplayıcı */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
          {/* Step 1 — Business */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">İşletme türünüz?</h2>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {BUSINESS_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setBusiness(b.id); setStep(2); }}
                    className={`aspect-[4/3] p-6 rounded-2xl border-2 transition text-left group flex flex-col justify-between ${
                      business === b.id ? 'border-sky-500 bg-sky-50 shadow-lg' : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition ${
                      business === b.id ? 'bg-sky-500' : 'bg-sky-50 group-hover:bg-sky-100'
                    }`}>
                      <b.icon className={`group-hover:scale-110 transition ${business === b.id ? 'text-white' : 'text-sky-500'}`} size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{b.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Size */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Ruler className="text-sky-500" /> Alan ve Kapasite
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Mutfak Alanı</label>
                    <span className="text-sm font-bold text-sky-600">{size} m²</span>
                  </div>
                  <input type="range" min={10} max={300} value={size}
                    onChange={(e) => setSize(+e.target.value)}
                    className="w-full accent-sky-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Müşteri Kapasitesi</label>
                    <span className="text-sm font-bold text-sky-600">{seats} kişi</span>
                  </div>
                  <input type="range" min={10} max={500} value={seats}
                    onChange={(e) => setSeats(+e.target.value)}
                    className="w-full accent-sky-500" />
                </div>
              </div>
              <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </motion.div>
          )}

          {/* Step 3 — Budget */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Wallet className="text-sky-500" /> Bütçe
              </h2>
              <div className="text-center py-6">
                <p className="text-5xl font-black text-slate-900">
                  {budget.toLocaleString('tr-TR')} <span className="text-sky-500">€</span>
                </p>
                <input type="range" min={5000} max={200000} step={1000} value={budget}
                  onChange={(e) => setBudget(+e.target.value)}
                  className="w-full mt-6 accent-sky-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5K €</span><span>200K €</span>
                </div>
              </div>
              <NavButtons onBack={() => setStep(2)}
                onNext={generatePlan}
                nextLabel={<><Sparkles size={16} /> AI ile Plan Oluştur</>}
                loading={loading} />
              {loading && (
                <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-sky-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-2">
                    <Bot size={16} className="animate-pulse" /> AI düşünüyor...
                  </div>
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono">
                    {streamText || 'Ekipmanlar seçiliyor...'}
                  </pre>
                </div>
              )}
              {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
            </motion.div>
          )}

          {/* Step 4 — Results */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Check className="text-emerald-500" /> Önerilen Ekipmanlar
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{recommendations.length} ürün · AI destekli</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Toplam Maliyet</p>
                    <p className="text-2xl font-black text-slate-900">{totalCost.toLocaleString('tr-TR')} €</p>
                    <p className={`text-xs font-semibold ${totalCost > budget ? 'text-red-500' : 'text-emerald-600'}`}>
                      Bütçe: {budget.toLocaleString('tr-TR')} € {totalCost > budget ? '(aşıldı)' : '(uygun)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {rec.matched_product?.image_thumb ? (
                        <img src={rec.matched_product.image_thumb} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <ChefHat className="text-slate-300" size={28} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{rec.name}</p>
                      <p className="text-xs text-slate-500">{rec.reason}</p>
                      {rec.matched_product && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
                          <Zap size={10} /> Katalogda mevcut
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">x{rec.quantity}</p>
                      <p className="font-bold text-slate-900">
                        {(rec.estimated_price * rec.quantity).toLocaleString('tr-TR')} €
                      </p>
                    </div>
                    <button
                      onClick={() => setRecommendations((prev) => prev.filter((_, j) => j !== i))}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setStep(1); setRecommendations([]); }}
                  className="h-12 px-6 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-white"
                >
                  Yeniden Başla
                </button>
                <button
                  onClick={addAllToCart}
                  disabled={!recommendations.some((r) => r.matched_product)}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <ShoppingCart size={18} /> Tümünü Sepete Ekle
                </button>
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>

          {/* Sağ sütun — Kapasite & ROI Hesaplayıcı (eski /tools/kitchen-calculator içeriği) */}
          <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Kapasite & ROI</h3>
                  <p className="text-[11px] text-slate-500">Alan · Güç · Geri dönüş</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">İşletme Tipi</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(SEGMENT_FACTORS) as CalcSegment[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCalcSegment(s)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                          calcSegment === s
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {SEGMENT_FACTORS[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <CalcSlider label="Günlük Misafir"      value={calcGuests}    onChange={setCalcGuests}    min={10}    max={2000}    suffix="" />
                <CalcSlider label="Ortalama Sepet (€)"  value={calcAvgTicket} onChange={setCalcAvgTicket} min={5}     max={500}     suffix="€" />
                <CalcSlider label="Aylık Açık Gün"      value={calcDaysOpen}  onChange={setCalcDaysOpen}  min={1}     max={31}      suffix="" />
                <CalcSlider label="Toplam Yatırım (€)"  value={calcInvest}    onChange={setCalcInvest}    min={10000} max={5000000} step={5000} suffix="€" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold opacity-90">Tahmini Sonuçlar</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">LIVE</span>
              </div>
              <div className="space-y-2.5">
                <ResultRow label="Gerekli Alan"      value={`${calcResult.area} m²`} />
                <ResultRow label="Kurulu Güç"        value={`${calcResult.power.toLocaleString('tr-TR')} W`} />
                <ResultRow label="Aylık Ciro"        value={`€${calcResult.monthlyRevenue.toLocaleString('tr-TR')}`} />
                <ResultRow label="Aylık Net Kâr"     value={`€${Math.round(calcResult.monthlyProfit).toLocaleString('tr-TR')}`} />
                <ResultRow label="Geri Dönüş"
                  value={isFinite(calcResult.paybackMonths) ? `${calcResult.paybackMonths.toFixed(1)} ay` : 'N/A'} />
              </div>
              <button
                type="button"
                onClick={() => navigate('/design')}
                className="mt-4 w-full py-2.5 bg-white/95 text-sky-700 rounded-xl font-bold text-sm hover:bg-white transition"
              >
                3D Tasarıma Başla →
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CalcSlider({
  label, value, onChange, min, max, step = 1, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-slate-600">{label}</span>
        <span className="text-[11px] font-bold text-sky-600">
          {suffix === '€' ? `€${value.toLocaleString('tr-TR')}` : `${value.toLocaleString('tr-TR')}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-sky-600"
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/10 pb-1.5 last:border-0 last:pb-0">
      <span className="text-[11px] opacity-80">{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

function NavButtons({
  onBack, onNext, nextLabel, loading,
}: { onBack: () => void; onNext: () => void; nextLabel?: React.ReactNode; loading?: boolean }) {
  return (
    <div className="flex justify-between mt-8">
      <button onClick={onBack}
        className="h-11 px-5 rounded-xl border border-slate-200 font-semibold text-slate-600 flex items-center gap-1 hover:bg-slate-50">
        <ChevronLeft size={16} /> Geri
      </button>
      <button onClick={onNext} disabled={loading}
        className="h-11 px-6 rounded-xl bg-sky-500 text-white font-bold flex items-center gap-2 disabled:opacity-60 hover:bg-sky-600">
        {loading ? <Loader2 size={16} className="animate-spin" /> : (nextLabel || <>Devam <ChevronRight size={16} /></>)}
      </button>
    </div>
  );
}
