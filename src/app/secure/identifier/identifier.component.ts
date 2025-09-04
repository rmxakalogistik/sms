import { OnInit, Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../_services/common/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { isNullOrUndefined } from 'util';
import { PopupService } from '../../_services/common/popup.service';
import randomColor from 'randomcolor';
import { EnvService } from '../../_services/common/env.service';
import { QrcodeDialogComponent } from '../../_common/dialogs/qrcode-dialog/qrcode-dialog.component';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfirmDialogModel } from 'src/app/_models/dialog-model';
import { ConfirmDialogComponent } from 'src/app/_common/dialogs/confirm-dialog/confirm-dialog.component';
import { User } from 'src/app/_models/user';
//import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
//import { ZXingScannerComponent } from '@zxing/ngx-scanner';
//import { BarcodeFormat } from '@zxing/library';
//import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-identifier',
  templateUrl: './identifier.component.html',
  styleUrls: ['./identifier.component.scss']
})
export class IdentifierComponent implements OnInit, AfterViewInit, OnDestroy {
    user: any;
  roles: any;
  env: EnvService;

  localip: string;
  loading = false;
  debounceTime = 1500;
  last_filterargs = '';
  search_shownumuniSubject: any;

  filterargs = '';
  isLoadingResults: boolean = false;

  currentData = null;

  datas = [];

  shownumuni: string;
  authImage = "assets/img/logo-primary-mini.png";
  _currentUrl: string;

  loggedUser: User;
  
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;

  public version: string;  // <-- Our version string
  
  constructor(
    public authService: AuthService,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private _snackBar: MatSnackBar,
    private popupService: PopupService,
    private _env: EnvService,
    private router: Router,
  ) {
    this.localip = this.authService.localIpValue;
    this.authService.localIp.subscribe(x => this.localip = x);
    this.version = this._env.APP_VERSION;

    this.env = _env;

    this.user = this.authService.userValue;
    this.roles = this.user.role;
    
    this.loggedUser = this.user;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  navigateTo(url){
    console.log(url);
    this.router.navigate([url]);
  }

  chedkbackClicked() {
    const _previousUrl = this.previousUrl?.split('/sds-secure/')[1]; // this.secureCommonService.getPreviousUrl()?.split('/sds-secure/')[1];
    let __currentUrl = this.currentUrl?.split('/sds-secure/')[1]; // this.secureCommonService.getCurrentUrl()?.split('/sds-secure/')[1];
    
    if (__currentUrl?.indexOf('previewer') >= 0) {
    } else {

      if (_previousUrl?.indexOf('?') >= 0 || __currentUrl?.indexOf('?') >= 0) {
        const _previous_page = _previousUrl?.split('?')[0];
        const _previous_param = _previousUrl?.split('?')[1]?.split('=')[0];

        const _current_page = __currentUrl?.split('?')[0];
        const _current_param = __currentUrl?.split('?')[1]?.split('=')[0];

        this._currentUrl = _current_page;
        
      } else {
        this._currentUrl = __currentUrl;
      }


    }

    this._currentUrl = this._currentUrl == undefined ? '' : this._currentUrl;


  }

  refreshToken(){
    this.authService.refreshToken().subscribe();
  }



}
