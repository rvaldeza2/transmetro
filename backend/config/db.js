const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'transmetro',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  dateStrings: true,
  // Las bases MySQL en la nube (Aiven, TiDB, etc.) exigen conexión cifrada
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Ojo: Render y la base en la nube trabajan en UTC, por eso las visitas salían con 6 horas de más.
// Hora de Guatemala (UTC-6, sin horario de verano) para NOW() y las fechas por defecto,
// aunque el servidor de la base de datos esté en UTC
pool.pool.on('connection', (conn) => conn.query("SET time_zone = '-06:00'"));

// Ejecuta varias consultas como una sola transacción.
async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, withTransaction };
