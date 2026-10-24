import { HttpErrorResponse } from '@angular/common/http';

// En desarrollo (ng serve) se usa la API local; en producción el backend sirve el frontend.
// Con esto no hay que cambiar la URL a mano cada vez que se sube a Render.
export const API_URL = location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Cuerpo de las respuestas de error del backend
export interface ErrorApi {
  error: string;
}

// Obtiene el mensaje de error que envía el backend
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor';
    const cuerpo: ErrorApi | null = error.error;
    return cuerpo?.error ?? 'Ocurrió un error en el servidor';
  }
  return 'Ocurrió un error inesperado';
}
