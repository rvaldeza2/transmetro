require('dotenv').config({ quiet: true });

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env (ver .env.example)');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const { aplicarMigraciones } = require('./config/migraciones');
const routes = require('./routes');
const { HttpError } = require('./services/base.service');

const app = express();

app.use(cors());
app.use(express.json());

// Build de Angular servido por la misma API (así se despliega en Render)
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'dist', 'transmetro', 'browser');
const hayFrontend = fs.existsSync(path.join(FRONTEND_DIR, 'index.html'));

// index.html no se guarda en caché para que el navegador siempre pida la versión más reciente;
// los .js y .css llevan un hash en el nombre, así que esos sí se pueden guardar
function sinCache(res) {
  res.set('Cache-Control', 'no-cache');
}
if (hayFrontend) {
  app.use(express.static(FRONTEND_DIR, {
    setHeaders(res, archivo) {
      if (archivo.endsWith('index.html')) sinCache(res);
    },
  }));
}

app.get('/', (req, res) => {
  res.json({ nombre: 'API del Sistema de Control para el Transmetro', version: '1.0.0' });
});

app.use('/api', routes);

// Cualquier otra ruta GET pertenece al router de Angular. Un archivo con extensión que no
// existe (por ejemplo un .js de una versión anterior) responde 404: si se le mandara el
// index.html, el navegador no podría ejecutarlo y la pantalla quedaría en blanco
if (hayFrontend) {
  app.get('/{*ruta}', (req, res, next) => {
    if (path.extname(req.path)) return next();
    sinCache(res);
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Errores de MySQL traducidos a respuestas claras para el cliente
const MYSQL_ERRORS = {
  ER_DUP_ENTRY: [409, 'Ya existe un registro con ese valor'],
  ER_ROW_IS_REFERENCED_2: [409, 'No se puede eliminar: el registro está siendo utilizado por otros datos'],
  ER_NO_REFERENCED_ROW_2: [400, 'Uno de los identificadores relacionados no existe'],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, 'Un valor no cumple las restricciones permitidas'],
  ER_BAD_NULL_ERROR: [400, 'Falta un campo obligatorio'],
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: [400, 'Un valor tiene un formato inválido'],
  ER_DATA_TOO_LONG: [400, 'Un valor excede la longitud permitida'],
};

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  const mysqlError = MYSQL_ERRORS[err.code];
  if (mysqlError) {
    return res.status(mysqlError[0]).json({ error: mysqlError[1] });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = Number(process.env.PORT) || 3000;

// La base se revisa y se migra antes de recibir peticiones, para que nadie
// entre al sistema mientras faltan columnas o tablas
async function prepararBase() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL establecida');
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    return;
  }
  try {
    if (await aplicarMigraciones()) console.log('Migración v2 aplicada a la base de datos');
  } catch (err) {
    console.error('No se pudo aplicar la migración de la base de datos:', err.message);
  }
}

prepararBase().then(() => {
  app.listen(PORT, (error) => {
    if (error) {
      console.error(`No se pudo iniciar la API en el puerto ${PORT}:`, error.message);
      process.exit(1);
    }
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
});
