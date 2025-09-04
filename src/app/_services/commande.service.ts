import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './common/auth.service';

export interface CommandeApi {
  items: CommandeData[];
  total_count: number;
}

export interface CommandeData {
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
export class CommandeService {

  private loggedUser:any;
  private localCommandeSubject: BehaviorSubject<any[]>;
  public localCommande: Observable<any[]>;


  constructor(private http: HttpClient, private env: EnvService,
    public authService: AuthService,) {

    this.loggedUser = this.authService.userValue;
    
    this.localCommandeSubject = new BehaviorSubject<any[]>(JSON.parse(localStorage.getItem(this.loggedUser.id+'commandes'))||[]);
    this.localCommande = this.localCommandeSubject.asObservable();
    
   }

   
  public get commandeValue(): any[] {
    return this.localCommandeSubject.value;
  }

  public async setcommande(_data) {
    localStorage.setItem(this.loggedUser.id+'commandes', JSON.stringify(_data));
    this.localCommandeSubject.next(_data);
  }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<CommandeApi>(`${this.env.API_URL}/api/Commandes?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<Commande[]>(`${this.env.API_URL}/api/Commandes/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<Commande[]>(`${this.env.API_URL}/api/Commandes`).pipe(share());
    // }
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Commandes/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Commandes`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Commandes/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Commandes/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Commandes/checkCommandename`, data).pipe(share()).toPromise();
  }



}
