import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { emailValidatorService } from 'src/app/common/Services/gsxService/email.validator';
import * as glob from 'src/app/config/global';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from 'xml2js';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {


    resetForm: FormGroup;
    submitted = false;
    showPassword = false;
    showconfirmPassword = false;
    params: any;
    isExpired = false;
    userName: string;
    resetPasswordGUID: string;
    errorMessage = '';
    otp: string;
    EnteredOTP : string;
    // passwordMode = false
    ExpiryDate: any;
    Spinner: boolean = false;
    submitClicked: boolean = false;

    constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private dynamicService: DynamicService,
      private ngxSpinner: NgxSpinnerService,
      private emailValidator: emailValidatorService,
      private toastMessage: ToastrService,
    ) {}
    ngOnInit() {
      //  
      this.params = this.activatedRoute.snapshot.queryParams;
      if (this.params.resetpasswordguid != null || this.params.resetpasswordguid != undefined ) {
        console.log("Token is:- ", this.params.resetpasswordguid);
        this.GetResetPasswordObject();
        // return
      }
      else{
        this.toastMessage.error("Access denied")
        // this.router.navigate(['/authentication/signin']);
      }

      this.resetForm = this.formBuilder.group({
        UserName : [null, Validators.required],
        EnteredOTP : [null,  [Validators.required, Validators.minLength(6), Validators.maxLength(6),  Validators.pattern(/^[0-9]{6}$/)] ], // Only allows 6-digit numbers
        newPassword: [
          '',
          [Validators.required
          , Validators.minLength(8)
          , Validators.maxLength(20)
          , Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,20}$/)
          ]
        ],
        confirmPassword: [ '', Validators.required ]
      },
      { validator: this.passwordMatchValidator }
      );
    }

    GetResetPasswordObject(){
      const ResetPasswordGUID = this.params.resetpasswordguid
      // return;
      this.dynamicService.getResetPasswordObject(ResetPasswordGUID).subscribe(
        {
          next: (response) => {
            console.log("Reset AFTER SP:-", response)
            if (response['ReturnCode'] == '0') {
              let data = JSON.parse(response['ExtraData'].toString())
              if (data == null){
                this.toastMessage.error("Access denied");
                this.router.navigate(["/authentication/signin"]);
              }
              console.log("Response ", data.UserName);
              this.resetForm.controls['UserName'].patchValue(data.UserName);
              this.ExpiryDate = data.ExpiryDate
              if ( new Date(this.ExpiryDate) < new Date() ||  data.IsExpired == 1 ){
                this.toastMessage.error("Your OTP has expired, try again!")
                this.router.navigate(['/authentication/forgot-password']);
              }
        
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
              } else {
                this.toastMessage.error('Error response is undefined.');
              }
            }
            
          },
          error: err => {
            console.log(err);
          }
        });
    }


    onlyNumbersValidator(control: FormControl) {
      const value = control.value;
      if (value && !/^\d+$/.test(value)) {
        return { onlyNumbers: true };
      }
      return null;
    }
    passwordMatchValidator( group: FormGroup ) {
      const newPassword = group.controls.newPassword.value;
      const confirmPassword = group.controls.confirmPassword.value;
      const EnteredOTP = group.controls.EnteredOTP.value;

      console.log(" OTP ",  group.controls.EnteredOTP.value)
      // console.log("Password Mismatch:- ", newPassword,"\n", confirmPassword, "\n", newPassword == confirmPassword);
      if (EnteredOTP === '') {
        return group.controls.EnteredOTP.setErrors({ required: true });
      }
      else if (confirmPassword === '') {
        return group.controls.confirmPassword.setErrors({ required: true });
      } else {
        return newPassword === confirmPassword ? null : group.controls.confirmPassword.setErrors({ passwordMismatch: true });
      }
    }


    get f() {
      return this.resetForm.controls;
    }
  
    onInput(event: any) {
      const enteredValue = event.target.value;
      this.resetForm.controls['EnteredOTP'].setValue(enteredValue); // Update the form control value
    
      // Perform your custom validation logic here
      if (!/^[0-9]{6}$/.test(enteredValue)) {
        this.resetForm.controls['EnteredOTP'].setErrors({ pattern: true });
      } else {
        this.resetForm.controls['EnteredOTP'].setErrors(null);
      }
    }

  // Key Press Validations
  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }


    onSubmit() {
      //  
      this.submitted = true;

      if(this.resetForm.controls['EnteredOTP'].value == null || this.resetForm.controls['EnteredOTP'].value == undefined){
        this.toastMessage.error("Enter OTP")
      }
      else if ( this.resetForm.value.EnteredOTP.length !== 6 || !/^\d{6}$/.test( this.resetForm.value.EnteredOTP)) {
        this.toastMessage.error("OTP must be a 6 Digits")
      }
      else
      {
        // this.passwordMode = true;
        // stop here if form is invalid
        
        if (this.resetForm.invalid) {
          return;
        }
        else {
          const shouldContinue = confirm("Are you sure, you want to continue?")
          if (shouldContinue == false) 
          {
            return
          }

          if(this.submitClicked == true)
          {
            return;
          }
          this.submitClicked=true 

         var objData = {
              "ResetPasswordGUID": this.params.resetpasswordguid,  
              // TODO for Security reason testing if the UserName is changed midway
              "UserName": this.resetForm.value.UserName,
              "Password":  this.resetForm.controls['newPassword'].value,
              "OTP": this.resetForm.controls['EnteredOTP'].value,
          }
          var strRequestData = JSON.stringify(objData)
          var data = {
            "Content": strRequestData
          }
          console.log("Before Sp:-", data)
          // return
          this.Spinner = true
          this.dynamicService.SaveUserPassword(objData).subscribe({
            next:(value) =>{
              this.submitClicked= false
              this.Spinner = false
              console.log("Response", value)
              let response = JSON.parse(value.toString());
              if (response.ReturnCode == '0') {
                console.log("Data ", response['ExtraData'])
                this.toastMessage.success("Password reset successfully! Login again...");
                this.router.navigate(['/authentication/signin']);
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
            },
            error: (err) =>{
              this.submitClicked= false
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
    }

    // controlValidations() {
    //   Object.keys(this.resetForm.controls).forEach(field => {
    //     if (field == "AddressLine2" || field == "TimeZoneId") {
  
    //     }
    //     else if(field == "newPassword" || field == "confirmPassword")
    //     {
    //       const password = this.resetForm.get(field).value;
    //       const hasCapital = /[A-Z]/.test(password);
    //       const hasSmall = /[a-z]/.test(password);
    //       const hasNumber = /\d/.test(password);
    //       const hasSpecialChar = /[!@#$%^&*]/.test(password);
    //       const valid = hasCapital && hasSmall && hasNumber && hasSpecialChar && password.length >= 8;
    //       if (!valid) {
    //         this.toastMessage.error("Password must contain at least one capital letter, one small letter, one special character, one number,and have a minimum length of 8 characters")
    //         return;
    //       }
    //     }
    //     else {
    //       let controlValue = this.resetForm.get(field).value
    //       if (controlValue == null || controlValue == undefined) {
    //         this.resetForm.get(field).setErrors({ incorrect: true })
    //         this.toastMessage.error(field + " Cannot be Empty")
    //       }
    //     }
    //   })
    // }
  
    
    // checkEmailID() {
    //   // Get UserName from Local Storage
    //   let userName = sessionStorage.getItem(glob.GLOBALVARIABLE.USERNAME);
    //   console.log("Get UserName:- ", userName)
  
    //   // Call an API to get the user email Id:- using Guest Controller
    //   this.dynamicService.getDynamicDetaildata(userName).subscribe({
    //     next: (value) =>{
    //       console.log("After UserObject SP:-", value);
    //       let response = JSON.parse(value.toString());
  
    //       if(response.ReturnCode == '0'){
    //         console.log("Extradata is :-",response.ExtraData)
    //         this.router.navigate(['/company']);
    //       }
  
    //     },
    //     error: (err) => {
    //       console.log("Error:- ", err);
    //     }
    //   })
    // }

    // togglePasswordVisibility(){
    //   console.log("Password:- ", this.showPassword)
    //   this.showPassword != this.showPassword;
    // }
  
  
  }
  