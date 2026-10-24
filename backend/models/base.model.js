const { pool } = require('../config/db');

// Toma de `data` solo los campos permitidos que vienen definidos.
function pick(data, fields) {
  return Object.fromEntries(
    fields.filter((field) => data[field] !== undefined).map((field) => [field, data[field]])
  );
}

// Consultas CRUD comunes para una tabla con llave primaria simple.
// Cada función recibe opcionalmente `db` para poder usarse dentro de una transacción.
function createModel({ table, key, fields, orderBy = key }) {
  const columns = [key, ...fields].join(', ');

  return {
    async findAll(db = pool) {
      const [rows] = await db.query(`SELECT ${columns} FROM ${table} ORDER BY ${orderBy}`);
      return rows;
    },

    async findById(id, db = pool) {
      const [rows] = await db.query(`SELECT ${columns} FROM ${table} WHERE ${key} = ?`, [id]);
      return rows[0] || null;
    },

    async create(data, db = pool) {
      const [result] = await db.query(`INSERT INTO ${table} SET ?`, [pick(data, fields)]);
      return result.insertId;
    },

    async update(id, data, db = pool) {
      const values = pick(data, fields);
      if (Object.keys(values).length === 0) return 0;
      const [result] = await db.query(`UPDATE ${table} SET ? WHERE ${key} = ?`, [values, id]);
      return result.affectedRows;
    },

    async remove(id, db = pool) {
      const [result] = await db.query(`DELETE FROM ${table} WHERE ${key} = ?`, [id]);
      return result.affectedRows;
    },
  };
}

module.exports = { createModel, pick };
