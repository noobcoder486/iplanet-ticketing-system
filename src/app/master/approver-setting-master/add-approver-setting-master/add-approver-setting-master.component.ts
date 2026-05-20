import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-add-approver-setting-master',
  templateUrl: './add-approver-setting-master.component.html',
  styleUrls: ['./add-approver-setting-master.component.sass']
})
export class AddApproverSettingMasterComponent implements OnInit {

 
  constructor(
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  approvalSettingForm: FormGroup
  LocationCode: string;
  finalSelectedElements: any[] = [];
  params: any;
  formTitle: string = "Add"
  errorMessage: string;
  LocationAccGroup: DropDownValue = this.getBlankObject();
  ProcessDD : any = ["DiscountApproval","RefundApproval","SalesReturnApproval"]
  ApprovalLevelDD : any = ["L1","L2","L3"]
  ApprovalPerson: string; 
  ApprovalLevel:string;
  Process:string;

  ngOnInit(): void {
    // this.approvalSettingForm = this.formBuilder.group({
    //   ApprovalPerson: [null, Validators.required],
    //   LocationCode: [null, Validators.required],
    //   Process :  [null, Validators.required],
    //   ApprovalLevel:  [null, Validators.required],
    // })
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.locationcode != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.approvalSettingForm.controls["Process"].disable()
      this.approvalSettingForm.controls["LocationCode"].disable()
      this.approvalSettingForm.controls["ApprovalLevel"].disable()
      
    }
     this.onLocationAccGroupCode({ term: '', items: [] })

  }

  // controlValidations() {
  //   let returnVal = true 
  //   Object.keys(this.approvalSettingForm.controls).forEach(field => {
  //     let controlValue = this.approvalSettingForm.get(field).value
  //     if (controlValue == null || controlValue == undefined) {
  //       this.toastMessage.error(field + " Cannot be Empty")
  //       returnVal = false
  //     }
  //   })
  //   return returnVal
  // }

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
      "Key": "ApprovalLevel",
      "Value": this.params.al
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    });
    requestData.push({
      "Key": "Process",
      "Value": this.params.pc
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          console.log("*******",response)
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.UserLocation;
            
            this.approvalSettingForm.patchValue({
              ApprovalPerson: data.ApprovalPerson,
              LocationCode: data.LocationCode,
              Process: data.Process,
              ApprovalLevel: data.ApprovalLevel,

            })
            this.onLocationAccGroupCode({ term: '', items: [] })
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

  returnPrevious() {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/approval-setting-master')
  }

  onSubmit() {
    // Populate finalSelectedElements
    this.finalSelectedElements.push({
      LocationCode: this.LocationCode,
      Process: this.Process,
      ApprovalPerson: this.ApprovalPerson,
      ApprovalLevel: this.ApprovalLevel
    });

    // Log to check contents before XML generation
    console.log("Final Selected Elements:", this.finalSelectedElements);

    // Generate and log XML
    // const xml = this.saveApprovalXml();
    // console.log("Generated XML:", xml);

    // Proceed to save data
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveApprovalSettingMaster"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null ? "" : this.LocationCode
    });
    requestData.push({
      "Key": "Data",
      "Value": this.saveApprovalXml()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        console.log("API Response:", response); // Log API response
        if (response.ReturnCode === "0") {
          this.toastMessage.success("Added Successfully");
          this.returnPrevious();
        } else {
          this.errorMessage = response.ReturnMessage;
          this.handleError(response);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastMessage.error("An error occurred while submitting the form", "Error");
      },
    });
  }

  saveApprovalXml() {
    let rawData = {
      "rows": []
    };

    for (let item of this.finalSelectedElements) {
      rawData.rows.push({
        "row": {
          "LocationCode": item.LocationCode,
          "Process": item.Process,
          "ApprovalPerson": item.ApprovalPerson,
          "ApprovalLevel": item.ApprovalLevel
        }
      });
    }

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Part XML:- ", xml);
    return xml;
  }  

  getErrorMessage(control: string): string {
    let formControl = this.approvalSettingForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let error =
      response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
    error.forEach((err) => {
      this.toastMessage.error("Error:- ", err);
    });
  }
  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
