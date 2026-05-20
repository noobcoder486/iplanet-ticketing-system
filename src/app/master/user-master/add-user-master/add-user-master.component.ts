import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { User } from './user-master.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';

@Component({
  selector: 'app-add-user-master',
  templateUrl: './add-user-master.component.html',
  styleUrls: ['./add-user-master.component.css']
})
export class AddUserMasterComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) { }
  userForm: FormGroup;
  user: User;
  imagefilelink = '';
  imagefilename = ''
  isEdit: boolean = false;
  imageobject: any;
  isImageUploaded: boolean = true;
  params: any;
  formTitle: string = "Add";
  isGsxFlag: boolean = false
  companyCodeData:string = ''
  errorMessage: String;
  showConfirmPassword:boolean = false
  showPassword: boolean = false;
  companyCode: DropDownValue = DropDownValue.getBlankObject();
  BaseLocationDropDown: DropDownValue = DropDownValue.getBlankObject();

  Countries: DropDownValue = this.getBlankObject();
  MenuGroup: DropDownValue = this.getBlankObject();
  States: DropDownValue = this.getBlankObject();
  orgRole: DropDownValue = this.getBlankObject();
  jobRole: DropDownValue = this.getBlankObject();
  timeZone: DropDownValue = this.getBlankObject();
  language: DropDownValue = this.getBlankObject();


  ngOnInit(): void {
    this.onCountrySearch({ term: "", items: [] });
    this.onMenuGroup({ term: "", items: [] });
    this.onJobRoleSearch({ term: "", items: [] });
    this.onOrgRoleSearch({ term: "", items: [] });
    this.onTimeZoneSearch({ term: "", items: [] });
    this.onLanguageSearch({ term: "", items: [] });
    this.checkLocalPermission()
    this.onBaseLocationSearch({ term: "", items: [] });
    this.user = new User();
    this.userForm = this.formBuilder.group({
      UserName: [null, Validators.required],
      PrimaryEmail: [null, Validators.required],
      FirstName: [null, Validators.required],
      LastName: [null, Validators.required],
      Password: [null],
      ConfirmPassword: [null],
      JobRoleId: [null, Validators.required],
      MobileNo: [null, Validators.required],
      OrgRoleId: [null, Validators.required],
      MenuGroup: [null, Validators.required],
      TimeZoneId: [null],
      DefaultCompany:[{ value: this.user?.OrgRole == null ? null : this.user.DefaultCompany }],
      LanguageCode: [null, Validators.required],
      AddressLine1: [null, Validators.required],
      AddressLine2: [null],
      AddressCity: [null, Validators.required],
      AddressPostalCode: [null, Validators.required],
      AddressStateCode: [{ value: this.user?.AddressCountry == null ? null : this.user.AddressStateCode }, Validators.required],
      AddressCountry: [null, Validators.required],
      GsxUserId: [null],
      GSXTechId: [null],
      Signature: [null, Validators.required],
      GsxIdFlag: [null],
      BaseLocationCode:[null],
      EmployeeCode:[null],

    })
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.userForm.controls["Password"].disable()
      this.userForm.controls["ConfirmPassword"].disable()
      this.isEdit = true
    }
    if(this.isGsxFlag == false)
    {
      
      this.userForm.controls["GsxUserId"].disable()
      this.userForm.controls["GSXTechId"].disable()
    }
    else
    {
      this.userForm.controls["GsxUserId"].enable()
      this.userForm.controls["GSXTechId"].enable()
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  controlValidations() {
    
    // Object.keys(this.userForm.controls).forEach(field => {
    for (let field of Object.keys(this.userForm.controls)){
      
      if (field == "AddressLine2" || field == "TimeZoneId") {

      }
      else if(field == "Password" || field == "ConfirmPassword" && this.isEdit == true)
      {
        
      }
      else if(field == "Password" || field == "ConfirmPassword")
      {
        const password = this.userForm.get(field).value;
        const hasCapital = /[A-Z]/.test(password);
        const hasSmall = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);
        const valid = hasCapital && hasSmall && hasNumber && hasSpecialChar && password.length >= 8;
        if (!valid) {
          this.toastMessage.error("Password must contain at least one capital letter, one small letter, one special character, one number,and have a minimum length of 8 characters")
          return false;
        }
      }
      else {
        if (this.isGsxFlag == false && field =="GsxUserId" ){
          
        }
        else if (this.isGsxFlag == false &&  field == "GSXTechId"){
        }
        else{
          console.log(" this.userForm.get(field).value",  this.userForm.get(field).value)
          let controlValue = this.userForm.get(field).value
          if (controlValue == null || controlValue == undefined) {
            this.userForm.get(field).setErrors({ incorrect: true })
            this.toastMessage.error(field + " Cannot be Empty")
            return false;
          }
        }
      }
    }
    return true;

  }

  async OnFileUploadClick(event: any) {
    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload,  fileToUpload.name) 

        // this.dynamicService.uploadFileToS3Local(fileToUpload, fileToUpload.name).subscribe(
        //   {
        //     next: (value) => {
              let uploadedimage: any;
              uploadedimage = value;
              this.user.UploadedImageLists.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name
              })
              this.isImageUploaded = false;
              for (let item of this.user.UploadedImageLists) {
                this.imageobject = item
                this.imagefilelink = item.src
                this.imagefilename = item.filename
              }
          //   },
          //   error: (err) => {
          //     this.toastMessage.error(err)
          //   },
          // });
      }
      catch (err) {
        this.toastMessage.error(err.message || err);
      }
    }
  }

  removeSelectedFile() {
    this.user.UploadedImageLists = []
    this.imageobject = this.imagefilelink = this.imagefilename = ''
    this.isImageUploaded = true
  }
  isApproverPermission = false
  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }

  SetDefaultPassword() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SetDefaultPassword"
    });
    requestData.push({
      "Key": "tblUserName",
      "Value": this.params.nc
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.UserData;
            console.log("Get Data ", data)
            this.toastMessage.success("Default Password: Apple@123 has been set for this user!")
            this.userForm.patchValue({
              UserName: data.UserName,
              PrimaryEmail: data.PrimaryEmail,
              FirstName: data.FirstName,
              LastName: data.LastName,
              MobileNo: data.MobileNo,
              Status: data.Status,
              TimeZoneId: parseInt(data.TimeZoneId),
              JobRoleId: parseInt(data.JobRoleId),
              OrgRoleId: parseInt(data.OrgRoleId),
              MenuGroup: parseInt(data.MenuGroupId),
              AddressLine1: data.AddressLine1,
              DefaultCompany:data.DefaultCompanyCode,
              AddressLine2: data.AddressLine2,
              AddressPostalCode: data.AddressPostalCode,
              AddressCity: data.AddressCity,
              AddressCountry: data.AddressCountry,
              AddressStateCode: data.AddressStateCode,
              GSXTechId: data.GSXTechId,
              GsxUserId: data.GsxUserId,
              LanguageCode: data.LanguageCode,
              GsxIdFlag: data.GsxIdFlag == '0' ? false : true,
              Signature: data.Signature,
              EmployeeCode: data?.EmployeeCode,
              BaseLocationCode: data?.BaseLocationCode
            })
            this.onCountrySearch({ term: "", items: [] });
            this.onOrgRoleSearch({ term: "", items: [] });
            if( this.userForm.controls["GsxIdFlag"].value == false)
            {
              this.isGsxFlag = false
              this.userForm.controls["GsxUserId"].disable()
              this.userForm.controls["GSXTechId"].disable()
            }
            else
            {
              this.isGsxFlag = true
              this.userForm.controls["GsxUserId"].enable()
              this.userForm.controls["GSXTechId"].enable()
            }
          }
          else {
            console.log("error");
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }

  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetUserObject"
    });
    requestData.push({
      "Key": "UserName",
      "Value": this.params.nc
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.UserData;
            console.log("Get Data ", data)
            this.userForm.patchValue({
              UserName: data.UserName,
              PrimaryEmail: data.PrimaryEmail,
              FirstName: data.FirstName,
              LastName: data.LastName,
              MobileNo: data.MobileNo,
              Status: data.Status,
              TimeZoneId: parseInt(data.TimeZoneId),
              JobRoleId: parseInt(data.JobRoleId),
              OrgRoleId: parseInt(data.OrgRoleId),
              MenuGroup: parseInt(data.MenuGroupId),
              AddressLine1: data.AddressLine1,
              DefaultCompany:data.DefaultCompanyCode,
              AddressLine2: data.AddressLine2,
              AddressPostalCode: data.AddressPostalCode,
              AddressCity: data.AddressCity,
              AddressCountry: data.AddressCountry,
              AddressStateCode: data.AddressStateCode,
              GSXTechId: data.GSXTechId,
              GsxUserId: data.GsxUserId,
              LanguageCode: data.LanguageCode,
              GsxIdFlag: data.GsxIdFlag == '0' ? false : true,
              Signature: data.Signature,
              EmployeeCode: data?.EmployeeCode,
              BaseLocationCode: data?.BaseLocationCode,

            })
            this.onCountrySearch({ term: "", items: [] });
            this.onOrgRoleSearch({ term: "", items: [] });
            if( this.userForm.controls["GsxIdFlag"].value == false)
            {
              this.isGsxFlag = false
              this.userForm.controls["GsxUserId"].disable()
              this.userForm.controls["GSXTechId"].disable()
            }
            else
            {
              this.isGsxFlag = true
              this.userForm.controls["GsxUserId"].enable()
              this.userForm.controls["GSXTechId"].enable()
            }
          }
          else {
            console.log("error");
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }
// add_edit_user
  onSubmit() {
    
    const validated = this.controlValidations()
    if ( !validated ){
      return
    }
    if((this.userForm.controls["Password"].value != this.userForm.controls["ConfirmPassword"].value))
    {
      this.toastMessage.error("Password and Confirm Password does not match")
    }
    else{
       ;
      var strRequestData = 
      {
        "UserName": this.userForm.controls["UserName"].value,
        "FirstName": this.userForm.controls["FirstName"].value,
        "LastName": this.userForm.controls["LastName"].value,
        "PrimaryEmail": this.userForm.controls["PrimaryEmail"].value,
        "Password": this.userForm.controls["Password"].value == undefined?"":this.userForm.controls["Password"].value,
        "Status": "A",
        "MobileNo":this.userForm.controls["MobileNo"].value.toString(),
        "JobRoleId": this.userForm.controls["JobRoleId"].value,
        "OrgRoleId": this.userForm.controls["OrgRoleId"].value, 
        "MenuGroupId":this.userForm.controls["MenuGroup"].value, 
        "TimeZoneId":this.userForm.controls["TimeZoneId"].value,
        "LanguageCode":this.userForm.controls["LanguageCode"].value,
        "AddressLine1":this.userForm.controls["AddressLine1"].value,
        "AddressLine2": this.userForm.controls["AddressLine2"].value == undefined?"":this.userForm.controls["AddressLine2"].value,
        "AddressCity": this.userForm.controls["AddressCity"].value,
        "DefaultCompany":this.userForm.controls["DefaultCompany"].value == undefined || this.userForm.controls["DefaultCompany"].value == null ?this.companyCode.Data[0].Id:this.userForm.controls["DefaultCompany"].value,
        "AddressStateCode":this.userForm.controls["AddressStateCode"].value,
        "AddressCountry":this.userForm.controls["AddressCountry"].value,
        "AddressPostalCode":this.userForm.controls["AddressPostalCode"].value,
        "GsxUserId":this.userForm.controls["GsxUserId"].value == undefined?"":this.userForm.controls["GsxUserId"].value,
        "GSXTechId":this.userForm.controls["GSXTechId"].value == undefined?"":this.userForm.controls["GSXTechId"].value,
        "Signature":this.userForm.controls["Signature"].value == undefined?"":this.userForm.controls["Signature"].value,
        "ImageName":this.imagefilelink,
        "GsxIdFlag":this.isGsxFlag==true ? 1 :0,
        "IsEdit":this.isEdit==true ? 1 :0,
        "EmployeeCode" : this.userForm.controls["EmployeeCode"].value,
        "BaseLocationCode": this.userForm.controls["BaseLocationCode"].value,
      }
      console.log(strRequestData)
      // // TODO
      
      this.dynamicService.registerUser(strRequestData).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.toastMessage.success("Form Submitted Successfully");
              this.returnPrevious()
            }
            else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.handleError(response);
              });
            }
          },
          error: err => {
            if (err.includes('"message":"Cannot')) {
              this.controlValidations()
            }
          }
        });
  }
  }
  

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  gsxFlagdata()
  {
    if(this.isGsxFlag == true)
    {
      this.isGsxFlag = false
      this.userForm.controls["GsxUserId"].disable()
      this.userForm.controls["GSXTechId"].disable()

    }
    else{
      this.isGsxFlag = true
      this.userForm.controls["GsxUserId"].enable()
      this.userForm.controls["GSXTechId"].enable()
    }
  }

  returnPrevious() {
    this.route.navigateByUrl('auth/'+glob.getCompanyCode()+'/user-master')
  }

  onCountrySearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Country, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.Countries = value;
          this.States = this.getBlankObject();
          this.onStatesSearch({ term: "", items: [] });
        }
      },
      error: err => {
        this.Countries = this.getBlankObject();
        this.States = this.getBlankObject();
        this.user.AddressCountry = null;
        this.user.AddressStateCode = null;
      }
    });

  }

  onMenuGroup($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.MenuGroup, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.MenuGroup = value;
        }
      },
      error: err => {
        this.MenuGroup = this.getBlankObject();
      }
    });

  }

  onStatesSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode: this.user?.AddressCountry
    }).subscribe({
      next: (value) => {

        if (value != null) {
          this.States = value;
        }
      },
      error: err => {
        this.States = this.getBlankObject();
      }
    });
  }

  onJobRoleSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.JobRole, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.jobRole = value;
        }
      },
      error: err => {
        this.jobRole = this.getBlankObject();
      }
    });

  }

  onTimeZoneSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TimeZone, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.timeZone = value;
        }
      },
      error: err => {
        this.timeZone = this.getBlankObject();
      }
    });

  }

  onLanguageSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Language, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.language = value;
        }
      },
      error: err => {
        this.language = this.getBlankObject();
      }
    });

  }

 onOrgRoleSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.OrgRole, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.orgRole = value;
          this.onCompany4OrgRoleSearch({ term: "", item: [] });
        }
      },
      error: err => {
        this.orgRole = this.getBlankObject();
        this.user.OrgRole = null;
      }
    });
  } 

  onCompany4OrgRoleSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BindCompany4OrgRole, "", {
      OrgRoleId: this.user.OrgRole
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.companyCode = value;
        }
      },
      error: (err) => {
        this.companyCode = DropDownValue.getBlankObject();
      }
    });
  }

  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
    var validationErrorMessage = errror[0]
    console.log(validationErrorMessage)
    if (validationErrorMessage.includes("Mobile No Already Exists in DB")) {
      this.toastMessage.error("This Mobile Number Already Exists")
    }
    else if (validationErrorMessage.includes("Email Id Already Exists in DB")) {
      this.toastMessage.error("This Email Id Already Exists")
    }
    else if (validationErrorMessage.includes("Mobile No Length SHould Be 10")) {
      this.toastMessage.error("Please enter a 10 digit mobile number")
    }
    else if (validationErrorMessage.includes("GST is a Mandatory Field")) {
      this.toastMessage.error("Please enter a 14 digit valid GST Registration Number")
    }

  }

  onBaseLocationSearch($event: { term: string; items: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.Location4All, $event.term, {
        CompanyCode: glob.getCompanyCode().toString()
      }).subscribe({
        next: (value) => {
          if (value != null) {
            this.BaseLocationDropDown = value;
            console.log('this.BaseLocationDropDown',this.BaseLocationDropDown)
          }
        },
        error: (err) => {
          this.BaseLocationDropDown = this.getBlankObject();
        }
      });
    }
}