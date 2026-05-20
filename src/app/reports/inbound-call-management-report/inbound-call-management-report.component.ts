import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { Columns } from 'src/app/models/column.metadata';

@Component({
  selector: 'app-inbound-call-management-report',
  templateUrl: './inbound-call-management-report.component.html',
  styleUrls: ['./inbound-call-management-report.component.sass']
})
export class InboundCallManagementReportComponent implements OnInit {

  UniqueId: any
  CallStatus: string
  MobileNo: string;
  LocationCode: string;
  StartDate: any;
  EndDate: any;
  InboundCallManagementList=[]
  StatusDD: string[] = ['OPEN', 'FOLLOW-UP', 'CLOSED', 'CONVERTED-TO-LEAD']
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

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
    private ngxSpinnerService: NgxSpinnerService,
    private datePipe: DatePipe,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private reportService: ReportService,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.GetInboundCallManagementReport('');

  }


  PageChange(event) {
    
    
    switch (event.eventType) {
      case "PageChange":
        this.GetInboundCallManagementReport(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;

      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
    }
  }

  GetInboundCallManagementReport(eventDetail){
   
    
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') || '';
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd') || '';
    

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetInboundCallManagementReport"
    })
    requestData.push({
      "Key": "UniqueId",
      "Value": this.UniqueId == null || this.UniqueId == undefined || this.UniqueId == '' ? '' : this.UniqueId.trim()

    })
    requestData.push({
      "Key": "CallStatus",
      
      "Value": this.CallStatus == null || this.CallStatus == undefined ? '' : this.CallStatus

    })
    requestData.push({
      "Key": "MobileNo",
    
      "Value": this.MobileNo == null || this.MobileNo == undefined || this.MobileNo == '' ? '' : this.MobileNo.trim()

    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode

    })
    
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
    })
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
    })
    requestData.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
    requestData.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
    });
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
            console.log(response,150)
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.InboundCallManagementList = Array.isArray(data?.CallManagementList?.CallManagement)
                ? data?.CallManagementList?.CallManagement
                : [data?.CallManagementList?.CallManagement];
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.InboundCallManagementList });
              this.ngxSpinnerService.hide()

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

  ExportInboundCallManagementReport(){
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    if (startformattedDate == null || startformattedDate == undefined || startformattedDate == '') {
      this.toast.error('StartDate  cannot be empty !')
      return
    }
    if (endformattedDate == null || endformattedDate == undefined || endformattedDate == '') {
      this.toast.error('End Date cannot be empty !')
      return
    }
    if (endformattedDate < startformattedDate) {
      this.toast.error('End Date Cannot Be Less Than Start Date')
      return
    }

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportInboundCallManagementReport"
    })
    requestData.push({
      "Key": "UniqueId",
      "Value": this.UniqueId == null || this.UniqueId == undefined || this.UniqueId == '' ? '' : this.UniqueId.trim()

    })
    requestData.push({
      "Key": "CallStatus",
      "Value": this.CallStatus == null || this.CallStatus == undefined ? '' : this.CallStatus
    })
    requestData.push({
      "Key": "MobileNo",
      "Value": this.MobileNo == null || this.MobileNo == undefined || this.MobileNo == '' ? '' : this.MobileNo.trim()
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
    })
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
    });
    

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
            const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
            let response = JSON.parse(Value.toString());
            const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
            var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const fileName = `IB_Call_ManagementReport_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
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
