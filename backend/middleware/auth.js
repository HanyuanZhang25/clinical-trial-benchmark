const db = require('../database');
const { readSessionToken, verifySession } = require('../lib/security');

async function authenticateToken(req, res, next) {
  const token = readSessionToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error_code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  try {
    const session = verifySession(token);
    const user = await db.get(`
      SELECT id, username, email, full_name, affiliation, role, email_verified, created_at
      FROM users WHERE id = ?
    `, [session.id]);

    if (!user) {
      return res.status(401).json({
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Session user no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error_code: 'UNAUTHORIZED',
      message: 'Invalid or expired session.'
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error_code: 'FORBIDDEN',
      message: 'Admin access required.'
    });
  }
  next();
}

function requireVerifiedEmail(req, res, next) {
  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error_code: 'EMAIL_NOT_VERIFIED',
      message: 'Verify your email before submitting.'
    });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireVerifiedEmail };
