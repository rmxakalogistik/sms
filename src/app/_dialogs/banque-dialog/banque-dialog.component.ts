import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { BanqueData, BanqueService } from '../../_services/banque.service';
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
import { SignalrService } from '../../_services/common/signalr.service';
import { SignalRConnection } from 'ng2-signalr';
import { User } from '../../_models/user';
import { ConfirmDialogComponent } from '../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { SelectDialogComponent } from '../../_common/dialogs/select-dialog/select-dialog.component';
import { EnvService } from '../../_services/common/env.service';
import { UploadService } from '../../_services/common/upload.service';
import { forkJoin } from 'rxjs';
import { ImgCropperDialogComponent } from '../../_common/dialogs/imgCropper-dialog/img-cropper-dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class SyboxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-banque-dialog',
  templateUrl: './banque-dialog.component.html',
  styleUrls: ['./banque-dialog.component.scss']
})
export class BanqueDialogComponent implements OnInit, AfterContentInit {

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
  docimgsrc: string;
  authImage: string = "assets/img/logo-blue-circle.png";

  // any
  local_data: any;
  banqueChecques: any = [];
  dialogData: any = null;

  // object
  // number
  tempIndexChecque = -1;
  tempIndexClasse = -1;

  // others
  formData: FormGroup;
  formDataSubChecque: FormGroup;
  formDataSubClasse: FormGroup;
  matcher = new SyboxErrorStateMatcher();
  mobileQuery: MediaQueryList;
  private signalR_connection: SignalRConnection;
  private _mobileQueryListener: () => void;
  @ViewChild('UploadFileInputdoc') uploadFileInputdoc: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<BanqueDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BanqueData,
    private formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    private banqueService: BanqueService,
    private selectionService: SelectionService,
    public authService: AuthService,
    private signalrService: SignalrService,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public popupService: PopupService,
    private env: EnvService,
    private uploadService: UploadService,) {


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
    this.docimgsrc = null;
    const alphaNumAll = /^[a-zA-Z0-9 \_-]*$/;
    const alphaNumOnly = /^[a-zA-Z0-9]*$/;

    this.formData = this.formBuilder.group({
      nom: new FormControl(this.local_data.nom, Validators.compose([
        Validators.required
      ]))
    });

    this.formDataSubChecque = this.formBuilder.group({
      devise: new FormControl(this.local_data.devise||'CDF', Validators.compose([
        Validators.required
      ])),
      code: new FormControl(this.local_data.code, Validators.compose([
        Validators.required
      ]))
    });

    this.selectedRowId = null;
    if (this.action != 'Création') {
      this.selectedRowId = this.local_data.id;
      this.banqueChecques = this.local_data.banqueChecques || [];
    }

    this.signalrService.notifConnexionChanged.subscribe((_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        const BanqueUpdatedlistener = this.signalR_connection.listenFor('newBanqueUpdated');
        BanqueUpdatedlistener.subscribe(async (data: string) => {
          if (this.selectedRowId == data) {
            this.dataChanged();
          }
        });

      }
    });


    if (this.action == 'Suppression') {
      Object.keys(this.formData.controls).forEach(key => {
        this.formData.controls[key].disable();
        this.formData.controls[key].clearValidators();
      });
      // this.formData.disable();
      // this.formData.clearValidators();
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
    if (this.action == 'Suppression') {
      return true;
    }
    return this.formData.valid && this.banqueChecques && this.banqueChecques.length > 0 && this.tempIndexChecque<0;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  cancelChecque() {
    this.formDataSubChecque.controls['devise'].reset();
    this.formDataSubChecque.controls['code'].reset();
    this.tempIndexChecque = -1;
  }

  editChecque(_data1, i) {
    this.formDataSubChecque.get('devise').setValue(_data1.devise);
    this.formDataSubChecque.get('code').setValue(_data1.code);
    this.tempIndexChecque = i;
  }

  deleteChecque(i) {
    this.banqueChecques.splice(i, 1);
  }

  addChecque(_data1) {

    let _cp = this.banqueChecques[this.tempIndexChecque] || {};

    _cp.devise = _data1.devise;
    _cp.code = _data1.code;

    if (this.tempIndexChecque >= 0) {
      this.tempIndexChecque = -1;
    } else {
      _cp.banqueId = this.local_data.id;
      this.banqueChecques.push(_cp);
    }


    this.formDataSubChecque.controls['devise'].reset();
    this.formDataSubChecque.controls['code'].reset();
  }

  onSubmit(_data1) {
    console.log(_data1);

    const cp = {
      id: this.local_data.id,
      nom: (_data1.nom+'').toUpperCase(),
      banqueChecques: this.banqueChecques.length == 0 ? [] : this.banqueChecques.map((value) => {
        return {
          id: value.id,
          code: value.code,
          devise: value.devise,
          banqueId: this.local_data.id,
        };
      })
    };

    //postedbanque

    this.loading = true;

    setTimeout(() => {

      //console.log(_data1.docphoto);

      if (this.action == 'Création') {
        this.banqueService.add(cp).pipe(first()).subscribe(data => {
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
        this.banqueService.update(cp.id, cp).pipe(first()).subscribe(data => {
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
        this.banqueService.delete(cp.id).pipe(first()).subscribe(data => {
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

    if (action == 'devise') {
      obj.action = "Choix d'un banqueChecque";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;
      obj.isHeadOffice = true;

      obj.notLoadData = '';

      if(this.banqueChecques != undefined && this.banqueChecques != null){
        for(let i = 0; i < this.banqueChecques.length;i++){
          obj.notLoadData += this.banqueChecques[i].id + '';
        }
      }

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
        if (result.event == "Choix d'un banqueChecque") {
          console.log(result.data[0]);
          this.formDataSubChecque.get('devise').setValue(result.data[0])
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
    const form_field = this.formData.get(field) || this.formDataSubChecque.get(field) || this.formDataSubClasse.get(field);
    if (isNullOrUndefined(form_field) || (!isNullOrUndefined(form_field) && !form_field.validator)) {
      return false;
    }
    //console.log(field);
    const validator = form_field.validator({} as AbstractControl);
    return (validator && validator.required);
  }

}
