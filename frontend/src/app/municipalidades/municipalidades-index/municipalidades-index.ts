import { Component, OnInit, effect, inject, viewChild } from '@angular/core';
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
import { Municipalidad } from '../municipalidad.model';
import { MunicipalidadService } from '../municipalidad.service';

@Component({
  selector: 'app-municipalidades-index',
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
  templateUrl: './municipalidades-index.html',
})
export class MunicipalidadesIndex implements OnInit {
  private service = inject(MunicipalidadService);
  private snackBar = inject(MatSnackBar);

  municipalidades = new MatTableDataSource<Municipalidad>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  columnas = ['nombre', 'direccion', 'acciones'];

  constructor() {
    effect(() => (this.municipalidades.paginator = this.paginador() ?? null));
    effect(() => (this.municipalidades.sort = this.ordenador() ?? null));
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      this.municipalidades.data = await this.service.list();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  filtrar(texto: string) {
    this.municipalidades.filter = texto.trim().toLowerCase();
    this.municipalidades.paginator?.firstPage();
  }

  async eliminar(municipalidad: Municipalidad) {
    if (!confirm(`¿Eliminar ${municipalidad.nombre}?`)) return;
    try {
      await this.service.remove(municipalidad.id_municipalidad);
      this.snackBar.open('Municipalidad eliminada', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
