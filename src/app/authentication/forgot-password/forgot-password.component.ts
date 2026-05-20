import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { emailValidatorService } from 'src/app/common/Services/gsxService/email.validator';
import * as glob from 'src/app/config/global';
import { v4 as uuidv4 } from 'uuid';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  Spinner: boolean = false;
  submitClicked: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dynamicService: DynamicService,
    private ngxSpinner: NgxSpinnerService,
    private emailValidator: emailValidatorService,
    private toastMessage: ToastrService
  ) {}
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      PrimaryEmail: [
        '',
        [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/), Validators.minLength(5)]
      ]
    });
  }
  get f() {
    return this.loginForm.controls;
  }
  onSubmit() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      // this.router.navigate(['/dashboard/main']);
      //  
      const shouldContinue = confirm("Are you sure, you want to continue?")
      if (shouldContinue == false) 
      {
        return
      }
      else {
        // this.checkEmailID() 
        this.onSaveResetPassword()
      }
    }
  }

  
  onSaveResetPassword(){
    // SP Name in the DB:- WSP_Save_ResetPassword
    const PrimaryEmail = this.loginForm.controls["PrimaryEmail"].value
      // return;
      var data ={
        "ResetPasswordGUID": uuidv4(),
        "PrimaryEmail": PrimaryEmail,
      }
      if(this.submitClicked == true)
      {
        return;
      }
      this.submitClicked=true 
      this.Spinner = true
      this.dynamicService.sendResetPasswordRequest(data).subscribe(
        {
          next: (value) => {
            this.submitClicked= false
            this.Spinner = false
            console.log("Response ", value);
            let response = JSON.parse(value.toString());
            if (response['ReturnCode'] == '0') {
              this.toastMessage.success("Submitted Successfully! check your Email")
              this.router.navigate(['/authentication/signin']);
            }
            else if (response['ReturnCode']  == "1") {
              let errResponse = response['ErrorMessage']
              // console.log("Errro Message",errResponse);
  
              if (errResponse) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(errResponse, 'text/xml');
                const eachErrorMessagesList = xmlDoc.getElementsByTagName('errorMessageRow');
            
                for (let i = 0; i < eachErrorMessagesList.length; i++) {
                  // console.log("Error List ", eachErrorMessagesList[i].getElementsByTagName('ErrorMessage'))
                  const eachErrorMessages = eachErrorMessagesList[i].getElementsByTagName('ErrorMessage')[0];
                  this.toastMessage.error(eachErrorMessages.textContent);
                }
              } 
              else {
                  let errResponse = response['ErrorMessage']
                  console.log("Errro Message",errResponse);
                  if (errResponse) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(errResponse, 'text/xml');
                    const errorMessagesList = xmlDoc.getElementsByTagName('errorMessage');
                  
                    for (let i = 0; i < errorMessagesList.length; i++) {
                      const errorMessageNode = errorMessagesList[i];
                      const errorMessageText = errorMessageNode.querySelector('ErrorMessage').textContent;
                      this.toastMessage.error(`Error: ${errorMessageText}`)
                    }
                  }  
              }
            }
            
          },
          error: err => {
            this.submitClicked= false
            this.ngxSpinner.hide()
            this.Spinner = false
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toastMessage.error("Error:-  " + message);
              } else {
                this.toastMessage.error("Error parsing the error message.");
              }
            });          
          }
        });
  }



}
