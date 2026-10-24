const alerta = require('../models/alerta.model');
const { HttpError } = require('./base.service');

const TIPOS = { SOBRECUPO: 'SOBRECUPO', ESPERA: 'ESPERA' };

// Historial de las alertas que generan las reglas de capacidad (RF12) y de espera (RF13)
async function registrar({ tipo, id_estacion = null, id_bus = null, pasajeros, porcentaje = null, mensaje }, db) {
  return alerta.create({ tipo, id_estacion, id_bus, pasajeros, porcentaje, mensaje }, db);
}

function list(query = {}) {
  const filtros = {};
  if (query.tipo) {
    if (!TIPOS[query.tipo]) throw new HttpError(400, 'El tipo debe ser SOBRECUPO o ESPERA');
    filtros.tipo = query.tipo;
  }
  if (query.atendida === 'true' || query.atendida === 'false') filtros.atendida = query.atendida === 'true';
  return alerta.findAll(filtros);
}

async function get(id) {
  const row = await alerta.findById(id);
  if (!row) throw new HttpError(404, 'Alerta no encontrada');
  return row;
}

async function atender(id) {
  await get(id);
  await alerta.marcarAtendida(id);
  return alerta.findById(id);
}

module.exports = { TIPOS, registrar, list, get, atender };
