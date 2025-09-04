import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../_services/common/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecureInnerPagesGuard implements CanActivate {
  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private autheService: AuthService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const user = this.autheService.userValue;
    if (user) {
      this._snackBar.open('Vous n\'êtes pas autorisé à accéder à cette page!', null, {
        duration: 5000
      });
      this.router.navigate(['/']);
    }
    return true;
  }

}
