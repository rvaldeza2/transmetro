import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { paginadorEnEspanol } from './paginador';

const CLAVE_RECARGA = 'transmetro_recarga_version';

// Si se publicó una versión nueva mientras la página estaba abierta, los archivos de las
// pantallas cambian de nombre y no se pueden cargar; se recarga una vez para traer la nueva
function recargarSiHayVersionNueva({ error, url }: { error: unknown; url: string }) {
  const mensaje = error instanceof Error ? error.message : String(error);
  const falloAlCargar = /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(mensaje);
  if (!falloAlCargar || sessionStorage.getItem(CLAVE_RECARGA) === url) return;
  sessionStorage.setItem(CLAVE_RECARGA, url);
  location.assign(url);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withNavigationErrorHandler(recargarSiHayVersionNueva)),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },
    { provide: MatPaginatorIntl, useFactory: paginadorEnEspanol },
  ],
};
