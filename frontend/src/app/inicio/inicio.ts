import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { mensajeError } from '../api';
import { AuthService } from '../auth/auth.service';
import { Resumen } from '../reportes/reporte.model';
import { ReporteService } from '../reportes/reporte.service';

interface Indicador {
  etiqueta: string;
  valor: number;
  icono: string;
  ruta: string;
  // Se resalta en rojo cuando el valor indica un problema (para que salte a la vista en la demo)
  alerta?: boolean;
}

// Panel de inicio con los totales de la red y las últimas alertas
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  private service = inject(ReporteService);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  resumen = signal<Resumen | null>(null);
  columnasAlertas = ['fecha_hora', 'tipo', 'lugar', 'mensaje', 'estado'];

  indicadores = computed<Indicador[]>(() => {
    const r = this.resumen();
    if (!r) return [];
    return [
      { etiqueta: 'Líneas', valor: r.lineas, icono: 'route', ruta: '/lineas' },
      { etiqueta: 'Estaciones', valor: r.estaciones, icono: 'location_on', ruta: '/estaciones' },
      { etiqueta: 'Buses', valor: r.buses, icono: 'directions_bus', ruta: '/buses' },
      { etiqueta: 'Pilotos', valor: r.pilotos, icono: 'badge', ruta: '/pilotos' },
      { etiqueta: 'Accesos', valor: r.accesos, icono: 'door_front', ruta: '/accesos' },
      { etiqueta: 'Guardias', valor: r.guardias, icono: 'security', ruta: '/guardias' },
      { etiqueta: 'Visitas hoy', valor: r.visitas_hoy, icono: 'pin_drop', ruta: '/visitas' },
      { etiqueta: 'Alertas hoy', valor: r.alertas_hoy, icono: 'notifications', ruta: '/alertas' },
      {
        etiqueta: 'Alertas pendientes',
        valor: r.alertas_pendientes,
        icono: 'notification_important',
        ruta: '/alertas',
        alerta: r.alertas_pendientes > 0,
      },
      {
        etiqueta: 'Accesos sin guardia',
        valor: r.accesos_sin_guardia,
        icono: 'gpp_maybe',
        ruta: '/reportes',
        alerta: r.accesos_sin_guardia > 0,
      },
      {
        etiqueta: 'Líneas fuera de rango de buses',
        valor: r.lineas_fuera_de_rango,
        icono: 'rule',
        ruta: '/reportes',
        alerta: r.lineas_fuera_de_rango > 0,
      },
      { etiqueta: 'Buses sin línea', valor: r.buses_sin_linea, icono: 'no_transfer', ruta: '/buses' },
    ];
  });

  async ngOnInit() {
    try {
      this.resumen.set(await this.service.resumen());
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
