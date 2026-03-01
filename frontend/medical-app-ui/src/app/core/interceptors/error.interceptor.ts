import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // For auth endpoints (/auth/**), let the component handle errors itself.
      // This prevents a redirect loop on login failures and avoids duplicate toasts.
      if (req.url.includes('/auth/')) {
        return throwError(() => error);
      }

      // For 401s on protected endpoints, clear session and redirect to login.
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
        return EMPTY;
      }

      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      toastService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
