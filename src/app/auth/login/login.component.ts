import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../../_services/common/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EncrDecrService } from '../../_services/common/encr-decr.service';
import { EnvService } from 'src/app/_services/common/env.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  isforgotPassword = false;
  hide = true;

  authImage = "assets/img/logo-secondary-mini.png";
  // authImage_bas = "assets/img/logo-bas.png";
  // authImage_logooutsourcing = "assets/img/OUTSOURCING1.png";

  returnUrl: string;
  localip: string;
  // error = '';

  public version: string;  // <-- Our version string
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private encrDecr: EncrDecrService,
    private env: EnvService,
  ) {
    this.version = this.env.APP_VERSION;
    this.localip = this.authService.localIpValue;
    
    this.authService.localIp.subscribe(x => this.localip = x);
    // redirect to home if already logged in
    if (this.authService.userValue) {
      this.router.navigate(['/sds-secure']);
    }
  }



ngOnInit() {
  this.loginForm = this.formBuilder.group({
    email: [null],
    password: [null]
  });

  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/sds-secure';
}

// convenience getter for easy access to form fields
get f() { return this.loginForm.controls; }

onSubmit() {

  // stop here if form is invalid
  if (this.loginForm.invalid || this.f.email.value == undefined || this.f.email.value == null || this.f.password.value == undefined || this.f.password.value == null) {
    return;
  }

  // this.error = '';
  this.loading = true;

  setTimeout(() => {

    this.authService.login(this.encrDecr.set(this.f.email.value), this.encrDecr.set(this.f.password.value))
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          console.log(error);
          if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
            error = 'Impossible d\'ouvrir votre session, veuillez réessayer.';
          }
          this._snackBar.open(error, null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
          });
          this.loading = false;
          this.isforgotPassword = true;
          this.f.password.setValue(null);
        });

  }, 1500);


}

  reloadApp() {
    window.location.reload();
  }

}
