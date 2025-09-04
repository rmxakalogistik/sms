import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';

export interface ProduitApi {
  items: any[];
  total_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  constructor(private http: HttpClient, private env: EnvService) { }

  getAll(page: number, itemsPerPage: number, search: string = '') {
    return this.http.get<ProduitApi>(`${this.env.API_URL}/api/Produits?search=${search}&itemsPerPage=${itemsPerPage}&page=${page + 1}`);
    // if (communeId) {
    //  return this.http.get<Produit[]>(`${this.env.API_URL}/api/Produits/byCommune/${communeId}`).pipe(share());
    // } else {
    //  return this.http.get<Produit[]>(`${this.env.API_URL}/api/Produits`).pipe(share());
    // }
  }

  setLogoImage(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Produits/setLogoImage`, data).pipe(share());
  }

  add(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Produits`, data).pipe(share());
  }

  update(id: string, data) {
    return this.http.put<any>(`${this.env.API_URL}/api/Produits/${id}`, data).pipe(share());
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.env.API_URL}/api/Produits/${id}`).pipe(share());
  }

  checkName(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Produits/checkProduitname`, data).pipe(share()).toPromise();
  }



}
