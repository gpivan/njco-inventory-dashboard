// Vercel Routing Middleware — runs before every request, so the static app and the
// /api data endpoints are both unreachable without a valid allow-listed session.
import { getSessionEmail } from './api/_lib/session.js';

export const config = { matcher: ['/((?!api/auth/).*)'] };

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  const authed = await getSessionEmail(request.headers.get('cookie'));

  // the login page and its logo must load without a session; once signed in, bounce
  // away from the login page itself instead of showing it again
  if (pathname === '/login.html' || pathname === '/njco-logo.png') {
    if (authed && pathname === '/login.html') return Response.redirect(new URL('/', request.url), 302);
    return;
  }

  if (authed) return;

  if (pathname.startsWith('/api/')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.redirect(new URL('/login.html', request.url), 302);
}
