/* Shared helpers for FlowWallet Netlify Functions */
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

// Lazily connect so a missing DATABASE_URL doesn't crash the module on import.
let _sql = null;
const sql = (strings, ...values) => {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql(strings, ...values);
};
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';

// Create the users table if it doesn't exist yet.
async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    data          JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const signToken = (u) => jwt.sign({ uid: u.id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: '180d' });

// Verify the Bearer token; returns the decoded payload or null.
function authUser(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return null;
  try { return jwt.verify(m[1], JWT_SECRET); } catch { return null; }
}

module.exports = { sql, ensureSchema, json, signToken, authUser, JWT_SECRET };
