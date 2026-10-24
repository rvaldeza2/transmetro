const controller = require('../controllers/operador.controller');
const { crudRouter } = require('./base.routes');

module.exports = crudRouter(controller);
