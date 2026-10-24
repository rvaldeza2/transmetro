import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { AuthService } from '../auth.service';
import { LoginDatos } from '../usuario.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  ngOnInit() {
    if (this.auth.token()) this.router.navigate(['/inicio']);
  }

  async ingresar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { usuario, contrasena } = this.form.getRawValue();
    const datos: LoginDatos = { usuario, contrasena };
    try {
      await this.auth.login(datos);
      this.router.navigate(['/inicio']);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
