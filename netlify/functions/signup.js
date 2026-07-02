const bcrypt = require('bcryptjs');
const { sql, ensureSchema, json, signToken } = require('./_db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const { name, email, password } = JSON.parse(event.body || '{}');
    if (!name || !email || !password) return json(400, { error: 'Missing fields' });
    if (String(password).length < 6) return json(400, { error: 'Password must be at least 6 characters' });
    const em = String(email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) return json(400, { error: 'Enter a valid email address' });

    const existing = await sql`SELECT id FROM users WHERE email = ${em}`;
    if (existing.length) return json(409, { error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(String(password), 10);
    const rows = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${em}, ${String(name).trim()}, ${hash})
      RETURNING id, name, email, created_at`;
    const u = rows[0];
    return json(200, { token: signToken(u), name: u.name, email: u.email, created: u.created_at });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
