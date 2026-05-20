import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/service/auth.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { CommonMessage, GLOBALVARIABLE } from 'src/app/config/global';
import { forkJoin } from 'rxjs';
import { AppInitService } from 'src/app/core/service/app.init.service';
import { EncryptDecryptService } from 'src/app/core/service/encrypt-decrypt.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  error = '';
  images = [];
  hide = true;
  showPassword: boolean = false;
  UserObject: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private appInitService: AppInitService,
    private encryptDecryptService: EncryptDecryptService,
    private messageService: ToastrService,
    private dynamicService: DynamicService
  ) {
    super();
    //sessionStorage.clear();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/), Validators.minLength(5)]
      ],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';
    if (this.dynamicService.validateAllFormFields(this.loginForm)){
        
      if (this.loginForm.invalid) {
        this.error = 'Username and Password not valid !';
        return;
      } else {
        this.submitted = true;
        //let password = this.encryptDecryptService.encrypt(this.f.password.value);
        this.subs.sink = this.authService.login(this.f.email.value, this.f.password.value)
          .subscribe((data: any) => {
            
           this.UserObject = data.UserDetails

            if (data.isValid == true) {
              sessionStorage.setItem(GLOBALVARIABLE.USERNAME, this.f.email.value);
              sessionStorage.setItem(GLOBALVARIABLE.TOKEN, data.token);
              sessionStorage.setItem(GLOBALVARIABLE.REFRESHTOKEN, data.refreshToken);
              this.getRequiredData();

            }
            else {
              
              this.submitted = false;
              if ( data?.UserDetails?.AuthenticationResponse){
                this.error = data?.UserDetails?.AuthenticationResponse
              }
              else{
                this.error = "User Name or Password is not correct!"
              }
            }
          },
            (error) => {
              this.error = error;
              this.submitted = false;
            }
          );
      }
    }
  }

  getRequiredData = () => {
    let userName = sessionStorage.getItem(GLOBALVARIABLE.USERNAME);
    forkJoin({
      MenuDetail: this.authService.getMenu(userName),
      //ProfileDetail: this.authService.getProfileModuleList(),
      FieldDetails: this.authService.getFieldDetail(),
      GridDetails: this.authService.getGridDetail(),
      AllRouting: this.authService.getAllRouting(),
      Actions: this.authService.getModulections(),
      UserPermission: this.authService.getUserPermission(userName)
    }).subscribe((data: any) => {
      console.log("Menu Data");
      console.log(data.MenuDetail);
      data.MenuDetail[0].push({
        HeadingId: 1,
        HeadingLogo: "fas fa-tachometer-alt",
        HeadingName: "Repair Process\r\n",
        MenuGroupId: 1,
        MenuLevelId: 0,
        ModuleId: 1,
        ModuleLogo: "",
        ModuleName: "Repair Process",
        SubHeadingId: 0,
        SubHeadingLogo: "",
        SubHeadingName: "",
        Url: "/repair-process",
      });
      sessionStorage.setItem('MenuDetail', JSON.stringify(data.MenuDetail));
      //sessionStorage.setItem('ModuleEntityField', JSON.stringify(data.ProfileDetail));
      sessionStorage.setItem('FieldDetail', JSON.stringify(data.FieldDetails));
      sessionStorage.setItem('GridModuleDetail', JSON.stringify(data.GridDetails));
      sessionStorage.setItem('AllRouting', JSON.stringify(data.AllRouting));
      sessionStorage.setItem('ModuleAction', JSON.stringify(data.Actions));
      sessionStorage.setItem('UserPermission', JSON.stringify(data.UserPermission));
      sessionStorage.setItem('UserObject', JSON.stringify(this.UserObject));

      sessionStorage.removeItem('selectedMenu');

      this.appInitService.init();
      this.router.navigate(['/company']);
    },
      error => {
        this.messageService.error(CommonMessage.ErrorMessge);
        this.submitted = false;
      });
  }


}
