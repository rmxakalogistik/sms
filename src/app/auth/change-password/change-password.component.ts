import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../_services/common/auth.service';
import { first } from 'rxjs/operators';
import { EncrDecrService } from '../../_services/common/encr-decr.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  loading = false;
  hide = true;

  authImage = "assets/img/logo-secondary-mini.png";

  returnUrl: string;
  private _id: string = null;
  private _code: number = null;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private encrDecr: EncrDecrService,
    private activatedRoute: ActivatedRoute
  ) {
    // redirect to home if already logged in
    if (this.authService.userValue) {
      this.router.navigate(['/']);
    }
  }


  ngOnInit() {

    this.changePasswordForm = this.formBuilder.group({
      email: [null],
      oldPassword: [null],
      newPassword: [null, [Validators.required]],
      confirmPassword: [null, [Validators.required]],
    }, { validator: this.checkPasswords });

    // Note: Below 'queryParams' can be replaced with 'params' depending on your requirements
    this.activatedRoute.queryParams.subscribe(params => {
      const compteId = params.compteId;
      const code = params.code;
      console.log(compteId, code);

      if (isNullOrUndefined(compteId) || isNullOrUndefined(code)) {
        this.router.navigate(['/sds-login']);
      } else {
        this.getUser(compteId, code);
      }

    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }


  getUser(compteId, code) {
    this.loading = true;
    this.authService.getUser(compteId)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this.f.email.setValue(data);
            this._id = compteId;
            this._code = code;
          },
          error => {
            this._id = null;
            this._code = null;
            console.log(error);
            if (error == 'Unknown Error' || 'Erreur inconnue') {
              this.error = 'Impossible de récupérer l\'utilisateur, veuillez réessayer.';
            }
            this._snackBar.open(this.error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false; setTimeout(s => {
              this.router.navigate(['sds-login']);
            }, 5000);
          });
    }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    const pass = group.get('newPassword').value;
    const confirmPass = group.get('confirmPassword').value;
    //// console.log('pass === confirmPass: ', pass === confirmPass);
    return pass === confirmPass ? null : { notSame: true };
  }

  get f() { return this.changePasswordForm.controls; }


  onSubmit() {

    // stop here if form is invalid
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;

    setTimeout(() => {
      //// console.log(this.f);
      this.authService.changePassword(this._id, this.encrDecr.set(this.f.newPassword.value), this._code)
        .pipe(first())
        .subscribe(
          data => {

            this._snackBar.open('Votre mot de passe a été correctement modifié. vous serez redirigé vers l\'écran de connexion.', null, {
              duration: 5000,
            });
            this.loading = false;


            setTimeout(s => {
              this.router.navigate(['sds-login']);
            }, 8000);
          },
          error => {
            if (error == 'Unknown Error' || 'Erreur inconnue') {
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
