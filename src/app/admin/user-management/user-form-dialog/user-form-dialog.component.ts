import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { UserManagementService } from '../user-management.service';
import { Role } from '../../../models/role.model';
import { RoleService } from '../role.service';

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
  loadingRoles = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private roleService: RoleService,
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
      
      // Fixed: Use the passwordMatchValidator as a ValidatorFn
      this.userForm.addValidators(this.passwordMatchValidator());
    }
    
    // Make username field readonly in edit mode
    if (mode === 'edit') {
      this.userForm.get('username')?.disable();
    }
  }

  // Fixed: Changed to return a ValidatorFn
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const formGroup = control as FormGroup;
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      
      if (password && confirmPassword && password !== confirmPassword) {
        formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      
      return null;
    };
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.loadingRoles = false;
        
        // If in edit mode, we need to match the existing user roles with the available roles
        if (this.data.mode === 'edit' && this.data.user?.roles) {
          // Fixed: Corrected the type issue by properly casting roles
          const userRoleNames = this.data.user.roles as string[];
          const selectedRoles = userRoleNames.map(roleName => {
            // Find the role object that matches the name
            return this.availableRoles.find(role => role.name === roleName);
          }).filter(role => role !== undefined) as Role[];
          
          this.userForm.get('roles')?.setValue(selectedRoles);
        }
      },
      error: (error) => {
        this.loadingRoles = false;
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
    // Extract role names for API
    const roleNames = formValue.roles.map((role: Role) => role.name);
    
    const user = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      password: formValue.password,
      roles: roleNames
    };

    this.userService.createUser(user).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating user:', error);
        
        if (error.status === 400 && error.error?.message?.includes('Username is already taken')) {
          this.error = 'Username is already taken. Please choose another.';
        } else if (error.status === 400 && error.error?.message?.includes('Email is already in use')) {
          this.error = 'Email is already in use. Please use another email.';
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

    // Extract role names for API
    const roleNames = formValue.roles.map((role: Role) => role.name);
    
    const user = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      roles: roleNames
    };

    this.userService.updateUser(userId, user).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error updating user:', error);
        
        if (error.status === 400 && error.error?.message?.includes('Username is already taken')) {
          this.error = 'Username is already taken. Please choose another.';
        } else if (error.status === 400 && error.error?.message?.includes('Email is already in use')) {
          this.error = 'Email is already in use. Please use another email.';
        } else {
          this.error = 'Failed to update user. Please try again.';
        }
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