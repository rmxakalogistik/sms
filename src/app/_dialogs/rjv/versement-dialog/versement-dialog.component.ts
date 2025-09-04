import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../../../_models/dialog-model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICountry } from 'country-state-city';
import csc from 'country-state-city';
import { CountryPhone } from '../../../_models/country-phone.model';
import { PhoneValidator } from '../../../_validators/phone.validator';
import { UsernameValidator } from '../../../_validators/username.validator';
import { isNullOrUndefined } from 'util';
import { MatStepper } from '@angular/material/stepper';
import { PopupService } from '../../../_services/common/popup.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { SE } from '../../../_common/directives/scroll.directive';
import { SelectionService } from '../../../_services/_selection.service';
import { AuthService } from '../../../_services/common/auth.service';
import { SignalrService } from '../../../_services/common/signalr.service';
import { SignalRConnection } from 'ng2-signalr';
import { User } from '../../../_models/user';
import { ConfirmDialogComponent } from '../../../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { SelectDialogComponent } from '../../../_common/dialogs/select-dialog/select-dialog.component';
import { EnvService } from '../../../_services/common/env.service';
import { UploadService } from '../../../_services/common/upload.service';
import { forkJoin } from 'rxjs';
import { ImgCropperDialogComponent } from '../../../_common/dialogs/imgCropper-dialog/img-cropper-dialog.component';
import { Guid } from 'guid-typescript';
import { RjvService } from 'src/app/_services/rjv.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class SyboxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-versement-dialog',
  templateUrl: './versement-dialog.component.html',
  styleUrls: ['./versement-dialog.component.scss']
})
export class VersementDialogComponent implements OnInit, AfterContentInit {

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

  // date
  maxDate: Date;

  // any
  local_data: any;
  versements: any = [];
  banques: any = [];
  dialogData: any = null;

  // object
  // number
  tempIndexProduit = -1;
  tempIndexClasse = -1;

  // others
  formData: FormGroup;

  matcher = new SyboxErrorStateMatcher();
  mobileQuery: MediaQueryList;
  private signalR_connection: SignalRConnection;
  private _mobileQueryListener: () => void;
  @ViewChild('UploadFileInputdoc') uploadFileInputdoc: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<VersementDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    private selectionService: SelectionService,
    public authService: AuthService,
    private signalrService: SignalrService,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public popupService: PopupService,
    private env: EnvService,
    private rjvService: RjvService,
    private uploadService: UploadService,) {

    this.maxDate = this.authService.getMaxDate || new Date();


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
      banque: new FormControl(this.local_data.banque),
      montant: new FormControl(this.local_data.montant, Validators.compose([
        Validators.required
      ])),
      obs: new FormControl(this.local_data.obs, Validators.compose([
        Validators.pattern(alphaNumAll), Validators.maxLength(25)
      ])),
      numbordereautemp: new FormControl(this.local_data.numbordereautemp),
      numbordereaufinal: new FormControl(this.local_data.numbordereaufinal),
      datebordereaufinal: new FormControl(this.local_data.datebordereaufinal),
    });

    this.versements = this.local_data.versements || [];
    if(this.local_data && 
      this.local_data.commonList && 
      this.local_data.commonList.banques && 
      this.local_data.commonList.banques.length>0){
        this.banques = this.local_data.commonList.banques;
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
    return this.versements && this.versements.length > 0 && this.tempIndexProduit < 0 && !this.formData.valid;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  cancelProduit() {
    this.formData.controls['banque'].reset();
    this.formData.controls['obs'].reset();
    this.formData.controls['numbordereautemp'].reset();
    this.formData.controls['numbordereaufinal'].reset();
    this.formData.controls['datebordereaufinal'].reset(this.maxDate);
    this.formData.controls['montant'].reset();
    this.tempIndexProduit = -1;
  }

  editProduit(_data1, i) {
    delete _data1.deleted;
    console.log(_data1);
    let _ss = this.banques.filter((x)=>{
      return x.id == _data1.banqueId;
    })[0];
    this.formData.get('banque').setValue(_ss);
    this.formData.get('obs').setValue(_data1.obs);
    this.formData.get('numbordereautemp').setValue(_data1.numbordereautemp);
    this.formData.get('numbordereaufinal').setValue(_data1.numbordereaufinal);
    this.formData.get('datebordereaufinal').setValue(_data1.datebordereaufinal);
    this.formData.get('montant').setValue(_data1.montant);
    this.tempIndexProduit = i;
  }

  deleteProduit(i) {
    //this.versements.splice(i, 1);
    this.versements[i].deleted = true;
  }

  addProduit(_data1) {

    let _cp = this.versements[this.tempIndexProduit] || {};

    const myLocalId = _cp.id ?? Guid.create().toString();

    _cp.montant = _data1.montant;
    _cp.obs = _data1.obs;
    _cp.numbordereautemp = _data1.numbordereautemp;
    _cp.numbordereaufinal = _data1.numbordereaufinal;
    _cp.datebordereaufinal = _data1.datebordereaufinal;

    _cp.banque = _data1.banque;
    _cp.banqueId = _data1.banque.id;

    if (this.tempIndexProduit >= 0) {
      this.tempIndexProduit = -1;
    } else {
      _cp.rjvId = this.local_data.id;

      let _pass = this.versements.filter((x) => {
        return (x.id == _cp.id);
      })[0];
      if (_pass != null && _pass != undefined) {
        _pass.montant = _cp.montant;
        _pass.obs = _cp.obs;
        _pass.numbordereautemp = _cp.numbordereautemp;
        _pass.numbordereaufinal = _cp.numbordereaufinal;
        _pass.datebordereaufinal = _cp.datebordereaufinal;
      } else {
        _cp.id = myLocalId;
        this.versements.push(_cp);
      }
    }
    this.cancelProduit();
  }

  onSubmit() {

    let __date_ = new Date(this.local_data.date);
    let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
    let ___date___= new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

    this.local_data.date = ___date___;

    this.versements = this.versements.filter((value, key) => {
      return !value.deleted;
    });
    let cp = this.versements.length == 0 ? [] : this.versements.map((value) => {

      let ___datebordereaufinal = null;
      if(value.datebordereaufinal != undefined && value.datebordereaufinal != null){
        let _datebordereaufinal = new Date(value.datebordereaufinal);
        let __datebordereaufinal = new Date(_datebordereaufinal.getFullYear(), _datebordereaufinal.getMonth(), _datebordereaufinal.getDate(), 8, 0, 0);
        ___datebordereaufinal= new Date(__datebordereaufinal.getTime() - (__datebordereaufinal.getTimezoneOffset() * 60000)).toJSON();
    }

      return {
        id: value.id,
        montant: value.montant,
        obs: (!isNullOrUndefined(value.obs) ? (value.obs + '').toLocaleUpperCase() : null),
        banque: value.banque,
        numbordereautemp: value.numbordereautemp,
        numbordereaufinal: value.numbordereaufinal,
        datebordereaufinal: ___datebordereaufinal,
        banqueId: value.banque.id,
        rjvId: this.local_data.id,
      };
    })

    this.local_data.versements = cp;
    
    console.log(this.local_data);
    
    this.loading = true;

    setTimeout(() => {
      let _dt: any[] = this.rjvService.rjvsValue;
      let _existingData = _dt.filter((x)=>{
        return x.id == cp.id;
      })[0];
      if (!isNullOrUndefined(_existingData)) {
        _dt = _dt.filter((value, key) => {
          if (value.id == cp.id) {
            for (const name in value) {
              if (name != 'id') {
                value[name] = cp[name];
              }
            }
          }
          return true;
        });
      } else {
        _dt.splice(0, 0, cp);
      }
      this.rjvService.setrjv(_dt, this.local_data.stationId);
      this.doAction(this.local_data);
      this.loading = false;
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
        this.onSubmit();
      }
    });

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
