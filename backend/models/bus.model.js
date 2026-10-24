const { pool } = require('../config/db');
const { createModel } = require('./base.model');

const base = createModel({
  table: 'bus',
  key: 'id_bus',
  fields: ['placa', 'capacidad', 'id_linea', 'id_parqueo'],
});

const SELECT_BUS = `
  SELECT b.id_bus, b.placa, b.capacidad,
         b.id_linea, l.nombre AS linea,
         b.id_parqueo, p.ubicacion AS parqueo
  FROM bus b
  LEFT JOIN linea l ON l.id_linea = b.id_linea
  JOIN parqueo p    ON p.id_parqueo = b.id_parqueo`;

async function findAll(db = pool) {
  const [rows] = await db.query(`${SELECT_BUS} ORDER BY b.id_bus`);
  return rows;
}

async function findById(id, db = pool) {
  const [rows] = await db.query(`${SELECT_BUS} WHERE b.id_bus = ?`, [id]);
  return rows[0] || null;
}

async function lockById(id, db) {
  const [rows] = await db.query('SELECT id_bus, id_linea FROM bus WHERE id_bus = ? FOR UPDATE', [id]);
  return rows[0] || null;
}

module.exports = { ...base, findAll, findById, lockById };
