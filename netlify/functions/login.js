const bcrypt = require('bcryptjs');
const { sql, ensureSchema, json, signToken } = require('./_db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return json(400, { error: 'Missing fields' });
    const em = String(email).toLowerCase().trim();

    const rows = await sql`SELECT id, name, email, password_hash, created_at FROM users WHERE email = ${em}`;
    if (!rows.length) return json(401, { error: 'Incorrect email or password' });

    const u = rows[0];
    const ok = await bcrypt.compare(String(password), u.password_hash);
    if (!ok) return json(401, { error: 'Incorrect email or password' });

    return json(200, { token: signToken(u), name: u.name, email: u.email, created: u.created_at });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
