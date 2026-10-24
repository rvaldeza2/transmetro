import { Routes } from '@angular/router';
import { MunicipalidadesIndex } from './municipalidades-index/municipalidades-index';
import { MunicipalidadesCreate } from './municipalidades-create/municipalidades-create';
import { MunicipalidadesShow } from './municipalidades-show/municipalidades-show';

export const MUNICIPALIDADES_ROUTES: Routes = [
  { path: '', component: MunicipalidadesIndex },
  { path: 'crear', component: MunicipalidadesCreate },
  { path: 'editar/:id', component: MunicipalidadesCreate },
  { path: ':id', component: MunicipalidadesShow },
];
