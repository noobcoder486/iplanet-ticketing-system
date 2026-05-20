import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Columns } from 'src/app/models/column.metadata';
import * as glob from "../../../config/global";
import { MatDialog } from '@angular/material/dialog'; 
import { RefundPopupComponent } from 'src/app/custom-components/refund-popup/refund-popup.component';


@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {


  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
    private dialog: MatDialog,
  ) { 
    // this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }
  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  results : any[] = [];
  customerCode: string = ''
  customerName: string = ''
  phonenumber: string = ''
  email: string = ''
  toolBarAction: any[] = [];
  RefundTypeDD : DropDownValue = DropDownValue.getBlankObject();
  showonlyselected: boolean = false;
  close: boolean;
  searchText: String = "";
  SelectedPartCount: Number = 0;
  SelectCustomerList: any[]= []
  @Output() materialList  = new EventEmitter<any>();
  @Output() CloseEmit = new EventEmitter<any>();
  @Input() stockTypeData: string;
  @Input() selectedLocation: string ;
  @Input() ModuleType: string ='' ;


  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);


  columns: Columns[] = [
    { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
    { datatype: "STRING", field: "FirstName", title: "FirstName" },
    { datatype: "STRING", field: "LastName", title: "LastName" },
    { datatype: "STRING", field: "EmailID", title: "EmailID" },
    { datatype: "STRING", field: "MobileNo", title: "MobileNo" },

]
  ngOnInit(): void {
    console.log("Type ", this.ModuleType)
    switch (this.ModuleType) {
      case 'Refund':
        this.actionDetails = [
          { "code": "REFUND", "icon": "undo", "title": "Refund" }
        ];
        break;
      case 'CashDeposit':
        this.actionDetails = [
          { "code": "DEPOSIT", "icon": "undo", "title": "Deposit" }
        ];
        break;
      // Add more cases for other types if needed
      default:
        this.actionDetails = [];
        break;
    }

    this.GetCustomerList('', '','', '', '')
  }

  actionDetails: any[]= [
    {  "code": "REFUND" , "icon": "undo", "title": "Refund"}
  ];


  actionEmit(event : any){
    console.log("event ", event)
    if (event.action == "REFUND" ){
      // this.onAdvancePaymentSearch({ term: "", item: [] }, event.row.CustomerCode);
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-order-request'], { queryParams: { locationcode: this.selectedLocation, customercode:  event.row.CustomerCode} })
    }
    if (event.action == "DEPOSIT" ){
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/cash-deposit'], { queryParams: { locationcode: this.selectedLocation, customercode:  event.row.CustomerCode} })
    }
  }

  // onAdvancePaymentSearch( $event: { term: string; item: any[] }, CustomerCode: string){
  //   this.dropdownDataService.fetchDropDownData(DropDownType.RefundType,$event.term , {
  //     LocationCode: this.selectedLocation,
  //     CustomerCode: CustomerCode,
  //     DocType: 'RREFUND'
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.RefundTypeDD = value;
  //         console.log("results from Bind Refund:- ", value)
  //         if ( value?.Data.length  < 1){
  //             this.toast.error("No Advance Payment Found!")
  //             return
  //         }
  //         console.log("Value ", value?.Data[0]?.InvoiceGuid)
  //         this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-order-request'], { queryParams: { locationcode: this.selectedLocation, customercode: CustomerCode, docType: 'RREFUND'} })
  //         console.log("Refund Type Code  :- ", this.RefundTypeDD);
  //       }
  //     },
  //     error: (err) => {
  //       console.log(" Error while finding Payments:- ", err)
  //     }
  //   });
  // }

  PageChange(event){
    switch (event.eventType) {
      case "PageChange":
          this.GetCustomerList(
            event.eventDetail
            ,this.customerCode, this.customerName, this.phonenumber, this.email
          );
          setTimeout(() => { this.jobListHideSpinnerEvent.next(); }, 500);
          break;
    }
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
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


  search() {
    this.GetCustomerList(event, this.customerCode, this.customerName, this.phonenumber, this.email);
  }

  GetCustomerList(eventDetail, customercode, customername, phonenumber, email)
  {
    this.results = []
    //  ;
    // console.log("Event for Page Change:- ", eventDetail.pageIndex);
    this.ngxSpinnerService.show();
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
      "Value": email
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
      "Value": eventDetail.pageIndex != null || eventDetail.pageIndex != undefined ? eventDetail.pageIndex + 1 : "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize !=  null || eventDetail.pageSize != undefined? eventDetail.pageSize : "10"
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
             if ( data?.CustomerList?.Customer != null || data?.CustomerList?.Customer == undefined){
               if (Array.isArray(data?.CustomerList?.Customer)) {
                 this.results = data?.CustomerList?.Customer;
               }
               else {
                 this.results.push(data?.CustomerList?.Customer);
               }
             }
              console.log("Results are ", this.results)
             this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
              this.ngxSpinnerService.hide()
            }
          } catch (ext) {
          }
        },
        error: err => {
        }

      }
    );
  }

  

  closeBtn()
  {
    this.close = false; 
    this.CloseEmit.emit(this.close) 
  }


}
