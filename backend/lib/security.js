const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { parseCookies, buildCookie } = require('./cookies');

const SESSION_COOKIE = 'cta_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signSession(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email_verified: !!user.email_verified
    },
    process.env.JWT_SECRET,
    { expiresIn: `${SESSION_MAX_AGE_SECONDS}s` }
  );
}

function verifySession(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function attachSession(res, user) {
  const token = signSession(user);
  res.setHeader('Set-Cookie', buildCookie(SESSION_COOKIE, token, {
    path: '/',
    sameSite: 'Lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === 'production'
  }));
}

function clearSession(res) {
  res.setHeader('Set-Cookie', buildCookie(SESSION_COOKIE, '', {
    path: '/',
    sameSite: 'Lax',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production'
  }));
}

function readSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const authHeader = req.headers.authorization;
  if (cookies[SESSION_COOKIE]) return cookies[SESSION_COOKIE];
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function generateVerificationCode() {
  return String(crypto.randomInt(100000, 999999));
}

module.exports = {
  SESSION_COOKIE,
  attachSession,
  clearSession,
  readSessionToken,
  verifySession,
  generateVerificationCode
};
