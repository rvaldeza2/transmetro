const service = require('../services/alerta.service');

module.exports = {
  async list(req, res) {
    res.json(await service.list(req.query));
  },

  async get(req, res) {
    res.json(await service.get(req.params.id));
  },

  async atender(req, res) {
    res.json(await service.atender(req.params.id));
  },
};
