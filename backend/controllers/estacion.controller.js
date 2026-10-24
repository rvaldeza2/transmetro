const service = require('../services/estacion.service');
const { createCrudController } = require('./base.controller');

module.exports = {
  ...createCrudController(service),

  async lineas(req, res) {
    res.json(await service.getLineas(req.params.id));
  },

  async accesos(req, res) {
    res.json(await service.getAccesos(req.params.id));
  },

  async evaluarCapacidad(req, res) {
    res.json(await service.evaluarCapacidad(req.params.id, req.body || {}));
  },
};
