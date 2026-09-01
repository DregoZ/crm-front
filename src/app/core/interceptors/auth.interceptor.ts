import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  // Añadir token si la petición es a nuestra API
  if (token && req.url.includes('/api/')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo centralizado de errores
      if (error.status === 401) {
        authService.logout(true);
      } else if (error.status === 403) {
        // En una app real se mostraría un toast/snackbar
        console.error('Acción no permitida por rol (403).');
        alert('No tienes permisos para realizar esta acción.');
      } else if (error.status === 409) {
        const msg = error.error?.error || 'Conflicto de integridad de datos (409).';
        console.error(msg);
        alert(msg); // O usar un servicio de notificaciones
      } else if (error.status === 500) {
         console.error('Error interno del servidor (500).', error);
         alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
      }
      return throwError(() => error);
    })
  );
};
