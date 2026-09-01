import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coctel } from '../../../shared/models/coctel.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoctelesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/cocteles`;

  // Asumiendo que el backend no pagina cocteles aún o devuelve array directo
  getAll(): Observable<Coctel[]> {
    return this.http.get<Coctel[]>(this.url);
  }

  getById(id: string): Observable<Coctel> {
    return this.http.get<Coctel>(`${this.url}/${id}`);
  }

  create(coctel: Coctel): Observable<Coctel> {
    return this.http.post<Coctel>(this.url, coctel);
  }
}
