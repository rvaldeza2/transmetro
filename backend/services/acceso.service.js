const acceso = require('../models/acceso.model');
const { withTransaction } = require('../config/db');
const { HttpError, requireFields, createCrudService } = require('./base.service');

const crud = createCrudService(acceso, {
  notFound: 'Acceso no encontrado',
  required: ['nombre', 'id_estacion'],
});

// RF03 / RF09: el acceso se crea junto con su primer guardia, para que nunca quede sin seguridad
async function create(data) {
  requireFields(data, ['nombre', 'id_estacion', 'id_guardia']);
  const id = await withTransaction(async (conn) => {
    const nuevoId = await acceso.create(data, conn);
    await acceso.addGuardia(nuevoId, data.id_guardia, data.fecha_asignacion, conn);
    return nuevoId;
  });
  return getConGuardias(id);
}

async function update(id, data) {
  return crud.update(id, { nombre: data.nombre, id_estacion: data.id_estacion });
}

async function remove(id) {
  await crud.get(id);
  await withTransaction(async (conn) => {
    await acceso.removeGuardias(id, conn);
    await acceso.remove(id, conn);
  });
}

async function getConGuardias(id) {
  const datos = await crud.get(id);
  const guardias = await acceso.findGuardias(id);
  return { ...datos, guardias };
}

async function asignarGuardia(id, data) {
  requireFields(data, ['id_guardia']);
  await crud.get(id);
  if (await acceso.hasGuardia(id, data.id_guardia)) {
    throw new HttpError(409, 'El guardia ya está asignado a este acceso');
  }
  await acceso.addGuardia(id, data.id_guardia, data.fecha_asignacion);
  return getConGuardias(id);
}

// RF09: no se permite retirar al último guardia de un acceso
async function retirarGuardia(id, idGuardia) {
  await withTransaction(async (conn) => {
    if (!(await acceso.lockById(id, conn))) throw new HttpError(404, 'Acceso no encontrado');
    if (!(await acceso.hasGuardia(id, idGuardia, conn))) {
      throw new HttpError(404, 'El guardia no está asignado a este acceso');
    }
    if ((await acceso.countGuardias(id, conn)) <= 1) {
      throw new HttpError(409, 'Todo acceso debe tener al menos un guardia: asigne otro antes de retirar este');
    }
    await acceso.removeGuardia(id, idGuardia, conn);
  });
  return getConGuardias(id);
}

module.exports = {
  ...crud,
  get: getConGuardias,
  create,
  update,
  remove,
  asignarGuardia,
  retirarGuardia,
};
