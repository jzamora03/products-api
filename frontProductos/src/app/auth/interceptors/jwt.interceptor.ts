import { Injectable, NgZone } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private zone: NgZone) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return new Observable(observer => {
      next.handle(req).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) this.auth.logout();
          return throwError(() => err);
        })
      ).subscribe({
        next: (e) => this.zone.run(() => observer.next(e)),
        error: (e) => this.zone.run(() => observer.error(e)),
        complete: () => this.zone.run(() => observer.complete()),
      });
    });
  }
}