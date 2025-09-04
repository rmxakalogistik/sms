import { Injectable, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Devi } from '../_models/devi';
import { EnvService } from './common/env.service';
import { share } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
// import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class SecureCommonService {

  private datashareSubject: BehaviorSubject<any>;
  datashare: any;

  private deff_hub = {
    preview: null,
    commune_individus: null,
    commune_paiements: null,
    commune_users: null,
    user_autorisations: null,
    user_communes: null,
    verbalisation_paiements: null,
    individu_verbalisations: null,
    etiquette_vignettes: null,
  };

  constructor(
    private http: HttpClient,
    private env: EnvService,
    private router: Router,
  ) {

    const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
    // if (isNullOrUndefined(__huh)) {
    //  __huh = this.deff_hub;
    // }
    this.datashareSubject = new BehaviorSubject<any>(__huh);
    this.datashare = this.datashareSubject.asObservable();
  }

  public get datashareValue(): any {
    return this.datashareSubject.value;
  }

  manageCommonList(key, data: any=null):any {
    if(data!=null){
      localStorage.setItem(key, JSON.stringify(data));
    }
    return JSON.parse(localStorage.getItem(key));
  }


  manageStationId(type: string='', data: any=null):any {
    if (type == 'add') {
      localStorage.setItem('stationId', JSON.stringify(data));
    } else if (type == 'clear') {
      localStorage.removeItem('stationId');
    }
    return JSON.parse(localStorage.getItem('stationId'));
  }
  
  // public async setrjv(_data, stationId) {
  //   localStorage.setItem(stationId+'rjvs', JSON.stringify(_data));
  //   this.localRjvSubject.next(_data);
  // }


  ShareClear(isLeaved= false) {
    const __huh = this.deff_hub;
    localStorage.setItem('datashare', JSON.stringify(__huh));
    if (isLeaved == true) {
      this.datashareSubject.next(null);
    } else {
      this.datashareSubject.next(__huh);
    }
  }

  ShareItemClear(elem) {
    const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
    if (__huh[elem]) {
      __huh[elem] = null;
      localStorage.setItem('datashare', JSON.stringify(__huh));
      this.datashareSubject.next(__huh);
    } else {
      // console.log(elem, `is null`);
    }
  }

  Shareuser_autorisation(data) {
    const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
    __huh.user_autorisations = data;
    localStorage.setItem('datashare', JSON.stringify(__huh));
    this.datashareSubject.next(__huh);
  }

  //Shareuser_commune(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.user_communes = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  //Sharecommune_user(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.commune_users = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  //Sharecommune_individu(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.commune_individus = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  //Sharecommune_paiement(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.commune_paiements = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  //Shareverbalisation_paiement(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.verbalisation_paiements = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  //Shareverbalisation_individu(data) {
  //  const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
  //  __huh.individu_verbalisations = data;
  //  localStorage.setItem('datashare', JSON.stringify(__huh));
  //  this.datashareSubject.next(__huh);
  //}

  Sharevignette_etiquette(data) {
    const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
    __huh.etiquette_vignettes = data;
    localStorage.setItem('datashare', JSON.stringify(__huh));
    this.datashareSubject.next(__huh);
  }

  SendPdf(data) {
    return this.http.post<any>(`${this.env.API_URL}/api/Notifications/SendPdf`, data).pipe(share());
  }

  Sharepreview(printDevi: ElementRef, _childNode) {

    (printDevi.nativeElement.querySelectorAll('#imagesss') as HTMLElement[]).forEach(el => { el.setAttribute('src', `${this.env.API_URL}/assets/img/logo-primary-mini.png`); el.style.width = '200px'; });
    (printDevi.nativeElement.querySelectorAll('#imagesssgauche') as HTMLElement[]).forEach(el => { el.setAttribute('src', `${this.env.API_URL}/assets/img/logo-primary-mini.png`); el.style.width = '450px'; });
    (printDevi.nativeElement.querySelectorAll('#imagesssdroite') as HTMLElement[]).forEach(el => { el.setAttribute('src', `${this.env.API_URL}/assets/img/logo.png`); el.style.width = '200px'; });
    (printDevi.nativeElement.querySelectorAll('#dataToPrint-table') as HTMLElement[]).forEach(el => { el.style.padding = '0'; el.style.borderCollapse = 'collapse'; });
    (printDevi.nativeElement.querySelectorAll('h1 ,h2 ,h3 ,h4 ,h5 ,h6') as HTMLElement[]).forEach(el => el.style.margin = '5px');
    (printDevi.nativeElement.querySelectorAll('h1 small,h2 small,h3 small,h4 small,h5 small,h6 small') as HTMLElement[]).forEach(el => el.style.fontSize = '70%');
    (printDevi.nativeElement.querySelectorAll('#dataToPrint-table .divtablebody th, #dataToPrint-table .divtablebody td') as HTMLElement[]).forEach(el => { el.style.padding = '10px'; el.style.fontSize = '12px'; });
    (printDevi.nativeElement.querySelectorAll('#dataToPrint-table .divtablebody .thTop, #dataToPrint-table .divtablebody .tdTop') as HTMLElement[]).forEach(el => { el.style.borderTop = '1px solid #d7d7d7'; });
    (printDevi.nativeElement.querySelectorAll('#dataToPrint-table .divtablebody .thBottom, #dataToPrint-table .divtablebody .tdBottom') as HTMLElement[]).forEach(el => { el.style.borderBottom = '1px solid #d7d7d7'; });
    (printDevi.nativeElement.querySelectorAll('.orDivider') as HTMLElement[]).forEach(el => { el.style.alignItems = 'center'; el.style.justifyContent = 'center'; el.style.flexDirection = 'row'; el.style.display = 'flex'; el.style.width = '100%'; el.style.marginTop = '5px'; el.style.marginBottom = '5px'; });
    (printDevi.nativeElement.querySelectorAll('.orDivider hr.line') as HTMLElement[]).forEach(el => { el.style.fontWeight = '300'; el.style.flex = '1'; el.style.borderTop = '1px dashed #d7d7d7'; });
    (printDevi.nativeElement.querySelectorAll('.orDivider .text') as HTMLElement[]).forEach(el => { el.style.paddingRight = '10px'; el.style.paddingLeft = '10px'; el.style.color = '#d7d7d7'; });

    _childNode.childNode = printDevi.nativeElement.querySelector('#dataToPrint-div').innerHTML;

    const __huh = JSON.parse(localStorage.getItem('datashare')) || this.deff_hub;
    __huh.preview = _childNode;

    localStorage.setItem('datashare', JSON.stringify(__huh));
    this.datashareSubject.next(__huh);

  }



}
