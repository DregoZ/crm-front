import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coctel } from '../../../shared/models/coctel.model';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoctelesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/cocteles`;

  getAll(
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    order?: 'asc' | 'desc',
    search?: string,
  ): Observable<PaginatedResponse<Coctel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortBy) params = params.set('sortBy', sortBy);
    if (order) params = params.set('order', order);
    if (search && search.trim() !== '') params = params.set('search', search.trim());

    return this.http.get<PaginatedResponse<Coctel>>(this.url, { params });
  }

  getById(id: string): Observable<Coctel> {
    return this.http.get<Coctel>(`${this.url}/${id}`);
  }

  create(coctel: Partial<Coctel>): Observable<Coctel> {
    return this.http.post<Coctel>(this.url, coctel);
  }

  update(id: string, coctel: Partial<Coctel>): Observable<Coctel> {
    return this.http.put<Coctel>(`${this.url}/${id}`, coctel);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
