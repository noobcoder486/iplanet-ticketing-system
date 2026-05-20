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
  selector: 'app-bulk-return-report',
  templateUrl: './bulk-return-report.component.html',
  styleUrls: ['./bulk-return-report.component.css']
})
export class BulkReturnReportComponent implements OnInit {

  BulkReturnStatusDD: DropDownValue = this.getBlankObject();
  BulkReturnStatusCode: string = '';
  BulkReturnId:String='';
  CompanyCode:string='';
  ReturnOrderStatus: string;
  isStartDateSelected: boolean;
  isEndDateSelected: boolean;
  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  StartDate: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate: any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  results = [];
  jobPagination: PaginationMetaData;



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

  actionDetails: any[] = [

  ];
  columns: Columns[] = [
    { datatype: "STRING", field: "BulkReturnId", title: "BulkReturn Id" },
    { datatype: "STRING", field: "CreatedDate", title: "Created Date" },
    { datatype: "STRING", field: "ApprovalStatus", title: "Approval Status" },
    { datatype: "STRING", field: "ReturnOrderStatus", title: "ReturnOrderStatus" },
    { datatype: "STRING", field: "VendorCode", title: "Vendor Code" },
    { datatype: "STRING", field: "TotalStockPrice", title: "Total Stock Price" },
    { datatype: "STRING", field: "LocationCode", title: "Location Name" },
    { datatype: "STRING", field: "ShipTo", title: "Location Code" },
    { datatype: "STRING", field: "ApprovalUsername", title: "Approval Username" },
   
    // { datatype: "STRING", field: "ApprovalRemark", title: "Approval Remark" },
    // { datatype: "STRING", field: "PartCode", title: "Part Code" },
    // { datatype: "STRING", field: "PartDescription", title: "Part Description" },
    // { datatype: "STRING", field: "ProductDescription", title: "Product Description" },
    // { datatype: "STRING", field: "RepairId", title: "RepairId" },
    // { datatype: "STRING", field: "ReturnOrderNumber", title: "Return Order Number" },
    // { datatype: "STRING", field: "PurchaseOrderNumber", title: "Purchase Order Number" },
    // { datatype: "STRING", field: "ToteNumber", title: "Tote Number" },
    // { datatype: "STRING", field: "HSNSACCode", title: "HSNSAC Code" },
    // { datatype: "STRING", field: "GSTGroupCode", title: "GSTGroup Code" },

  ];


  ngOnInit(): void {
    this.onBulkReturnStatus({ term: "", item: [] });
  }


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onBulkReturnStatus($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BulkReturnStatus, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BulkReturnStatusDD = value;
          console.log("Bulk Return Status ", this.BulkReturnStatusDD)
        }
      },
      error: (err) => {
        this.BulkReturnStatusDD = DropDownValue.getBlankObject();
      }
    });
  }

  onFromDateSelected() {
    this.isStartDateSelected = false;
    this.isEndDateSelected = true;
  }

  onToDateSelected() {
    this.isStartDateSelected = true;
    this.isEndDateSelected = false;
  }

  getDistantPastDate(): string {
    const distantPast = new Date();
    distantPast.setFullYear(distantPast.getFullYear() - 100); // Adjust the number of years as needed
    return this.datePipe.transform(distantPast, 'yyyy-MM-dd');
  }

  exportReportData() {
    const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
    {
      let requestData = []
      this.ngxSpinnerService.show();
      requestData.push({
        "Key": "APIType",
        "Value": "ExportBulkReturnReportList"
      })
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestData.push({
        "Key": "ReturnOrderStatus",
        "Value": this.BulkReturnStatusCode == null || this.BulkReturnStatusCode == undefined ? '' : this.BulkReturnStatusCode
      })
      requestData.push({
        "Key": "BulkReturnId",
        "Value": this.BulkReturnId == null || this.BulkReturnId == undefined ? '' : this.BulkReturnId
      })
      requestData.push({
        "Key": "StartDate",
        "Value": fromformattedDate == null || fromformattedDate == undefined ? null : fromformattedDate
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
      

      // EXPORTPAYMENT Should be change for advance payment report
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
              const fileName = `Bulk_Return_Report_${startformattedDate}_to_${endformattedDate}.xls`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();

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



  getReportData(eventDetail ) {
    // this.results = []
    const fromformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : this.getDistantPastDate();
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if ((this.EndDate != null || this.EndDate != undefined)) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetBulkReturnReportList"
        })
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        })
        requestData.push({
          "Key": "ReturnOrderStatus",
          "Value": this.BulkReturnStatusCode == null || this.BulkReturnStatusCode == undefined ? '' : this.BulkReturnStatusCode
        })
        requestData.push({
          "Key": "BulkReturnId",
          "Value": this.BulkReturnId == null || this.BulkReturnId == undefined ? '' : this.BulkReturnId
        })
        requestData.push({
          "Key": "StartDate",
          "Value": fromformattedDate == null || fromformattedDate == undefined ? null : fromformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key":"PageNo",
          "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
        });
        requestData.push({
          "Key":"PageSize",
          "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
        });
        // console.log("Before Sp", requestData)
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
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  console.log("response ", data)
                  if (data.Totalrecords == '0') {
                    this.detail.next({ totalRecord: data?.Totalrecords, Data: '' })
                    this.toast.error("No Record Found!")
                    return
                  }
                  this.results =[]
                  if (Array.isArray(data?.ReportData?.GetBulkReturnReportList)) {
                    this.results = data?.ReportData?.GetBulkReturnReportList
                  }
                  else {
                    this.results.push(data?.ReportData?.GetBulkReturnReportList)
                  }
                  console.log("After SP ", this.results)
                  this.detail.next({ totalRecord: data.Totalrecords, Data: this.results });
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
      this.toast.error("Please Select End Date")
    }
  }

  PageChange( event){    
    switch(event.eventType){
      case "PageChange":
        this.getReportData( event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

}
