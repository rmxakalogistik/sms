import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../_services/common/auth.service';
import { EnvService } from '../../_services/common/env.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private env: EnvService, ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].indexOf(err.status) !== -1 && request.url.indexOf(`${this.env.API_URL}`) >= 0 ){
        ////console.log(request);
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        this.authService.logout();
      } else {}
      let _err: string = null;
      try {
        if (err && err.error && err.error.error) {
          if (err.error.error.message) {
            _err = err.error.error.message;
          } else if (err.error.error.error_description) {
            _err = err.error.error.error_description;
          }
        } else if (err && err.error) {
          if (err.error.message) {
            _err = err.error.message;
          } else if (err.error.error_description) {
            _err = err.error.error_description;
          }
        } else {
          //console.warn('RAMY CHECK: ' + err);
          _err = err.statusText;
        }
      } catch (e) {
        //console.error(`ERROR-interceptor: ${e}`);
      }
      const error = '[' + err.status + ']: ' +  (_err);
      return throwError(error);
    }));
  }
}
