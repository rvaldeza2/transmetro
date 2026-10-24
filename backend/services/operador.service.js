const operador = require('../models/operador.model');
const { createCrudService } = require('./base.service');

// RF14: operador asignado a la computadora de cada estación
module.exports = createCrudService(operador, {
  notFound: 'Operador no encontrado',
  required: ['nombre', 'id_estacion'],
});
