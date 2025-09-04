import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

export interface ClientApi {
  items: ClientData[];
  total_count: number;
}

export interface ClientData {
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
export class ClientService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<ClientApi>(`${this.env.API_URL}/api/Clients?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<Client[]>(`${this.env.API_URL}/api/Clients/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<Client[]>(`${this.env.API_URL}/api/Clients`).pipe(share());
    // }
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Clients/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Clients`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Clients/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Clients/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Clients/checkClientname`, data).pipe(share()).toPromise();
  }



}
