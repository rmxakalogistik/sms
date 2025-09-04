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
  selector: 'app-index-dialog',
  templateUrl: './index-dialog.component.html',
  styleUrls: ['./index-dialog.component.scss']
})
export class IndexDialogComponent implements OnInit, AfterContentInit {

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
  indexProduits: any = [];
  stationPompes: any = [];
  stationProduits: any = [];
  zoneProduits: any = [];
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
    public dialogRef: MatDialogRef<IndexDialogComponent>,
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
      stationPompe: new FormControl(this.local_data.stationPompe),
      stationProduit: new FormControl(this.local_data.stationProduit),
      fin: new FormControl(this.local_data.fin, Validators.compose([
        Validators.required
      ])),
      obs: new FormControl(this.local_data.obs, Validators.compose([
        Validators.pattern(alphaNumAll), Validators.maxLength(25)
      ])),
    });

    this.indexProduits = this.local_data.indexProduits || [];
    if(this.local_data && 
      this.local_data.station){

        if(this.local_data.station.stationPompes && 
          this.local_data.station.stationPompes.length>0){
            this.stationPompes = this.local_data.station.stationPompes;
        }

        if(this.local_data.station.stationProduits && 
          this.local_data.station.stationProduits.length>0){
            this.stationProduits = this.local_data.station.stationProduits;
        }

    }

    if(this.local_data && 
      this.local_data.commonList && 
      this.local_data.commonList.stations && 
      this.local_data.commonList.stations.zone){
        this.zoneProduits = this.local_data.commonList.stations.zone.zoneProduits;
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
    //return this.formData.valid && this.indexProduits && this.indexProduits.length > 0 && this.tempIndexProduit < 0;
    return this.indexProduits && this.indexProduits.length > 0 && this.tempIndexProduit < 0 && !this.formData.valid;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  indexCheckerProduit(me) {
    let _findLastIndexs:any[] = this.indexProduits.filter((x) => {
      return (x.stationPompeId == me.stationPompeId);
    });

    if(_findLastIndexs.length > 0){
      let indexOfMine = _findLastIndexs.indexOf(me);
      let indexOfMLast = (_findLastIndexs.length - 1);
      if(indexOfMLast == indexOfMine){
        return true;
      }else{
        return false;
      }
    }
    return false;
  }


  cancelProduit() {
    this.formData.controls['stationPompe'].reset();
    //this.formData.controls['stationProduit'].reset();
    this.formData.controls['obs'].reset();
    this.formData.controls['fin'].reset();
    this.tempIndexProduit = -1;
  }

  editProduit(_data1, i) {
    delete _data1.deleted;
    console.log(_data1);
    let _ss = this.stationPompes.filter((x)=>{
      return x.id == _data1.stationPompeId;
    })[0];
    _ss.lastIndex = _data1.debut;
    this.formData.get('stationPompe').setValue(_ss);
    //this.formData.get('stationProduit').setValue(_ss);
    this.formData.get('obs').setValue(_data1.obs);
    this.formData.get('fin').setValue(_data1.fin);
    this.tempIndexProduit = i;
  }

  deleteProduit(i) {
    //this.indexProduits.splice(i, 1);
    this.indexProduits[i].deleted = true;
  }

  addProduit(_data1) {

    let _cp = this.indexProduits[this.tempIndexProduit] || {};

    const myLocalId = _cp.id ?? Guid.create().toString();

    let prixStruct = this.zoneProduits.filter((x)=>{
      return x.produitId == _data1.stationPompe.zoneProduit.produitId;
    })[0];
    if(!_cp.prixVente && prixStruct != null && prixStruct != undefined){
      _cp.prixVente = prixStruct.prix;
    }

    _cp.fin = _data1.fin;
    _cp.debut = _data1.stationPompe.lastIndex;
    _cp.qte = ((+_data1.fin) - (+_data1.stationPompe.lastIndex));
    _cp.obs = _data1.obs;
    _cp.montant = (_cp.prixVente*_cp.qte);

    _cp.stationPompe = _data1.stationPompe;
    _cp.stationPompeId = _data1.stationPompe.id;

    _cp.stationPompe.lastIndex = _cp.fin;
    
    let _ssPompe = this.stationPompes.filter((x)=>{
      return x.id == _cp.stationPompeId;
    })[0];

    let _findLastIndexs = this.indexProduits.filter((x) => {
      return (x.id == _cp.id);
    });

    for(let i = 0; i < _findLastIndexs.length; i++){
      _ssPompe.lastIndex = _findLastIndexs[i].fin;
    }

    this.local_data.station.stationPompes = this.stationPompes;

    let _ss = this.stationProduits.filter((x)=>{
      return x.produitId == _cp.stationPompe.zoneProduit.produitId;
    })[0];
    _cp.stationProduit = _ss;
    _cp.stationProduitId = _ss.id;

    if (this.tempIndexProduit >= 0) {
      this.tempIndexProduit = -1;
    } else {
      _cp.rjvId = this.local_data.id;

      let _pass = this.indexProduits.filter((x) => {
        return (x.id == _cp.id);
      })[0];
      if (_pass != null && _pass != undefined) {
        _pass.debut = _cp.debut;
        _pass.fin = _cp.fin;
        _pass.prixVente = _cp.prixVente;
        _pass.qte = ((+_cp.fin) - (+_cp.stationPompe.lastIndex));
        _pass.obs = _cp.obs;
        _pass.montant = _cp.montant;
      } else {
        _cp.id = myLocalId;
        this.indexProduits.push(_cp);
      }
    }
    this.cancelProduit();
  }

  onSubmit() {

    let __date_ = new Date(this.local_data.date);
    let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
    let ___date___= new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

    this.local_data.date = ___date___;

    this.indexProduits = this.indexProduits.filter((value, key) => {
      return !value.deleted;
    });
    let cp = this.indexProduits.length == 0 ? [] : this.indexProduits.map((value) => {

      return {
        id: value.id,
        debut: value.debut,
        fin: value.fin,
        qte: value.qte,
        prixVente: value.prixVente,
        montant: value.montant,
        obs: (!isNullOrUndefined(value.obs) ? (value.obs + '').toLocaleUpperCase() : null),
        stationPompe: value.stationPompe,
        stationPompeId: value.stationPompe.id,
        stationProduit: value.stationProduit,
        stationProduitId: value.stationProduit.id,
        rjvId: this.local_data.id,
      };
    })

    this.local_data.indexProduits = cp;
    
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

  // async selectionDialog(action, obj: any = {}) {

  //   obj.actionId = action;

  //   if (action == 'stationProduit') {
  //     obj.action = "Choix d'un produit";
  //     obj.canAdd = false;
  //     obj.canSearchServer = true;
  //     obj.preFill = true;
  //     obj.isHeadOffice = true;

  //     obj.stationId = this.local_data.station.id;

  //     obj.stockFilled = true;

      
  //     let __date1 = new Date(this.local_data.date);
  //     let __date = new Date(__date1.getFullYear(), __date1.getMonth(), __date1.getDate(), 8, 0, 0);
  //     let _date = new Date(__date.getTime() - (__date.getTimezoneOffset() * 60000)).toJSON();

  //     obj.rjvDate = _date;

  //     obj.titleToAffich = 'title_forSelection'

  //     obj.notLoadData = '';

  //   }

  //   const dialogRef = this.popupService.open(SelectDialogComponent, '800px', {
  //     data: obj,
  //     panelClass: 'custom-dialog-container'
  //   });

  //   dialogRef.afterClosed().subscribe(async result => {
  //     //this.selectDialogAlreayOpen = false;

  //     if (!isNullOrUndefined(result) && !isNullOrUndefined(result.data)) {
  //       if (result.event == "Choix d'un produit") {
  //         console.log(result.data[0]);
  //         this.formData.get('stationProduit').setValue(result.data[0]);
  //         this.formData.get('qte').setValue(result.data[0].qteRestant);
  //       }
  //     }
  //   });
  //   //}

  // }

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
