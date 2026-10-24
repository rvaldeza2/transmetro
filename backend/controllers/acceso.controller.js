const service = require('../services/acceso.service');
const { createCrudController } = require('./base.controller');

module.exports = {
  ...createCrudController(service),

  async asignarGuardia(req, res) {
    res.status(201).json(await service.asignarGuardia(req.params.id, req.body || {}));
  },

  async retirarGuardia(req, res) {
    res.json(await service.retirarGuardia(req.params.id, req.params.idGuardia));
  },
};
