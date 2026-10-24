const service = require('../services/piloto.service');
const { createCrudController } = require('./base.controller');

module.exports = createCrudController(service);
