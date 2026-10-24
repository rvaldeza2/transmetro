import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Guardia, GuardiaDatos } from './guardia.model';

@Injectable({ providedIn: 'root' })
export class GuardiaService {
  private http = inject(HttpClient);
  private url = `${API_URL}/guardias`;

  list() {
    return firstValueFrom(this.http.get<Guardia[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Guardia>(`${this.url}/${id}`));
  }

  create(data: GuardiaDatos) {
    return firstValueFrom(this.http.post<Guardia>(this.url, data));
  }

  update(id: number, data: GuardiaDatos) {
    return firstValueFrom(this.http.put<Guardia>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
