import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { UserManagementService } from '../user-management.service';
import { Role } from '../../../models/role.model';


interface DialogData {
  user: User | null;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: false,
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss'
})
export class UserFormDialogComponent implements OnInit {
  userForm!: FormGroup;
  availableRoles: Role[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.initForm();
  }

  private initForm(): void {
    const { user, mode } = this.data;
    
    this.userForm = this.fb.group({
      username: [user?.username || '', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      fullName: [user?.fullName || '', [Validators.required]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      roles: [user?.roles || [], [Validators.required, Validators.minLength(1)]],
    });

    // Add password fields only for create mode
    if (mode === 'create') {
      this.userForm.addControl('password', this.fb.control('', [
        Validators.required,
        Validators.minLength(8)
      ]));
      this.userForm.addControl('confirmPassword', this.fb.control('', [
        Validators.required
      ]));
    }
    
    // Make username field readonly in edit mode
    if (mode === 'edit') {
      this.userForm.get('username')?.disable();
    }
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = 'Failed to load user roles. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.userForm.getRawValue();
    
    if (this.data.mode === 'create') {
      this.createUser(formValue);
    } else {
      this.updateUser(formValue);
    }
  }

  private createUser(formValue: any): void {
    const user = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      password: formValue.password,
      roles: formValue.roles
    };

    this.userService.createUser(user as User).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating user:', error);
        
        if (error.status === 409) {
          this.error = 'Username or email already exists.';
        } else {
          this.error = 'Failed to create user. Please try again.';
        }
      }
    });
  }

  private updateUser(formValue: any): void {
    const userId = this.data.user?.id;
    if (!userId) {
      this.loading = false;
      this.error = 'User ID is missing. Cannot update user.';
      return;
    }

    const user = {
      id: userId,
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      roles: formValue.roles
    };

    this.userService.updateUser(userId, user as User).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error updating user:', error);
        this.error = 'Failed to update user. Please try again.';
      }
    });
  }

  compareRoles(role1: Role, role2: Role): boolean {
    return role1 && role2 ? role1.id === role2.id : role1 === role2;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}