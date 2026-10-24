const service = require('../services/parqueo.service');
const { createCrudController } = require('./base.controller');

module.exports = createCrudController(service);
