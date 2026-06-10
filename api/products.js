const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { category, style, material, price_min, price_max, sort = 'popular', page = 1, limit = 12, search } = req.query;
    const conditions = ['p.in_stock = true'];
    const vals = [];
    if (category) { vals.push(category); conditions.push(`c.slug = $${vals.length}`); }
    if (style) { vals.push(style); conditions.push(`p.style = $${vals.length}`); }
    if (material) { vals.push(material); conditions.push(`p.material = $${vals.length}`); }
    if (price_min) { vals.push(Number(price_min)); conditions.push(`p.price >= $${vals.length}`); }
    if (price_max) { vals.push(Number(price_max)); conditions.push(`p.price <= $${vals.length}`); }
    if (search) { vals.push(`%${search}%`); conditions.push(`p.name ILIKE $${vals.length}`); }
    const where = 'WHERE ' + conditions.join(' AND ');
    const orderMap = { popular:'p.review_count DESC', price_asc:'p.price ASC', price_desc:'p.price DESC', newest:'p.created_at DESC' };
    const order = orderMap[sort] || 'p.review_count DESC';
    const offset = (Number(page) - 1) * Number(limit);
    vals.push(Number(limit), offset);
    const [data, count] = await Promise.all([
      pool.query(`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where} ORDER BY ${order} LIMIT $${vals.length-1} OFFSET $${vals.length}`, vals),
      pool.query(`SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where}`, vals.slice(0,-2))
    ]);
    res.json({ products: data.rows, total: Number(count.rows[0].count), page: Number(page), pages: Math.ceil(Number(count.rows[0].count)/Number(limit)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
