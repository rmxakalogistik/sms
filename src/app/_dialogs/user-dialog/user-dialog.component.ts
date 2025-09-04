import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
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
import { SelectionService } from '../../_services/_selection.service';
import { AuthService } from '../../_services/common/auth.service';
import { User } from '../../_models/user';
import { SignalrService } from '../../_services/common/signalr.service';
import { SignalRConnection } from 'ng2-signalr';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { SelectDialogComponent } from '../../_common/dialogs/select-dialog/select-dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class SyboxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit, AfterContentInit {

  errorMessages = {
    required: "Champ obligatoire",
    maxlength: "Longueur maximale dépassée",
    minlength: "Longueur minimale non respectée",
    max: "Valeur maximale dépassée",
    min: "Valeur minimale non respectée",
    email: "Adresse email invalide",
    phone: "Numéro de téléphone invalide",
    pattern: "Caractère non autorisé saisi",
    validUsername: "Valeur saisie déjà associée à un autre utilisateur",
  };

  // boolean
  loading = false;
  isLinear = true;
  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;
  //selectDialogAlreayOpen = false;
  dataChangedAlreayOpen = false;

  // string
  action: string;
  selectedRowId: string;
  
  // date
  maxDate: Date;

  // any
  local_data: any;
  genders: any = ['HOMME', 'FEMME'];
  countries: any = [];
  fonctions: any = [];
  dialogData: any = null;

  // object
  user: User;

  // others
  formData: FormGroup;
  matcher = new SyboxErrorStateMatcher();
  mobileQuery: MediaQueryList;
  private signalR_connection: SignalRConnection;
  private _mobileQueryListener: () => void;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserData,
    private formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    private userService: UserService,
    private selectionService: SelectionService,
    public authService: AuthService,
    private signalrService: SignalrService,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public popupService: PopupService) {
      this.maxDate =  this.authService.getMaxDate || new Date();

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.local_data = { ...data };
    this.action = this.local_data.action;

    console.log(this.local_data);
  }

  errors(ctrl: any): string[] {
    return (ctrl && ctrl.errors) ? Object.keys(ctrl.errors) : [];
  }

  ngOnInit(): void {

    this.user = this.authService.userValue;

    // const codePattern = /^[a-zA-Z\_]*$/;
    const lettreOnlyPattern = /^[a-zA-ZÀ-ÿ\s0-9\-]*$/;
    const emailPatter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const __countr = 'CD';

    const _country: ICountry = csc.getCountryByCode(__countr);
    this.countries = [
      new CountryPhone(_country.sortname, _country.name, _country.id)
    ];

    const selectedCountry = this.countries.filter(function(item: CountryPhone) {
      return (item.iso == 'CD');
    })[0];

    const country = new FormControl(selectedCountry || this.countries[0], Validators.required);

    if((!this.local_data.isReservation)){

      this.formData = this.formBuilder.group({
        firstName: new FormControl(this.local_data.firstName, Validators.compose([
          Validators.required, Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        lastName: new FormControl(this.local_data.lastName, Validators.compose([
          Validators.required, Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        middleName: new FormControl(this.local_data.middleName, Validators.compose([
          Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        addresse: new FormControl(this.local_data.addresse, Validators.compose([
          Validators.maxLength(50)
        ])),
        bithdate: new FormControl(this.local_data.bithdate),
        fonction: new FormControl(this.local_data.fonction),
        station: new FormControl(this.local_data.station, Validators.compose([
          Validators.required
        ])),
        gender: new FormControl(this.local_data.gender || this.genders[0], Validators.required),
        email: new FormControl(this.local_data.email, Validators.compose([
          Validators.required, Validators.email, Validators.maxLength(100)
        ]),
          new UsernameValidator(this.userService, this.local_data.id).validUsername),
        country,
        phone: new FormControl(this.local_data.phone, Validators.compose([
          Validators.required,
          PhoneValidator.validCountryPhone(country)
        ]),
          new UsernameValidator(this.userService, this.local_data.id).validUsername),
        isActive: new FormControl(this.local_data.isActive||true),
        reInitAutorisation: new FormControl(this.local_data.reInitAutorisation || false),
        reInitPassword: new FormControl(this.local_data.reInitPassword || false),
        isStation: new FormControl( (this.local_data.stationId?'1':'0') || '0'),
      });
    }else{

      this.formData = this.formBuilder.group({
        firstName: new FormControl(this.local_data.firstName, Validators.compose([
          Validators.required, Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        lastName: new FormControl(this.local_data.lastName, Validators.compose([
          Validators.required, Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        middleName: new FormControl(this.local_data.middleName, Validators.compose([
          Validators.pattern(lettreOnlyPattern), Validators.maxLength(15)
        ])),
        addresse: new FormControl(this.local_data.addresse, Validators.compose([
          Validators.maxLength(50)
        ])),
        bithdate: new FormControl(this.local_data.bithdate),
        fonction: new FormControl(this.local_data.fonction),
        station: new FormControl(this.local_data.station),
        gender: new FormControl(this.local_data.gender || this.genders[0], Validators.required),
        email: new FormControl(this.local_data.email,
          new UsernameValidator(this.userService, this.local_data.id).validUsername),
        country,
        phone: new FormControl(this.local_data.phone),
        isActive: new FormControl(this.local_data.isActive||true),
        reInitAutorisation: new FormControl(this.local_data.reInitAutorisation || false),
        reInitPassword: new FormControl(this.local_data.reInitPassword || false),
        isStation: new FormControl( (this.local_data.stationId?'1':'0') || '0'),
      });
    }

    this.selectedRowId = null;
    if (this.action != 'Création') {
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

    this.checkTypeCompte(this.formData.get('isStation').value);

    this.formData
      .get('isStation')
      .valueChanges
      .pipe()
      .subscribe(value => {
        console.log(value);
        this.checkTypeCompte(value);
      });

      if(this.action == 'Suppression'){
        Object.keys(this.formData.controls).forEach(key => {
          this.formData.controls[key].disable();
          this.formData.controls[key].clearValidators();
        });
        // this.formData.disable();
        // this.formData.clearValidators();
      }

  }

  private checkTypeCompte(value){
    const lettreOnlyPattern = /^[a-zA-ZÀ-ÿ\s0-9\-]*$/;
    if (value == '0') {
      this.formData.get('station').reset(null);
      this.formData.get('station').clearValidators();

      this.formData.get('fonction').reset('BACK-OFFICE');
      //this.formData.get('fonction').reset('ADMIN');
      this.formData.get('fonction').setValidators([Validators.required]);
    } else if (value == '1') {
      this.formData.get('station').setValidators([Validators.required]);

      this.formData.get('fonction').clearValidators();
      this.formData.get('fonction').reset('STATION INTERNE');
    } else if (value == '2') {
      this.formData.get('station').reset(null);
      this.formData.get('station').clearValidators();

      this.formData.get('fonction').reset('STATION DE VOYAGE');
      //this.formData.get('fonction').reset('ADMIN');
      this.formData.get('fonction').setValidators([Validators.required]);
    }
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

  ngAfterContentInit(): void {
  }

  close() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  canMoveNext(): boolean {
    if(this.action == 'Suppression'){
      return true;
    }
    return this.formData.valid;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  onSubmit(_data1) {
    //// console.log(_data1.country);
    
    let _bithdate = null;
    if(!isNullOrUndefined(_data1.bithdate)){
      let __bithdate = new Date(_data1.bithdate);
      _bithdate = new Date(__bithdate.getTime() - (__bithdate.getTimezoneOffset() * 60000)).toJSON();
    }

    const toppost = {
      id: this.local_data.id,
      firstName: !isNullOrUndefined(_data1.firstName) ? ('' + _data1.firstName).toUpperCase() : null,
      lastName: !isNullOrUndefined(_data1.lastName) ? ('' + _data1.lastName).toUpperCase() : null,
      middleName: !isNullOrUndefined(_data1.middleName) ? ('' + _data1.middleName).toUpperCase() : null,
      email: !isNullOrUndefined(_data1.email) ? ('' + _data1.email).toUpperCase() : null,
      gender: _data1.gender,
      fonction: !isNullOrUndefined(_data1.fonction) ? ('' + _data1.fonction).toUpperCase() : null,
      stationId: !isNullOrUndefined(_data1.station) ? _data1.station.id : null,
      country: _data1.country.iso,
      phone: _data1.phone,
      addresse: !isNullOrUndefined(_data1.addresse) ? ('' + _data1.addresse).toUpperCase() : null,
      phoneCode: _data1.country.code,
      bithdate: _bithdate,
      isActive: _data1.isActive,
      reInitPassword: _data1.reInitPassword,
      reInitAutorisation: _data1.reInitAutorisation,
      Emails: [{ adresse: _data1.email }]
    };

    if((this.local_data.isReservation)){
      this.doAction(toppost);
      return;
    }

    this.loading = true;

    setTimeout(() => {

      if (this.action == 'Création') {
        this.userService.add(toppost).pipe(first()).subscribe(data => {
          this._snackBar.open('L\'élément à été correctement ajouté', null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.doAction(data);
        },
          error => {
            if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
              error = 'Impossible d\'effectuer cette action, veuillez réessayer.';
            }
            this._snackBar.open(error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false;
          });
      } else if (this.action == 'Modification') {
        this.userService.update(toppost.id, toppost).pipe(first()).subscribe(data => {
          this._snackBar.open('L\'élément à été correctement modifié', null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.doAction(data);
        },
          error => {
            if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
              error = 'Impossible d\'effectuer cette action, veuillez réessayer.';
            }
            this._snackBar.open(error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false;
          });
      } else if (this.action == 'Suppression') {
        this.userService.delete(toppost.id).pipe(first()).subscribe(data => {
          this._snackBar.open('L\'élément à été correctement supprimé', null, {
            duration: 5000,
            verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.doAction(data);
        },
          error => {
            if (error === ('Unknown Error' || 'Erreur inconnue' || 'Bad Request' || '[0]: null')) {
              error = 'Impossible d\'effectuer cette action, veuillez réessayer.';
            }
            this._snackBar.open(error, null, {
              duration: 5000,
              verticalPosition: 'bottom', horizontalPosition: 'left', panelClass: ['error-snackbar']
            });
            this.loading = false;
          });
      }

    }, 1500);

  }

  confirm(_data1) {

    const message = `Êtes-vous sûr de vouloir confirmer l'opération de ` + this.action + ' en cours?';

    const dialogData = new ConfirmDialogModel('Confirmation', message, 'primary');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result = dialogResult;
      if (result) {
        this.onSubmit(_data1);
      }
    });

  }


  async selectionDialog(action, obj: any = {}) {
   
    obj.actionId = action;

    if (action == 'station') {
      obj.action = "Choix d'une Station";
      obj.canAdd = false;
      obj.preFill = true;
      obj.titleToAffich = 'title';

      //obj.dataSelected = this.formData.get('station').value;
    }

    //if (obj.service || (obj.datas && obj.datas.length >= 0)) {

    //this.selectDialogAlreayOpen = false;

      const dialogRef = this.popupService.open(SelectDialogComponent, '800px', {
        data: obj,
        panelClass: 'custom-dialog-container'
      });

    dialogRef.afterClosed().subscribe(async result => {
      //this.selectDialogAlreayOpen = false;

        if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
          if (result.event == "Choix d'une Station") {
            this.formData.get('station').setValue(result.data[0]);
          }

        }
      });
    //}

  }

  fonctionChanged() {

    const message = "VOULEZ-VOUS RÉINITIALISER LES AUTORISATIONS RELATIVES À LA NOUVELLE FONCTION?";

    const dialogData = new ConfirmDialogModel('CHANGEMENT DE FONCTION DÉTECTÉ', message, 'primary');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result = dialogResult;
      if (result) {
        this.formData.get('reInitAutorisation').setValue(true);
      }
    });

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

  isRequiredField(field: string) {
    //console.log(field);
    const form_field = this.formData.get(field);
    if (isNullOrUndefined(form_field) || (!isNullOrUndefined(form_field) && !form_field.validator)) {
      return false;
    }
    //console.log(field);
    const validator = form_field.validator({} as AbstractControl);
    return (validator && validator.required);
  }

}
