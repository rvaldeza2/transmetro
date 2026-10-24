const { pool } = require('../config/db');
const { createModel } = require('./base.model');

const base = createModel({
  table: 'municipalidad',
  key: 'id_municipalidad',
  fields: ['nombre', 'direccion'],
});

async function findLineas(id, db = pool) {
  const [rows] = await db.query(
    `SELECT l.id_linea, l.nombre, l.distancia_total_km,
            (SELECT COUNT(*) FROM bus b WHERE b.id_linea = l.id_linea) AS buses
     FROM linea l
     WHERE l.id_municipalidad = ?
     ORDER BY l.nombre`,
    [id]
  );
  return rows;
}

async function findEstaciones(id, db = pool) {
  const [rows] = await db.query(
    `SELECT id_estacion, nombre FROM estacion WHERE id_municipalidad = ? ORDER BY nombre`,
    [id]
  );
  return rows;
}

module.exports = { ...base, findLineas, findEstaciones };
