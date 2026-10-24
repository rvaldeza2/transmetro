const { pool } = require('../config/db');
const { createModel } = require('./base.model');

const base = createModel({
  table: 'estacion',
  key: 'id_estacion',
  fields: ['nombre', 'id_municipalidad'],
});

// RF02: líneas a las que pertenece la estación
async function findLineas(id, db = pool) {
  const [rows] = await db.query(
    `SELECT l.id_linea, l.nombre, le.orden_visita
     FROM linea_estacion le
     JOIN linea l ON l.id_linea = le.id_linea
     WHERE le.id_estacion = ?
     ORDER BY l.nombre`,
    [id]
  );
  return rows;
}

async function findAccesos(id, db = pool) {
  const [rows] = await db.query(
    `SELECT a.id_acceso, a.nombre,
            (SELECT COUNT(*) FROM acceso_guardia ag WHERE ag.id_acceso = a.id_acceso) AS num_guardias
     FROM acceso a
     WHERE a.id_estacion = ?
     ORDER BY a.id_acceso`,
    [id]
  );
  return rows;
}

// RF12: capacidad total de las unidades asignadas a las líneas que pasan por la estación
async function capacidadUnidades(id, db = pool) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS unidades, COALESCE(SUM(b.capacidad), 0) AS capacidad_total
     FROM bus b
     JOIN linea_estacion le ON le.id_linea = b.id_linea
     WHERE le.id_estacion = ?`,
    [id]
  );
  return rows[0];
}

module.exports = { ...base, findLineas, findAccesos, capacidadUnidades };
