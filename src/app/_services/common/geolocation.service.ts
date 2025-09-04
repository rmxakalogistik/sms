import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';
// import { AuthService } from './auth.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { isNullOrUndefined } from 'util';
// import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';
// import { DeviceDetectorService } from 'ngx-device-detector';
// import { ConnexionService } from './connexion.service';
// import { first } from 'rxjs/operators';
// import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private hasApi: boolean;
  // private _position: Position = null;
  private positionChanged: BehaviorSubject<any>;
  public notifPositionChanged: Observable<any>;

  constructor(
    private http: HttpClient,
    private env: EnvService, ) {

    this.hasApi = 'geolocation' in navigator;

    this.positionChanged = new BehaviorSubject(JSON.parse(localStorage.getItem('currentPosition')));
    this.notifPositionChanged = this.positionChanged.asObservable();
  }


  public get currentPosition(): any {
    return this.positionChanged.value;
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      },
        err => {
          reject(err);
        },
        { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true });
    });

  }

  // getCurrentPosition(options: PositionOptions = {}): Promise<Position> {
  //  return new Promise((resolve, reject) => {
  //    if (!this.hasApi) {
  //      reject('The Geolocation API is not available on this browser');
  //    }
  //    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  //  });
  // }

  // private watchPosition() {
  //  if (!this.hasApi) {
  //    let _error = 'The Geolocation API is not available on this browser';
  //    this.handleError(_error);
  //    this.notifyNewPosition(null);
  //    return;
  //  }
  //  console.log('locator start...');
  //  return new Promise((resolve, reject) => {
  //    (<any>navigator.geolocation).getAccurateCurrentPosition(
  //      (position) => {
  //        this.notifyNewPosition(position);
  //        resolve(position);
  //      },
  //      (error) => {
  //        this.handleError(error);
  //        reject(error);
  //      },
  //      (progress) => {
  //        console.log(`progress: ${JSON.stringify(progress)}`);
  //      },
  //      {
  //        desiredAccuracy: 20,
  //        maxWait: 20000,
  //      }
  //    );

  //    //navigator.geolocation.watchPosition(
  //    //  (position) => subscriber.next(position),
  //    //  (error) => subscriber.error(error),
  //    //  options
  //    //);

  //  });
  // }

  // private handleError(errorResponse: any) {
  //  console.error(errorResponse);
  //  //if (this.authService.userValue) {

  //  //  this._snackBar.open('Vous êtes hors ligne.', null, {
  //  //    duration: 0,
  //  //  });

  //  //  setTimeout(() => {
  //  //    this.connectSignalR();
  //  //  }, 5000);

  //  //}
  // }

  async notifyNewPosition(position) {
    localStorage.setItem('currentPosition', JSON.stringify(position));
    this.positionChanged.next(position);
  }


  getAddressGoogleMap(latitude, longitude) {
    const _url = 'https://maps.googleapis.com/maps/api/geocode/json';
    return this.http.get<any>(`${_url}?latlng=${latitude},${longitude}&key=${this.env.GOOGLE_MAP_KEY}`).pipe(share()).toPromise();
  }


  getUserLocation() {
    //const settings = {
    //  async: true,
    //  crossDomain: true,
    //  headers: {
    //    'x-rapidapi-host': 'jkosgei-free-ip-geolocation-v1.p.rapidapi.com',
    //    'x-rapidapi-key': 'be19fc9ee0msh2798253a9fca2d0p1a5008jsnfe41f83327f9'
    //  }
    //};

    const apikey = '8a0c598e3944551ee7b3ff3db7ed820b7b33050a4ed491c4debaf717' || 'test';

    const _url = 'https://api.ipdata.co?api-key';
    return this.http.get<any>(`${_url}=${apikey}`).pipe(share()).toPromise();
  }


  // async GetCoordinates() {
  //  try {
  //    var timeoutVal = 10 * 1000 * 1000;
  //    return await this.watchPosition();
  //  } catch (e) {
  //    if (e.name == 'PositionError') {
  //      console.log(e.message + ". code = " + e.code);
  //    }
  //    return {}; // this.authService.ipLookUp();
  //  }
  // }

}


