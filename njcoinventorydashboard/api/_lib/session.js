// Shared by the auth endpoints, the API handlers and middleware.js (edge runtime),
// so it sticks to Web Crypto — available in both Node 18+ and the edge.
export const COOKIE = 'nj_session';
export const STATE_COOKIE = 'nj_oauth_state';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const hmacKey = (secret) => crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export const allowedEmails = () =>
  (process.env.ALLOWED_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function createSession(email) {
  const body = toB64u(enc.encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(process.env.AUTH_SECRET), enc.encode(body));
  return `${body}.${toB64u(sig)}`;
}

export function readCookie(header, name) {
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

// Resolves to the signed-in email, or null. The allowlist is re-checked on every
// request, so removing an address from ALLOWED_EMAILS revokes its session at once.
export async function getSessionEmail(cookieHeader) {
  const secret = process.env.AUTH_SECRET;
  const token = readCookie(cookieHeader, COOKIE);
  if (!secret || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64u(sig), enc.encode(body));
    if (!ok) return null;
    const { email, exp } = JSON.parse(dec.decode(fromB64u(body)));
    if (typeof email !== 'string' || !(exp > Date.now() / 1000)) return null;
    return allowedEmails().includes(email.toLowerCase()) ? email : null;
  } catch {
    return null;
  }
}

export const cookieAttrs = (host) => `Path=/; HttpOnly; SameSite=Lax${/^localhost(:|$)/.test(host || '') ? '' : '; Secure'}`;
