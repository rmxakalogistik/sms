import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { SignalR, SignalRConfiguration, SignalRConnection, ConnectionTransports } from 'ng2-signalr';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';


@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  // loggedUser: User;
  private _connection: SignalRConnection = null;
  private _configuration: SignalRConfiguration = null;
  public connected = false;
  public __device;
  private isInConnexion: boolean;
  private connexionChanged = new BehaviorSubject(SignalRConnection);
  notifConnexionChanged = this.connexionChanged.asObservable();

  constructor(private _signalR: SignalR,
              private authService: AuthService, private env: EnvService,
              private _snackBar: MatSnackBar,
              private deviceService: DeviceDetectorService, ) {

    if (!isNullOrUndefined(this.authService.userValue)) {

      const $ = (window as any).$;
      $.signalR.ajaxDefaults.headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: this.authService.userValue.token_type + ' ' + this.authService.userValue.access_token
      });

      this._configuration = new SignalRConfiguration();
      this._configuration.hubName = 'notifHub';
      this._configuration.withCredentials = true;
      this._configuration.qs = { id: this.authService.userValue.id },
      // this._configuration.url = `${this.env.API_URL}/SignalR/notifHub`;
      this._configuration.url = `${this.env.API_URL}`;
      this._configuration.logging = true;
      this._configuration.jsonp = true;

      const _ddev = this.deviceService.getDeviceInfo();
      this.__device = _ddev.os;
      console.log(this.__device);

      if ((('' + _ddev.os).toUpperCase().indexOf('IOS') || ('' + _ddev.os).toUpperCase().indexOf('MAC') || ('' + _ddev.os).toUpperCase().indexOf('MAC OS')) >= 0) {
        // this._configuration.jsonp = false;
        this._configuration.transport = [ConnectionTransports.webSockets, ConnectionTransports.longPolling, ConnectionTransports.serverSentEvents];
        // this._configuration.transport = [ConnectionTransports.serverSentEvents, ConnectionTransports.longPolling, ConnectionTransports.webSockets];
      } else {
        // this._configuration.jsonp = true;
        this._configuration.transport = [ConnectionTransports.webSockets, ConnectionTransports.longPolling, ConnectionTransports.serverSentEvents];
      }
      this._configuration.executeErrorsInZone = true;
      this._configuration.executeEventsInZone = true;
      this._configuration.executeStatusChangeInZone = true;

      this._connection = this._signalR.createConnection(this._configuration);
      this._connection.errors.subscribe((error) => this.handleError(error, '3'));
      this._connection.status.subscribe((s) => {

        if (s.name == 'connected') {
          this.connected = true;
          this.isInConnexion = false;
          this._snackBar.dismiss();
          this.notifyNewConnexion(this._connection);
          console.log(this._connection.id);
        } else {
          this.notifyNewConnexion(null);
          this.connected = false;
          if (s.name === 'disconnected') {
            this.isInConnexion = false;
            if (this.authService.userValue) {
              // this._snackBar.open('Vous êtes hors ligne.', null, {
              //  duration: 0,
              // });
              setTimeout(() => {
                this.connectSignalR();
              }, 5000);
            }
          } else if (s.name === 'reconnecting') {
            this.isInConnexion = true;
            // this._snackBar.open('Tentative de reconnexion...', null, {
            //  duration: 0
            // });
          } else if (s.name === 'connecting') {
            this.isInConnexion = true;
            // this._snackBar.open('Connexion en cours...', null, {
            //  duration: 0
            // });
          }
        }

      });
      // console.log('ICICICIC');
    // this.connectSignalR();
    }
  }

  async connectSignalR() {
    if (!isNullOrUndefined(this.authService.userValue) && !this.isInConnexion) {
      try {
        await this._connection.start().catch((error) => this.handleError(error, '2'));
      } catch (e) {
        this.handleError(e, '1');
      }
    }
  }

  private handleError(errorResponse: any, ouu) {
    console.error(ouu + 'SIGNALR-HANDLED-ERROR: ' + errorResponse);
    if (this.authService.userValue) {

      // this._snackBar.open('Vous êtes hors ligne.' + ouu, null, {
      //  duration: 0,
      // });

      //// setTimeout(() => {
      ////  this.connectSignalR();
      //// }, 5000);

    }
  }

  private async notifyNewConnexion(resp) {
    this.connexionChanged.next(resp);
  }

  // async newSignalrlistenFor(resp: any) {
  //  this.listenForChanged.next(resp);
  // }

  // private async statusSucribe(resp: ISignalRConnection) {
  //  if (!isNullOrUndefined(resp)) {
  //    resp.status.subscribe((s) => {
  //      ////console.warn(s.name);
  //      ////console.warn(s.value);

  //      if (s.value === 4) {//'disconnected'
  //        if (this.authService.userValue) {

  //          this._snackBar.open('Vous êtes hors ligne.', null, {
  //            duration: 0,
  //          });
  //          setTimeout(() => {
  //            this.connectSignalR();
  //          }, 5000);
  //        }
  //      } else if (s.value === 2) {//'reconnecting'
  //        this._snackBar.open('Tentative de reconnexion...', null, {
  //          duration: 0
  //        });
  //      } else if (s.value === 0) {//'connecting'
  //        this._snackBar.open('Connexion en cours...', null, {
  //          duration: 0
  //        });
  //      }
  //      else {
  //        this._snackBar.dismiss();
  //      }
  //    });
  //    this.notifyNewConnexion(resp);
  //  }

  // }

}
