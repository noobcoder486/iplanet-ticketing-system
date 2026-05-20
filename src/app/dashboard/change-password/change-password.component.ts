import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { emailValidatorService } from 'src/app/common/Services/gsxService/email.validator';
import * as glob from 'src/app/config/global';
import { AuthService } from 'src/app/core/service/auth.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from 'xml2js';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

    changeForm: FormGroup;
    submitted = false;
    showcurrentpassword = false
    showPassword = false;
    showconfirmPassword = false;
    params: any;
    isExpired = false;
    userName: string;
    resetPasswordGUID: string;
    errorMessage: any;
    otp: string;
    currentPassword : string;
    // passwordMode = false
    ExpiryDate: any;
    UserObject: any;
    isLoading = false
    isAdmin = false

    constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private dialog: MatDialog,
      private dynamicService: DynamicService,
      private ngxSpinner: NgxSpinnerService,
      private authService: AuthService,
      private toastMessage: ToastrService,
      // @Inject(MAT_DIALOG_DATA) private data: any,
      // private dialogRef: MatDialogRef<ChangePasswordComponent>,
    ) {}
    ngOnInit() {
      this.UserObject = JSON.parse(sessionStorage.getItem('UserObject'));
      // this.UserObject?.JobRoleId == '1' ? this.isAdmin = true : this.isAdmin = false
      this.isAdmin = false
      this.changeForm = this.formBuilder.group({
        currentPassword : [null,  Validators.required ], 
        newPassword: [
          '',
          [Validators.required
          , this.isAdmin ? Validators.minLength(14) : Validators.minLength(8)
          , Validators.maxLength(20)
          , this.isAdmin ? 
                Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{14,20}$/) : 
                      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,20}$/)
          ]
        ],
        confirmPassword: [ '', Validators.required ]
      },
      { validator: this.passwordMatchValidator }
      );
     
    }

    // GetResetPasswordObject(){
    //   const ResetPasswordGUID = this.params.resetpasswordguid
    //   // return;
    //   this.dynamicService. getResetPasswordObject(ResetPasswordGUID).subscribe(
    //     {
    //       next: (response) => {
    //         console.log("Reset AFTER SP:-", response)
    //         if (response['ReturnCode'] == '0') {
    //           let data = JSON.parse(response['ExtraData'].toString())
    //           if (data == null){
    //             this.toastMessage.error("Access denied");
    //             this.router.navigate(["/authentication/signin"]);
    //           }
    //           console.log("Response ", data.UserName);
    //           this.changeForm.controls['UserName'].patchValue(data.UserName);
    //           this.ExpiryDate = data.ExpiryDate
    //           if ( new Date(this.ExpiryDate) < new Date() ){
    //             this.toastMessage.error("Your OTP has expired, try again!")
    //             this.router.navigate(['/authentication/forgot-password']);
    //           }
    //         }
    //         else if (response['ReturnCode']  == "1") {
    //           let errResponse = response['ErrorMessage']
    //           // console.log("Errro Message",errResponse);
  
    //           if (errResponse) {
    //             const parser = new DOMParser();
    //             const xmlDoc = parser.parseFromString(errResponse, 'text/xml');
    //             const eachErrorMessagesList = xmlDoc.getElementsByTagName('errorMessageRow');
            
    //             for (let i = 0; i < eachErrorMessagesList.length; i++) {
    //               // console.log("Error List ", eachErrorMessagesList[i].getElementsByTagName('ErrorMessage'))
    //               const eachErrorMessages = eachErrorMessagesList[i].getElementsByTagName('ErrorMessage')[0];
    //               this.toastMessage.error(eachErrorMessages.textContent);
    //             }
    //           } else {
    //             this.toastMessage.error('Error response is undefined.');
    //           }
    //         }
            
    //       },
    //       error: err => {
    //         console.log(err);
    //       }
    //     });
    // }


    passwordMatchValidator( group: FormGroup ) {
      const newPassword = group.controls.newPassword.value;
      const confirmPassword = group.controls.confirmPassword.value;
      const currentPassword = group.controls.currentPassword.value;
      // console.log("Password Mismatch:- ", newPassword,"\n", confirmPassword, "\n", newPassword == confirmPassword);
      if (currentPassword === '') {
        return group.controls.currentPassword.setErrors({ required: true });
      }
      else if (confirmPassword === '') {
        return group.controls.confirmPassword.setErrors({ required: true });
      } else {
        return newPassword === confirmPassword ? null : group.controls.confirmPassword.setErrors({ passwordMismatch: true });
      }
    }


    get f() {
      return this.changeForm.controls;
    }

    onSubmit() {
      // ''
      this.submitted = true;
      
      if(this.changeForm.controls['currentPassword'].value == null || this.changeForm.controls['currentPassword'].value == undefined){
        this.toastMessage.error("Enter Your Current Password")
      }
      else if (this.changeForm.invalid) {
        return;
      }
      else {
        this.isLoading = true
        console.log("Before Sp:-", data)
        var data ={
          "CurrentPassword": this.changeForm.controls['currentPassword'].value,
          "NewPassword": this.changeForm.controls['newPassword'].value
        };
        // // TODO 
        // alert('Return On')
        // return
        this.dynamicService.changeUserPassword(data).subscribe({
          next:(value) =>{
            this.isLoading = false
            console.log("Response", value)
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.toastMessage.success("Password change successfully!");
              this.closeDialog()
              this.router.navigate(['/company']);
            }
            else {
              console.log("Errro Response",response);
              this.errorMessage = response.ErrorMessage.toString()


              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString( this.errorMessage , (err, result) => {
                console.log("Error Message: " , result)
                if ( result ){
                  const errorMessages = result.ERRORLIST.ERRORMESSAGEROW
                  errorMessages.forEach((item) => {
                    this.toastMessage.error(item.ERRORMESSAGE[0], "Error", { closeButton: true, disableTimeOut: true });
                  });
                }
                else{
                  this.toastMessage.error(response.ReturnMessage, "Error", { closeButton: true, disableTimeOut: true });
                }
              });  

            }
          },
          error: err => {
            this.isLoading = false
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex != -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
              } else {
                this.toastMessage.error("Error parsing the error message.");
              }
            });
          }
        });
      }
    
    }


    closeDialog() {
      this.dialog.closeAll();
      // this.dialogRef.close('Yes');
    }
  }
  
