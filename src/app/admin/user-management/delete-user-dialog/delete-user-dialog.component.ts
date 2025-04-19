import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserManagementService } from '../user-management.service';

interface DialogData {
  userId: number;
  username: string;
}

@Component({
  selector: 'app-delete-user-dialog',
  standalone: false,
  templateUrl: './delete-user-dialog.component.html',
  styleUrl: './delete-user-dialog.component.scss'
})
export class DeleteUserDialogComponent {
  loading = false;
  error: string | null = null;
  
  constructor(
    private userService: UserManagementService,
    public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  confirmDelete(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.deleteUser(this.data.userId).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error deleting user:', error);
        this.error = 'Failed to delete user. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
