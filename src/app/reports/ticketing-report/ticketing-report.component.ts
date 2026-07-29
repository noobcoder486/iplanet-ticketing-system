import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import * as glob from 'src/app/config/global';
import * as XLSX from 'xlsx';

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
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef

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
    { datatype: "STRING", field: "DiagnosticTime", title: "Diagnostic Date" },
    { datatype: "STRING", field: "DiagnosticTAT", title: "Diagnostic TAT" },
    { datatype: "STRING", field: "PartFixingTime", title: "Part Fixing Time" },
    { datatype: "STRING", field: "ClosureDate", title: "Closure Date" }
  ];

  ngOnInit(): void {


  }

  buildReportRequestData(pageNo: number, pageSize: number) {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');

    let requestData = [];
    requestData.push({ "Key": "APIType", "Value": "GenerateTicketReportList" });
    requestData.push({ "Key": "TicketNo", "Value": this.TicketNo || "" });
    requestData.push({ "Key": "CaseId", "Value": this.CaseId || "" });
    requestData.push({ "Key": "StartDate", "Value": startformattedDate || "" });
    requestData.push({ "Key": "EndDate", "Value": endformattedDate || "" });
    requestData.push({ "Key": "PageNo", "Value": pageNo.toString() });
    requestData.push({ "Key": "PageSize", "Value": pageSize.toString() });
    requestData.push({ "Key": "CompanyCode", "Value": glob.getCompanyCode() });

    let strRequestData = JSON.stringify(requestData);
    return { "content": strRequestData };
  }

  extractTicketDetailList(rawData: string) {
    let tempResults = [];
    if (rawData) {
      let data = JSON.parse(rawData);
      if (data && data.TicketReportList) {
        let ticketReportList = data.TicketReportList;
        if (ticketReportList && ticketReportList.TicketDetail) {
          if (Array.isArray(ticketReportList.TicketDetail)) {
            tempResults = ticketReportList.TicketDetail;
          } else {
            tempResults.push(ticketReportList.TicketDetail);
          }
        }
      }
    }
    return tempResults;
  }

  getReportData(eventDetail: any) {
    this.results = [];

    const pageNo = eventDetail?.PageNo || eventDetail?.PageIndex || 1;
    const pageSize = eventDetail?.PageSize || 10;

    let contentRequest = this.buildReportRequestData(pageNo, pageSize);

    this.ngxSpinnerService.show();

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value: any) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let rawData = response?.ExtraData || response?.extraData;
            let data = rawData ? JSON.parse(rawData) : null;
            let tempResults = this.extractTicketDetailList(rawData);

            this.ngZone.run(() => {
              this.results = tempResults;
              let recordCount = data?.TotalRecords !== undefined ? Number(data.TotalRecords) : this.results.length;
              this.detail.next({ totalRecord: recordCount, Data: this.results });
              this.cdr.detectChanges();
            });
          }
          this.ngxSpinnerService.hide();
          setTimeout(() => { this.hideSpinnerEvent.next(); }, 200);
        } catch (ext) {
          this.ngxSpinnerService.hide();
          this.hideSpinnerEvent.next();
        }
      }
    });
  }

  exportReportData() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');

    let contentRequest = this.buildReportRequestData(1, 100000);

    this.ngxSpinnerService.show();

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value: any) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let rawData = response?.ExtraData || response?.extraData;
            let allResults = this.extractTicketDetailList(rawData);

            if (allResults.length == 0) {
              this.toast.error("No Data To Export");
              this.ngxSpinnerService.hide();
              return;
            }

            const exportRows = allResults.map(item => ({
              "Ticket Id": item.TicketId || "",
              "Case Id": item.CaseId || "",
              "Customer Name": item.CustomerName || "",
              "Contact No": item.ContactNo || "",
              "Serial No": item.SerialNo || "",
              "Issue": item.Issue || "",
              "Location": item.Location || "",
              "Engineer Name": item.EngineerName || "",
              "Status": item.Status || "",
              "Repair Type": item.RepairType || "",
              "Warranty Status": item.WarrantyStatus || "",
              "First Response Time": item.FirstResponseTime || "",
              "Diagnostic Time": item.DiagnosticTime || "",
              "Diagnostic TAT": item.DiagnosticTAT || "",
              "Part Fixing Time": item.PartFixingTime || "",
              "Closure Date": item.ClosureDate || ""
            }));

            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "TicketingReport");

            const fileName = `Ticketing_Report_${startformattedDate}_to_${endformattedDate}.xlsx`;
            XLSX.writeFile(wb, fileName);

            this.toast.success("Report Exported Successfully");
          } else {
            this.toast.error("No Data To Export");
          }
          this.ngxSpinnerService.hide();
        } catch (ext) {
          this.ngxSpinnerService.hide();
          this.toast.error("Export Failed");
        }
      },
      error: err => {
        this.ngxSpinnerService.hide();
        this.toast.error("Export Failed");
      }
    });
  }

  PageChange(event: any) {
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