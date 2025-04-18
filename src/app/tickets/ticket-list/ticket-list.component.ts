import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Ticket, TicketStatus, TicketPriority } from '../../models/ticket.model';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ticket-list',
  standalone: false,
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss'
})
export class TicketListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'creator', 'assignedTo', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Ticket>([]);
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;
  ticketStatus = TicketStatus;
  ticketPriority = TicketPriority;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAllTickets(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.content;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load tickets', 'Close', { duration: 5000 });
          this.loading = false;
          console.error('Error loading tickets', error);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  viewTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  editTicket(id: number): void {
    this.router.navigate(['/tickets/edit', id]);
  }

  deleteTicket(id: number): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          this.snackBar.open('Ticket deleted successfully', 'Close', { duration: 3000 });
          this.loadTickets();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete ticket', 'Close', { duration: 5000 });
          console.error('Error deleting ticket', error);
        }
      });
    }
  }

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OPEN:
        return 'status-open';
      case TicketStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TicketStatus.RESOLVED:
        return 'status-resolved';
      case TicketStatus.CLOSED:
        return 'status-closed';
      default:
        return '';
    }
  }

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.LOW:
        return 'priority-low';
      case TicketPriority.MEDIUM:
        return 'priority-medium';
      case TicketPriority.HIGH:
        return 'priority-high';
      case TicketPriority.URGENT:
        return 'priority-urgent';
      default:
        return '';
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
