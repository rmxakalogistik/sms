import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutorisationService {
  constructor(private http: HttpClient, private env: EnvService) {

  }

  // getAll() {
  //  return this.http.get<any[]>(`${this.env.API_URL}/api/Autorisations`).pipe(share());
  // }

  changeUserAutorisation(autorisation: any, id: string) {
    return this.http.post<any>(`${this.env.API_URL}/api/Autorisations/updateUser/${id}`, autorisation).pipe(share());
  }

  getByUserId(id: string) {
    return this.http.get<any>(`${this.env.API_URL}/api/Autorisations/${id}`).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Autorisations/`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Autorisations/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Autorisations/${id}`).pipe(share());
  }

}
