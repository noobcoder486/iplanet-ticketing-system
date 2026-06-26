import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from "src/app/config/global"
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta'
import { Observable } from 'rxjs/internal/Observable';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-customer-master',
  templateUrl: './customer-master.component.html',
  styleUrls: ['./customer-master.component.sass']
})
export class CustomerMasterComponent implements OnInit {
  gmail: string = '';
  customercode: string = '';
  customername: string = '';
  phonenumber: string = '';
  isChoose: boolean = false;
  pagination: PaginationMetaData;
  jobPagination: PaginationMetaData;
  JobList: any[];
  searchForm: FormGroup;
  JobColumns: Columns[] = [];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  gridDetailColumns: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  StartDate: any;
  EndDate: any;

  columns: Columns[] =
    [
      { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
      { datatype: "STRING", field: "FirstName", title: "FirstName" },
      { datatype: "STRING", field: "LastName", title: "LastName" },
      { datatype: "STRING", field: "EmailID", title: "EmailID" },
      { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
      { datatype: "STRING", field: "OPENCalls", title: "OPENCalls" },
      { datatype: "STRING", field: "CloseCalls", title: "CloseCalls" },
      { datatype: "STRING", field: "CustomerType", title: "CustomerType" },
      { datatype: "STRING", field: "IsInsuranceApplicable", title: "IsInsuranceApplicable" },
      { datatype: "STRING", field: "InsuranceType", title: "InsuranceType" },
      { datatype: "STRING", field: "IsSpecialMarginApplicable", title: "IsSpecialMarginApplicable" },
    ];


  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private ngxservice: NgxSpinnerService,
    private datePipe: DatePipe,
    private reportService: ReportService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.pagination = new PaginationMetaData();
    this.activatedRoute.data.subscribe((data: any) => {
      this.jobPagination = new PaginationMetaData();
      this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    })
  }


  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];

  ngOnInit() {
    this.GetCustomerList('', '', '', '');
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-customer-master']);
  }


  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];

        requestData.push({
          "Key": "APIType",
          "Value": "GetCustomerList"
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        });
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.CustomerList?.Customer });
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

  search() {
    this.GetCustomerList(this.customercode, this.customername, this.phonenumber, this.gmail);
  }

  GetCustomerList(customercode, customername, phonenumber, gmail) {
    this.ngxservice.show()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerList"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": customercode
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": customername
    });

    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": gmail
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "GSTNO",
      "Value": ''
    });
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
              var custlist = [];
              if (Array.isArray(data?.CustomerList?.Customer)) {
                custlist = data?.CustomerList?.Customer;
              }
              else {
                custlist.push(data?.CustomerList?.Customer);
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: custlist });
              this.ngxservice.hide()
            }
          } catch (ext) {
          }
        },
        error: err => {
        }

      }
    );
  }




  actionEmit(event) {
    console.log("action Emit", event);
    if (event.action == 'EDIT') {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-customer-master'], { queryParams: { cc: event.row.CompanyCode, customercode: event.row.CustomerCode } })
    }
  }


  ExportCustomerReport() {

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
    this.spinner.show()

    this.ngxservice.show()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "ExportCustomerReport"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.customercode ? this.customercode.trim() : ''
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": this.customername ? this.customername.trim() : ''
    });

    requestData.push({
      "Key": "MobileNo",
      "Value": this.phonenumber ? this.phonenumber.trim() : ''
    });
    requestData.push({
      "Key": "EmailId",
      "Value": this.gmail ? this.gmail.trim() : ''
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "GSTNO",
      "Value": ''
    });
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate
    });
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    }
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
            const fileName = `Customer_Master_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide()


        }
      }
    );
  }



}
