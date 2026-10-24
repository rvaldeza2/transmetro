import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    // Todas estas pantallas requieren haber iniciado sesión
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./inicio/inicio').then((m) => m.Inicio),
      },
      {
        path: 'municipalidades',
        loadChildren: () => import('./municipalidades/municipalidades.routes').then((m) => m.MUNICIPALIDADES_ROUTES),
      },
      {
        path: 'lineas',
        loadChildren: () => import('./lineas/lineas.routes').then((m) => m.LINEAS_ROUTES),
      },
      {
        path: 'estaciones',
        loadChildren: () => import('./estaciones/estaciones.routes').then((m) => m.ESTACIONES_ROUTES),
      },
      {
        path: 'accesos',
        loadChildren: () => import('./accesos/accesos.routes').then((m) => m.ACCESOS_ROUTES),
      },
      {
        path: 'guardias',
        loadChildren: () => import('./guardias/guardias.routes').then((m) => m.GUARDIAS_ROUTES),
      },
      {
        path: 'parqueos',
        loadChildren: () => import('./parqueos/parqueos.routes').then((m) => m.PARQUEOS_ROUTES),
      },
      {
        path: 'buses',
        loadChildren: () => import('./buses/buses.routes').then((m) => m.BUSES_ROUTES),
      },
      {
        path: 'pilotos',
        loadChildren: () => import('./pilotos/pilotos.routes').then((m) => m.PILOTOS_ROUTES),
      },
      {
        path: 'operadores',
        loadChildren: () => import('./operadores/operadores.routes').then((m) => m.OPERADORES_ROUTES),
      },
      {
        path: 'visitas',
        loadChildren: () => import('./visitas/visitas.routes').then((m) => m.VISITAS_ROUTES),
      },
      {
        path: 'alertas',
        loadChildren: () => import('./alertas/alertas.routes').then((m) => m.ALERTAS_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
