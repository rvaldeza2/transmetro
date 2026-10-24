import { Routes } from '@angular/router';
import { PilotosIndex } from './pilotos-index/pilotos-index';
import { PilotosCreate } from './pilotos-create/pilotos-create';
import { PilotosShow } from './pilotos-show/pilotos-show';

export const PILOTOS_ROUTES: Routes = [
  { path: '', component: PilotosIndex },
  { path: 'crear', component: PilotosCreate },
  { path: 'editar/:id', component: PilotosCreate },
  { path: ':id', component: PilotosShow },
];
