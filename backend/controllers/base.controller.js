// Acciones CRUD comunes. Express 5 envía al manejador de errores
// cualquier excepción lanzada por una función async.
function createCrudController(service) {
  return {
    async list(req, res) {
      res.json(await service.list());
    },

    async get(req, res) {
      res.json(await service.get(req.params.id));
    },

    async create(req, res) {
      res.status(201).json(await service.create(req.body || {}));
    },

    async update(req, res) {
      res.json(await service.update(req.params.id, req.body || {}));
    },

    async remove(req, res) {
      await service.remove(req.params.id);
      res.status(204).end();
    },
  };
}

module.exports = { createCrudController };
