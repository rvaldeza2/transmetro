import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Alerta, FiltroAlertas } from './alerta.model';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private http = inject(HttpClient);
  private url = `${API_URL}/alertas`;

  list(filtro: FiltroAlertas = {}) {
    let params = new HttpParams();
    if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro.atendida !== undefined) params = params.set('atendida', String(filtro.atendida));
    return firstValueFrom(this.http.get<Alerta[]>(this.url, { params }));
  }

  atender(id: number) {
    return firstValueFrom(this.http.put<Alerta>(`${this.url}/${id}/atender`, {}));
  }
}
