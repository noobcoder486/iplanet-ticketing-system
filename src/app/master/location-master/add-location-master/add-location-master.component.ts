import xml2js from 'xml2js';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import * as glob from 'src/app/config/global'
import { Location } from './location-master.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-location-master',
  templateUrl: './add-location-master.component.html',
  styleUrls: ['./add-location-master.component.sass']
})

export class AddLocationMasterComponent implements OnInit {

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
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.location = new Location();
    this.locationForm = this.formBuilder.group({
      LocationAccGroupCode: [null, Validators.required],
      LocationCode: [null, Validators.required],
      LocationName: [null, Validators.required],
      SearchName: [null, Validators.required],
      Address1: [null, Validators.required],
      Address2: [null],
      City: [null, Validators.required],
      ZipCode: [null, Validators.required],
      State: [{ value: this.location?.CountryCode == null ? null : this.location.StateCode }, Validators.required],
      Country: [null, Validators.required],
      ContactPerson: [null, Validators.required],
      MobileNo: [null, Validators.required],
      PhoneNo: [null, Validators.required],
      EmailId: [null, Validators.required],
      TaxType: [null, Validators.required],
      GSTRegistrationNo: [null, Validators.required],
      GSTRegistrationType: [null, Validators.required],
      LocationPriceGroup: [null, Validators.required],
      ShipToGSX: [null, Validators.required],
      SoldToGSX: [null, Validators.required],
      SAPPlantCode: [null, Validators.required],
      SAPStorageLocation:[null, Validators.required],
      GSXDropOffCode: [null],
      ParentLocationCode: [null],
      ProfitCenterCode : [null],
      Region:[null],
      GoogleMyBusiness:[null],
      AppleBusinessConnect:[null]
    });

    this.location.locationForm = this.locationForm;
    this.onTaxType({ term: '', items: [] })
    this.onLocationAccGroupCode({ term: '', items: [] })
    this.onCountrySearch({ term: "", items: [] });
    this.onGSTRegistrationType({ term: '', items: [] })
    this.onLocationPriceGroup({ term: '', items: [] })
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
        this.location.CountryCode = null;
        this.location.StateCode = null;
      }
    });

  }

  getData() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": params.cc
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": params.nc
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
            
            let data = JSON.parse(response.ExtraData)?.Location;
            this.locationForm.patchValue({
              LocationAccGroupCode: data.LocationAccGroupCode,
              LocationCode: data.LocationCode,
              LocationName: data.LocationName,
              SearchName: data.SearchName,
              Address1: data.Address1,
              Address2: data.Address2,
              City: data.City,
              ZipCode: data.ZipCode,
              State: data.StateCode,
              Country: data.CountryCode,
              ContactPerson: data.ContactPerson,
              MobileNo: data.MobileNo,
              PhoneNo: data.PhoneNo,
              EmailId: data.EmailId,
              TaxType: data.TaxType,
              GSTRegistrationType: data.GSTRegistrationType,
              GSTRegistrationNo: data.GSTRegistrationNo,
              LocationPriceGroup: data.PriceGroup,
              ShipToGSX: data.SHIP_TO_GSX,
              SoldToGSX: data.SOLD_TO_GSX,
              GSXDropOffCode: data?.GSXDropOffCode,
              ParentLocationCode: data?.ParentLocationCode,
              SAPPlantCode : data.SAPPlantCode,
              SAPStorageLocation : data.SAPStorageLocation,
              ProfitCenterCode : data.ProfitCenterCode,
              Region: data.Region,
               GoogleMyBusiness:data.GoogleMyBusiness,
               AppleBusinessConnect:data.AppleBusinessConnect

            })
            this.onCountrySearch({term:"",items:[]})
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


  onStatesSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode: this.location?.CountryCode
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

  onSubmit() {
    
    let dataValue = this.locationForm.value;
    let requestData = [];
    if (dataValue.LocationAccGroupCode ==  "DROPOFF" ){
      if (dataValue.GSXDropOffCode == null || dataValue.GSXDropOffCode == undefined  || dataValue.GSXDropOffCode == ''  ){
        this.toastMessage.error("GSXDropOffCode can't be empty when Dropoff Acc Group selected!")
        return
      }
      if (dataValue.ParentLocationCode == null || dataValue.ParentLocationCode == undefined  || dataValue.ParentLocationCode == ''  ){
        this.toastMessage.error("Parent LocationCode can't be empty when Dropoff Acc Group selected!")
        return
      }
      
    }
    console.log("locationForm ", this.locationForm.value)
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveLocationMaster"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationAccGroupCode",
      "Value": dataValue.LocationAccGroupCode,
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": dataValue.LocationCode,
    });
    requestData.push({
      "Key": "LocationName",
      "Value": dataValue.LocationName,
    });
    requestData.push({
      "Key": "SearchName",
      "Value": dataValue.SearchName
    });
    requestData.push({
      "Key": "Address1",
      "Value": dataValue.Address1
    });
    requestData.push({
      "Key": "Address2",
      "Value": dataValue.Address2
    });
    requestData.push({
      "Key": "City",
      "Value": dataValue.City
    });
    requestData.push({
      "Key": "ZipCode",
      "Value": dataValue.ZipCode
    });

    requestData.push({
      "Key": "StateCode",
      "Value": this.locationForm.controls["State"].value
    });
    requestData.push({
      "Key": "CountryCode",
      "Value": this.locationForm.controls["Country"].value
    });

    requestData.push({
      "Key": "ContactPerson",
      "Value": dataValue.ContactPerson
    });

    requestData.push({
      "Key": "MobileNo",
      "Value": dataValue.MobileNo
    });

    requestData.push({
      "Key": "PhoneNo",
      "Value": dataValue.PhoneNo
    });

    requestData.push({
      "Key": "EmailId",
      "Value": dataValue.EmailId
    });
    requestData.push({
      "Key": "TaxType",
      "Value": this.locationForm.controls["TaxType"].value
    });
    requestData.push({
      "Key": "GSTRegistrationType",
      "Value": this.locationForm.controls["GSTRegistrationType"].value

    });
    requestData.push({
      "Key": "GSTRegistrationNo",
      "Value": dataValue.GSTRegistrationNo
    });
    requestData.push({
      "Key": "PriceGroup",
      "Value": this.locationForm.controls["LocationPriceGroup"].value
    });
    requestData.push({
      "Key": "Ship_To_GSX",
      "Value": dataValue.ShipToGSX
    });
    requestData.push({
      "Key": "Sold_To_GSX",
      "Value": dataValue.SoldToGSX
    });
    requestData.push({
      "Key": "SAPPlantCode",
      "Value": dataValue.SAPPlantCode
    });
    requestData.push({
      "Key": "SAPStorageLocation",
      "Value": dataValue.SAPStorageLocation
    });
    requestData.push({
      "Key": "GSXDropOffCode",
      "Value": dataValue.GSXDropOffCode
    });
    requestData.push({
      "Key": "ParentLocationCode",
      "Value": dataValue.ParentLocationCode
    });
    requestData.push({
      "Key": "ProfitCenterCode",
      "Value": dataValue.ProfitCenterCode
    });
     requestData.push({
      "Key": "Region",
      "Value": dataValue.Region
    });
     
     requestData.push({
      "Key": "GoogleMyBusiness",
      "Value": dataValue.GoogleMyBusiness
    });
     
     requestData.push({
      "Key": "AppleBusinessConnect",
      "Value": dataValue.AppleBusinessConnect
    });
     
    console.log("Request ", requestData);
    // alert("Return On ")
    // return
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toastMessage.success("Data Submitted Successfully!")
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
          console.log(err);
          if(err.includes('"message":"Cannot'))
          {
            this.controlValidations()
          }
        }
      });
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
