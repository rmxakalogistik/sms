import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserData, UserService } from '../../_services/user.service';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICountry } from 'country-state-city';
import csc from 'country-state-city';
import { CountryPhone } from '../../_models/country-phone.model';
import { PhoneValidator } from '../../_validators/phone.validator';
import { UsernameValidator } from '../../_validators/username.validator';
import { isNullOrUndefined } from 'util';
import { MatStepper } from '@angular/material/stepper';
import { PopupService } from '../../_services/common/popup.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { SE } from '../../_common/directives/scroll.directive';
import { User } from '../../_models/user';
import { AuthService } from '../../_services/common/auth.service';
import { AutorisationService } from '../../_services/autorisation.service';
import { Router } from '@angular/router';
import { SignalrService } from '../../_services/common/signalr.service';
import { SignalRConnection } from 'ng2-signalr';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class SyboxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-user-autorisation-dialog',
  templateUrl: './user-autorisation-dialog.component.html',
  styleUrls: ['./user-autorisation-dialog.component.scss']
})
export class UserAutorisationDialogComponent implements OnInit, AfterContentInit {

  // boolean
  loading = false;
  editMode = false;
  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;
  dataChangedAlreayOpen = false;

  // string
  action: string;
  userId: string;
  selectedRowId: string;
  autorisationDisplayedColumns: string[] = ['position', 'role', 'see', 'add', 'edit', 'delete'];

  // any
  local_data: any;
  _passedUser: any;
  autorisations: any = [];
  dialogData: any = null;

  // object
  user: User;

  // others
  matcher = new SyboxErrorStateMatcher();
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  private signalR_connection: SignalRConnection;

  constructor(
    public dialogRef: MatDialogRef<UserAutorisationDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserData,
    public authService: AuthService,
    public dialog: MatDialog,
    public popupService: PopupService,
    private autorisationService: AutorisationService,
    private _snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router,
    private signalrService: SignalrService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {

    this.user = this.authService.userValue;

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.local_data = { ...data };
    this.action = this.local_data.action;

    console.log(this.local_data);
  }

  ngOnInit(): void {

    this.selectedRowId = null;
    if (this.action == 'Autorisations') {
      this.selectedRowId = this.local_data.id;
    }

    this.signalrService.notifConnexionChanged.subscribe((_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        const UserUpdatedlistener = this.signalR_connection.listenFor('newCompteUpdated');
        UserUpdatedlistener.subscribe(async (data: string) => {
          if (this.selectedRowId == data) {
            this.dataChanged();
          }
        });

      }
    });

  }

  ngAfterContentInit(): void {
    this.geteleme();
  }

  public detectScroll(event: SE) {

    if (event.header) {
      this.isActive = false;
      this.isActivefadeInDown = true;
      this.fixedTolbar = true;
    }

    if (event.bottom) {
      this.isActive = true;
      this.isActivefadeInDown = false;
      this.fixedTolbar = false;
    }

  }

  geteleme() {
    let __passedUser:any = null;
    try {
      __passedUser = this.local_data;
    } catch {
      __passedUser = null;
    }

    if (__passedUser == null) {
      this.editMode = false;
    } else if (__passedUser.id == this.user.id) {
      this.editMode = false;
    } else {
      this.editMode = this.authService.roleEXist('comptes_manage');
    }

    this._passedUser = __passedUser || this.user;
    this.userId = this._passedUser?.id;

    this.loadAutorisation();
  }

  async loadAutorisation() {
    if (!this.loading) {
      this.loading = true;
      await this.autorisationService.getByUserId(this.userId).pipe(first()).subscribe(resp => {
        this.loading = false;
        this.autorisations = resp;
      },
        error => {
          if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
            error = 'Chargement des données impossible, veuillez réessayer.';
          }
          this._snackBar.open(error, null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
          });
          this.loading = false;
        });
    }
  }

  close() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  canMoveNext(): boolean {
    return true;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }


  async changeUserAutorisation(elem, isee = false) {
    //// console.log(elem);

    if (isee == false && elem.see != true && (elem.add == true || elem.edit == true || elem.delete == true)) {
      elem.see = true;
    }

    elem.error = '';
    await this.autorisationService.changeUserAutorisation(elem, this.userId).pipe(first()).subscribe(resp => {
      //// console.log(resp);
    },
      error => {
        if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
          error = 'Sauvegarde impossible, veuillez réessayer.';
        }

        elem.error = error;
        this._snackBar.open(error, null, {
          duration: 5000,
          verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
        });
        // this.autorisationsLoading = false;
      });
  }

  autorisationEXist(_short_name) {
    const _secure = this.router.config.find(x => x.path === 'sds-secure').children;
    const _who = _secure.find(x => x.path + '_manage' === _short_name);
    return _who;
  }

  dataChanged() {
    if (this.dataChangedAlreayOpen != true && isNullOrUndefined(this.dialogData)) {
      this.dataChangedAlreayOpen = true;

      const message = "CET ENREGISTREMENT VIENT D'ÊTRE MODIFIÉ PAR UN AUTRE UTILISATEUR, NOUS ALLONS FERMER CETTE FENÊTRE ET CHARGER LES DONNÉES ÉDITÉES.";

      this.dialogData = new ConfirmDialogModel('Information', message, 'primary');


      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '300px',
        data: this.dialogData,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        const result = dialogResult;
        if (result) {
          this.close();
        }
      });

    }
  }


}
