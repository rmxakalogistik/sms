import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

export interface FournisseurApi {
  items: FournisseurData[];
  total_count: number;
}

export interface FournisseurData {
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
export class FournisseurService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<FournisseurApi>(`${this.env.API_URL}/api/Fournisseurs?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<Fournisseur[]>(`${this.env.API_URL}/api/Fournisseurs/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<Fournisseur[]>(`${this.env.API_URL}/api/Fournisseurs`).pipe(share());
    // }
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Fournisseurs/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Fournisseurs`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Fournisseurs/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Fournisseurs/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Fournisseurs/checkFournisseurname`, data).pipe(share()).toPromise();
  }



}
