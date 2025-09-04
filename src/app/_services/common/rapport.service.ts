import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';

export interface RapportApi {
  items: RapportData[];
  total_count: number;
}


export interface RapportData {
  id: string;
  datedoc: Date;
}


@Injectable({
  providedIn: 'root'
})
export class RapportService {

  constructor(private http: HttpClient, private env: EnvService) { }


  getRapportTitre(tofind: string = null): any {
    return this.http.post<string[]>(`${this.env.API_URL}/api/Rapports/titres`, { tofind });
  }


  getRaportData(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Rapports/datas`, data);
  }

  getAllFilterTrajetListe(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Rapports/filterTrajetListe`, data);
  }

}
