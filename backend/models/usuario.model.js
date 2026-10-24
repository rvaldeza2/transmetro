const { pool } = require('../config/db');

async function findByUsuario(usuario, db = pool) {
  const [rows] = await db.query(
    `SELECT id_usuario, nombre, usuario, contrasena, rol, pregunta_seguridad, respuesta_seguridad
     FROM usuario WHERE usuario = ?`,
    [usuario]
  );
  return rows[0] || null;
}

async function create(data, db = pool) {
  const [result] = await db.query('INSERT INTO usuario SET ?', [data]);
  return result.insertId;
}

async function updateContrasena(idUsuario, contrasena, db = pool) {
  await db.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [contrasena, idUsuario]);
}

module.exports = { findByUsuario, create, updateContrasena };
