import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';

@Component({
  selector: 'app-pinelab-report',
  templateUrl: './pinelab-report.component.html',
  styleUrls: ['./pinelab-report.component.css']
})
export class PinelabReportComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  StartDate: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate: any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isStartDateSelected: boolean;
  isEndDateSelected: boolean;
  CaseIdData: string;
  TransactionReferenceId: string;
  maxDate : Date
  results = [];
  jobPagination: PaginationMetaData;


  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    // private gsxService: GsxService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
  ) { this.jobPagination = new PaginationMetaData(); }


  actionDetails: any[] = [

  ];
  columns: Columns[] = [
    { datatype: "STRING", field: "TransactionNumber", title: "Transaction Number" },
    { datatype: "STRING", field: "SequenceNumber", title: "Sequence Number" },
    { datatype: "STRING", field: "AllowedPaymentMode", title: "Allowed Payment Mode" },
    { datatype: "STRING", field: "MerchantStorePosCode", title: "Merchant Store PosCode" },
    { datatype: "STRING", field: "Amount", title: "Amount" },
    { datatype: "STRING", field: "UserID", title: "UserID" },
    { datatype: "STRING", field: "MachineHardwareID", title: "Machine Hardware ID" },
    { datatype: "STRING", field: "MerchantID", title: "Merchant ID" },
    { datatype: "STRING", field: "SecurityToken", title: "Security Token" },
    { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "IMEI", title: "IMEI" },
    { datatype: "STRING", field: "TransactionReferenceID", title: "Transaction Reference ID" },
    { datatype: "STRING", field: "TransactionStatus", title: "Transaction Status" },
    { datatype: "STRING", field: "TransactionReferenceMessage", title: "Transaction Reference Message" },
    { datatype: "STRING", field: "TransactionSuccessStatus", title: "Transaction Success Status" },
    { datatype: "STRING", field: "TransactionSuccessObject", title: "Transaction Success Object" },
    { datatype: "STRING", field: "PaymentType", title: "Payment Type" },


  ];

  ngOnInit(): void {
    this.maxDate = new Date()
  }

  // getBlankObject(): DropDownValue {
  //   const ddv = new DropDownValue();
  //   ddv.TotalRecord = 0;
  //   ddv.Data = [];
  //   return ddv;
  // }

  ValidateDateRange() {
    if (this.StartDate && this.EndDate && this.StartDate > this.EndDate) {
      this.toast.warning('From Date cannot be greater than To Date')  
    } 
  }

  onFromDateSelected() {
    this.isStartDateSelected = false;
    this.isEndDateSelected = true;
  }

  onToDateSelected() {
    this.isStartDateSelected = true;
    this.isEndDateSelected = false;
  }

  getDistantPastDate(): string {
    const distantPast = new Date();
    distantPast.setFullYear(distantPast.getFullYear() - 100); // Adjust the number of years as needed
    return this.datePipe.transform(distantPast, 'yyyy-MM-dd');
  }


  exportReportData() {
    const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "ExportPinelabTransactionList"
        })
        requestData.push({
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
        requestData.push({
          "Key": "TransactionReferenceId",
          "Value": this.TransactionReferenceId == null || this.TransactionReferenceId == undefined ? "" : this.TransactionReferenceId
        })
        requestData.push({
          "Key": "StartDate",
          "Value": fromformattedDate == null || fromformattedDate == undefined ? "0" : fromformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key": "PageNo",
          "Value": "1"
        });
        requestData.push({
          "Key": "PageSize",
          "Value": "10"
        });
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        

        // EXPORTPAYMENT Should be change for advance payment report
        this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
                const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `EDC_Machine_Report_${startformattedDate}_to_${endformattedDate}.xls`;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                this.ngxSpinnerService.hide();

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
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }

  }



  getReportData() {
    this.results = []
    const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetPinelabTransactionList"
        })
        requestData.push({
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
        requestData.push({
          "Key": "TransactionReferenceId",
          "Value": this.TransactionReferenceId == null || this.TransactionReferenceId == undefined ? "" : this.TransactionReferenceId
        })
        requestData.push({
          "Key": "StartDate",
          "Value": fromformattedDate == null || fromformattedDate == undefined ? "0" : fromformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key": "PageNo",
          "Value": "1"
        });
        requestData.push({
          "Key": "PageSize",
          "Value": "10"
        });
        console.log("Before Sp", requestData)
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (Value) => {

              this.ngxSpinnerService.hide()
              try {
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  console.log("======", data)
                  if (data.Totalrecords == '0') {
                    this.toast.error("No Record Found!")
                    return
                  }
                  if (Array.isArray(data?.EDCTransactionDetail?.EDCTransactionDetail)) {
                    this.results = data?.EDCTransactionDetail?.EDCTransactionDetail
                  }
                  else {
                    this.results.push(data?.EDCTransactionDetail?.EDCTransactionDetail)
                  }
                  console.log("--------", this.results)
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
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
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }
  }

  loadPageData(event) {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];
        requestData.push({
          "Key": "APIType",
          "Value": "GetPinelabTransactionList"
        })
        requestData.push({
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
        requestData.push({
          "Key": "TransactionReferenceId",
          "Value": this.TransactionReferenceId == null || this.TransactionReferenceId == undefined ? "" : this.TransactionReferenceId
        })
        requestData.push({
          "Key": "StartDate",
          "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key": "PageNo",
          "Value": event.eventDetail.pageIndex + 1
        });
        requestData.push({
          "Key": "PageSize",
          "Value": event.eventDetail.pageSize
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
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.ReportData?.GetBulkReturnReportList });
                }
              } catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              console.log(err);
            }
          }
        );
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }

}
