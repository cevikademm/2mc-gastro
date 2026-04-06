import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { CATEGORIES } from '../stores/equipmentStore';
import {
  ShoppingCart, Trash2, Plus, Minus, Package,
  Phone, Mail, Globe, MapPin, ChevronDown, ChevronRight,
  FileText, Send, Euro
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const COMPANY_INFO = {
  name: '2MC Werbung & Gastro GmbH',
  address: 'Musterstraße 12, 10115 Berlin, Deutschland',
  phone: '+49 30 1234 5678',
  email: 'info@2mc-gastro.de',
  website: 'www.2mc-gastro.de',
  vat: 'DE123456789',
  tagline: 'Alles rund um deine Marke · Gastronomi Çözümleri',
};

// Load an image URL → base64 dataURL
// Uses fetch→FileReader (avoids canvas CORS taint for cross-origin images like S3)
async function loadImageAsDataURL(src: string): Promise<string | null> {
  if (!src) return null;
  const url = src.startsWith('http') ? src : window.location.origin + (src.startsWith('/') ? '' : '/') + src;
  // Try fetch first (works for S3 with CORS headers)
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    // Fallback: canvas (works for same-origin / CORS-enabled images)
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  if (err || !src) {
    return (
      <div className="w-14 h-14 bg-surface-container-highest flex items-center justify-center rounded-lg flex-shrink-0">
        <Package size={20} className="text-on-surface-variant/30" />
      </div>
    );
  }
  return (
    <div className="w-14 h-14 relative flex-shrink-0">
      {loading && (
        <div className="absolute inset-0 bg-surface-container-highest rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={() => { setErr(true); setLoading(false); }}
        onLoad={() => setLoading(false)}
        className={`w-14 h-14 object-contain rounded-lg bg-white border border-outline-variant/10 p-1 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getItemsByCategory } = useCartStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [offerSent, setOfferSent] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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

  // ─── PDF Export ────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const PW = 210; // page width mm
      const PH = 297; // page height mm
      const quoteNo = `2MC-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toLocaleDateString('tr-TR');

      // ── Load logos ──
      const [logoFull, logoIcon, logoHolo] = await Promise.all([
        loadImageAsDataURL('/logo-werbung.png'),
        loadImageAsDataURL('/logo-icon.png'),
        loadImageAsDataURL('https://mnlgbsfarubpvkmqqvff.supabase.co/storage/v1/object/public/2mcwerbung/logo4.png'),
      ]);

      // ── Helper: draw hologram watermark on current page ──
      const drawHologram = () => {
        if (!logoHolo) return;
        // Draw a canvas with very low opacity version
        const canvas = document.createElement('canvas');
        // A4 at 96dpi ≈ 794×1123px
        canvas.width = 794;
        canvas.height = 1123;
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.src = logoHolo;
        // Draw centered, covering full page
        const size = Math.min(canvas.width, canvas.height) * 0.92;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;
        ctx.globalAlpha = 0.055;
        // tint cyan-blue
        ctx.filter = 'hue-rotate(200deg) saturate(3)';
        ctx.drawImage(img, x, y, size, size);
        const holoData = canvas.toDataURL('image/png');
        doc.addImage(holoData, 'PNG', 0, 0, PW, PH);
      };

      // ── Helper: decorative diagonal stripe ──
      const drawStripe = () => {
        doc.setFillColor(37, 99, 235);
        doc.setGState(doc.GState({ opacity: 0.06 }));
        // Draw 3 thin diagonal bands across page
        for (let i = 0; i < 3; i++) {
          const offset = 60 + i * 25;
          doc.triangle(
            0, PH - offset,
            PW + 20, PH - offset - 80,
            PW + 20, PH - offset - 84,
            'F'
          );
        }
        doc.setGState(doc.GState({ opacity: 1 }));
      };

      // ── Page 1 header ──
      const drawPageHeader = (pageNum: number, totalPages?: number) => {
        // Dark gradient header band
        doc.setFillColor(15, 23, 60);
        doc.rect(0, 0, PW, 38, 'F');

        // Blue accent stripe
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 38, PW, 2, 'F');

        // Logo full (white version via CSS filter won't work in PDF, just place as-is)
        if (logoFull) {
          doc.addImage(logoFull, 'PNG', 10, 5, 72, 20);
        } else {
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text('2MC WERBUNG', 14, 20);
        }

        // Logo icon on right
        if (logoIcon) {
          doc.addImage(logoIcon, 'PNG', PW - 38, 4, 28, 28);
        }

        // Company details in header
        doc.setTextColor(180, 200, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(COMPANY_INFO.address, PW - 10, 34, { align: 'right' });

        // Page number
        if (totalPages) {
          doc.setTextColor(150, 170, 220);
          doc.setFontSize(7);
          doc.text(`Sayfa ${pageNum}`, PW - 10, 36, { align: 'right' });
        }
      };

      // ── Page 1: cover info ──
      drawHologram();
      drawStripe();
      drawPageHeader(1);

      // Quote title block
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(10, 46, PW - 20, 28, 3, 3, 'F');
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(10, 46, 4, 28, 2, 2, 'F');

      doc.setTextColor(15, 23, 60);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TEKLİF  /  ANGEBOT', 20, 57);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 90, 120);
      doc.text(`Teklif No: ${quoteNo}`, 20, 65);
      doc.text(`Tarih: ${dateStr}`, 80, 65);
      doc.text(`Toplam Kalem: ${categoryKeys.length}  |  Toplam Adet: ${totalItems}`, 130, 65);

      // Contact row
      doc.setFillColor(15, 23, 60);
      doc.rect(10, 78, PW - 20, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      const contactY = 85;
      doc.text(`✆  ${COMPANY_INFO.phone}`, 14, contactY);
      doc.text(`✉  ${COMPANY_INFO.email}`, 68, contactY);
      doc.text(`⌂  ${COMPANY_INFO.website}`, 128, contactY);
      doc.text(`USt: ${COMPANY_INFO.vat}`, 175, contactY);

      let y = 96;
      let pageNum = 1;

      // Pre-load all product images
      const imgCache: Record<string, string | null> = {};
      const uniqueImgs = [...new Set(items.map(i => i.product.img).filter(Boolean))];
      await Promise.all(
        uniqueImgs.map(async (src) => {
          imgCache[src] = await loadImageAsDataURL(src);
        })
      );

      // ── Draw items by category ──
      for (const cat of categoryKeys) {
        const catItems = grouped[cat];
        if (!catItems?.length) continue;

        // Space check — add page if needed
        if (y > 240) {
          doc.addPage();
          pageNum++;
          drawHologram();
          drawStripe();
          drawPageHeader(pageNum);
          y = 48;
        }

        // Category header
        doc.setFillColor(15, 23, 60);
        doc.roundedRect(10, y, PW - 20, 8, 1.5, 1.5, 'F');
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(10, y, 3, 8, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(getCategoryName(cat).toUpperCase(), 16, y + 5.5);
        const catTotal = catItems.reduce((s, i) => s + i.quantity * (i.product.price || 0), 0);
        if (catTotal > 0) {
          doc.text(formatPrice(catTotal), PW - 12, y + 5.5, { align: 'right' });
        }
        y += 11;

        // Column headers
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 110, 140);
        doc.text('GÖRSEL', 12, y);
        doc.text('ADET', 32, y);
        doc.text('ÜRÜN KODU', 42, y);
        doc.text('ÜRÜN ADI', 78, y);
        doc.text('BİRİM FİYAT', 158, y, { align: 'right' });
        doc.text('TOPLAM', PW - 12, y, { align: 'right' });
        y += 2;
        doc.setDrawColor(200, 210, 230);
        doc.line(10, y, PW - 10, y);
        y += 3;

        // Product rows
        let rowAlt = false;
        for (const { product, quantity } of catItems) {
          const rowH = 18;
          if (y + rowH > 272) {
            doc.addPage();
            pageNum++;
            drawHologram();
            drawStripe();
            drawPageHeader(pageNum);
            y = 48;
          }

          // Alternating row background
          if (rowAlt) {
            doc.setFillColor(245, 247, 255);
            doc.rect(10, y - 1, PW - 20, rowH, 'F');
          }
          rowAlt = !rowAlt;

          // Product image
          const imgData = product.img ? imgCache[product.img] : null;
          if (imgData) {
            doc.addImage(imgData, 'PNG', 12, y, 14, 14);
          } else {
            doc.setFillColor(230, 235, 245);
            doc.roundedRect(12, y, 14, 14, 2, 2, 'F');
            doc.setTextColor(180, 190, 210);
            doc.setFontSize(6);
            doc.text('N/A', 19, y + 8, { align: 'center' });
          }

          // Quantity badge
          doc.setFillColor(37, 99, 235);
          doc.roundedRect(30, y + 3, 9, 7, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(String(quantity), 34.5, y + 8.5, { align: 'center' });

          // Product code
          doc.setTextColor(37, 99, 235);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text(product.id.substring(0, 22), 42, y + 5);

          // Brand
          if (product.brand) {
            doc.setTextColor(140, 150, 170);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.text(product.brand, 42, y + 11);
          }

          // Product name
          doc.setTextColor(15, 23, 60);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          const name = product.name.length > 42 ? product.name.substring(0, 42) + '…' : product.name;
          doc.text(name, 78, y + 5);

          // Dims & kW
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(120, 130, 155);
          const dims = `${product.l}×${product.w}×${product.h} mm${product.kw > 0 ? `  |  ${product.kw} kW` : ''}`;
          doc.text(dims, 78, y + 11);

          // Unit price
          doc.setTextColor(80, 90, 120);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.text(product.price > 0 ? formatPrice(product.price) : '—', 158, y + 7, { align: 'right' });

          // Line total
          const lineTotal = quantity * (product.price || 0);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 60);
          doc.text(lineTotal > 0 ? formatPrice(lineTotal) : '—', PW - 12, y + 7, { align: 'right' });

          // Separator line
          doc.setDrawColor(220, 225, 240);
          doc.line(10, y + rowH - 1, PW - 10, y + rowH - 1);

          y += rowH;
        }

        y += 5;
      }

      // ── Totals block ──
      if (y + 45 > 272) {
        doc.addPage();
        pageNum++;
        drawHologram();
        drawStripe();
        drawPageHeader(pageNum);
        y = 48;
      }

      y += 4;
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(PW / 2, y, PW / 2 - 10, 40, 3, 3, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 90, 120);
      doc.text('Ara Toplam:', PW / 2 + 5, y + 9);
      doc.text(formatPrice(totalPrice), PW - 12, y + 9, { align: 'right' });

      doc.text('KDV (%19):', PW / 2 + 5, y + 17);
      doc.text(formatPrice(totalPrice * 0.19), PW - 12, y + 17, { align: 'right' });

      doc.setDrawColor(37, 99, 235);
      doc.line(PW / 2 + 3, y + 21, PW - 10, y + 21);

      doc.setFillColor(15, 23, 60);
      doc.roundedRect(PW / 2, y + 23, PW / 2 - 10, 13, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('GENEL TOPLAM:', PW / 2 + 5, y + 31);
      doc.text(formatPrice(totalPrice * 1.19), PW - 12, y + 31, { align: 'right' });

      // ── Footer on all pages ──
      const totalPagesCount = doc.getNumberOfPages();
      for (let p = 1; p <= totalPagesCount; p++) {
        doc.setPage(p);
        doc.setFillColor(15, 23, 60);
        doc.rect(0, PH - 12, PW, 12, 'F');
        doc.setFillColor(37, 99, 235);
        doc.rect(0, PH - 12, PW, 1.5, 'F');
        doc.setTextColor(180, 200, 255);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `${COMPANY_INFO.name}  ·  ${COMPANY_INFO.address}  ·  ${COMPANY_INFO.phone}  ·  ${COMPANY_INFO.email}`,
          PW / 2, PH - 6,
          { align: 'center' }
        );
        doc.setTextColor(100, 130, 200);
        doc.text(`${p} / ${totalPagesCount}`, PW - 12, PH - 6, { align: 'right' });
      }

      doc.save(`Teklif_2MC_${quoteNo}_${dateStr.replace(/\./g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setPdfLoading(false);
    }
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
            disabled={pdfLoading}
            className="bg-surface-container-low hover:bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 transition-all shadow-sm disabled:opacity-60"
          >
            <FileText size={16} /> {pdfLoading ? 'Hazırlanıyor...' : 'PDF Teklif'}
          </button>
          <button
            onClick={handleSendOffer}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            {offerSent ? 'Gönderildi!' : <><Send size={16} /> Teklif İste</>}
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
      <div className="bg-gradient-to-r from-[#0f1740] to-[#1e3a8a] rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/logo-icon.png" alt="" className="absolute right-4 top-1/2 -translate-y-1/2 h-24 w-24 object-contain" />
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center relative z-10">
          <div className="flex-1">
            <img src="/logo-werbung.png" alt="2MC Werbung" className="h-8 object-contain mb-2" style={{ filter: 'brightness(0) invert(1)' }} />
            <p className="text-xs text-blue-200">{COMPANY_INFO.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-blue-100">
            <span className="flex items-center gap-1.5"><MapPin size={11} className="text-blue-300" /> {COMPANY_INFO.address}</span>
            <span className="flex items-center gap-1.5"><Phone size={11} className="text-blue-300" /> {COMPANY_INFO.phone}</span>
            <span className="flex items-center gap-1.5"><Mail size={11} className="text-blue-300" /> {COMPANY_INFO.email}</span>
            <span className="flex items-center gap-1.5"><Globe size={11} className="text-blue-300" /> {COMPANY_INFO.website}</span>
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

              {!isCollapsed && (
                <div className="divide-y divide-outline-variant/10">
                  {catItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-container-high/50 transition-colors">
                      <ProductImage src={product.img} alt={product.name} />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-on-surface truncate">{product.name}</p>
                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">{product.id}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand && (
                            <span className="text-[10px] text-on-surface-variant/60 font-medium">{product.brand}</span>
                          )}
                          {product.url && (
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-primary hover:underline font-medium truncate max-w-[200px]"
                              title={product.url}
                            >
                              Ürün Görseli ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs text-on-surface-variant hidden sm:block w-24">
                        <p className="flex items-center justify-end gap-1"><Euro size={10} /> {formatPrice(product.price)}</p>
                        <p className="text-[10px]">birim fiyat</p>
                      </div>

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

      {offerSent && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 z-50">
          <Send size={16} /> Teklif talebiniz gönderildi!
        </div>
      )}
    </div>
  );
}
