import { Routes } from '@angular/router';
import { OperadoresIndex } from './operadores-index/operadores-index';
import { OperadoresCreate } from './operadores-create/operadores-create';
import { OperadoresShow } from './operadores-show/operadores-show';

export const OPERADORES_ROUTES: Routes = [
  { path: '', component: OperadoresIndex },
  { path: 'crear', component: OperadoresCreate },
  { path: 'editar/:id', component: OperadoresCreate },
  { path: ':id', component: OperadoresShow },
];
