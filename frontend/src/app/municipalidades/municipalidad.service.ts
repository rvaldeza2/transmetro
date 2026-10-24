import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Municipalidad, MunicipalidadDatos, MunicipalidadReporte } from './municipalidad.model';

@Injectable({ providedIn: 'root' })
export class MunicipalidadService {
  private http = inject(HttpClient);
  private url = `${API_URL}/municipalidades`;

  list() {
    return firstValueFrom(this.http.get<Municipalidad[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Municipalidad>(`${this.url}/${id}`));
  }

  create(data: MunicipalidadDatos) {
    return firstValueFrom(this.http.post<Municipalidad>(this.url, data));
  }

  update(id: number, data: MunicipalidadDatos) {
    return firstValueFrom(this.http.put<Municipalidad>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  // RF10: líneas, estaciones y buses que corresponden a la municipalidad
  reporte(id: number) {
    return firstValueFrom(this.http.get<MunicipalidadReporte>(`${this.url}/${id}/reporte`));
  }
}
