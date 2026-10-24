const controller = require('../controllers/acceso.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');
const { crudRouter } = require('./base.routes');

const router = crudRouter(controller);
const administrador = permitir(ROLES.ADMINISTRADOR);

router.post('/:id/guardias', administrador, controller.asignarGuardia);
router.delete('/:id/guardias/:idGuardia', administrador, controller.retirarGuardia);

module.exports = router;
