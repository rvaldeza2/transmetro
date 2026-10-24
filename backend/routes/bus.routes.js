const controller = require('../controllers/bus.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');
const { crudRouter } = require('./base.routes');

const router = crudRouter(controller);
const administrador = permitir(ROLES.ADMINISTRADOR);
const administradorOperador = permitir(ROLES.ADMINISTRADOR, ROLES.OPERADOR);

router.put('/:id/linea', administrador, controller.asignarLinea);
router.delete('/:id/linea', administrador, controller.retirarDeLinea);
router.put('/:id/parqueo', administradorOperador, controller.cambiarParqueo);
router.post('/:id/evaluar-espera', administradorOperador, controller.evaluarEspera);

module.exports = router;
