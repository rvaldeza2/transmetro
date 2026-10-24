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
import { Acceso } from '../acceso.model';
import { AccesoService } from '../acceso.service';

@Component({
  selector: 'app-accesos-index',
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
  templateUrl: './accesos-index.html',
})
export class AccesosIndex implements OnInit {
  private service = inject(AccesoService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  accesos = new MatTableDataSource<Acceso>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  estaciones = signal<Estacion[]>([]);
  columnas = ['nombre', 'estacion', 'acciones'];

  constructor() {
    effect(() => (this.accesos.paginator = this.paginador() ?? null));
    effect(() => (this.accesos.sort = this.ordenador() ?? null));

    // La columna Estación se filtra y ordena por el nombre, no por el id
    this.accesos.filterPredicate = (acceso, filtro) =>
      `${acceso.nombre} ${this.nombreEstacion(acceso.id_estacion) ?? ''}`
        .toLowerCase()
        .includes(filtro);
    this.accesos.sortingDataAccessor = (acceso, columna) =>
      columna === 'estacion' ? (this.nombreEstacion(acceso.id_estacion) ?? '') : acceso.nombre;
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [accesos, estaciones] = await Promise.all([
        this.service.list(),
        this.estacionService.list(),
      ]);
      this.accesos.data = accesos;
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }

  filtrar(texto: string) {
    this.accesos.filter = texto.trim().toLowerCase();
    this.accesos.paginator?.firstPage();
  }

  async eliminar(acceso: Acceso) {
    if (!confirm(`¿Eliminar el acceso ${acceso.nombre}?`)) return;
    try {
      await this.service.remove(acceso.id_acceso);
      this.snackBar.open('Acceso eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
