import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { ParqueoDatos } from '../parqueo.model';
import { ParqueoService } from '../parqueo.service';

@Component({
  selector: 'app-parqueos-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './parqueos-create.html',
})
export class ParqueosCreate implements OnInit {
  private service = inject(ParqueoService);
  private estacionService = inject(EstacionService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  estaciones = signal<Estacion[]>([]);

  form = this.fb.group({
    ubicacion: ['', Validators.required],
    id_estacion: this.fb.control<number | null>(null, Validators.required),
  });

  async ngOnInit() {
    try {
      this.estaciones.set(await this.estacionService.list());
      if (this.id) {
        const parqueo = await this.service.get(this.id);
        this.form.patchValue(parqueo);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    const { ubicacion, id_estacion } = this.form.getRawValue();
    if (this.form.invalid || id_estacion === null) {
      this.form.markAllAsTouched();
      return;
    }
    const datos: ParqueoDatos = { ubicacion, id_estacion };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        await this.service.create(datos);
      }
      this.snackBar.open('Parqueo guardado', 'Cerrar');
      this.router.navigate(['/parqueos']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
