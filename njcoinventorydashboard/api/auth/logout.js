import { COOKIE, cookieAttrs } from '../_lib/session.js';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs(req.headers.host)}; Max-Age=0`);
  res.redirect(302, '/api/auth/login');
}
