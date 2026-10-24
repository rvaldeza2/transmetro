import { Routes } from '@angular/router';
import { EstacionesIndex } from './estaciones-index/estaciones-index';
import { EstacionesCreate } from './estaciones-create/estaciones-create';
import { EstacionesShow } from './estaciones-show/estaciones-show';

export const ESTACIONES_ROUTES: Routes = [
  { path: '', component: EstacionesIndex },
  { path: 'crear', component: EstacionesCreate },
  { path: 'editar/:id', component: EstacionesCreate },
  { path: ':id', component: EstacionesShow },
];
