const { Router } = require('express');
const controller = require('../controllers/alerta.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.put('/:id/atender', permitir(ROLES.ADMINISTRADOR, ROLES.OPERADOR), controller.atender);

module.exports = router;
