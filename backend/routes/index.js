const { Router } = require('express');
const { autenticar } = require('../controllers/auth.controller');

const router = Router();

router.use('/auth', require('./auth.routes'));

// Todas las rutas siguientes requieren haber iniciado sesión
router.use(autenticar);

router.use('/municipalidades', require('./municipalidad.routes'));
router.use('/lineas', require('./linea.routes'));
router.use('/estaciones', require('./estacion.routes'));
router.use('/accesos', require('./acceso.routes'));
router.use('/guardias', require('./guardia.routes'));
router.use('/parqueos', require('./parqueo.routes'));
router.use('/buses', require('./bus.routes'));
router.use('/pilotos', require('./piloto.routes'));
router.use('/operadores', require('./operador.routes'));
router.use('/visitas', require('./visita.routes'));
router.use('/alertas', require('./alerta.routes'));
router.use('/reportes', require('./reporte.routes'));

module.exports = router;
