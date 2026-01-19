import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authorization = authService.getAuthorizationHeader();

  const authRequest = authorization
    ? request.clone({
        setHeaders: {
          Authorization: authorization
        }
      })
    : request;

  return next(authRequest).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
