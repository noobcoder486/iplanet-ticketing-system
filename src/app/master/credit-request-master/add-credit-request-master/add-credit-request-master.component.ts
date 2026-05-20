import { DropDownValue, DropdownDataService } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, } from "@angular/forms";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, } from "@angular/core";
import { Customer } from "src/app/custom-components/create-customer/add-customer/CUSTOMER.metadata";
import * as glob from "src/app/config/global";
import { NgxSpinnerService } from "ngx-spinner";
import { emailValidatorService } from "src/app/common/Services/gsxService/email.validator";
import { ToastrService } from "ngx-toastr";
import xml2js from "xml2js";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter } from "src/app/custom-components/call-login-dashboard/filter.meta";
import { v4 as uuidv4 } from "uuid";


@Component({
  selector: "app-add-credit-request-master",
  templateUrl: "./add-credit-request-master.component.html",
  styleUrls: ["./add-credit-request-master.component.css"],
})
export class AddCreditRequestMasterComponent implements OnInit {
  params: any;
  filterList: Filter[] = [];
  creditRequestForm: FormGroup;
  errorMessage: String;
  PopUp_Event: boolean = false;
  formTitle: string = "Add";
  isEdit: boolean = false;
  isLocked: boolean = false;
  TransactionTypeDD: any[] = ["ADVANCE", "INVOICE"];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  ModeofPayment: DropDownValue = DropDownValue.getBlankObject();
  ExpiryDate: string;
  CreditRequestGUID: string;

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
   }

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined || this.params.cc != null || this.params.cc != undefined) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true;
    } else if (Object.keys(this.params).length == 0){
      this.CreditRequestGUID = uuidv4();
    }
    this.creditRequestForm = this.formBuilder.group({
      CustomerCode: [null],
      LocationCode: [null, [Validators.required, Validators.maxLength(96)]],
      ModeOfPayment: [null, [Validators.required, Validators.maxLength(60)]],
      TransactionType: [null, [Validators.required, Validators.maxLength(40)]],
      MobileNo: [null, [Validators.required,Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[0-9]*$")]],
      CreditLimit: [null, [Validators.required, Validators.maxLength(40)]],
    });
    this.onLocationSearch({ term: "", item: [] });
    this.onModeofPaymentSearch({ term: "", item: [] });

  }

  getData() {
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetCreditRequestMasterObject",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.params.nc,
    });
    requestData.push({
      Key: "CreditRequestGUID",
      Value: this.params.cc,
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        console.log("Value", Value);
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == "0") {
          let data = JSON.parse(response.ExtraData)?.CreditRequest;
          ;

          const expiryDate = new Date(data?.ExpiryDate);
          const localDate = new Date(expiryDate.getTime() - (expiryDate.getTimezoneOffset() * 60000));
          this.ExpiryDate = localDate.toISOString().split('T')[0];          
          this.creditRequestForm.patchValue({
            CustomerCode: data.CustomerCode,
            LocationCode: data.LocationCode,
            ModeOfPayment: data.ModeOfPayment,
            TransactionType: data.TransactionType,
            MobileNo: data.MobileNo,
            CreditLimit: data.CreditLimit,
            // CreditSpent: data.CreditSpent
          });
        } else {
          console.log("error");
          this.toastr.error(response.ReturnMessage, "Error");
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error("An error occurred while fetching data", "Error");
      },
    });
  }

  controlValidations() {
    let isValid = true;
    Object.keys(this.creditRequestForm.controls).forEach((field) => {
      if (field !== 'CustomerCode') {
        let controlValue = this.creditRequestForm.get(field).value;
        if (controlValue == null || controlValue == undefined) {
          this.toastr.error(field + " Cannot be Empty");
          isValid = false;
        }
      }
    });
    return isValid;
  }

  onSubmit() {
    if (!this.controlValidations()) {
      return;
    }
    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "SaveCreditRequestMaster",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CreditRequestGUID",
      Value: this.CreditRequestGUID,
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.params.customercode == undefined ? "" : this.params.customercode,
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.creditRequestForm.controls["CustomerCode"].value,
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.creditRequestForm.controls["LocationCode"].value,
    });
    requestData.push({
      Key: "ModeOfPayment",
      Value: this.creditRequestForm.controls["ModeOfPayment"].value,
    });
    requestData.push({
      Key: "MobileNo",
      Value: this.creditRequestForm.controls["MobileNo"].value,
    });
    requestData.push({
      Key: "TransactionType",
      Value: this.creditRequestForm.controls["TransactionType"].value,
    });
    requestData.push({
      Key: "ExpiryDate",
      Value: this.ExpiryDate,
    });
    requestData.push({
      Key: "CreditLimit",
      Value: this.creditRequestForm.controls["CreditLimit"].value,
    });
    // requestData.push({
    //   Key: "CreditSpent",
    //   Value: this.creditRequestForm.controls["CreditSpent"].value,
    // });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    console.log("contentRequest", contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode === "0") {
          this.toastr.success("Submitted Successfully");
          this.cancelfunction();
        } else {
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            response["errorMessageJson"] = result;
            this.handleError(response);
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          "An error occurred while submitting the form",
          "Error"
        );
      },
    });
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
      })
      .subscribe({
        next: (value) => {
          if (value != null) {
          console.log("value", value)

            const allOption = { Id: "ALL", TEXT: "ALL" };
            // value.Data.push(allOption)
            this.LocationForJob = {
              ...value, 
              Data: [allOption, ...value.Data] 
            };
      console.log("dropdownDataService", this.LocationForJob)
          }
        },
        error: (err) => {
          this.LocationForJob = DropDownValue.getBlankObject();
          this.toastr.error(
            "An error occurred while fetching locations",
            "Error"
          );
        },
      });
  }
  
  

  
  onModeofPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ModeofPayment, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ModeofPayment = {
            ...value,
           Data: value.Data.filter(item => item.Id === 'CREDITREQ')
          }
          console.log("Mode of payments ", this.ModeofPayment)
        }
      },
      error: (err) => {
        this.ModeofPayment = DropDownValue.getBlankObject();
      }
    });

  }

  getErrorMessage(control: string): string {
    let formControl = this.creditRequestForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let error =
      response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
    error.forEach((err) => {
      this.toastr.error("Error:- ", err);
    });
  }

  cancelfunction() {
    this.route.navigate([
      "/auth/" + glob.getCompanyCode() + "/credit-request-master",
    ]);
  }

  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === "int") {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === "alpha") {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
}
