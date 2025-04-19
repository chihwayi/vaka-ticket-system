import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../models/user.model';
import { UserManagementService } from './user-management.service';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { DeleteUserDialogComponent } from './delete-user-dialog/delete-user-dialog.component';
import { finalize } from 'rxjs/operators';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'fullName', 'email', 'roles', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAllUsers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (users) => {
          this.dataSource.data = users;
        },
        error: (error) => {
          this.error = 'Failed to load users. Please try again later.';
          console.error('Error loading users:', error);
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user: {...user}, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openResetPasswordDialog(user: User): void {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '400px',
      data: { userId: user.id, username: user.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openDeleteUserDialog(user: User): void {
    const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
      width: '400px',
      data: { userId: user.id, username: user.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      }
    });
  }

  getRoleString(user: User): string {
    if (!user.roles || user.roles.length === 0) {
      return '';
    }
    
    // Check if roles is an array of strings or Role objects
    const firstRole = user.roles[0];
    
    // If it's a string array
    if (typeof firstRole === 'string') {
      return (user.roles as string[]).join(', ');
    }
    
    // If it's a Role object array  
    return (user.roles as Role[]).map(role => role.name).join(', ');
  }
}
