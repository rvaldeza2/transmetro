const service = require('../services/visita.service');

module.exports = {
  async list(req, res) {
    res.json(await service.list(req.query));
  },

  async get(req, res) {
    res.json(await service.get(req.params.id));
  },

  async create(req, res) {
    res.status(201).json(await service.create(req.body || {}));
  },

  async remove(req, res) {
    await service.remove(req.params.id);
    res.status(204).end();
  },
};
