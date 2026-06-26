import { DropDownValue, DropdownDataService, } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, } from "@angular/forms";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, Inject, Optional, } from "@angular/core";
import { Customer } from "src/app/custom-components/create-customer/add-customer/CUSTOMER.metadata";
import * as glob from "src/app/config/global";
import { NgxSpinnerService } from "ngx-spinner";
import { emailValidatorService } from "src/app/common/Services/gsxService/email.validator";
import { ToastrService } from "ngx-toastr";
import xml2js from "xml2js";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter } from "src/app/custom-components/call-login-dashboard/filter.meta";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-add-customer-master",
  templateUrl: "./add-customer-master.component.html",
  styleUrls: ["./add-customer-master.component.css"],
})
export class AddCustomerMasterComponent implements OnInit {
  PinCode: any;
  date: any;
  @Input() callbackfunction;
  params: any;
  filterList: Filter[] = [];
  stateCodeValidation;
  customerForm: FormGroup;
  customer: Customer;
  errorMessage: String;
  PopUp_Event: boolean = false;
  RetailData: any = [];
  formTitle: string = "Add";
  isEdit: boolean = false;
  isLocked: boolean = false
  RetailsCustomerData: any = [];
  Countries: DropDownValue = this.getBlankObject();
  States: DropDownValue = this.getBlankObject();
  CustAccountGroup: DropDownValue = this.getBlankObject();
  BindStatePincode: DropDownValue = this.getBlankObject();
  GSTRegistration: DropDownValue = this.getBlankObject();
  ReferredByDD: DropDownValue = this.getBlankObject();
  InsuranceTypeDD: DropDownValue = this.getBlankObject();
  CustomerTypeDD: DropDownValue = this.getBlankObject();
  @Output() AddCustomerData = new EventEmitter<any>();
  @Output() closeAddCustomer = new EventEmitter<any>();
  @Output("search") search: EventEmitter<any> = new EventEmitter();
  submitClicked = false
  /** True when opened via MatDialog.open(), false when navigated to via router */
  isDialogMode = false

  PricingOptionMasterList: any[] = [];
  FinalSelectedPricingOption: any[] = [];
  IsShowMargin: boolean = false;
  IsDisableInsuranceType: boolean = false;
  IsDisableCustomerType: boolean = false;
  CustomerPricingOptionList: any[] = [];



  InsuranceApplicableList: any[] = [
    { Id: '1', TEXT: 'YES' }, { Id: '0', TEXT: 'NO' }]

  SpecialMarginApplicableList: any[] = [
    { Id: '1', TEXT: 'YES' }, { Id: '0', TEXT: 'NO' }]

  constructor(
    @Optional() private dialogRef: MatDialogRef<AddCustomerMasterComponent>,
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    @Optional() @Inject(MAT_DIALOG_DATA) public popUpData: any,
    private spinner: NgxSpinnerService,
    private emailValidator: emailValidatorService,
    private toastr: ToastrService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.isDialogMode = dialogRef != null;
  }

  SpninnerChecker() {
    this.spinner.show();
  }

  gstConditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }
    if (formControl.parent.get("DoGST").value) {
      return Validators.required(formControl);
    }
    return null;
  }

  private gstnoValidatorRequired = [
    Validators.maxLength(15),
    Validators.minLength(15),
    Validators.required,
  ];



  private gstnoValidatornotRequired = [
    Validators.maxLength(0),
    Validators.minLength(0),
  ];

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (
      this.params.customercode != null ||
      this.params.customercode != undefined
    ) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true;
    }
    this.customer = new Customer();
    this.customerForm = this.formBuilder.group({
      StateCode: [],
      FirstName: [null, [Validators.required, Validators.maxLength(96), Validators.pattern("^[^<>&!¿]*$")]],
      LastName: [null, [Validators.required, Validators.maxLength(96), Validators.pattern("^[^<>&!¿]*$")]],
      Address1: [null, [Validators.required, Validators.maxLength(60), Validators.pattern("^[^<>&!¿]*$")]],
      Address2: [null, [Validators.required, Validators.maxLength(40), Validators.pattern("^[^<>&!¿]*$")]],
      Address3: [null, [Validators.maxLength(40), Validators.pattern("^[^<>&!¿]*$")]],
      LandMark: [null, [Validators.maxLength(40), Validators.pattern("^[^<>&!¿]*$")]],
      PhoneNo: [null, [Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern("^[0-9]*$"),
      ]
      ],
      AlternateNo: [null],
      EmailId: [null, [Validators.required, Validators.email]],
      Country: [null, Validators.required],
      State: [
        { value: this.customer?.Country == null ? null : this.customer.State },
        Validators.required,
      ],
      City: [null, Validators.required],
      PinCode: [
        null,
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern("^[0-9]*$"),
        ],
      ],
      DoGST: [false],
      gstNo: [''],
      CustAccGroup: [null, Validators.required],
      GSTRegistrationType: ["GSTU"],
      ReferredBy: [null],
      IsInsuranceApplicable: [null, Validators.required],
      InsuranceType: [null],
      CustomerType: [null, Validators.required],
      IsSpecialMarginApplicable: [null, Validators.required],
    });
    this.onCountrySearch({ term: "", items: [] });
    this.onCustAccountGroupSearch({ term: "", items: [] });
    this.onGSTRegistrationSearch({ term: "", items: [] });
    this.onReferredBy({ term: "", items: [] });
    this.onInsuranceType({ term: "", items: [] });
    this.onCustomerType({ term: "", items: [] });


    if (this.popUpData != null && this.popUpData != undefined) {
      this.customerForm.get('EmailId').setValue(this.popUpData.CustomerEmail);
      this.customerForm.get('PhoneNo').setValue(this.popUpData.CustomerPhone);
    }

    if (this.params.customercode == null || this.params.customercode == undefined) {
      this.GetPricingOptionMasterList()
    }

  }

  getData() {
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetRtlCustomerObject",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.params.customercode,
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {

        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == "0") {
          let data = JSON.parse(response.ExtraData)?.Customer;
          console.log('data', data)
          data?.SapInvoiceCount == '0' ? this.isLocked = false : this.isLocked = true
          if (data?.SapInvoiceCount > 0) {
            this.toastr.error("Cant change Mobile No and State as more than 1 Invoices posted to SAP")
          }

          this.customerForm.patchValue({
            FirstName: data.FirstName,
            LastName: data.LastName,
            Address1: data.Address1,
            Address2: data.Address2,
            Address3: data.Address3,
            LandMark: data.LandMark,
            PhoneNo: data.MobileNo,
            AlternateNo: data.PhoneNo,
            EmailId: data.EmailID,
            Country: data.CountryCode,
            State: data.StateCode,
            City: data.City,
            PinCode: data.ZipCode,
            DoGST: data.GST,
            gstNo: data.GSTRegistrationNo,
            CustAccGroup: data.CustAccGroupCode,
            GSTRegistrationType: data.GSTRegistrationType,
            ReferredBy: data.ReferredBy,
            IsInsuranceApplicable: data.IsInsuranceApplicable,
            InsuranceType: data?.InsuranceType ?? null,
            CustomerType: data?.CustomerType ?? 'NA',
            IsSpecialMarginApplicable: data?.IsSpecialMarginApplicable ?? 0
          });

          this.IsShowMargin = this.customerForm.get("IsSpecialMarginApplicable").value == 1 ? true : false


          if (data?.CustomerPricingOptionList?.CustomerPricingOption) {
            this.CustomerPricingOptionList = [];
            this.FinalSelectedPricingOption = Array.isArray(data?.CustomerPricingOptionList?.CustomerPricingOption) ? data?.CustomerPricingOptionList?.CustomerPricingOption : [data?.CustomerPricingOptionList?.CustomerPricingOption]


          }
          else {
            this.GetPricingOptionMasterList()
          }


        } else {
          console.log("error");
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  returnPrevious() {
    this.route.navigateByUrl('/auth/' + glob.getCompanyCode() + '/customer-master')
  }

  onSubmit() {

    const pattern = /^[^\\+\\=@\\-]/;
    const htmlpattern = /<(\"[^\"]\"|'[^']'|[^'\">])*>/
    const formValue = this.customerForm.value
    if (!pattern.test(formValue.FirstName)) {
      this.toastr.error("FirstName is Invalid")
      return;
    }
    if (!pattern.test(formValue.LastName)) {
      this.toastr.error("LastName is Invalid")
      return
    }
    if (!pattern.test(formValue.Address1)) {
      this.toastr.error("Address Line 1 is Invalid")
      return
    }
    if (!pattern.test(formValue.Address2)) {
      this.toastr.error("Address Line 2 is Invalid")
      return
    }
    if (!pattern.test(formValue.City)) {
      this.toastr.error("City is Invalid")
      return
    }
    if (htmlpattern.test(formValue.FirstName)) {
      this.toastr.error("FirstName is Invalid")
      return
    }
    if (htmlpattern.test(formValue.LastName)) {
      this.toastr.error("LastName is Invalid")
      return
    }
    if (htmlpattern.test(formValue.Address1)) {
      this.toastr.error("Address Line 1 is Invalid")
      return
    }
    if (htmlpattern.test(formValue.Address2)) {
      this.toastr.error("Address Line 2 is Invalid")
      return
    }
    if (htmlpattern.test(formValue.City)) {
      this.toastr.error("City is Invalid")
      return
    }

    this.dynamicService.validateAllFormFields(this.customerForm);
    if (this.customerForm.valid) {
      if (this.customerForm.get("PinCode").value.toString().length > 6) {
        this.toastr.error("Invalid PinCode")
        return;
      }

      if (this.customerForm.get("DoGST").value == true) {
        if (this.customerForm.get("gstNo").value.toString().length != 15) {
          this.toastr.error("Invalid GST Registration Number")
          return;
        }
        if (!this.customerForm.get("GSTRegistrationType").value) {
          this.toastr.error("Kindly enter a GST registration type")
          return;
        }
      }

      if (this.params.customercode != null || this.params.customercode != undefined) {
        this.isEdit = true;
      }


      if (this.customerForm.get("IsInsuranceApplicable").value == 1 || this.customerForm.get("IsInsuranceApplicable").value == '1') {
        if (this.customerForm.get("InsuranceType").value == null || this.customerForm.get("InsuranceType").value == undefined || this.customerForm.get("InsuranceType").value == '') {
          this.toastr.error('Please select Insurance Type')
          return
        }

      }

      this.errorMessage = "";
      let requestData = [];
      requestData.push({ Key: "ApiType", Value: "SaveRetailCustomer" });
      requestData.push({ Key: "CustAccGroupCode", Value: this.customerForm.controls["CustAccGroup"].value });
      requestData.push({ Key: "CompanyCode", Value: glob.getCompanyCode() });
      requestData.push({ Key: "CustomerCode", Value: this.params.customercode == undefined ? "" : this.params.customercode });
      requestData.push({ Key: "FirstName", Value: this.customerForm.controls["FirstName"].value });
      requestData.push({ Key: "LastName", Value: this.customerForm.controls["LastName"].value });
      requestData.push({ Key: "Blocked", Value: "0" });
      requestData.push({ Key: "Address1", Value: this.customerForm.controls["Address1"].value });
      requestData.push({ Key: "Address2", Value: this.customerForm.controls["Address2"].value });
      requestData.push({ Key: "Address3", Value: this.customerForm.controls["Address3"].value });
      requestData.push({ Key: "LandMark", Value: this.customerForm.controls["LandMark"].value });
      requestData.push({ Key: "CountryCode", Value: this.customerForm.controls["Country"].value });
      requestData.push({ Key: "StateCode", Value: this.customerForm.controls["State"].value });
      requestData.push({ Key: "City", Value: this.customerForm.controls["City"].value });
      requestData.push({ Key: "ZipCode", Value: this.customerForm.controls["PinCode"].value });
      requestData.push({ Key: "MobileNo", Value: this.customerForm.controls["PhoneNo"].value });
      requestData.push({
        Key: "PhoneNo",
        Value: this.customerForm.controls["AlternateNo"].value == null || this.customerForm.controls["AlternateNo"].value == undefined
          ? "" : this.customerForm.controls["AlternateNo"].value,
      });
      requestData.push({ Key: "EmailID", Value: this.customerForm.controls["EmailId"].value });
      requestData.push({ Key: "TaxType", Value: "GST" });
      requestData.push({
        Key: "GSTRegistrationNo",
        Value: this.customerForm.controls["gstNo"].value == null || this.customerForm.controls["gstNo"].value == undefined
          ? "" : this.customerForm.controls["gstNo"].value,
      });
      requestData.push({ Key: "GSTRegistrationType", Value: this.customerForm.controls["GSTRegistrationType"].value });
      requestData.push({ Key: "DefaultPartnerCode", Value: "" });
      requestData.push({ Key: "BillToCustomerCode", Value: "" });
      requestData.push({ Key: "PriceGroup", Value: this.getPriceGroup() });
      requestData.push({ Key: "IdentificationDocument", Value: "" });
      requestData.push({ Key: "SubmissionType", Value: "" });
      requestData.push({ Key: "ReferredBy", Value: this.customerForm.controls["ReferredBy"].value });

      requestData.push({ Key: "IsInsuranceApplicable", Value: this.customerForm.controls["IsInsuranceApplicable"].value });
      requestData.push({ Key: "InsuranceType", Value: this.customerForm.controls["InsuranceType"].value });
      requestData.push({ Key: "CustomerType", Value: this.customerForm.controls["CustomerType"].value ?? 'NA' });
      requestData.push({ Key: "IsSpecialMarginApplicable", Value: this.customerForm.controls["IsSpecialMarginApplicable"].value });
      requestData.push({ Key: "CustomerPricingOption", Value: (this.customerForm.controls["IsSpecialMarginApplicable"].value == 1 || this.customerForm.controls["IsSpecialMarginApplicable"].value == '1') ? this.CustomerPricingOptionIntoXml() : '<rows/>' });


      console.log('requestData', requestData)
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = { content: strRequestData };

      const ShouldContinue = confirm("Are you sure? Do you want to continue")
      if (ShouldContinue == false) { return }
      if (this.submitClicked == true) { return; }
      this.submitClicked = true

      this.spinner.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          this.spinner.hide();
          this.submitClicked = false

          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response?.ExtraData);
            this.AddCustomerData.emit(data.RetailCustomer);
            var close = false;
            this.closeAddCustomer.emit(close);
            this.toastr.success("Customer Added Successfully");

            // If opened as dialog, close it with result; otherwise navigate away
            if (this.isDialogMode) {
              this.dialogRef?.close({ success: true, CustomerCode: data?.RetailCustomer?.CustomerCode });
              return;
            }
            this.returnPrevious();
          } else {
            this.spinner.hide();
            let errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(errorMessage, (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
              this.errorMessage = ''
              errorMessages.forEach((errorMessage) => {
                this.toastr.error(errorMessage.ERRORMESSAGE);
                this.errorMessage = this.errorMessage + errorMessage.ERRORMESSAGE
              });
            });
          }
        },
        error: (err) => {
          this.submitClicked = false
          this.spinner.hide();
          console.log(err);
        },
      });
    }
    else {
      Object.keys(this.customerForm.controls).forEach(key => {
        const control = this.customerForm.get(key);
        if (control.invalid) {
          Object.keys(control.errors).forEach(errorKey => {
            let errorMessage = "";
            switch (errorKey) {
              case 'maxlength':
                errorMessage = `${key} exceeds the maximum length of ${control.errors.maxlength.requiredLength}.`;
                break;
              case 'minlength':
                errorMessage = `${key} does not meet the minimum length of ${control.errors.minlength.requiredLength}.`;
                break;
              case 'pattern':
                errorMessage = `${key} does not match the expected pattern: ${control.errors.pattern.requiredPattern}.`;
                break;
            }
            errorMessage != "" ? this.toastr.error(errorMessage) : ''
          });
        }
      });
      console.log("Error in valid");
    }
  }

  getErrorMessage(control: string): string {
    let formControl = this.customerForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
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
      this.customerForm.controls[controlName].setErrors({
        Invalid: true,
        Message: error.ERRORMESSAGE[0],
      });
      this.toastr.error(error.ERRORMESSAGE[0], "Error", {
        closeButton: true,
        disableTimeOut: true,
      });
    }
  }

  cancelfunction() {
    // If opened as a dialog, close it; otherwise navigate away
    if (this.isDialogMode) {
      this.dialogRef?.close({ success: false });
      return;
    }
    this.route.navigate(["/auth/" + glob.getCompanyCode() + "/customer-master"]);
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

  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const inputFieldName = input.getAttribute('formControlName');

    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Comma'];

    if (allowedKeys.includes(key)) { return; }

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

  onGSTSelect() {
    this.customerForm.get("gstNo").clearValidators();
    this.customerForm.get("gstNo").updateValueAndValidity();

    var gstselect = this.customerForm.get("DoGST").value;
    if (gstselect != true) {
      this.customerForm.controls["gstNo"].disable();
      this.customerForm.get("gstNo").setValue('');
      this.customerForm.controls["GSTRegistrationType"].disable();
      this.customerForm.controls["GSTRegistrationType"].setValue("GSTU");
      this.customerForm.get("gstNo").setValidators(this.gstnoValidatornotRequired);
    } else {
      this.customerForm.controls["gstNo"].enable();
      this.customerForm.controls["GSTRegistrationType"].enable();
      this.customerForm.controls["GSTRegistrationType"].setValue("GRR");
      this.customerForm.get("gstNo").setValidators(this.gstnoValidatorRequired);
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
      error: (err) => {
        this.Countries = this.getBlankObject();
        this.States = this.getBlankObject();
        this.customer.Country = null;
        this.customer.State = null;
      },
    });
  }

  onStatesSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode: this.customerForm.controls["Country"].value,
    }).subscribe({
      next: (value) => {
        if (value != null) { this.States = value; }
      },
      error: (err) => { this.States = this.getBlankObject(); },
    });
  }

  onCustAccountGroupSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CustAccountGroup, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) { this.CustAccountGroup = value; }
      },
      error: (err) => { this.CustAccountGroup = this.getBlankObject(); },
    });
  }

  onGSTRegistrationSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.GSTRegistration, $event.term, {}).subscribe({
      next: (value) => {
        if (value != null) { this.GSTRegistration = value; }
      },
      error: (err) => { this.GSTRegistration = this.getBlankObject(); },
    });
  }

  onReferredBy($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ReferredBy, $event.term, {}).subscribe({
      next: (value) => {
        if (value != null) { this.ReferredByDD = value; }
      },
      error: (err) => { this.ReferredByDD = this.getBlankObject(); },
    });
  }
  onInsuranceType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.InsuranceType, $event.term, {}).subscribe({
      next: (value) => {
        if (value != null) {
          this.InsuranceTypeDD = value;
          console.log('this.InsuranceTypeDD ', this.InsuranceTypeDD)
        }
      },
      error: (err) => { this.InsuranceTypeDD = this.getBlankObject(); },
    });
  }
  onCustomerType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CUSTOMERTYPE, $event.term, {}).subscribe({
      next: (value) => {
        if (value != null) {
          this.CustomerTypeDD = value;
          console.log('this.CustomerTypeDD ', this.CustomerTypeDD)
        }
      },
      error: (err) => { this.CustomerTypeDD = this.getBlankObject(); },
    });
  }

  patchStateCode() {
    if (
      this.customerForm.controls["Pincode"].value.TEXT != undefined ||
      this.customerForm.controls["Pincode"].value.TEXT != null
    ) {
      for (let item of this.stateCodeValidation) {
        if (this.customerForm.controls["Pincode"].value.TEXT == item.TEXT) {
          this.customerForm.patchValue({
            City: item.extraDataJson.Data.CityCode[0],
            StateCode: item.extraDataJson.Data.StateCode[0],
            Country: item.extraDataJson.Data.CountryCode[0],
          });
        }
      }
    }
  }

  onPinCodeChange() {
    this.spinner.show();
    let pinCodeFieldValue = this.customerForm.get("PinCode").value;
    if (!pinCodeFieldValue) {
      this.customerForm.patchValue({ Country: null, City: null, State: null });
    } else if (this.customerForm.get("PinCode").value.toString().length == "6") {
      let requestData = [];
      requestData.push({ key: "APIType", Value: "GetPinCodeValidation" });
      requestData.push({ key: "PinCode", Value: this.customerForm.value.PinCode });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest = { content: strRequestData };

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
                this.onStatesSearch({ term: "", items: [] });
                this.customerForm.get("State").patchValue(results["StateCode"]);
              } else {
                this.toastr.warning("No such pincode found! Add details manually");
              }
              this.spinner.hide();
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: (err) => { console.log(err); },
      });
    }
  }

  DateT() {
    var RemoveT = new Date().toISOString().replace("T", " ");
  }

  validateemail() {
    this.spinner.show();
    var emailid = this.customerForm.controls["EmailId"].value;
    this.emailValidator.validateEmail(emailid).subscribe({
      next: (value: any) => {
        if (value.ReturnValue == true) {
          this.toastr.success("Valid Email Id");
        } else {
          this.customerForm.controls["EmailId"].setErrors({
            Invalid: true,
            Message: "Invalid Email Id",
          });
          this.toastr.error("In-valid Email Id");
        }
        this.spinner.hide();
      },
    });
  }

  // onInsuranceFlagChange($event) {
  //   
  //   console.log('$event', $event)

  //   if ($event.Id == "1" || $event.Id == 1) {


  //     this.FinalSelectedPricingOption.forEach(item => {
  //       item.MarginPercentage = 0.00
  //     })
  //   }



  // }



  GetPricingOptionMasterList() {

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetPricingOptionMasterList"
    })

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {

          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);

              if (Array.isArray(data?.PricingOptionMasterList?.PricingOptionMaster)) {
                this.PricingOptionMasterList = data?.PricingOptionMasterList?.PricingOptionMaster
              }
              else {
                this.PricingOptionMasterList.push(data?.PricingOptionMasterList?.PricingOptionMaster)
              }
            }
            console.log('this.PricingOptionMasterList', this.PricingOptionMasterList)
            this.FinalSelectedPricingOption = [];


            this.PricingOptionMasterList.forEach(item => {
              this.FinalSelectedPricingOption.push(
                {
                  "PricingOption": item?.PricingOption,
                  "MarginPercentage": item?.MarginPercentage

                }
              )
            })



            console.log('this.FinalSelectedPricingOption', this.FinalSelectedPricingOption)

          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );

  }

  // onCustomerTypeChange($event) {
  //   
  //   //  this.IsShowMargin = (this.customerForm.get("CustomerType").value != 'NA' && this.customerForm.get("IsInsuranceApplicable").value == "1" ) ? true : false


  //   //  this.FinalSelectedPricingOption.forEach(x =>{
  //   //   x.MarginPercentage= 0.00
  //   //  })


  // }

  SpecialMarginApplicableChange($event) {

    this.IsShowMargin = this.customerForm.get("IsSpecialMarginApplicable").value == 1 ? true : false;

    this.FinalSelectedPricingOption.forEach(x => {
      x.MarginPercentage = 0.00
    })

  }



  CustomerPricingOptionIntoXml() {

    let rawData = {
      rows: [],
    };
    for (let item of this.FinalSelectedPricingOption) {

      rawData.rows.push({
        row: {
          "MarginPercentage": item?.MarginPercentage ?? 0.00,
          "PricingOption": item?.PricingOption,
        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    //xml = xml.split(' ').join('')
    xml = xml.replace(/>\s+</g, '><');

    console.log("xml", xml);

    return xml;
  }

}