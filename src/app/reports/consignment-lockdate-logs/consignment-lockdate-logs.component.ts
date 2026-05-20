import { Component, OnInit } from '@angular/core';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { BehaviorSubject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from 'src/app/config/global';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Columns } from 'src/app/models/column.metadata';


@Component({
  selector: 'app-consignment-lockdate-logs',
  templateUrl: './consignment-lockdate-logs.component.html',
  styleUrls: ['./consignment-lockdate-logs.component.sass']
})
export class ConsignmentLockdateLogsComponent implements OnInit {

  DeliveryCode: any;
  LocationCode: any;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  StartDate: any;
  EndDate: any;
  results = [];
  jobPagination: PaginationMetaData;

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);


  columns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "LocationCode" },
    { datatype: "STRING", field: "DeliveryCode", title: "DeliveryCode" },
    { datatype: "STRING", field: "DeliveryDate", title: "DeliveryDate" },
    { datatype: "STRING", field: "CurrentLockDate", title: "CurrentLockDate" },
    { datatype: "STRING", field: "UpdatedLockDate", title: "UpdatedLockDate" },
    { datatype: "STRING", field: "Remark", title: "Remark" },
    { datatype: "STRING", field: "CreatedBy", title: "CreatedBy" },
    { datatype: "STRING", field: "CreatedDate", title: "CreatedDate" },

  ]


  constructor(private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,)
   {
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



  GetConsignmentLockDateLogsListReport() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    
    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetConsignmentLockDateUpdateLogs"
    })

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
    })
    requestData.push({
      "Key": "DeliveryCode",
      "Value": this.DeliveryCode == null || this.DeliveryCode == undefined ? '' : this.DeliveryCode.trim()
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
    console.log('contentRequest getQuotationResetListReport', contentRequest)

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (Array.isArray(data.ConsignmentLockUpdateLogsList.ConsignmentUpdateLogs)) {
                this.results = data.ConsignmentLockUpdateLogsList.ConsignmentUpdateLogs
              }
              else {
                this.results.push(data.ConsignmentLockUpdateLogsList.ConsignmentUpdateLogs)
              }
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
              console.log('this.results', this.results)
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
          "Value": "GetConsignmentLockDateUpdateLogs"
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
        })
        requestData.push({
          "Key": "DeliveryCode",
          "Value": this.DeliveryCode == null || this.DeliveryCode == undefined ? '' : this.DeliveryCode.trim()
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

                  this.detail.next({ totalRecord: data?.TotalRecords, Data: data.ConsignmentLockUpdateLogsList.ConsignmentUpdateLogs });
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

  ExportConsignmentLockDateLogsListReport() {


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
      "Value": "ExportConsignmentLockDateUpdateLogs"
    })

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
    })
    requestData.push({
      "Key": "DeliveryCode",
      "Value": this.DeliveryCode == null || this.DeliveryCode == undefined ? '' : this.DeliveryCode.trim()
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
            const fileName = `Consignment_LockDateLogsList_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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

}
