import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, startWith, distinctUntilChanged, share, first } from 'rxjs/operators';
import { User } from '../../_models/user';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNullOrUndefined } from 'util';
import * as internalIp from 'internal-ip';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { DateAdapter } from '@angular/material/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { EnvService } from './env.service';
import { SecureCommonService } from '../_secure-common.service';
import { PopupService } from './popup.service';
import { GeolocationService } from './geolocation.service';
import { SwPush } from '@angular/service-worker';
import { UserService } from '../user.service';
// import { Observable, interval } from 'rxjs';
const moment = _rollupMoment || _moment;
moment.locale('fr');

declare global {
  interface Window {
    RTCPeerConnection: RTCPeerConnection;
    mozRTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: RTCPeerConnection;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUserConnexion: any;
  readonly VAPID_PUBLIC_KEY = 'BPWSlOWqk9UaiUnLs0oSHQveGA7cMo-0vfcFCe-FzE2hCw1iS1IAL3vi1ZE-gvJW-IoqSN-MdvsRgBBBbsBXAvE';

  //localIp = sessionStorage.getItem('LOCAL_IP');
  deviceData = JSON.parse(sessionStorage.getItem('DEVICE_DATA')) || {};

  private ipRegex = new RegExp(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);

  private maxDateBehavior: BehaviorSubject<Date>;
  public maxDate: Observable<Date>;

  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  private localIpSubject: BehaviorSubject<string>;
  public localIp: Observable<string>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private env: EnvService,
    private _snackBar: MatSnackBar,
    private _adapter: DateAdapter<any>,
    private secureCommonService: SecureCommonService,
    private popupService: PopupService,
    private zone: NgZone,
    private deviceService: DeviceDetectorService,
    private geolocationService: GeolocationService,
    readonly swPush: SwPush,
    private userService: UserService,
  ) {
    this._adapter.setLocale('fr');
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
    this.maxDateBehavior = new BehaviorSubject<Date>(new Date());
    this.maxDate = this.maxDateBehavior.asObservable();
    this.localIpSubject = new BehaviorSubject<string>(sessionStorage.getItem('LOCAL_IP'));
    this.localIp = this.localIpSubject.asObservable();
    this.determineLocalIp();
    //this.getLocalIp();
    this._updateUserData();
  }

  public get getMaxDate(): Date {
    return this.maxDateBehavior.value;
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get localIpValue(): string {
    return this.localIpSubject.value;
  }

  public set updateRole(_roles) {
    const usr = this.userValue;
    usr.role = _roles;
    localStorage.setItem('user', JSON.stringify(usr));
    this.userSubject.next(usr);
  }

  // get isUser() {
  //  return this.user && this.user.role === Role.User;
  // }

  public roleEXist(_role) {
    return this.userValue && this.userValue.role.find(x => x.id === _role);
  }

  saveUserInfo(_user): any {

    const user = (typeof (_user) === 'string') ? JSON.parse(_user) : _user;
    if (!isNullOrUndefined(user.role)) { user.role = JSON.parse(user.role); }
    if (!isNullOrUndefined(user.station)) { user.station = JSON.parse(user.station); }
    if (!isNullOrUndefined(user.connecion)) { user.connecion = JSON.parse(user.connecion); }
    if (!isNullOrUndefined(user.connectionId)) { user.connectionId = +user.connectionId; }

    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    this.getMaxData(user).subscribe();
    this.startRefreshTokenTimer();
    return user;
  }

  login(email: string, password: string) {
    const data = { username: email, password, deviceData: JSON.stringify(this.deviceData) };
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/Login`, data)
      .pipe(map(_user => {
        return this.saveUserInfo(_user);
      }));
  }

  refreshToken() {
    const data = { refresh_token: this.userValue?.refresh_token, deviceData: JSON.stringify(this.userValue?.connecion) };
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/Refresh-token`, data)
      .pipe(map((_user) => {
        return this.saveUserInfo(_user);
      }));
  }

  getMaxData(_user) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/GetMaxDate`, _user)
      .pipe(map(result => {
        this.maxDateBehavior.next(result);
      }));
  }

  forgotPassword(username: string) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/sendPasswordResetEmail`, { email: username })
      .pipe(map(resp => {
        // Email de réinitialisation du mot de passe envoyé, vérifiez votre boîte de réception.

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        // localStorage.setItem('user', JSON.stringify(user));
        // this.userSubject.next(user);
        return resp;
      }));
  }

  changePassword(_id: string, _password: string, _code) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/changePassword`, { id: _id, password: _password, code: _code })
      .pipe(map(resp => {
        // Email de réinitialisation du mot de passe envoyé, vérifiez votre boîte de réception.

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        // localStorage.setItem('user', JSON.stringify(user));
        // this.userSubject.next(user);
        return resp;
      }));
  }

  getUser(compteId: string) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/getuser`, { id: compteId })
      .pipe(map(resp => {
        return resp;
      }));
  }

  sendVerificationMail(username: string) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/sendVerificationMail`, { email: username })
      .pipe(map(resp => {
        // Email de réinitialisation du mot de passe envoyé, vérifiez votre boîte de réception.

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        // localStorage.setItem('user', JSON.stringify(user));
        // this.userSubject.next(user);
        return resp;
      }));
  }

  deleteToken() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  logout() {
    this.secureCommonService.ShareClear(true);
    // remove user from local storage to log user out
    this.popupService.close();
    this.deleteToken();
    this._snackBar.dismiss();
    this.router.navigate(['/sds-login']);
  }


  momentnow(val): Observable<string> {
    const pageLoaded = moment(val);
    return interval(60000).pipe(
      startWith(pageLoaded.fromNow(false)),
      map(() => pageLoaded.fromNow(false)),
      distinctUntilChanged()
    );
    // return moment(val).fromNow(false);
  }

  // helper methods

  private refreshTokenTimeout: any;

  private startRefreshTokenTimer() {
    if (this.userValue?.expires_in) {
      // set a timeout to refresh the token a minute before it expires
      const token: any = this.userValue;
      const expires = new Date(token['.expires']);// * 1000
      // const timeout1: number = expires.getTime() - Date.now() - (90 * 1000);
      // this.refreshTokenTimeout = setTimeout(() => this.getMaxData(this.userValue).subscribe(), timeout1);
      const timeout2: number = expires.getTime() - Date.now() - (60 * 1000);
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout2);
      //console.log(timeout1);
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  public async determineLocalIp() {
    // console.log(await internalIp.v6());
    // console.log(await internalIp.v4());
    
    let localips = await internalIp.v4();
    console.log(localips);
    if (localips != null && this.userValue && this.userValue.connecion) {

      if (localips != this.userValue.connecion.localipadress) {
        //this.localIp = localips[1];
        this.userValue.connecion.localipadress = localips;
      }
    }
    sessionStorage.setItem('LOCAL_IP', localips);
    this.localIpSubject.next(localips);

  }

  // public determineLocalIp() {
  //   (<any>window).RTCPeerConnection = this.getRTCPeerConnection();

  //   const pc = new RTCPeerConnection({ iceServers: [] });
  //   pc.createDataChannel('');
  //   pc.createOffer().then(pc.setLocalDescription.bind(pc));

  //   pc.onicecandidate = (ice) => {
  //     this.zone.run(() => {
  //       if (!ice || !ice.candidate || !ice.candidate.candidate) {
  //         //console.log('localips[1]');
  //         return;
  //       }

  //       let localips = this.ipRegex.exec(ice.candidate.candidate);
  //       console.log(localips);
  //       if (localips != null && this.userValue && this.userValue.connecion) {

  //         if (localips[1] != this.userValue.connecion.localipadress) {
  //           //this.localIp = localips[1];
  //           this.userValue.connecion.localipadress = localips[1];
  //         }
  //       }
  //       sessionStorage.setItem('LOCAL_IP', localips[1]);
  //       this.localIpSubject.next(localips[1]);

  //       pc.onicecandidate = () => { };
  //       pc.close();
  //     });
  //   };
  // }

  // private getRTCPeerConnection() {
  //   return window.RTCPeerConnection ||
  //     window.mozRTCPeerConnection ||
  //     window.webkitRTCPeerConnection;
  // }

  async updateUserData(_currentsignalrConnectionId = null, fullposition = null) {

    const usr: any = this.userValue;
    usr.connecion.localipadress = this.localIpValue;
    if (!isNullOrUndefined(_currentsignalrConnectionId)) { usr.connecion.signalrConnectionId = _currentsignalrConnectionId; }

    if (!isNullOrUndefined(fullposition)) {
      usr.connecion.geolocalisationInfo = JSON.stringify(fullposition);
    }

    localStorage.setItem('user', JSON.stringify(usr));
    this.userSubject.next(usr);

    this.currentUserConnexion = this.userService.saveUserConnexionInfos(usr.connecion).pipe(first()).subscribe(data => {
      //console.log(data);
    },
      error => {
        setTimeout(() => {
          this.userService.saveUserConnexionInfos(usr.connecion);
        }, 30000);
      });

  }

  private async _updateUserData() {

    let _device: any = this.deviceData;

    const _ddev = this.deviceService.getDeviceInfo();

    let deviceType = 'Mobile';
    if (this.deviceService.isMobile()) { deviceType = 'Mobile'; }
    if (this.deviceService.isTablet()) { deviceType = 'Tablet'; }
    if (this.deviceService.isDesktop()) { deviceType = 'Desktop'; }

    _device.userAgent = _ddev.userAgent;
    _device.os = _ddev.os;
    _device.browser = _ddev.browser;
    _device.device = _ddev.device;
    _device.os_version = _ddev.os_version;
    _device.browser_version = _ddev.browser_version;
    _device.deviceType = deviceType;
    _device.localipadress = this.localIpValue;

    try {
      const _Swfnotification: PushSubscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });
      if (!isNullOrUndefined(_Swfnotification)) {
        _device.pushSubscription = JSON.stringify(_Swfnotification);
      }
    } catch (e) { }


    sessionStorage.setItem('DEVICE_DATA', JSON.stringify(_device));

  }

}
