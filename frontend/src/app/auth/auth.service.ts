import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import {
  LoginDatos,
  PreguntaSeguridad,
  RegistroDatos,
  RespuestaLogin,
  RestablecerDatos,
  Usuario,
} from './usuario.model';

const CLAVE_TOKEN = 'transmetro_token';
const CLAVE_USUARIO = 'transmetro_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // La sesión se conserva en el navegador para no pedir login al recargar la página
  token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));
  usuario = signal<Usuario | null>(this.leerUsuario());

  async login(datos: LoginDatos) {
    this.guardarSesion(await firstValueFrom(this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos)));
  }

  // Al crear la cuenta se inicia sesión de una vez
  async registrar(datos: RegistroDatos) {
    this.guardarSesion(await firstValueFrom(this.http.post<RespuestaLogin>(`${API_URL}/auth/registro`, datos)));
  }

  preguntaSeguridad(usuario: string) {
    return firstValueFrom(this.http.post<PreguntaSeguridad>(`${API_URL}/auth/recuperar/pregunta`, { usuario }));
  }

  restablecerContrasena(datos: RestablecerDatos) {
    return firstValueFrom(this.http.post<{ mensaje: string }>(`${API_URL}/auth/recuperar`, datos));
  }

  private guardarSesion(respuesta: RespuestaLogin) {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    this.token.set(respuesta.token);
    this.usuario.set(respuesta.usuario);
  }

  logout() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.token.set(null);
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  private leerUsuario(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    if (!guardado) return null;
    const usuario: Usuario = JSON.parse(guardado);
    return usuario;
  }
}
