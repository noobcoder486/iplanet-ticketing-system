import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType, RequestValue } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "src/app/config/global";
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { Columns } from 'src/app/models/column.metadata';
import { RefundPopupComponent } from 'src/app/custom-components/refund-popup/refund-popup.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-refund-order-request',
  templateUrl: './refund-order-request.component.html',
  styleUrls: ['./refund-order-request.component.css']
})
export class RefundOrderRequestComponent implements OnInit {

  // Hide or Disable Settin for the HTML:- 
  hideLocationandCustomer: boolean = true;
  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  SelectItemsList: any[] = []
  PaymentList: any[] = [];
  openCustomerList = false
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  errorMessage: any;
  LocationCode: string;
  CustomerCode: string;

  // Refund:-
  PreviousRefundAmount: number = 0.00
  RefundRequestedAmount: number = 0
  TotalRequestedAmount: number = 0

  Spinner = false
  RefundGUID: string;
  RequestCode: string;
  RefundList: any[] = []
  // RefundAgainst: string;
  // SalesReturnCaseGUID: string;
  // CaseId: string;
  // CaseGUID: string;
  // InvoiceGuid: string;
  // InvoiceCode: string;
  // RefundDocType: string;
  // SalesReturnGUID: string;
  // SalesReturnDocType: string;
  RefundDocTypeDD: DropDownValue = DropDownValue.getBlankObject();
  RefundDocType: string
  // SalesReturnDataDD: DropDownValue = DropDownValue.getBlankObject();
  SalesReturnDataDD = []
  SalesReturnCode: string
  PaymentDataDD = []
  RefundData: string;
  salesReturnObj: any;
  paymentObj: any;
  PaymentCode: string
  // RefundAgainstDD: DropDownValue = DropDownValue.getBlankObject();
  params: any;
  currentDate: Date;
  userName: string;
  // Local Approver:-
  isApprover: boolean = false;
  ApproverLevel: number = 0;
  CreatedBy: string;
  showButtons = false;
  // Status
  ApprovalStatusDD = ['SENT FOR APPROVAL', 'APPROVED', 'PARTIALLY APPROVED'];
  // File Upload
  isImageUpload = false
  FileUploadList: any[] = []

  // Remarks Part
  isRemark = false;
  isRemarkUpload = false;
  RemarkLevel: number;
  RemarkUploadList: any[] = []; // Remark in request is object and in Approval is List

  // Customer Ledger
  pageChangeRefund = false
  TotalCreditAmount: number = 0;
  TotalBalanceAmount: number = 0;
  TotalDebitAmount: number = 0;
  PreviousRequestedAmount: number = 0;
  CustomerLedgerList: any[] = []
  LedgerColumns: Columns[] = [
    { datatype: "STRING", field: "TransactionCode", title: "Transaction Code" },
    { datatype: "STRING", field: "TransactionType", title: "Transaction Type" },
    { datatype: "STRING", field: "CreditAmount", title: "Credit Amount" },
    { datatype: "STRING", field: "DebitAmount", title: "Debit Amount" },
    { datatype: "STRING", field: "CreatedDate", title: "Transaction Date" },
  ];
  RequestColumns: Columns[] = [
    { datatype: "STRING", field: "RequestCode", title: "Request Code" },
    { datatype: "STRING", field: "ApprovalStatus", title: "Approval Status" },
    { datatype: "STRING", field: "RefundStatus", title: "Refund Status" },
    { datatype: "DATE", field: "RefundDate", title: "Refund Date" },
    { datatype: "STRING", field: "RequestAmount", title: "Request Amount" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "RefundRemark", title: "Refund Remark" },
    { datatype: "STRING", field: "RetailCustomerCode", title: "Customer Code" },
  ];
  actionDetails: any[] = [];
  detailLedger: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  detailRequest: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  submitClicked = false

  //Account details
  Refund_AccountNumber: string;
  Refund_CustomerName: string;
  Refund_IfscCode: string;
  Refund_RefundName: string;
  Refund_TotalRequestedAmount

  RefundDocCodeDD: DropDownValue = DropDownValue.getBlankObject();
  AdvancePaymentCode: any
  TransactionCode: any


  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.currentDate = new Date();
    //  
    this.userName = glob.getLogedInUser().UserDetails.UserName;
    this.params = this.activatedRoute.snapshot.queryParams;
    this.onLocationSearch({ term: "", item: [] })
    this.onRefundDocTypeSearch({ term: "", item: [] })

    // Remark Part
    this.RemarkLevel = 0
    this.RemarkUploadList = new Array(1)
    this.RemarkUploadList[0] = {
      RemarkLevel: 'Request Remark',
      RemarkDescription: '',
      RemarkDate: new Date(),
      isEdit: true
    };

    this.RefundGUID = uuidv4()
    if (
      (this.params.locationcode != null || this.params.locationcode != undefined) &&
      (this.params.customercode != null || this.params.customercode != undefined)
      // (this.params.docType != null || this.params.docType != undefined)
    ) {
      this.CustomerCode = this.params.customercode;
      this.LocationCode = this.params.locationcode;
      // this.RefundDocType = this.params.docType;
      this.GetCustomerLedgerObject('')
      this.hideLocationandCustomer = true
    }
    else if (Object.keys(this.params).length == 0) {
      this.hideLocationandCustomer = false
    }
    const allowedParams = ['customercode', 'locationcode', 'docType'];
    // Check if any additional parameters are present
    const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
    if (additionalParams.length > 0) {
      this.toastMessage.warning("Access Denied");
      this.location.back();
      return;
    }

    this.getCustomerObject()
    this.GetLocationObject()
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    // console.log("Term", event)
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          // console.log("Location Data :- ", this.LocationForJob);
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }


  onRefundDocTypeSearch($event: { term: string; item: any[] }) {
    // console.log("Term", event)
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundDocType, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.RefundDocTypeDD = value;
          console.log("RefundDocType Data :- ", this.RefundDocTypeDD);
        }
      },
      error: (err) => {
        this.RefundDocTypeDD = DropDownValue.getBlankObject();
      }
    });
  }


  onChangeRefundDocType() {
    if (this.RefundDocType == 'SREFUND') {
      this.onDocumentCodeSearch({ term: "", item: [] })
      // this.getRefundRequestData()
    }
     else if (this.RefundDocType == 'ICAT') {
      this.onDocumentCodeSearch({ term: "", item: [] })
      // this.getRefundRequestData()
    }
    else if (this.RefundDocType == 'RREFUND') {
      // this.onRefundSearch({ term:"", item:[]})
      // this.RefundRequestedAmount = this.TotalBalanceAmount
      // this.TotalRequestedAmount = this.TotalBalanceAmount
      this.onDocumentCodeSearch({ term: "", item: [] })

    }
    else {
      this.SalesReturnCode = null
    }
  }
  // onChangeSalesReturn(){
  //   
  //   this.PaymentCode = ''
  //   this.PaymentDataDD=[];
  //   this.RefundRequestedAmount=0;

  //    this.salesReturnObj = this.SalesReturnDataDD.find(ietm => ietm.Id == this.SalesReturnCode)
  //   console.log("salesReturnObj ", this.salesReturnObj)

  //   if ( Array.isArray( this.salesReturnObj?.PaymentObject?.PaymentDetail)){
  //     this.PaymentDataDD = this.salesReturnObj?.PaymentObject?.PaymentDetail
  //   }
  //   else{
  //     this.PaymentDataDD.push(this.salesReturnObj?.PaymentObject?.PaymentDetail)
  //   }

  // }

  onChangePaymentData() {

    this.paymentObj = this.PaymentDataDD.find(ietm => ietm.Id == this.PaymentCode)
    console.log("salesReturnObj ", this.salesReturnObj)
    this.RefundRequestedAmount = this.paymentObj.Amount

  }


  addPayment(type) {
    
    if (this.TransactionCode == null || this.TransactionCode == '' || this.TransactionCode == undefined) {
      this.toastMessage.error('Please Select Code to Proceed !');
      return;
    }
    const SelectedDoc = this.RefundDocCodeDD.Data.find(item => item.Id == this.TransactionCode)
    console.log('SelectedDoc', SelectedDoc);

    if (this.PaymentList.some(p => p.TransactionCode == this.TransactionCode)) {
      this.toastMessage.error('This Code  is already added ');
      return;
    }
    if (this.RefundRequestedAmount < 1) {
      this.toastMessage.error("Refund Amount should be greater than Zero")
      return;
    }
    if (this.RefundRequestedAmount > SelectedDoc.extraDataJson.Data.Amount[0]) {
      this.toastMessage.error("Refund Amount cannot exceed Payment Amount")
      return;
    }
    else if (this.RefundRequestedAmount > this.TotalBalanceAmount - this.PreviousRequestedAmount) {
      this.toastMessage.error("Refund Amount can't be greater than the Difference of Balance and Previously requested amount")
      return;
    }
    this.PaymentList.push({
      'RefundAmount': this.RefundRequestedAmount,
      'RefundDocType': this.RefundDocType,
      'TransactionCode': this.TransactionCode,
      'TransactionGUID': SelectedDoc.extraDataJson.Data.TransactionGUID[0],
    })
    this.CalculateTotalRefund()
    this.RefundRequestedAmount = 0;
    this.TransactionCode = null;
  }



  CalculateTotalRefund() {
    this.TotalRequestedAmount = 0
    this.PaymentList.forEach(currentItem => {
      this.TotalRequestedAmount += parseFloat(currentItem.RefundAmount.toString())
    })
    this.TotalRequestedAmount = parseFloat(this.TotalRequestedAmount.toFixed(2));
    console.log("Final Parts : ", this.PaymentList)
  }

  removePayment(item) {
    let index = this.PaymentList.indexOf(item)
    this.PaymentList.splice(index, 1)
    if (this.PaymentList.length > 0) {
      this.CalculateTotalRefund()
    }
    else {
      this.TotalRequestedAmount = 0
      this.RefundDocType = null
    }
  }


  getRefundRequestData() {
    let requestData = [];
    // this.SalesReturnDataDD = DropDownValue.getBlankObject();
    this.SalesReturnDataDD = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetRefundRequestDDList"
    });
    requestData.push({
      "Key": "DocType",
      "Value": this.RefundDocType
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode,
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Sp ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          // this.Spinner = false
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)
            console.log("RefundRequest Object", data)
            if (data?.Totalrecords != "0") {

              if (Array.isArray(data?.RefundRequestList?.RefundRequest)) {
                this.SalesReturnDataDD = data?.RefundRequestList?.RefundRequest
              }
              else {
                this.SalesReturnDataDD.push(data?.RefundRequestList?.RefundRequest)
              }
              console.log("Refund Data ", this.SalesReturnDataDD)
            }
            else {
              this.toastMessage.error("No Sales Return found, Kindly choose another Refund Type")
              this.RefundDocType = 'RREFUND'
            }
          }

        },
        error: err => {
          // this.Spinner = false
          console.log(err);
          // this.SalesReturnDataDD = []
          // this.SalesReturnDataDD = DropDownValue.getBlankObject();

        }
      });
  }



  // onRefundSearch( $event: { term: string; item: any[] } ){
  //   this.dropdownDataService.fetchDropDownData(DropDownType.RefundType,$event.term , {
  //     LocationCode: this.LocationCode,
  //     CustomerCode: this.CustomerCode,
  //     DocType: this.RefundDocType
  //   }).subscribe({
  //     next: (value) => {

  //       if (value != null) {
  //         this.SalesReturnDataDD = value;
  //         console.log("results from Bind Refund:- ", value)
  //         if ( value?.Data.length  < 1){
  //             this.toastMessage.error("No Payment/s Found, choose another option...")
  //             this.RefundDocType = null
  //             return
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.log(" Error while finding Payments/Sales Returns:- ", err)
  //     }
  //   });
  // }


  closePopup($event) {
    this.openCustomerList = false;
    //  this.openItemList = false
  }


  addCustomer() {
    if (this.LocationCode != null || this.LocationCode != undefined) {
      this.openCustomerList = true
    }
    else {
      this.toastMessage.error("Please select a location")
    }
  }

  async IsApproverObject() {
    this.ngxSpinnerService.show()

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "RefundApproval"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode == null || this.params.locationcode == undefined ? this.LocationCode : this.params.locationcode
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest = {
      "content": strRequestData,
    }
    try {
      const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
      const value = await lastValueFrom(observable);

      const response = JSON.parse(value.toString());
      console.log("Approval Object Response", response)
      if (response.ReturnCode == '0') {

        let extraDataResponse = JSON.parse(response?.ExtraData);
        console.log("Approval Object Extra", extraDataResponse);
        if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName) {
          console.log(" Approver ", extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson)
          this.isApprover = true
          this.toastMessage.error("Approvers can't create a Refund Request")
        }
      } else {
        console.log("Error in getting the Approval Object");
      }
    } catch (error) {
      console.log("Error:- ", error);
      // Handle the error
    }
  }

  // editItemList(event){
  //   for ( let item_row of event){
  //     if ( this.SelectItemsList.some(items => items.PaymentGUID == item_row.PaymentGUID)){
  //       this.toastMessage.error("This Payment Already Exists")
  //     }
  //     else
  //     {
  //       // this.toastMessage.success( "Payments Added successfully")
  //       this.SelectItemsList.push(item_row)
  //       this.openItemList = false // Close the Popup

  //     }
  //     // console.log("Edit Item: ", item_row)
  //   }
  //   this.TotalNetAmount()
  // }

  // removeItem(item){
  //   const index  = this.SelectItemsList.indexOf(item)
  //   this.SelectItemsList.splice(index, 1)
  //   this.TotalNetAmount()
  // }

  getCustomerObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetRtlCustomerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.ngxSpinnerService.show()
    console.log("Befroe Customer SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {

          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            this.CustomerObject = [];
            // console.log("Customer Data:- ", data)
            if (Array.isArray(data.Customer)) {
              this.CustomerObject = data.Customer;
              this.CustomerCode = data.Customer[0]?.CustomerCode;
            }
            else {
              this.CustomerObject.push(data.Customer)
              this.CustomerCode = data?.Customer?.CustomerCode
              this.errorMessage = "";
            }
            // console.log("Customer Object:- ", this.CustomerObject)
            this.ngxSpinnerService.hide()
          }

        },
        error: err => {
          console.log(err)
        }

      }
    );
  }


  GetLocationObject() {
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    })
    requestdata.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (response: any) => {
        this.ngxSpinnerService.hide();
        let data = JSON.parse(response)
        if (data.ReturnCode == "0") {
          let extraData = JSON.parse(data.ExtraData)
          this.LocationObject = [extraData.Location] // Wrap the Object as an Array instead
          this.LocationCode = extraData?.Location?.LocationCode
          // console.log("Location Object:- ", extraData)
          this.ngxSpinnerService.hide()
        }
      }
    });
  }

  GetCustomerLedgerObject(eventDetail) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerLedgerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
    requestData.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.ngxSpinnerService.show()
    console.log("Before Ledger SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.hideSpinner()

          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            console.log("Ledger Object:- ", data)
            this.TotalCreditAmount = data?.CreditAmount
            this.TotalDebitAmount = data?.DebitAmount
            this.TotalBalanceAmount = this.TotalCreditAmount - this.TotalDebitAmount
            if (this.TotalBalanceAmount < 0) {
              this.toastMessage.error("You can't Refund this Customer! As the Balance Amount is Negative")
              this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list/'])
            }
            if (data?.Totalrecords < 1) {
              this.toastMessage.error("No Ledger Data Found")
              this.detailLedger.next({ totalRecord: data?.Totalrecords, Data: '' })
              return
            }
            if (Array.isArray(data?.CustomerLedgerDetails?.CustomerLedger)) {
              this.CustomerLedgerList = data?.CustomerLedgerDetails?.CustomerLedger;
            }
            else {
              this.CustomerLedgerList.push(data?.CustomerLedgerDetails?.CustomerLedger)
              this.errorMessage = "";
            }
            // console.log("Ledger List:- ", this.CustomerLedgerList)
            // Total Customer Ledger Records needs to be shown and viewed
            this.detailLedger.next({ totalRecord: data?.Totalrecords, Data: this.CustomerLedgerList })

            // Refund Data
            let RefundData = data.RefundList
            this.PreviousRequestedAmount = data?.PreviousRefundAmount == null || data?.PreviousRefundAmount == undefined ? 0.00 : data?.PreviousRefundAmount
            // this.PreviousRequestedAmount = data?.PreviousRefundAmount
            console.log(" Previous Amount ", this.PreviousRefundAmount)
            if (data.TotalRefundrecords == "0") {
              // this.toastMessage.error("No Previous Refunds Found")
              this.detailRequest.next({ totalRecord: data?.TotalRefundrecords, Data: '' })
              return
            }
            if (Array.isArray(RefundData?.RefundRow)) {
              this.RefundList = RefundData?.RefundRow;
            }
            else {
              this.RefundList.push(RefundData?.RefundRow)
            }
            // this.toast.success("Records Found")
            console.log("Refund Rows are:- ", this.RefundList)
            // Just show Top 10 Previously Requested Refund Records
            this.detailRequest.next({ totalRecord: data?.TotalRefundrecords, Data: this.RefundList })
            this.IsApproverObject();
          }
        },
        error: err => {
          this.hideSpinner()
          console.log(err)
        }

      }
    );
  }

  PageChangeLedger(event) {
    switch (event.eventType) {
      case "PageChange":
        this.GetCustomerLedgerObject(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
    }
  }

  PageChangeRefund(event) {
    this.pageChangeRefund = true
    switch (event.eventType) {
      case "PageChange":
        this.GetCustomerLedgerObject(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
        break;
    }
  }

  actionEmit(event) {
    // console.log("action Emit", event);
    if (event.action == 'APPROVE') {
      return
    }
  }



  SaveRefundRequest() {
    if ( this.isApprover ){
      this.toastMessage.error("Approvers can't create a Refund Request")
      return;
    }

    if (this.RefundDocType == null || this.RefundDocType == undefined) {
      this.toastMessage.error("Select a Refund Type")
      return;
    }
    this.PreviousRefundAmount == null || this.PreviousRefundAmount == undefined ? this.PreviousRefundAmount = 0 : ''
    if (this.TotalRequestedAmount == null || this.TotalRequestedAmount == undefined) {
      this.toastMessage.error("Refund Amount can't be Empty")
      return;
    }
    else if (this.TotalRequestedAmount <= 0) {
      this.toastMessage.error("Refund Amount should be greater than Zero")
      return;
    }
    else if (this.TotalRequestedAmount > this.TotalBalanceAmount - this.PreviousRequestedAmount) {
      this.toastMessage.error("Refund Amount can't be greater than the Difference of Balance and Previously requested amount")
      return;
    }
    if (this.RefundDocType == null || this.RefundDocType == undefined || this.RefundDocType == '') {
      this.toastMessage.error("Kindly select a Refund Type")
      return;
    }

    if (this.PaymentList.length < 1) {
      this.toastMessage.error("Kindly select atleast one Sales Return")
      return;
    }

    //  Added By Aditya start 
    if (this.Refund_AccountNumber == null || this.Refund_AccountNumber == undefined) {
      this.toastMessage.error("Refund AccountNumber cannot be empty !");
      return
    }
    if (this.Refund_CustomerName == null || this.Refund_CustomerName == undefined) {
      this.toastMessage.error("Refund Customer Name cannot be empty !");
      return
    }
    if (this.Refund_IfscCode == null || this.Refund_IfscCode == undefined) {
      this.toastMessage.error("Refund IFSC CODE cannot be empty !");
      return
    }

    if (this.Refund_RefundName == null || this.Refund_RefundName == undefined) {
      this.toastMessage.error("Refund Against Name  cannot be empty !");
      return
    }
    // Added By Aditya End 

    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false) {
      return
    }

    if (this.submitClicked == true) {
      return;
    }
    this.submitClicked = true
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveRefundRequest"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.params.customercode != null || this.params.customercode != undefined ? this.params.customercode : this.CustomerCode
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode != null || this.params.locationcode != undefined ? this.params.locationcode : this.LocationCode
    });
    requestData.push({
      "Key": "RefundDocType",
      "Value": ''
    });
    requestData.push({
      "Key": "ApprovalStatus",
      "Value": 'SENT FOR APPROVAL'
    });
    requestData.push({
      "Key": "RefundDate",
      "Value": new Date(),
    });
    requestData.push({
      "Key": "RefundRemark",
      "Value": this.RemarkUploadList[0].RemarkDescription
      // "Value": this.RefundRemark == null || this.RefundRemark == undefined ? "" : this.RefundRemark
    });
    requestData.push({
      "Key": "RefundGUID",
      "Value": this.RefundGUID
    });
    requestData.push({
      "Key": "RequestAmount",
      "Value": this.TotalRequestedAmount
    });
    // requestData.push({
    //   "Key": "PaymentDetailxml",
    //   "Value": this.PaymentDetailxml()
    // });
    requestData.push({
      "Key": "RefundRequestDetails",
      "Value": this.RefundRequestDetails()
    });

    // Added By Aditya start 
    requestData.push({
      "Key": "AccountNumber",
      "Value": this.Refund_AccountNumber
    });
    requestData.push({
      "Key": "CustomerName",
      "Value": this.Refund_CustomerName
    });
    requestData.push({
      "Key": "IfscCode",
      "Value": this.Refund_IfscCode
    });
    requestData.push({
      "Key": "RefundName",
      "Value": this.Refund_RefundName
    });
    // Added By Aditya End 

    // Optional parameters:- 
    // if (this.RefundDocType == 'SREFUND'){
    //   requestData.push({
    //     "Key": "SalesReturnGUID",
    //     "Value": this.salesReturnObj.SalesReturnGuid
    //   });
    //   requestData.push({
    //     "Key": "SalesReturnCode",
    //     "Value": this.salesReturnObj.SalesReturnCode
    //   });
    //   requestData.push({
    //     "Key": "InvoiceGUID",
    //     "Value": this.salesReturnObj.InvoiceGuid
    //   });
    //   requestData.push({
    //     "Key": "InvoiceCode",
    //     "Value": this.salesReturnObj.InvoiceCode
    //   });
    // }

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("DATA BEFORE SENDING IS :- ", requestData);
    // // TODO 
    // this.SaveFiles();
    // alert("Return on")
    // return
    this.showSpinner()
    this.ngxSpinnerService.show();



    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked = false
          // this.ngxSpinnerService.hide();
          let response = JSON.parse(value.toString());
          // console.log("Response: " , response)
          
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData)
            this.SaveFiles();

          }
          else {
            this.submitClicked = false
            this.hideSpinner()
            console.log("Error Response: ", response)
            this.toastMessage.error(response?.ReturnMessage)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(this.errorMessage, (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              // console.log("Messages : " ,errorMessages)
              errorMessages.forEach((errorMessage) => {
                // console.log("Error Message: " , error)
                this.toastMessage.error(errorMessage.ERRORMESSAGE);
              });
            });
          }
        },
        error: err => {
          
          this.submitClicked = false
          this.hideSpinner()
          this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:-  " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });
  }


  // PaymentDetailxml(){
  //   let rawData = {
  //     "rows": []
  //   }
  //   let count = 0;
  //   for (let item of this.PaymentList) {
  //     count += 1
  //         

  //     rawData.rows.push({
  //       "row": {
  //         "RefundGUID" : this.RefundGUID,
  //         "RefundDetailGUID" : uuidv4(),
  //         // "PaymentDetailGUID": item.PaymentDetailGUID,
  //         // "PaymentGUID": item.PaymentGUID,
  //         // "ModeOfPayment": item.ModeOfPayment  ,
  //         // "InvoiceGUID": item.InvoiceGUID  ,
  //         // "SalesReturnGUID": item.SalesReturnGuid == null || item.SalesReturnGuid == undefined ? '00000000-0000-0000-0000-000000000000' :item.SalesReturnGuid,
  //         "RefundAmount": item.RefundAmount,
  //         "RefundDocType" : item.RefundDocType,
  //         // "PaymentCode" : item.PaymentCode,
  //         // "SalesReturnCode": item.SalesReturnCode
  //         "TransactionCode": item.TransactionCode,
  //         "TransactionGUID": item.TransactionGUID,
  //       }
  //     })
  //   }
  //   var builder = new xml2js.Builder();
  //   var xml = builder.buildObject(rawData);
  //   xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //   console.log("XML is:- ", xml)
  //   return xml;
  // }

  RefundRequestDetails() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.PaymentList) {
      count += 1

      rawData.rows.push({
        "row": {
          "RefundGUID": this.RefundGUID,
          "RefundDetailGUID": uuidv4(),
          "RefundAmount": item.RefundAmount,
          "RefundDocType": item.RefundDocType,
          "TransactionCode": item.TransactionCode,
          "TransactionGUID": item.TransactionGUID,
          "isDeleted": '0'
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("XML is:- ", xml)
    return xml;
  }


  // FILE UPLOAD PART ************************************************************************************************
  onFileListChanged(event) {
    this.FileUploadList = event;
    this.isImageUpload = false;
  }

  async sendFilesToServer() {
    const uploadPromises = this.FileUploadList.map(async (file) => {
      // let formData = new FormData();
      // var filename = uuidv4() + "_" + file.filename;
      // formData.append('file', file.AttachmentFile, filename);
      var ext = file.filename.split('.').pop();
      var filename = uuidv4() + "." + ext;
      // formData.append('file', file.AttachmentFile, filename);
      const result = await this.dynamicService.uploadFileToS3Local(file.AttachmentFile, filename);
      file.src = result['dbPath'];// glob.GLOBALVARIABLE.SERVER_LINK + result['dbPath'];
    });
    await Promise.all(uploadPromises)
  }

  saveFilesXML() {

    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.FileUploadList) {
      count += 1
      rawData.rows.push({
        "row": {
          "AttachmentGUID": item.AttachmentGUID == null || item.AttachmentGUID == undefined ? uuidv4() : item.AttachmentGUID,
          "FileName": item.filename,
          "FileType": item.type,
          "CreatedDateTime": item.createdDateTime == null || item.createdDateTime == undefined ? new Date().toISOString() : item.createdDateTime.toISOString(),
          "AttachmentFile": item.src,
          "CloudFlag": "1"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("File XML is:- ", xml)
    return xml;
  }

  async SaveFiles() {
    if (this.FileUploadList.length < 1) {
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
      return
    }

    let requestData = []
    if (this.RefundGUID == null || this.RefundGUID == undefined) {
      this.toastMessage.error("No Refund GUID Found!")
      return
    }
    this.showSpinner()
    try {
      await this.sendFilesToServer();
    }
    catch (error) {
      this.submitClicked = false
      this.toastMessage.error("Error in Uploading Files to Server");
      return;
    }

    requestData.push({
      "Key": "APIType",
      "Value": "SaveTransactionAttachment"
    })
    requestData.push({
      "Key": "TransactionGUID",
      "Value": this.RefundGUID
    })
    requestData.push({
      "Key": "TransactionDocType",
      "Value": 'RREFUND'
    })
    requestData.push({
      "Key": "FilesXml",
      "Value": this.saveFilesXML()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Transaction File Request", requestData)
    // // TODO:- 
    // return
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked = false
          // this.ngxSpinnerService.hide()
          // console.log("Request ", value)
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            // console.log("ExtarData", ExtraData)
            this.hideSpinner();
            this.toastMessage.success('Submitted Succesfully')
            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
          }
          else {
            this.submitClicked = false
            this.hideSpinner()
            console.log("Messages : ", response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(this.errorMessage, (error, result) => {
              console.log("Error Message: ", error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toastMessage.error(errorMessage.ERRORMESSAGE);
              });
            });
          }
        },
        error: err => {
          this.submitClicked = false
          this.hideSpinner()
          // this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });

  }

  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }
  getNonEmptyRemarksCount(): number {
    return this.RemarkUploadList.filter(item => item.RemarkDescription != '').length;
  }
  // Remark Part:- 
  onRemarkListChanged(event) {
    this.RemarkUploadList = event;
    this.isRemarkUpload = false;
  }



  // // **********************************************************************************************************************
  // // Customer Parts 

  // results : any[] = [];
  // customerCode: string = ''
  // customerName: string = ''
  // phonenumber: string = ''
  // email: string = ''
  // toolBarAction: any[] = [];

  // showonlyselected: boolean = false;
  // close: boolean;
  // searchText: String = "";
  // SelectedPartCount: Number = 0;
  // SelectCustomerList: any[]= []
  // // @Output() materialList  = new EventEmitter<any>();
  // openCustomerPopup= false
  // // @Input() stockTypeData: string;
  // @Input() selectedLocation: string ;

  // detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);


  // columns: Columns[] = [
  //   { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
  //   { datatype: "STRING", field: "FirstName", title: "FirstName" },
  //   { datatype: "STRING", field: "LastName", title: "LastName" },
  //   { datatype: "STRING", field: "EmailID", title: "EmailID" },
  //   { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
  // ]
  // actionDetails: any[]= [
  //   {  "code": "REFUND" , "icon": "undo", "title": "Refund"}
  // ];


  // actionEmit(event : any){
  //   console.log("event ", event)
  //   if (event.action == "REFUND" ){
  //     // Open Dialog Box :- 
  //     this.dialog.open(RefundPopupComponent, {
  //       data: {
  //         LocationCode: this.selectedLocation,
  //         CustomerCode: event.row.CustomerCode,
  //       }
  //       });
  //   }
  // }

  // PageChange(event){
  //   switch (event.eventType) {
  //     case "PageChange":
  //         this.GetCustomerList(
  //           event.eventDetail
  //           ,this.customerCode, this.customerName, this.phonenumber, this.email
  //         );
  //         setTimeout(() => { this.jobListHideSpinnerEvent.next(); }, 500);
  //         break;
  //   }
  // }

  // search() {
  //   this.GetCustomerList(event, this.customerCode, this.customerName, this.phonenumber, this.email);
  // }

  // GetCustomerList(eventDetail, customercode, customername, phonenumber, email)
  // {
  //   this.results = []
  //   //  ;
  //   // console.log("Event for Page Change:- ", eventDetail.pageIndex);
  //   this.ngxSpinnerService.show();
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "APIType",
  //     "Value": "GetCustomerList4Job"
  //   });
  //   requestData.push({
  //     "Key": "CustomerCode",
  //     "Value": customercode
  //   });
  //   requestData.push({
  //     "Key": "CustomerName",
  //     "Value": customername
  //   });
  //   requestData.push({
  //     "Key": "MobileNo",
  //     "Value": phonenumber
  //   });
  //   requestData.push({
  //     "Key": "EmailId",
  //     "Value": email
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "GSTNO",
  //     "Value": ''
  //   });
  //   requestData.push({
  //     "Key": "PageNo",
  //     "Value": eventDetail.pageIndex != null || eventDetail.pageIndex != undefined ? eventDetail.pageIndex + 1 : "1"
  //   });
  //   requestData.push({
  //     "Key": "PageSize",
  //     "Value": eventDetail.pageSize !=  null || eventDetail.pageSize != undefined? eventDetail.pageSize : "10"
  //   });
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {

  //      next: (Value) => {
  //         try {
  //           let response = JSON.parse(Value.toString());
  //           if (response.ReturnCode == '0') {
  //             let data = JSON.parse(response?.ExtraData);

  //             if (Array.isArray(data?.CustomerList?.Customer)) {
  //               this.results = data?.CustomerList?.Customer;
  //             }
  //             else {
  //               this.results.push(data?.CustomerList?.Customer);
  //             }
  //             console.log("Results are ", this.results)
  //            this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
  //             this.ngxSpinnerService.hide()
  //           }
  //         } catch (ext) {
  //         }
  //       },
  //       error: err => {
  //       }

  //     }
  //   );
  // }
  // closeBtn()
  // {
  //   this.openCustomerList = false; 
  // }
  //  onDocumentCodeSearch($event: { term: string; item: any[] }) {
        // this.dropdownDataService.fetchDropDownData(DropDownType.RefundDocCode, $event.term, {
  //         CompanyCode:  glob.getCompanyCode().toString(),
  //         DocType:  this.RefundDocType,
  //         CustomerCode: this.params.customercode
  //       }).subscribe({
  //         next: (value) => {
  //           if (value != null) {
  //             this.RefundDocCodeDD = value;
  //             console.log("RefundDocCodeDD  :- ", this.RefundDocCodeDD);
  //           }
  //         },
  //         error: (err) => {
  //           this.RefundDocCodeDD = DropDownValue.getBlankObject();
  //         }
  //       });
  //     }
  onDocumentCodeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.AdvancePaymentCode, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      DocType: this.RefundDocType,
      CustomerCode: this.params.customercode
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.RefundDocCodeDD = value;
          console.log("RefundDocCodeDD  :- ", this.RefundDocCodeDD);
        }
      },
      error: (err) => {
        this.RefundDocCodeDD = DropDownValue.getBlankObject();
      }
    });
  }

}