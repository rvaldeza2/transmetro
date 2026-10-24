const service = require('../services/linea.service');
const { createCrudController } = require('./base.controller');

module.exports = {
  ...createCrudController(service),

  async estaciones(req, res) {
    res.json(await service.getEstaciones(req.params.id));
  },

  async agregarEstacion(req, res) {
    res.status(201).json(await service.agregarEstacion(req.params.id, req.body || {}));
  },

  async actualizarEstacion(req, res) {
    res.json(await service.actualizarEstacion(req.params.id, req.params.idEstacion, req.body || {}));
  },

  async quitarEstacion(req, res) {
    res.json(await service.quitarEstacion(req.params.id, req.params.idEstacion));
  },

  async accesos(req, res) {
    res.json(await service.getAccesos(req.params.id));
  },

  async buses(req, res) {
    res.json(await service.getBuses(req.params.id));
  },

  async validacion(req, res) {
    res.json(await service.getValidacion(req.params.id));
  },
};
