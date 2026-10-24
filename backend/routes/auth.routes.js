const { Router } = require('express');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post('/login', controller.login);
router.post('/registro', controller.registrar);
router.post('/recuperar/pregunta', controller.preguntaSeguridad);
router.post('/recuperar', controller.restablecerContrasena);
router.get('/perfil', controller.autenticar, controller.perfil);

module.exports = router;
