import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Operador, OperadorDatos } from './operador.model';

@Injectable({ providedIn: 'root' })
export class OperadorService {
  private http = inject(HttpClient);
  private url = `${API_URL}/operadores`;

  list() {
    return firstValueFrom(this.http.get<Operador[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Operador>(`${this.url}/${id}`));
  }

  create(data: OperadorDatos) {
    return firstValueFrom(this.http.post<Operador>(this.url, data));
  }

  update(id: number, data: OperadorDatos) {
    return firstValueFrom(this.http.put<Operador>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
