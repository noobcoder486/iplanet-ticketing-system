import { Component, OnInit } from '@angular/core';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DatePipe } from '@angular/common';
import { Columns } from 'src/app/models/column.metadata';
import * as glob from 'src/app/config/global';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { BehaviorSubject } from 'rxjs';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-referral-details-report',
  templateUrl: './referral-details-report.component.html',
  styleUrls: ['./referral-details-report.component.css']
})
export class ReferralDetailsReportComponent implements OnInit {

  InvoiceDocTypeList =[
    {Id:'DSALES' ,TEXT:'DSALES'},
    {Id:'RSALES' , TEXT:'RSALES'}
  ]
  Location: any
  CaseID: any
  InvoiceCode: any
  InvoiceDocType: any
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  StartDate: any
  EndDate: any
  jobPagination: PaginationMetaData;
  results =[];
  columns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "ReferralName", title: "Referral Name" },
    { datatype: "STRING", field: "ReferralMobileNo", title: "Referral Mobile No" },

    { datatype: "STRING", field: "CaseId", title: "CaseId" },
    { datatype: "STRING", field: "InvoiceCode", title: "Invoice Code" },
    { datatype: "STRING", field: "InvoiceDocType", title: "Invoice DocType" },

    { datatype: "STRING", field: "ReferralCreatedDate", title: "Referral Created Date" },
    { datatype: "STRING", field: "ReferralCreatedBy", title: "Referral Created By" },
    ]
    


  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private datePipe: DatePipe,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private toast: ToastrService,

  ) { this.jobPagination = new PaginationMetaData(); }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    //  this.getReportData()
    
  }

  ExportReferralDetailsFunc() {
    
    if (this.StartDate == null || this.StartDate == undefined || this.StartDate == '') {
      this.toast.error('StartDate  cannot be empty !')
      return
    }
    if (this.EndDate == null || this.EndDate == undefined || this.EndDate == '') {
      this.toast.error('End Date cannot be empty !')
      return
    }
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportReferralDetails"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.Location == null || this.Location == undefined ? '' : this.Location
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
      "Key": "CaseID",
      "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID
    })
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
    })
    requestData.push({
      "Key": "InvoiceDocType",
      "Value": this.InvoiceDocType == null || this.InvoiceDocType == undefined ? '' : this.InvoiceDocType
    })

    
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

            // Create a download link
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const fileName = `ReferralDetails_Report_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
            // this.ngxSpinnerService.hide();
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
          // this.ngxSpinnerService.hide()
        }
      }
    );
  }



  getReportData() {
    this.results = [];
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetReferralDetailsList"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.Location == null || this.Location == undefined ? '' : this.Location
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
      "Key": "CaseID",
      "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID
    })
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
    })
    requestData.push({
      "Key": "InvoiceDocType",
      "Value": this.InvoiceDocType == null || this.InvoiceDocType == undefined ? '' : this.InvoiceDocType
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
              
              if (Array.isArray(data.ReferralData.ReferralReport)) {
                this.results = data.ReferralData.ReferralReport
              }
              else {
                this.results.push(data.ReferralData.ReferralReport)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
              console.log('this.results' , this.results)
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

  loadPageData(event) {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
    
        let requestData = []
        requestData.push({
          "Key": "APIType",
          "Value": "GetReferralDetailsList"
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.Location == null || this.Location == undefined ? '' : this.Location
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
          "Key": "CaseID",
          "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID
        })
        requestData.push({
          "Key": "InvoiceCode",
          "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
        })
        requestData.push({
          "Key": "InvoiceDocType",
          "Value": this.InvoiceDocType == null || this.InvoiceDocType == undefined ? '' : this.InvoiceDocType
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
                  
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data.ReferralData.ReferralReport });
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


  ResetPage() {
    window.location.reload();
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
