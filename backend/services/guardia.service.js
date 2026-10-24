const guardia = require('../models/guardia.model');
const { createCrudService } = require('./base.service');

module.exports = createCrudService(guardia, {
  notFound: 'Guardia no encontrado',
  required: ['nombre'],
});
