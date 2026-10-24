import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Recuperar } from './recuperar/recuperar';
import { Registro } from './registro/registro';

// Pantallas públicas: no requieren sesión iniciada
export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'recuperar', component: Recuperar },
];
