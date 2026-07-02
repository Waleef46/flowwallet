const bcrypt = require('bcryptjs');
const { sql, ensureSchema, json, authUser, signToken } = require('./_db');

exports.handler = async (event) => {
  const user = authUser(event);
  if (!user) return json(401, { error: 'Unauthorized' });
  if (event.httpMethod !== 'PUT') return json(405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const body = JSON.parse(event.body || '{}');

    // Change display name → returns a refreshed token carrying the new name.
    if (typeof body.name === 'string') {
      const n = body.name.trim();
      if (!n) return json(400, { error: 'Invalid name' });
      await sql`UPDATE users SET name = ${n} WHERE id = ${user.uid}`;
      return json(200, { name: n, token: signToken({ id: user.uid, email: user.email, name: n }) });
    }

    // Change password (requires the current one).
    if (typeof body.newPassword === 'string') {
      if (body.newPassword.length < 6) return json(400, { error: 'Password must be at least 6 characters' });
      const rows = await sql`SELECT password_hash FROM users WHERE id = ${user.uid}`;
      if (!rows.length) return json(404, { error: 'Not found' });
      const ok = await bcrypt.compare(String(body.currentPassword || ''), rows[0].password_hash);
      if (!ok) return json(403, { error: 'Current password is incorrect' });
      const hash = await bcrypt.hash(body.newPassword, 10);
      await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user.uid}`;
      return json(200, { ok: true });
    }

    return json(400, { error: 'Nothing to update' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
