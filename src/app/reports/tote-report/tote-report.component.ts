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
  selector: 'app-tote-report',
  templateUrl: './tote-report.component.html',
  styleUrls: ['./tote-report.component.sass']
})
export class ToteReportComponent implements OnInit {
 ToteNo: any;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationCode: any;
  StartDate: any;
  EndDate: any;
  jobPagination: PaginationMetaData;
  results = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  BulkReturnId: any;

  columns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "BulkReturnId", title: "Bulk Return Id" },
    { datatype: "STRING", field: "ToteNo", title: "Tote No." },
    { datatype: "STRING", field: "SealNo", title: "Seal No" },
    { datatype: "STRING", field: "DCNo", title: "DC No." },
    { datatype: "STRING", field: "AWBNo", title: "AWB No." },
    { datatype: "STRING", field: "CreatedDate", title: "Bulk Created Date" },
    { datatype: "STRING", field: "BoxTypeDescription", title: "BoxTypeDescription" },

  ];

  constructor(
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
  ) {
    this.jobPagination = new PaginationMetaData();
  }


  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
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


  ExportToteReport() {


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
      "Value": "ExportToteReport"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestData.push({
      "Key": "ToteNo",
      "Value": this.ToteNo == null || this.ToteNo == undefined ? '' : this.ToteNo.trim()
    })
    requestData.push({
      "Key": "BulkReturnId",
      "Value": this.BulkReturnId == null || this.BulkReturnId == undefined ? '' : this.BulkReturnId.trim()
    })
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
    })
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
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
            const fileName = `Tote_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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

  GetToteReport() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    
    this.ngxSpinnerService.show();

    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetToteReport"
    })

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
    })
    requestData.push({
      "Key": "ToteNo",
      "Value": this.ToteNo == null || this.ToteNo == undefined ? '' : this.ToteNo.trim()
    })
    requestData.push({
      "Key": "BulkReturnId",
      "Value": this.BulkReturnId == null || this.BulkReturnId == undefined ? '' : this.BulkReturnId
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
              this.results = Array.isArray(data?.ToteDetailList?.ToteDetail)
                ? data?.ToteDetailList?.ToteDetail
                : [data?.ToteDetailList?.ToteDetail];
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
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
          "Value": "GetToteReport"
        })


        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
        })
        requestData.push({
          "Key": "ToteNo",
          "Value": this.ToteNo == null || this.ToteNo == undefined ? '' : this.ToteNo.trim()
        })
        requestData.push({
          "Key": "BulkReturnId",
          "Value": this.BulkReturnId == null || this.BulkReturnId == undefined ? '' : this.BulkReturnId.trim()
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

                  this.detail.next({ totalRecord: data?.TotalRecords, Data: data.ToteDetailList.ToteDetail });
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
