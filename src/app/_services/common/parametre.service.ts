import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParametreService {
  constructor(private http: HttpClient, private env: EnvService) {

  }

  getAll() {
    return this.http.get<any[]>(`${this.env.API_URL}/api/Parametres`);
  }

  update(_parametre) {
    return this.http.put<any>(`${this.env.API_URL}/api/Parametres/${_parametre.id}`, _parametre).pipe(share());
  }

}
