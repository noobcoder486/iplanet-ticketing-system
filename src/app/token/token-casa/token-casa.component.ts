import xml2js from 'xml2js';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import * as glob from 'src/app/config/global'
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-token-casa',
  templateUrl: './token-casa.component.html',
  styleUrls: ['./token-casa.component.sass']
})
export class TokenCasaComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) { }

  locationForm: FormGroup;
  location: Location;
  formTitle: string = "Add"
  errorMessage: String;
  companies: any[] = [];
  selectedCompany: any;
  params: any;
  isEdit:boolean = false;


  TaxType: DropDownValue = this.getBlankObject();
  GSTRegistrationType: DropDownValue = this.getBlankObject();
  LocationPriceGroup: DropDownValue = this.getBlankObject();
  Countries: DropDownValue = this.getBlankObject();
  States: DropDownValue = this.getBlankObject();
  LocationAccGroupDD: DropDownValue = this.getBlankObject();
  

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    
    if (this.params.tc != null || this.params.tc != undefined) {
      this.getData()
      this.isEdit = true
    }
    if (this.params.caseguid != null || this.params.caseguid != undefined) {
      this.getDataJob()
      this.isEdit = true
    }
    else if (this.params.invoiceguid != null || this.params.invoiceguid != undefined) {
      this.getDataInvoice()
      this.isEdit = true
    }
  }

  getData() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetTokenObject4Casa"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": params.lc
    });
    requestData.push({
      "Key": "TokenCode",
      "Value": params.tc
    });
    requestData.push({
      "Key": "TokenDate",
      "Value": params.td
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            ;
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

  getDataJob() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetJobObject4Casa"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": params.caseguid
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            ;
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

  
  getDataInvoice() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetInvoiceObject4Casa"
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": params.invoiceguid
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            ;
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


  controlValidations() {
    Object.keys(this.locationForm.controls).forEach(field => {
      if (field == "Address2") { }
      else {
        let controlValue = this.locationForm.get(field).value
        if (controlValue == null || controlValue == undefined) {
          this.locationForm.get(field).setErrors({incorrect:true})
          this.toastMessage.error(field + " Cannot be Empty")
        }
      }
    })
  }

  getErrorMessage(control: string): string {
    let formControl = this.locationForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }

  returnPrevious()
  {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/location-master')
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

  onTaxType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.TaxType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TaxType = value;
        }
      },
      error: (err) => {

        this.TaxType = this.getBlankObject();
      }
    });
  }

  onLocationPriceGroup($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.LocationPriceGroup, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationPriceGroup = value;
        }
      },
      error: (err) => {
        this.LocationPriceGroup = this.getBlankObject();
      }
    });
  }

  onGSTRegistrationType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.GSTRegistration, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GSTRegistrationType = value;
        }
      },
      error: (err) => {
        this.GSTRegistrationType = this.getBlankObject();
      }
    });
  }

  onLocationAccGroupCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.LocationAccountGroupCode, $event.term, {
        CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationAccGroupDD = value;
          console.log(this.LocationAccGroupDD)
        }
      },
      error: (err) => {
        this.LocationAccGroupDD = this.getBlankObject();
      }
    });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
