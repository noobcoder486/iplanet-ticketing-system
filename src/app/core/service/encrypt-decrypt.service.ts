import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptDecryptService {

  key = 'CRM@sunil@sahu';

  constructor() { }

  encrypt(text) {
    let encrypt = CryptoJS.AES.encrypt(text, this.key).toString();
    return encrypt;
  }

  decrypt(text) {
    let decrypt = CryptoJS.AES.decrypt(text, this.key).toString(CryptoJS.enc.Utf8);
    return decrypt;
  }

  isEncrypted(text) {
    let result = this.decrypt(text);
    return result == null || result == '' ? false : true;
  }


}
