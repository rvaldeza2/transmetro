const controller = require('../controllers/linea.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');
const { crudRouter } = require('./base.routes');

const router = crudRouter(controller);
const administrador = permitir(ROLES.ADMINISTRADOR);

router.get('/:id/estaciones', controller.estaciones);
router.post('/:id/estaciones', administrador, controller.agregarEstacion);
router.put('/:id/estaciones/:idEstacion', administrador, controller.actualizarEstacion);
router.delete('/:id/estaciones/:idEstacion', administrador, controller.quitarEstacion);
router.get('/:id/accesos', controller.accesos);
router.get('/:id/buses', controller.buses);
router.get('/:id/validacion', controller.validacion);

module.exports = router;
