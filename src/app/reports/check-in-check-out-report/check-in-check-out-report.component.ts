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
  selector: 'app-check-in-check-out-report',
  templateUrl: './check-in-check-out-report.component.html',
  styleUrls: ['./check-in-check-out-report.component.sass']
})
export class CheckInCheckOutReportComponent implements OnInit {


  UserName: any;
  Location: any;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  StartDate: any;
  EndDate: any;
  jobPagination: PaginationMetaData;
  results = [];
  CompanyCode: any;
  CurrentDate: any;
  ActivityType: any;
  ActivityTime: any;
  DurationIn: any;
  Remarks: any;
  FullName: any;


  columns: Columns[] = [
    { datatype: "STRING", field: "FullName", title: "FullName" },
    { datatype: "STRING", field: "UserName", title: "UserName" },
    { datatype: "STRING", field: "CurrentDate", title: "CurrentDate" },

    { datatype: "STRING", field: "ActivityType", title: "ActivityType" },
    { datatype: "STRING", field: "ActivityTime", title: "ActivityTime" },
    { datatype: "STRING", field: "Duration", title: "Duration(minutes)" },

    { datatype: "STRING", field: "Remarks", title: "Remarks" },

    { datatype: "STRING", field: "CompanyCode", title: "CompanyCode" },
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
    // this.getReportData()
  }


  ExportCheckInCheckOut() {


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
      "Value": "ExportCheckInCheckOut"
    })
    requestData.push({
      "Key": "UserName",
      "Value": this.UserName == null || this.UserName == undefined ? '' : this.UserName
    })

    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
    })
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
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
            const fileName = `Check-In-Check-Out_${startformattedDate}_to_${endformattedDate}.xls`;
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



  getCheckInCheckReportList() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    if (!(startformattedDate == null || startformattedDate == undefined || startformattedDate == '')) {
      if (endformattedDate == null || endformattedDate == undefined || endformattedDate == '') {
        this.toast.error('End Date cannot be empty !')
        return
      }
      if (endformattedDate < startformattedDate) {
        this.toast.error('End Date Cannot Be Less Than Start Date')
        return
      }

    }

    if (!(endformattedDate == null || endformattedDate == undefined || endformattedDate == '')) {
      if (startformattedDate == null || startformattedDate == undefined || startformattedDate == '') {
        this.toast.error('Start Date cannot be empty !')
        return
      }
      if (endformattedDate < startformattedDate) {
        this.toast.error('End Date Cannot Be Less Than Start Date')
        return
      }

    }

    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetCheckInCheckOutList"
    })

    // requestData.push({
    //   "Key": "FullName",
    //   "Value": this.FullName == null || this.FullName == undefined ? '' : this.FullName.trim()
    // })

    requestData.push({
      "Key": "UserName",
      "Value": this.UserName == null || this.UserName == undefined ? '' : this.UserName.trim()
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
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (Array.isArray(data.CheckInCheckOutData.CheckInCheckOut)) {
                this.results = data.CheckInCheckOutData.CheckInCheckOut
              }
              else {
                this.results.push(data.CheckInCheckOutData.CheckInCheckOut)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
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
          "Value": "GetCheckInCheckOutList"
        })
        requestData.push({
          "Key": "UserName",
          "Value": this.UserName == null || this.UserName == undefined ? '' : this.UserName.trim()
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

                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data.CheckInCheckOutData.CheckInCheckOut });
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




}
