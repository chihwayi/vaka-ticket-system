import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  ContentType
} from '../../models/ticket.model';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticket-form',
  standalone: false,
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
})
export class TicketFormComponent implements OnInit {
  ticketForm!: FormGroup;
  loading = false;
  submitted = false;
  editMode = false;
  ticketId?: number;
  priorities = Object.values(TicketPriority);
  contentTypes = Object.values(ContentType);
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isAudio = false;

  constructor(
    private formBuilder: FormBuilder,
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Debug authentication
    console.log('Is logged in:', this.authService.isLoggedIn());
    console.log('Token:', this.authService.getToken()?.substring(0, 10) + '...');
    
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
      contentType: [ContentType.TEXT, Validators.required],
    });

    // Add listener for content type changes
    this.ticketForm.get('contentType')!.valueChanges.subscribe(value => {
      if (value === ContentType.TEXT) {
        this.selectedFile = null;
        this.previewUrl = null;
        this.isAudio = false;
      }

      if (value === ContentType.AUDIO) {
        this.isAudio = true;
      } else {
        this.isAudio = false;
      }
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
          contentType: ticket.contentType || ContentType.TEXT,
        });
        
        // Handle media previews for existing tickets
        if (ticket.contentType === ContentType.IMAGE && ticket.imagePath) {
          this.previewUrl = `${environment.apiUrl}/api/files/${ticket.imagePath}`;
          this.isAudio = false;
        } else if (ticket.contentType === ContentType.AUDIO && ticket.audioPath) {
          this.previewUrl = `${environment.apiUrl}/api/files/${ticket.audioPath}`;
          this.isAudio = true;
        }
        
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview for images
      if (this.ticketForm.get('contentType')!.value === ContentType.IMAGE) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
      
      // For audio files
      if (this.ticketForm.get('contentType')!.value === ContentType.AUDIO) {
        this.previewUrl = URL.createObjectURL(file);
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.ticketForm.invalid) {
      return;
    }

    this.loading = true;
    const contentType = this.ticketForm.value.contentType;
    
    if (contentType === ContentType.TEXT || (this.editMode && !this.selectedFile)) {
      // For text tickets or updates without new files
      const ticketData: Partial<Ticket> = {
        title: this.ticketForm.value.title,
        description: this.ticketForm.value.description,
        priority: this.ticketForm.value.priority,
        contentType: contentType,
      };

      if (this.editMode && this.ticketId) {
        this.updateTicket(this.ticketId, ticketData);
      } else {
        this.createTicket(ticketData);
      }
    } else {
      // For tickets with media
      this.createTicketWithMedia();
    }
  }

  createTicket(ticketData: Partial<Ticket>): void {
    console.log('Sending ticket creation request');
    console.log('Auth token present:', !!this.authService.getToken());

    this.ticketService.createTicket(ticketData).subscribe({
      next: (newTicket) => {
        this.snackBar.open('Ticket created successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/tickets', newTicket.id]);
      },
      error: (error) => {
        console.error('Full error creating ticket:', error);
        if (error.status === 401) {
          this.snackBar.open(
            'Authentication error. Please log in again',
            'Close',
            {
              duration: 5000,
            }
          );
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open('Failed to create ticket', 'Close', {
            duration: 5000,
          });
        }
        this.loading = false;
      },
    });
  }

  createTicketWithMedia(): void {
    this.ticketService.createTicketWithMedia(
      this.ticketForm.value.title,
      this.ticketForm.value.description,
      this.ticketForm.value.priority,
      this.selectedFile,
      this.ticketForm.value.contentType
    ).subscribe({
      next: (newTicket) => {
        this.snackBar.open('Ticket created successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/tickets', newTicket.id]);
      },
      error: (error) => {
        console.error('Error creating ticket with media:', error);
        this.snackBar.open('Failed to create ticket', 'Close', {
          duration: 5000,
        });
        this.loading = false;
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