import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import {
  AccesoLinea,
  BusLinea,
  DistanciaDatos,
  LineaConEstaciones,
  LineaEstacion,
  LineaEstacionDatos,
  ValidacionLinea,
} from '../linea.model';
import { LineaService } from '../linea.service';

@Component({
  selector: 'app-lineas-show',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './lineas-show.html',
})
export class LineasShow implements OnInit {
  private service = inject(LineaService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  linea = signal<LineaConEstaciones | null>(null);
  validacion = signal<ValidacionLinea | null>(null);
  accesos = signal<AccesoLinea[]>([]);
  buses = signal<BusLinea[]>([]);
  todasEstaciones = signal<Estacion[]>([]);

  columnasEstaciones = ['orden', 'estacion', 'distancia', 'acumulado', 'acciones'];
  columnasAccesos = ['estacion', 'acceso', 'guardias'];
  columnasBuses = ['placa', 'capacidad', 'parqueo'];

  form = this.fb.group({
    id_estacion: this.fb.control<number | null>(null, Validators.required),
    orden_visita: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    distancia_siguiente_km: this.fb.control<number | null>(null, Validators.min(0)),
  });

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [linea, validacion, accesos, buses, estaciones] = await Promise.all([
        this.service.estaciones(this.id),
        this.service.validacion(this.id),
        this.service.accesos(this.id),
        this.service.buses(this.id),
        this.estacionService.list(),
      ]);
      this.linea.set(linea);
      this.validacion.set(validacion);
      this.accesos.set(accesos);
      this.buses.set(buses);
      this.todasEstaciones.set(estaciones);
      this.form.reset({ orden_visita: linea.estaciones.length + 1 });
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async agregarEstacion() {
    const { id_estacion, orden_visita, distancia_siguiente_km } = this.form.getRawValue();
    if (this.form.invalid || id_estacion === null || orden_visita === null) {
      this.form.markAllAsTouched();
      return;
    }
    const datos: LineaEstacionDatos = { id_estacion, orden_visita, distancia_siguiente_km };
    try {
      await this.service.agregarEstacion(this.id, datos);
      this.snackBar.open('Estación agregada a la línea', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  // RF11: registrar la distancia hacia la siguiente estación
  async editarDistancia(estacion: LineaEstacion) {
    const valor = prompt(`Distancia de ${estacion.nombre} a la siguiente estación (km)`,
      String(estacion.distancia_siguiente_km ?? ''));
    if (valor === null) return;
    const distancia = valor.trim() === '' ? null : Number(valor);
    if (distancia !== null && (Number.isNaN(distancia) || distancia < 0)) {
      this.snackBar.open('La distancia debe ser un número mayor o igual a 0', 'Cerrar');
      return;
    }
    const datos: DistanciaDatos = { distancia_siguiente_km: distancia };
    try {
      await this.service.actualizarEstacion(this.id, estacion.id_estacion, datos);
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async quitarEstacion(estacion: LineaEstacion) {
    if (!confirm(`¿Quitar ${estacion.nombre} de la línea?`)) return;
    try {
      await this.service.quitarEstacion(this.id, estacion.id_estacion);
      this.snackBar.open('Estación quitada de la línea', 'Cerrar');
      this.cargar();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
