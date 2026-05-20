import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { Columns } from 'src/app/models/column.metadata';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-daily-summary-report',
  templateUrl: './daily-summary-report.component.html',
  styleUrls: ['./daily-summary-report.component.css']
})
export class DailySummaryReportComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  results = [];
  jobPagination: PaginationMetaData;
  isSelectedDate: boolean;
  fromDatePicker: any;
  toDatePicker: any;
  SelectedDate: any;

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

  onSelectedDate() {
    this.isSelectedDate = false;
  }

  
  exportReportData() {
    
    // const fromformattedDate = this.datePipe.transform(this.FromDate, 'yyyy-MM-dd');
    // const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const SelectformattedDate = this.datePipe.transform(this.SelectedDate, 'yyyy-MM-dd');
    this.results = []
    if (this.SelectedDate) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetDailySummaryList4Print"
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
        })
        requestData.push({
          "Key": "SelectedDate",
          "Value": this.SelectedDate == null || this.SelectedDate == undefined ? "0" : SelectformattedDate
        })
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        console.log("Cntent Request ", contentRequest)
        this.reportService.downloadServiceReport('DAILYSUMMARY', contentRequest).subscribe(
          {
            next: (value) => {
              // let response = JSON.parse(value.toString());
              // const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
              // var blob = new Blob([byteArray], { type: 'application/pdf' });
              // var url = URL.createObjectURL(blob);
              // window.open(url);
              // this.ngxSpinnerService.hide()

              const startformattedDate = this.datePipe.transform(this.SelectedDate, 'dd-MM-yyyy');
              let response = JSON.parse(value.toString());
              const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
              var blob = new Blob([byteArray], { type: 'application/pdf' });
              // Create a download link
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.href = url;
              const fileName = `Daily_Summary_Report_${startformattedDate}}.pdf`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();
            },
            error: err => {
              console.log(err);
              this.ngxSpinnerService.hide()
            }
          });
      }
    }
    else {
      this.toast.error("Please Select a valid Date")
    }

  }

  getReportData() {
    this.results = []
    // const fromformattedDate = this.datePipe.transform(this.FromDate, 'yyyy-MM-dd');
    // const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const SelectformattedDate = this.datePipe.transform(this.SelectedDate, 'yyyy-MM-dd');

    if (this.SelectedDate) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetDailySummaryList"
        })
        requestData.push({
          "Key": "StartDate",
          "Value": this.SelectedDate == null || this.SelectedDate == undefined ? "0" : this.SelectedDate
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
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
                console.log("======", response)

                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  console.log("======", data)
                  if (data.Totalrecords == '0') {
                    this.toast.error("No Record Found!")
                    return
                  }
                  if (Array.isArray(data?.InvoiceList?.Invoice)) {
                    this.results = data?.InvoiceList?.Invoice
                  }
                  else {
                    this.results.push(data?.InvoiceList?.Invoice)
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
    } else {
      this.toast.error("Please Select a valid Date")
    }
  }

}
