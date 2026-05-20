import { Component, OnInit } from '@angular/core';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';
import { Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';




@Component({
  selector: 'app-tradein-list',
  templateUrl: './tradein-list.component.html',
  styleUrls: ['./tradein-list.component.sass']
})
export class TradeinListComponent implements OnInit {

  tradeinList: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

  TradeinCategoryDD: DropDownValue = DropDownValue.getBlankObject();
  TradeinPartnerDD: DropDownValue = DropDownValue.getBlankObject();

  StartDate: any;
  EndDate: any;
  TransactionNo: any;

  spinnerValue: any = 'Please wait ,Loading'

  QuotationNumber: any;
  TradeinPartner: any;
  MobileNo:any

  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];


  actionEmit(event) {
    console.log("action Emit", event);
    if (event.action == 'EDIT') {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/tradein'], { queryParams: { TradeinGUID: event.row.TradeinGUID, CaseGUID: event.row.CaseGUID } })
    }
  }


  columns: Columns[] =
    [
      { datatype: "STRING", field: "CompanyCode", title: "CompanyCode" },
      { datatype: "STRING", field: "LocationCode", title: "LocationCode" },
      { datatype: "STRING", field: "CustomerCode", title: "CustomerCode" },
      { datatype: "STRING", field: "TransactionCategoryDesc", title: "Category" },
      { datatype: "STRING", field: "TradeinPartnerDesc", title: "Tradein Partner" },
      { datatype: "STRING", field: "TradeinId", title: "TradeinId" },
      { datatype: "STRING", field: "TransactionNo", title: "TransactionNo" },
      { datatype: "STRING", field: "QuotationNumber", title: "QuotationNumber" },
      { datatype: "STRING", field: "CaseId", title: "CaseId" },
      { datatype: "STRING", field: "Remark", title: "Remark" },
      { datatype: "STRING", field: "CreatedDate", title: "CreatedDate" },
      { datatype: "STRING", field: "CreatedBy", title: "CreatedBy" },
      { datatype: "STRING", field: "LastUpdatedDate", title: "LastUpdatedDate" },
      { datatype: "STRING", field: "LastUpdatedBy", title: "LastUpdatedBy" },
    ];

  TradeinId: any;
  CaseId: any;
  TransactionCategory: any;
  LocationCode: any;
  CustomerCode:any;


  constructor(
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private route: Router,
    private datePipe: DatePipe,
    private reportService: ReportService,


  ) { }


  ngOnInit(): void {
    this.GetTradeinList('')
    this.onLocationSearch({ term: "", item: [] });
    this.onTradeinSubCategorySearch({ term: "", items: [] });
    this.OnTradeinPartnerSearch({ term: "", items: [] });


  }
  PageChange(event) {
    switch (event.eventType) {
      case "PageChange":
        this.GetTradeinList(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
    }
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

  onTradeinSubCategorySearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TRADEINCATEGORY, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          debugger
          this.TradeinCategoryDD = value;
          console.log("TradeinCategoryDD ", this.TradeinCategoryDD)
        }
      },
      error: (err) => {
        this.TradeinCategoryDD = this.getBlankObject();
      }
    });
  }
  getBlankObject(): DropDownValue {
    throw new Error('Method not implemented.');
  }

  GetTradeinList(eventDetail) {
    debugger
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

    this.spinner.show()
    this.spinnerValue = 'Searching Data ,Please wait'
    this.tradeinList = []
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetTradeinList"
    })
    requestdata.push({
      "Key": "TradeinId",
      "Value": this.TradeinId ? this.TradeinId.trim() : ''
    })
    requestdata.push({
      "Key": "CaseId",
      "Value": this.CaseId ? this.CaseId.trim() : ''
    })
    requestdata.push({
      "Key": "TransactionCategory",
      "Value": this.TransactionCategory ?? ''
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.LocationCode ?? ''
    })
    requestdata.push({
      "Key": "TransactionNo",
      "Value": this.TransactionNo ? this.TransactionNo.trim() : ''
    })
    requestdata.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode ? this.CustomerCode.trim() : ''
    })
    requestdata.push({
      "Key": "QuotationNumber",
      "Value": this.QuotationNumber ? this.QuotationNumber.trim() : ''
    })
    requestdata.push({
      "Key": "TradeinPartner",
      "Value": this.TradeinPartner ? this.TradeinPartner.trim() : ''
    })
    requestdata.push({
      "Key": "MobileNo",
      "Value": this.MobileNo ? this.MobileNo.trim() : ''
    })

    requestdata.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
    requestdata.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
    });
     requestdata.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
    })
    requestdata.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
    })

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          debugger

          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.TotalRecords == "0") {
                this.toaster.error("No Data Found")
                return
              }
              if (Array.isArray(data.TradeinList?.Tradein)) {
                this.tradeinList = data.TradeinList?.Tradein;
              }
              else {
                this.tradeinList.push(data.TradeinList?.Tradein)
              }
              this.detail.next({ totalRecord: data?.TotalRecord, Data: this.tradeinList });
              this.spinner.hide()
              this.spinnerValue = 'Please wait ,Loading'

            }
          } catch (ext) {
          }
        },
        error: err => {
          this.spinner.hide()
          this.spinnerValue = 'Please wait ,Loading'

          console.log(err)
        }

      }
    );
  }


  ExportTradeinList() {
  
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
    this.spinnerValue = 'Converting Data into Excel,Please wait '

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportTradeinList"
    })
    requestData.push({
      "Key": "CaseID",
      "Value": this.CaseId ? this.CaseId?.trim() : '',
    })
    requestData.push({
      "Key": "TradeinId",
      "Value": this.TradeinId ? this.TradeinId?.trim() : '',
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode ?? '',
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode(),
    })
    requestData.push({
      "Key": "TransactionCategory",
      "Value": this.TransactionCategory ?? '',
    })
     requestData.push({
      "Key": "TransactionNo",
      "Value": this.TransactionNo ? this.TransactionNo.trim() : ''
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
            this.spinner.hide()
            this.spinnerValue = 'Please wait ,Loading'
            const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
            const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
            let response = JSON.parse(Value.toString());
            const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
            var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });

            // Create a download link
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const fileName = `Tradein_List__${startformattedDate}_to_${endformattedDate}.xls`;
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
          this.spinnerValue = 'Please wait ,Loading'


        }
      }
    );
  }

    OnTradeinPartnerSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TRADEINPARTNER, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          debugger
          this.TradeinPartnerDD = value;
          console.log("TradeinSubCategoryDD ", this.TradeinPartnerDD)
        }
      },
      error: (err) => {
        this.TradeinPartnerDD = this.getBlankObject();
      }
    });
  }





}
