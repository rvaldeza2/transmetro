import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  auth = inject(AuthService);

  menu = [
    { ruta: '/inicio', texto: 'Inicio', icono: 'dashboard' },
    { ruta: '/lineas', texto: 'Líneas', icono: 'route' },
    { ruta: '/estaciones', texto: 'Estaciones', icono: 'location_on' },
    { ruta: '/accesos', texto: 'Accesos', icono: 'door_front' },
    { ruta: '/guardias', texto: 'Guardias', icono: 'security' },
    { ruta: '/buses', texto: 'Buses', icono: 'directions_bus' },
    { ruta: '/parqueos', texto: 'Parqueos', icono: 'local_parking' },
    { ruta: '/pilotos', texto: 'Pilotos', icono: 'badge' },
    { ruta: '/operadores', texto: 'Operadores', icono: 'computer' },
    { ruta: '/visitas', texto: 'Visitas', icono: 'pin_drop' },
    { ruta: '/alertas', texto: 'Alertas', icono: 'notifications' },
    { ruta: '/municipalidades', texto: 'Municipalidades', icono: 'account_balance' },
    { ruta: '/reportes', texto: 'Reportes', icono: 'summarize' },
  ];

  constructor() {
    // index.html carga la fuente "Material Symbols Outlined"
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
  }
}
