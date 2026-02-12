import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthServ } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServ);

  const accessToken = localStorage.getItem('accessToken');

  let authReq = req;
  if (accessToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        authService.logOut();
        return throwError(() => error);
      }


      return authService.refreshAccessToken(refreshToken).pipe(
        switchMap((res: any) => {
          localStorage.setItem('accessToken', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.accessToken}`
            }
          });

          return next(retryReq);
        }),
        catchError(err => {
          authService.logOut();
          return throwError(() => err);
        })
      );
    })
  );
};
