const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const db = require('./database');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/benchmarks', require('./routes/benchmarks'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/content', require('./routes/content'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/me', require('./middleware/auth').authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const frontendDistDir = path.join(__dirname, '../frontend/dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

async function syncAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinicaltrialarena.dev';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminUser = await db.get('SELECT id FROM users WHERE username = ?', [adminUsername]);
  const hashedAdminPassword = bcrypt.hashSync(adminPassword, 12);

  if (!adminUser) {
    await db.insert(`
      INSERT INTO users (username, password, email, full_name, affiliation, role, email_verified)
      VALUES (?, ?, ?, ?, ?, 'admin', 1)
    `, [
      adminUsername,
      hashedAdminPassword,
      adminEmail,
      'Clinical Trial Arena Admin',
      'Clinical Trial Arena'
    ]);
    console.log('Admin user created from environment configuration');
  } else {
    await db.run(`
      UPDATE users
      SET email = ?, password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminEmail, hashedAdminPassword, adminUser.id]);
    console.log('Admin user synchronized from environment configuration');
  }
}

async function start() {
  await db.init();
  await syncAdminUser();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('[startup] Failed to initialize server:', error);
  process.exit(1);
});
