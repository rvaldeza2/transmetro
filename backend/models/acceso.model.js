const { pool } = require('../config/db');
const { createModel } = require('./base.model');

const base = createModel({
  table: 'acceso',
  key: 'id_acceso',
  fields: ['nombre', 'id_estacion'],
});

async function lockById(id, db) {
  const [rows] = await db.query('SELECT id_acceso FROM acceso WHERE id_acceso = ? FOR UPDATE', [id]);
  return rows[0] || null;
}

async function findGuardias(id, db = pool) {
  const [rows] = await db.query(
    `SELECT g.id_guardia, g.nombre, g.turno, ag.fecha_asignacion
     FROM acceso_guardia ag
     JOIN guardia g ON g.id_guardia = ag.id_guardia
     WHERE ag.id_acceso = ?
     ORDER BY g.nombre`,
    [id]
  );
  return rows;
}

async function countGuardias(id, db = pool) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM acceso_guardia WHERE id_acceso = ?', [id]);
  return rows[0].total;
}

async function hasGuardia(idAcceso, idGuardia, db = pool) {
  const [rows] = await db.query(
    'SELECT 1 FROM acceso_guardia WHERE id_acceso = ? AND id_guardia = ?',
    [idAcceso, idGuardia]
  );
  return rows.length > 0;
}

async function addGuardia(idAcceso, idGuardia, fechaAsignacion, db = pool) {
  const values = { id_acceso: idAcceso, id_guardia: idGuardia };
  if (fechaAsignacion) values.fecha_asignacion = fechaAsignacion;
  await db.query('INSERT INTO acceso_guardia SET ?', [values]);
}

async function removeGuardia(idAcceso, idGuardia, db = pool) {
  await db.query('DELETE FROM acceso_guardia WHERE id_acceso = ? AND id_guardia = ?', [idAcceso, idGuardia]);
}

async function removeGuardias(idAcceso, db = pool) {
  await db.query('DELETE FROM acceso_guardia WHERE id_acceso = ?', [idAcceso]);
}

module.exports = {
  ...base,
  lockById,
  findGuardias,
  countGuardias,
  hasGuardia,
  addGuardia,
  removeGuardia,
  removeGuardias,
};
