const buckets = new Map();

function getClientKey(req, suffix) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  return `${suffix}:${ip}`;
}

function rateLimit({ key, limit, windowMs, message }) {
  return (req, res, next) => {
    const bucketKey = getClientKey(req, key);
    const now = Date.now();
    const current = buckets.get(bucketKey);

    if (!current || current.resetAt <= now) {
      buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      return res.status(429).json({
        success: false,
        error_code: 'RATE_LIMITED',
        message
      });
    }

    current.count += 1;
    next();
  };
}

module.exports = { rateLimit };
