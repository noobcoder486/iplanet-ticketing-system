import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType, RequestValue } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "../../config/global";
import xml2js from 'xml2js';
import { Location } from '@angular/common'
import { Columns } from 'src/app/models/column.metadata';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-refund-order',
  templateUrl: './refund-order.component.html',
  styleUrls: ['./refund-order.component.css']
})
export class RefundOrderComponent implements OnInit {

  // Hide or Disable Settin for the HTML:- 
  hideLocationandCustomer: boolean = true;
  // @ViewChild('LocationandCustomer', {static: true}) showLocationAndCustomer: ElementRef;
  @ViewChild('CardDetails', {static: true}) CardDetails: ElementRef;
  // showLocationAndCustomer= true

  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  SelectItemsList: any[] = []
  PaymentList: any[] = [];

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  errorMessage: any;
  LocationCode: string;
  CustomerCode: string;
  
  // Refund:-
  PreviousRefundAmount: number =0.00
  Spinner = false
  RefundGUID: string;
  RequestCode: string;
  RefundList : any[] =[]
  params: any;
  RefundDocType: string
  // productCategory: any;
  currentDate: Date;
  ObjectData = false ; //Object boolean
  userName: string; 
  CreatedDate : string; 

  RefundRequestedAmount: number = 0;
  openCustomerList = false
  isEdit = false ;

  // Local Approver:-
  ifStatusChange = false;
  isApproverL1: boolean = false;
  isApproverL2: boolean = false;
  ApproverLevel: number = 0;
  CreatedBy: string;
  // Status
  SalesReturnCode :string;
  ApprovalStatus: string;
  RefundStatus: string;
  FinancierStatus: string;
  openItemList = false;
  // SalesReturnVariables
  totalBaseAmount: number = 0;
  totalDiscountAmount: number = 0;
  totalNetAmount: number = 0;
  totalTaxAmount: number = 0;
  totalTaxableAmount: number = 0;

  // Payment Part:- 
  showOnlySelected = false;
  paymentDetailArray: any[] = []
  RefundPaidAmount: number = 0;
  Amount: number = 0.00;
  ModeofPaymentDD: DropDownValue = DropDownValue.getBlankObject();
  modeofPaymentData: string = ''; 
  GLCodeData: string;
  houseofBank: string;
  AccountNo: string = '';
  AuthNo: string = '';
  CardType: any = ['Visa', 'Master Card']
  CardTypeData: string = '';
  CardNo: string = '';
  Adjudication: string = '';
  TerminalId: string = ''
  RequestedAmt: any;
  AccountHolderName: string = ''
  BankCode: string = ''
  BankAccountNo: number;
  hidePayRefund= true;

  // Remark
  isRemark = false;
  RefundRemark: string
  whenSalesReturn = false // whenSalesReturn is true only when DocType='SREFUND' and RefundSatus = 'SENT FOR APPROVAL'
  // File Upload
  isImageUpload= false;
  FileUploadList: any[] = [];

  // Remarks Part
  isRemarkUpload= false;
  RemarkLevel: number;
  RemarkUploadList: any[] = [] // Remark in request is object and in Approval is List
  ProcessTotalRecords: number =0;
  
  // Customer Ledger
  pageChangeRefund = false
  TotalCreditAmount: number = 0;
  TotalBalanceAmount: number = 0;
  TotalDebitAmount: number = 0;
  PreviousRequestedAmount : number = 0;
  CustomerLedgerList: any[] =[]
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
  actionDetails: any[]= [ ];
  detailLedger: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  detailRequest: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  submitClicked = false
  
  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
    private location : Location,
    // private renderer: Renderer2
  ) { }


  ngOnInit() {
      this.currentDate = new Date();
      //  
      this.userName = glob.getLogedInUser().UserDetails.UserName;
      this.params = this.activatedRoute.snapshot.queryParams;
      this.onLocationSearch({ term:"", item:[]})
      
      // this.RefundStatus = "NEW";
      if (this.params.refundguid != null || this.params.refundguid != undefined) {
        this.GetRefundRequestObject();
      } 
 
      else if (Object.keys(this.params).length == 0) {
        this.toastMessage.warning("Access Denied")
        this.location.back()
      }

      const allowedParams = [ 'refundguid']
      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }
    }

    
  onLocationSearch($event: { term: string; item: any[] }) {
    // console.log("Term", event)
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          // console.log("Location  Data :- ", this.LocationForJob);
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  async IsApproverObject(){

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
      "Value": this.LocationCode 
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest ={
      "content": strRequestData,
    }
    try {
        const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
        const value = await lastValueFrom(observable);

        const response = JSON.parse(value.toString());
        // console.log("Approval Object Response", response)
        if (response.ReturnCode == '0') {
         
          let extraDataResponse = JSON.parse(response?.ExtraData);
          console.log("Approval Object Extra", extraDataResponse);
          if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName ) {
            let level = extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel
            this.RemarkLevel = parseInt(level.replace('L', ''));
            // console.log("Remark Level ", this.RemarkLevel)
            if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L1') {
              this.ApprovalStatus == 'SENT FOR APPROVAL' ? this.ifStatusChange = true: this.ifStatusChange = false
              this.isApproverL1 = true
            } 
            else if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L2') {
              this.ApprovalStatus == 'PARTIALLY APPROVED' ? this.ifStatusChange = true : this.ifStatusChange = false
              this.isApproverL2 = true
            }
          }
          // this.checkStatusChange()    
        } else {
          console.log("Error in getting the Approval Object");
        }
      } catch (error) {
        console.log("Error:- ", error);
        // Handle the error
      }
  }
  
  
  getCustomerObject( ) {
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
    // console.log("Befroe Customer SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          //  
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.CustomerObject = [];
              // console.log("Customer Object:- ", data)
              if (Array.isArray(data.Customer)) {
                this.CustomerObject = data?.Customer;
                this.CustomerCode = data?.Customer?.CustomerCode
              }
              else {
                this.CustomerObject.push(data.Customer)
                this.CustomerCode = data?.Customer?.CustomerCode
                this.errorMessage = "";
              }
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
      "Key":"ApiType",
      "Value":"GetLocationObject"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode
    })
    requestdata.push({
      "Key":"CompanyCode",
      "Value":glob.getCompanyCode()
    })
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next:(response:any)=>{
        this.ngxSpinnerService.hide();
        let data = JSON.parse(response)
        if(data.ReturnCode == "0")
        {
          let extraData = JSON.parse(data.ExtraData)
          this.LocationObject = [extraData.Location] // Wrap the Object as an Array instead
          this.LocationCode = extraData?.Location?.LocationCode
          // console.log("Location Object:- ", extraData)
          this.ngxSpinnerService.hide()
        }
      }
    });
  }

  GetCustomerLedgerObject( eventDetail ) {
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
      "Key": "GUID",
      "Value": this.params.refundguid // To get Previous Requested Amount - Current Requested Amount
    });
    requestData.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestData.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
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
              if( data?.Totalrecords < 1){
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
              this.detailLedger.next({ totalRecord: data?.Totalrecords , Data: this.CustomerLedgerList })

              // Refund Data
              let RefundData = data.RefundList
              // this.PreviousRequestedAmount = data?.PreviousRefundAmount== null || data?.PreviousRefundAmount == undefined ? 0.00 : data?.PreviousRefundAmount
              this.PreviousRequestedAmount = data?.PreviousRefundAmount
              console.log(" Previous Amount ",this.PreviousRefundAmount)
              if (data.TotalRefundrecords == "0"){
                // this.toastMessage.error("No Previous Refunds Found")
                this.detailRequest.next({ totalRecord: data?.TotalRefundrecords, Data: '' })
                return
              }
              if( Array.isArray(RefundData?.RefundRow) ) {
                this.RefundList = RefundData?.RefundRow;
              }
              else{
                this.RefundList.push(RefundData?.RefundRow)
              }
              // this.toast.success("Records Found")
              console.log("Refund Rows are:- ",this.RefundList)
              // Just show Top 10 Previously Requested Refund Records
              this.detailRequest.next({ totalRecord: data?.TotalRefundrecords , Data: this.RefundList })
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

  
  PageChangeLedger( event){    
    switch(event.eventType){
      case "PageChange":
        this.GetCustomerLedgerObject(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  PageChangeRefund( event){
    this.pageChangeRefund = true    
    switch(event.eventType){
      case "PageChange":
        this.GetCustomerLedgerObject(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  actionEmit(event){
    // console.log("action Emit", event);
    if(event.action == 'APPROVE'){ 
      return
    }
  }

  async GetRefundRequestObject()
  {
    //  
    this.ApprovalStatus = null // Reset ApprovalStatus
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetRefundRequestObject"
    })
    requestdata.push({
      "Key":"RefundGUID",
      "Value":this.params.refundguid
    })
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Refund Response is ", requestdata)
    
    this.ngxSpinnerService.show();
    try {
          let Value = await lastValueFrom(this.dynamicService.getDynamicDetaildata(contentRequest));
          this.ngxSpinnerService.hide();
          
          let response = JSON.parse(Value.toString());
          console.log("Refund Response is ", response)

          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            console.log("Refund Object:- ", data)
            // Set all the Data like DDs and Objects:- 
            this.RefundDocType = data.RefundDocType
            this.CustomerCode = data.RetailCustomerCode
            this.LocationCode = data.LocationCode
            this.RefundRemark = data.RefundRemark
            this.RefundRequestedAmount = data.RequestAmount
            this.RefundPaidAmount = data.RefundAmount == null ? 0 : data.RefundAmount
            this.ApprovalStatus = data.ApprovalStatus
            this.RefundGUID = data.RefundGUID
            this.CreatedDate= data.CreatedDate
            this.RequestCode = data.RequestCode
            this.RefundStatus = data.RefundStatus
            this.CreatedBy = data.CreatedBy

            this.GetFileObject()
            // Remark Part:-
            this.RemarkUploadList[0] = {
              RemarkLevel: 'Request Remark',
              RemarkDescription:data?.RefundRemark,
              RemarkDate: data.CreatedDate,
              isEdit: false
            };
            this.GetProcessObject()
            // Get all the Related Data:- 
            this.getCustomerObject()
            this.GetLocationObject()
            
            // if ( this.RefundDocType == 'SREFUND'){
            //   if( Array.isArray(data?.RefundPaymentList?.RefundPayment) ) {
            //     this.PaymentList = data?.RefundPaymentList?.RefundPayment;
            //   }
            //   else{
            //     this.PaymentList.push(data?.RefundPaymentList?.RefundPayment)
            //   }
            // }
            
              if( Array.isArray(data?.RefundRequestDetails?.RefundRequestDetails) ) {
                this.PaymentList = data?.RefundRequestDetails?.RefundRequestDetails;
              }
              else{
                this.PaymentList.push(data?.RefundRequestDetails?.RefundRequestDetails)
              }
            
            this.GetCustomerLedgerObject('')
            this.IsApproverObject();
          }
          else{
            this.toastMessage.error("No Data Found")
            this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
          }
    
    } catch (ext) {
      error: err => {
        this.ngxSpinnerService.hide()
        console.log(err)
      }
    }
  }

  RefundApproveReject(status){

    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "RequestStatusChange"
    });
    requestData.push({
      "Key": "RefundGUID",
      "Value": this.RefundGUID
    });
    if (this.isApproverL1 == true){
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": status == 'APPROVED' ?  'PARTIALLY APPROVED' : 'REJECTED'
      });
      requestData.push({
        "Key": "Status",
        "Value": 'NA'
      });
      
    }
    else if (this.isApproverL2 == true){
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": status
      });
      requestData.push({
        "Key": "Status",
        "Value":status == 'APPROVED' ?  'PENDING' : 'REJECTED'
      });
    }
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    this.showSpinner()
    // if(this.submitClicked == true)
    // {
    //   return;
    // }
    // this.submitClicked=true 
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Changing Status SP:- ", requestData)
    // // TODO
    // this.SaveProcessApprovalStatus(status);
    
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
            this.submitClicked= false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.ApprovalStatus = data.ApprovalStatus
              this.SaveProcessApprovalStatus(status);
              this.hideSpinner()
              this.ngxSpinnerService.hide()
            }
            else {
              this.submitClicked= false
              this.hideSpinner()
              this.ngxSpinnerService.hide()
              // console.log("Error Response: " , response)
              this.errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString( this.errorMessage , (error, result) => {
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
            this.submitClicked= false
            this.hideSpinner()
            this.ngxSpinnerService.hide();
            // console.log("Error Message:- ", err)
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
        
      }
    );
  }


  // TotalNetAmount() {
  //     this.RefundRequestedAmount = 0
  //     // console.log("Selected Item list", this.SelectItemsList)
  //     if(this.params.salesreturnguid){
  //       this.RefundRequestedAmount = this.SelectItemsList.reduce(
  //         (acc, item) => acc +  parseFloat(item.NetAmount),
  //         0);
  //     }
  //     else{
  //       this.RefundRequestedAmount = this.SelectItemsList.reduce(
  //       (acc, item) => acc +  parseFloat(item.Amount),
  //       0);
  //     }
  // }
  
  
  SaveProcessApprovalStatus(status){
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveProcessApprovalStatus"
    });
    requestData.push({
      "Key": "ProcessType",
      "Value": 'Refund'
    });
    requestData.push({
      "Key": "GUID",
      "Value": this.RefundGUID
    });
    if (this.isApproverL1 == true){
      requestData.push({
        "Key": "Status",
        "Value": status
      });
      requestData.push({
        "Key": "ApprovalLevel",
        "Value": 'L1'
      });
    }
    else if (this.isApproverL2 == true){
      requestData.push({
        "Key": "Status",
        "Value": status
      });
      requestData.push({
        "Key": "ApprovalLevel",
        "Value": 'L2'
      });
    }
    let remark = this.RemarkUploadList[this.RemarkLevel]?.RemarkDescription
    requestData.push({
      "Key": "ApprovalRemark",
      "Value": remark == null || remark == undefined ? '' : remark
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Changing Status SP:- ", requestData)
    // // TODO
    // return
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
            // this.submitClicked= false
            this.ngxSpinnerService.hide()
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("After Process ", response)
              this.toastMessage.success("Status Changed Successfully")
              this.hideSpinner()
              this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
            }
            else {
              // this.submitClicked= false
              this.hideSpinner()
              // console.log("Error Response: " , response)
              this.errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString( this.errorMessage , (error, result) => {
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
            this.submitClicked= false
            this.hideSpinner()
            this.ngxSpinnerService.hide();
            // console.log("Error Message:- ", err)
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
        
      }
    );
  }


  Cancel(event){
    this.isImageUpload = false
  }
  GetFileObject(){
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetTransactionAttachmentObject"
    })
    requestData.push({
      "Key": "TransactionGUID",
      "Value": this.params.refundguid
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("File Object" , response)
          if (response.ReturnCode == '0') {
            if (response.Totalrecords != "0") {
              let data = JSON.parse(response.ExtraData)
              console.log("File Object" , data)
              if ( data?.AttachmentList?.AttachmentRow != null || data?.AttachmentList?.AttachmentRow !=undefined){
                Array.isArray(data?.AttachmentList?.AttachmentRow) ?
                  this.FileUploadList = data?.AttachmentList?.AttachmentRow
                    : this.FileUploadList.push(data?.AttachmentList?.AttachmentRow)
              }
            }
            else {
              this.toastMessage.error("No Files found")
            }
          }
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  getNonEmptyRemarksCount(): number {
    return this.RemarkUploadList.length - this.RemarkUploadList.filter(item => item?.RemarkDescription == '' ||  item?.RemarkDescription == null || item?.RemarkDescription == undefined ).length;
  }

  GetProcessObject(){
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetProcessApprovalStatus"
    })
    requestData.push({
      "Key": "ProcessType",
      "Value": 'Refund'
    })
    requestData.push({
      "Key": "GUID",
      "Value": this.RefundGUID
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    // console.log("Before Process Object" , requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("Process Object" , response)
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)
            this.ProcessTotalRecords = data?.Totalrecords
            if (data.Totalrecords != "0") {
              console.log("Get ProcessApproval Object" , data)
              if(Array.isArray(data.ProcessList.ProcessRow))
              {
                for ( let process of data.ProcessList.ProcessRow){
                  this.RemarkUploadList.push({
                    RemarkLevel: process.ApprovalLevel,
                    RemarkDescription: process?.ApprovalRemark,
                    RemarkDate: new Date(process.CreatedDate),
                    isEdit: false
                  })
                }
              }
              else{
                this.RemarkUploadList.push({
                  RemarkLevel: data.ProcessList.ProcessRow.ApprovalLevel,
                  RemarkDescription: data?.ProcessList?.ProcessRow?.ApprovalRemark,
                  RemarkDate: new Date(data.ProcessList.ProcessRow.CreatedDate),
                  isEdit: false
                })
              }
              // console.log("GetProcessApprovalObject" , this.RemarkUploadList)
            }
            else {
              // this.CheckRemarks('L1')
            }
          }
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  onRemarkListChanged(event){
    this.RemarkUploadList = event;
    this.isRemarkUpload = false;
  } 

  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }

}