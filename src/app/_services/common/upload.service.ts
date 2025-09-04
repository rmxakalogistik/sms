import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// export interface UploadData {
//  id: string;
//  firstName: string;
//  lastName: string;
//  middleName: string;
//  email: string;
//  phone: string;
//  country: string;
//  gender: string;
//  isEmailConfirmed: boolean;
//  isPhoneConfirmed: boolean;
//  isActive: boolean;
// }

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient, private env: EnvService,
              private authService: AuthService, ) { }

  upload(_data): Observable<any> {
    const user = this.authService.userValue;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${user.access_token}`, 'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.env.API_URL}/api/upload/addorupdate`, _data, {
      headers: headers.delete('Content-Type'),
      reportProgress: true,
      observe: 'events'
    });
  }


}
