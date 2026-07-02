const { sql, ensureSchema, json, authUser } = require('./_db');

exports.handler = async (event) => {
  const user = authUser(event);
  if (!user) return json(401, { error: 'Unauthorized' });
  try {
    await ensureSchema();

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT data, updated_at FROM users WHERE id = ${user.uid}`;
      if (!rows.length) return json(404, { error: 'Not found' });
      return json(200, { data: rows[0].data, updatedAt: rows[0].updated_at });
    }

    if (event.httpMethod === 'PUT') {
      const { data } = JSON.parse(event.body || '{}');
      if (typeof data !== 'object' || data === null) return json(400, { error: 'Invalid data' });
      const rows = await sql`
        UPDATE users SET data = ${JSON.stringify(data)}::jsonb, updated_at = now()
        WHERE id = ${user.uid}
        RETURNING updated_at`;
      if (!rows.length) return json(404, { error: 'Not found' });
      return json(200, { updatedAt: rows[0].updated_at });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (e) {
    return json(500, { error: 'Server error' });
  }
};
