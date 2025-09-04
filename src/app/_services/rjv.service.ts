import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './common/auth.service';

export interface RjvApi {
  items: RjvData[];
  total_count: number;
  sameMonthDatas: number[];
}

export interface RjvData {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  country: string;
  gender: string;
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RjvService {

  private loggedUser:any;
  private localRjvSubject: BehaviorSubject<any[]>;
  public localRjv: Observable<any[]>;


  constructor(private http: HttpClient, private env: EnvService,
    public authService: AuthService,) {

    this.loggedUser = this.authService.userValue;
    
    let lastDate = this.authService.getMaxDate || new Date();

    let __date_ = new Date(lastDate);
    let __date__ = new Date(__date_.getFullYear(), __date_.getMonth(), __date_.getDate(), 8, 0, 0);
    let ___date___= new Date(__date__.getTime() - (__date__.getTimezoneOffset() * 60000)).toJSON();

    this.localRjvSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(this.loggedUser.stationId+'rjvs'+___date___))||[]);
    this.localRjv = this.localRjvSubject.asObservable();
    
   }

   
  public get rjvsValue(): any[] {
    return this.localRjvSubject.value;
  }
  // public async getrjv(_stationId) {
  //   let _sd = JSON.parse(localStorage.getItem(_stationId+'rjvs'));
  //   this.localRjvSubject.next(_sd);
  //   return _sd;
  // }

  public async setrjv(_data, stationId) {
    localStorage.setItem(stationId+'rjvs', JSON.stringify(_data));
    this.localRjvSubject.next(_data);
  }

  getAllDate(topos) {
    return this.http.post<RjvApi>(`${this.env.API_URL}/api/Rjvs/getAllDate`, topos);
  }

  getAll(topos) {
    return this.http.post<RjvApi>(`${this.env.API_URL}/api/Rjvs/getData`, topos);
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Rjvs/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Rjvs`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Rjvs/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Rjvs/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Rjvs/checkRjvname`, data).pipe(share()).toPromise();
  }



}
