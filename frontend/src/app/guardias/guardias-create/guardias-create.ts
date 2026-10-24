import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { GuardiaDatos } from '../guardia.model';
import { GuardiaService } from '../guardia.service';

@Component({
  selector: 'app-guardias-create',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './guardias-create.html',
})
export class GuardiasCreate implements OnInit {
  private service = inject(GuardiaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  turnos = ['Matutino', 'Vespertino', 'Nocturno'];

  form = this.fb.group({
    nombre: ['', Validators.required],
    turno: [''],
  });

  async ngOnInit() {
    if (!this.id) return;
    try {
      const guardia = await this.service.get(this.id);
      this.form.patchValue({ nombre: guardia.nombre, turno: guardia.turno ?? '' });
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, turno } = this.form.getRawValue();
    const datos: GuardiaDatos = { nombre, turno };
    try {
      if (this.id) {
        await this.service.update(this.id, datos);
      } else {
        await this.service.create(datos);
      }
      this.snackBar.open('Guardia guardado', 'Cerrar');
      this.router.navigate(['/guardias']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
