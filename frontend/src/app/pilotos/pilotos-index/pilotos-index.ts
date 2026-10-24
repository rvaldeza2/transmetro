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
import { Bus } from '../../buses/bus.model';
import { BusService } from '../../buses/bus.service';
import { Piloto } from '../piloto.model';
import { PilotoService } from '../piloto.service';

@Component({
  selector: 'app-pilotos-index',
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
  templateUrl: './pilotos-index.html',
})
export class PilotosIndex implements OnInit {
  private service = inject(PilotoService);
  private busService = inject(BusService);
  private snackBar = inject(MatSnackBar);

  pilotos = new MatTableDataSource<Piloto>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  buses = signal<Bus[]>([]);
  columnas = ['nombre', 'historial', 'residencia', 'telefono', 'bus', 'acciones'];

  constructor() {
    effect(() => (this.pilotos.paginator = this.paginador() ?? null));
    effect(() => (this.pilotos.sort = this.ordenador() ?? null));

    // La columna Bus se filtra y ordena por la placa, no por el id
    this.pilotos.filterPredicate = (piloto, filtro) =>
      [
        piloto.nombre,
        piloto.historial_educativo,
        piloto.residencia,
        piloto.telefono,
        this.placaBus(piloto.id_bus),
      ]
        .join(' ')
        .toLowerCase()
        .includes(filtro);
    this.pilotos.sortingDataAccessor = (piloto, columna) => {
      if (columna === 'historial_educativo') return piloto.historial_educativo ?? '';
      if (columna === 'residencia') return piloto.residencia ?? '';
      if (columna === 'telefono') return piloto.telefono ?? '';
      if (columna === 'bus') return this.placaBus(piloto.id_bus);
      return piloto.nombre;
    };
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [pilotos, buses] = await Promise.all([this.service.list(), this.busService.list()]);
      this.pilotos.data = pilotos;
      this.buses.set(buses);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  placaBus(id: number | null) {
    return this.buses().find((b) => b.id_bus === id)?.placa ?? 'Sin bus';
  }

  filtrar(texto: string) {
    this.pilotos.filter = texto.trim().toLowerCase();
    this.pilotos.paginator?.firstPage();
  }

  async eliminar(piloto: Piloto) {
    if (!confirm(`¿Eliminar al piloto ${piloto.nombre}?`)) return;
    try {
      await this.service.remove(piloto.id_piloto);
      this.snackBar.open('Piloto eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
