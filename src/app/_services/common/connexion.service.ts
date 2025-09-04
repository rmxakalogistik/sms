import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnexionService {
  constructor(private http: HttpClient, private env: EnvService) {

  }

  // getAll() {
  //  return this.http.get<any[]>(`${this.env.API_URL}/api/Connexions`);
  // }

  getUserConnexion(id) {
    return this.http.get<any>(`${this.env.API_URL}/api/Connexions/thisUserConnexion?id=${id}`).pipe(share());
  }

  getUserConnexions() {
    return this.http.get<any>(`${this.env.API_URL}/api/Connexions/userConnexions`).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Connexions/${id}`).pipe(share());
  }

}
