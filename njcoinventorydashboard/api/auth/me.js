// Tells the signed-in browser who it is (for the sidebar). /api/auth/* is exempt
// from middleware.js, so this handler does its own session check.
import { getSession } from '../_lib/session.js';

export default async function handler(req, res) {
  const user = await getSession(req.headers.cookie);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.setHeader('Cache-Control', 'private, no-store');
  res.json(user);
}
