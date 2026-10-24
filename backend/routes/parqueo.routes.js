const controller = require('../controllers/parqueo.controller');
const { ROLES } = require('../services/auth.service');
const { crudRouter } = require('./base.routes');

// El operador de estación también registra parqueos (diagrama de casos de uso)
module.exports = crudRouter(controller, [ROLES.ADMINISTRADOR, ROLES.OPERADOR]);
