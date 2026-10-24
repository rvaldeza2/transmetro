const { pool } = require('../config/db');

const SELECT_VISITA = `
  SELECT v.id_visita, v.id_bus, b.placa, l.id_linea, l.nombre AS linea,
         v.id_estacion, e.nombre AS estacion, le.orden_visita,
         v.fecha_hora, v.pasajeros, b.capacidad,
         ROUND(v.pasajeros * 100 / b.capacidad, 2) AS porcentaje,
         v.espera_adicional_min
  FROM visita v
  JOIN bus b      ON b.id_bus = v.id_bus
  JOIN estacion e ON e.id_estacion = v.id_estacion
  LEFT JOIN linea l ON l.id_linea = b.id_linea
  LEFT JOIN linea_estacion le ON le.id_linea = b.id_linea AND le.id_estacion = v.id_estacion`;

// Filtros opcionales: bus y fecha (YYYY-MM-DD)
async function findAll({ id_bus: idBus, fecha } = {}, db = pool) {
  const condiciones = [];
  const valores = [];
  if (idBus) {
    condiciones.push('v.id_bus = ?');
    valores.push(idBus);
  }
  if (fecha) {
    condiciones.push('DATE(v.fecha_hora) = ?');
    valores.push(fecha);
  }
  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [rows] = await db.query(`${SELECT_VISITA} ${where} ORDER BY v.fecha_hora DESC, v.id_visita DESC`, valores);
  return rows;
}

async function findById(id, db = pool) {
  const [rows] = await db.query(`${SELECT_VISITA} WHERE v.id_visita = ?`, [id]);
  return rows[0] || null;
}

async function create(data, db = pool) {
  const [result] = await db.query('INSERT INTO visita SET ?', [data]);
  return result.insertId;
}

async function remove(id, db = pool) {
  const [result] = await db.query('DELETE FROM visita WHERE id_visita = ?', [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, create, remove };
