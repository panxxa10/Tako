const { port } = require('./config/env');
const db = require('./db');
const app = require('./app');

db.init()
  .then(() => {
    console.log(`✅ Base de datos lista: ${db.engineName()}`);
    app.listen(port, () => console.log(`🚀 Tako API en http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('❌ No se pudo iniciar la base de datos:', err.message);
    process.exit(1);
  });
