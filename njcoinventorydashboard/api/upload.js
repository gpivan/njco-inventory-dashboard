// Vercel serverless function — forwards a product image to the Google Apps Script
// backend, which saves it into the shared Drive folder and returns its link.
// Uses the same SHEETS_API_URL / SHEETS_API_SECRET as api/products.js.
import { getSessionEmail } from './_lib/session.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const MAX_BASE64_CHARS = 3_000_000; // ≈ 2.2MB of image; the client sends ~100–300KB
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { base64, name } = req.body ?? {};
  if (typeof base64 !== 'string' || base64.length === 0 || base64.length > MAX_BASE64_CHARS || !BASE64_RE.test(base64)) {
    res.status(400).json({ error: 'Invalid image data' });
    return;
  }
  // the client always sends a JPEG (canvas re-encode) — reject anything else by its magic bytes
  const head = Buffer.from(base64.slice(0, 8), 'base64');
  if (!(head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff)) {
    res.status(400).json({ error: 'Only image uploads are supported' });
    return;
  }
  // never pass a client-chosen name or type through: fixed extension, sanitised stem
  const stem = String(name ?? 'product').replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || 'product';

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, action: 'upload', base64, name: `${stem}.jpg`, mimeType: 'image/jpeg' }),
    });
    const data = await upstream.json();
    if (!upstream.ok || data.error || typeof data.url !== 'string') {
      res.status(502).json({ error: 'Drive upload failed' });
      return;
    }
    res.status(200).json({ ok: true, url: data.url });
  } catch {
    res.status(502).json({ error: 'Could not reach the Drive backend' });
  }
}
