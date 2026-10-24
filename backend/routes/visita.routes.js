const { Router } = require('express');
const controller = require('../controllers/visita.controller');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', permitir(ROLES.ADMINISTRADOR, ROLES.OPERADOR), controller.create);
router.delete('/:id', permitir(ROLES.ADMINISTRADOR), controller.remove);

module.exports = router;
