import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

export interface StationApi {
  items: StationData[];
  total_count: number;
}

export interface StationData {
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
export class StationService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<StationApi>(`${this.env.API_URL}/api/Stations?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<Station[]>(`${this.env.API_URL}/api/Stations/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<Station[]>(`${this.env.API_URL}/api/Stations`).pipe(share());
    // }
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Stations/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Stations`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Stations/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Stations/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Stations/checkStationname`, data).pipe(share()).toPromise();
  }



}
