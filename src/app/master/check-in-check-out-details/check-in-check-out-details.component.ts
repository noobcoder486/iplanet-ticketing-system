import { Component, OnInit } from '@angular/core';
import * as glob from "../../config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-check-in-check-out-details',
  templateUrl: './check-in-check-out-details.component.html',
  styleUrls: ['./check-in-check-out-details.component.css']
})
export class CheckInCheckOutDetailsComponent implements OnInit {


  UserName: any;
  SelectedReason: string = '';
  CurrentStatus: any;
  SpecifiedReason: any;
  ReasonsList: any[] = ["Lunch Break", "Tea Break", "Day End", "Other"];
  IsDisabled :boolean =false;

  constructor(
    private dynamicService: DynamicService, private toastMessage: ToastrService,
    private router: Router,
    private ngxSpinnerService: NgxSpinnerService,

  ) { }

  ngOnInit(): void {
    const userDetail = glob.getLogedInUser().UserDetails
   
    this.UserName = glob.getLogedInUser().UserDetails.UserName
    this.getCurrentStatusForUser()
   
   
  }

  getCurrentStatusForUser() {
    //// this function will see if the user is checked in or checked out for the day
    this.ngxSpinnerService.show()
    let requestData = [];
    
    requestData.push({
      "Key": "APIType",
      "Value": "CurrentStatusDailyUserActivityHeader"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "UserName",
      "Value": this.UserName
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };

    console.log("Before Ledger SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == '0') {
          let data = JSON.parse(response.ExtraData);
          this.CurrentStatus = data.CurrentStatus.CurrentStatus
          this.ngxSpinnerService.hide()

        }
        else {
          this.CurrentStatus = ''
          this.ngxSpinnerService.hide()
          //  this.CurrentStatus = ''   means the user is logging for the first time for the day 

        }

      },
      error: err => {

        console.log(err)
        this.ngxSpinnerService.hide()

      }

    }
    );
  }

  onSubmit() {
    this.ngxSpinnerService.show()
    
    
    if (this.UserName == '' || this.UserName == null || this.UserName == undefined) {
      this.toastMessage.error('UserName Cannot be Empty !');
    }
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveDailyUserActivityHeader"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });

    requestData.push({
      "Key": "UserName",
      "Value": this.UserName
    });
    requestData.push({
      "Key": "CurrentStatus",
      "Value": (this.CurrentStatus == 'CHECKOUT' || this.CurrentStatus == '') ? 'CHECKIN' : 'CHECKOUT'
    });

    if (this.SelectedReason == '' && this.CurrentStatus == 'CHECKIN') {
      this.toastMessage.error("Please Select the Reason Of Check Out");
      return
    }
    if (this.SelectedReason === 'Other' && this.CurrentStatus === 'CHECKIN' && (!this.SpecifiedReason || this.SpecifiedReason.trim().length < 1)) {
      this.toastMessage.error("Enter Reason Cannot be Empty");
      return;
    }

    requestData.push({
      "Key": "Remarks",
      "Value": this.SelectedReason == 'Other' ? this.SpecifiedReason.trim() : this.SelectedReason
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
     if(this.IsDisabled == true)
    {
      return;
    }
    this.IsDisabled=true 


    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toastMessage.success("Saved Successfully");
            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/dashboard']);
            this.ngxSpinnerService.hide()
             this.IsDisabled=false 
          }
          else {
            this.toastMessage.success("Something Went Wrong! Please Try Again !");
            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/dashboard']);
            this.ngxSpinnerService.hide()
             this.IsDisabled=false 

          }

        },
        error: err => {
          this.IsDisabled=false 
          console.log('ERROR', err)
          this.ngxSpinnerService.hide()

        }
      });
  }

}
