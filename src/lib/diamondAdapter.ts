import type { DiamondProduct } from '../stores/diamondStore';
import type { EquipmentItem } from '../stores/equipmentStore';

export function diamondToEquipment(p: DiamondProduct): EquipmentItem {
  const price = p.price_promo ?? p.price_display ?? p.price_catalog ?? 0;
  return {
    id: p.id,
    name: p.name,
    desc: p.description_tech_spec || '',
    cat: p.product_category_id || '',
    sub: p.product_subfamily_id || '',
    fam: p.product_family_name || '',
    img: p.image_big || p.image_thumb || p.image_full || '',
    brand: 'Diamond',
    l: p.length_mm || 0,
    w: p.width_mm || 0,
    h: String(p.height_mm ?? ''),
    kw: Number(p.electric_power_kw) || 0,
    price,
    line: p.product_line_id || '',
  };
}

export function parseGallery(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[,;|\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http'));
}

export function getStockLabel(stock: string | null | undefined): {
  label: string;
  tone: 'ok' | 'low' | 'out';
} {
  const n = Number(stock);
  if (!stock || Number.isNaN(n) || n <= 0) return { label: 'Stokta Yok', tone: 'out' };
  if (n < 5) return { label: `Son ${n} Adet`, tone: 'low' };
  return { label: 'Stokta', tone: 'ok' };
}
