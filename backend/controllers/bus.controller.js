const service = require('../services/bus.service');
const { createCrudController } = require('./base.controller');

module.exports = {
  ...createCrudController(service),

  async asignarLinea(req, res) {
    res.json(await service.asignarLinea(req.params.id, req.body || {}));
  },

  async retirarDeLinea(req, res) {
    res.json(await service.retirarDeLinea(req.params.id));
  },

  async cambiarParqueo(req, res) {
    res.json(await service.cambiarParqueo(req.params.id, req.body || {}));
  },

  async evaluarEspera(req, res) {
    res.json(await service.evaluarEspera(req.params.id, req.body || {}));
  },
};
