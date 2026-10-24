import { Routes } from '@angular/router';
import { BusesIndex } from './buses-index/buses-index';
import { BusesCreate } from './buses-create/buses-create';
import { BusesShow } from './buses-show/buses-show';

export const BUSES_ROUTES: Routes = [
  { path: '', component: BusesIndex },
  { path: 'crear', component: BusesCreate },
  { path: 'editar/:id', component: BusesCreate },
  { path: ':id', component: BusesShow },
];
