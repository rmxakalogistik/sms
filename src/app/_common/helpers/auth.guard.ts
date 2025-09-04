import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../_services/common/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree  {
    
    this.authService.determineLocalIp();
    const user = this.authService.userValue;
    if (user) {
      // check if route is restricted by role
      if (next.data.roles) {// && next.data.roles.indexOf(user.role) === -1
        for (const _r of next.data.roles) {
          if (this.authService.roleEXist(_r)) { return true; }
        }

        // role not authorised so redirect to home page
        this.router.navigate(['/']);
        return false;
      }

      // authorised so return true
      return true;
    }

    this._snackBar.open('Vous n\'êtes pas autorisé à accéder à cette page!', null, {
      duration: 5000
    });
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/sds-login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
