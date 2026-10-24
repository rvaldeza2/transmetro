const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuario = require('../models/usuario.model');
const { HttpError, requireFields } = require('./base.service');

const ROLES = { ADMINISTRADOR: 'ADMINISTRADOR', OPERADOR: 'OPERADOR', CONSULTA: 'CONSULTA' };

const LONGITUD_MINIMA_CONTRASENA = 8;
const INTENTOS_RECUPERACION = 5;
const BLOQUEO_RECUPERACION_MS = 15 * 60 * 1000;

function crearSesion(encontrado) {
  const datos = {
    id_usuario: encontrado.id_usuario,
    nombre: encontrado.nombre,
    usuario: encontrado.usuario,
    rol: encontrado.rol,
  };
  const token = jwt.sign(datos, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRA || '8h' });
  return { token, usuario: datos };
}

// La respuesta de seguridad no distingue mayúsculas ni espacios al inicio o al final
// (así "Azul", "azul" o " AZUL " se toman igual, que si no uno se traba solo por una mayúscula)
function normalizarRespuesta(respuesta) {
  return String(respuesta).trim().toLowerCase();
}

function validarContrasena(contrasena) {
  if (String(contrasena).length < LONGITUD_MINIMA_CONTRASENA) {
    throw new HttpError(400, `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`);
  }
}

// RNF04: valida usuario y contraseña (bcrypt) y entrega un token JWT con el rol
async function login(data) {
  requireFields(data, ['usuario', 'contrasena']);
  const encontrado = await usuario.findByUsuario(data.usuario);
  const valida = encontrado && (await bcrypt.compare(data.contrasena, encontrado.contrasena));
  if (!valida) throw new HttpError(401, 'Usuario o contraseña incorrectos');
  return crearSesion(encontrado);
}

// Registro público: toda cuenta nueva es de CONSULTA; el administrador asigna otros roles.
// No dejamos escoger el rol en el formulario, si no cualquiera se registraría como administrador.
async function registrar(data) {
  requireFields(data, ['nombre', 'usuario', 'contrasena', 'pregunta_seguridad', 'respuesta_seguridad']);
  validarContrasena(data.contrasena);
  const nombreUsuario = String(data.usuario).trim();
  if (await usuario.findByUsuario(nombreUsuario)) {
    throw new HttpError(409, 'El nombre de usuario ya está en uso');
  }
  const id = await usuario.create({
    nombre: String(data.nombre).trim(),
    usuario: nombreUsuario,
    contrasena: await bcrypt.hash(data.contrasena, 10),
    rol: ROLES.CONSULTA,
    pregunta_seguridad: String(data.pregunta_seguridad).trim(),
    respuesta_seguridad: await bcrypt.hash(normalizarRespuesta(data.respuesta_seguridad), 10),
  });
  return crearSesion({ id_usuario: id, nombre: String(data.nombre).trim(), usuario: nombreUsuario, rol: ROLES.CONSULTA });
}

// Paso 1 de la recuperación: devuelve la pregunta de seguridad del usuario
async function preguntaSeguridad(data) {
  requireFields(data, ['usuario']);
  const encontrado = await usuario.findByUsuario(data.usuario);
  if (!encontrado || !encontrado.pregunta_seguridad) {
    throw new HttpError(404, 'El usuario no existe o no tiene una pregunta de seguridad registrada');
  }
  return { usuario: encontrado.usuario, pregunta_seguridad: encontrado.pregunta_seguridad };
}

// Intentos fallidos por usuario, para frenar que se adivine la respuesta a fuerza bruta.
// Se guarda en memoria: si el servidor se reinicia el contador vuelve a cero, para el alcance
// del proyecto es suficiente.
const intentosFallidos = new Map();

function verificarBloqueo(nombreUsuario) {
  const registro = intentosFallidos.get(nombreUsuario);
  if (!registro) return;
  if (Date.now() - registro.desde > BLOQUEO_RECUPERACION_MS) {
    intentosFallidos.delete(nombreUsuario);
  } else if (registro.intentos >= INTENTOS_RECUPERACION) {
    throw new HttpError(429, 'Demasiados intentos fallidos; espere 15 minutos e intente de nuevo');
  }
}

function registrarFallo(nombreUsuario) {
  const registro = intentosFallidos.get(nombreUsuario) ?? { intentos: 0, desde: Date.now() };
  registro.intentos += 1;
  intentosFallidos.set(nombreUsuario, registro);
}

// Paso 2 de la recuperación: con la respuesta correcta se asigna una contraseña nueva
async function restablecerContrasena(data) {
  requireFields(data, ['usuario', 'respuesta_seguridad', 'nueva_contrasena']);
  validarContrasena(data.nueva_contrasena);
  verificarBloqueo(data.usuario);

  const encontrado = await usuario.findByUsuario(data.usuario);
  const valida = encontrado?.respuesta_seguridad
    && (await bcrypt.compare(normalizarRespuesta(data.respuesta_seguridad), encontrado.respuesta_seguridad));
  if (!valida) {
    registrarFallo(data.usuario);
    throw new HttpError(401, 'La respuesta de seguridad no es correcta');
  }

  intentosFallidos.delete(data.usuario);
  await usuario.updateContrasena(encontrado.id_usuario, await bcrypt.hash(data.nueva_contrasena, 10));
  return { mensaje: 'Contraseña actualizada; ya puede iniciar sesión' };
}

// Devuelve los datos del usuario guardados en el token, o lanza 401 si no es válido
function verificarToken(token) {
  try {
    const { id_usuario, nombre, usuario: nombreUsuario, rol } = jwt.verify(token, process.env.JWT_SECRET);
    return { id_usuario, nombre, usuario: nombreUsuario, rol };
  } catch {
    throw new HttpError(401, 'La sesión no es válida o ha expirado; inicie sesión nuevamente');
  }
}

module.exports = { ROLES, login, registrar, preguntaSeguridad, restablecerContrasena, verificarToken };
