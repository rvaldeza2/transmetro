const linea = require('../models/linea.model');
const { withTransaction } = require('../config/db');
const { HttpError, requireFields, createCrudService } = require('./base.service');

const crud = createCrudService(linea, {
  notFound: 'Línea no encontrada',
  required: ['nombre', 'id_municipalidad'],
});

// RF05: buses por línea entre el número de estaciones (mínimo) y el doble (máximo)
function validarBuses(estaciones, buses) {
  const minimo = estaciones;
  const maximo = estaciones * 2;
  return {
    estaciones,
    buses,
    minimo,
    maximo,
    cumple: estaciones > 0 && buses >= minimo && buses <= maximo,
  };
}

// La distancia total no se recibe del cliente: se calcula a partir de las estaciones (RF11)
async function create(data) {
  return crud.create({ nombre: data.nombre, id_municipalidad: data.id_municipalidad, distancia_total_km: 0 });
}

async function update(id, data) {
  return crud.update(id, { nombre: data.nombre, id_municipalidad: data.id_municipalidad });
}

async function getEstaciones(id) {
  const datos = await crud.get(id);
  const estaciones = await linea.findEstaciones(id);
  return { ...datos, estaciones };
}

async function bloquearLinea(id, conn) {
  const bloqueadas = await linea.lockByIds([id], conn);
  if (bloqueadas.length === 0) throw new HttpError(404, 'Línea no encontrada');
}

// RF01 / RF02: agrega una estación a la línea en un orden de recorrido
async function agregarEstacion(id, data) {
  requireFields(data, ['id_estacion', 'orden_visita']);
  await withTransaction(async (conn) => {
    await bloquearLinea(id, conn);
    await linea.addEstacion(id, data, conn);
    await linea.recalcularDistancia(id, conn);
  });
  return getEstaciones(id);
}

async function actualizarEstacion(id, idEstacion, data) {
  await withTransaction(async (conn) => {
    await bloquearLinea(id, conn);
    if (!(await linea.findEstacion(id, idEstacion, conn))) {
      throw new HttpError(404, 'La estación no pertenece a esta línea');
    }
    await linea.updateEstacion(id, idEstacion, data, conn);
    await linea.recalcularDistancia(id, conn);
  });
  return getEstaciones(id);
}

// Quitar una estación reduce el máximo de buses permitido; no puede dejar la línea excedida
async function quitarEstacion(id, idEstacion) {
  await withTransaction(async (conn) => {
    await bloquearLinea(id, conn);
    if (!(await linea.findEstacion(id, idEstacion, conn))) {
      throw new HttpError(404, 'La estación no pertenece a esta línea');
    }
    const estaciones = await linea.countEstaciones(id, conn);
    const buses = await linea.countBuses(id, conn);
    const nuevoMaximo = (estaciones - 1) * 2;
    if (buses > nuevoMaximo) {
      throw new HttpError(409,
        `La línea tiene ${buses} buses y sin esta estación el máximo sería ${nuevoMaximo}. Retire buses primero`);
    }
    await linea.removeEstacion(id, idEstacion, conn);
    await linea.recalcularDistancia(id, conn);
  });
  return getEstaciones(id);
}

// RF07: todos los accesos correspondientes a la línea
async function getAccesos(id) {
  await crud.get(id);
  return linea.findAccesos(id);
}

async function getBuses(id) {
  await crud.get(id);
  return linea.findBuses(id);
}

async function getValidacion(id) {
  const datos = await crud.get(id);
  const estaciones = await linea.countEstaciones(id);
  const buses = await linea.countBuses(id);
  return { id_linea: datos.id_linea, nombre: datos.nombre, ...validarBuses(estaciones, buses) };
}

module.exports = {
  ...crud,
  create,
  update,
  getEstaciones,
  agregarEstacion,
  actualizarEstacion,
  quitarEstacion,
  getAccesos,
  getBuses,
  getValidacion,
  validarBuses,
};
