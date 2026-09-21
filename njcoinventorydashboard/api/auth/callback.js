// Google redirects here with ?code. We swap it for an ID token server-side (so the
// token comes straight from Google over TLS), require a verified email that is on
// the ALLOWED_EMAILS list, then issue the signed session cookie.
import { COOKIE, STATE_COOKIE, SESSION_SECONDS, allowedEmails, cookieAttrs, createSession, readCookie } from '../_lib/session.js';

const deny = (res, status, msg) => {
  res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8')
    .send(`<!doctype html><meta charset="utf-8"><title>Access denied</title><body style="font-family:system-ui;max-width:28rem;margin:4rem auto;padding:0 1rem"><h1>${msg}</h1><p><a href="/api/auth/login">Try another Google account</a></p></body>`);
};

export default async function handler(req, res) {
  const { code, state } = req.query;
  const host = req.headers.host;
  const expected = readCookie(req.headers.cookie, STATE_COOKIE);
  const clear = `${STATE_COOKIE}=; ${cookieAttrs(host)}; Max-Age=0`;

  if (typeof code !== 'string' || !state || state !== expected) {
    res.setHeader('Set-Cookie', clear);
    deny(res, 400, 'Sign-in failed');
    return;
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${host.startsWith('localhost') ? 'http' : 'https'}://${host}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.id_token) throw new Error(`token exchange failed: ${tokens.error} ${tokens.error_description ?? ''}`);

    const claims = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
    const issuerOk = claims.iss === 'https://accounts.google.com' || claims.iss === 'accounts.google.com';
    const email = String(claims.email || '').toLowerCase();
    if (!issuerOk || claims.aud !== process.env.GOOGLE_CLIENT_ID || claims.email_verified !== true || !allowedEmails().includes(email)) {
      res.setHeader('Set-Cookie', clear);
      deny(res, 403, 'This Google account is not allowed to access this app');
      return;
    }

    res.setHeader('Set-Cookie', [
      `${COOKIE}=${await createSession(email)}; ${cookieAttrs(host)}; Max-Age=${SESSION_SECONDS}`,
      clear,
    ]);
    res.redirect(302, '/');
  } catch (err) {
    console.error('auth callback failed:', err.message);
    res.setHeader('Set-Cookie', clear);
    deny(res, 502, 'Could not complete sign-in');
  }
}
