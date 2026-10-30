/**
 * Capa de base de datos: una sola interfaz (query / tx) con dos motores PostgreSQL:
 *  - DATABASE_URL definido  -> PostgreSQL real (Neon, Supabase, Render...) con el driver "pg".
 *  - sin DATABASE_URL (dev/test) -> PGlite: PostgreSQL embebido que corre dentro de Node, sin instalar nada.
 * El resto del código solo usa SQL estándar, así que funciona igual en ambos.
 */
const { databaseUrl, pgliteDir } = require('../config/env');
const schema = require('./schema');

const DATE_OID = 1082;
const INT8_OID = 20;
const NUMERIC_OID = 1700;

let engine = null; // { query(text, params), tx(fn), close() }

async function createPg() {
  const { Pool, types } = require('pg');
  types.setTypeParser(DATE_OID, (v) => v);          // DATE -> 'YYYY-MM-DD' (sin zonas horarias)
  types.setTypeParser(INT8_OID, (v) => parseInt(v, 10));
  types.setTypeParser(NUMERIC_OID, (v) => parseFloat(v));
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    ssl: /sslmode=disable|localhost|127\.0\.0\.1/.test(databaseUrl) ? false : { rejectUnauthorized: false },
  });
  return {
    name: 'PostgreSQL',
    query: (text, params) => pool.query(text, params),
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn({ query: (t, p) => client.query(t, p) });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

async function createPglite() {
  const { PGlite, types } = require('@electric-sql/pglite');
  const fs = require('fs');
  if (!pgliteDir.startsWith('memory:')) fs.mkdirSync(pgliteDir, { recursive: true });
  const db = new PGlite(pgliteDir, {
    parsers: {
      [types.DATE]: (v) => v,
      [types.INT8]: (v) => parseInt(v, 10),
      [types.NUMERIC]: (v) => parseFloat(v),
    },
  });
  await db.waitReady;
  return {
    name: pgliteDir.startsWith('memory:') ? 'PGlite (memoria)' : `PGlite (${pgliteDir})`,
    query: (text, params) => db.query(text, params),
    tx: (fn) => db.transaction((t) => fn({ query: (text, params) => t.query(text, params) })),
    close: () => db.close(),
  };
}

async function init() {
  if (engine) return engine;
  engine = databaseUrl ? await createPg() : await createPglite();
  await engine.query('SELECT 1');
  for (const statement of schema.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
    await engine.query(statement);
  }
  return engine;
}

const get = () => {
  if (!engine) throw new Error('La base de datos no está inicializada (llama a db.init())');
  return engine;
};

module.exports = {
  init,
  query: (text, params) => get().query(text, params),
  tx: (fn) => get().tx(fn),
  close: async () => { if (engine) { await engine.close(); engine = null; } },
  engineName: () => (engine ? engine.name : 'sin inicializar'),
};
