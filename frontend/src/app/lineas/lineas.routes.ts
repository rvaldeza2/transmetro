import { Routes } from '@angular/router';
import { LineasIndex } from './lineas-index/lineas-index';
import { LineasCreate } from './lineas-create/lineas-create';
import { LineasShow } from './lineas-show/lineas-show';

export const LINEAS_ROUTES: Routes = [
  { path: '', component: LineasIndex },
  { path: 'crear', component: LineasCreate },
  { path: 'editar/:id', component: LineasCreate },
  { path: ':id', component: LineasShow },
];
