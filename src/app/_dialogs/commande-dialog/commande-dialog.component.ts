import { Component, OnInit, Optional, Inject, ViewChild, ChangeDetectorRef, AfterContentInit, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../../_models/dialog-model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { CommandeData, CommandeService } from '../../_services/commande.service';
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
import { Guid } from 'guid-typescript';

/** Error when invalid control is dirty, touched, or submitted. */
export class SyboxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-commande-dialog',
  templateUrl: './commande-dialog.component.html',
  styleUrls: ['./commande-dialog.component.scss']
})
export class CommandeDialogComponent implements OnInit, AfterContentInit {

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
  commandeProduits: any = [];
  dialogData: any = null;

  // object
  // number
  tempIndexProduit = -1;
  tempIndexClasse = -1;

  // others
  formData: FormGroup;
  formDataSubProduit: FormGroup;
  formDataSubClasse: FormGroup;
  matcher = new SyboxErrorStateMatcher();
  mobileQuery: MediaQueryList;
  private signalR_connection: SignalRConnection;
  private _mobileQueryListener: () => void;
  @ViewChild('UploadFileInputdoc') uploadFileInputdoc: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CommandeDialogComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CommandeData,
    private formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    private commandeService: CommandeService,
    private selectionService: SelectionService,
    public authService: AuthService,
    private signalrService: SignalrService,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public popupService: PopupService,
    private env: EnvService,
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
      date: new FormControl(this.local_data.date||this.maxDate, Validators.compose([
        Validators.required
      ])),
      banqueChecque: new FormControl(this.local_data.banqueChecque),
      numcheque: new FormControl(this.local_data.numcheque),
      isAnnuler: new FormControl(this.local_data.isAnnuler || false),
      fournisseur: new FormControl(this.local_data.fournisseur, Validators.compose([
        Validators.required
      ]))
    });

    this.formDataSubProduit = this.formBuilder.group({
      isClient: new FormControl(false),
      fournisseurProduit: new FormControl(this.local_data.fournisseurProduit, Validators.compose([
        Validators.required
      ])),
      stationProduit: new FormControl(this.local_data.stationProduit),
      clientProduit: new FormControl(this.local_data.clientProduit),
      dateLivraisonPrevue: new FormControl(this.local_data.dateLivraisonPrevue, Validators.compose([
        Validators.required
      ])),
      qte: new FormControl(this.local_data.qte, Validators.compose([
        Validators.required
      ])),
      bl: new FormControl(this.local_data.bl),
      dc: new FormControl(this.local_data.dc)
    });


    this.formDataSubProduit
      .get('isClient')
      .valueChanges
      .pipe()
      .subscribe(value => {
        console.log(value);
        this.checkTypeCompte(value);
      });


    this.formData
      .get('banqueChecque')
      .valueChanges
      .pipe()
      .subscribe(value => {
        this.formData.get('numcheque').clearValidators();
        if (value != null && value != undefined) {
          this.formData.get('numcheque').setValidators([Validators.required]);
        }
      });


    this.selectedRowId = null;
    if (this.action != 'Création') {
      this.selectedRowId = this.local_data.id;
      this.commandeProduits = this.local_data.commandeProduits || [];
    }

    this.signalrService.notifConnexionChanged.subscribe((_signalR_connection: any) => {
      if (!isNullOrUndefined(_signalR_connection) && !isNullOrUndefined(_signalR_connection.id)) {
        this.signalR_connection = _signalR_connection;

        const CommandeUpdatedlistener = this.signalR_connection.listenFor('newCommandeUpdated');
        CommandeUpdatedlistener.subscribe(async (data: string) => {
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


  private checkTypeCompte(value) {

    this.formDataSubProduit.get('clientProduit').reset(null);
    this.formDataSubProduit.get('clientProduit').clearValidators();

    this.formDataSubProduit.get('stationProduit').reset(null);
    this.formDataSubProduit.get('stationProduit').clearValidators();

    if (value == true) {
      this.formDataSubProduit.get('clientProduit').setValidators([Validators.required]);
    } else {

      this.formDataSubProduit.get('stationProduit').setValidators([Validators.required]);
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
    return this.formData.valid && this.commandeProduits && this.commandeProduits.length > 0 && this.tempIndexProduit < 0;
  }

  private doAction(resp) {
    this.dialogRef.close({ event: this.action, data: resp });
  }

  cancelProduit() {
    this.formDataSubProduit.controls['fournisseurProduit'].reset();
    this.formDataSubProduit.controls['stationProduit'].reset();
    this.formDataSubProduit.controls['clientProduit'].reset();
    this.formDataSubProduit.controls['qte'].reset();
    this.formDataSubProduit.controls['bl'].reset();
    this.formDataSubProduit.controls['dc'].reset();
    this.formDataSubProduit.controls['dateLivraisonPrevue'].reset();
    this.tempIndexProduit = -1;
  }

  editProduit(_data1, i) {
    this.formDataSubProduit.get('fournisseurProduit').setValue(_data1.fournisseurProduit);
    this.formDataSubProduit.get('stationProduit').setValue(_data1.stationProduit);
    this.formDataSubProduit.get('clientProduit').setValue(_data1.clientProduit);
    this.formDataSubProduit.get('qte').setValue(_data1.qte);
    this.formDataSubProduit.get('bl').setValue(_data1.bl);
    this.formDataSubProduit.get('dc').setValue(_data1.dc);
    this.formDataSubProduit.get('dateLivraisonPrevue').setValue(_data1.dateLivraisonPrevue);
    this.formDataSubProduit.get('prix').setValue(_data1.fournisseurProduit.prix);
    this.tempIndexProduit = i;
  }

  deleteProduit(i) {
    this.commandeProduits.splice(i, 1);
  }

  addProduit(_data1) {

    let _cp = this.commandeProduits[this.tempIndexProduit] || {};

    _cp.qte = _data1.qte;
    _cp.bl = _data1.bl;
    _cp.dc = _data1.dc;
    _cp.dateLivraisonPrevue = _data1.dateLivraisonPrevue;
    _cp.prix = _data1.fournisseurProduit.prix;

    _cp.fournisseurProduit = _data1.fournisseurProduit;
    _cp.fournisseurProduitId = _data1.fournisseurProduit.id;

    if (_data1.stationProduit) {
      _cp.stationProduit = _data1.stationProduit;
      _cp.stationProduitId = _data1.stationProduit.id;
    } else {
      _cp.clientProduit = null;
      _cp.clientProduitId = null;
    }

    if (_data1.clientProduit) {
      _cp.clientProduit = _data1.clientProduit;
      _cp.clientProduitId = _data1.clientProduit.id;
    } else {
      _cp.clientProduit = null;
      _cp.clientProduitId = null;
    }


    if (this.tempIndexProduit >= 0) {
      this.tempIndexProduit = -1;
    } else {
      _cp.commandeId = this.local_data.id;

      let _pass = this.commandeProduits.filter((x) => {
        return x.fournisseurProduitId == _cp.fournisseurProduitId &&
          (x.stationProduitId == _cp.stationProduitId || x.clientProduitId == _cp.clientProduitId);
      })[0];
      if (_pass != null && _pass != undefined) {
        _pass.prix = _cp.prix;
      } else {
        this.commandeProduits.push(_cp);
      }
    }

    this.cancelProduit();
  }

  onSubmit(_data1) {
    console.log(_data1);

    let isNew = true;

    const myLocalId = this.local_data.id ?? Guid.create().toString();

    if (this.local_data.id) {
      isNew = false;
    }

    let __dateCreation1 = new Date(_data1.date);
    let _dateCreation = new Date(__dateCreation1.getTime() - (__dateCreation1.getTimezoneOffset() * 60000)).toJSON();

    let __date1 = new Date(_data1.date);
    let __date = new Date(__date1.getFullYear(), __date1.getMonth(), __date1.getDate(), 8, 0, 0);
    let _date = new Date(__date.getTime() - (__date.getTimezoneOffset() * 60000)).toJSON();

    const cp = {
      id: myLocalId,
      date: _date,
      dateCreation: _dateCreation,
      numcheque: _data1.numcheque,
      isAnnuler: _data1.isAnnuler,
      banqueChecque: _data1.banqueChecque,
      banqueChecqueId: _data1.banqueChecque.id,
      fournisseur: _data1.fournisseur,
      fournisseurId: _data1.fournisseur.id,
      commandeProduits: this.commandeProduits.length == 0 ? [] : this.commandeProduits.map((value) => {

        let __date2 = new Date(value.dateLivraisonPrevue);
        let __date3 = new Date(__date2.getFullYear(), __date2.getMonth(), __date2.getDate(), 8, 0, 0);
        let _date4 = new Date(__date3.getTime() - (__date3.getTimezoneOffset() * 60000)).toJSON();

        return {
          id: value.id,
          qte: value.qte,
          bl: isNullOrUndefined(value.bl)?null:(value.bl+'').toUpperCase(),
          dc: isNullOrUndefined(value.dc)?null:(value.dc+'').toUpperCase(),
          dateLivraisonPrevue: _date4,
          prix: value.prix,
          fournisseurProduit: value.fournisseurProduit,
          fournisseurProduitId: value.fournisseurProduit.id,
          stationProduit: value.stationProduit,
          stationProduitId: value.stationProduit ? value.stationProduit.id : null,
          clientProduit: value.clientProduit,
          clientProduitId: value.clientProduit ? value.clientProduit.id : null,
          commandeId: this.local_data.id,
        };
      })
    };

    //postedcommande

    this.loading = true;

    setTimeout(() => {

      //console.log(_data1.docphoto);

      if (this.action == 'Création' || this.action == 'Modification') {
        let _dt: any[] = this.commandeService.commandeValue;
        if (isNew == false) {
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
        this.commandeService.setcommande(_dt);
        this.doAction(cp);
        this.loading = false;
      } else if (this.action == 'Suppression') {
        if ((cp.id > 0) != true) {
          let _dt: any[] = this.commandeService.commandeValue;
          _dt = _dt.filter((value, key) => {
            return value.id != cp.id;
          });
          this.commandeService.setcommande(_dt);
          this.doAction(cp);
          this.loading = false;
        } else {
          this.commandeService.delete(cp.id).pipe(first()).subscribe(data => {
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

    if (action == 'banqueChecque') {
      obj.action = "Choix d'un chequier";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;
      obj.isHeadOffice = true;

      obj.titleToAffich = 'titleLong'

      obj.notLoadData = '';

      if (this.commandeProduits != undefined && this.commandeProduits != null) {
        for (let i = 0; i < this.commandeProduits.length; i++) {
          obj.notLoadData += this.commandeProduits[i].id + '';
        }
      }

    } else if (action == 'fournisseur') {
      obj.action = "Choix d'un fournisseur";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;
      obj.isHeadOffice = true;

      obj.notLoadData = '';

      if (this.commandeProduits != undefined && this.commandeProduits != null) {
        for (let i = 0; i < this.commandeProduits.length; i++) {
          obj.notLoadData += this.commandeProduits[i].id + '';
        }
      }

    } else if (action == 'clientProduit') {
      obj.action = "Choix d'un client";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;
      obj.isHeadOffice = true;

      obj.titleToAffich = 'title_forSelection'

      obj.onlyLoadData = '' + this.formDataSubProduit.get('fournisseurProduit').value.produitId;

      obj.notLoadData = '';
      // if (this.commandeProduits != undefined && this.commandeProduits != null) {
      //   for (let i = 0; i < this.commandeProduits.length; i++) {
      //     obj.notLoadData += this.commandeProduits[i].id + '';
      //   }
      // }

    } else if (action == 'stationProduit') {
      obj.action = "Choix d'une station";
      obj.canAdd = false;
      obj.canSearchServer = true;
      obj.preFill = true;
      obj.isHeadOffice = true;

      obj.titleToAffich = 'title_forSelection'

      obj.onlyLoadData = '' + this.formDataSubProduit.get('fournisseurProduit').value.produitId;

      obj.notLoadData = '';
      // if (this.commandeProduits != undefined && this.commandeProduits != null) {
      //   for (let i = 0; i < this.commandeProduits.length; i++) {
      //     obj.notLoadData += this.commandeProduits[i].id + '';
      //   }
      // }

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
        if (result.event == "Choix d'un chequier") {
          console.log(result.data[0]);
          this.formData.get('banqueChecque').setValue(result.data[0])
        } else if (result.event == "Choix d'un fournisseur") {
          console.log(result.data[0]);
          this.formData.get('fournisseur').setValue(result.data[0])
        } else if (result.event == "Choix d'un client") {
          console.log(result.data[0]);
          this.formDataSubProduit.get('clientProduit').setValue(result.data[0])
        } else if (result.event == "Choix d'une station") {
          console.log(result.data[0]);
          this.formDataSubProduit.get('stationProduit').setValue(result.data[0])
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
    const form_field = this.formData.get(field) || this.formDataSubProduit.get(field) || this.formDataSubClasse.get(field);
    if (isNullOrUndefined(form_field) || (!isNullOrUndefined(form_field) && !form_field.validator)) {
      return false;
    }
    //console.log(field);
    const validator = form_field.validator({} as AbstractControl);
    return (validator && validator.required);
  }

}
