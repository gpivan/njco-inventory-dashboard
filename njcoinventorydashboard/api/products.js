// Vercel serverless function — proxies product reads/writes to the Google Apps
// Script backend. SHEETS_API_URL / SHEETS_API_SECRET stay server-side only
// (set them in Vercel → Settings → Environment Variables, no VITE_ prefix)
// so the Apps Script secret never reaches the browser bundle.
import { getSessionEmail } from './_lib/session.js';

const MAX_PRODUCTS = 2000;
const isSizeMap = (m) => m && typeof m === 'object' && ['S', 'M', 'L', 'XL'].every((k) => Number.isFinite(Number(m[k])));
const isProduct = (p) => p && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string' && isSizeMap(p.stock) && isSizeMap(p.sold);

export default async function handler(req, res) {
  if (!(await getSessionEmail(req.headers.cookie))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const url = process.env.SHEETS_API_URL;
  const secret = process.env.SHEETS_API_SECRET;

  if (!url || !secret) {
    res.status(500).json({ error: 'Server is not configured' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const upstream = await fetch(`${url}?secret=${encodeURIComponent(secret)}`);
      const data = await upstream.json();
      res.status(upstream.ok ? 200 : 502).json(data);
      return;
    }

    if (req.method === 'POST') {
      // a malformed/empty request must never be treated as "save an empty catalogue"
      const products = req.body?.products;
      if (!Array.isArray(products) || products.length > MAX_PRODUCTS || !products.every(isProduct)) {
        res.status(400).json({ error: 'Invalid products payload' });
        return;
      }
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret, products }),
      });
      const data = await upstream.json();
      res.status(upstream.ok ? 200 : 502).json(data);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch {
    res.status(502).json({ error: 'Could not reach the Sheets backend' });
  }
}
