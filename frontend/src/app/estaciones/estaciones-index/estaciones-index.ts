import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { mensajeError } from '../../api';
import { Municipalidad } from '../../municipalidades/municipalidad.model';
import { MunicipalidadService } from '../../municipalidades/municipalidad.service';
import { Estacion, EvaluacionCapacidad } from '../estacion.model';
import { EstacionService } from '../estacion.service';

@Component({
  selector: 'app-estaciones-index',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './estaciones-index.html',
})
export class EstacionesIndex implements OnInit {
  private service = inject(EstacionService);
  private municipalidadService = inject(MunicipalidadService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  estaciones = signal<Estacion[]>([]);
  tabla = new MatTableDataSource<Estacion>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  municipalidades = signal<Municipalidad[]>([]);
  columnas = ['nombre', 'municipalidad', 'acciones'];

  // RF12: conteo de pasajeros en una estación
  evaluacion = this.fb.group({
    id_estacion: this.fb.control<number | null>(null, Validators.required),
    pasajeros: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });
  resultado = signal<EvaluacionCapacidad | null>(null);

  constructor() {
    effect(() => (this.tabla.paginator = this.paginador() ?? null));
    effect(() => (this.tabla.sort = this.ordenador() ?? null));

    // La columna Municipalidad se filtra y ordena por el nombre, no por el id
    this.tabla.filterPredicate = (estacion, filtro) =>
      `${estacion.nombre} ${this.nombreMunicipalidad(estacion.id_municipalidad) ?? ''}`
        .toLowerCase()
        .includes(filtro);
    this.tabla.sortingDataAccessor = (estacion, columna) =>
      columna === 'municipalidad'
        ? (this.nombreMunicipalidad(estacion.id_municipalidad) ?? '')
        : estacion.nombre;
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [estaciones, municipalidades] = await Promise.all([
        this.service.list(),
        this.municipalidadService.list(),
      ]);
      this.estaciones.set(estaciones);
      this.tabla.data = estaciones;
      this.municipalidades.set(municipalidades);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreMunicipalidad(id: number) {
    return this.municipalidades().find((m) => m.id_municipalidad === id)?.nombre;
  }

  async evaluar() {
    const { id_estacion, pasajeros } = this.evaluacion.getRawValue();
    if (this.evaluacion.invalid || id_estacion === null || pasajeros === null) {
      this.evaluacion.markAllAsTouched();
      return;
    }
    try {
      this.resultado.set(await this.service.evaluarCapacidad(id_estacion, pasajeros));
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  filtrar(texto: string) {
    this.tabla.filter = texto.trim().toLowerCase();
    this.tabla.paginator?.firstPage();
  }

  async eliminar(estacion: Estacion) {
    if (!confirm(`¿Eliminar la estación ${estacion.nombre}?`)) return;
    try {
      await this.service.remove(estacion.id_estacion);
      this.snackBar.open('Estación eliminada', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
