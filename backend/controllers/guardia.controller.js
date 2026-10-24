const service = require('../services/guardia.service');
const { createCrudController } = require('./base.controller');

module.exports = createCrudController(service);
