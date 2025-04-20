import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}api/reports`;

  constructor(private http: HttpClient) { }

  getTicketTrends(startDate: Date, endDate: Date): Observable<any> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get(`${this.apiUrl}/ticket-trends`, { params }).pipe(
      catchError(this.handleError('getTicketTrends', []))
    );
  }

  getStatusDistribution(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status-distribution`).pipe(
      catchError(this.handleError('getStatusDistribution', []))
    );
  }

  getPriorityAnalysis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/priority-analysis`).pipe(
      catchError(this.handleError('getPriorityAnalysis', []))
    );
  }

  getUserActivity(days: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-activity?days=${days}`).pipe(
      catchError(this.handleError('getUserActivity', []))
    );
  }

  getPerformanceMetrics(userId?: number): Observable<any> {
    const params: Record<string, string> = {};
    if (userId !== undefined) {
      params['userId'] = userId.toString();
    }
    return this.http.get(`${this.apiUrl}/performance-metrics`, { params }).pipe(
      catchError(this.handleError('getPerformanceMetrics', []))
    );
  }

  getResponseTimes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/response-times`).pipe(
      catchError(this.handleError('getResponseTimes', []))
    );
  }

  getResponseTimeAnalysis(startDate: Date, endDate: Date): Observable<any> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get(`${this.apiUrl}/response-time`, { params }).pipe(
      catchError(this.handleError('getResponseTimeAnalysis', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}