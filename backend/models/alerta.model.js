const { pool } = require('../config/db');

const SELECT_ALERTA = `
  SELECT a.id_alerta, a.tipo, a.id_estacion, e.nombre AS estacion,
         a.id_bus, b.placa, a.pasajeros, a.porcentaje, a.mensaje,
         a.fecha_hora, a.atendida
  FROM alerta a
  LEFT JOIN estacion e ON e.id_estacion = a.id_estacion
  LEFT JOIN bus b      ON b.id_bus = a.id_bus`;

// Filtros opcionales: tipo (SOBRECUPO / ESPERA) y atendida (true / false)
async function findAll({ tipo, atendida, limite } = {}, db = pool) {
  const condiciones = [];
  const valores = [];
  if (tipo) {
    condiciones.push('a.tipo = ?');
    valores.push(tipo);
  }
  if (atendida !== undefined) {
    condiciones.push('a.atendida = ?');
    valores.push(atendida);
  }
  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const limit = limite ? `LIMIT ${Number(limite)}` : '';
  const [rows] = await db.query(`${SELECT_ALERTA} ${where} ORDER BY a.fecha_hora DESC, a.id_alerta DESC ${limit}`, valores);
  return rows.map((row) => ({ ...row, atendida: Boolean(row.atendida) }));
}

async function findById(id, db = pool) {
  const [rows] = await db.query(`${SELECT_ALERTA} WHERE a.id_alerta = ?`, [id]);
  return rows[0] ? { ...rows[0], atendida: Boolean(rows[0].atendida) } : null;
}

async function create(data, db = pool) {
  const [result] = await db.query('INSERT INTO alerta SET ?', [data]);
  return result.insertId;
}

async function marcarAtendida(id, db = pool) {
  await db.query('UPDATE alerta SET atendida = TRUE WHERE id_alerta = ?', [id]);
}

module.exports = { findAll, findById, create, marcarAtendida };
