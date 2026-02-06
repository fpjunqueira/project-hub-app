import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const localAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (authService.isAuthEnabled()) {
    return next(req);
  }

  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const token = authService.getLocalAccessToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `${token.tokenType} ${token.token}`
      }
    })
  );
};
