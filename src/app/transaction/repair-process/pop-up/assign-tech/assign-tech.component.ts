import { Component, OnInit , Input , Output , EventEmitter } from '@angular/core';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { CaseDetail } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import * as glob from "../../../../config/global";
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
@Component({
  selector: 'app-assign-tech',
  templateUrl: './assign-tech.component.html',
  styleUrls: ['./assign-tech.component.sass']
})
export class AssignTechComponent implements OnInit {

  AssignTechFlag = 1;
  assignTechForm : FormGroup
  technicians: DropDownValue = DropDownValue.getBlankObject();
  ParentLocationCode
  ParentLocationDD:  DropDownValue = DropDownValue.getBlankObject();
  @Output() AssignTechFlagSet = new EventEmitter<any>();

  @Input() repa: CaseDetail;

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private ngxSpinnerService:NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.assignTechForm = this.formBuilder.group({
      techSelect: [null, Validators.required],
      remark: [null, Validators.required],
    });
    this.onLocationSearch({ term: "", item: null }) 
    this.onTechnicianSearch({ term: "", item: null })
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.LocationDropoff, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      DocType: 'ASP'
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ParentLocationDD = value;
        }
      },
      error: (err) => {
        this.ParentLocationDD = DropDownValue.getBlankObject();
      }
    });
  }


  onSubmit() {
    const assign = this.assignTechForm.value
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveAssignTechDetails"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.repa.LocationCode
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "TechnicianCode",
      "Value": assign.techSelect
    });
    requestData.push({
      "Key": "Remark",
      "Value": assign.remark
    });
    requestData.push({
      "Key": "ParentLocationCode",
      "Value": this.ParentLocationCode == null || this.ParentLocationCode ==undefined ? '' : this.ParentLocationCode
    });

    let rawData = {
      "rows": []
    }
   
    rawData.rows.push({
        "row": [
          {
            "CaseGUID": this.repa.CaseGUID
          }
        ]
      });
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
                this.toaster.success('Submitted Succesfully')
                 ;
                var asgtech = JSON.parse(response.ExtraData);
                this.AssignTechFlagSet.emit(asgtech?.ASGTECH);
                this.ngxSpinnerService.hide()
              }
              else {
              }
            } catch (ext) {
              console.log(ext);
            }
  
          },
          error: err => {
            console.log(err);
            this.ngxSpinnerService.hide()
          }
        }
      );
  }

  onTechnicianSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.Technician, $event.term, {
      LocationCode: this.repa.LocationCode
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
  
}
