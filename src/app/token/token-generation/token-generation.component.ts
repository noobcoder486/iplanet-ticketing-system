import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, MinLengthValidator, Validators} from "@angular/forms";
import xml2js from "xml2js";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { Filter } from "src/app/custom-components/call-login-dashboard/filter.meta";
import { Observable, BehaviorSubject } from "rxjs";
import * as glob from "src/app/config/global";
import { ToastrService } from 'ngx-toastr';
import { DropDownValue,DropdownDataService } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: "app-token-generation",
  templateUrl: "./token-generation.component.html",
  styleUrls: ["./token-generation.component.css"],
})



export class TokenGenerationComponent implements OnInit {
  visitPurposeDropDown: DropDownValue = DropDownValue.getBlankObject();
  userSearchMobileNumber: any;
  token: String;
  firstName: String;
  name: any;
  lastName: String;
  email: String;
  mobileNo: String;
  VisitPurpose: any;
  isSearched: boolean = true;
  buttonDisabled: boolean = false;
  isCustomerDetail: boolean = false;
  isPageChanges: boolean = false;
  isDisplayTokenHidden: boolean = true;
  filterList: Filter[] = [];
  locationCode: any;
  tokenForm: FormGroup;
  typeSelected = 'ball-clip-rotate';

  @Input() filters: Observable<Filter[]>;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  loaderService: any;
  errorMessage: any;
  tokenData: any;

   LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationCode : any

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private route: Router,
    private ngxSpinnerService: NgxSpinnerService
  ) {}

  ngOnInit() {
     this.onLocationSearch({ term: "", item: [] });

    this.tokenForm = this.formBuilder.group({
      MobileNo: [this.userSearchMobileNumber,[Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      Email: ["", [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/) ]],
      FirstName: ["", Validators.required],
      LastName: ["", Validators.required],
      visitPurpose: ["" , Validators.required],
    });
    this.onVisitPurpose({ term: "", items: [] });
  }

  mobNumberPattern = "^((\\+91-?)|0)?[0-9]{10}$"; 
  search() {
    this.GetCustomerList(this.userSearchMobileNumber);
  }

  isSearchButton: boolean = false;

  searchButtonShow($event){
    let mobLength = String($event)
    if(mobLength.length == 10 ){
      this.isSearchButton = true
      this.toaster.success("Success")
    }else{
      this.isSearchButton = false 
    }
    
  }


  GetCustomerList(mobileNo) {
    let requestData = [];
      requestData.push({
        Key: "APIType",
        Value: "GetCustomerList4Job",
      });
      requestData.push({
        Key: "CompanyCode",
        Value: glob.getCompanyCode(),
      });
      requestData.push({
        Key: "MobileNo",
        Value: mobileNo,
      });
      requestData.push({
        Key: "PageNo",
        Value: "1",
      });
      requestData.push({
        Key: "PageSize",
        Value: "10",
      });
      for (let filter of this.filterList ?? []) {
        requestData.push({
          Key: filter.type,
          Value: filter.value,
        });
      }
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        content: strRequestData,
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == "0") {
            
            let data = JSON.parse(response?.ExtraData);
            if(data.Totalrecords == 1){
              //this.toaster.success("Customer Data Found")
              this.tokenData = data.CustomerList.Customer
              this.isCustomerDetail = true;
              this.isSearched = false;
              this.firstName = this.tokenData.FirstName
              this.lastName = this.tokenData.LastName
              this.email = this.tokenData.EmailID
              this.mobileNo = this.tokenData.MobileNo
              this.tokenForm.patchValue({
                FirstName : this.firstName,
                LastName : this.lastName,
                Email : this.email,
                MobileNo : this.mobileNo                
              })
            }
            else{
              //this.toaster.info("Kindly fill all the fields for creating Token")
              this.tokenForm.reset()
              this.tokenForm.patchValue({
                MobileNo : this.userSearchMobileNumber                
              })
              this.isCustomerDetail = false;
              this.isSearched = false;
            }
          } else {
            
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response["errorMessageJson"] = result;
              this.isPageChanges == true;
            });
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  
  returnPrevious() {
    this.route.navigate(['auth/'+glob.getCompanyCode()+'/token']);
  }

  createToken() {
 
     
    if(this.LocationCode == null ||  this.LocationCode ==undefined || this.LocationCode == ''){
       this.toaster.error("Location Cannot be Empty","Select Location");
       return
    } 

    for (const field of Object.keys(this.tokenForm.controls)) {
      const controlValue = this.tokenForm.get(field).value;
      if (controlValue == null || controlValue == undefined || controlValue == '') {
        this.toaster.error(field + " Cannot be Empty");
        return; 
      }
    }

    const pattern = /^[^\\+\\=@\\-]/;
    const htmlpattern = /<(\"[^\"]\"|'[^']'|[^'\">])*>/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobilePattern = /^\d{10}$/;
    const tokenform = this.tokenForm.value;
  
    if (!tokenform.FirstName || !pattern.test(tokenform.FirstName.trim())) {
      this.toaster.error('Invalid FirstName');
      return;
    }
  
    if (!tokenform.LastName || !pattern.test(tokenform.LastName.trim())) {
      this.toaster.error('Invalid LastName');
      return;
    }
    if (!tokenform.MobileNo || typeof tokenform.MobileNo !== 'string' || !mobilePattern.test(tokenform.MobileNo.trim()) || tokenform.MobileNo.trim().length !== 10){
      this.toaster.error('Invalid MobileNo');
      return;
  }
  
  
    if (!tokenform.Email || !emailPattern.test(tokenform.Email.trim())) {
      this.toaster.error('Invalid Email');
      return;
    }

    if (this.tokenForm.valid) {

      this.ngxSpinnerService.show()
      let requestData = [];
      requestData.push({
        Key: "APIType",
        Value: "SaveToken",
      });
      requestData.push({
        Key: "CompanyCode",
        Value: glob.getCompanyCode(),
      });
      requestData.push({
        Key: "FirstName",
        Value: this.tokenForm.controls["FirstName"].value,
      });
      requestData.push({
        Key: "LastName",
        Value: this.tokenForm.controls["LastName"].value,
      });
      requestData.push({
        Key: "EmailId",
        Value: this.tokenForm.controls["Email"].value,
      });
      requestData.push({
        Key: "MobileNo",
        Value: this.tokenForm.controls["MobileNo"].value,
      });
      requestData.push({
        Key: "VisitPurpose",
        Value: this.tokenForm.controls["visitPurpose"].value,
      });
      requestData.push({
        Key: "LocationCode",
        Value: this.LocationCode,
      });
      

      let strRequestData = JSON.stringify(requestData);

      let contentRequest = {
        content: strRequestData,
      };
      // alert("Return On ")

      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (Value) => {
          this.ngxSpinnerService.hide()

          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == "0") {
            
            this.isDisplayTokenHidden = false;
            let data = JSON.parse(response?.ExtraData);
            this.token = data.Token.TokenCode;
            this.locationCode = data.Token.LocationCode;
            this.saveCasaTokenLead(data.Token)
            setTimeout(() => {
              this.returnPrevious();
            }, 10000);
          } else {
            
            this.errorMessage = response.ReturnMessage;
            this.toaster.error("Error: ", this.errorMessage )
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response["errorMessageJson"] = result;
              this.toaster.error("Error: ",response["errorMessageJson"] )
            });
          }
        },
        error: (err) => {
          this.ngxSpinnerService.hide()
          console.log(err);
        },
      });
    } 
  }
  
  saveCasaTokenLead(data) {
    
    try{
      let obj = {
        TokenCode: data.TokenCode,
        CaseGUID: "00000000-0000-0000-0000-000000000000",
        TransactionGUID: uuidv4(),
        TokenDate: data.TokenDate,
        CompanyCode: data.CompanyCode,
        LocationCode: data.LocationCode,
        FirstName: data.FirstName,
        LastName: data.LastName,
        EmailId: data.EmailId,
        MobileNo: data.MobileNo,
        VisitPurpose: data.VisitPurpose,
        TokenStatus: data.TokenStatus,
        Counter: data.Counter,
        CreatedDate: data.CreatedDate,
        LastupdatedDate: data.LastupdatedDate
      };
      console.log("obj", obj);
      this.dynamicService.saveCasaTokenLead(obj).subscribe(
        {
          next: (value) => {
            
            let response = JSON.parse(value.toString());
            ;
            if (response.code == '0') {
              //this.toaster.info("" , "Posted to Casa successfully!", { closeButton: true, disableTimeOut: true });
            }
            else {
              
              this.errorMessage = response;
              //this.toaster.error(this.errorMessage.message, "Error While Posting to Casa:-", { closeButton: true, disableTimeOut: true });
            }
          },
          error: err => {
            
            this.ngxSpinnerService.hide()
            //this.toaster.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
            console.log(err);
          }
        });
    }
    catch (err){
      //this.toaster.error( err , "Error:-", { closeButton: true, disableTimeOut: true });
    }
  }

  onVisitPurpose($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.VisitPurpose, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.visitPurposeDropDown = value;
          }
        },
        error: (err) => {
          this.visitPurposeDropDown = this.getBlankObject();
        },
      });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  
  onKeyPress(event: KeyboardEvent) {
    
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const InputFieldName = input.getAttribute('formControlName');
  
    if (InputFieldName === 'FirstName' || InputFieldName === 'LastName') {
      // Allow control keys
      if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        return;
      }
  
      // Allow only alphanumeric characters and space
      if (!/^[a-zA-Z0-9 ]$/.test(key)) {
        event.preventDefault();
      }
    }
  }

  //location dropdown 
   onLocationSearch($event: { term: string; item: any[] }) {
        this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
          CompanyCode: glob.getCompanyCode().toString(),
        }).subscribe({
          next: (value) => {
            if (value != null) {
              this.LocationForJob = value;
              this.LocationCode=this.LocationForJob.Data[0].Id
              
            }
          },
          error: (err) => {
            this.LocationForJob = DropDownValue.getBlankObject();
          }
        });
      }
  

}
