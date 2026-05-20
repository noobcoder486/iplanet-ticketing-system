import { Component, OnInit } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global';
import { Columns } from 'src/app/models/column.metadata';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';

@Component({
  selector: 'app-customer-ledger-report',
  templateUrl: './customer-ledger-report.component.html',
  styleUrls: ['./customer-ledger-report.component.css']
})
export class CustomerLedgerReportComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  actionDetails: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  StartDate: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate: any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  results = [];
  CaseIdData: string;
  screenDetail: any;
  GSXStatusDD: DropDownValue = DropDownValue.getBlankObject();
  GSXStatus: string

  columns: Columns[] = [
    { datatype: "STRING", field: "CompanyCode", title: "CompanyCode" },
    { datatype: "STRING", field: "CustomerCode", title: "CustomerCode" },
    { datatype: "STRING", field: "TotalDebitAmount", title: "TotalDebitAmount" },
    { datatype: "STRING", field: "TotalCreditAmount", title: "TotalCreditAmount" },
    { datatype: "STRING", field: "CurrencyCode", title: "CurrencyCode" },
    { datatype: "STRING", field: "TransactionCode", title: "TransactionCode" },
    { datatype: "STRING", field: "TransactionType", title: "TransactionType" },
    { datatype: "STRING", field: "DebitAmount", title: "DebitAmount" },
    { datatype: "STRING", field: "CreditAmount", title: "CreditAmount" },
  ];
  CustomerCode: null;
  CompanyCode: null;
  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onGSXStatusSearch({ term: "", item: [] });
  }

  actionEmit($event) {

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

  onGSXStatusSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.GSXRepairStatus, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.GSXStatusDD = value;
        }
      },
      error: (err) => {
        this.GSXStatusDD = DropDownValue.getBlankObject();
      }
    });
  }

  getReportData() {
     
    this.results = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetCustomerLedgerReportList"
        })
        // requestData.push({
        //   "Key": "CompanyCode",
        //   "Value": this.CompanyCode == null || this.CompanyCode == undefined ? '' : this.CompanyCode
        // })
        requestData.push({
          "Key": "CustomerCode",
          "Value": this.CustomerCode == null || this.CustomerCode == undefined ? '' : this.CustomerCode
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
        
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (Value) => {
               
              try {
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  
                  if (Array.isArray(data?.ReportData?.Report)) {
                    this.results = data?.ReportData?.Report
                  }
                  else {
                    this.results.push(data?.ReportData?.Report)
                  }
                  console.log(this.results)
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
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
        let requestData=[]
        requestData.push({
          "Key": "APIType",
          "Value": "GetCustomerLedgerList"
        })
        requestData.push({
          "Key": "CompanyCode",
          "Value": this.CompanyCode == null || this.CompanyCode == undefined ? '' : this.CompanyCode
        })
        requestData.push({
          "Key": "CustomerCode",
          "Value": this.CustomerCode == null || this.CustomerCode == undefined ? '' : this.CustomerCode
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
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.ReportData?.Report });
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



  exportReportData() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      let requestData = []
      this.ngxSpinnerService.show();
      requestData.push({
        "Key": "APIType",
        "Value": "ExportCustomerLedgerReportList"
      })
      requestData.push({
        "Key": "CustomerCode",
        "Value": this.CustomerCode == null || this.CustomerCode == undefined ? '' : this.CustomerCode
      })
      requestData.push({
        "Key": "StartDate",
        "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
      })
      requestData.push({
        "Key": "EndDate",
        "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
      })
      // requestData.push({
      //   "Key": "CaseId",
      //   "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
      // })
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
      
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
        {
          next: (Value) => {
            this.ngxSpinnerService.hide()
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
              const fileName = `Cancellation_Report_${startformattedDate}_to_${endformattedDate}.xls`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();

            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
          }
        }
      );
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }

  }

}