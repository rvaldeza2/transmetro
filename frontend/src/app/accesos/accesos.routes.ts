import { Routes } from '@angular/router';
import { AccesosIndex } from './accesos-index/accesos-index';
import { AccesosCreate } from './accesos-create/accesos-create';
import { AccesosShow } from './accesos-show/accesos-show';

export const ACCESOS_ROUTES: Routes = [
  { path: '', component: AccesosIndex },
  { path: 'crear', component: AccesosCreate },
  { path: 'editar/:id', component: AccesosCreate },
  { path: ':id', component: AccesosShow },
];
