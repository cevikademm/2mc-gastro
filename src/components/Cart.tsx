import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { CATEGORIES } from '../stores/equipmentStore';
import {
  ShoppingCart, Trash2, Plus, Minus, Package, Euro,
  Phone, Mail, Globe, MapPin, ChevronDown, ChevronRight,
  FileText, Send, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const COMPANY_INFO = {
  name: '2MC Werbung & Gastro GmbH',
  address: 'Musterstraße 12, 10115 Berlin, Deutschland',
  phone: '+49 30 1234 5678',
  email: 'info@2mc-gastro.de',
  website: 'www.2mc-gastro.de',
  vat: 'DE123456789',
  tagline: 'Profesyonel Mutfak Ekipmanları & Gastronomi Çözümleri',
};

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className="w-14 h-14 bg-surface-container-highest flex items-center justify-center rounded-lg">
        <Package size={20} className="text-on-surface-variant/30" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className="w-14 h-14 object-contain rounded-lg bg-white border border-outline-variant/10 p-1"
    />
  );
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getItemsByCategory } = useCartStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [offerSent, setOfferSent] = useState(false);

  const grouped = getItemsByCategory();
  const categoryKeys = Object.keys(grouped);
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const formatPrice = (p: number) =>
    p > 0 ? `€${p.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—';

  const getCategoryName = (catId: string) =>
    CATEGORIES.find(c => c.id === catId)?.name || catId;

  const toggleCollapse = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header - Company Info
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_INFO.name, 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_INFO.tagline, 14, 24);
    doc.text(`${COMPANY_INFO.address}  |  ${COMPANY_INFO.phone}  |  ${COMPANY_INFO.email}`, 14, 31);
    doc.text(`${COMPANY_INFO.website}  |  USt-IdNr: ${COMPANY_INFO.vat}`, 14, 37);

    doc.setTextColor(0, 0, 0);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Teklif / Angebot', 14, 54);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 62);
    doc.text(`Toplam Ürün: ${totalItems} adet`, 100, 62);

    let y = 74;

    // Items by category
    categoryKeys.forEach((cat) => {
      const catItems = grouped[cat];
      if (!catItems?.length) return;

      // Category header
      doc.setFillColor(243, 244, 246);
      doc.rect(14, y - 4, 182, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(getCategoryName(cat).toUpperCase(), 16, y + 1);
      y += 10;

      // Column headers
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.text('Adet', 14, y);
      doc.text('Ürün Kodu', 30, y);
      doc.text('Ürün Adı', 75, y);
      doc.text('Birim Fiyat', 155, y, { align: 'right' });
      doc.text('Toplam', 196, y, { align: 'right' });
      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, 196, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      catItems.forEach(({ product, quantity }) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.text(String(quantity), 14, y);
        doc.text(product.id.substring(0, 20), 30, y);
        doc.text(product.name.substring(0, 45), 75, y);
        doc.text(product.price > 0 ? formatPrice(product.price) : '—', 155, y, { align: 'right' });
        doc.text(product.price > 0 ? formatPrice(quantity * product.price) : '—', 196, y, { align: 'right' });
        y += 7;
      });

      y += 4;
    });

    // Total
    doc.setDrawColor(37, 99, 235);
    doc.line(130, y, 196, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOPLAM:', 130, y);
    doc.text(formatPrice(totalPrice), 196, y, { align: 'right' });

    // Footer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`${COMPANY_INFO.name} — ${COMPANY_INFO.address} — ${COMPANY_INFO.website}`, 14, 290);
    }

    doc.save(`Teklif_2MC_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSendOffer = () => {
    setOfferSent(true);
    setTimeout(() => setOfferSent(false), 3000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart size={36} className="text-on-surface-variant/30" />
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">Sepetiniz Boş</h2>
          <p className="text-on-surface-variant">Katalogdan ürün ekleyerek teklif oluşturabilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tight flex items-center gap-3">
            <ShoppingCart size={28} /> Sepet
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">{totalItems} ürün · {formatPrice(totalPrice)}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportPDF}
            className="bg-surface-container-low hover:bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <FileText size={16} /> PDF Teklif
          </button>
          <button
            onClick={handleSendOffer}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            {offerSent ? <><X size={16} /> Gönderildi!</> : <><Send size={16} /> Teklif İste</>}
          </button>
          <button
            onClick={clearCart}
            className="text-error hover:bg-error-container px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
          >
            <Trash2 size={16} /> Sepeti Temizle
          </button>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <h2 className="text-base font-headline font-black text-primary">{COMPANY_INFO.name}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{COMPANY_INFO.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {COMPANY_INFO.address}</span>
            <span className="flex items-center gap-1.5"><Phone size={12} className="text-primary" /> {COMPANY_INFO.phone}</span>
            <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> {COMPANY_INFO.email}</span>
            <span className="flex items-center gap-1.5"><Globe size={12} className="text-primary" /> {COMPANY_INFO.website}</span>
          </div>
        </div>
      </div>

      {/* Items grouped by category */}
      <div className="space-y-4">
        {categoryKeys.map((cat) => {
          const catItems = grouped[cat];
          const catName = getCategoryName(cat);
          const isCollapsed = collapsed[cat];
          const catTotal = catItems.reduce((s, i) => s + i.quantity * (i.product.price || 0), 0);

          return (
            <div key={cat} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              {/* Category Header */}
              <button
                onClick={() => toggleCollapse(cat)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? <ChevronRight size={16} className="text-on-surface-variant" /> : <ChevronDown size={16} className="text-on-surface-variant" />}
                  <span className="font-headline font-bold text-sm text-primary uppercase tracking-wider">{catName}</span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {catItems.length} ürün · {catItems.reduce((s, i) => s + i.quantity, 0)} adet
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-600">{formatPrice(catTotal)}</span>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="divide-y divide-outline-variant/10">
                  {catItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-container-high/50 transition-colors">
                      <ProductImage src={product.img} alt={product.name} />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-on-surface truncate">{product.name}</p>
                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">{product.id}</p>
                        {product.brand && (
                          <span className="text-[10px] text-on-surface-variant/60 font-medium">{product.brand}</span>
                        )}
                      </div>

                      <div className="text-right text-xs text-on-surface-variant hidden sm:block w-24">
                        <p>{formatPrice(product.price)}</p>
                        <p className="text-[10px]">birim fiyat</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-surface-container rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-on-surface">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right font-mono font-bold text-sm text-primary w-24 hidden sm:block">
                        {formatPrice(quantity * product.price)}
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-on-surface-variant/50 hover:text-error hover:bg-error-container rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
        <div className="flex flex-col gap-3 max-w-sm ml-auto">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Ara Toplam ({totalItems} adet)</span>
            <span className="font-mono">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>KDV (%19)</span>
            <span className="font-mono">{formatPrice(totalPrice * 0.19)}</span>
          </div>
          <div className="border-t border-outline-variant/20 pt-3 flex justify-between font-headline font-black text-lg text-primary">
            <span>Genel Toplam</span>
            <span>{formatPrice(totalPrice * 1.19)}</span>
          </div>
        </div>
      </div>

      {/* Offer sent notification */}
      {offerSent && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 z-50 animate-bounce">
          <Send size={16} /> Teklif talebiniz gönderildi!
        </div>
      )}
    </div>
  );
}
