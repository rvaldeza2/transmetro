const controller = require('../controllers/municipalidad.controller');
const { crudRouter } = require('./base.routes');

const router = crudRouter(controller);

router.get('/:id/reporte', controller.reporte);

module.exports = router;
