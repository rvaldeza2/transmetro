const controller = require('../controllers/guardia.controller');
const { crudRouter } = require('./base.routes');

module.exports = crudRouter(controller);
