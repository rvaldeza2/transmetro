const piloto = require('../models/piloto.model');
const { createCrudService } = require('./base.service');

// RF08: historial educativo, residencia y comunicación del piloto
module.exports = createCrudService(piloto, {
  notFound: 'Piloto no encontrado',
  required: ['nombre'],
});
