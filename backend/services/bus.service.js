const bus = require('../models/bus.model');
const linea = require('../models/linea.model');
const parqueo = require('../models/parqueo.model');
const alertaService = require('./alerta.service');
const { withTransaction } = require('../config/db');
const {
  HttpError,
  requireFields,
  requireNonNegativeInt,
  round2,
  createCrudService,
} = require('./base.service');

const UMBRAL_OCUPACION_BAJA = 25;
const MINUTOS_ESPERA_ADICIONAL = 5;

const crud = createCrudService(bus, {
  notFound: 'Bus no encontrado',
  required: ['placa', 'capacidad', 'id_parqueo'],
});

// RF05: la línea no puede superar el doble de su número de estaciones
async function verificarCupoLinea(idLinea, conn) {
  const bloqueadas = await linea.lockByIds([idLinea], conn);
  if (bloqueadas.length === 0) throw new HttpError(404, 'Línea no encontrada');

  const estaciones = await linea.countEstaciones(idLinea, conn);
  const buses = await linea.countBuses(idLinea, conn);
  if (estaciones === 0) {
    throw new HttpError(409, 'La línea no tiene estaciones: registre sus estaciones antes de asignar buses');
  }
  if (buses + 1 > estaciones * 2) {
    throw new HttpError(409,
      `La línea ya tiene el máximo de buses permitido (${estaciones * 2}: el doble de sus ${estaciones} estaciones)`);
  }
}

// RF04 / RF06: todo bus se registra con parqueo; la línea es opcional
async function create(data) {
  requireFields(data, ['placa', 'capacidad', 'id_parqueo']);
  const valores = {
    placa: data.placa,
    capacidad: data.capacidad,
    id_parqueo: data.id_parqueo,
    id_linea: data.id_linea ?? null,
  };
  const id = await withTransaction(async (conn) => {
    if (valores.id_linea !== null) await verificarCupoLinea(valores.id_linea, conn);
    return bus.create(valores, conn);
  });
  return bus.findById(id);
}

// La línea y el parqueo se cambian solo por sus operaciones propias, que aplican las reglas
async function update(id, data) {
  return crud.update(id, { placa: data.placa, capacidad: data.capacidad });
}

// RF04: un bus solo puede estar asignado a una línea a la vez (diagrama de actividades 11.3)
async function asignarLinea(id, data) {
  requireFields(data, ['id_linea']);
  const idLinea = Number(data.id_linea);
  await withTransaction(async (conn) => {
    const actual = await bus.lockById(id, conn);
    if (!actual) throw new HttpError(404, 'Bus no encontrado');
    if (actual.id_linea === idLinea) return;
    if (actual.id_linea !== null) {
      throw new HttpError(409,
        `El bus ya está asignado a la línea ${actual.id_linea}: retírelo de esa línea antes de asignarlo a otra`);
    }
    await verificarCupoLinea(idLinea, conn);
    await bus.update(id, { id_linea: idLinea }, conn);
  });
  return bus.findById(id);
}

// RF05: una línea que cumple el mínimo no puede quedar con menos buses que estaciones
// (si la línea todavía no llega al mínimo sí se deja retirar, porque igual ya está incompleta)
async function retirarDeLinea(id) {
  await withTransaction(async (conn) => {
    const actual = await bus.lockById(id, conn);
    if (!actual) throw new HttpError(404, 'Bus no encontrado');
    if (actual.id_linea === null) throw new HttpError(409, 'El bus no tiene línea asignada');

    await linea.lockByIds([actual.id_linea], conn);
    const estaciones = await linea.countEstaciones(actual.id_linea, conn);
    const buses = await linea.countBuses(actual.id_linea, conn);
    if (buses >= estaciones && buses - 1 < estaciones) {
      throw new HttpError(409,
        `La línea quedaría con ${buses - 1} buses y el mínimo es ${estaciones} (uno por estación)`);
    }
    await bus.update(id, { id_linea: null }, conn);
  });
  return bus.findById(id);
}

// RF06: el bus puede cambiar de parqueo, pero nunca quedar sin uno
async function cambiarParqueo(id, data) {
  requireFields(data, ['id_parqueo']);
  await crud.get(id);
  if (!(await parqueo.findById(data.id_parqueo))) throw new HttpError(404, 'Parqueo no encontrado');
  await bus.update(id, { id_parqueo: data.id_parqueo });
  return bus.findById(id);
}

// RF13: si el bus no alcanza el 25% de su capacidad, espera 5 minutos adicionales
function calcularEspera(datos, pasajeros) {
  const porcentaje = round2((pasajeros * 100) / datos.capacidad);
  const esperaAdicional = porcentaje < UMBRAL_OCUPACION_BAJA ? MINUTOS_ESPERA_ADICIONAL : 0;
  return {
    id_bus: datos.id_bus,
    placa: datos.placa,
    capacidad: datos.capacidad,
    pasajeros,
    porcentaje,
    espera_adicional_min: esperaAdicional,
    mensaje: esperaAdicional > 0
      ? `Ocupación de ${porcentaje}%: el bus debe esperar ${esperaAdicional} minutos adicionales`
      : 'Ocupación suficiente: el bus continúa su recorrido',
  };
}

// La espera adicional queda guardada en el historial de alertas
async function registrarAlertaEspera(resultado, idEstacion, db) {
  if (resultado.espera_adicional_min === 0) return;
  await alertaService.registrar({
    tipo: alertaService.TIPOS.ESPERA,
    id_estacion: idEstacion,
    id_bus: resultado.id_bus,
    pasajeros: resultado.pasajeros,
    porcentaje: resultado.porcentaje,
    mensaje: resultado.mensaje,
  }, db);
}

async function evaluarEspera(id, data) {
  const pasajeros = requireNonNegativeInt(data.pasajeros, 'pasajeros');
  const resultado = calcularEspera(await crud.get(id), pasajeros);
  await registrarAlertaEspera(resultado, null);
  return resultado;
}

module.exports = {
  ...crud,
  create,
  update,
  asignarLinea,
  retirarDeLinea,
  cambiarParqueo,
  evaluarEspera,
  calcularEspera,
  registrarAlertaEspera,
};
