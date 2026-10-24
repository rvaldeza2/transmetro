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
import { Municipalidad } from '../../municipalidades/municipalidad.model';
import { MunicipalidadService } from '../../municipalidades/municipalidad.service';
import { Linea } from '../linea.model';
import { LineaService } from '../linea.service';

@Component({
  selector: 'app-lineas-index',
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
  templateUrl: './lineas-index.html',
})
export class LineasIndex implements OnInit {
  private service = inject(LineaService);
  private municipalidadService = inject(MunicipalidadService);
  private snackBar = inject(MatSnackBar);

  lineas = new MatTableDataSource<Linea>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  municipalidades = signal<Municipalidad[]>([]);
  columnas = ['nombre', 'municipalidad', 'distancia', 'acciones'];

  constructor() {
    effect(() => (this.lineas.paginator = this.paginador() ?? null));
    effect(() => (this.lineas.sort = this.ordenador() ?? null));

    // La columna Municipalidad se filtra y ordena por el nombre, no por el id
    this.lineas.filterPredicate = (linea, filtro) =>
      `${linea.nombre} ${this.nombreMunicipalidad(linea.id_municipalidad) ?? ''} ${linea.distancia_total_km}`
        .toLowerCase()
        .includes(filtro);
    this.lineas.sortingDataAccessor = (linea, columna) => {
      if (columna === 'municipalidad')
        return this.nombreMunicipalidad(linea.id_municipalidad) ?? '';
      if (columna === 'distancia_total_km') return linea.distancia_total_km;
      return linea.nombre;
    };
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [lineas, municipalidades] = await Promise.all([
        this.service.list(),
        this.municipalidadService.list(),
      ]);
      this.lineas.data = lineas;
      this.municipalidades.set(municipalidades);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreMunicipalidad(id: number) {
    return this.municipalidades().find((m) => m.id_municipalidad === id)?.nombre;
  }

  filtrar(texto: string) {
    this.lineas.filter = texto.trim().toLowerCase();
    this.lineas.paginator?.firstPage();
  }

  async eliminar(linea: Linea) {
    if (!confirm(`¿Eliminar la ${linea.nombre}?`)) return;
    try {
      await this.service.remove(linea.id_linea);
      this.snackBar.open('Línea eliminada', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
