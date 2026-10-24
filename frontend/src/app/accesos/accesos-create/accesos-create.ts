import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { Guardia } from '../../guardias/guardia.model';
import { GuardiaService } from '../../guardias/guardia.service';
import { AccesoDatos, AccesoNuevo, GuardiaAsignado } from '../acceso.model';
import { AccesoService } from '../acceso.service';

@Component({
  selector: 'app-accesos-create',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './accesos-create.html',
})
export class AccesosCreate implements OnInit {
  private service = inject(AccesoService);
  private estacionService = inject(EstacionService);
  private guardiaService = inject(GuardiaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  estaciones = signal<Estacion[]>([]);
  guardias = signal<Guardia[]>([]);
  asignados = signal<GuardiaAsignado[]>([]);

  // Guardias que todavía no están asignados a este acceso
  disponibles = computed(() =>
    this.guardias().filter((g) => !this.asignados().some((a) => a.id_guardia === g.id_guardia))
  );

  // RF09: al crear el acceso se exige su primer guardia
  form = this.fb.group({
    nombre: ['', Validators.required],
    id_estacion: this.fb.control<number | null>(null, Validators.required),
    id_guardia: this.fb.control<number | null>(null, Validators.required),
  });

  nuevoGuardia = this.fb.control<number | null>(null);

  async ngOnInit() {
    try {
      const [estaciones, guardias] = await Promise.all([this.estacionService.list(), this.guardiaService.list()]);
      this.estaciones.set(estaciones);
      this.guardias.set(guardias);
      if (this.id) {
        this.form.controls.id_guardia.disable();
        const acceso = await this.service.get(this.id);
        this.form.patchValue({ nombre: acceso.nombre, id_estacion: acceso.id_estacion });
        this.asignados.set(acceso.guardias ?? []);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    const { nombre, id_estacion, id_guardia } = this.form.getRawValue();
    if (this.form.invalid || id_estacion === null) {
      this.form.markAllAsTouched();
      return;
    }
    const datos: AccesoDatos = { nombre, id_estacion };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        if (id_guardia === null) {
          this.form.markAllAsTouched();
          return;
        }
        const nuevo: AccesoNuevo = { ...datos, id_guardia };
        await this.service.create(nuevo);
      }
      this.snackBar.open('Acceso guardado', 'Cerrar');
      this.router.navigate(['/accesos']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async asignarGuardia() {
    const idGuardia = this.nuevoGuardia.value;
    if (!this.id || !idGuardia) return;
    try {
      const acceso = await this.service.asignarGuardia(this.id, idGuardia);
      this.asignados.set(acceso.guardias ?? []);
      this.nuevoGuardia.reset();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async retirarGuardia(guardia: GuardiaAsignado) {
    if (!this.id) return;
    try {
      const acceso = await this.service.retirarGuardia(this.id, guardia.id_guardia);
      this.asignados.set(acceso.guardias ?? []);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
