import type { Product, Size, SortKey, Status, SalesStatus, Tone } from './types';

// Status logic. We store, per size: stock = units currently ON HAND, sold = cumulative sold.
// Derived: stocked (original) = stock + sold ; remaining = stock.
export const LOW_THRESHOLD = 3; // per-size: 1..3 on hand = Low
export const LOW_TOTAL_THRESHOLD = 10; // overall on-hand <= 10 = Low

export const SIZES: Size[] = ['S', 'M', 'L', 'XL'];
export const CATEGORIES = ['Sleepwear', 'Shorts', 'Undies', 'Accessories'];

export function sizeStatus(onHand: number): Status {
  if (onHand <= 0) return 'out';
  if (onHand <= LOW_THRESHOLD) return 'low';
  return 'ok';
}

export function overallStatus(p: Product): Status {
  const total = SIZES.reduce((s, sz) => s + p.stock[sz], 0);
  if (total <= 0) return 'out';
  if (total <= LOW_TOTAL_THRESHOLD) return 'low';
  return 'ok';
}

export const STATUS_LABEL: Record<Status, string> = {
  ok: 'Available',
  low: 'Low Stock',
  out: 'Out of Stock',
};

export const sumStock = (p: Product) => SIZES.reduce((s, z) => s + p.stock[z], 0); // on hand / remaining
export const sumSold = (p: Product) => SIZES.reduce((s, z) => s + p.sold[z], 0);
export const sumStocked = (p: Product) => SIZES.reduce((s, z) => s + p.stock[z] + p.sold[z], 0); // original stocked

// ---- money + sales ----
export const peso = (n: number) =>
  '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const salesAmount = (p: Product) => p.price * sumSold(p);
export const salesProgress = (p: Product) => (p.target > 0 ? (salesAmount(p) / p.target) * 100 : 0);

export function salesStatus(p: Product): SalesStatus {
  const pct = salesProgress(p);
  if (pct >= 100) return 'met';
  if (pct >= 50) return 'track';
  return 'attn';
}

export const SALES_LABEL: Record<SalesStatus, string> = {
  met: 'Target Met',
  track: 'On Track',
  attn: 'Needs Attention',
};
export const SALES_BADGE_CLS: Record<SalesStatus, string> = { met: 'ok', track: 'track', attn: 'low' };

// generic sort comparators keyed by token
export const SORTS: Record<SortKey, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.ts - a.ts,
  'stock-high': (a, b) => sumStock(b) - sumStock(a),
  'stock-low': (a, b) => sumStock(a) - sumStock(b),
  bestselling: (a, b) => sumSold(b) - sumSold(a),
  'sold-high': (a, b) => sumSold(b) - sumSold(a),
  'sales-high': (a, b) => salesAmount(b) - salesAmount(a),
  'sales-low': (a, b) => salesAmount(a) - salesAmount(b),
  progress: (a, b) => salesProgress(b) - salesProgress(a),
};

// soft tone per product for the placeholder swatch
export const TONES: Record<Tone, string> = {
  blush: '#F1DCD4',
  rose: '#EAD2D2',
  beige: '#EFE3D2',
  clay: '#E8D2C4',
  sand: '#F0E6D6',
  mauve: '#E5D6DC',
  sage: '#DCE0D2',
  cream: '#F2EADD',
};

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Pink Pajama Set', desc: 'Soft cotton pajama set with relaxed fit',
    cat: 'Sleepwear', tone: 'blush', label: 'pajama set', price: 299, target: 10000, ts: 502, added: 'May 2, 2026', updated: 'Jun 14, 2026',
    stock: { S: 8, M: 2, L: 2, XL: 1 }, sold: { S: 4, M: 6, L: 3, XL: 1 } },
  { id: 'p2', name: 'Blue Floral Sleepwear', desc: 'Lightweight floral lounge set for warm nights',
    cat: 'Sleepwear', tone: 'sage', label: 'floral set', price: 349, target: 12000, ts: 418, added: 'Apr 18, 2026', updated: 'Jun 17, 2026',
    stock: { S: 2, M: 1, L: 0, XL: 0 }, sold: { S: 8, M: 7, L: 5, XL: 4 } },
  { id: 'p3', name: 'Cotton Lounge Shorts', desc: 'Comfortable everyday lounge shorts, mid-rise',
    cat: 'Shorts', tone: 'sand', label: 'lounge shorts', price: 199, target: 8000, ts: 330, added: 'Mar 30, 2026', updated: 'Jun 10, 2026',
    stock: { S: 0, M: 0, L: 0, XL: 0 }, sold: { S: 10, M: 12, L: 8, XL: 6 } },
  { id: 'p4', name: 'Nude Seamless Undies', desc: 'Soft seamless everyday underwear, tagless',
    cat: 'Undies', tone: 'clay', label: 'seamless undies', price: 99, target: 5000, ts: 521, added: 'May 21, 2026', updated: 'Jun 18, 2026',
    stock: { S: 20, M: 18, L: 10, XL: 7 }, sold: { S: 5, M: 9, L: 4, XL: 2 } },
  { id: 'p5', name: 'Satin Slip Robe', desc: 'Lustrous satin robe with tie waist and lace trim',
    cat: 'Sleepwear', tone: 'mauve', label: 'satin robe', price: 499, target: 15000, ts: 211, added: 'Feb 11, 2026', updated: 'Jun 9, 2026',
    stock: { S: 6, M: 9, L: 7, XL: 4 }, sold: { S: 7, M: 5, L: 6, XL: 3 } },
  { id: 'p6', name: 'Ribbed Lounge Tee', desc: 'Stretch ribbed tee, easy boxy silhouette',
    cat: 'Sleepwear', tone: 'beige', label: 'lounge tee', price: 249, target: 9000, ts: 402, added: 'Apr 2, 2026', updated: 'Jun 15, 2026',
    stock: { S: 3, M: 2, L: 1, XL: 5 }, sold: { S: 9, M: 11, L: 6, XL: 2 } },
  { id: 'p7', name: 'Silk Scrunchie Trio', desc: 'Set of three mulberry silk hair scrunchies',
    cat: 'Accessories', tone: 'rose', label: 'scrunchie set', price: 149, target: 6000, ts: 128, added: 'Jan 28, 2026', updated: 'Jun 12, 2026',
    stock: { S: 30, M: 30, L: 30, XL: 30 }, sold: { S: 14, M: 0, L: 0, XL: 0 } },
  { id: 'p8', name: 'Linen Sleep Shorts', desc: 'Breathable linen-blend shorts with drawstring',
    cat: 'Shorts', tone: 'cream', label: 'sleep shorts', price: 229, target: 7000, ts: 508, added: 'May 8, 2026', updated: 'Jun 16, 2026',
    stock: { S: 5, M: 0, L: 2, XL: 0 }, sold: { S: 6, M: 8, L: 4, XL: 3 } },
];

// full timestamp for `updated` (ISO, so it survives the Sheets round-trip and sorts)
export const nowStamp = () => new Date().toISOString();

// "2026-09-21T15:25:00.000Z" -> "September 21, 2026 11:25 PM" (viewer's local time).
// Date-only values ("Jun 14, 2026", or the midnight timestamps Sheets makes from them)
// show just the date, since their time isn't real. Unparseable text is shown as-is.
export function formatStamp(raw: string | undefined): string {
  const s = (raw ?? '').trim();
  const d = new Date(s);
  if (!s || isNaN(d.getTime())) return s;
  const isIso = /^\d{4}-\d{2}-\d{2}T/.test(s);
  const dateOnly = !isIso || (d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0);
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return dateOnly ? date : `${date} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export function todayStr(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
