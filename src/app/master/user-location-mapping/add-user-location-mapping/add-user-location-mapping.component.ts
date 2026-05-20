import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserLocation } from './user-location-mapping.metadata';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-add-user-location-mapping',
  templateUrl: './add-user-location-mapping.component.html',
  styleUrls: ['./add-user-location-mapping.component.css']
})
export class AddUserLocationMappingComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  userLocationForm: FormGroup;
  params: any;
  formTitle: string = "Add";
  LocationCode: any[] = [];
  LocationCodeList
  isEdit: boolean = false
  UserName: string;
  errorMessage: string;
  LocationAccGroup: DropDownValue = this.getBlankObject();

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.locationcode != undefined) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true
    }
    this.onLocationAccGroupCode({ term: '', items: [] });
  }

  onLocationAccGroupCode($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location4All, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationAccGroup = value;
        }
      },
      error: (err) => {
        this.LocationAccGroup = this.getBlankObject();
      }
    });
  }

  getData() {
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetUserLocationObject"
    });
    requestData.push({
      "Key": "UserName",
      "Value": this.params.nc
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        console.log("Response: ", response);
        if (response.ReturnCode == '0') {
          let data = JSON.parse(response.ExtraData)?.UserLocation;
          this.userLocationForm.patchValue({
            UserName: data.UserName,
            locationCode: data.LocationCode,
            IsActive: data.isActive,
          });
          this.onLocationAccGroupCode({ term: '', items: [] });
        } else {
          console.error("Error fetching data");
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  returnPrevious() {
    this.route.navigateByUrl('/auth/' + glob.getCompanyCode() + '/user-location-mapping');
  }

  onSubmit() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveUserLocationMapping"
    });
    requestData.push({
      "Key": "Data",
      "Value": this.SaveUserLocationMappingXML()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };
    console.log("Content Request: ", contentRequest);

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        console.log("Response: ", value);
        let response = JSON.parse(value.toString());
        if (response.ReturnCode === '0') {
          this.toastMessage.success("Form Submitted Successfully");
          this.returnPrevious();
        } else {
          this.errorMessage = response.ReturnMessage;
          console.log("Error Response: ", response);
          this.handleError(response);
        }
      },
      error: err => {
        console.error("Submission Error: ", err);
      }
    });
  }


  SaveUserLocationMappingXML() {
    

    let rawData = {
      "rows": []
    }
    for (let item of this.LocationCodeList) {
      rawData.rows.push({
        "row": {
          "UserName":  this.UserName,
          "LocationCode": item,
          "isActive": "1"
        }
      })

    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("Part XML:- ",xml);
    return xml;


  }





  getErrorMessage(control: string): string {
    let formControl = this.userLocationForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    if (response.ErrorMessage) {
      this.toastMessage.error(response.ErrorMessage);
    } else if (response.ERRORLIST && response.ERRORLIST.ERRORMESSAGE) {
      const errorMessages = response.ERRORLIST.ERRORMESSAGE;
      errorMessages.forEach((errMessage) => {
        this.toastMessage.error(errMessage.ERRORMESSAGE);
      });
    } else {
      this.toastMessage.error("An unexpected error occurred.");
    }
  }


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
}

