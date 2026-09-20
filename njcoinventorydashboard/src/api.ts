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

// Uploads an already-resized JPEG (base64, no data: prefix) to the Drive folder via
// /api/upload. Resolves to the file's Drive link, or throws with a readable message.
export async function uploadImage(base64: string, name: string): Promise<string> {
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, name, mimeType: 'image/jpeg' }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.url) throw new Error(data.error || 'Upload failed');
  return data.url;
}
