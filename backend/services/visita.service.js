const visita = require('../models/visita.model');
const bus = require('../models/bus.model');
const linea = require('../models/linea.model');
const busService = require('./bus.service');
const { withTransaction } = require('../config/db');
const { HttpError, requireFields, requireNonNegativeInt } = require('./base.service');

function list(query = {}) {
  if (query.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(query.fecha)) {
    throw new HttpError(400, 'La fecha debe tener el formato AAAA-MM-DD');
  }
  return visita.findAll({ id_bus: query.id_bus, fecha: query.fecha });
}

async function get(id) {
  const row = await visita.findById(id);
  if (!row) throw new HttpError(404, 'Visita no encontrada');
  return row;
}

// Esto cubre el punto del enunciado de "las visitas que cada unidad vaya a realizar en el recorrido".
// Registra la llegada de un bus a una estación de su línea durante el recorrido
// y aplica la regla de espera adicional (RF13) con los pasajeros a bordo
async function create(data) {
  requireFields(data, ['id_bus', 'id_estacion', 'pasajeros']);
  const pasajeros = requireNonNegativeInt(data.pasajeros, 'pasajeros');

  const id = await withTransaction(async (conn) => {
    const datosBus = await bus.findById(data.id_bus, conn);
    if (!datosBus) throw new HttpError(404, 'Bus no encontrado');
    if (datosBus.id_linea === null) {
      throw new HttpError(409, 'El bus no tiene línea asignada: no puede realizar recorridos');
    }
    if (!(await linea.findEstacion(datosBus.id_linea, data.id_estacion, conn))) {
      throw new HttpError(409, `La estación no pertenece a la ruta de la ${datosBus.linea}`);
    }

    // Se reutiliza el mismo cálculo del 25% que usa la pantalla de buses, para no repetir la regla
    const espera = busService.calcularEspera(datosBus, pasajeros);
    const idVisita = await visita.create({
      id_bus: datosBus.id_bus,
      id_estacion: data.id_estacion,
      pasajeros,
      espera_adicional_min: espera.espera_adicional_min,
    }, conn);
    await busService.registrarAlertaEspera(espera, data.id_estacion, conn);
    return idVisita;
  });
  return visita.findById(id);
}

async function remove(id) {
  await get(id);
  await visita.remove(id);
}

module.exports = { list, get, create, remove };
