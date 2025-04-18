import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../comment.service';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comment-list',
  standalone: false,
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss'
})
export class CommentListComponent implements OnInit {
  @Input() ticketId!: number;
  comments: Comment[] = [];
  loading = false;
  editingCommentId: number | null = null;
  editCommentText: string = '';

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    if (!this.ticketId) return;
    
    this.loading = true;
    this.commentService.getCommentsByTicketId(this.ticketId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load comments', 'Close', { duration: 5000 });
        this.loading = false;
        console.error('Error loading comments', error);
      }
    });
  }

  startEdit(comment: Comment): void {
    this.editingCommentId = comment.id ?? null;
    this.editCommentText = comment.content;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEdit(comment: Comment): void {
    if (!this.editCommentText.trim()) {
      this.snackBar.open('Comment cannot be empty', 'Close', { duration: 3000 });
      return;
    }

    const updatedComment = { ...comment, content: this.editCommentText };
    if (comment.id !== undefined) {
    this.commentService.updateComment(comment.id, updatedComment).subscribe({
      next: () => {
        this.snackBar.open('Comment updated successfully', 'Close', { duration: 3000 });
        this.loadComments();
        this.cancelEdit();
      },
      error: (error) => {
        this.snackBar.open('Failed to update comment', 'Close', { duration: 5000 });
        console.error('Error updating comment', error);
      }
    });
  }
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.snackBar.open('Comment deleted successfully', 'Close', { duration: 3000 });
          this.loadComments();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete comment', 'Close', { duration: 5000 });
          console.error('Error deleting comment', error);
        }
      });
    }
  }

  canModifyComment(comment: Comment): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser && !!(currentUser.id === comment.createdBy?.id || !!(this.authService.isAdmin()));
  }

  getTimeAgo(date: Date | undefined): string {
    // Handle undefined case first
    if (!date) {
      return 'Unknown time';
    }
  
    const now = new Date();
    const commentDate = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffMinutes > 0) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    return 'just now';
  }
}
