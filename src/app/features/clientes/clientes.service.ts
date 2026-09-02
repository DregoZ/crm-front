import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../../shared/models/cliente.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/clientes`;

  getAll(page: number, limit: number, sortBy?: string, order?: 'asc' | 'desc') {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (sortBy) params = params.set('sortBy', sortBy);
    if (order) params = params.set('order', order);

    return this.http.get<PaginatedResponse<Cliente>>(`${this.url}`, {
      params,
    });
  }

  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }

  update(id: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, cliente);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
