import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoBarra } from '../../../shared/models/tipo-barra.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TiposBarraService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tipos-barra`;

  getAll(): Observable<TipoBarra[]> {
    return this.http.get<TipoBarra[]>(this.url);
  }
}
