/* ============ NJ&CO — persistence client (talks to /api/products) ============ */
import type { Product } from './types';

export async function fetchProducts(): Promise<Product[] | null> {
  try {
    const r = await fetch('/api/products');
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data.products) ? data.products : null;
  } catch {
    return null;
  }
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  try {
    const r = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
