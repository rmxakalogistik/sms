import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, Inject, EventEmitter, ViewChild } from '@angular/core';
import { SE } from '../_common/directives/scroll.directive';
import { MatDialog } from '@angular/material/dialog';
// import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { DOCUMENT, Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../_services/common/auth.service';
import { User } from '../_models/user';
import { ConfirmDialogModel } from '../_models/dialog-model';
import { ConfirmDialogComponent } from '../_common/dialogs/confirm-dialog/confirm-dialog.component';
import { SwPush } from '@angular/service-worker';
import { UserService } from '../_services/user.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first, filter, pairwise } from 'rxjs/operators';
import { EnvService } from '../_services/common/env.service';

// import { SignalR, SignalRConnection, IConnectionOptions } from 'ng2-signalr';
import { SignalRConnection } from 'ng2-signalr';
import * as $ from 'jquery';
import { SignalrService } from '../_services/common/signalr.service';
import { isNullOrUndefined } from 'util';
import { SecureCommonService } from '../_services/_secure-common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Howl, Howler } from 'howler';
import { ConnexionService } from '../_services/common/connexion.service';
import { GeolocationService } from '../_services/common/geolocation.service';
import { PopupService } from '../_services/common/popup.service';


@Component({
  selector: 'app-secure',
  templateUrl: './secure.component.html',
  styleUrls: ['./secure.component.scss']
})
export class SecureComponent implements OnDestroy {

  // { "publicKey": "BPWSlOWqk9UaiUnLs0oSHQveGA7cMo-0vfcFCe-FzE2hCw1iS1IAL3vi1ZE-gvJW-IoqSN-MdvsRgBBBbsBXAvE", "privateKey": "UquAWoi67gUsmVRnSMRrhJ9ROA6jjNjTUbAltlhdapA" }

  //readonly VAPID_PUBLIC_KEY = 'BPWSlOWqk9UaiUnLs0oSHQveGA7cMo-0vfcFCe-FzE2hCw1iS1IAL3vi1ZE-gvJW-IoqSN-MdvsRgBBBbsBXAvE';


  messageReceived = new EventEmitter<any>();
  connectionEstablished = new EventEmitter<Boolean>();

  private currentSignalrConnection: SignalRConnection = null;
  private currentsignalrConnectionId = '';
  
  authImage = "assets/img/logo-secondary-mini.png";
  deviceInfo = null;

  contactFabButton: any;
  bodyelement: any;
  menubutton: any;
  sidenavelement: any;
  dialogData: any = null;
  _device: any;
  currentUserConnexion: any;

  isActive = false;
  isActivefadeInDown = true;
  fixedTolbar = true;
  logOutNotifAlreayOpen: boolean = false;
  canGoBack = false;

  mobileQuery: MediaQueryList;

  loggedUser: User;

  private _mobileQueryListener: () => void;
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;
  private currentUrl_page_param: string = undefined;

  @ViewChild('snav') public sidenav;
  _currentUrl: string;

  constructor(@Inject(DOCUMENT) document,
    changeDetectorRef: ChangeDetectorRef,
    private geolocationService: GeolocationService,
    media: MediaMatcher,
    public dialog: MatDialog,
    private router: Router,
    public authService: AuthService,
    readonly swPush: SwPush,
    private userService: UserService,
    private connexionService: ConnexionService,
    private deviceService: DeviceDetectorService,
    private env: EnvService,
    private route: ActivatedRoute,
    public signalrService: SignalrService,
    private _location: Location,
    private popupService: PopupService,
    private secureCommonService: SecureCommonService,
    private _snackBar: MatSnackBar,
  ) {
    Howler.volume(0.2);

    this.currentUrl = this.router.url;
    this.previousUrl = this.currentUrl;

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.loggedUser = this.authService.userValue;

    this.geolocationService.notifPositionChanged.subscribe((_receivedPosition: any) => {
      if (!isNullOrUndefined(_receivedPosition)) {
        const fullposition: any = { autolocateposition: {} };
        fullposition.autolocateposition.longitude = _receivedPosition.coords.longitude;
        fullposition.autolocateposition.latitude = _receivedPosition.coords.latitude;
        this.authService.updateUserData(null, _receivedPosition);
      }
    });

    this.signalrService.notifConnexionChanged.subscribe((_receivedSignalRConnexion: any) => {
      if (!isNullOrUndefined(this.authService.userValue)) {
        if (!isNullOrUndefined(_receivedSignalRConnexion) && !isNullOrUndefined(_receivedSignalRConnexion.id)) {

          const SelfUserAutoDisconnect = _receivedSignalRConnexion.listenFor('newSelfUserAutoDisconnect');
          SelfUserAutoDisconnect.subscribe(async (data) => {
            this.logOutNotif("VOS DONNÉES ONT ÉTÉ MODIFIÉ, NOUS ALLONS VOUS DÉCONNECTEZ DE L'APPLICATION.");
          });

          this.currentsignalrConnectionId = _receivedSignalRConnexion.id;
          this.currentSignalrConnection = _receivedSignalRConnexion;
          this.authService.updateUserData(this.currentSignalrConnection.id, null);

        }
      }
    });

    this.router.events.subscribe(event => {
      this.sidenav?.close();
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      pairwise()
    ).subscribe((event: any) => {
      
      this.previousUrl = event[0]?.url;
      this.currentUrl = event[1]?.url;

      this.chedkbackClicked();
    });

    this._location.onUrlChange((url: string, state: unknown) => {
      this.chedkbackClicked();
    });

  }

  ngOnInit() {
    this.chedkbackClicked();
    this.signalrService.connectSignalR();
  }

  chedkbackClicked() {
    const _previousUrl = this.previousUrl?.split('/sds-secure/')[1];
    let __currentUrl = this.currentUrl?.split('/sds-secure/')[1];
    
    if (__currentUrl?.indexOf('previewer') >= 0) {
      this.canGoBack = true;
      this.currentUrl_page_param = 'previewer';
    } else {

      if (_previousUrl?.indexOf('previewer') >= 0) {
        this.canGoBack = false;
        this.secureCommonService.ShareItemClear('previewer');
      }

      if (_previousUrl?.indexOf('?') >= 0 || __currentUrl?.indexOf('?') >= 0) {
        const _previous_page = _previousUrl?.split('?')[0];
        const _previous_param = _previousUrl?.split('?')[1]?.split('=')[0];

        const _current_page = __currentUrl?.split('?')[0];
        const _current_param = __currentUrl?.split('?')[1]?.split('=')[0];

        this._currentUrl = _current_page;

        this.currentUrl_page_param = _current_page + '?' + _current_param;

        if (__currentUrl?.indexOf(_current_page + '?' + _current_param) >= 0) {
          this.canGoBack = true;
        } else {
          this.canGoBack = false;
          this.secureCommonService.ShareItemClear(_previous_param + '_' + _previous_page);
        }
      } else {
        this._currentUrl = __currentUrl;
      }


    }

    this._currentUrl = this._currentUrl == undefined ? '' : this._currentUrl;


  }

  backClicked() {
    if (this.canGoBack) {
      this.secureCommonService.ShareItemClear(this.currentUrl_page_param);
      this._location.back();
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

  scroll(id, top = false, sidenavv = false) {

    if (top == true) {
      setTimeout(() => {
        $('html, body').animate({ scrollTop: $('#mat-toolbar').offset().top - 300 }, 'slow');
      }, 500);
    }

    if (sidenavv == true) {
      $('#menubutton').click();
    }

  }

  setToggleOn() {

    this.bodyelement = document.getElementById('sms_page');
    this.bodyelement.classList.add('scrollOff');
  }

  setToggleOff() {

    this.bodyelement = document.getElementById('sms_page');
    this.bodyelement.classList.remove('scrollOff');
  }

  closeSideNav(urlToGo) {
    $('#menubutton').click();
    this.router.navigate([urlToGo]);
  }

  logout() {

    const message = `Êtes-vous sûr de vouloir vous déconnecter?`;

    const dialogData = new ConfirmDialogModel('Confirmation', message, 'primary');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result = dialogResult;
      if (result) {
        // this.secureCommonService.ShareClear(true);
        this.authService.logout();
      }
    });

  }


  ngOnDestroy(): void {
    this.secureCommonService.ShareClear(true);
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.currentSignalrConnection) {
      this.currentSignalrConnection.stop();
      this.currentSignalrConnection = null;
    }
    this._snackBar.dismiss();
  }


  logOutNotif(msg) {
    if (this.logOutNotifAlreayOpen != true && isNullOrUndefined(this.dialogData)) {
      this.logOutNotifAlreayOpen = true;
      const message = msg;
      console.log(this.dialogData, this.logOutNotifAlreayOpen);
      this.dialogData = new ConfirmDialogModel('Information', message, 'primary');


      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '300px',
        data: this.dialogData,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(async dialogResult => {
        //this.logOutNotifAlreayOpen = false;
        const result = dialogResult;
        if (result) {
          await this.authService.logout();
        }
      });

    }

  }


}
