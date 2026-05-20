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
  selector: 'app-enquiry-list-report',
  templateUrl: './enquiry-list-report.component.html',
  styleUrls: ['./enquiry-list-report.component.sass']
})
export class EnquiryListReportComponent implements OnInit {

  jobPagination: PaginationMetaData;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  LocationCode: any
  StartDate: any;
  EndDate: any
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  MobileNo: any

  results = [];

  columns: Columns[] = [
    { datatype: "STRING", field: "CustomerCode", title: "CustomerCode" },
    { datatype: "STRING", field: "FirstName", title: "FirstName" },
    { datatype: "STRING", field: "LastName", title: "LastName" },
    { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
    { datatype: "STRING", field: "ProductId", title: "ProductId" },
    { datatype: "STRING", field: "EmailId", title: "EmailId" },
    { datatype: "STRING", field: "DispositionTypeDesc", title: "DispositionTypeDesc" },
    { datatype: "STRING", field: "LocationCode", title: "LocationCode" },
    { datatype: "STRING", field: "TokenCode", title: "TokenCode" },
    { datatype: "STRING", field: "CustomerSourceNameDesc", title: "CustomerSourceName" },
    { datatype: "STRING", field: "CustomerVisitSourceDesc", title: "CustomerVisitSourceDesc" },
    { datatype: "STRING", field: "ReferredByDesc", title: "ReferredByDesc" },
    { datatype: "STRING", field: "CreatedDate", title: "CreatedDate" },
    { datatype: "STRING", field: "CreatedBy", title: "CreatedBy" },
    { datatype: "STRING", field: "LastupdatedBy", title: "LastupdatedBy" },
    { datatype: "STRING", field: "LastupdatedDate", title: "LastupdatedDate" },
    { datatype: "STRING", field: "Remark", title: "Remark" },

  ];

  CustomerCode: any


  constructor(
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toaster: ToastrService

  ) {
    this.jobPagination = new PaginationMetaData();
  }

  ngOnInit(): void {

    this.onLocationSearch({ term: "", item: [] });
    this.GenerateEnquiryListReport()

  }



  ExportEnquiryListReport() {

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
      "Value": "ExportEnquiryListReport"
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
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode ? this.CustomerCode.trim() : ''
    })
    requestData.push({
      "Key": "MobileNo",
      "Value": this.MobileNo ? this.MobileNo.trim() : ''
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
            const fileName = `Enquiry_List_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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

  GenerateEnquiryListReport() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    this.ngxSpinnerService.show();
    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetEnquiryListReport"
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
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode ? this.CustomerCode.trim() : ''
    })
    requestData.push({
      "Key": "MobileNo",
      "Value": this.MobileNo ? this.MobileNo.trim() : ''
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
              if (data?.TotalRecords == '0') {
                this.toaster.error('No Records Found !!')
                this.ngxSpinnerService.hide()
                return
              }
              this.results = Array.isArray(data?.EnquiryList?.Enquiry)
                ? data?.EnquiryList?.Enquiry
                : [data?.EnquiryList?.Enquiry];
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });

              this.ngxSpinnerService.hide()


            }

            else {
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
          "Value": "GetEnquiryListReport"
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
        requestData.push({
          "Key": "CustomerCode",
          "Value": this.CustomerCode ? this.CustomerCode.trim() : ''
        })
        requestData.push({
          "Key": "MobileNo",
          "Value": this.MobileNo ? this.MobileNo.trim() : ''
        })

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
                  if (data?.TotalRecords == 0) {
                    this.toaster.error('No Records Found !!')
                    return
                  }

                  this.detail.next({ totalRecord: data?.TotalRecords, Data: data?.EnquiryList?.Enquiry });
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
