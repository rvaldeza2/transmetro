const { createModel } = require('./base.model');

module.exports = createModel({
  table: 'guardia',
  key: 'id_guardia',
  fields: ['nombre', 'turno'],
});
