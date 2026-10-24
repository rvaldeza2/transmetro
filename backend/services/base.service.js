// Error con código HTTP; el manejador de errores de index.js lo convierte en respuesta.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireFields(data, fields) {
  const faltantes = fields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');
  if (faltantes.length > 0) {
    throw new HttpError(400, `Campos obligatorios faltantes: ${faltantes.join(', ')}`);
  }
}

function requireNonNegativeInt(value, campo) {
  const numero = Number(value);
  if (value === undefined || value === null || value === '' || !Number.isInteger(numero) || numero < 0) {
    throw new HttpError(400, `El campo ${campo} debe ser un número entero mayor o igual a 0`);
  }
  return numero;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// Operaciones CRUD comunes sobre un modelo creado con createModel.
function createCrudService(model, { notFound, required = [] }) {
  async function get(id) {
    const row = await model.findById(id);
    if (!row) throw new HttpError(404, notFound);
    return row;
  }

  return {
    list: () => model.findAll(),
    get,

    async create(data) {
      requireFields(data, required);
      const id = await model.create(data);
      return model.findById(id);
    },

    async update(id, data) {
      await get(id);
      await model.update(id, data);
      return model.findById(id);
    },

    async remove(id) {
      await get(id);
      await model.remove(id);
    },
  };
}

module.exports = { HttpError, requireFields, requireNonNegativeInt, round2, createCrudService };
