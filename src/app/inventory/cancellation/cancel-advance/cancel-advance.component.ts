import { Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "../../../config/global";
import { DatePipe, Location } from '@angular/common';
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { BehaviorSubject } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';



@Component({
  selector: 'app-cancel-advance',
  templateUrl: './cancel-advance.component.html',
  styleUrls: ['./cancel-advance.component.css']
})


export class CancelAdvanceComponent implements OnInit {


  CustomerObject: any[] = []
  LocationObject: any[] = []
  paymentDetailArray: any[] = [];
  isEdit: boolean = false;
  typeSelected = 'ball-clip-rotate';
  finalSelectedElements: any[] = []
  PONumber: any;
  title: string = ''
  currentDate: Date;
  errorMessage: any;
  params: any;
  PaymentCode : string
  PaymentDate: Date
  PaymentSuccess = false
  submitClicked= false 
  postToSAPButton = false

  // Mode of Payment
  AdvModeofPaymentDD: DropDownValue = DropDownValue.getBlankObject();
  modeofPaymentData: string = ''; 
  GLCodeData: string;
  houseofBank: string;

  CardType: any = ['Visa', 'Master Card']
  GLCode: DropDownValue = DropDownValue.getBlankObject();
  Amount: number = 0;
  AccountNumber: string = '';
  AuthenticationNumber: string = '';
  CardTypeData: string = '';
  CardNo: string = '';
  Adjudication: string = '';
  TerminalId: string = '';
  AccountHolderName: string = '';
  BankCode: string = '';
  BankAccountNumber: any = '';
  totalPaidAmount: number = 0;
  totalNetAmount: number = 0;
  advancePaymentTerm: string = '';
  advancePaymentAmount: number = 0
  advanceAmountPaid: number = 0;
  paymentDocType: DropDownValue = DropDownValue.getBlankObject();
  paymentDocTypeData: string = ''
  PaymentGUID: any;
  locationdata: string = '';
  customercodedata; string = '';
  caseguid: any;
  paymentSuccessArray: any[] = []
  paymentSuccessData: any
  caseId: string = ''
  UTR:string="";
  ChequeNo:string="";
  UPITransactionId: string = '';
  isPaymentProcessing = false
  // Payment Popup
  isPaymentpopUp : boolean = false
  // PineLabs 
  transactionNumber: string;
  previousEDCPaymentRecords: any[] = [];
  allowedPaymentMode:string;
  edcMachineObject :any[] = [];
  edcMachineName:string ;
  previousRecordsFound:boolean = false
  isNewTxnBtn: boolean = true
  isNewPayment: boolean = false;
  pinelabsPaymentArray: DropDownValue = DropDownValue.getBlankObject();
  isDefaultMOP: boolean = false

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
    actionDetails: any[]= [ ];
    detailLedger: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    detailRequest: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    
  // Customer Ledger
  // TotalCreditAmount: number = 0;
  // TotalBalanceAmount: number = 0;
  // TotalDebitAmount: number = 0;
  // PreviousRequestedAmount : number = 0;
  CashRegisterList: any[] =[]
  registerColumns: Columns[] = [
    { datatype: "STRING", field: "TransactionCode", title: "Transaction Code" },
    { datatype: "STRING", field: "TransactionType", title: "Transaction Type" },
    { datatype: "STRING", field: "CreditAmount", title: "Credit Amount" },
    { datatype: "STRING", field: "DebitAmount", title: "Debit Amount" },
    { datatype: "STRING", field: "CreatedDate", title: "Transaction Date" },
  ];
  registerLedger: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  detailRegister: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private datePipe: DatePipe,
    private Location:Location,
    private route: Router,
    private gsxService: GsxService,
    private locationservice: Location,
    private ngxSpinnerService: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.onGLCodeSearch({ term: "", item: [] });
    this.onAdvanceModeofPaymentSearch({ term: "", item: [] });
    // this.onPaymentDocTypeSearch({ term: "", item: [] });
    this.currentDate = new Date();
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.customercode != null && this.params.customercode != undefined) {
      this.getCustomerObject()
      this.GetCustomerLedgerObject( '' )
      this.customercodedata = this.params.customercode
    }
    else {
      this.toastMessage.error("Customer Details not found")
    }

    if (this.params.locationcode != null && this.params.locationcode != undefined) {
      this.getLocationObject()
      this.GetCashRegisterObject('')
      this.locationdata = this.params.locationcode
    }
    else {
      this.toastMessage.error("Location Details not found")
    }
    if (this.params.caseguid != null && this.params.caseguid != undefined) {
      this.caseguid = this.params.caseguid
    }
    else {
      this.toastMessage.error("Caseguid Not Found")
      this.locationservice.back()
    }
    if (this.params.paymentguid != null && this.params.paymentguid != undefined) {
      this.getAdvancePaymentObject()
      this.PaymentGUID = this.params.paymentguid
    }

    this.onAllowedPaymentSearch({ term: "", item: [] });

  }

  getLocationObject() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            this.LocationObject.push(data)
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

  
  actionEmit(event){
    // console.log("action Emit", event);
    if(event.action == 'APPROVE'){ 
      return
    }
  }

  getCustomerObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetRtlCustomerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.params.customercode
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
                this.CustomerObject.push(data.Customer)
                this.errorMessage = "";
              }
            }
          } catch (ext) {
          }
        },
        error: err => {
          console.log(err)
        }

      }
    );
  }

  GetCustomerLedgerObject( eventDetail ) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerLedgerObject"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.params.customercode
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
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "5": eventDetail.pageSize
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
          this.ngxSpinnerService.hide()

            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("Ledger Object:- ", data)
              this.TotalCreditAmount = data?.CreditAmount
              this.TotalDebitAmount = data?.DebitAmount
              this.TotalBalanceAmount = this.TotalCreditAmount - this.TotalDebitAmount
              if ( this.TotalBalanceAmount < 0 ){
                this.toastMessage.error("You can't Refund this Customer! As the Balance Amount is Negative")
                // this.route.navigate(['/auth/' +glob.getCompanyCode() + '/refund-list/'])
              }
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

            }
        },
        error: err => {
          this.ngxSpinnerService.hide()
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

  GetCashRegisterObject( eventDetail ) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCashRegisterObject"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
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
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "5": eventDetail.pageSize
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.ngxSpinnerService.show()
    console.log("Before Register SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxSpinnerService.hide()

            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("Register Object:- ", data)
              // this.TotalCreditAmount = data?.CreditAmount
              // this.TotalDebitAmount = data?.DebitAmount
              // this.TotalBalanceAmount = this.TotalCreditAmount - this.TotalDebitAmount
              if( data?.Totalrecords < 1){
                this.toastMessage.error("No Register Ledger Data Found")
                this.detailRegister.next({ totalRecord: data?.Totalrecords, Data: '' })
                return
              }
              if (Array.isArray(data?.CashRegisterHeader?.CashRegisterDetails)) {
                this.CashRegisterList = data?.CashRegisterHeader?.CashRegisterDetails;
              }
              else {
                this.CashRegisterList.push(data?.CashRegisterHeader?.CashRegisterDetails)
                this.errorMessage = "";
              }
              // console.log("Ledger List:- ", this.CustomerLedgerList)
              this.detailRegister.next({ totalRecord: data?.Totalrecords , Data: this.CashRegisterList })

            }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    );
  }

  PageChangeRegister( event){    
    switch(event.eventType){
      case "PageChange":
        this.GetCashRegisterObject(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  getAdvancePaymentObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetAdvancePaymentObject"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.params.caseguid
    });
    requestData.push({
      "Key": "PaymentGUID",
      "Value": this.params.paymentguid
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("ADVANCE DATA", data)
              this.PaymentGUID = data?.PaymentObject?.PaymentGUID
              this.PaymentCode = data?.PaymentObject?.PaymentCode
              this.PaymentSuccess = data?.PaymentObject?.PaymentSuccess 
              this.PaymentDate = data?.PaymentObject?.PaymentDate
              let PaymentList = data?.PaymentObject?.PaymentDetail
              if (PaymentList == null || PaymentList  == undefined){
                this.isEdit=  true

              }
              if (Array.isArray(PaymentList)) {
                this.paymentDetailArray = PaymentList
                for (let item of PaymentList) {
                  this.advancePaymentAmount += parseFloat(item.Amount == null || item.Amount == undefined ? 0.00 : item.Amount)
                }
              }
              else {
                this.paymentDetailArray.push(PaymentList)
                this.advancePaymentAmount = parseFloat(PaymentList?.Amount == null || PaymentList?.Amount == undefined ? 0.00 : PaymentList?.Amount)
              }

              
              if (this.PaymentSuccess == false){
                this.postToSAPButton = true
              }
            }
          } catch (ext) {
          }
        },
        error: err => {
          console.log(err)
        }

      }
    );
  }


  getEDCMachineObject() {
 
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetEDCMachineObject"
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    })
    let strRequestData = JSON.stringify(requestdata);
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
              if (data.Totalrecords == "0") {
                this.toastMessage.info("No EDC Machine found")
              }
              else {
                this.edcMachineObject = []
                if (Array.isArray(data.LocationEDC.Location)) {
                  this.edcMachineObject = data.LocationEDC.Location
                }
                else {
                  this.edcMachineObject.push(data.LocationEDC.Location)
                }
                console.log("EDC ", this.edcMachineObject)
              }
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    );
  }

  onAllowedPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.AllowedPaymentMode, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.pinelabsPaymentArray = value;
          console.log("Allowed DD ", this.pinelabsPaymentArray)
        }
      },
      error: (err) => {
        this.pinelabsPaymentArray = DropDownValue.getBlankObject();
      }
    });
  }

  onAdvanceModeofPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.AdvanceModeofPayment, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.AdvModeofPaymentDD = value;
          console.log("Adv Payment ", this.AdvModeofPaymentDD)
        }
      },
      error: (err) => {
        this.AdvModeofPaymentDD = DropDownValue.getBlankObject();
      }
    });
  }

  validatePaymentiPlanet() {
    if (this.Amount == null || this.Amount == undefined || this.Amount < 1) {
      this.toastMessage.error("Invalid Payment Amount!")
      return false;
    }
    if (this.modeofPaymentData == '') {
      this.toastMessage.error("Mode of Payment cannot be empty")
      return false;
    }
    if (this.GLCodeData == '' && this.modeofPaymentData != 'STAFDEBIT') {
      this.toastMessage.error("GLCode cannot be empty")
      return false;
    }
    if (this.modeofPaymentData == 'PAYTM' ){
      if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
        this.toastMessage.error("Mode of Payment cannot be empty!")
        return false;
      }
       
      if ( this.allowedPaymentMode == '1' ) {
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
      else if ( this.allowedPaymentMode == '10' ) {
        if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
          this.toastMessage.error("Transaction Reference Number cannot be empty!")
          return false;
        }
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
    else if (this.modeofPaymentData == 'PINELABS') {
      if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
        this.toastMessage.error("PineLabs Machine Name cannot be empty!")
        return false;
      }
      if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
        this.toastMessage.error("PineLabs Mode of Payment cannot be empty!")
        return false;
      }
      if (this.GLCodeData == '' || this.GLCodeData == null || this.GLCodeData == undefined) {
        this.toastMessage.error("GLCode can't be empty, Kindly select a Mode of Payment")
        return false;
      }
      else
      {
        this.saveEDCPayment()
        return
      }
    }
    else if (this.modeofPaymentData == 'UPI' || this.modeofPaymentData == 'CHEQUE' || this.modeofPaymentData == 'CREDITREQ') {
      if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
        this.toastMessage.error("Transaction Reference Number cannot be empty!")
        return false;
      }
    }
    // else if (this.modeofPaymentData == 'PAYTM') {
    //   if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
    //     this.toastMessage.error("PineLabs Machine Name cannot be empty!")
    //     return false;
    //   }
    //   if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
    //     this.toastMessage.error("PineLabs Mode of Payment cannot be empty!")
    //     return false;
    //   }
    //   if (this.GLCodeData == '' || this.GLCodeData == null || this.GLCodeData == undefined) {
    //     this.toastMessage.error("GLCode can't be empty, Kindly select a Mode of Payment")
    //     return false;
    //   }
    //   else
    //   {
    //     this.saveEDCPayment()
    //     return
    //   }
    // }

    if ( this.modeofPaymentData != 'PINELABS' && this.modeofPaymentData != 'PAYTM'){
      this.advancePaymentAmount += this.Amount
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
      this.BankAccountNumber = "";
      this.CardTypeData = '';
      this.CardNo = '';
      this.Adjudication = '';
      this.TerminalId = '';
      this.UPITransactionId = ''
      this.GLCodeData = ''
      this.houseofBank = ''
      this.allowedPaymentMode = ''
      this.closePaymentPopUp()
    }
    else if ( this.modeofPaymentData == 'PAYTM'){
      this.advancePaymentAmount += this.Amount
      this.paymentDetailArray.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI',
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
      this.BankAccountNumber = "";
      this.CardTypeData = '';
      this.CardNo = '';
      this.Adjudication = '';
      this.TerminalId = '';
      this.UPITransactionId = ''
      this.GLCodeData = ''
      this.houseofBank = ''
      this.allowedPaymentMode = ''
      this.closePaymentPopUp()
    }
    return true;
  }

  closePaymentPopUp(){
    this.isPaymentpopUp = false

    if ( this.modeofPaymentData == 'PINELABS'){
      this.previousRecordsFound = false
      this.isNewPayment = false
    }
    // this.isNewTxnBtn=true
    // this.isNewPayment=false
  }

  deletePaymentitem(item) {
    console.log("Item ", item)
    // this.totalPaidAmount = 0
    let index = this.paymentDetailArray.indexOf(item)
    console.log("Item Index ", index)
    this.advancePaymentAmount = 0
    this.paymentDetailArray.splice(index, 1)
    console.log("Payment List ", this.paymentDetailArray)
    // this.totalPaidAmount += this.advanceAmountPaid
    for (let obj of this.paymentDetailArray) {
      this.advancePaymentAmount += parseFloat(obj?.Amount)
    }
  }

  
  saveEDCPayment()
  {
    var edcObject ;
    for(let item of this.edcMachineObject)
    {
      if(item.PODDeviceName == this.edcMachineName)
      {
        edcObject = item
        break
      }
    }
    console.log("EDC Object ", edcObject)
    let objData = {
      "CompanyCode":glob.getCompanyCode(),
      "LocationCode":this.locationdata,
      "CustomerCode":this.customercodedata,
      "CaseGUID":this.caseguid,
      "SequenceNumber":"1",
      "AllowedPaymentMode":this.allowedPaymentMode,
      "MerchantStorePOSCode":edcObject.MerchantStorePOSCode,
      "Amount":parseInt((this.Amount).toString())*100,
      "MerchantID":edcObject.MerchantID,
      "MachineHardwareID":edcObject.HardwareID,
      "SecurityToken":edcObject.SecurityToken,
      "IMEI":edcObject.UniqueStoreMachineID
    }
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      content: strRequestData,
    };
    console.log("Request EDC", objData )
    console.log("Content Request", contentRequest )

    // // TODO 
    // alert("Return ON")
    // return
    this.isPaymentProcessing = true
    // this.ngxSpinnerService.show()
    this.gsxService.uploadEDCTransaction(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        console.log("Response ", response)
        if (response.ResponseCode == "0") {
          this.transactionNumber = response?.PlutusTransactionReferenceID
          this.toastMessage.info("Your Plutus Transaction Reference number is", this.transactionNumber,{timeOut: 10000})
          if(response.TransactionNumber != null && response.TransactionNumber != undefined)
          {
            this.toastMessage.success("Your EDC Transaction Reference Number is", response.TransactionNumber,{timeOut: 10000})
          }
          this.getEDCPaymentStatus()
        } 
        else {
          this.isPaymentProcessing = false

          this.errorMessage = response.ResponseMessage;
          this.toastMessage.error(this.errorMessage)
        }
      },
      error: (err) => {
        this.isPaymentProcessing = false
        // this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  } 

  // openPayemt(event) {

  //   this.modeofpayment = []
  //   this.isPaymentpopUp = true;
  //   this.modeofpayment.push({
  //     "modeofPayment": event,
  //     "totalAmount": this.totalNetAmount - this.totalPaidAmount,
  //     "locationCode": this.locationData,
  //     "customerCode": this.CustomerObject[0].CustomerCode,
  //     "advanceAmount": this.TotalCustomerAdvance == null || this.TotalCustomerAdvance == undefined ? 0 : this.TotalCustomerAdvance,
  //     "caseGUID": this.params.caseguid == null || this.params.caseguid == undefined ? "00000000-0000-0000-0000-000000000000" : this.params.caseguid,
  //     "acceptedPayment":this.paymentDetailArray
  //   })
  // }

  changePineLabsMOP(){
    let paymentType= this.allowedPaymentMode=="1" ? "CREDITCARD":"UPI" 
      for(let item of this.AdvModeofPaymentDD.Data)
      {
        if(item.Id == paymentType)
        {
          this.GLCodeData = item.GLCode
          this.houseofBank = item.extraData
        }
      }
  }

  openPayment(paymentType)
  { 
    this.modeofPaymentData = paymentType
    // if ( this.modeofPaymentData != 'PINELABS'){
      for(let item of this.AdvModeofPaymentDD.Data)
      {
        if(item.Id == this.modeofPaymentData)
        {
          this.GLCodeData = item.GLCode
          this.houseofBank = item.extraData
        }
      }
    // }
    // else{
    //   this.GLCodeData = null
    //   this.houseofBank = null
    // }
    if (this.modeofPaymentData == 'CREDITREQ' && this.isDefaultMOP == false){
      const ShouldContinue = confirm("Are you sure you want to choose Credit Request instead of Credit Card Option? Do you want to continue")
      if (ShouldContinue == false ){
        return
      }
    }
    this.isPaymentpopUp = true
    console.log("MOP ", this.modeofPaymentData);
  }

  callEDCStatus()
  {
    if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
      this.toastMessage.error("PineLabs Machine Name cannot be empty!")
      return false;
    }
    if (this.transactionNumber == '' || this.transactionNumber == null || this.transactionNumber == undefined) {
      this.toastMessage.error("PineLabs Transaction Number cannot be empty!")
      return false;
    }
    

    for(let item of this.paymentDetailArray)
    {
      if(item.EDCMachineReferenceID == this.transactionNumber)
      {
        this.toastMessage.error("This payment has been already added, kindly select a different transaction")
        return
      }
    }
    var selectedpaymentobj ;
    for(let item of this.previousEDCPaymentRecords)
    {
      if(item.TransactionReferenceID == this.transactionNumber)
      {
        selectedpaymentobj = item;
        this.allowedPaymentMode = item.AllowedPaymentMode
        this.Amount = parseFloat(item.Amount)/100
      }
    }
    for(let obj of this.edcMachineObject)
    {
      if(obj.HardwareID == selectedpaymentobj.MachineHardwareID)
      {
        this.edcMachineName = obj.PODDeviceName
        break
      }
    }
    this.isPaymentProcessing = true
    this.getEDCPaymentStatus()
  }
  
  
  getPreviousEDCPaymentObj4Customer()
  {
    this.isNewPayment = false
    this.previousEDCPaymentRecords = []
    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetEDCTxnObj4customer",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.customercodedata
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.locationdata
    });
    requestData.push({
      Key: "TransactionStatus",
      Value: "APPROVED"
    });
    requestData.push({
      Key: "IsConsumed",
      Value: 0
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(Value.toString());
        console.log("Prev EDC ", response)
        if (response.ReturnCode == "0") {
          let extraData = JSON.parse(response.ExtraData);
          let data = JSON.parse(response.ExtraData)?.EDCTransactionDetail?.EDCTransaction;
          if(extraData?.Totalrecords != "0")
          {
            this.toastMessage.success("Records found!")
            if(data != null && data != undefined)
            {
              if(Array.isArray(data))
              {
                this.previousEDCPaymentRecords = data
              }
              else
              {
                this.previousEDCPaymentRecords.push(data)
              }
              this.previousEDCPaymentRecords.forEach(item =>{
                if(item.Amount != "0" && item.Amount != '' && item.Amount != null && item.Amount != undefined)
                {
                  item.Amount = parseFloat(item.Amount)
                  // item.Amount = parseFloat(item.Amount)/100
                }
              })
                this.previousRecordsFound = true
            }
          }
          else
          {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.isNewPayment = true
            this.previousRecordsFound = false
            return;
          }
        } 
        else {
          console.log("error",response);
        }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  }

  getEDCPaymentStatus()
  {
    if(this.transactionNumber == null || this.transactionNumber == undefined || this.transactionNumber == '')
    {
      this.toastMessage.error("No Transaction Reference ID found")
      return
    }
    if( this.edcMachineName == null || this.edcMachineName == undefined ){
      this.toastMessage.error("No Transaction Machine Name found")
      return
    }
    var edcObject;
    for(let item of this.edcMachineObject)
    {
      if(item.PODDeviceName == this.edcMachineName)
      {
        edcObject = item
        break
      }
    }
    let objData = {
      "MerchantID":edcObject.MerchantID,
      "SecurityToken":edcObject.SecurityToken,
      "IMEI":edcObject.UniqueStoreMachineID,
      "MerchantStorePosCode":edcObject.MerchantStorePOSCode,
      "PlutusTransactionReferenceID":this.transactionNumber    
    }
    let strRequestData = JSON.stringify(objData)
    let contentRequest = {
      "content":strRequestData
    }
    // this.ngxSpinnerService.show()
    this.gsxService.getEDCTransactionStatus(contentRequest).subscribe({
      next: (Value) => {
        // this.ngxSpinnerService.hide()
        let response = JSON.parse(Value?.toString());
        console.log("EDC Response ", response)
        let stringresponse = Value.toString()
        // this.toastMessage.success("Response", stringresponse, {closeButton: true, disableTimeOut: true})
        var responsemessage=response.ResponseMessage
        if (response.ResponseCode == "0" && responsemessage=="TXN APPROVED") 
        {
            this.isPaymentProcessing = false
            this.transactionNumber = response?.PlutusTransactionReferenceID
            var transactiondetail=response.TransactionData;
            for(let item of transactiondetail)
            {
                if(item.Tag=="TID")
                {
                  this.TerminalId=item.Value;
                }
                if(item.Tag=="ApprovalCode")
                {
                  this.Adjudication=item.Value;
                }
                if(item.Tag=="Card Number")
                {
                  this.CardNo=item.Value;
                }
                if(item.Tag=="Card Type")
                {
                  this.CardTypeData=item.Value;
                }
                if(item.Tag=="RRN")
                {
                  this.UPITransactionId=item.Value;
                }
                // if ( item.Tag == "PaymentMode" && item.Value == "CARD"){

                // }
            }
            // this.paymentDetailArray = []
            this.paymentDetailArray.push({

              "NEWPAYMENT": 1,
              "TranType": "Payment",
              "TranDate": new Date(),
              "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
              "ModeOfPayment": this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI',
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
              "EDCMachineType":"PINELABS",
              "EDCMachineReferenceID":this.transactionNumber == null || this.transactionNumber == undefined?"":this.transactionNumber,
              // "RequestedAmount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
              // "BankAccountNo": this.BankAccountNumber == null || this.BankAccountNumber == undefined ? '' : this.BankAccountNumber,
              // "UTR" : this.UTR == null || this.UTR == undefined ? '' : this.UTR,
              // "ChequeNo" : this.ChequeNo == null || this.ChequeNo == undefined ? '' : this.ChequeNo

              "GLCode": this.GLCodeData,
              "HouseOfBank": this.houseofBank, 
            })
          console.log("Payment List ", this.paymentDetailArray)
          this.advancePaymentAmount += this.Amount
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AuthenticationNumber = '';
          this.AccountNumber = ''
          this.AccountHolderName = '';
          this.BankCode = '';
          this.BankAccountNumber = "";
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = ''
          this.GLCodeData = ''
          this.houseofBank = '' 
          this.isPaymentpopUp = false
        }
        else if(response.ResponseCode=="1")
        {
          this.isPaymentProcessing = false
          this.previousRecordsFound = false
          // this.isNewPayment = false
          // this.isNewTxnBtn = true
          this.errorMessage = response.ResponseMessage;
          // if(this.errorMessage == "INVALID TRANSACTION NUMBER")
          // {
          //   this.errorMessage = "Transaction has been cancelled"
          // }
          this.toastMessage.error(this.errorMessage, "Transaction has been cancelled")
          this.Amount = 0.00
          this.AuthenticationNumber = '';
          this.AccountNumber = ''
          this.AccountHolderName = '';
          this.BankCode = '';
          this.BankAccountNumber = "";
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = ''
          this.GLCodeData = ''
          this.getPreviousEDCPaymentObj4Customer()
          // this.Amount = 0.00
          // this.AccountNumber = ''
          // this.AuthenticationNumber =  '';
          // this.CardTypeData =  '';
          // this.CardNo =  '';
          // this.transactionNumber = '';
          // this.Adjudication =  '';
          // this.TerminalId =  '';
          // this.AccountHolderName =  null
          // this.BankCode = null
          // this.BankAccountNumber = "";
          // this.UTR="";
          // this.ChequeNo="";
        }
        else {
          setTimeout(() => {
            this.getEDCPaymentStatus();
          }, 10000);
        }
      },
      error: (err) => {
        this.isPaymentProcessing = false
        // this.ngxSpinnerService.hide()
        console.log(err);
      },
    });  
  }

  newPayment()
  {
    this.isNewPayment=true
    this.isNewTxnBtn=false
    this.previousRecordsFound = false
  }


  onSubmit() {

    
    const shouldConfirm = confirm("Are you sure you want to continue?")
    if ( !shouldConfirm ){
      return
    }
    
    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true    
    this.ngxSpinnerService.show()
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "CancelAdvancePayment"
    });
    requestData.push({
      "Key": "PaymentCode",
      "Value": this.PaymentCode
    });
   
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
     console.log("requestData ", requestData)
    // alert("Return On ")
    // return
    //this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked=false;
          this.ngxSpinnerService.hide();
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            
            let data = JSON.parse(response?.ExtraData);
            console.log("Response ", data)
            this.PaymentCode = data.PaymentCode;
            this.PaymentDate = data.CreatedDate;
            this.isEdit=  true

            this.paymentDetailArray=[];
            let detailobject = data?.InvoiceDetailObject?.InvoiceDetail
            if (!(data?.PaymentObject == null || data?.PaymentObject == undefined)) {
              let paymentobject = data?.PaymentObject?.PaymentDetail
              if (Array.isArray(paymentobject)) {
                for (let item of paymentobject) {
                  this.paymentDetailArray.push(item)
                }
              }
              else {
                this.paymentDetailArray.push(paymentobject)
              }
              this.paymentDetailArray.forEach((payment)=>{
                this.totalPaidAmount += parseFloat(payment.Amount)
              })
            }
            this.finalSelectedElements=[];
            if (Array.isArray(detailobject)) {
              for (let item of detailobject) {
                this.finalSelectedElements.push(item)
              }

            }
            else {
              this.finalSelectedElements.push(detailobject)
            }
          //  this.route.navigate(['auth/' + glob.getCompanyCode() + '/advance-payment-list'])

          }
          else {
            this.submitClicked=false;
            this.ngxSpinnerService.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.toastMessage.error("Error While Saving Invoice")
              this.submitClicked=false;
            });
          }
        },
        error: err => {
          this.submitClicked=false;
          this.ngxSpinnerService.hide()
          console.log(err);
        }
      });
  }


  
  // saveSapAdvancePayment(){
  //   this.ngxSpinnerService.show()
  //   this.gsxService.saveSapAdvancePayment(this.PaymentGUID).subscribe({
  //     next: (value: any) => {
  //       // this.hideSpinner()
  //       this.ngxSpinnerService.hide()
  //       console.log("After Saving to SAP ",value) ;
  //       let data = JSON.parse(JSON.stringify(value));
        
  //       if (data.code == '0') {
  //         this.toastMessage.success("Posted To SAP successfully!")
  //         window.location.reload(); // TODO 
  //         console.log("Data successful ",data)
  //       }
  //       else {
  //         if (data.message != null || data.message != undefined) {
  //           this.toastMessage.error(data.message, 'Error', { closeButton: true, disableTimeOut: true })
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       // this.hideSpinner()
  //       this.ngxSpinnerService.hide()
  //       console.log(err)
  //     }
  //   })
  // }



  // saveMaterialRecordXML() {
  //   let rawData = {
  //     "rows": []
  //   }
  //   let count = 0;
  //   for (let item of this.finalSelectedElements) {
  //     if(item?.ItemType == "Material")
  //     {
  //       rawData.rows.push({
  //         "row": {
  //           "PaymentGUID": this.PaymentGUID,
  //           "MaterialCode":item?.ItemCode,
  //           "AdvanceAmount":item?.AdvanceAmount,
  //           "SAC_HSNCode":item?.SAC_HSNCode
  //         }
  //       })
  //     }
  //   }
  //   var builder = new xml2js.Builder();
  //   var xml = builder.buildObject(rawData);
  //   xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //   console.log(xml)
  //   return xml;
  // }

  savePaymentListXml() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.paymentDetailArray) {
      count += 1
       rawData.rows.push({
        "row": {
          "PaymentDetailGUID": uuidv4(),
          "PaymentGUID": this.PaymentGUID,
          "TranType": item.TranType,
          "TranDate": item.TranDate.toISOString(), // Convert to ISO 8601 format
          "Amount": item.Amount,
          "ModeOfPayment": item.ModeOfPayment,
          "AuthenticationNumber": item.AuthenticationNumber,
          "AccountNumber": item.AccountNumber,
          "AccountHolderName": item.AccountHolderName,
          "BankCode": item.BankCode,
          "BankAccountNumber": item.BankAccountNumber == null || item.BankAccountNumber == undefined ? '' : item.BankAccountNumber,
          "CardType": item.CardType,
          "CardNumber": item.CardNumber,
          "Adjudication": item.Adjudication,
          "TerminalId": item.TerminalId,
          "UTRDetails": item.UTRDetails ,
          "UPITransactionId": item.UPITransactionId,
          "GLCode": item.GLCode,
          "HouseOfBank": item.HouseOfBank,
          "EDCMachineType":item?.EDCMachineType,
          "EDCMachineReferenceID":item?.EDCMachineReferenceID,
          "RefundFlag":0
        }
      })
      // console.log(rawData.rows)
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log(xml)
    return xml;
  }


  // onPaymentDocTypeSearch($event: { term: string; item: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.AdvancePaymentDocType, $event.term, {
  //     CompanyCode: glob.getCompanyCode().toString(),
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         for (let item of value.Data) {
  //           if (this.params.doctype != undefined || this.params.doctype != null) {
  //             if (item.Id == this.params.doctype) {
  //               this.paymentDocTypeData = item.Id
  //               this.title = item.TEXT
  //               break
  //             }
  //           }
  //         }
  //         this.paymentDocType = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.paymentDocType = DropDownValue.getBlankObject();
  //     }
  //   });
  // }

  downloadPaymentReport(){
     
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetPaymentObject4Print",
    });
    PdfData.push({
      "Key": "PaymentGuid",
      "Value": this.PaymentGUID
    });
  
  
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    // console.log("Payment Report ", PdfData)
    let storepdf = contentRequest;
    this.reportService.downloadServiceReport('PAYMENT',contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("Report response ", response)
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.ngxSpinnerService.hide()
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
  
        }
      });
  }


  onGLCodeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.GLCode, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GLCode = value;
        }
      },
      error: (err) => {
        this.GLCode = DropDownValue.getBlankObject();
      }
    });

  }

  
  round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  } 


  SavePosDtaLog(InvoiceNo, payload, reponsedata) {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SavePosDtaLog"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.caseguid
    });
    requestData.push({
      "Key": "Process",
      "Value": "PAYMENT"
    });

    requestData.push({
      "Key": "InvoiceCode",
      "Value": InvoiceNo
    });
    requestData.push({
      "Key": "Payload",
      "Value": JSON.stringify(payload)
    });
    requestData.push({
      "Key": "ResponseData",
      "Value": JSON.stringify(reponsedata),
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    //this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
           
          this.ngxSpinnerService.hide();
          this.toastMessage.show("Success")
          this.Location.back();
          //this.route.navigate(['auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: this.caseguid, locationcode: this.locationdata } })
        },
        error: err => {
           ;
          this.ngxSpinnerService.hide();
          console.log(err);
          this.Location.back();
          //this.route.navigate(['auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: this.caseguid, locationcode: this.locationdata } })
        }
      });

  }

}
