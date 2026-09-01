import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, AuthResponse } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  
  // Signal para el usuario actual
  public currentUser = signal<Usuario | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    // En un entorno real se decodificaría el JWT para restaurar los datos
    if (token) {
      // Mock básico de recarga
      this.currentUser.set({ id: '1', nombre: 'Admin', rol: 'admin' });
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.currentUser.set(response.usuario);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(sessionExpired = false): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    const queryParams = sessionExpired ? { sessionExpired: true } : {};
    this.router.navigate(['/login'], { queryParams });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
