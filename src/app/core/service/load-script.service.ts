import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2 } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LoadScriptService {

  constructor(
   private apiService: ApiService
  ) { }

  public loadJsScript(url: any) {    
   return this.apiService.getJson(url); 
  }
}
