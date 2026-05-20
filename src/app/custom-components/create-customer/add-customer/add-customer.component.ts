import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownType } from '../../call-login/metadata/request.metadata';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit,Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Customer } from './CUSTOMER.metadata';
import * as glob from 'src/app/config/global';
import { NgxSpinnerService } from 'ngx-spinner';
import { emailValidatorService } from 'src/app/common/Services/gsxService/email.validator';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';
@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.sass']
})
export class AddCustomerComponent implements OnInit {

  date: any;
  @Input() callbackfunction;

  customerForm: FormGroup;
  customer: Customer;
  errorMessage: String;
  PopUp_Event: boolean = false;
  RetailData:any=[];
  UploadedImageList:any = []
  RetailsCustomerData:any=[];
  Countries: DropDownValue = this.getBlankObject();
  States: DropDownValue = this.getBlankObject();
  CustAccountGroup: DropDownValue = this.getBlankObject();
  GSTRegistration: DropDownValue = this.getBlankObject();
  @Output() AddCustomerData = new EventEmitter<any>();
  @Output() closeAddCustomer = new EventEmitter<any>();
  @Output("search") search: EventEmitter<any> = new EventEmitter();
  ReferredByDD:DropDownValue = this.getBlankObject();
  submitClicked= false 
  @Input() TokenAllDetails
  @Input() ReservationDetails
  InsuranceTypeDD: DropDownValue = this.getBlankObject();
     InsuranceApplicableList:any[]=[
    {Id : '1' ,TEXT : 'YES' },{Id : '0' ,TEXT : 'NO'}]
  
  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private spinner: NgxSpinnerService,
    private emailValidator: emailValidatorService,
    private toastr: ToastrService,
  ) { }


  SpninnerChecker() { this.spinner.show(); }  
   gstConditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }
     ;
    if (formControl.parent.get('DoGST').value) {
      return Validators.required(formControl); 
    }
    return null;
  }

  private gstnoValidatorRequired = [
    Validators.maxLength(15),
    Validators.minLength(14),
    Validators.required
];


private gstnoValidatornotRequired = [
  Validators.maxLength(15),
  Validators.minLength(0)

];

  ngOnInit(): void {
    this.customer = new Customer();
    this.customerForm = this.formBuilder.group({
      FirstName: [null, Validators.required],
      LastName: [null, Validators.required],
      Address1: [null, Validators.required],
      Address2: [null, Validators.required],
      PhoneNo: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[0-9]*$"),]],
      AlternateNo: [null],
      EmailId: [null, [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)]],
      Country: [null, Validators.required],
      State: [{ value: this.customer?.Country == null ? null : this.customer.State }, Validators.required],
      City: [null, Validators.required],
      Pincode: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern("^[0-9]*$"),]],
      DoGST: [false],
      gstNo: [null,[ Validators.minLength(0), Validators.maxLength(15)]],
      CustAccGroup: [null,Validators.required],
      GSTRegistrationType: ["GSTU"],
      ReferredBy:[null],
      IsInsuranceApplicable:[null,Validators.required],
      InsuranceType:[null],

    });

     this.customerForm.get('CustAccGroup')?.setValue('RETAIL');
      this.customerForm.get('CustAccGroup')?.disable();

      
    this.onCountrySearch({ term: "", items: [] });
    this.onCustAccountGroupSearch({ term: "", items: [] });
    this.onGSTRegistrationSearch({ term: "", items: [] });
    this.onReferredBy({ term: "", items: [] });
    this.onInsuranceType({ term: "", items: [] });
    

    this.customerForm.patchValue({
      FirstName: this.TokenAllDetails.FirstName,
      LastName: this.TokenAllDetails.LastName,
      PhoneNo: this.TokenAllDetails.MobileNo,
      EmailId:this.TokenAllDetails.EmailId,
    })
    console.log("Reservation ", this.ReservationDetails)
    if ( this.ReservationDetails ){
      this.customerForm.patchValue({
        FirstName: this.ReservationDetails.CustomerFirstName,
        LastName: this.ReservationDetails.CustomerLastName,
        Address1: this.ReservationDetails.CustomerAddressLine1,
        Address2: this.ReservationDetails.CustomerAddressLine2,
        PhoneNo: this.ReservationDetails.CustomerMobileNo,
        AlternateNo: null, 
        EmailId: this.ReservationDetails.CustomerEmailId,
        Country: this.ReservationDetails.CustomerCountry,
        // State: data.Reservation.CustomerState,
        City: this.ReservationDetails.CustomerCity,
        Pincode: this.ReservationDetails.CustomerPincode,
      })   
    }

  }



  TokenDataSet(){
    console.log("Data" , this.TokenAllDetails)
  }

  // onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
  //   const input = event.target as HTMLInputElement;
  //   const charCode = event.which || event.keyCode;
  //   const charStr = String.fromCharCode(charCode);

  //   // When Keypresses should only be integers
  //   if (validationType === 'int') {
  //     if (!/^[0-9]*$/.test(charStr)) {
  //       event.preventDefault();
  //     }
  //   } else if (validationType === 'alpha') {
  //     if (!/^[a-zA-Z]*$/.test(charStr)) {
  //       event.preventDefault();
  //     }
  //   }

  //   // Max Value of the Key Presses, charCode 8 is for backspaces I guess
  //   if (input.value.length >= maxLength && charCode !== 8) {
  //     event.preventDefault();
  //   }
  // }

     onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
  const input = event.target as HTMLInputElement;
  const key = event.key;
  const inputFieldName = input.getAttribute('formControlName');

  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight','Comma'];

  if (allowedKeys.includes(key)) {
    return;
  }

  if (['FirstName', 'LastName'].includes(inputFieldName || '')) {
    if (!/^[a-zA-Z0-9 ]$/.test(key)) {
      event.preventDefault();
      this.toastr.error('Special Characters Not Allowed!');
      return;
    }
  }
  
  if (['Address1', 'Address2', 'Address3'].includes(inputFieldName || '')) {
  if (!/^[a-zA-Z0-9 ,.]+$/.test(key)) {
    event.preventDefault();
    this.toastr.error('Special Characters Not Allowed!');
    return;
  }
}


  if (validationType === 'int' && !/^[0-9]$/.test(key)) {
    event.preventDefault();
    return;
  }

  if (validationType === 'alpha' && !/^[a-zA-Z]$/.test(key)) {
    event.preventDefault();
    return;
  }

  if (input.value.length >= maxLength) {
    event.preventDefault();
    return;
  }
}
  onPinCodeChange() {
    this.spinner.show();
    let pinCodeFieldValue = this.customerForm.get("Pincode").value;
    console.log("PinCode Event", pinCodeFieldValue);
    if (!pinCodeFieldValue) {
      console.log("PinCode Value:- ", pinCodeFieldValue);
      this.customerForm.patchValue({
        Country: null,
        City: null,
        State: null,
      });
    } else if (
      this.customerForm.get("Pincode").value.toString().length == "6"
    ) {
      let requestData = [];
      requestData.push({
        key: "APIType",
        Value: "GetPinCodeValidation",
      });
      requestData.push({
        key: "PinCode",
        Value: this.customerForm.value.Pincode,
      });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        content: strRequestData,
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          try {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == "0") {
              let data = JSON.parse(response?.ExtraData);
              if (data?.Totalrecords == "1") {
                let results = [];
                this.toastr.success("Pincode Found");
                results.push(data?.PinCodeRow);
                results = data?.PinCodeRow;
                this.customerForm.patchValue({
                  Country: results["CountryCode"],
                  City: results["City"],
                  State: results['StateCode'],
                  LandMark: results['OfficeName']
                });
                // Calling State service to fill the data in the Dropdown and then Patching with the Id
                this.onStatesSearch({ term: "", items: [] });
                this.customerForm.get("State").patchValue(results["StateCode"]);
              } else {
                this.toastr.warning("No such pincode found! Add details manually");
                this.customerForm.patchValue({
                  Country: null,
                  City: null,
                  State: null,
                });
              }
              this.spinner.hide();
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
  onReferredBy($event: { term: string; items: any[] }) {
    
    this.dropdownDataService
      .fetchDropDownData(DropDownType.ReferredBy, $event.term, {})
      .subscribe({
        next: (value) => {

          if (value != null) {
            this.ReferredByDD = value;
          }
        },
        
        error: (err) => {
          this.ReferredByDD = this.getBlankObject();
        },
        
      });
      
  }

  onSubmit() {
     debugger
    let image  = this.UploadedImageList[0]?.AttachmentFile
    if (this.dynamicService.validateAllFormFields(this.customerForm)){


       if(this.customerForm.get("IsInsuranceApplicable").value == 1 ||  this.customerForm.get("IsInsuranceApplicable").value == '1' )
      {
         if(this.customerForm.get("InsuranceType").value == null || this.customerForm.get("InsuranceType").value == undefined || this.customerForm.get("InsuranceType").value == ''){
           this.toastr.error('Please select Insurance Type')
           return
         }

      }

      this.errorMessage = "";
      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveRetailCustomer"
      });
      requestData.push({
        "Key": "CustAccGroupCode",
        "Value": this.customerForm.controls["CustAccGroup"].value
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "CustomerCode",
        "Value": ""
      });
      requestData.push({      
        "Key": "FirstName",
        "Value":this.customerForm.controls["FirstName"].value
      });
      requestData.push({
        "Key": "LastName",
        "Value":this.customerForm.controls["LastName"].value
      });
      requestData.push({
        "Key": "Blocked",
        "Value": "0"
      });
      requestData.push({
        "Key": "Address1",
        "Value":this.customerForm.controls["Address1"].value
      });
      requestData.push({
        "Key": "Address2",
        "Value":this.customerForm.controls["Address2"].value
      });
      requestData.push({
        "Key": "CountryCode",
        "Value":this.customerForm.controls["Country"].value
      });
      requestData.push({
        "Key": "StateCode",
        "Value":this.customerForm.controls["State"].value
      });
      requestData.push({
        "Key": "City",
        "Value": this.customerForm.controls["City"].value
      });
      requestData.push({
        "Key": "ZipCode",
        "Value": this.customerForm.controls["Pincode"].value
      });
      requestData.push({
        "Key": "MobileNo",
        "Value": this.customerForm.controls["PhoneNo"].value
      });
      requestData.push({
        "Key": "PhoneNo",
        "Value": this.customerForm.controls["AlternateNo"].value == null || this.customerForm.controls["AlternateNo"].value==undefined ? "" : this.customerForm.controls["AlternateNo"].value
      });
      requestData.push({
        "Key": "EmailId",
        "Value": this.customerForm.controls["EmailId"].value
      });
      requestData.push({
        "Key": "TaxType",
        "Value": "GST"
      });
      requestData.push({
        "Key": "GSTRegistrationNo",
        "Value": this.customerForm.controls["gstNo"].value == null || this.customerForm.controls["gstNo"].value==undefined ? "" : this.customerForm.controls["gstNo"].value
        
      });
      requestData.push({
        "Key": "GSTRegistrationType",
        "Value": this.customerForm.controls["GSTRegistrationType"].value
      
      });
      requestData.push({
        "Key": "DefaultPartnerCode",
        "Value": ""
      });
      requestData.push({
        "Key": "BillToCustomerCode",
        "Value": ""
      });
      requestData.push({
        "Key": "IdentificationDocument",
        "Value": image == null || image == undefined?"":image
      });
      requestData.push({
        "Key": "PriceGroup",
        "Value": this.getPriceGroup()
      });
      requestData.push({
        Key: "ReferredBy",
        Value: this.customerForm.controls["ReferredBy"].value
      });
      requestData.push({
        Key: "IsInsuranceApplicable",
        Value: this.customerForm.controls["IsInsuranceApplicable"].value ?? 0
      });
      requestData.push({
        Key: "InsuranceType",
        Value: this.customerForm.controls["InsuranceType"].value ?? ''
      });
      requestData.push({
        "Key": "PageNo",
        "Value": "1"
      });
      requestData.push({
        "Key": "PageSize",
        "Value": "10"
      });
      console.log("data checking:",requestData)

      ;
      
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        "content": strRequestData
      };
      ;

      const ShouldContinue = confirm("Are you sure? Do you want to continue")
      if (ShouldContinue == false ){
        return
      }
      if(this.submitClicked == true)
      {
        return;
      }
      this.submitClicked=true 

      this.spinner.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            this.submitClicked= false 
            this.spinner.hide();
            console.log("CustomerValue:",value);

            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.AddCustomerData.emit(data.RetailCustomer);
              var close = false
              this.closeAddCustomer.emit(close)
              this.toastr.success("Customer Added Successfully")

            }
            else {
            
              this.spinner.hide();
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.handleError(response);
              });
            }

          },
          error: err => {
            this.submitClicked= false 
            this.spinner.hide();
            console.log(err);
          }
        });
    }
  }

  getErrorMessage(control: string): string {
    let formControl = this.customerForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    console.log("handleError form", this.customerForm.controls['PhoneNo']);

    console.log(response.errorMessageJson.ERRORLIST.ERRORMESSAGE);
    for (let error of response.errorMessageJson.ERRORLIST.ERRORMESSAGE) {
      let controlName = "";
      switch (error.FIELDNAME[0]) {
        case "MobileNo":
          controlName = "PhoneNo";
          break;
        case "EmailId":
          controlName = "EmailId";
          break;
        case "GSTRegistrationNo":
          controlName = "gstNo";
          break;
      }
      this.customerForm.controls[controlName].setErrors({ "Invalid": true, "Message": error.ERRORMESSAGE[0] });
      this.toastr.error(error.ERRORMESSAGE[0],"Error",{closeButton:true,disableTimeOut:true});
    }
  }

  canclefunction(){
    this.closeAddCustomer.emit(this.RetailData);
  } 


  getPriceGroup(): String {
    let value: String = "";
    for (let cust of this.CustAccountGroup.Data) {
      if (cust["ID"] == this.customer.CustomerAccountGroup) {
        value = cust.extraDataJson.Data.$.DefaultPriceGroup;
        break;
      }
    }
    return value;
  }

  onGSTSelect() {
    var gstselect = this.customerForm.get('DoGST').value
    if ((gstselect != true)) {
      this.customerForm.controls['gstNo'].disable();
      this.customerForm.controls['GSTRegistrationType'].disable();
      this.customerForm.controls["GSTRegistrationType"].setValue("GSTU");
      this.customerForm.get('gstNo').setValidators(this.gstnoValidatornotRequired);
    } else {
      this.customerForm.controls['gstNo'].enable();
      this.customerForm.controls['GSTRegistrationType'].enable();
      var data =  {Id:"GRR",TEXT:"GST registered- Regular"}
      this.customerForm.controls["GSTRegistrationType"].setValue("GRR");
      this.customerForm.get('gstNo').setValidators(this.gstnoValidatorRequired);
    }

  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
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
        this.customer.Country = null;
        this.customer.State = null;
      }
    });

  }

  async OnFileUploadClick(event: any) {
    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      var ext =  fileToUpload.name.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      try{
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

        // this.dynamicService.uploadFileToS3Local(fileToUpload, filename).subscribe(
        //   {
        //     next: (value) => {
              let uploadedimage: any;
              uploadedimage = value;
              this.UploadedImageList.push({
                "AttachmentFile": uploadedimage?.dbPath,
                "src": uploadedimage?.dbPath,//  glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
                "filename": fileToUpload.name
              })
              console.log("Img", this.UploadedImageList)
          //   },
          //   error: (err) => {
          //     this.spinner.hide()
          //     this.toastr.error(err)
          //   },
          // });
      } 
      catch (err) {
        this.spinner.hide()
        this.toastr.error(err.message || err);
      }
    }

  }

  onStatesSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode: this.customerForm.controls["Country"].value
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

  onCustAccountGroupSearch($event: { term: string; items: any[] }) {
    
    this.dropdownDataService.fetchDropDownData(DropDownType.CustAccountGroup, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.CustAccountGroup = value;
          console.log(value);
        }
      },
      error: err => {
        this.CustAccountGroup = this.getBlankObject();
      }
    });
  }

  onGSTRegistrationSearch($event: { term: string; items: any[] }) {
    
    this.dropdownDataService.fetchDropDownData(DropDownType.GSTRegistration, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GSTRegistration = value;
        }
      },
      error: err => {
        this.GSTRegistration = this.getBlankObject();
      }
    });
  }



  DateT() {
    var RemoveT = new Date().toISOString()
      .replace('T', ' ');

  }


validateemail(){
  this.spinner.show()
  var emailid=this.customerForm.controls["EmailId"].value
  this.emailValidator.validateEmail(emailid).subscribe(
    {
      next: (value:any) => {
        if(value.ReturnValue==true)
        {
          this.toastr.success("Valid Email Id");

        }
        else{
          this.customerForm.controls["EmailId"].setErrors({ "Invalid": true, "Message": "Invalid Email Id" });
          this.toastr.error("In-valid Email Id");

        }
        
        this.spinner.hide();
      }
    });

}

 onInsuranceType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.InsuranceType, $event.term, {}).subscribe({
      next: (value) => {
        if (value != null) { this.InsuranceTypeDD = value;
          console.log('this.InsuranceTypeDD ',this.InsuranceTypeDD )
         }
      },
      error: (err) => { this.InsuranceTypeDD = this.getBlankObject(); },
    });
  }

   onInsuranceFlagChange($event){
    debugger
    console.log('$event', $event)

   this.customerForm.get('InsuranceType').setValue(null);
      
    
  }

}
