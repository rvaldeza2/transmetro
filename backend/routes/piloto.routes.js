const controller = require('../controllers/piloto.controller');
const { crudRouter } = require('./base.routes');

module.exports = crudRouter(controller);
