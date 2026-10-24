import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { MunicipalidadDatos } from '../municipalidad.model';
import { MunicipalidadService } from '../municipalidad.service';

@Component({
  selector: 'app-municipalidades-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './municipalidades-create.html',
})
export class MunicipalidadesCreate implements OnInit {
  private service = inject(MunicipalidadService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  // Si la ruta trae :id, el formulario edita en lugar de crear
  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    direccion: [''],
  });

  async ngOnInit() {
    if (!this.id) return;
    try {
      const municipalidad = await this.service.get(this.id);
      this.form.patchValue({ nombre: municipalidad.nombre, direccion: municipalidad.direccion ?? '' });
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, direccion } = this.form.getRawValue();
    const datos: MunicipalidadDatos = { nombre, direccion };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        await this.service.create(datos);
      }
      this.snackBar.open('Municipalidad guardada', 'Cerrar');
      this.router.navigate(['/municipalidades']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
