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
import { Guardia } from '../guardia.model';
import { GuardiaService } from '../guardia.service';

@Component({
  selector: 'app-guardias-index',
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
  templateUrl: './guardias-index.html',
})
export class GuardiasIndex implements OnInit {
  private service = inject(GuardiaService);
  private snackBar = inject(MatSnackBar);

  guardias = new MatTableDataSource<Guardia>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  columnas = ['nombre', 'turno', 'acciones'];

  constructor() {
    effect(() => (this.guardias.paginator = this.paginador() ?? null));
    effect(() => (this.guardias.sort = this.ordenador() ?? null));
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      this.guardias.data = await this.service.list();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  filtrar(texto: string) {
    this.guardias.filter = texto.trim().toLowerCase();
    this.guardias.paginator?.firstPage();
  }

  async eliminar(guardia: Guardia) {
    if (!confirm(`¿Eliminar al guardia ${guardia.nombre}?`)) return;
    try {
      await this.service.remove(guardia.id_guardia);
      this.snackBar.open('Guardia eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
