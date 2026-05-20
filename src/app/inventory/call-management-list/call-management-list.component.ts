import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { HttpClient } from '@angular/common/http';
import { Columns } from 'src/app/models/column.metadata';

@Component({
  selector: 'app-call-management-list',
  templateUrl: './call-management-list.component.html',
  styleUrls: ['./call-management-list.component.sass']
})
export class CallManagementListComponent implements OnInit {
  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  EmailId: string;
  MobileNo: string;
  UniqueId: any
  LocationCode: string;
  StatusDD: string[] = ['OPEN', 'FOLLOW-UP', 'CLOSED', 'CONVERTED-TO-LED']
  CallStatus: string
  CallManagementList: any[] = [];
  errorMessage: string;
  TotalRecords: number = 0
  Spinner: boolean = false;

  gridDetailColumns: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  columns: Columns[] =
    [
      { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
      { datatype: "STRING", field: "UniqueId", title: "UniqueId" },
      { datatype: "STRING", field: "CallDate", title: "Call Date" },
      { datatype: "STRING", field: "CreatedDate", title: "Created Date" },
      { datatype: "STRING", field: "LocationCode", title: "Location Code" },
      { datatype: "STRING", field: "CallStatus", title: "Call Status" },
      { datatype: "STRING", field: "ParentDetails", title: "Parent Details" },
      { datatype: "STRING", field: "CallType", title: "Call Type" },
      { datatype: "STRING", field: "CallCategory", title: "Call Category" },
      { datatype: "STRING", field: "CustomerName", title: "Customer Name" },
      { datatype: "STRING", field: "CallDisposition", title: "Call Disposition" },
      { datatype: "STRING", field: "Notes", title: "Notes" },
    ];

  constructor(
    private route: Router,
    private dialog: MatDialog,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private reportService: ReportService,
    private http: HttpClient,
    private gsxService: GsxService
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.GetCallManagementList('')

  }

  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];


  actionEmit(event) {
    console.log("action Emit", event);
    if (event.action == 'EDIT') {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/call-management'], { queryParams: { CallManagementDetailGUID: event.row.CallManagementDetailGUID } })
    }
  }
  PageChange(event) {
    
    switch (event.eventType) {
      case "PageChange":
        this.GetCallManagementList(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;

      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
    }
  }

  GetCallManagementList(eventDetail) {
    
    this.CallManagementList = []


    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetCallManagementList"
    })
    requestdata.push({
      "Key": "CallStatus",
      "Value": this.CallStatus == null || this.CallStatus == undefined ? '' : this.CallStatus
    })
    requestdata.push({
      "Key": "UniqueId",
      "Value": this.UniqueId == null || this.UniqueId == undefined || this.UniqueId == '' ? '' : this.UniqueId.trim()
    });
    requestdata.push({
      "Key": "MobileNo",
      "Value": this.MobileNo == null || this.MobileNo == undefined || this.MobileNo == '' ? '' : this.MobileNo.trim()
    });
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    });
    requestdata.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
    requestdata.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
    });

    this.ngxSpinnerService.show()

    let strRequestData = JSON.stringify(requestdata);
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
              let data = JSON.parse(response?.ExtraData)
              if (data.TotalRecords == "0") {
                this.toast.error("No Data Found")

              }
              if (Array.isArray(data?.CallManagementList?.CallManagement)) {
                this.CallManagementList = data?.CallManagementList?.CallManagement
              }
              else {
                this.CallManagementList.push(data?.CallManagementList?.CallManagement)
              }
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.CallManagementList });
              this.ngxSpinnerService.hide()

            }
          } catch (ext) {
            this.ngxSpinnerService.hide()
          }
        },
        error: err => {


          console.log(err)
          this.ngxSpinnerService.hide()
        }

      }
    );
  }
  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

}
