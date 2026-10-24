import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { FiltroVisitas, Visita, VisitaDatos } from './visita.model';

@Injectable({ providedIn: 'root' })
export class VisitaService {
  private http = inject(HttpClient);
  private url = `${API_URL}/visitas`;

  list(filtro: FiltroVisitas = {}) {
    let params = new HttpParams();
    if (filtro.id_bus) params = params.set('id_bus', filtro.id_bus);
    if (filtro.fecha) params = params.set('fecha', filtro.fecha);
    return firstValueFrom(this.http.get<Visita[]>(this.url, { params }));
  }

  create(data: VisitaDatos) {
    return firstValueFrom(this.http.post<Visita>(this.url, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
