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

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinicaltrialarena.dev';
const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);

if (!adminUser) {
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 12);
  db.prepare(`
    INSERT INTO users (username, password, email, full_name, affiliation, role, email_verified)
    VALUES (?, ?, ?, ?, ?, 'admin', 1)
  `).run(
    adminUsername,
    hashedPassword,
    adminEmail,
    'Clinical Trial Arena Admin',
    'Clinical Trial Arena'
  );
  console.log('Default admin user created');
}

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
