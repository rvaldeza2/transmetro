import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { Operador } from '../operador.model';
import { OperadorService } from '../operador.service';

@Component({
  selector: 'app-operadores-index',
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './operadores-index.html',
})
export class OperadoresIndex implements OnInit {
  private service = inject(OperadorService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  operadores = new MatTableDataSource<Operador>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  estaciones = signal<Estacion[]>([]);
  columnas = ['nombre', 'estacion', 'acciones'];

  constructor() {
    effect(() => (this.operadores.paginator = this.paginador() ?? null));
    effect(() => (this.operadores.sort = this.ordenador() ?? null));

    // La columna Estación se filtra y ordena por el nombre, no por el id
    this.operadores.filterPredicate = (operador, filtro) =>
      `${operador.nombre} ${this.nombreEstacion(operador.id_estacion) ?? ''}`
        .toLowerCase()
        .includes(filtro);
    this.operadores.sortingDataAccessor = (operador, columna) =>
      columna === 'estacion' ? (this.nombreEstacion(operador.id_estacion) ?? '') : operador.nombre;
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [operadores, estaciones] = await Promise.all([
        this.service.list(),
        this.estacionService.list(),
      ]);
      this.operadores.data = operadores;
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }

  filtrar(texto: string) {
    this.operadores.filter = texto.trim().toLowerCase();
    this.operadores.paginator?.firstPage();
  }

  async eliminar(operador: Operador) {
    if (!confirm(`¿Eliminar al operador ${operador.nombre}?`)) return;
    try {
      await this.service.remove(operador.id_operador);
      this.snackBar.open('Operador eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
