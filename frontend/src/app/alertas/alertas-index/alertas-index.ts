import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { AuthService } from '../../auth/auth.service';
import { Alerta, FiltroAlertas, TipoAlerta } from '../alerta.model';
import { AlertaService } from '../alerta.service';

// Historial de alertas de sobrecupo (RF12) y de espera adicional (RF13)
@Component({
  selector: 'app-alertas-index',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './alertas-index.html',
})
export class AlertasIndex implements OnInit {
  private service = inject(AlertaService);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);

  tabla = new MatTableDataSource<Alerta>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  columnas = ['fecha_hora', 'tipo', 'estacion', 'placa', 'pasajeros', 'porcentaje', 'mensaje', 'estado'];

  tipo = signal<TipoAlerta | 'TODAS'>('TODAS');
  estado = signal<'PENDIENTES' | 'TODAS'>('PENDIENTES');

  // Solo el administrador y el operador pueden marcar una alerta como atendida
  puedeAtender = computed(() => ['ADMINISTRADOR', 'OPERADOR'].includes(this.auth.usuario()?.rol ?? ''));

  constructor() {
    effect(() => (this.tabla.paginator = this.paginador() ?? null));
    effect(() => (this.tabla.sort = this.ordenador() ?? null));
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    const filtro: FiltroAlertas = {};
    if (this.tipo() !== 'TODAS') filtro.tipo = this.tipo() as TipoAlerta;
    if (this.estado() === 'PENDIENTES') filtro.atendida = false;
    try {
      this.tabla.data = await this.service.list(filtro);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  cambiarTipo(valor: TipoAlerta | 'TODAS') {
    this.tipo.set(valor);
    this.cargar();
  }

  cambiarEstado(valor: 'PENDIENTES' | 'TODAS') {
    this.estado.set(valor);
    this.cargar();
  }

  filtrar(texto: string) {
    this.tabla.filter = texto.trim().toLowerCase();
    this.tabla.paginator?.firstPage();
  }

  async atender(alerta: Alerta) {
    try {
      await this.service.atender(alerta.id_alerta);
      this.snackBar.open('Alerta marcada como atendida', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
