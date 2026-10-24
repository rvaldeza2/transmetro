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
import { Parqueo } from '../parqueo.model';
import { ParqueoService } from '../parqueo.service';

@Component({
  selector: 'app-parqueos-index',
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
  templateUrl: './parqueos-index.html',
})
export class ParqueosIndex implements OnInit {
  private service = inject(ParqueoService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  parqueos = new MatTableDataSource<Parqueo>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  estaciones = signal<Estacion[]>([]);
  columnas = ['ubicacion', 'estacion', 'acciones'];

  constructor() {
    effect(() => (this.parqueos.paginator = this.paginador() ?? null));
    effect(() => (this.parqueos.sort = this.ordenador() ?? null));

    // La columna Estación se filtra y ordena por el nombre, no por el id
    this.parqueos.filterPredicate = (parqueo, filtro) =>
      `${parqueo.ubicacion} ${this.nombreEstacion(parqueo.id_estacion) ?? ''}`
        .toLowerCase()
        .includes(filtro);
    this.parqueos.sortingDataAccessor = (parqueo, columna) =>
      columna === 'estacion' ? (this.nombreEstacion(parqueo.id_estacion) ?? '') : parqueo.ubicacion;
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [parqueos, estaciones] = await Promise.all([
        this.service.list(),
        this.estacionService.list(),
      ]);
      this.parqueos.data = parqueos;
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }

  filtrar(texto: string) {
    this.parqueos.filter = texto.trim().toLowerCase();
    this.parqueos.paginator?.firstPage();
  }

  async eliminar(parqueo: Parqueo) {
    if (!confirm(`¿Eliminar el parqueo ${parqueo.ubicacion}?`)) return;
    try {
      await this.service.remove(parqueo.id_parqueo);
      this.snackBar.open('Parqueo eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
