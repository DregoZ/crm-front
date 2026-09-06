import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../../shared/models/evento.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/eventos`;

  getAll(page = 1, limit = 10, sortBy?: string, order?: 'asc' | 'desc', search?: string): Observable<PaginatedResponse<Evento>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (order) params = params.set('order', order);
    if (search && search.trim() !== '') params = params.set('search', search.trim());
    return this.http.get<PaginatedResponse<Evento>>(this.url, { params });
  }

  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.url}/${id}`);
  }

  getByCliente(clienteId: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.url}?clienteId=${clienteId}`);
  }

  create(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.url, evento);
  }

  update(id: string, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.url}/${id}`, evento);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
