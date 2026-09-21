export type Size = 'S' | 'M' | 'L' | 'XL';
export type Status = 'ok' | 'low' | 'out';
export type SalesStatus = 'met' | 'track' | 'attn';
export type Tone = 'blush' | 'rose' | 'beige' | 'clay' | 'sand' | 'mauve' | 'sage' | 'cream';

export type SizeMap = Record<Size, number>;

export interface Product {
  id: string;
  name: string;
  desc: string;
  brand: string;
  cat: string;
  tone: Tone;
  label: string;
  image?: string; // Drive/other image link; empty → tinted placeholder
  price: number;
  target: number;
  ts: number;
  added: string;
  updated: string;
  stock: SizeMap;
  sold: SizeMap;
}

export type SortKey =
  | 'newest'
  | 'stock-high'
  | 'stock-low'
  | 'bestselling'
  | 'sold-high'
  | 'sales-high'
  | 'sales-low'
  | 'progress';

export type NavId = 'dashboard' | 'products' | 'inventory' | 'sales' | 'low' | 'out' | 'settings';

export type ActionType = 'view' | 'edit' | 'sale' | 'restock' | 'delete';

export interface Filters {
  q: string;
  status: 'all' | Status;
  cat: string;
  brand: string;
  size: 'all' | Size;
  salesstatus: 'all' | SalesStatus;
  sort: SortKey;
}
