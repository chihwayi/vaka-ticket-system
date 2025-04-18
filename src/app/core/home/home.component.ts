import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { TicketService } from '../../tickets/ticket.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  currentUser: any = null;
  recentTickets: Ticket[] = [];
  ticketStats = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    total: 0
  };
  loading = false;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.isLoggedIn) {
      this.loadTicketStats();
      this.loadRecentTickets();
    }
  }

  loadTicketStats(): void {
    this.loading = true;
    // In a real application, you'd have an API endpoint for statistics
    // For now, let's just get all tickets and calculate stats here
    this.ticketService.getAllTickets(0, 100).subscribe({
      next: (response) => {
        const tickets = response.content;
        this.ticketStats.total = response.totalElements;
        this.ticketStats.open = tickets.filter(t => t.status === TicketStatus.OPEN).length;
        this.ticketStats.inProgress = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
        this.ticketStats.resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
        this.ticketStats.closed = tickets.filter(t => t.status === TicketStatus.CLOSED).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ticket stats', error);
        this.loading = false;
      }
    });
  }

  loadRecentTickets(): void {
    if (this.isAdmin || this.isSupport) {
      this.ticketService.getAllTickets(0, 5).subscribe({
        next: (response) => {
          this.recentTickets = response.content;
        },
        error: (error) => {
          console.error('Error loading recent tickets', error);
        }
      });
    } else {
      this.ticketService.getMyTickets(0, 5).subscribe({
        next: (response) => {
          this.recentTickets = response.content;
        },
        error: (error) => {
          console.error('Error loading my tickets', error);
        }
      });
    }
  }

  goToTickets(): void {
    this.router.navigate(['/tickets']);
  }

  goToCreateTicket(): void {
    this.router.navigate(['/tickets/new']);
  }

  goToMyTickets(): void {
    this.router.navigate(['/tickets/my-tickets']);
  }

  goToAssignedTickets(): void {
    this.router.navigate(['/tickets/assigned']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isSupport(): boolean {
    return this.authService.isSupport();
  }
}
