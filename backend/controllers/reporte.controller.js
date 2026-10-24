const service = require('../services/reporte.service');

module.exports = {
  async lineas(req, res) {
    res.json(await service.lineas());
  },

  async estaciones(req, res) {
    res.json(await service.estaciones());
  },

  async buses(req, res) {
    res.json(await service.buses());
  },

  async accesosPorLinea(req, res) {
    res.json(await service.accesosPorLinea());
  },

  async accesosSinGuardia(req, res) {
    res.json(await service.accesosSinGuardia());
  },

  async resumen(req, res) {
    res.json(await service.resumen());
  },
};
