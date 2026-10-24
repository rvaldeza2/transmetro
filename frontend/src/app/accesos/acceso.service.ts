import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Acceso, AccesoDatos, AccesoNuevo } from './acceso.model';

@Injectable({ providedIn: 'root' })
export class AccesoService {
  private http = inject(HttpClient);
  private url = `${API_URL}/accesos`;

  list() {
    return firstValueFrom(this.http.get<Acceso[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Acceso>(`${this.url}/${id}`));
  }

  create(data: AccesoNuevo) {
    return firstValueFrom(this.http.post<Acceso>(this.url, data));
  }

  update(id: number, data: AccesoDatos) {
    return firstValueFrom(this.http.put<Acceso>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  asignarGuardia(id: number, idGuardia: number) {
    return firstValueFrom(this.http.post<Acceso>(`${this.url}/${id}/guardias`, { id_guardia: idGuardia }));
  }

  retirarGuardia(id: number, idGuardia: number) {
    return firstValueFrom(this.http.delete<Acceso>(`${this.url}/${id}/guardias/${idGuardia}`));
  }
}
