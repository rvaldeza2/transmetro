const { pool } = require('../config/db');
const { createModel, pick } = require('./base.model');

const base = createModel({
  table: 'linea',
  key: 'id_linea',
  fields: ['nombre', 'distancia_total_km', 'id_municipalidad'],
});

// Bloquea las líneas indicadas hasta terminar la transacción.
// Evita que dos peticiones simultáneas superen los límites de buses.
async function lockByIds(ids, db) {
  const [rows] = await db.query(
    'SELECT id_linea FROM linea WHERE id_linea IN (?) ORDER BY id_linea FOR UPDATE',
    [ids]
  );
  return rows.map((row) => row.id_linea);
}

async function countEstaciones(id, db = pool) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM linea_estacion WHERE id_linea = ?', [id]);
  return rows[0].total;
}

async function countBuses(id, db = pool) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM bus WHERE id_linea = ?', [id]);
  return rows[0].total;
}

// RF01 / RF11: estaciones en orden de recorrido con la distancia acumulada
async function findEstaciones(id, db = pool) {
  const [rows] = await db.query(
    `SELECT le.orden_visita, e.id_estacion, e.nombre, le.distancia_siguiente_km,
            COALESCE(SUM(le.distancia_siguiente_km) OVER (
                ORDER BY le.orden_visita ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS km_desde_inicio
     FROM linea_estacion le
     JOIN estacion e ON e.id_estacion = le.id_estacion
     WHERE le.id_linea = ?
     ORDER BY le.orden_visita`,
    [id]
  );
  return rows;
}

async function findEstacion(idLinea, idEstacion, db = pool) {
  const [rows] = await db.query(
    'SELECT * FROM linea_estacion WHERE id_linea = ? AND id_estacion = ?',
    [idLinea, idEstacion]
  );
  return rows[0] || null;
}

async function addEstacion(idLinea, data, db = pool) {
  const values = pick(data, ['id_estacion', 'orden_visita', 'distancia_siguiente_km']);
  await db.query('INSERT INTO linea_estacion SET ?', [{ ...values, id_linea: idLinea }]);
}

async function updateEstacion(idLinea, idEstacion, data, db = pool) {
  const values = pick(data, ['orden_visita', 'distancia_siguiente_km']);
  if (Object.keys(values).length === 0) return 0;
  const [result] = await db.query(
    'UPDATE linea_estacion SET ? WHERE id_linea = ? AND id_estacion = ?',
    [values, idLinea, idEstacion]
  );
  return result.affectedRows;
}

async function removeEstacion(idLinea, idEstacion, db = pool) {
  await db.query('DELETE FROM linea_estacion WHERE id_linea = ? AND id_estacion = ?', [idLinea, idEstacion]);
}

// RF11: la distancia total es la suma de las distancias entre estaciones consecutivas
async function recalcularDistancia(id, db = pool) {
  await db.query(
    `UPDATE linea
     SET distancia_total_km = (SELECT COALESCE(SUM(distancia_siguiente_km), 0)
                               FROM linea_estacion WHERE id_linea = ?)
     WHERE id_linea = ?`,
    [id, id]
  );
}

// RF07: todos los accesos de una línea con sus guardias
async function findAccesos(id, db = pool) {
  const [rows] = await db.query(
    `SELECT le.orden_visita, e.id_estacion, e.nombre AS estacion,
            a.id_acceso, a.nombre AS acceso,
            COUNT(g.id_guardia) AS num_guardias,
            GROUP_CONCAT(g.nombre ORDER BY g.nombre SEPARATOR ', ') AS guardias
     FROM linea_estacion le
     JOIN estacion e            ON e.id_estacion = le.id_estacion
     JOIN acceso a              ON a.id_estacion = e.id_estacion
     LEFT JOIN acceso_guardia ag ON ag.id_acceso = a.id_acceso
     LEFT JOIN guardia g        ON g.id_guardia = ag.id_guardia
     WHERE le.id_linea = ?
     GROUP BY le.orden_visita, e.id_estacion, e.nombre, a.id_acceso, a.nombre
     ORDER BY le.orden_visita, a.id_acceso`,
    [id]
  );
  return rows;
}

async function findBuses(id, db = pool) {
  const [rows] = await db.query(
    `SELECT b.id_bus, b.placa, b.capacidad, b.id_parqueo, p.ubicacion AS parqueo
     FROM bus b
     JOIN parqueo p ON p.id_parqueo = b.id_parqueo
     WHERE b.id_linea = ?
     ORDER BY b.placa`,
    [id]
  );
  return rows;
}

module.exports = {
  ...base,
  lockByIds,
  countEstaciones,
  countBuses,
  findEstaciones,
  findEstacion,
  addEstacion,
  updateEstacion,
  removeEstacion,
  recalcularDistancia,
  findAccesos,
  findBuses,
};
