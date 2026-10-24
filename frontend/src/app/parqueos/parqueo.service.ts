import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api';
import { Parqueo, ParqueoDatos } from './parqueo.model';

@Injectable({ providedIn: 'root' })
export class ParqueoService {
  private http = inject(HttpClient);
  private url = `${API_URL}/parqueos`;

  list() {
    return firstValueFrom(this.http.get<Parqueo[]>(this.url));
  }

  get(id: number) {
    return firstValueFrom(this.http.get<Parqueo>(`${this.url}/${id}`));
  }

  create(data: ParqueoDatos) {
    return firstValueFrom(this.http.post<Parqueo>(this.url, data));
  }

  update(id: number, data: ParqueoDatos) {
    return firstValueFrom(this.http.put<Parqueo>(`${this.url}/${id}`, data));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
