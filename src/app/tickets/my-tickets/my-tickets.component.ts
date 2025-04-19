import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Ticket, TicketStatus, TicketPriority } from '../../models/ticket.model';
import { TicketService } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-tickets',
  standalone: false,
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'assignedTo', 'createdAt', 'actions'];
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
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyTickets();
  }

  loadMyTickets(): void {
    this.loading = true;
    this.ticketService.getMyTickets(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.content;
          this.totalElements = response.totalElements;
          this.loading = false;
          console.log('My tickets loaded successfully', response);
        },
        error: (error) => {
          this.snackBar.open('Failed to load your tickets', 'Close', { duration: 5000 });
          this.loading = false;
          console.error('Error loading your tickets', error);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMyTickets();
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
          this.loadMyTickets();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete ticket', 'Close', { duration: 5000 });
          console.error('Error deleting ticket', error);
        }
      });
    }
  }

  createNewTicket(): void {
    this.router.navigate(['/tickets/new']);
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
      case TicketPriority.CRITICAL:
        return 'priority-critical';
      default:
        return '';
    }
  }
}
