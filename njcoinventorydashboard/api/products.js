// Vercel serverless function — proxies product reads/writes to the Google Apps
// Script backend. SHEETS_API_URL / SHEETS_API_SECRET stay server-side only
// (set them in Vercel → Settings → Environment Variables, no VITE_ prefix)
// so the Apps Script secret never reaches the browser bundle.
export default async function handler(req, res) {
  const url = process.env.SHEETS_API_URL;
  const secret = process.env.SHEETS_API_SECRET;

  if (!url || !secret) {
    res.status(500).json({ error: 'SHEETS_API_URL / SHEETS_API_SECRET are not configured on the server' });
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
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret, products: req.body?.products ?? [] }),
      });
      const data = await upstream.json();
      res.status(upstream.ok ? 200 : 502).json(data);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach the Sheets backend', detail: String(err) });
  }
}
