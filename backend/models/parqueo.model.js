const { createModel } = require('./base.model');

module.exports = createModel({
  table: 'parqueo',
  key: 'id_parqueo',
  fields: ['ubicacion', 'id_estacion'],
});
