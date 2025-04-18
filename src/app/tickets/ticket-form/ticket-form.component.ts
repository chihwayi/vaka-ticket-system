import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../models/ticket.model';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: false,
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss',
})
export class TicketFormComponent implements OnInit {
  ticketForm!: FormGroup;
  loading = false;
  submitted = false;
  editMode = false;
  ticketId?: number;
  priorities = Object.values(TicketPriority);

  constructor(
    private formBuilder: FormBuilder,
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.ticketId = +params['id'];
        this.loadTicket(this.ticketId);
      }
    });
  }

  initForm(): void {
    this.ticketForm = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: [TicketPriority.MEDIUM, Validators.required],
    });
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.ticketForm.patchValue({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load ticket data', 'Close', {
          duration: 5000,
        });
        this.loading = false;
        console.error('Error loading ticket', error);
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.ticketForm.invalid) {
      return;
    }

    this.loading = true;
    const ticketData: Partial<Ticket> = {
      title: this.ticketForm.value.title,
      description: this.ticketForm.value.description,
      priority: this.ticketForm.value.priority,
    };

    if (this.editMode && this.ticketId) {
      this.updateTicket(this.ticketId, ticketData);
    } else {
      this.createTicket(ticketData);
    }
  }

  createTicket(ticketData: Partial<Ticket>): void {
    this.ticketService.createTicket(ticketData).subscribe({
      next: (newTicket) => {
        this.snackBar.open('Ticket created successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/tickets', newTicket.id]);
      },
      error: (error) => {
        this.snackBar.open('Failed to create ticket', 'Close', {
          duration: 5000,
        });
        this.loading = false;
        console.error('Error creating ticket', error);
      },
    });
  }

  updateTicket(id: number, ticketData: Partial<Ticket>): void {
    this.ticketService.updateTicket(id, ticketData).subscribe({
      next: (updatedTicket) => {
        this.snackBar.open('Ticket updated successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/tickets', updatedTicket.id]);
      },
      error: (error) => {
        this.snackBar.open('Failed to update ticket', 'Close', {
          duration: 5000,
        });
        this.loading = false;
        console.error('Error updating ticket', error);
      },
    });
  }

  get f() {
    return this.ticketForm.controls;
  }

  cancel(): void {
    if (this.editMode && this.ticketId) {
      this.router.navigate(['/tickets', this.ticketId]);
    } else {
      this.router.navigate(['/tickets']);
    }
  }
}
