const { Router } = require('express');
const { permitir } = require('../controllers/auth.controller');
const { ROLES } = require('../services/auth.service');

// Crea un router con las rutas CRUD estándar de un controlador.
// Consultar está permitido a todo usuario con sesión; crear, editar y eliminar
// solo a los roles indicados (por defecto, el administrador).
function crudRouter(controller, rolesEscritura = [ROLES.ADMINISTRADOR]) {
  const router = Router();
  const escribir = permitir(...rolesEscritura);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', escribir, controller.create);
  router.put('/:id', escribir, controller.update);
  router.delete('/:id', escribir, controller.remove);
  return router;
}

module.exports = { crudRouter };
