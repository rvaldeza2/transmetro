const service = require('../services/auth.service');
const { HttpError } = require('../services/base.service');

async function login(req, res) {
  res.json(await service.login(req.body || {}));
}

async function registrar(req, res) {
  res.status(201).json(await service.registrar(req.body || {}));
}

async function preguntaSeguridad(req, res) {
  res.json(await service.preguntaSeguridad(req.body || {}));
}

async function restablecerContrasena(req, res) {
  res.json(await service.restablecerContrasena(req.body || {}));
}

async function perfil(req, res) {
  res.json(req.usuario);
}

// Exige el encabezado "Authorization: Bearer <token>" y guarda el usuario en req.usuario
function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Debe iniciar sesión para usar el sistema');
  }
  req.usuario = service.verificarToken(token);
  next();
}

// RNF04: solo deja pasar a los roles indicados
function permitir(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new HttpError(403, 'Su rol no tiene permiso para realizar esta acción');
    }
    next();
  };
}

module.exports = { login, registrar, preguntaSeguridad, restablecerContrasena, perfil, autenticar, permitir };
