const parqueo = require('../models/parqueo.model');
const { createCrudService } = require('./base.service');

module.exports = createCrudService(parqueo, {
  notFound: 'Parqueo no encontrado',
  required: ['ubicacion', 'id_estacion'],
});
