import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from "../../config/global";
import { DropDownType } from '../call-login/metadata/request.metadata';
import xml2js from 'xml2js';
@Component({
  selector: 'app-assign-technician',
  templateUrl: './assign-technician.component.html',
  styleUrls: ['./assign-technician.component.sass']
})
export class AssignTechnicianComponent implements OnInit {

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private formBuilder: FormBuilder,) {

    this.jobPagination = new PaginationMetaData();
  }
  assignTechnicianList: any[] = [];
  selectedList: any[] = [];
  assignTechnicianDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  assignTechnicianColumns: Columns[] = [];
  atHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  actionDetails: any[] = [];
  callForm: DropDownValue = DropDownValue.getBlankObject();
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  technicians: DropDownValue = DropDownValue.getBlankObject();
  selectedCallForm: any;
  selectedLocationForJob: any;
  remarkString: string;
  selectedTechnician: any;
  jobPagination: PaginationMetaData;
  atForm: FormGroup;
  msg: string = "Submitting...";

  ngOnInit(): void {
    this.atForm = this.formBuilder.group({
      techSelect: [null, Validators.required],
      remark: [null, Validators.required],
    });
    this.intTable();
    this.onCallFormSearch({ term: "", item: null });
    this.msg = "Submitting...";

  }

  intTable() {
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Customer", "Customername"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Fault Description", "ComplainDesc"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Call Type", "JobTypeDescription"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Case Date", "CaseDate"));
    //this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING","Material Code","MaterialCode"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Material Desc", "MaterialName"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Serial No.", "SerialNo1"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Job Warranty Stuatus.", "JobWarrantyStatusDesc"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "ElsStatus Desc", "ElsStatusDesc"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Remark", "Remark"));
    this.assignTechnicianColumns.push(this.dynamicService.getColumn("STRING", "Job Status", "JobStatus"));

    //this.actionDetails.push({ code: 'select', icon: 'select'});
  }

  getAssignTechnician() {
    let requestData = [];

    requestData.push({
      "Key": "APIType",
      "Value": "GetJob4Assign"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationForJob
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "JobType",
      "Value": this.selectedCallForm
    });

    requestData.push({
      "Key": "SerialNo1",
      "Value": ''
    });

    requestData.push({
      "Key": "caseid",
      "Value": ''
    });

    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            console.log(Value);
            let response = JSON.parse(Value.toString());
            ;
            if (response.ReturnCode == '0') {
              console.log("sucess");
              response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
              if (Array.isArray(response["ExtraDataJSON"]['JobData']) != true) {
                this.assignTechnicianList = [response["ExtraDataJSON"]['JobData']];
              } else {
                this.assignTechnicianList = response["ExtraDataJSON"]['JobData'];
              }
              //console.log(this.assignTechnicianList);
              this.assignTechnicianDetail.next({ totalRecord: this.assignTechnicianList.length, Data: this.assignTechnicianList });
              //console.log(this.assignTechnicianList);
              this.msg = "";
            }
            else {
            }
          } catch (ext) {
            console.log(ext);
            this.assignTechnicianList = [];
            this.assignTechnicianDetail.next({ totalRecord: this.assignTechnicianList.length, Data: this.assignTechnicianList });
          }
        },
        error: err => {
          console.log(err);
          this.assignTechnicianList = [];
          this.assignTechnicianDetail.next({ totalRecord: this.assignTechnicianList.length, Data: this.assignTechnicianList });
        }
      }
    );
  }

  onCallFormSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.callForm, $event.term, {
    }).subscribe({
      next: (value) => {
        console.log("New A", value);
        if (value != null) {
          console.log("New B", value);
          this.callForm = value;
        }
      },
      error: (err) => {
        this.callForm = DropDownValue.getBlankObject();
      }

    });
  }


  onTechnicianSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.Technician, $event.term, {
      LocationCode: this.selectedLocationForJob
    }).subscribe({
      next: (value) => {
        console.log("New A", value);
        if (value != null) {
          console.log("New B", value);
          this.technicians = value;
        }
      },
      error: (err) => {
        this.technicians = DropDownValue.getBlankObject();
      }

    });
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log(value);
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  arrayRemove(arr: any[], value: any) {

    return arr.filter(function (ele) {
      return ele != value;
    });
  }

  actionEmit(event) {
    ;
    switch (event.action) {
      case "ROWSELECT":
        //this.dialogRef.close(event.row);
        console.log("Row selected");
        break;
      case "Delete":
        break;
      case "SELECT-false":
        event.row["selected"] = false;
        let value: any;
        for (let item of this.selectedList) {
          if (item.CaseGUID == event.row.CaseGUID) {
            value = item;
          }
        }
        if (value != null) {
          this.selectedList = this.arrayRemove(this.selectedList, value);
          
        }

        break;
      case "SELECT-true":
        event.row["selected"] = true;
        this.selectedList.push(event.row);
        break;
    }
    console.log("+++",this.selectedList);
  }

  atLoadPageData(details) {

    switch (details.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = details.eventDetail.pageIndex + 1;
        //this.isPageChanges = true;
        break;
      case "Sorting":
        this.jobPagination.SortOrder = details.eventDetail.direction;
        this.jobPagination.Sorting = details.eventDetail.active;
        break;
    }

    setTimeout(() => { this.atHideSpinnerEvent.next(); }, 1);

    //this.getDetail();
  }

  onFormSelect(event) {
    console.log(this.selectedCallForm);
    this.onLocationSearch({ term: "", item: null });
  }

  onLocationSelect(event) {
    this.getAssignTechnician();
    this.onTechnicianSearch({ term: "", item: null });
  }

  groupChildren(obj) {
    for (let prop in obj) {
      if (typeof obj[prop] === 'object') {
        this.groupChildren(obj[prop]);
      } else {
        obj['$'] = obj['$'] || {};
        obj['$'][prop] = obj[prop];
        delete obj[prop];
      }
    }
    return obj;
  }

  onSubmit() {
    this.msg = "Submitting..."
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveAssignTechDetails"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.selectedLocationForJob
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "TechnicianCode",
      "Value": this.selectedTechnician
    });
    console.log(this.remarkString, "this.remarkString");
    console.log(this.atForm.controls["remark"].value, 'remark');
    requestData.push({
      "Key": "Remark",
      "Value": this.atForm.controls["remark"].value
    });

    let rawData = {
      "rows": []
    }
    for (let item of this.selectedList) {
      rawData.rows.push({
        "row": [
          {
            "CaseGUID": item["CaseGUID"]
          }
          
        ]
       
      });
      console.log("++++" , rawData)
    }

    console.log("rawData", rawData);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    requestData.push({
      "Key": "JobDetails",
      "Value": xml
    });
    console.log("rawData xml ", xml);
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            console.log(Value);
            let response = JSON.parse(Value.toString());
            ;
            if (response.ReturnCode == '0') {

              this.atForm.reset();
              this.msg = "";
              this.getAssignTechnician();
            }
            else {
              this.msg = "Error while submitting. Please try again";
            }
          } catch (ext) {
            console.log(ext);
            this.msg = "Error while submitting. Please try again";
          }

        },
        error: err => {
          console.log(err);
          this.msg = "Error while submitting. Please try again";
          this.getAssignTechnician();
        }
      }
    );
  }

}
