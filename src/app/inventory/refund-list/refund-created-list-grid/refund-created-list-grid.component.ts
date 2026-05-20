import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Columns } from 'src/app/models/column.metadata';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { Observable } from 'rxjs/internal/Observable';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from 'src/app/config/global'
import { Subscription, lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-refund-created-list-grid',
  templateUrl: './refund-created-list-grid.component.html',
  styleUrls: ['./refund-created-list-grid.component.css']
})
export class RefundCreatedListGridComponent implements OnInit {

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';
  selectedCallForm: any;
  searchText: String = "";
  actionDetails: any[]=[
    {"code": "REFUND","icon": "undo","title": "Pay Refund"}
  ];
  customerCode: string;
  transactionCode: string;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  // RefundStatusDD= ['PENDING', 'CLOSED']
  RefundStatusDD: DropDownValue = DropDownValue.getBlankObject();

  RefundDocType = ''; // Initialized so that the Columns can be updated accordingly
  showGrid = false;
  SalesReturnCode: string
  InvoiceCode: string
  RetailCustomerCode: string
  LocationCode: string 
  RefundStatus: string

  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  RefundDocTypeDD: DropDownValue = DropDownValue.getBlankObject();

  // columns: Columns[] = [];
  refundRequestColumns: Columns[] = [
    { datatype: "STRING", field: "RequestCode", title: "Request Code" },
    { datatype: "STRING", field: "RetailCustomerCode", title: "Customer Code" },
    { datatype: "STRING", field: "MobileNo", title: "Mobile No" },
    { datatype: "STRING", field: "ApprovalStatus", title: "Approval Status" },
    { datatype: "STRING", field: "RefundStatus", title: "Refund Status" },
    { datatype: "STRING", field: "RequestAmount", title: "Request Amount" },
    { datatype: "STRING", field: "RefundRemark", title: "Refund Remark" },
    { datatype: "DATE", field: "RefundDate", title: "Refund Date" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "CompanyCode", title: "Company Code" },
    { datatype: "STRING", field: "InvoiceCode", title: "Invoice Code" },
    { datatype: "STRING", field: "SalesReturnCode", title: "Sales Return Code" },
  ];
  // refundColumns: Columns[] = [
  //   { datatype: "STRING", field: "RefundCode", title: "Refund Code" },
  //   { datatype: "STRING", field: "RequestCode", title: "Request Code" },
  //   { datatype: "STRING", field: "RetailCustomerCode", title: "Customer Code" },
  //   { datatype: "STRING", field: "RefundStatus", title: "Refund Status" },
  //   { datatype: "STRING", field: "RefundAmount", title: "Refund Amount" },
  //   { datatype: "STRING", field: "RefundRemark", title: "Refund Remark" },
  //   { datatype: "DATE", field: "RefundDate", title: "Refund Date" },
  //   { datatype: "STRING", field: "RequestAmount", title: "Request Amount" },
  //   { datatype: "STRING", field: "LocationCode", title: "Location Code" },
  //   { datatype: "STRING", field: "CaseId", title: "Case Id" },
  // ];
  // salesReturnRequestColumns: Columns[] = [
  //   { datatype: "STRING", field: "RequestCode", title: "Request Code" },
  //   { datatype: "STRING", field: "ApprovalStatus", title: "Approval Status" },
  //   { datatype: "STRING", field: "RetailCustomerCode", title: "Retail Customer Code" },
  //   { datatype: "STRING", field: "SalesReturnStatus", title: "Sales Return Status" },
  //   { datatype: "STRING", field: "TotalNetAmount", title: "Net Amount" },
  //   { datatype: "STRING", field: "InvoiceCode", title: "Invoice Code" },
  //   { datatype: "DATE", field: "SalesReturnDate", title: "Sales Return Date" },
  //   { datatype: "STRING", field: "SalesReturnDocType", title: "SalesReturn DocType" },
  //   { datatype: "STRING", field: "LocationCode", title: "Location Code" },
  // ];
  // salesReturnColumns: Columns[] = [
  //   { datatype: "STRING", field: "SalesReturnCode", title: "Sales Return Code" },
  //   { datatype: "STRING", field: "RequestCode", title: "Request Code" },
  //   { datatype: "STRING", field: "RetailCustomerCode", title: "Retail Customer Code" },
  //   { datatype: "STRING", field: "SalesReturnStatus", title: "Sales Return Status" },
  //   { datatype: "STRING", field: "TotalNetAmount", title: "Net Amount" },
  //   { datatype: "STRING", field: "InvoiceCode", title: "Invoice Code" },
  //   { datatype: "DATE", field: "SalesReturnDate", title: "Sales Return Date" },
  //   { datatype: "STRING", field: "SalesReturnDocType", title: "SalesReturn DocType" },
  //   { datatype: "STRING", field: "LocationCode", title: "Location Code" },
  // ];

  // Dashboard List Part:- 
  @Input() filters: Observable<any>;
  statuses: { JobStatusDesc: string; JobCount: number }[] = [];
  pageTitle: String = "Sales Return";
  filterList: any[] =[]
  // Unsubscribe
  private filtersSubscription: Subscription;


  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private dropdownDataService: DropdownDataService,
  ) { }

  ngOnInit(): void {
    this.onRefundDocTypeSearch({ term: "", item: [] });
    this.onRefundStatusSearch({ term: "", item: [] });

    this.filtersSubscription = this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          // console.log("Filters", value);
          if (value.RefundStatusCode) {
            this.RefundStatus = value.RefundStatusCode
          }
          // if (value.RefundDocType) {
          //   this.RefundDocType = value.RefundDocType
          // }
          this.showGrid = true
          this.GetRefundList('')
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the Observable to release resources
    if (this.filtersSubscription) {
      this.filtersSubscription.unsubscribe();
    }
  }

  search(changeGrid){
    if ( !this.RefundDocType && changeGrid == 1){
      this.toast.error("Select Refund Against");
      return
    }
    if ( !this.RefundStatus && changeGrid == 1){
      this.toast.error("Select a Status");
      return
    }
    if ( changeGrid == 1) {
      this.showGrid = true
      this.GetRefundList('') 
      return
    }
    this.showGrid =false
  }
  actionEmit(event){
    // console.log("action Emit", event);
    if(event.action == 'REFUND'){ 
      // event.row.RefundDocType == 'RREFUND'  ?   
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/refund-order-created'], { queryParams: { refundguid: event.row.RefundGUID} })
      // :   this.route.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-created/'], {queryParams: { salesreturnguid:event.row.SalesReturnGuid ,locationcode:event.row.LocationCode  ,customercode:event.row.RetailCustomerCode}})
    }
  }

  onRefundStatusSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundStatus, $event.term, {
      // CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.RefundStatusDD = value;
        }
      },
      error: (err) => {
        this.RefundStatusDD = DropDownValue.getBlankObject();
      }
    });
  }


  onDocTypeChange(){
    this.GetRefundList('' )
  }
  GetRefundList(eventDetail) {
    //  
    // console.log("Refund Against", this.RefundDocType)
    // if (doctype== null || doctype == undefined || doctype == '' ){
    //   this.toast.error("Please select a Refund Against Type");
    //   return;
    // }
    //  
    this.ngxservice.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetRefundList"
    })
    requestdata.push({
      "Key":"CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestdata.push({
      "Key":"RetailCustomerCode",
      "Value": this.RetailCustomerCode == null ||this.RetailCustomerCode   == undefined ? '' : this.RetailCustomerCode 
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key":"RefundDocType",
      "Value": this.RefundDocType == null || this.RefundDocType == undefined ? '' : this.RefundDocType
    })
    requestdata.push({
      "Key":  "Status",
      "Value":  this.RefundStatus == null ||  this.RefundStatus == undefined ? '' :  this.RefundStatus
    })
    requestdata.push({
      "Key":"SalesReturnCode",
      "Value": this.SalesReturnCode == null || this.SalesReturnCode == undefined ? '' : this.SalesReturnCode
    })
    requestdata.push({
      "Key":"InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
    })
    requestdata.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestdata.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxservice.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              console.log("Data is ", data)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                this.detail.next({ totalRecord: data?.Totalrecords, Data: '' })
                // this.route.navigate(['/auth/'+ glob.getCompanyCode() + '/refund-list']);
                return
              }
              let ExtraData =[]
              if( Array.isArray(data.RefundList?.RefundRow) ) {
                ExtraData = data.RefundList?.RefundRow;
              }
              else{
                ExtraData.push(data.RefundList?.RefundRow)
              }
              // this.toast.success("Records Found")
              // this.showGrid = true;
              // console.log("Refund Rows are:- ",ExtraData)
              if ( this.RefundStatus == 'CLOSED'){
                this.actionDetails=[
                  {"code": "REFUND","icon": "remove_red_eye","title": "View Refund"}
                ];
              }
              else{
                this.actionDetails=[
                  {"code": "REFUND","icon": "remove_red_eye","title": "Pay Refund"}
                ];
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: ExtraData })
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.ngxservice.hide()
          console.log(err)
        }

      }
    );
  }


  PageChange( event){
    switch(event.eventType){
      case "PageChange":
        this.GetRefundList(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;

      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }


  routeToRefundRequest(){
      this.route.navigate(["/auth/" + glob.getCompanyCode() +  "/refund-order-request"]);
  }

  onRefundDocTypeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundDocType, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          // this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.RefundDocTypeDD = value;
          // console.log("Refund Data :- ", this.RefundDocTypeDD);
        }
      },
      error: (err) => {
        this.RefundDocTypeDD = DropDownValue.getBlankObject();
      }
    });
  }

}
