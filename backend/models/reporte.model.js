const { pool } = require('../config/db');

// RF15: consultas consolidadas de líneas, estaciones y buses

async function lineas(db = pool) {
  const [rows] = await db.query(
    `SELECT l.id_linea, l.nombre AS linea, m.nombre AS municipalidad, l.distancia_total_km,
            (SELECT COUNT(*) FROM linea_estacion le WHERE le.id_linea = l.id_linea) AS estaciones,
            (SELECT COUNT(*) FROM bus b WHERE b.id_linea = l.id_linea)              AS buses
     FROM linea l
     JOIN municipalidad m ON m.id_municipalidad = l.id_municipalidad
     ORDER BY l.id_linea`
  );
  return rows;
}

async function estaciones(db = pool) {
  const [rows] = await db.query(
    `SELECT e.id_estacion, e.nombre AS estacion, m.nombre AS municipalidad,
            (SELECT GROUP_CONCAT(l.nombre ORDER BY l.nombre SEPARATOR ', ')
               FROM linea_estacion le JOIN linea l ON l.id_linea = le.id_linea
              WHERE le.id_estacion = e.id_estacion)                                AS lineas,
            (SELECT COUNT(*) FROM acceso a WHERE a.id_estacion = e.id_estacion)   AS accesos,
            (SELECT COUNT(*) FROM acceso a
              WHERE a.id_estacion = e.id_estacion
                AND NOT EXISTS (SELECT 1 FROM acceso_guardia ag WHERE ag.id_acceso = a.id_acceso)) AS accesos_sin_guardia,
            (SELECT COUNT(DISTINCT ag.id_guardia)
               FROM acceso a JOIN acceso_guardia ag ON ag.id_acceso = a.id_acceso
              WHERE a.id_estacion = e.id_estacion)                                AS guardias,
            (SELECT COUNT(*) FROM operador o WHERE o.id_estacion = e.id_estacion) AS operadores,
            (SELECT COUNT(*) FROM parqueo p WHERE p.id_estacion = e.id_estacion)  AS parqueos,
            (SELECT COUNT(*) FROM bus b JOIN linea_estacion le ON le.id_linea = b.id_linea
              WHERE le.id_estacion = e.id_estacion)                               AS buses_que_la_atienden
     FROM estacion e
     JOIN municipalidad m ON m.id_municipalidad = e.id_municipalidad
     ORDER BY e.id_estacion`
  );
  return rows;
}

async function buses(db = pool) {
  const [rows] = await db.query(
    `SELECT b.id_bus, b.placa, b.capacidad,
            l.nombre    AS linea,
            p.ubicacion AS parqueo,
            e.nombre    AS estacion_parqueo,
            (SELECT GROUP_CONCAT(pi.nombre ORDER BY pi.nombre SEPARATOR ', ')
               FROM piloto pi WHERE pi.id_bus = b.id_bus) AS pilotos
     FROM bus b
     LEFT JOIN linea l ON l.id_linea = b.id_linea
     JOIN parqueo p    ON p.id_parqueo = b.id_parqueo
     JOIN estacion e   ON e.id_estacion = p.id_estacion
     ORDER BY b.id_bus`
  );
  return rows;
}

// RF07: todos los accesos de cada línea, en el orden de recorrido
async function accesosPorLinea(db = pool) {
  const [rows] = await db.query(
    `SELECT l.id_linea, l.nombre AS linea, le.orden_visita, e.nombre AS estacion,
            a.id_acceso, a.nombre AS acceso,
            COUNT(ag.id_guardia) AS num_guardias
     FROM linea l
     JOIN linea_estacion le      ON le.id_linea = l.id_linea
     JOIN estacion e             ON e.id_estacion = le.id_estacion
     JOIN acceso a               ON a.id_estacion = e.id_estacion
     LEFT JOIN acceso_guardia ag ON ag.id_acceso = a.id_acceso
     GROUP BY l.id_linea, l.nombre, le.orden_visita, e.nombre, a.id_acceso, a.nombre
     ORDER BY l.id_linea, le.orden_visita, a.id_acceso`
  );
  return rows;
}

// Regla de negocio: toda estación debe tener al menos un guardia por acceso
async function accesosSinGuardia(db = pool) {
  const [rows] = await db.query(
    `SELECT a.id_acceso, a.nombre AS acceso, e.id_estacion, e.nombre AS estacion,
            m.nombre AS municipalidad
     FROM acceso a
     JOIN estacion e      ON e.id_estacion = a.id_estacion
     JOIN municipalidad m ON m.id_municipalidad = e.id_municipalidad
     WHERE NOT EXISTS (SELECT 1 FROM acceso_guardia ag WHERE ag.id_acceso = a.id_acceso)
     ORDER BY e.nombre, a.nombre`
  );
  return rows;
}

// Totales para el panel de inicio; se hace en una sola consulta con subconsultas
// para no pegarle varias veces a la base cada vez que alguien entra al sistema
async function resumen(db = pool) {
  const [rows] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM municipalidad)                          AS municipalidades,
       (SELECT COUNT(*) FROM linea)                                  AS lineas,
       (SELECT COUNT(*) FROM estacion)                               AS estaciones,
       (SELECT COUNT(*) FROM acceso)                                 AS accesos,
       (SELECT COUNT(*) FROM bus)                                    AS buses,
       (SELECT COUNT(*) FROM bus WHERE id_linea IS NULL)             AS buses_sin_linea,
       (SELECT COUNT(*) FROM piloto)                                 AS pilotos,
       (SELECT COUNT(*) FROM guardia)                                AS guardias,
       (SELECT COUNT(*) FROM acceso a
         WHERE NOT EXISTS (SELECT 1 FROM acceso_guardia ag
                            WHERE ag.id_acceso = a.id_acceso))       AS accesos_sin_guardia,
       (SELECT COUNT(*) FROM visita WHERE DATE(fecha_hora) = CURDATE()) AS visitas_hoy,
       (SELECT COUNT(*) FROM alerta WHERE DATE(fecha_hora) = CURDATE()) AS alertas_hoy,
       (SELECT COUNT(*) FROM alerta WHERE atendida = FALSE)          AS alertas_pendientes`
  );
  return rows[0];
}

module.exports = { lineas, estaciones, buses, accesosPorLinea, accesosSinGuardia, resumen };
