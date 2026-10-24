import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import {
  AccesoLinea,
  BusLinea,
  DistanciaDatos,
  Linea,
  LineaConEstaciones,
  LineaDatos,
  LineaEstacionDatos,
  ValidacionLinea,
} from './linea.model';

@Injectable({ providedIn: 'root' })
export class LineaService {
  private http = inject(HttpClient);
  private url = `${API_URL}/lineas`;

  list() {
    return firstValueFrom(this.http.get<Linea[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Linea>(`${this.url}/${id}`));
  }

  create(data: LineaDatos) {
    return firstValueFrom(this.http.post<Linea>(this.url, data));
  }

  update(id: number, data: LineaDatos) {
    return firstValueFrom(this.http.put<Linea>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  estaciones(id: number) {
    return firstValueFrom(this.http.get<LineaConEstaciones>(`${this.url}/${id}/estaciones`));
  }

  agregarEstacion(id: number, data: LineaEstacionDatos) {
    return firstValueFrom(this.http.post<LineaConEstaciones>(`${this.url}/${id}/estaciones`, data));
  }

  actualizarEstacion(id: number, idEstacion: number, data: DistanciaDatos) {
    return firstValueFrom(
      this.http.put<LineaConEstaciones>(`${this.url}/${id}/estaciones/${idEstacion}`, data)
    );
  }

  quitarEstacion(id: number, idEstacion: number) {
    return firstValueFrom(this.http.delete<LineaConEstaciones>(`${this.url}/${id}/estaciones/${idEstacion}`));
  }

  accesos(id: number) {
    return firstValueFrom(this.http.get<AccesoLinea[]>(`${this.url}/${id}/accesos`));
  }

  buses(id: number) {
    return firstValueFrom(this.http.get<BusLinea[]>(`${this.url}/${id}/buses`));
  }

  validacion(id: number) {
    return firstValueFrom(this.http.get<ValidacionLinea>(`${this.url}/${id}/validacion`));
  }
}
