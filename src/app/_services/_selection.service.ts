import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Fonction } from '../_models/fonction';
import { EnvService } from './common/env.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Selections/all`, data);
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Selections`, data);
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Fonctions/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Fonctions/${id}`);
  }

}
