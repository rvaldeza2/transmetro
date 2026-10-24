import { Component, inject, signal } from '@angular/core';
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

// Recuperación en dos pasos: 1) usuario → pregunta, 2) respuesta + contraseña nueva.
// Se usó pregunta de seguridad en lugar de correo porque la tabla usuario no guarda email
// y así no dependemos de configurar un servidor SMTP en Render.
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './recuperar.html',
})
export class Recuperar {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  pregunta = signal<string | null>(null);

  formUsuario = this.fb.group({
    usuario: ['', Validators.required],
  });

  formRespuesta = this.fb.group(
    {
      respuesta_seguridad: ['', Validators.required],
      nueva_contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', Validators.required],
    },
    { validators: contrasenasIguales('nueva_contrasena', 'confirmacion') }
  );

  async buscarPregunta() {
    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      return;
    }
    try {
      const respuesta = await this.auth.preguntaSeguridad(this.formUsuario.getRawValue().usuario);
      this.pregunta.set(respuesta.pregunta_seguridad);
      this.formUsuario.disable();
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  cambiarUsuario() {
    this.pregunta.set(null);
    this.formRespuesta.reset();
    this.formUsuario.enable();
  }

  async restablecer() {
    if (this.formRespuesta.invalid) {
      this.formRespuesta.markAllAsTouched();
      return;
    }
    const { respuesta_seguridad, nueva_contrasena } = this.formRespuesta.getRawValue();
    try {
      const respuesta = await this.auth.restablecerContrasena({
        usuario: this.formUsuario.getRawValue().usuario,
        respuesta_seguridad,
        nueva_contrasena,
      });
      this.snackBar.open(respuesta.mensaje, 'Cerrar');
      this.router.navigate(['/login']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
