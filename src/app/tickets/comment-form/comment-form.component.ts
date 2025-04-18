import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comment-form',
  standalone: false,
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss'
})
export class CommentFormComponent {
  @Input() ticketId!: number;
  @Output() commentAdded = new EventEmitter<void>();
  
  commentForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private snackBar: MatSnackBar
  ) { 
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  onSubmit(): void {
    if (this.commentForm.invalid || !this.ticketId) {
      return;
    }

    this.submitting = true;
    const commentData = {
      content: this.commentForm.value.content,
      ticketId: this.ticketId
    };

    this.commentService.createComment(commentData).subscribe({
      next: () => {
        this.snackBar.open('Comment added successfully', 'Close', { duration: 3000 });
        this.commentForm.reset();
        this.submitting = false;
        this.commentAdded.emit();
      },
      error: (error) => {
        this.snackBar.open('Failed to add comment', 'Close', { duration: 5000 });
        this.submitting = false;
        console.error('Error adding comment', error);
      }
    });
  }
}
