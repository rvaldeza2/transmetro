import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Bus, BusDatos, BusNuevo, EvaluacionEspera } from './bus.model';

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);
  private url = `${API_URL}/buses`;

  list() {
    return firstValueFrom(this.http.get<Bus[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Bus>(`${this.url}/${id}`));
  }

  create(data: BusNuevo) {
    return firstValueFrom(this.http.post<Bus>(this.url, data));
  }

  update(id: number, data: BusDatos) {
    return firstValueFrom(this.http.put<Bus>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  asignarLinea(id: number, idLinea: number) {
    return firstValueFrom(this.http.put<Bus>(`${this.url}/${id}/linea`, { id_linea: idLinea }));
  }

  retirarDeLinea(id: number) {
    return firstValueFrom(this.http.delete<Bus>(`${this.url}/${id}/linea`));
  }

  cambiarParqueo(id: number, idParqueo: number) {
    return firstValueFrom(this.http.put<Bus>(`${this.url}/${id}/parqueo`, { id_parqueo: idParqueo }));
  }

  evaluarEspera(id: number, pasajeros: number) {
    return firstValueFrom(this.http.post<EvaluacionEspera>(`${this.url}/${id}/evaluar-espera`, { pasajeros }));
  }
}
