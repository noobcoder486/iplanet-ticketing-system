import { Component, Input, OnInit } from '@angular/core';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import xml2js from "xml2js";


@Component({
  selector: 'app-escalation-tracker',
  templateUrl: './escalation-tracker.component.html',
  styleUrls: ['./escalation-tracker.component.css']
})
export class EscalationTrackerComponent implements OnInit {

  EscalationTrackerObject: any[] = [];
  filteredEscalationTrackerObject: any[] = [];
  currentDate: Date;
  Location: DropDownValue = DropDownValue.getBlankObject();
  LocationCode: string;
  TicketStatus: string;
  LocationData = new Set<string>();
  params
  TicketCode: string;
  CreatedDate: string;
  errorMessage: string;


  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
  ) { }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.onLocationSearch({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.trackerguid != null && this.params.trackerguid !== undefined) {

      this.GetEscalationTrackerObject();
    }
  }

  GetEscalationTrackerObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetEscalationTrackerObject"
    });
    requestData.push({
      "Key": "EscalationTrackerGUID",
      "Value": this.params.trackerguid
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.ngxservice.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          console.log('Response from backend:', Value);
          this.ngxservice.hide();
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("After SP:- ", data);
              if (data?.Totalrecords < 1) {
                this.toastMessage.info("No Record Found");
                return;
              } else {
                this.filteredEscalationTrackerObject = Array.isArray(data.CommunicationList?.Communication) ? data.CommunicationList?.Communication : [data.CommunicationList?.Communication];
                // console.log("filteredEscalationTrackerObject", this.filteredEscalationTrackerObject);
                this.TicketCode = data.TicketId;
                this.LocationCode = data.LocationCode;
                this.TicketStatus = data.TicketStatus;
                this.CreatedDate = data.CreatedDate;

              }
            }
          } catch (ext) {
            this.ngxservice.hide();
            console.log(ext);
          }
        },
        error: err => {
          this.ngxservice.hide();
          console.log(err);
        }
      }
    );
  }

  GetLocationDataXML() {
    let rawData = {
      rows: [],
    };
    for (let item of this.LocationData) {
      rawData.rows.push({
        row: {
          LocationCode: item,
        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
      })
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.Location = value;
          }
        },
        error: (err) => {
          this.Location = DropDownValue.getBlankObject();
        },
      });
  }

  asignLocation() {
    if (this.LocationCode) {
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "UpdateEscalationTracker"
      });
      requestData.push({
        "Key": "EscalationTrackerGUID",
        "Value": this.params.trackerguid
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationCode
      });
        
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode === '0') {
              this.toastMessage.success("Location Asign Successfully");
              
            } else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                if (err) {
                  console.error("Error parsing XML:", err);
                  this.toastMessage.error("An error occurred while processing your request.");
                } else {
                  response['errorMessageJson'] = result;
                  this.handleError(response);
                }
              });
            }
          },
          error: err => {
            if (err.includes('"message":"Cannot')) {
            }
          }
        });
    } else {
      this.toastMessage.error("Please select a location")
    }
  }

 

  handleError(response: any) {
    let errors = response.errorMessageJson.errorList.errorMessage;
    errors.forEach((error: any) => {
      let errorMessage = error.ERRORMESSAGE[0];
      this.toastMessage.error(errorMessage);
      console.error("Error:", errorMessage);
    });
  }




}