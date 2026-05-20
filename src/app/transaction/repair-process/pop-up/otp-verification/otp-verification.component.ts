import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import * as glob from "../../../../config/global";
import { NgxSpinnerService } from 'ngx-spinner';
import xml2js from 'xml2js';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.sass']
})
export class OtpVerificationComponent implements OnInit {

  @Input() Data;
  @Output() CloseOTPVerification = new EventEmitter<any>();


  input1: string
  input2: string
  input3: string
  input4: string
  input5: string
  input6: string
  OTPVerification: String
  errorMessage: any;
  OTPData
  constructor(
    private dynamicService : DynamicService,
    private spinner : NgxSpinnerService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
  }

  submitOPT(){
    this.OTPVerification = this.input1+this.input2+this.input3+this.input4+this.input5+this.input6
    if(this.OTPVerification != null || this.OTPVerification != undefined ){
      if(this.OTPVerification == this.OTPData.OTP.OTP){
        let open = false
        this.CloseOTPVerification.emit(open)
        console.log("Verified")
      }else{
        this.toaster.error("Invalid OTP Please Try Again")
      }
    }else{
      console.log("Enter All Feilds")
    }
    
  }

  GenerateOTP(){      
        let requestData = [];
        requestData.push({
          "Key": "ApiType",
          "Value": "SaveOTP"
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        });
        requestData.push({
          "Key": "EmailId",
          "Value": this.Data.CUSTOMER.EmailID
        });
        requestData.push({
          "Key": "LocationCode",
          "Value": "CBE"
        });
        requestData.push({
          "Key": "MobileNo",
          "Value": this.Data.CUSTOMER.MobileNo
        });
        requestData.push({
          "Key": "TokenDate",
          "Value": this.Data.TokenDate
        });
        requestData.push({
          "Key": "TokenCode",
          "Value": this.Data.TokenNumber
        });
        console.log("data checking:",requestData)
  
        ;
        let strRequestData = JSON.stringify(requestData);
        console.log(strRequestData);
        let contentRequest = {
          "content": strRequestData
        };
        ;
        this.spinner.show();
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (value) => {
              this.spinner.hide();
              console.log("CustomerValue:",value);
  
              let response = JSON.parse(value.toString());
              if (response.ReturnCode == '0') {
                let data = JSON.parse(response?.ExtraData);
                this.OTPData = data
              }
              else {
              
                this.spinner.hide();
                this.errorMessage = response.ReturnMessage;
                const parser = new xml2js.Parser({ strict: false, trim: true });
                parser.parseString(response.ErrorMessage, (err, result) => {
                  response['errorMessageJson'] = result;
                });
              }
  
            },
            error: err => {
              this.spinner.hide();
              console.log(err);
            }
          });
      } 


}
