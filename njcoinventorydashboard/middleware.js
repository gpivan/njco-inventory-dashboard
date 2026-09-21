// Vercel Routing Middleware — runs before every request, so the static app and the
// /api data endpoints are both unreachable without a valid allow-listed session.
import { getSessionEmail } from './api/_lib/session.js';

export const config = { matcher: ['/((?!api/auth/).*)'] };

export default async function middleware(request) {
  if (await getSessionEmail(request.headers.get('cookie'))) return;

  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/api/')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.redirect(new URL('/api/auth/login', request.url), 302);
}
