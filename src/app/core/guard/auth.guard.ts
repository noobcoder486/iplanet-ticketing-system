import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute
} from '@angular/router';
import { ProfileModuleMetaData } from '../models/profilemodule.metadata';

import { AuthService } from '../service/auth.service';
import { CommonService } from '../service/common.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  permission: ProfileModuleMetaData;

  constructor(
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private messageService: ToastrService,
  ) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.permission = this.commonService.getPermissionByScreenCode(route.data.ModuleId);
    let add = state.url.includes('/add') ? true : false;
    let edit = state.url.includes('/edit') ? true : false;

    if (this.permission == undefined) {
      return true;
    }

    else if (add) {
      return this.permission.Create ? true : this.noPermission();
    }

    else if (edit) {
      return this.permission.Edit ? true : this.noPermission();
    }

    else if (this.authService.currentUserValue && this.permission.View) {
      return true;
    }
    else if (this.authService.currentUserValue && this.permission.View != true) {  
      this.noPermission();
    }
    else {
      this.router.navigate(['/authentication/signin']);
      return false;
    }

  }

  noPermission() {
    this.messageService.error("You don't have permission. Please contact to the system admin!");
    this.router.navigate(['/authentication/nopermission']);
    return false;
  }

}

