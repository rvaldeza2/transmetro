import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { AuthService } from '../../auth/auth.service';
import { Bus } from '../../buses/bus.model';
import { BusService } from '../../buses/bus.service';
import { LineaEstacion } from '../../lineas/linea.model';
import { LineaService } from '../../lineas/linea.service';
import { Visita } from '../visita.model';
import { VisitaService } from '../visita.service';

// Visitas que cada unidad realiza a las estaciones durante su recorrido
@Component({
  selector: 'app-visitas-index',
  imports: [
    ReactiveFormsModule,
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
  templateUrl: './visitas-index.html',
})
export class VisitasIndex implements OnInit {
  private service = inject(VisitaService);
  private busService = inject(BusService);
  private lineaService = inject(LineaService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);

  tabla = new MatTableDataSource<Visita>([]);
  private paginador = viewChild(MatPaginator);
  private ordenador = viewChild(MatSort);
  columnas = ['fecha_hora', 'placa', 'linea', 'estacion', 'pasajeros', 'espera', 'acciones'];

  // Solo los buses con línea asignada realizan recorridos
  buses = signal<Bus[]>([]);
  busesConLinea = computed(() => this.buses().filter((b) => b.id_linea !== null));
  estacionesRuta = signal<LineaEstacion[]>([]);
  ultimaVisita = signal<Visita | null>(null);

  rol = computed(() => this.auth.usuario()?.rol);
  puedeRegistrar = computed(() => this.rol() === 'ADMINISTRADOR' || this.rol() === 'OPERADOR');
  puedeEliminar = computed(() => this.rol() === 'ADMINISTRADOR');

  form = this.fb.group({
    id_bus: this.fb.control<number | null>(null, Validators.required),
    id_estacion: this.fb.control<number | null>(null, Validators.required),
    pasajeros: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  filtroBus = this.fb.control<number | null>(null);
  filtroFecha = this.fb.control('');

  constructor() {
    effect(() => (this.tabla.paginator = this.paginador() ?? null));
    effect(() => (this.tabla.sort = this.ordenador() ?? null));
  }

  async ngOnInit() {
    try {
      this.buses.set(await this.busService.list());
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
    this.cargar();
  }

  async cargar() {
    try {
      this.tabla.data = await this.service.list({
        id_bus: this.filtroBus.value ?? undefined,
        fecha: this.filtroFecha.value || undefined,
      });
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  limpiarFiltros() {
    this.filtroBus.setValue(null);
    this.filtroFecha.setValue('');
    this.cargar();
  }

  // Al elegir el bus se cargan las estaciones de su línea en el orden de recorrido,
  // así el operador no puede escoger por error una estación que no está en la ruta
  async seleccionarBus(idBus: number) {
    this.form.controls.id_estacion.setValue(null);
    this.estacionesRuta.set([]);
    const bus = this.buses().find((b) => b.id_bus === idBus);
    if (!bus?.id_linea) return;
    try {
      const linea = await this.lineaService.estaciones(bus.id_linea);
      this.estacionesRuta.set(linea.estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async registrar() {
    const { id_bus, id_estacion, pasajeros } = this.form.getRawValue();
    if (this.form.invalid || id_bus === null || id_estacion === null || pasajeros === null) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      const visita = await this.service.create({ id_bus, id_estacion, pasajeros });
      this.ultimaVisita.set(visita);
      this.form.controls.id_estacion.reset();
      this.form.controls.pasajeros.reset();
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  filtrar(texto: string) {
    this.tabla.filter = texto.trim().toLowerCase();
    this.tabla.paginator?.firstPage();
  }

  async eliminar(visita: Visita) {
    if (!confirm(`¿Eliminar la visita del bus ${visita.placa} a ${visita.estacion}?`)) return;
    try {
      await this.service.remove(visita.id_visita);
      this.snackBar.open('Visita eliminada', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
