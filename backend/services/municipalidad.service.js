const municipalidad = require('../models/municipalidad.model');
const { createCrudService } = require('./base.service');

const crud = createCrudService(municipalidad, {
  notFound: 'Municipalidad no encontrada',
  required: ['nombre'],
});

// RF10: líneas, estaciones y buses que corresponden a la municipalidad
async function reporte(id) {
  const datos = await crud.get(id);
  const lineas = await municipalidad.findLineas(id);
  const estaciones = await municipalidad.findEstaciones(id);
  const buses = lineas.reduce((total, linea) => total + linea.buses, 0);
  return { ...datos, total_buses: buses, lineas, estaciones };
}

module.exports = { ...crud, reporte };
