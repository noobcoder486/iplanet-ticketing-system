import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router';
import { AppInitService } from 'src/app/core/service/app.init.service';
import { CommonService } from 'src/app/core/service/common.service';
import { CompanyDetailComponent } from '../company-detail/company-detail.component';
import * as glob from "../../config/global";
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  UserObject: any;
  constructor(
    public dialog: MatDialog,
    private toaster: ToastrService,
    private router: Router,
    private appInitService: AppInitService,
    public commonService: CommonService,
  ) { }

  ngOnInit() {
    this.UserObject = JSON.parse(sessionStorage.getItem('UserObject'));
    this.openDialog();
  }

  // openDialog(): void {
  //   if (this.commonService.checkCompanyPermission()) {
  //     let dialogRef = this.dialog.open(CompanyDetailComponent, {
  //       width: '80%',
  //       disableClose: true,
  //       data: {
  //         allowtoclose: false
  //       }
  //     });

  //     dialogRef.afterClosed().subscribe(result => {
  //       if (result != null && result != undefined) {
  //         let companyCode = result.trim();
  //         glob.setCompanyCode(companyCode);
  //         this.appInitService.initNotFound(companyCode);
  //          ;
  //         if(glob.getLogedInUser().UserDetails.MenuGroupId==2)
  //         {
  //           this.router.navigate(['auth/' + companyCode + "/token-create"]);
  //         }
  //         else if(glob.getLogedInUser().UserDetails.MenuGroupId==5)
  //         {
  //           this.router.navigate(['auth/' + companyCode + "/token-display"]);
  //         }
  //         else
  //         {


  //         this.router.navigate(['auth/' + companyCode + "/dashboard"]);
  //         }
  //       }
  //     });
  //   }
  //   else {
  //     this.router.navigate(['authentication/nopermission']);
  //   }
  // }

  openDialog(): void {
    if (this.commonService.checkCompanyPermission()) {
      if (this.UserObject?.ChangePasswordRequire == '1') {
        this.toaster.warning(this.UserObject?.ReasonForChangePassword, "Login Error", { closeButton: true, disableTimeOut: true });
        this.routeToChangePassword()
      }
      else {
        this.routeToCompany()
      }

    }
    else {
      this.router.navigate(['authentication/nopermission']);
    }
  }

  routeToChangePassword() {
    let dialogRefChangePassword = this.dialog.open(ChangePasswordComponent, {
      width: '30%',
      height: '70%',
      disableClose: true,
      data: {
        allowtoclose: false
      }
    });

    dialogRefChangePassword.afterClosed().subscribe(result => {
      this.routeToCompany()
    });
  }

  routeToCompany() {
    let dialogRef = this.dialog.open(CompanyDetailComponent, {
      width: '80%',
      disableClose: true,
      data: {
        allowtoclose: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined) {
        let companyCode = result.trim();
        glob.setCompanyCode(companyCode);
        this.appInitService.initNotFound(companyCode);
        if (glob.getLogedInUser().UserDetails.UserName == "ticket@iplanet.one") {
          this.router.navigate(['auth/' + companyCode + "/ticketing-dashboard"]);
        }
        else if (glob.getLogedInUser().UserDetails.MenuGroupId == 2) {
          this.router.navigate(['auth/' + companyCode + "/token-create"]);
        }
        else if (glob.getLogedInUser().UserDetails.MenuGroupId == 5) {
          this.router.navigate(['auth/' + companyCode + "/token-display"]);
        }
        else {
          this.router.navigate(['auth/' + companyCode + "/dashboard"]);
        }
      }
    });
  }

}
