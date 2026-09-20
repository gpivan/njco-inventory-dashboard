// Vercel serverless function — forwards a product image to the Google Apps Script
// backend, which saves it into the shared Drive folder and returns its link.
// Uses the same SHEETS_API_URL / SHEETS_API_SECRET as api/products.js.
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  const url = process.env.SHEETS_API_URL;
  const secret = process.env.SHEETS_API_SECRET;

  if (!url || !secret) {
    res.status(500).json({ error: 'SHEETS_API_URL / SHEETS_API_SECRET are not configured on the server' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { base64, name, mimeType } = req.body ?? {};
  if (!base64 || typeof base64 !== 'string') {
    res.status(400).json({ error: 'Missing image data' });
    return;
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, action: 'upload', base64, name, mimeType: mimeType || 'image/jpeg' }),
    });
    const data = await upstream.json();
    if (!upstream.ok || data.error) {
      res.status(502).json({ error: data.error || 'Drive upload failed' });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach the Drive backend', detail: String(err) });
  }
}
