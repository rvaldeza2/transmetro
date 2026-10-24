const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// Aplica migracion_v2.sql cuando la base todavía tiene el esquema anterior.
// Así al desplegar en Render la base de la nube se actualiza sola, sin correr el script a mano.
async function aplicarMigraciones() {
  const [columnas] = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'usuario' AND column_name = 'pregunta_seguridad'`
  );
  if (columnas.length > 0) return false;

  const script = fs.readFileSync(path.join(__dirname, 'migracion_v2.sql'), 'utf8');
  const sentencias = script
    .replace(/^\s*--.*$/gm, '')
    .split(/;\s*$/m)
    .map((sentencia) => sentencia.trim())
    .filter(Boolean);

  for (const sentencia of sentencias) {
    await pool.query(sentencia);
  }
  return true;
}

module.exports = { aplicarMigraciones };
