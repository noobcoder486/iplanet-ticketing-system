import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';

@Component({
  selector: 'app-inter-company-amount-transfer-report',
  templateUrl: './inter-company-amount-transfer-report.component.html',
  styleUrls: ['./inter-company-amount-transfer-report.component.sass']
})
export class InterCompanyAmountTransferReportComponent implements OnInit {

  jobPagination: PaginationMetaData;

  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private reportService: ReportService,


  ) {
    this.jobPagination = new PaginationMetaData();

  }

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  CompanyDropDown: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);



  StartDate: any;
  EndDate: any;
  LocationCode: any;
  FromCompanyCode: any;
  FromCustomerCode: any;
  ToCompanyCode: any;
  ToCustomerCode: any;
  InterCompanyAmountTransferList = [];
  AmountTransferCode: any;

  columns: Columns[] = [
    { datatype: "STRING", field: "AmountTransferCode", title: "Amount Transfer Code" },
    { datatype: "STRING", field: "AmountTransfer", title: "Amount Transfer" },
    { datatype: "STRING", field: "FromCompanyCode", title: "From Company" },
    { datatype: "STRING", field: "FromCustomerCode", title: "From Customer" },
    { datatype: "STRING", field: "ToCustomerCode", title: "To Customer" },
    { datatype: "STRING", field: "ToCompanyCode", title: "To Company" },
    { datatype: "STRING", field: "LocationCode", title: "Location" },
    { datatype: "STRING", field: "CreatedDate", title: "Created Date" },
    { datatype: "STRING", field: "CreatedBy", title: "Created By" },
    { datatype: "STRING", field: "Remark", title: "Remark" }

  ];

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onCompany4OrgRoleSearch({ term: "", item: [] });
    this.GetInterCompanyAmountTransferReport()
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
  onCompany4OrgRoleSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BindCompany4Username, "", {
      OrgRoleId: ''
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.CompanyDropDown = value;
          console.log('CompanyDropDown', this.CompanyDropDown)
        }
      },
      error: (err) => {
        this.CompanyDropDown = DropDownValue.getBlankObject();
        console.log('CompanyDropDown', this.CompanyDropDown)

      }
    });
  }



  GetInterCompanyAmountTransferReport() {

    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    
    // this.ngxSpinnerService.show();

    // this.ToCustomerCode = this.ToCustomerCode.trim();
    // this.FromCustomerCode = this.FromCustomerCode.trim();

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetInterCompanyAmountTransferReport"
    })
    requestData.push({
      "Key": "AmountTransferCode",
      "Value": this.AmountTransferCode == null || this.AmountTransferCode == undefined ? '' : this.AmountTransferCode.trim()
    })
    requestData.push({
      "Key": "FromCompanyCode",
      "Value": this.FromCompanyCode == null || this.FromCompanyCode == undefined ? '' : this.FromCompanyCode
    })
    requestData.push({
      "Key": "FromCustomerCode",
      "Value": this.FromCustomerCode == null || this.FromCustomerCode == undefined ? '' : this.FromCustomerCode.trim()
    })
    requestData.push({
      "Key": "ToCompanyCode",
      "Value": this.ToCompanyCode == null || this.ToCompanyCode == undefined ? '' : this.ToCompanyCode
    })
    requestData.push({
      "Key": "ToCustomerCode",
      "Value": this.ToCustomerCode == null || this.ToCustomerCode == undefined ? '' : this.ToCustomerCode.trim()
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
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
              this.InterCompanyAmountTransferList = Array.isArray(data?.InterCompanyAmountTransferList?.InterCompanyAmountTransfer)
                ? data?.InterCompanyAmountTransferList?.InterCompanyAmountTransfer
                : [data?.InterCompanyAmountTransferList?.InterCompanyAmountTransfer];
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.InterCompanyAmountTransferList });
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



  ExportInterCompanyAmountTransferReport() {
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
      "Value": "ExportInterCompanyAmountTransferReport"
    })
    requestData.push({
      "Key": "AmountTransferCode",
      "Value": this.AmountTransferCode == null || this.AmountTransferCode == undefined ? '' : this.AmountTransferCode.trim()
    })
    requestData.push({
      "Key": "FromCompanyCode",
      "Value": this.FromCompanyCode == null || this.FromCompanyCode == undefined ? '' : this.FromCompanyCode
    })
    requestData.push({
      "Key": "FromCustomerCode",
      "Value": this.FromCustomerCode == null || this.FromCustomerCode == undefined ? '' : this.FromCustomerCode.trim()
    })
    requestData.push({
      "Key": "ToCompanyCode",
      "Value": this.ToCompanyCode == null || this.ToCompanyCode == undefined ? '' : this.ToCompanyCode
    })
    requestData.push({
      "Key": "ToCustomerCode",
      "Value": this.ToCustomerCode == null || this.ToCustomerCode == undefined ? '' : this.ToCustomerCode.trim()
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
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
            const fileName = `Amount_Transfer_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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



  loadPageData(event) {
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = []
        requestData.push({
          "Key": "APIType",
          "Value": "GetInterCompanyAmountTransferReport"
        })
        requestData.push({
          "Key": "AmountTransferCode",
          "Value": this.AmountTransferCode == null || this.AmountTransferCode == undefined ? '' : this.AmountTransferCode.trim()
        })
        requestData.push({
          "Key": "FromCompanyCode",
          "Value": this.FromCompanyCode == null || this.FromCompanyCode == undefined ? '' : this.FromCompanyCode
        })
        requestData.push({
          "Key": "FromCustomerCode",
          "Value": this.FromCustomerCode == null || this.FromCustomerCode == undefined ? '' : this.FromCustomerCode.trim()
        })
        requestData.push({
          "Key": "ToCompanyCode",
          "Value": this.ToCompanyCode == null || this.ToCompanyCode == undefined ? '' : this.ToCompanyCode
        })
        requestData.push({
          "Key": "ToCustomerCode",
          "Value": this.ToCustomerCode == null || this.ToCustomerCode == undefined ? '' : this.ToCustomerCode.trim()
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode.trim()
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.InterCompanyAmountTransferList?.InterCompanyAmountTransfer });
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
