const dotenv = require('dotenv');

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && !isTest) {
  console.error('❌ Falta JWT_SECRET. Copia .env.example a .env y complétalo.');
  process.exit(1);
}
if (isProd && process.env.JWT_SECRET.length < 24) {
  console.error('❌ JWT_SECRET es demasiado corto. Usa una cadena aleatoria de al menos 32 caracteres.');
  process.exit(1);
}
if (isProd && !process.env.DATABASE_URL) {
  console.error('❌ Falta DATABASE_URL. En producción Tako necesita una base PostgreSQL (Neon, Supabase, Render...).');
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  isTest,
  isProd,
  jwtSecret: process.env.JWT_SECRET,
  // PostgreSQL. Si no se define, en desarrollo se usa una base local embebida (PGlite) en ./.data/pglite.
  databaseUrl: process.env.DATABASE_URL || '',
  pgliteDir: process.env.PGLITE_DIR || (isTest ? 'memory://' : './.data/pglite'),
  // Orígenes permitidos por CORS, separados por coma. Vacío = cualquiera (solo desarrollo).
  clientUrls: (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean),
};
