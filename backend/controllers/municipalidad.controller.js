const service = require('../services/municipalidad.service');
const { createCrudController } = require('./base.controller');

module.exports = {
  ...createCrudController(service),

  async reporte(req, res) {
    res.json(await service.reporte(req.params.id));
  },
};
