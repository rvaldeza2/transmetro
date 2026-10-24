import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Piloto, PilotoDatos } from './piloto.model';

@Injectable({ providedIn: 'root' })
export class PilotoService {
  private http = inject(HttpClient);
  private url = `${API_URL}/pilotos`;

  list() {
    return firstValueFrom(this.http.get<Piloto[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Piloto>(`${this.url}/${id}`));
  }

  create(data: PilotoDatos) {
    return firstValueFrom(this.http.post<Piloto>(this.url, data));
  }

  update(id: number, data: PilotoDatos) {
    return firstValueFrom(this.http.put<Piloto>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
