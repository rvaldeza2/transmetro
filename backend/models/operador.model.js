const { createModel } = require('./base.model');

module.exports = createModel({
  table: 'operador',
  key: 'id_operador',
  fields: ['nombre', 'id_estacion'],
});
