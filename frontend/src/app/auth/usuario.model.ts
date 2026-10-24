export type Rol = 'ADMINISTRADOR' | 'OPERADOR' | 'CONSULTA';

// Usuario que inició sesión (datos guardados en el token JWT)
export interface Usuario {
  id_usuario: number;
  nombre: string;
  usuario: string;
  rol: Rol;
}

// Datos que se envían al iniciar sesión
export interface LoginDatos {
  usuario: string;
  contrasena: string;
}

// Respuesta del backend al iniciar sesión
export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

// Datos que se envían al crear una cuenta (el rol siempre es CONSULTA)
export interface RegistroDatos {
  nombre: string;
  usuario: string;
  contrasena: string;
  pregunta_seguridad: string;
  respuesta_seguridad: string;
}

// Respuesta del paso 1 de la recuperación de contraseña
export interface PreguntaSeguridad {
  usuario: string;
  pregunta_seguridad: string;
}

// Datos que se envían en el paso 2 de la recuperación de contraseña
export interface RestablecerDatos {
  usuario: string;
  respuesta_seguridad: string;
  nueva_contrasena: string;
}
