import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
/// <reference path="../../typings/crypto-js/crypto-js.d.ts" />
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncrDecrService {

  constructor() { }

  // The set method is use for encrypt the value.
  set(value, keys = environment.ebombeli) {
    const encrypted = CryptoJS.AES.encrypt(value.toString(), keys);
    return encrypted.toString();
  }

  // The get method is use for decrypt the value.
  get(value, keys = environment.ebombeli) {
    const decrypted = CryptoJS.AES.decrypt(value, keys);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}
