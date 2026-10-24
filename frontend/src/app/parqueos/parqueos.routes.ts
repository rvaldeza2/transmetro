import { Routes } from '@angular/router';
import { ParqueosIndex } from './parqueos-index/parqueos-index';
import { ParqueosCreate } from './parqueos-create/parqueos-create';
import { ParqueosShow } from './parqueos-show/parqueos-show';

export const PARQUEOS_ROUTES: Routes = [
  { path: '', component: ParqueosIndex },
  { path: 'crear', component: ParqueosCreate },
  { path: 'editar/:id', component: ParqueosCreate },
  { path: ':id', component: ParqueosShow },
];
