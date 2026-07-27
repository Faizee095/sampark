const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'db.json');
const PORT = process.env.PORT || 4000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { qrs: [] };
  }
}

function writeDB(obj) {
  fs.writeFileSync(DB_PATH, JSON.stringify(obj, null, 2), 'utf-8');
}

function requireAdmin(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.body.adminPass || req.query.adminPass;
  if (pass && pass === ADMIN_PASS) return next();
  return res.status(401).json({ error: 'admin auth required' });
}

app.post('/admin/generate', requireAdmin, (req, res) => {
  const { count = 1 } = req.body;
  const db = readDB();
  const created = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const entry = { id, used: false, createdAt: new Date().toISOString() };
    db.qrs.push(entry);
    created.push({ id, url: `${CLIENT_URL}/qr/${id}` });
  }
  writeDB(db);
  res.json({ created });
});

app.get('/qr/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const entry = db.qrs.find((q) => q.id === id);
  if (!entry) return res.status(404).json({ error: 'QR not found' });
  // Keep personally identifiable information private on public QR scans.
  // Full owner information remains available through the authenticated admin API.
  const publicEntry = {
    id: entry.id,
    used: entry.used,
    createdAt: entry.createdAt || null,
  };
  res.json(publicEntry);
});

app.post('/qr/:id/register', (req, res) => {
  const { id } = req.params;
  const { name, mobile, carNumber } = req.body;
  if (!name || !mobile || !carNumber) return res.status(400).json({ error: 'missing fields' });
  const db = readDB();
  const idx = db.qrs.findIndex((q) => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'QR not found' });
  const entry = db.qrs[idx];
  if (entry.used) return res.status(400).json({ error: 'QR already registered' });
  entry.used = true;
  entry.owner = { name, mobile, carNumber };
  entry.usedAt = new Date().toISOString();
  db.qrs[idx] = entry;
  writeDB(db);
  res.json({ success: true, entry: { id: entry.id, owner: entry.owner } });
});

app.get('/admin/list', requireAdmin, (req, res) => {
  const db = readDB();
  res.json({ qrs: db.qrs });
});

app.get('/admin/export', requireAdmin, (req, res) => {
  const db = readDB();
  const escape = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
  const rows = db.qrs.map((q) => {
    const name = q.owner?.name || '';
    const mobile = q.owner?.mobile || '';
    const carNumber = q.owner?.carNumber || '';
    return [
      escape(q.id),
      escape(q.used ? 'yes' : 'no'),
      escape(q.createdAt || ''),
      escape(q.usedAt || ''),
      escape(name),
      escape(mobile),
      escape(carNumber),
    ].join(',');
  });
  const header = 'id,used,createdAt,usedAt,name,mobile,carNumber\n';
  const csv = header + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="qrs.csv"');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
