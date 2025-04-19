import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Role } from '../../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      if (route.data['roles'] && route.data['roles'].length) {
        const hasRequiredRole = route.data['roles'].some((role: string) => 
          this.authService.hasRole(role as unknown as Role)
        );
        
        if (!hasRequiredRole) {
          this.router.navigate(['/auth/login']);
          return false;
        }
      }
      
      return true;
    }
    
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}