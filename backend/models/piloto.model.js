const { createModel } = require('./base.model');

module.exports = createModel({
  table: 'piloto',
  key: 'id_piloto',
  fields: ['nombre', 'historial_educativo', 'residencia', 'telefono', 'id_bus'],
});
