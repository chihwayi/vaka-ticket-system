import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/api/roles`;

  constructor(private http: HttpClient) { }

  /**
   * Get all available roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * Get a specific role by ID
   */
  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a role
   */
  updateRole(id: number, roleName: string): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, { name: roleName });
  }
}