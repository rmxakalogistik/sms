import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../_services/common/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  hide = true;

  authImage = "assets/img/logo-secondary-mini.png";

  returnUrl: string;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.userValue) {
      this.router.navigate(['/']);
    }
  }


  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  get f() { return this.forgotPasswordForm.controls; }


  onSubmit() {

    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;

    setTimeout(() => {

      this.authService.forgotPassword(this.f.email.value)
        .pipe(first())
        .subscribe(
          data => {
            this._snackBar.open('Le lien de réinitialisation du mot de passe a été correctement envoyé. veuillez ouvrir votre adresse email pour continuer.', null, {
              duration: 5000,
            });
            this.loading = false;

            setTimeout(s => {
              this.router.navigate(['sds-login']);
            }, 8000);
          },
          error => {
            console.log(error);
            if (error == 'Unknown Error' || 'Erreur inconnue' || 'Bad Request') {
              this.error = 'Impossible d\'envoyer le lien, veuillez réessayer.';
            }
            this._snackBar.open(this.error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false;
          });

    }, 3000);


  }


}
