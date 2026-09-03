import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteCompleto } from '../../shared/models/cliente.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/clientes`;

  getAll(
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    order?: 'asc' | 'desc',
    search?: string, // <-- NUEVO PARÁMETRO
  ): Observable<PaginatedResponse<ClienteCompleto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (order) {
      params = params.set('order', order);
    }
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim()); // <-- Añade el parámetro a la consulta HTTP
    }

    return this.http.get<PaginatedResponse<ClienteCompleto>>(this.url, {
      params,
    });
  }

  getById(id: string): Observable<ClienteCompleto> {
    return this.http.get<ClienteCompleto>(`${this.url}/${id}`);
  }

  create(cliente: ClienteCompleto): Observable<ClienteCompleto> {
    return this.http.post<ClienteCompleto>(this.url, cliente);
  }

  update(id: string, cliente: ClienteCompleto): Observable<ClienteCompleto> {
    return this.http.put<ClienteCompleto>(`${this.url}/${id}`, cliente);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
