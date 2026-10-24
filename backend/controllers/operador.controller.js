const service = require('../services/operador.service');
const { createCrudController } = require('./base.controller');

module.exports = createCrudController(service);
