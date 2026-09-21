// Starts the Google sign-in: sets a one-time state cookie and redirects to Google.
import { STATE_COOKIE, cookieAttrs } from '../_lib/session.js';

export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !process.env.AUTH_SECRET) {
    res.status(500).send('Sign-in is not configured');
    return;
  }
  const host = req.headers.host;
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${host.startsWith('localhost') ? 'http' : 'https'}://${host}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  res.setHeader('Set-Cookie', `${STATE_COOKIE}=${state}; ${cookieAttrs(host)}; Max-Age=600`);
  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
