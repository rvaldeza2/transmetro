const { Router } = require('express');
const controller = require('../controllers/reporte.controller');

const router = Router();

router.get('/lineas', controller.lineas);
router.get('/estaciones', controller.estaciones);
router.get('/buses', controller.buses);
router.get('/accesos-linea', controller.accesosPorLinea);
router.get('/accesos-sin-guardia', controller.accesosSinGuardia);
router.get('/resumen', controller.resumen);

module.exports = router;
