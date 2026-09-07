import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoBarra } from '../../shared/models/tipo-barra.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TiposBarraService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/barras`;

  getAll(
    page = 1,
    limit = 10,
    sortBy?: string,
    order?: 'asc' | 'desc',
    search?: string,
  ): Observable<PaginatedResponse<TipoBarra>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (order) params = params.set('order', order);
    if (search && search.trim() !== '')
      params = params.set('search', search.trim());
    return this.http.get<PaginatedResponse<TipoBarra>>(this.url, { params });
  }

  getById(id: string): Observable<TipoBarra> {
    return this.http.get<TipoBarra>(`${this.url}/${id}`);
  }

  create(evento: TipoBarra): Observable<TipoBarra> {
    return this.http.post<TipoBarra>(this.url, evento);
  }

  update(id: string, evento: TipoBarra): Observable<TipoBarra> {
    return this.http.put<TipoBarra>(`${this.url}/${id}`, evento);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
