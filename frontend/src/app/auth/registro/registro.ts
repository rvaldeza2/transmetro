import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { AuthService } from '../auth.service';
import { contrasenasIguales } from '../contrasenas-iguales';
import { RegistroDatos } from '../usuario.model';

// Registro público: las cuentas nuevas son de consulta; el administrador asigna otros roles
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './registro.html',
})
export class Registro {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group(
    {
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', Validators.required],
      pregunta_seguridad: ['', Validators.required],
      respuesta_seguridad: ['', Validators.required],
    },
    { validators: contrasenasIguales('contrasena', 'confirmacion') }
  );

  async registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, usuario, contrasena, pregunta_seguridad, respuesta_seguridad } = this.form.getRawValue();
    const datos: RegistroDatos = { nombre, usuario, contrasena, pregunta_seguridad, respuesta_seguridad };
    try {
      await this.auth.registrar(datos);
      this.snackBar.open('Cuenta creada', 'Cerrar');
      this.router.navigate(['/inicio']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
