import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Linea } from '../../lineas/linea.model';
import { LineaService } from '../../lineas/linea.service';
import { Parqueo } from '../../parqueos/parqueo.model';
import { ParqueoService } from '../../parqueos/parqueo.service';
import { Bus, BusDatos, BusNuevo } from '../bus.model';
import { BusService } from '../bus.service';

@Component({
  selector: 'app-buses-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './buses-create.html',
})
export class BusesCreate implements OnInit {
  private service = inject(BusService);
  private lineaService = inject(LineaService);
  private parqueoService = inject(ParqueoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  lineas = signal<Linea[]>([]);
  parqueos = signal<Parqueo[]>([]);
  private original: Bus | null = null;

  // RF04 / RF06: la línea es opcional, el parqueo es obligatorio
  form = this.fb.group({
    placa: ['', Validators.required],
    capacidad: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    id_parqueo: this.fb.control<number | null>(null, Validators.required),
    id_linea: this.fb.control<number | null>(null),
  });

  async ngOnInit() {
    try {
      const [lineas, parqueos] = await Promise.all([this.lineaService.list(), this.parqueoService.list()]);
      this.lineas.set(lineas);
      this.parqueos.set(parqueos);
      if (this.id) {
        this.original = await this.service.get(this.id);
        this.form.patchValue(this.original);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    const { placa, capacidad, id_parqueo, id_linea } = this.form.getRawValue();
    if (this.form.invalid || capacidad === null || id_parqueo === null) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      if (!this.id || !this.original) {
        const nuevo: BusNuevo = { placa, capacidad, id_parqueo, id_linea };
        await this.service.create(nuevo);
      } else {
        // La línea y el parqueo se cambian con sus propias operaciones, que validan las reglas
        const datos: BusDatos = { placa, capacidad };
        await this.service.update(this.id, datos);
        if (id_parqueo !== this.original.id_parqueo) {
          await this.service.cambiarParqueo(this.id, id_parqueo);
        }
        if (id_linea !== this.original.id_linea) {
          if (id_linea === null) {
            await this.service.retirarDeLinea(this.id);
          } else {
            await this.service.asignarLinea(this.id, id_linea);
          }
        }
      }
      this.snackBar.open('Bus guardado', 'Cerrar');
      this.router.navigate(['/buses']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
