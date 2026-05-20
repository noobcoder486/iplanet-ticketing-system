import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType, RequestValue } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "src/app/config/global";
import xml2js from 'xml2js';
import { DatePipe, Location } from '@angular/common'
import { v4 as uuidv4, parse } from 'uuid';
import { Columns } from 'src/app/models/column.metadata';
import { BehaviorSubject, lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-refund-order-created',
  templateUrl: './refund-order-created.component.html',
  styleUrls: ['./refund-order-created.component.css']
})
export class RefundOrderCreatedComponent implements OnInit {

  
  // Hide or Disable Settin for the HTML:- 
  hideLocationandCustomer: boolean = true;
  // @ViewChild('LocationandCustomer', {static: true}) showLocationAndCustomer: ElementRef;
  @ViewChild('CardDetails', {static: true}) CardDetails: ElementRef;
  // showLocationAndCustomer= true

  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  RefundedList: any[] = []
  PaymentList: any[] = [];

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  errorMessage: any;
  LocationCode: string;
  CustomerCode: string;
  
  // Refund:-
  RefundDocType : string
  PreviousRefundAmount: number =0.00
  RefundRequestedAmount: number
  RefundPaidAmount = 0
  RefundGUID: string;
  RequestCode: string;
  PreviousRefundList : any[] =[]
  params: any;
  // productCategory: any;
  currentDate: Date;
  ObjectData = false ; //Object boolean
  userName: string; 
  CreatedDate : string; 

  TotalPaymentAmount: number = 0;
  openCustomerList = false
  isEdit = false ;


  // Local Approver:-
  isApproverL3: boolean = false;
  ApproverLevel: number = 0;
  CreatedBy: string;
  showButtons = false ;
  // Status
  ApprovalStatus: string;
  RefundStatus: string;
  openItemList = false;
  // SalesReturnVariables
  SalesReturnGUID: string
  RefundCode: string
  SalesReturnGuid : string;
  SalesReturnCode : string;
  InvoiceGuid : string;
  InvoiceCode : string;
  totalBaseAmount: number = 0;
  totalDiscountAmount: number = 0;
  totalNetAmount: number = 0;
  totalTaxAmount: number = 0;
  totalTaxableAmount: number = 0;

  // Payment Part:- 
  showOnlySelected = false;
  paymentDetailArray: any[] = []
  Amount: number = 0.00;
  ModeofPaymentDD: DropDownValue = DropDownValue.getBlankObject();
  modeofPaymentData: string = ''; 
  GLCodeData: string;
  houseofBank: string;
  AccountNumber: string = '';
  AuthenticationNumber: string = '';
  CardType: any = ['Visa', 'Master Card']
  CardTypeData: string = '';
  CardNo: string = '';
  Adjudication: string = '';
  TerminalId: string = ''
  RequestedAmt: any;
  AccountHolderName: string = ''
  BankCode: string = ''
  BankAccountNumber: number;
  UPITransactionId: string = "";
  hidePayRefund= true;
  ifStatusChange: boolean = false;
  // Remark
  isRemark = false;
  RefundRemark: string
  whenSalesReturn = false // whenSalesReturn is true only when DocType='SREFUND' and RefundStatus = 'SENT FOR APPROVAL'
  // File Upload
  isImageUpload= false;
  FileUploadList: any[] = [];

  // Remarks Part
  isRemarkUpload= false;
  RemarkLevel: number;
  RemarkUploadList: any[] = [] // Remark in request is object and in Approval is List
  ProcessTotalRecords: number =0;
  Spinner = false;
  HoldUnholdRemarks:any[]=[]
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
  RefundChangeRemark: string =''
  latestLevel: any;

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
    private location : Location,
    private datePipe: DatePipe,
  ) { }


  ngOnInit() {
    
      this.currentDate = new Date();
      
      this.userName = glob.getLogedInUser().UserDetails.UserName;
      this.params = this.activatedRoute.snapshot.queryParams;
      this.onLocationSearch({ term:"", item:[]})
      
      // this.RefundStatus = "NEW";
      if (this.params.refundguid != null || this.params.refundguid != undefined) {
        this.GetRefundRequestObject();
      } 
      else if (this.params.salesreturnguid != null || this.params.salesreturnguid != undefined) {
        // this.GetSalesReturnObject();
      } 
      else if (Object.keys(this.params).length == 0) {
        this.toastMessage.warning("Access Denied")
        this.location.back()
      }

      const allowedParams = [ 'refundguid', 'salesreturnguid']
      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }
      this.latestHoldUnholdLevel()
      this.getCustomerObject()
      this.GetLocationObject()
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
    // console.log("Before Approval Sp", requestData)
    try {
        const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
        const value = await lastValueFrom(observable);
        
        const response = JSON.parse(value.toString());
        console.log("Approval Object Response", response)
        if (response.ReturnCode == '0') {
          this.userName = glob.getLogedInUser().UserDetails.UserName;
          let extraDataResponse = JSON.parse(response?.ExtraData);
          if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName ) {
            let level = extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel
            this.RemarkLevel = parseInt(level.replace('L', ''));
            if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L3') {
              if ( this.ApprovalStatus == 'APPROVED' &&  (this.RefundStatus == 'PENDING' ||  this.RefundStatus == 'HOLD' || this.RefundStatus == 'UNHOLD' )) {
                this.isEdit = true
              }
              this.onModeofPaymentSearch({ term: "", item: [] });
            } 
          }
        } 
        else {
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

  onModeofPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundModeofPayment, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ModeofPaymentDD = value;
          console.log("mode of pay ", this.ModeofPaymentDD)
        }
      },
      error: (err) => {
        this.ModeofPaymentDD = DropDownValue.getBlankObject();
      }
    });
  }

  setfunction(){
    for(let item of this.ModeofPaymentDD.Data)
    {
      if(item.Id == this.modeofPaymentData)
      {
        console.log(" Id ", item.Id);
        this.GLCodeData = item.GLCode
        this.houseofBank = item.extraData
        break;
      }
    }
  }

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    
    if(resp?.View == true){
      this.ifStatusChange = true
    }

    return resp != undefined && resp?.View ? true : false;
  }

  async GetRefundRequestObject()
  {
    
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
    
    this.ngxSpinnerService.show();
    try {
          let Value = await lastValueFrom(this.dynamicService.getDynamicDetaildata(contentRequest));
          this.ngxSpinnerService.hide();
          let response = JSON.parse(Value.toString());
          // console.log("Refund Response is ", response)
          

          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            console.log("Refund Object:- ", data)
            // Set all the Data like DDs and Objects:- 
            this.CustomerCode = data.RetailCustomerCode
            this.LocationCode = data.LocationCode
            this.RefundRemark = data.RefundRemark
            this.RefundRequestedAmount = data.RequestAmount
            this.RefundPaidAmount = data.RefundAmount == null ? 0 : data.RefundAmount
            this.ApprovalStatus = data.ApprovalStatus
            this.RefundGUID = data.RefundGUID
            this.CreatedDate= data.CreatedDate
            this.RequestCode = data.RequestCode
            this.RefundCode = data.RefundCode
            this.RefundStatus = data.RefundStatus
            this.CreatedBy = data.CreatedBy
            // 
            this.SalesReturnGuid = data.SalesReturnGuid
            this.SalesReturnCode = data.SalesReturnCode
            this.InvoiceGuid = data.InvoiceGuid
            this.InvoiceCode = data.InvoiceCode
            
            if( this.ApprovalStatus == 'APPROVED' &&  (this.RefundStatus == 'PENDING' ||  this.RefundStatus == 'HOLD' || this.RefundStatus == 'UNHOLD' )){
              this.checkLocalPermission()
            }

            this.GetFileObject()
            // Remark Part:-
            this.RemarkUploadList[0] = {
              RemarkLevel: 'Request Remark',
              RemarkDescription:data.RefundRemark,
              RemarkDate: data.CreatedDate,
              isEdit: false
            };
            this.GetProcessObject()
            
            // Get all the Related Data:- 
            this.getCustomerObject()
            this.GetLocationObject()
            
            if ( data?.RefundDetailList?.RefundDetail != null || data?.RefundDetailList?.RefundDetail != undefined){
              if( Array.isArray(data?.RefundDetailList?.RefundDetail) ) {
                this.RefundedList = data?.RefundDetailList?.RefundDetail;
              }
              else{
                this.RefundedList.push(data?.RefundDetailList?.RefundDetail)
              }
              console.log("Refunded List:- ", this.RefundedList)
            }
            
            
            this.RefundDocType = data.RefundDocType
            // if ( this.RefundDocType == 'SREFUND'){
              if( Array.isArray(data?.RefundRequestDetails?.RefundRequestDetails) ) {
                this.PaymentList = data?.RefundRequestDetails?.RefundRequestDetails;
              }
              else{
                this.PaymentList.push(data?.RefundRequestDetails?.RefundRequestDetails)
              }
              console.log('this.PaymentList' , this.PaymentList)
            
            // this.TotalNetAmount();
            this.GetCustomerLedgerObject('')
            if ( this.RefundStatus == 'PENDING' || this.RefundStatus == 'UNHOLD' ||  this.RefundStatus == 'HOLD' ){
              this.IsApproverObject();
              this.onModeofPaymentSearch({ term: "", item: [] });
            }
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
    // console.log("Before Ledger SP:- ", requestData)
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
                this.PreviousRefundList = RefundData?.RefundRow;
              }
              else{
                this.PreviousRefundList.push(RefundData?.RefundRow)
              }
              // this.toast.success("Records Found")
              console.log("Refund Rows are:- ",this.PreviousRefundList)
              // Just show Top 10 Previously Requested Refund Records
              this.detailRequest.next({ totalRecord: data?.TotalRefundrecords , Data: this.PreviousRefundList })
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
    requestData.push({
      "Key": "RefundRemark",
      "Value": (this.RefundChangeRemark == null ||  this.RefundChangeRemark == undefined ) ? '' : this.RefundChangeRemark 
    });
    if(status == 'REJECTED'){
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": 'APPROVED'
      });
      requestData.push({
        "Key": "Status",
        "Value": 'REJECTED'
      });
    }
    else if(status == 'HOLD'){
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": 'APPROVED'
      });
      requestData.push({
        "Key": "Status",
        "Value": 'HOLD'
      });
    }
      else if(status == 'UNHOLD'){
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": 'APPROVED'
      });
      requestData.push({
        "Key": "Status",
        "Value": 'UNHOLD'
      });
    }
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    this.showSpinner()
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Changing Status SP:- ", requestData)
    // TODO
    // this.SaveProcessApprovalStatus(status);
    
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
            this.submitClicked= false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.SaveProcessApprovalStatus(status);
            }
            else {
              this.submitClicked= false
              this.hideSpinner()
              this.ngxSpinnerService.hide()
              // console.log("Error Response: " , response)
              console.log("Messages : " ,response)
              let errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString( errorMessage , (error, result) => {
                const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                errorMessages.forEach((errorMessage) => {
                  this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
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

  returnLevel(status){
    
  
   this.latestLevel  = String(this.latestLevel);
   if(this.latestLevel.charAt(0) == 'L'){ 
           return this.latestLevel = 'H-1'
   }
   else if(this.latestLevel == 'H-1'){ 
           return this.latestLevel = 'UH-1'
   }
   else {
    
     let temp = this.latestLevel.split('-');
      let alpha = temp[0]; 
      let numeric = parseInt(temp[1], 10);
           
         if(alpha == 'H'){
           return String( 'UH-'  +  numeric )
         }
       else{
         numeric=numeric+1;
         return  String( 'H-'  +  numeric )
       }
   }
  }

  SaveProcessApprovalStatus(status){

     
    if(status != 'REJECTED'){
      this.latestLevel = this.returnLevel(status);
    }
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
   requestData.push({
     "Key": "ApprovalRemark",
     "Value": (this.RefundChangeRemark == null ||  this.RefundChangeRemark == undefined ) ? '' : this.RefundChangeRemark
   });
   if(status == 'REJECTED'){
     requestData.push({
       "Key": "ApprovalStatus",
       "Value": 'REJECTED'
     });
     requestData.push({
       "Key": "Status",
       "Value": 'REJECTED'
     });
     requestData.push({
       "Key": "ApprovalLevel",
       "Value": 'L3'
     });
    
   }
     else if(status == 'HOLD'){
     requestData.push({
       "Key": "ApprovalStatus",
       "Value": 'APPROVED'
     });
     requestData.push({
       "Key": "Status",
       "Value": 'HOLD'
     });
     requestData.push({
       "Key": "ApprovalLevel",
       "Value": this.latestLevel
     });
   }
     else if(status == 'UNHOLD'){
     requestData.push({
       "Key": "ApprovalStatus",
       "Value": 'APPROVED'
     });
     requestData.push({
       "Key": "Status",
       "Value": 'PENDING'
     });
     requestData.push({
       "Key": "ApprovalLevel",
       "Value": this.latestLevel
     });
   }
   requestData.push({
     "Key": "RefundRemark",
     "Value": this.RemarkUploadList[0].Refund_RemarkDescription
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
 latestHoldUnholdLevel() {
     
   let requestData = [];
   requestData.push({
     "Key": "APIType",
     "Value": "GetLatestProcessApprovalStatus"
   });
   requestData.push({
     "Key": "GUID",
     "Value": this.params.refundguid
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
         
           let response = JSON.parse(Value.toString());
           if (response.ReturnCode == '0') {
             let data = JSON.parse(response?.ExtraData);

             if (Array.isArray(data.ApprovalLevel)) {
               
               this.latestLevel = data?.ApprovalLevel?.ApprovalLevel
                 String(this.latestLevel);
             }
             else {
               this.latestLevel = data?.ApprovalLevel?.ApprovalLevel
                  String(this.latestLevel);
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

//   async GetSalesReturnObject() {
//     this.ngxSpinnerService.show()
//     let requestdata = []
//     requestdata.push({
//       "Key":"ApiType",
//       "Value":"GetRefundRequestObject"
//     })
//     requestdata.push({
//       "Key":"SalesReturnGUID",
//       "Value":this.params.salesreturnguid
//     })
//     let strRequestData = JSON.stringify(requestdata);
//     let contentRequest =
//     {
//       "content": strRequestData
//     };
    
//   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
//     {
//       next: (value) => {
//         let response = JSON.parse(value.toString());
//         if (response.ReturnCode == '0') {
//           let data = JSON.parse(response.ExtraData)
//             console.log("Sales Retrun Object", data)
//             // this.salesReturnObject = data
//             this.CustomerCode = data.RetailCustomerCode
//             this.LocationCode = data.LocationCode
//             this.RefundRemark = data.RefundRemark
//             this.RefundGUID = data.RefundGUID
//             this.RequestCode = data.RequestCode
//             this.CreatedDate = data.CreatedDate
//             this.ApprovalStatus = data.ApprovalStatus
//             this.RefundStatus = data.RefundStatus

//             // Redirect to Sales Return
//             this.toastMessage.info("Re-directing to Sales Return")
//             // this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-created/'], {queryParams: { salesreturnguid: this.SalesReturnGUID ,locationcode: this.LocationCode  ,customercode: this.CustomerCode}})

//             this.CreatedBy = data.CreatedBy

//             this.GetFileObject()
//             // Remark Part:-
//             this.RemarkUploadList[0] = {
//               RemarkLevel: 'Request Remark',
//               RemarkDescription:data.SalesReturnRemark,
//               RemarkDate: data.CreatedDate,
//               isEdit: false
//             };
//             this.GetProcessObject()

//             // Redirect to Sales Return Component:- 
//             if (this.RefundStatus == 'NA'){
//               this.toastMessage.error("Re-directing to Sales Return");
//               this.router.navigate(['auth/' + glob.getCompanyCode() + '/sales-return'], { queryParams: { salesreturnguid: data.SalesReturnGuid } })
//             }

//             // Get all the Related Data:- 
//             this.getCustomerObject()
//             this.GetLocationObject()
//             // this.guid = ( data.InvoiceGuid).toLowerCase(); 
//             // console.log("GUID Object", this.guid)
//             if( Array.isArray(data?.RefundDetailList?.RefundDetail) ) {
//               this.RefundedList = data?.RefundDetailList?.RefundDetail;
//             }
//             else{
//               this.RefundedList.push(data?.RefundDetailList?.RefundDetail)
//             }
//             // this.TotalNetAmount()
//             this.TotalNetSalesReturnAmount()
//             if ( this.RefundStatus == 'PENDING' ){
//               // this.isApproverL3 = true
//               this.onModeofPaymentSearch({ term: "", item: [] });
//             }
//             this.IsApproverObject();
//         }
//         else {
//           console.log("error");
//         }
//       },
//       error: err => {
//         console.log(err);
//       }
//     });
// }

  TotalNetSalesReturnAmount() {
    this.totalBaseAmount = 0;
    this.totalDiscountAmount = 0;
    this.TotalPaymentAmount = 0;
    this.totalTaxAmount = 0;
    this.totalTaxableAmount = 0;

    this.RefundedList.forEach((item) => {
      this.totalTaxableAmount += parseFloat(item.TaxableAmount);
      this.totalTaxAmount += parseFloat(item.TaxAmount);
      this.TotalPaymentAmount += parseFloat(item.NetAmount);
      this.totalDiscountAmount += parseFloat(item.DiscountAmount);
      this.totalBaseAmount += parseFloat(item.BaseAmount);
    });
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.TotalPaymentAmount = parseFloat(this.TotalPaymentAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
  }

  validatePaymentRefundiPlanet() {
    if (this.Amount == null || this.Amount == undefined || this.Amount < 1) {
      this.toastMessage.error("Invalid Payment Amount!")
      return false;
    }
    else if (  this.Amount > this.RefundRequestedAmount) {
      this.toastMessage.error("Amount can't be greater than the Refund Requested Amount!")
      return false;
    }
    else if (this.modeofPaymentData == '') {
      this.toastMessage.error("Mode of Payment cannot be empty")
      return false;
    }
    else if (this.GLCodeData == '') {
      this.toastMessage.error("GLCode cannot be empty")
      return false;
    }
    else if (this.modeofPaymentData == 'CHEQUE') {
      if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
        this.toastMessage.error("Transaction Reference Number cannot be empty!")
        return;
      }
    }
    else if (this.modeofPaymentData == 'CREDITCARD') {
      if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
        this.toastMessage.error("Card Type cannot be empty!")
        return false;
      }
      else if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
        this.toastMessage.error("Card number cannot be empty")
        return false;
      }
      else if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
        this.toastMessage.error("Adjudication cannot be empty")
        return false;
      }
      else if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
        this.toastMessage.error("TerminalId cannot be empty")
        return false;
      }
    }
    // else if (this.modeofPaymentData == 'PINELABS') {
    //   if (this.AccountNumber == '' || this.AccountNumber == null || this.AccountNumber == undefined) {
    //     this.toastMessage.error("Account Number cannot be empty")
    //     return false;
    //   }
    //   else if (this.AuthenticationNumber == '' || this.AuthenticationNumber == null || this.AuthenticationNumber == undefined) {
    //     this.toastMessage.error("Auth Number cannot be empty")
    //     return false;
    //   }
    // }
    // else if (this.modeofPaymentData == 'UPI') {
    //   if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }
    this.RefundPaidAmount += this.Amount
  
    this.paymentDetailArray.push({
      "NEWPAYMENT": 1,
      "TranType": "Payment",
      "TranDate": new Date(),
      "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
      "ModeOfPayment": this.modeofPaymentData,
      "AuthenticationNumber": this.AuthenticationNumber,
      "AccountNumber": this.AccountNumber,
      "AccountHolderName": this.AccountHolderName,
      "BankCode": this.BankCode,
      "BankAccountNumber": this.BankAccountNumber == null || this.BankAccountNumber == undefined ? '' : this.BankAccountNumber,
      "CardType": this.CardTypeData,
      "CardNumber": this.CardNo,
      "Adjudication": this.Adjudication,
      "TerminalId": this.TerminalId,
      "UTRDetails": '',
      "UPITransactionId" : this.UPITransactionId,
      "GLCode": this.GLCodeData,
      "HouseOfBank": this.houseofBank, 
    })
    console.log("Paymnet Object ", this.paymentDetailArray)
    this.Amount = 0.00
    this.modeofPaymentData = '';
    this.AuthenticationNumber = '';
    this.AccountNumber = ''
    this.AccountHolderName = '';
    this.BankCode = '';
    this.BankAccountNumber = null;
    this.CardTypeData = '';
    this.CardNo = '';
    this.Adjudication = '';
    this.TerminalId = '';
    this.RequestedAmt = 0.00;
    this.UPITransactionId = ''
    this.GLCodeData = ''
    this.houseofBank = ''
    return true;
  }

  deletePaymentitem(item) {
    console.log("Delete ", item)
    this.RefundPaidAmount -= item.Amount
    let index = this.paymentDetailArray.indexOf(item)
    this.paymentDetailArray.splice(index, 1)
    this.paymentDetailArray.length > 0 && this.RefundStatus == 'PENDING' ? this.hidePayRefund = false : this.hidePayRefund =true
  }

  SaveRefund() {

    // if (this.guid == '' || this.guid == null ){
    //   this.toastMessage.error("No " + this.RefundAgainst + " Selected")
    //   return;
    // }
    console.log("Math.ceil( this.RefundRequestedAmount ", Math.ceil( this.RefundRequestedAmount ))
    console.log(" Refind Amount ", this.RefundPaidAmount)
    if (this.paymentDetailArray.length == 0){
      this.toastMessage.error("No Payment Selected to be Refunded");
      return
    }
    if (this.RefundPaidAmount < 0 || this.RefundPaidAmount > Math.ceil( this.RefundRequestedAmount )) {
      this.toastMessage.error("Refund Amount can not exceed the Refund Requested Amount");
      return
    }
    if (this.RefundPaidAmount > (this.RefundRequestedAmount + 1) || this.RefundPaidAmount < ( this.RefundRequestedAmount -1)) {
      this.toastMessage.error("Refund Amount does not match the Requested Amount!");
      return
    }
    // // Get the selected Repair/SalesReturn dropdown item
    // const selectedRefund = this.RepairOrSalesReturnDD.Data.find(item => item.Id == this.guid);
    // // console.log("selectedRefundType:- ",selectedRefund)
    // this.CaseId = selectedRefund.CaseId; // CaseId maybe empty for DSales

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveRefund"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.CustomerCode
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    requestData.push({
      "Key": "RequestCode",
      "Value": this.RequestCode
    });
    requestData.push({
      "Key": "RefundDocType",
      "Value": ''
    });
    requestData.push({
      "Key": "ApprovalStatus",
      "Value": this.ApprovalStatus
    });
    requestData.push({
      "Key": "RefundStatus",
      "Value": 'CLOSED'
    });
    requestData.push({
      "Key": "RefundDate",
      "Value": new Date(),
    });
    let remark = this.RemarkUploadList[this.RemarkLevel]?.RemarkDescription 
    requestData.push({
      "Key": "RefundRemark",
      "Value": remark == null || remark== undefined ? "" : remark
    });
    requestData.push({
      "Key": "RefundGUID",
      "Value": this.params.refundguid == null || this.params.refundguid ==undefined ? '' : this.params.refundguid
    });
    requestData.push({
      "Key": "RefundAmount",
      "Value": this.RefundPaidAmount
    });
    requestData.push({
      "Key": "RequestAmount",
      "Value": this.RefundRequestedAmount
    });
    requestData.push({
      "Key": "RefundPaymentDetail",
      "Value": this.savePaymentXml()
    });
    requestData.push({
      "Key": "RefundDetails",
      "Value": this.RefundDetails()
    });
    // // Optional parameters:- 
    // if (this.RefundDocType == 'SREFUND'){
    //   requestData.push({
    //     "Key": "SalesReturnGUID",
    //     "Value": this.SalesReturnGuid
    //   });
    //   requestData.push({
    //     "Key": "SalesReturnCode",
    //     "Value": this.SalesReturnCode
    //   });
    //   requestData.push({
    //     "Key": "InvoiceGUID",
    //     "Value": this.InvoiceGuid
    //   });
    //   requestData.push({
    //     "Key": "InvoiceCode",
    //     "Value": this.InvoiceCode
    //   });
    // }

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log("DATA BEFORE SENDING IS :- ", requestData );
    // // // TODO
    // alert("Return On")
    // return

    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    if(this.submitClicked == true)
    {
      return;
    }
    this.showSpinner()
    this.ngxSpinnerService.show()

   
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked= false
          let response = JSON.parse(value.toString());
          
          // console.log("Response: " , response)
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            // console.log("Date after saving ", data)
            this.ngxSpinnerService.hide();
            this.toastMessage.success("Refund Successful")
            window.location.reload();
            // this.router.navigate(['/auth/' + glob.getCompanyCode() + '/refund-list']);
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
    

  TotalNetAmount() {
      this.TotalPaymentAmount = 0
      this.TotalPaymentAmount = this.RefundedList.reduce(
      (acc, item) => acc +  parseFloat(item.Amount),
      0);

  }

  savePaymentXml() {
    let rawData = {
      "rows": []
    }
    // console.log("Selected Items List:- ", this.RefundedList)
    let count = 0;
    let PaymentList = [];
    // For Refund payment box:-
    this.paymentDetailArray.length > 0 ? PaymentList = this.paymentDetailArray : PaymentList = this.RefundedList
  
    // console.log("Payment List", this.RefundedList, "\nSelected Payments:- ", this.paymentDetailArray)
    for (let item of PaymentList) {
      count += 1
      // console.log("item ", item)
      rawData.rows.push({
        "row": {
          "PaymentGUID": item.PaymentGUID != null || item.PaymentGUID!= undefined? item.PaymentGUID : uuidv4(),
          "RefundGUID": item.RefundGUID!= null || item.RefundGUID!= undefined ? item.RefundGUID :  this.RefundGUID,
           "ModeOfPayment": item.ModeOfPayment,
          "Amount": item.Amount,
          "AccountNumber": item.AccountNumber,
          "AuthenticationNumber": item.AuthenticationNumber,
          "CardType": item.CardType,
          "CardNumber": item.CardNumber,
          "Adjudication": item.Adjudication,
          "TranType": item.TranType,
          "TranDate": item.TranDate.toISOString(), 
          "TerminalId": item.TerminalId,
          "AccountHolderName": item.AccountHolderName,
          "BankCode": item.BankCode,
          "UPITransactionId" : item.UPITransactionId,
          "BankAccountNumber": item.BankAccountNumber,
          "GLCode": item.GLCode,
          "isDeleted": 0
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("xml", xml);
    return xml;
  }

  
  RefundDetails(){
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.PaymentList) {
      count += 1
          

      rawData.rows.push({
        "row": {
          "RefundGUID" : this.RefundGUID,
          "RefundDetailGUID" : item.RefundDetailGUID, 
          "RefundAmount": item.RefundAmount,
          "RefundDocType" : item.RefundDocType,
          "TransactionCode": item.TransactionCode,
          "TransactionGUID": item.TransactionGUID,
          "IsDeleted" : '0'
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
      "Value": this.params.salesreturnguid == null || this.params.salesreturnguid == undefined ? this.params.refundguid : this.params.salesreturnguid 
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
    return this.RemarkUploadList.length - this.RemarkUploadList.filter(item => item.RemarkDescription == '' ||  item.RemarkDescription == null || item.RemarkDescription == undefined ).length;
  }

  GetProcessObject(){
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetProcessApprovalStatus"
    })
    requestData.push({
      "Key": "ProcessType",
      "Value": this.params.salesreturnguid == null || this.params.salesreturnguid == undefined ? 'Refund' : 'SalesReturn'
    })
    requestData.push({
      "Key": "GUID",
      "Value": this.params.salesreturnguid == null || this.params.salesreturnguid == undefined ? this.RefundGUID : this.SalesReturnGUID
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
              // console.log("Get ProcessApproval Object" , data)
              if(Array.isArray(data.ProcessList.ProcessRow))
              {
                for ( let process of data.ProcessList.ProcessRow){
                  this.RemarkUploadList.push({
                    RemarkLevel: process.ApprovalLevel,
                    RemarkDescription: process.ApprovalRemark,
                    RemarkDate: new Date(process.CreatedDate),
                    isEdit: false
                  })
                  if(process.ApprovalLevel != 'L1' && process.ApprovalLevel != 'L2' && process.ApprovalLevel != 'Request Remark'){
                    this.HoldUnholdRemarks.push({
                      RemarkLevel: process.ApprovalLevel,
                      RemarkDescription: process.ApprovalRemark,
                      RemarkDate: new Date(process.CreatedDate),
                      RefundStatus: process.ApprovalStatus
                    })
                  }


                }
                this.HoldUnholdRemarks.sort((a, b) => a.RemarkDate - b.RemarkDate);
              }
              else{
                this.RemarkUploadList.push({
                  RemarkLevel: data.ProcessList.ProcessRow.ApprovalLevel,
                  RemarkDescription: data.ProcessList.ProcessRow.ApprovalRemark,
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

  printRefund(){

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