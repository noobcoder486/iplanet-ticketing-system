import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Controller } from 'src/app/config/global';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CrmResolverService implements Resolve<any>{

  constructor(
    private apiService: ApiService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.getScreenApi(route.data.ScreenCode);
  }

  getScreenApi(code) {
   return this.apiService.getData(Controller.Dynamic + "GetApiDetail(code="+code+"')");   
  }
}
