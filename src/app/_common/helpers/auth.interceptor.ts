import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../_services/common/auth.service';
import { EnvService } from '../../_services/common/env.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private env: EnvService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to api url
      this.authService.determineLocalIp();
    const user = this.authService.userValue;
    const isLoggedIn = user && user.access_token;
    const isApiUrl = request.url.startsWith(this.env.API_URL);
    if (isLoggedIn && isApiUrl) {

      const ___header = {
        Authorization: `Bearer ${user.access_token}`,
        'MyCurrentConnecion': JSON.stringify(user.connecion),
        'Content-Type': 'application/json',
      };
      if (request.url.indexOf('api/token') >= 0) {
        ___header['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (request.url.indexOf('upload') >= 0) {

      } else {
        ___header['Content-Type'] = 'application/json';
      }
      request = request.clone({
        setHeaders: ___header
      });


    }

    return next.handle(request);
  }
}
