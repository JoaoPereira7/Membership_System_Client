import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notification = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          notification.error(
            'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
          );
        } else if (error.status >= 500) {
          notification.error(
            'O serviço está temporariamente indisponível. Tente novamente em alguns instantes.',
          );
        }
      }

      return throwError(() => error);
    }),
  );
};
