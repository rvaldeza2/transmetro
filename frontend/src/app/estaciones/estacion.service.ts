import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { AccesoDeEstacion, Estacion, EstacionDatos, EvaluacionCapacidad, LineaDeEstacion } from './estacion.model';

@Injectable({ providedIn: 'root' })
export class EstacionService {
  private http = inject(HttpClient);
  private url = `${API_URL}/estaciones`;

  list() {
    return firstValueFrom(this.http.get<Estacion[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Estacion>(`${this.url}/${id}`));
  }

  create(data: EstacionDatos) {
    return firstValueFrom(this.http.post<Estacion>(this.url, data));
  }

  update(id: number, data: EstacionDatos) {
    return firstValueFrom(this.http.put<Estacion>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  evaluarCapacidad(id: number, pasajeros: number) {
    return firstValueFrom(
      this.http.post<EvaluacionCapacidad>(`${this.url}/${id}/evaluar-capacidad`, { pasajeros })
    );
  }

  // RF02: líneas que pasan por la estación
  lineas(id: number) {
    return firstValueFrom(this.http.get<LineaDeEstacion[]>(`${this.url}/${id}/lineas`));
  }

  accesos(id: number) {
    return firstValueFrom(this.http.get<AccesoDeEstacion[]>(`${this.url}/${id}/accesos`));
  }
}
