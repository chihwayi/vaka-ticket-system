import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthResponse, AuthRequest } from '../models/auth-response.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => this.setSession(response)),
        catchError((error) => {
          console.error('Login error', error);
          return throwError(
            () =>
              new Error(
                error.error?.message || 'Login failed. Please try again.'
              )
          );
        })
      );
  }

  register(registerData: {
    username: string;
    email: string;
    fullName: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, registerData).pipe(
      catchError((error) => {
        console.error('Registration error', error);
        return throwError(
          () =>
            new Error(
              error.error?.message || 'Registration failed. Please try again.'
            )
        );
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);

    const user: User = {
      id: authResult.id,
      username: authResult.username,
      email: authResult.email,
      roles: authResult.roles.map(role => role as unknown as Role),
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    // Always navigate to the login page on logout
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('Token retrieved:', !!token);
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (if you have JWT structure)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const isExpired = expiry * 1000 < Date.now();
      
      console.log('Token expiry:', new Date(expiry * 1000));
      console.log('Is token expired:', isExpired);
      
      return !isExpired;
    } catch (e) {
      console.error('Error parsing token:', e);
      return true; // Continue with request if token parsing fails
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: Role): boolean {  
    const user = this.getCurrentUser();  
    return user?.roles?.some(r => 
        (typeof r === 'string' ? r === role.name : r.name === role.name)
    ) || false;  
}

isAdmin(): boolean {
  const adminRole: Role = { id: 0, name: 'ROLE_ADMIN' }; // Replace `id` with the appropriate identifier if needed.
  return this.hasRole(adminRole);
}

isSupport(): boolean {
  const supportRole: Role = { id: 0, name: 'ROLE_SUPPORT' }; // Replace `id` with the appropriate identifier if needed.
  return this.hasRole(supportRole);
}
  isUser(): boolean {
    const userRole: Role = { id: 0, name: 'ROLE_USER' }; // Replace `id` with the appropriate identifier if needed.
    return this.hasRole(userRole);
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    
    return this.http.post<any>(`${environment.apiUrl}/api/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        })
      );
  }
}
