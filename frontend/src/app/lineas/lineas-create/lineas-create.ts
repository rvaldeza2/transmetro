import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Municipalidad } from '../../municipalidades/municipalidad.model';
import { MunicipalidadService } from '../../municipalidades/municipalidad.service';
import { LineaDatos } from '../linea.model';
import { LineaService } from '../linea.service';

@Component({
  selector: 'app-lineas-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './lineas-create.html',
})
export class LineasCreate implements OnInit {
  private service = inject(LineaService);
  private municipalidadService = inject(MunicipalidadService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  municipalidades = signal<Municipalidad[]>([]);

  form = this.fb.group({
    nombre: ['', Validators.required],
    id_municipalidad: this.fb.control<number | null>(null, Validators.required),
  });

  async ngOnInit() {
    try {
      this.municipalidades.set(await this.municipalidadService.list());
      if (this.id) {
        const linea = await this.service.get(this.id);
        this.form.patchValue(linea);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    const { nombre, id_municipalidad } = this.form.getRawValue();
    if (this.form.invalid || id_municipalidad === null) {
      this.form.markAllAsTouched();
      return;
    }
    const datos: LineaDatos = { nombre, id_municipalidad };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
        this.snackBar.open('Línea guardada', 'Cerrar');
        this.router.navigate(['/lineas']);
      } else {
        // Al crear, se pasa al detalle para registrar sus estaciones
        const linea = await this.service.create(datos);
        this.snackBar.open('Línea creada: agregue sus estaciones', 'Cerrar');
        this.router.navigate(['/lineas', linea.id_linea]);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
