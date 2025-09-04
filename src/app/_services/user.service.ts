import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

export interface UserApi {
  items: UserData[];
  total_count: number;
}

export interface UserData {
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
export class UserService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<UserApi>(`${this.env.API_URL}/api/Comptes?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<User[]>(`${this.env.API_URL}/api/Comptes/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<User[]>(`${this.env.API_URL}/api/Comptes`).pipe(share());
    // }
  }


  searchCommune(tofind: string = null): any {
    return this.http.post<string[]>(`${this.env.API_URL}/api/Comptes/searchautocompletecommune`, { tofind });
  }


  saveUserConnexionInfos(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/saveUserConnexionInfos`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Comptes/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Comptes/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Comptes/checkUsername`, data).pipe(share()).toPromise();
  }



}
