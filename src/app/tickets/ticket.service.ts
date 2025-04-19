import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Ticket, TicketStatus, TicketPriority } from '../models/ticket.model';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly API_URL = `${environment.apiUrl}/api/tickets`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private router: Router
  ) { }

  getAllTickets(page = 0, size = 10): Observable<PagedResponse<Ticket>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Ticket>>(this.API_URL, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.API_URL}/${id}`).pipe(
      tap(ticket => console.log(`Retrieved ticket ${id}:`, ticket)),
      catchError(error => {
        console.error(`Error retrieving ticket ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    console.log('Creating ticket with token present:', !!this.authService.getToken());
    return this.http.post<Ticket>(this.API_URL, ticket).pipe(
      catchError(error => {
        console.error('HTTP Error in createTicket:', error);
        if (error.status === 401) {
          console.log('Authentication failed, redirecting to login');
          this.router.navigate(['/']);
        }
        return throwError(() => error);
      })
    );
  }

  updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.API_URL}/${id}`, ticket);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateTicketStatus(id: number, status: TicketStatus): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.API_URL}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  assignTicket(id: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.API_URL}/${id}/assign`, null, {
      params: new HttpParams().set('userId', userId.toString())
    });
  }

  getMyTickets(page = 0, size = 10): Observable<PagedResponse<Ticket>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Ticket>>(`${this.API_URL}/my-tickets`, { params });
  }

  getAssignedTickets(page = 0, size = 10): Observable<PagedResponse<Ticket>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Ticket>>(`${this.API_URL}/assigned-to-me`, { params });
  }

  getTicketsByStatus(status: TicketStatus, page = 0, size = 10): Observable<PagedResponse<Ticket>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Ticket>>(`${this.API_URL}/by-status`, { params });
  }

  getTicketsByPriority(priority: TicketPriority, page = 0, size = 10): Observable<PagedResponse<Ticket>> {
    const params = new HttpParams()
      .set('priority', priority)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Ticket>>(`${this.API_URL}/by-priority`, { params });
  }
}