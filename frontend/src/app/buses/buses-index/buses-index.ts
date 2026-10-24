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
import { Bus, EvaluacionEspera } from '../bus.model';
import { BusService } from '../bus.service';

@Component({
  selector: 'app-buses-index',
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
  templateUrl: './buses-index.html',
})
export class BusesIndex implements OnInit {
  private service = inject(BusService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  buses = signal<Bus[]>([]);
  tabla = new MatTableDataSource<Bus>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  columnas = ['placa', 'capacidad', 'linea', 'parqueo', 'acciones'];

  // RF13: pasajeros a bordo al llegar a una estación
  evaluacion = this.fb.group({
    id_bus: this.fb.control<number | null>(null, Validators.required),
    pasajeros: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });
  resultado = signal<EvaluacionEspera | null>(null);

  constructor() {
    effect(() => (this.tabla.paginator = this.paginador() ?? null));
    effect(() => (this.tabla.sort = this.ordenador() ?? null));
  }

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const buses = await this.service.list();
      this.buses.set(buses);
      this.tabla.data = buses;
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async evaluar() {
    const { id_bus, pasajeros } = this.evaluacion.getRawValue();
    if (this.evaluacion.invalid || id_bus === null || pasajeros === null) {
      this.evaluacion.markAllAsTouched();
      return;
    }
    try {
      this.resultado.set(await this.service.evaluarEspera(id_bus, pasajeros));
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  filtrar(texto: string) {
    this.tabla.filter = texto.trim().toLowerCase();
    this.tabla.paginator?.firstPage();
  }

  async eliminar(bus: Bus) {
    if (!confirm(`¿Eliminar el bus ${bus.placa}?`)) return;
    try {
      await this.service.remove(bus.id_bus);
      this.snackBar.open('Bus eliminado', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
