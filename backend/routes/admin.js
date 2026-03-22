const express = require('express');
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const benchmarks = db.prepare('SELECT COUNT(*) AS count FROM benchmarks').get().count;
  const submissions = db.prepare('SELECT COUNT(*) AS count FROM submissions').get().count;
  const pendingEvaluations = db.prepare(
    "SELECT COUNT(*) AS count FROM submission_evaluations WHERE status = 'pending_results'"
  ).get().count;

  res.json({
    success: true,
    stats: { users, benchmarks, submissions, pending_evaluations: pendingEvaluations }
  });
});

router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT id, username, email, full_name, affiliation, role, email_verified, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();

  res.json({ success: true, users });
});

module.exports = router;
