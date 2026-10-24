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
import { OperadorDatos } from '../operador.model';
import { OperadorService } from '../operador.service';

@Component({
  selector: 'app-operadores-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './operadores-create.html',
})
export class OperadoresCreate implements OnInit {
  private service = inject(OperadorService);
  private estacionService = inject(EstacionService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  estaciones = signal<Estacion[]>([]);

  form = this.fb.group({
    nombre: ['', Validators.required],
    id_estacion: this.fb.control<number | null>(null, Validators.required),
  });

  async ngOnInit() {
    try {
      this.estaciones.set(await this.estacionService.list());
      if (this.id) {
        const operador = await this.service.get(this.id);
        this.form.patchValue(operador);
      }
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    const { nombre, id_estacion } = this.form.getRawValue();
    if (this.form.invalid || id_estacion === null) {
      this.form.markAllAsTouched();
      return;
    }
    const datos: OperadorDatos = { nombre, id_estacion };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        await this.service.create(datos);
      }
      this.snackBar.open('Operador guardado', 'Cerrar');
      this.router.navigate(['/operadores']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
