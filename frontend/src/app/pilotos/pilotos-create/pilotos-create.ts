import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Bus } from '../../buses/bus.model';
import { BusService } from '../../buses/bus.service';
import { PilotoDatos } from '../piloto.model';
import { PilotoService } from '../piloto.service';

@Component({
  selector: 'app-pilotos-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './pilotos-create.html',
})
export class PilotosCreate implements OnInit {
  private service = inject(PilotoService);
  private busService = inject(BusService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  buses = signal<Bus[]>([]);

  // RF08: historial educativo, residencia y comunicación
  form = this.fb.group({
    nombre: ['', Validators.required],
    historial_educativo: [''],
    residencia: [''],
    telefono: [''],
    id_bus: this.fb.control<number | null>(null),
  });

  async ngOnInit() {
    try {
      this.buses.set(await this.busService.list());
      if (this.id) {
        const piloto = await this.service.get(this.id);
        this.form.patchValue({
          nombre: piloto.nombre,
          historial_educativo: piloto.historial_educativo ?? '',
          residencia: piloto.residencia ?? '',
          telefono: piloto.telefono ?? '',
          id_bus: piloto.id_bus,
        });
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, historial_educativo, residencia, telefono, id_bus } = this.form.getRawValue();
    const datos: PilotoDatos = { nombre, historial_educativo, residencia, telefono, id_bus };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        await this.service.create(datos);
      }
      this.snackBar.open('Piloto guardado', 'Cerrar');
      this.router.navigate(['/pilotos']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
