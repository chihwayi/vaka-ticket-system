import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from '../../models/ticket.model';
import { User } from '../../models/user.model';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../auth/user.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: false,
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss',
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  ticketId!: number;
  ticketStatus = TicketStatus;
  ticketPriority = TicketPriority;
  users: User[] = [];
  selectedAssigneeId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.ticketId = +params['id'];
        this.loadTicket();
        this.loadUsers();
      }
    });
  }

  loadTicket(): void {
    this.loading = true;
    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.selectedAssigneeId = ticket.assignedTo?.id || null;
        this.loading = false;
        console.log('Ticket loaded successfully', ticket);
      },
      error: (error) => {
        this.snackBar.open('Failed to load ticket details', 'Close', {
          duration: 5000,
        });
        this.loading = false;
        console.error('Error loading ticket details', error);
      },
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 5000 });
      },
    });
  }

  editTicket(): void {
    this.router.navigate(['/tickets/edit', this.ticketId]);
  }

  deleteTicket(): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(this.ticketId).subscribe({
        next: () => {
          this.snackBar.open('Ticket deleted successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/tickets']);
        },
        error: (error) => {
          this.snackBar.open('Failed to delete ticket', 'Close', {
            duration: 5000,
          });
          console.error('Error deleting ticket', error);
        },
      });
    }
  }

  updateStatus(status: TicketStatus): void {
    if (!this.ticket) return;

    this.ticketService.updateTicketStatus(this.ticketId, status).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.snackBar.open('Ticket status updated successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to update ticket status', 'Close', {
          duration: 5000,
        });
        console.error('Error updating ticket status', error);
      },
    });
  }

  assignTicket(): void {
    if (!this.ticket || !this.selectedAssigneeId) return;

    this.ticketService
      .assignTicket(this.ticketId, this.selectedAssigneeId)
      .subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.snackBar.open('Ticket assigned successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open('Failed to assign ticket', 'Close', {
            duration: 5000,
          });
          console.error('Error assigning ticket', error);
        },
      });
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

  onCommentAdded(): void {
    this.loadTicket();
  }

  get canEdit(): boolean {
    if (!this.ticket) return false;
    const currentUser = this.authService.getCurrentUser();
    return (
      !!currentUser &&
      (this.authService.isAdmin() ||
        currentUser.id === this.ticket.creator?.id ||
        currentUser.id === this.ticket.assignedTo?.id)
    );
  }

  get canAssign(): boolean {
    return (
      this.authService.isAdmin() || this.authService.hasRole('ROLE_SUPPORT')
    );
  }

  get canDelete(): boolean {
    return this.authService.isAdmin();
  }
}
