import { Component, OnInit } from '@angular/core';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';
import { Columns } from 'src/app/models/column.metadata';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { BehaviorSubject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-quotation-report',
  templateUrl: './quotation-report.component.html',
  styleUrls: ['./quotation-report.component.sass']
})
export class QuotationReportComponent implements OnInit {

  jobPagination: PaginationMetaData;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  LocationCode: any
  StartDate: any;
  EndDate: any
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  CaseID: any;
  results = [];

    columns: Columns[] = [
      { datatype: "STRING", field: "CaseID", title: "CaseID" },
      { datatype: "STRING", field: "QuoteCode", title: "Quote Code" },
      { datatype: "STRING", field: "QuoteDate", title: "Quote Date" },
      { datatype: "STRING", field: "RevenueType", title: "Revenue Type" },
      { datatype: "STRING", field: "ItemCode", title: "Item Code" },
      { datatype: "STRING", field: "ItemDescription", title: "Item Description" },
      { datatype: "STRING", field: "NetAmount", title: "Net Amount" },
      { datatype: "STRING", field: "QuoteAmount", title: "Quote Amount" },
      { datatype: "STRING", field: "QuoteStatus", title: "Quote Status" },
      { datatype: "STRING", field: "lastAction", title: "Last Action" },
  
    ];


  constructor(
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toaster : ToastrService

  ) {
    this.jobPagination = new PaginationMetaData();
  }

  ngOnInit(): void {
    
    this.onLocationSearch({ term: "", item: [] });
    this.GenerateQuotationReport()

  }



  ExportQuotationReport() {
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    if (startformattedDate == null || startformattedDate == undefined || startformattedDate == '') {
      this.toaster.error('StartDate  cannot be empty !')
      return
    }
    if (endformattedDate == null || endformattedDate == undefined || endformattedDate == '') {
      this.toaster.error('End Date cannot be empty !')
      return
    }


    if (endformattedDate < startformattedDate) {
      this.toaster.error('End Date Cannot Be Less Than Start Date')
      return
    }

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportQuotationReport"
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
      "Key": "CaseID",
      "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID.trim()
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const fileName = `Quotation_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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

  GenerateQuotationReport() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    this.ngxSpinnerService.show();
    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetQuotationReport"
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
      "Key": "CaseID",
      "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID.trim()
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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
            this.results = [];
            if (response.ReturnCode == '0') {

              let data = JSON.parse(response?.ExtraData);
               if(data?.TotalRecords == '0' ){
                 this.toaster.error('No Records Found !!')
                  this.ngxSpinnerService.hide()
                 return
              }
              this.results = Array.isArray(data?.QuotationList?.Quotation)
                ? data?.QuotationList?.Quotation
                : [data?.QuotationList?.Quotation];
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
              
              this.ngxSpinnerService.hide()

             
            }
            
            else{
              this.toaster.error('Error While fetching Data')
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
          "Value": "GetQuotationReport"
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
          "Key": "CaseID",
          "Value": this.CaseID == null || this.CaseID == undefined ? '' : this.CaseID.trim()
        })
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
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
                   if(data?.TotalRecords == 0 ){
                   this.toaster.error('No Records Found !!')
                   return
                    }

                  this.detail.next({ totalRecord: data?.TotalRecords, Data: data?.QuotationList?.Quotation });
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
    
  }

}
