import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { CheckCircle, CreditCard, Shield, Zap, Building, X } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: 'ay',
    features: ['3 Aktif Proje', '50 Ürün Katalogu', 'PDF Export', 'Email Destek'],
    color: 'border-slate-200',
    badge: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    period: 'ay',
    features: ['Sınırsız Proje', 'Tam Katalog', 'CAD Export', 'Teklif Oluşturma', 'Öncelikli Destek'],
    color: 'border-primary',
    badge: 'Popüler',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    period: 'ay',
    features: ['Her şey Pro\'da var', 'Çoklu Kullanıcı', 'API Erişimi', 'Özel Entegrasyonlar', 'Hesap Yöneticisi'],
    color: 'border-slate-300',
    badge: '',
  },
];

function CheckoutForm({ plan, onSuccess, onCancel }: { plan: typeof PLANS[0]; onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) { setLoading(false); return; }

    // In production: call your backend to create a PaymentIntent, then confirmCardPayment
    // For demo purposes we simulate a successful payment after validation
    const { error: stripeError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement as any,
    });

    if (stripeError) {
      setError(stripeError.message || 'Ödeme başarısız');
      setLoading(false);
      return;
    }

    // Simulate backend call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800">{plan.name} Plan</h2>
            <p className="text-slate-500 text-sm mt-0.5">€{plan.price}/ay fatura edilir</p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Kart Bilgileri
            </label>
            <div className="border border-slate-200 rounded-lg px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
              <CardElement options={{
                style: {
                  base: { fontSize: '14px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } }
                }
              }} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield size={14} />
            <span>256-bit SSL şifrelemesi ile korunur. Stripe tarafından güvenli ödeme.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full brushed-metal text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={18} />
                €{plan.price}/ay Başla
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function SuccessModal({ plan, onClose }: { plan: typeof PLANS[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Ödeme Başarılı!</h2>
        <p className="text-slate-500 text-sm mb-6">
          <strong>{plan.name}</strong> planına başarıyla abone oldunuz. Hesabınız aktive edildi.
        </p>
        <button
          onClick={onClose}
          className="w-full brushed-metal text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-headline text-primary tracking-tight">Abonelik Planları</h1>
          <p className="text-on-surface-variant font-medium">İhtiyacınıza uygun planı seçin ve hemen başlayın</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-surface-container-lowest rounded-2xl border-2 ${plan.color} shadow-sm p-8 flex flex-col`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-4">
                {plan.id === 'starter' && <Zap size={20} className="text-slate-400" />}
                {plan.id === 'pro' && <CreditCard size={20} className="text-primary" />}
                {plan.id === 'enterprise' && <Building size={20} className="text-slate-600" />}
                <h2 className="text-lg font-black text-on-surface">{plan.name}</h2>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-primary">€{plan.price}</span>
                <span className="text-slate-400 text-sm">/{plan.period}</span>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.id === 'pro'
                    ? 'brushed-metal text-white shadow-lg hover:opacity-90'
                    : 'border-2 border-primary text-primary hover:bg-primary/5'
                }`}
              >
                {plan.name} Seç
              </button>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex items-center gap-4">
          <Shield size={32} className="text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-on-surface">30 Gün Para İade Garantisi</h3>
            <p className="text-sm text-on-surface-variant mt-0.5">Memnun kalmazsanız, ilk 30 gün içinde tam iade yapılır. Hiçbir soru sorulmaz.</p>
          </div>
        </div>
      </div>

      {selectedPlan && !success && (
        <CheckoutForm
          plan={selectedPlan}
          onSuccess={() => setSuccess(true)}
          onCancel={() => setSelectedPlan(null)}
        />
      )}

      {success && selectedPlan && (
        <SuccessModal
          plan={selectedPlan}
          onClose={() => { setSuccess(false); setSelectedPlan(null); }}
        />
      )}
    </Elements>
  );
}
