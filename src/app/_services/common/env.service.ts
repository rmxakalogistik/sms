import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  API_URL = environment.baseUrl;
  public APP_NAME = 'sms';
  public APP_VERSION = environment.version;
  public GOOGLE_MAP_KEY = environment.googleMapsAPIKey;
  // public baseHref = environment.baseHref;

  constructor() { }
}
