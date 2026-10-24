import { Routes } from '@angular/router';
import { GuardiasIndex } from './guardias-index/guardias-index';
import { GuardiasCreate } from './guardias-create/guardias-create';
import { GuardiasShow } from './guardias-show/guardias-show';

export const GUARDIAS_ROUTES: Routes = [
  { path: '', component: GuardiasIndex },
  { path: 'crear', component: GuardiasCreate },
  { path: 'editar/:id', component: GuardiasCreate },
  { path: ':id', component: GuardiasShow },
];
