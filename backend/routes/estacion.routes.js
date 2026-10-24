const controller = require('../controllers/estacion.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');
const { crudRouter } = require('./base.routes');

const router = crudRouter(controller);

router.get('/:id/lineas', controller.lineas);
router.get('/:id/accesos', controller.accesos);
router.post('/:id/evaluar-capacidad', permitir(ROLES.ADMINISTRADOR, ROLES.OPERADOR), controller.evaluarCapacidad);

module.exports = router;
