import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    const token = this.authService.getToken();
    
    if (isApiUrl && token) {
      const authHeader = `Bearer ${token}`;
      console.log('Authorization header:', authHeader.substring(0, 20) + '...');
      
      request = request.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
    }
    
    return next.handle(request);
  }
}