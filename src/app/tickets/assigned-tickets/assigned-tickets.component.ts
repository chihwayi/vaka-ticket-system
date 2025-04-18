import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Ticket, TicketStatus, TicketPriority } from '../../models/ticket.model';
import { TicketService } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-assigned-tickets',
  standalone: false,
  templateUrl: './assigned-tickets.component.html',
  styleUrl: './assigned-tickets.component.scss'
})
export class AssignedTicketsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'creator', 'createdAt', 'actions'];
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
    this.loadAssignedTickets();
  }

  loadAssignedTickets(): void {
    this.loading = true;
    this.ticketService.getAssignedTickets(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.content;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load assigned tickets', 'Close', { duration: 5000 });
          this.loading = false;
          console.error('Error loading assigned tickets', error);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAssignedTickets();
  }

  viewTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  updateStatus(ticket: Ticket, status: TicketStatus): void {
    if(ticket.id !== undefined) {
    this.ticketService.updateTicketStatus(ticket.id, status).subscribe({
      next: () => {
        this.snackBar.open('Ticket status updated successfully', 'Close', { duration: 3000 });
        this.loadAssignedTickets();
      },
      error: (error) => {
        this.snackBar.open('Failed to update ticket status', 'Close', { duration: 5000 });
        console.error('Error updating ticket status', error);
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
}
