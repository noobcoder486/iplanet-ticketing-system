import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';

@Component({
  selector: 'app-ticketing-report',
  templateUrl: './ticketing-report.component.html',
  styleUrls: ['./ticketing-report.component.sass']
})
export class TicketingReportComponent implements OnInit {

  constructor(
    private datePipe: DatePipe,
    private ngxSpinnerService: NgxSpinnerService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private reportService: ReportService
  ) { this.jobPagination = new PaginationMetaData() }

  typeSelected = 'ball-clip-rotate';
  StartDate: any;
  EndDate: any;
  TicketNo: string = '';
  CaseId: string = '';
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>({ totalRecord: 0, Data: [] });

  results = [];
  jobPagination: PaginationMetaData;

  columns: Columns[] = [
    { datatype: "STRING", field: "TicketId", title: "Ticket Id" },
    { datatype: "STRING", field: "CaseId", title: "Case Id" },
    { datatype: "STRING", field: "CustomerName", title: "Customer Name" },
    { datatype: "STRING", field: "ContactNo", title: "Contact No" },
    { datatype: "STRING", field: "SerialNo", title: "Serial No" },
    { datatype: "STRING", field: "Issue", title: "Issue" },
    { datatype: "STRING", field: "Location", title: "Location" },
    { datatype: "STRING", field: "EngineerName", title: "Engineer Name" },
    { datatype: "STRING", field: "Status", title: "Status" },
    { datatype: "STRING", field: "RepairType", title: "Repair Type" },
    { datatype: "STRING", field: "WarrantyStatus", title: "Warranty Status" },
    { datatype: "STRING", field: "FirstResponseTime", title: "First Response Time" },
    { datatype: "STRING", field: "DiagnosticsTime", title: "Diagnostics Time" },
    { datatype: "STRING", field: "PartFixingTime", title: "Part Fixing Time" },
    { datatype: "STRING", field: "ClosureDate", title: "Closure Date" }
  ];

  ngOnInit(): void {
  }

  buildExportXml(): string {
    let rows = '<rows>';
    this.results.forEach(item => {
      rows += '<row>';
      rows += `<TicketId>${this.escapeXml(item.TicketId)}</TicketId>`;
      rows += `<CaseId>${this.escapeXml(item.CaseId)}</CaseId>`;
      rows += `<CustomerName>${this.escapeXml(item.CustomerName)}</CustomerName>`;
      rows += `<ContactNo>${this.escapeXml(item.ContactNo)}</ContactNo>`;
      rows += `<SerialNo>${this.escapeXml(item.SerialNo)}</SerialNo>`;
      rows += `<Issue>${this.escapeXml(item.Issue)}</Issue>`;
      rows += `<Location>${this.escapeXml(item.Location)}</Location>`;
      rows += `<EngineerName>${this.escapeXml(item.EngineerName)}</EngineerName>`;
      rows += `<Status>${this.escapeXml(item.Status)}</Status>`;
      rows += `<RepairType>${this.escapeXml(item.RepairType)}</RepairType>`;
      rows += `<WarrantyStatus>${this.escapeXml(item.WarrantyStatus)}</WarrantyStatus>`;
      rows += `<FirstResponseTime>${this.escapeXml(item.FirstResponseTime)}</FirstResponseTime>`;
      rows += `<DiagnosticsTime>${this.escapeXml(item.DiagnosticsTime)}</DiagnosticsTime>`;
      rows += `<PartFixingTime>${this.escapeXml(item.PartFixingTime)}</PartFixingTime>`;
      rows += `<ClosureDate>${this.escapeXml(item.ClosureDate)}</ClosureDate>`;
      rows += '</row>';
    });
    rows += '</rows>';
    return rows;
  }

  escapeXml(value: any): string {
    if (value == null || value == undefined) {
      return '';
    }
    return value.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  exportReportData() {
    if (this.results.length == 0) {
      this.toast.error("No Data To Export")
      return;
    }
    const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
    let requestData = []
    this.ngxSpinnerService.show();
    requestData.push({
      "Key": "APIType",
      "Value": "ExportTicketCaseReportList"
    })
    requestData.push({
      "Key": "Data",
      "Value": this.buildExportXml()
    })

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe({
      next: (Value) => {
        try {
          let response = JSON.parse(Value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.href = url;
          const fileName = `Ticketing_Report_${startformattedDate}_to_${endformattedDate}.xls`;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
          this.ngxSpinnerService.hide();
        } catch (ext) {
          this.ngxSpinnerService.hide();
        }
      },
      error: err => {
        this.ngxSpinnerService.hide()
      }
    });
  }

 getReportData(eventDetail) {
    this.results = [];
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    let requestData = [];
    this.ngxSpinnerService.show();
    
    requestData.push({ "Key": "APIType", "Value": "GenerateTicketReportList" });
    requestData.push({ "Key": "TicketNo", "Value": this.TicketNo ? this.TicketNo.trim() : "" });
    requestData.push({ "Key": "CaseId", "Value": this.CaseId ? this.CaseId.trim() : "" });
    requestData.push({ "Key": "StartDate", "Value": startformattedDate ? startformattedDate : "" });
    requestData.push({ "Key": "EndDate", "Value": endformattedDate ? endformattedDate : "" });
    requestData.push({ "Key": "PageNo", "Value": eventDetail.pageIndex == null ? "1" : (eventDetail.pageIndex + 1).toString() });
    requestData.push({ "Key": "PageSize", "Value": eventDetail.pageSize == null ? "10" : eventDetail.pageSize.toString() });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        try {
          let response = JSON.parse(Value.toString());
          let rawData = response?.ExtraData || response?.extraData;
          
          if (rawData) {
            let data = JSON.parse(rawData);
            if (data && data.Data) {
              let ticketReportList = data.Data.TicketReportList;
              let tempResults = [];

              if (ticketReportList && ticketReportList.TicketDetail) {
                if (Array.isArray(ticketReportList.TicketDetail)) {
                  tempResults = ticketReportList.TicketDetail;
                } else {
                  tempResults.push(ticketReportList.TicketDetail);
                }
              }

              this.results = tempResults;
              let recordCount = data.Data.TotalRecords !== undefined ? Number(data.Data.TotalRecords) : this.results.length;
              
              this.detail.next({ totalRecord: recordCount, Data: this.results });
            }
          }
          this.ngxSpinnerService.hide();
          setTimeout(() => { this.hideSpinnerEvent.next(); }, 200);
        } catch (ext) {
          this.ngxSpinnerService.hide();
          this.hideSpinnerEvent.next();
        }
      },
      error: err => {
        this.ngxSpinnerService.hide();
        this.hideSpinnerEvent.next();
      }
    });
  }

  PageChange(event) {
    switch (event.eventType) {
      case "PageChange":
        this.getReportData(event.eventDetail);
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500);
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500);
        break;
    }
  }
}