import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtiene el token guardado en el login
  const token = localStorage.getItem('auth_token'); // en LocalStorage

  // 2. Si el token existe, clona la petición y añade la cabecera Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // 3. Si no hay token (ej: en el login), la petición sigue su curso normal
  return next(req);
};
