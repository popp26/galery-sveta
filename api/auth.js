const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });
const SECRET = process.env.JWT_SECRET || 'galerysveta2026';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  if (action === 'register' && req.method === 'POST') {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Заполните все поля' });
    try {
      const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
      if (exists.rows.length) return res.status(409).json({ error: 'Email уже зарегистрирован' });
      const hash = await bcrypt.hash(password, 10);
      const r = await pool.query('INSERT INTO users (email,password_hash,name) VALUES ($1,$2,$3) RETURNING id,email,name,role', [email.toLowerCase(), hash, name]);
      const user = r.rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body;
    try {
      const r = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
      const user = r.rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Неверный email или пароль' });
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (action === 'me' && req.method === 'GET') {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: 'Нет токена' });
    try {
      const user = jwt.verify(h.slice(7), SECRET);
      const r = await pool.query('SELECT id,email,name,phone,role FROM users WHERE id=$1', [user.id]);
      return res.json(r.rows[0]);
    } catch(e) { return res.status(401).json({ error: 'Недействительный токен' }); }
  }

  res.status(404).json({ error: 'Not found' });
};
