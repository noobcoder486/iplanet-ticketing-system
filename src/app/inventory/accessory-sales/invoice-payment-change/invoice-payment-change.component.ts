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
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceSalesStockSelectorComponent } from '../../invoice-sales-stock-selector/invoice-sales-stock-selector.component';
import { QuoteItem } from 'src/app/transaction/repair-process/repair-process.metadata';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import {Location} from '@angular/common'


@Component({
  selector: 'app-invoice-payment-change',
  templateUrl: './invoice-payment-change.component.html',
  styleUrls: ['./invoice-payment-change.component.css']
})
export class InvoicePaymentChangeComponent implements OnInit {

  CustomerObject: any[] = []
  LocationObject: any[] = []
  addedPartCount: number = 0;
  typeSelected = 'ball-clip-rotate';
  isPartSelector: boolean = false;
  partList: any[] = [];
  finalSelectedElements: any[] = []
  netPrice: number;
  taxPrice: number;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  GLCode: DropDownValue = DropDownValue.getBlankObject();
  InvoiceDocType: DropDownValue = DropDownValue.getBlankObject();
  PricingOptionDD: DropDownValue = DropDownValue.getBlankObject();
  SalesPersonDD: DropDownValue = DropDownValue.getBlankObject();
  companyCode: DropDownValue = DropDownValue.getBlankObject();
  errorMessage: any;
  locationData: string;
  InvoiceGuid: any;
  InvoiceDocTypeData: string;
  params: any;
  title: string = ''
  productCategory: any;
  currentDate: Date;
  SAPPlantCode: any;
  SAPStorageLocation: any;
  totalBaseAmount: number = 0;
  totalDiscountAmount: number = 0;
  totalTaxableAmount: number = 0;
  totalTaxAmount: number = 0;
  totalNetAmount: number = 0;
  isEdit: boolean = false;
  Amount: number = 0.00;
  ModeofPayment: DropDownValue = DropDownValue.getBlankObject();
  modeofPaymentData: string = '';
  AccountNo: string = '';
  UPITransactionId: string = '';
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
  paymentDetailArray: any[] =[]
  newPaymentList: any[] =[]
  totalPaidAmount: number = 0.00;
  GLCodeData: string;
  invoiceCode: string = '';
  invoiceDate: string = ''
  PaymentGuid: string
  companyObject: any[] = [];
  salesPersonName: string = ''
  Remarks: string = ''
  SAPSOCode: string = "";
  SAPDeliveryCode: string = "";
  SAPPaymentCode: string;
  SAPInvoiceCode: string = "";
  DeliveryUpdateSuccess: boolean = false;
  DeliveryHeaderSuccess: boolean = false;
  PickingSuccess: boolean = false;
  PGISuccess: boolean = false;
  SerialUpdate: boolean = false;
  ETag: string = "";
  houseofBank: string = '';
  storageLocationResponse: string = '';
  IRNNumber:string = ''
  refundObject: any[]=[];
  totalRefundAmount: number=0;
  hideDiscountForm: boolean = true;
  discountMaterialCode: string = '';
  discountPartUnitPrice: number = 0;
  popUpArray: any[] = [];
  discountAmountRequested: number = 0;
  submitClicked :boolean=false;
  CreditAmount: number = 0;
  DebitAmount:  number = 0;
  TotalCustomerAdvance : number = 0;
  ARAgainstJob: number = 0;
  InvoiceStatus: string;
  paytmEDCObj: any;
  OriginalPaidAmount: number = 0;
  // Edit Payment 
  PaymentSuccess: boolean = false
  changeMOP: boolean = false

  // Mode of payment permission 
  MOPList :any[] = [];


  isAdvanceAllowed : boolean =true;
  isCashAllowed : boolean =true;
  isChequeAllowed : boolean =true;

  isCreditCardAllowed : boolean =true;
  isCreditReqAllowed : boolean =true;
  isInstCashbackAllowed : boolean =true;
  
  isPineLabsAllowed : boolean =true;
  isStafDebitAllowed : boolean =true;
  isUpiAllowed : boolean =true;

  isPaytmAllowed:boolean=true;
  isManualPaytm:boolean=true;
  isManualPinelabs:boolean=true;

  // Manual Payment 
  isManualPayment : boolean = false;
  ModeOfManualPayment :any;
  ManualPaymentType : any ;
  ManualPaymentTypes:any[]=[
    { ID :'Debit/CreditCard' , TEXT : 'Debit/Credit Card'},
    {ID : 'UPIQR' , TEXT : 'UPI QR Code'}
  ];

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private gsxService: GsxService,
    private ngxSpinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private route: Router,
    private Location:Location,
    private reportService: ReportService
  ) { }


  ngOnInit(): void {
    
    this.submitClicked=false;
    this.currentDate = new Date();
    this.onGLCodeSearch({ term: "", item: [] });
    this.onModeofPaymentSearch({ term: "", item: [] });
    this.onInvoiceDocTypeSearch({ term: "", item: [] });
    this.onPricingOptionSearch({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    this.onSalesPersonSearch({ term: "", item: [] });
    if (this.params.locationcode != null && this.params.locationcode != undefined) {
      this.locationData = this.params.locationcode
      this.getLocationData()
      this.getCompanyObject()
      this.getModeOfPaymentPermissionFunc() // function to get the mode of payment permission 

    }
    else {
      this.toastMessage.error("Location Details not found")
      this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
    }

    if (this.params.customercode != null && this.params.customercode != undefined) {
      this.getCustomerObject()
    }
    else {
      this.toastMessage.error("Customer Details not found")
    }
    if (this.params.doctype == "RSALES") {
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid=this.params.headerguid;
        this.getSalesObject()
      }
      else if (this.params.caseguid == null || this.params.caseguid == undefined) {
        this.toastMessage.error("CaseGuid Not Found!")
        this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
      }
      else{
        this.toastMessage.error("No Invoice Found!")
         this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
      }
    }
    else {
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid=this.params.headerguid;
        this.getSalesObject()
      }
      else{
         this.toastMessage.error("No Invoice Found!")
          this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
      }
    }
    this.onAllowedPaymentSearch({ term: "", item: [] });
  }


  getCompanyObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCompanyMasterObject"
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
              if (data.Totalrecords == "0") {
                this.toastMessage.error("Company details not found")
              }
              else {
                if (Array.isArray(data.Company)) {
                  this.companyObject = data.Company
                }
                else {
                  this.companyObject.push(data.Company)
                }
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

  validatePayment() {
    if (this.Amount == null || this.Amount == undefined || this.Amount == 0) {
      this.toastMessage.error("Payment Amount cannot be zero!")
      return;
    }
    else if (this.modeofPaymentData == '') {
      this.toastMessage.error("Mode of Payment cannot be empty")
      return;
    }
    // else if (this.modeofPaymentData == 'PINELABS') {
    //   if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }
    // else if (this.modeofPaymentData == 'CREDITREQ') {
    //   if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }
    // else if (this.modeofPaymentData == 'OLDSYSTEM') {
    //   if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }
    // else if (this.modeofPaymentData == 'CREDITCARD') {
    //   if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
    //     this.toastMessage.error("Card Type cannot be empty!")
    //     return;
    //   }
    //   else if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
    //     this.toastMessage.error("Card number cannot be empty")
    //     return;
    //   }
    //   else if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
    //     this.toastMessage.error("Adjudication cannot be empty")
    //     return;
    //   }
    //   else if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
    //     this.toastMessage.error("TerminalId cannot be empty")
    //     return;
    //   }
    // }
    // else if (this.modeofPaymentData == 'CHEQUE') {
    //   if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }
    // else if (this.modeofPaymentData == 'UPI') {
    //   if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
    //     this.toastMessage.error("Transaction Reference Number cannot be empty!")
    //     return;
    //   }
    // }

    if (this.modeofPaymentData == 'CREDIT CARD/UPI' ){
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
        this.savePineLabsEDCPayment()
        return
      }
    }
    else if (this.modeofPaymentData == 'PAYTM') {
      if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
        this.toastMessage.error("Paytm Machine Name cannot be empty!")
        return false;
      }
      if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
        this.toastMessage.error("Paytm Mode of Payment cannot be empty!")
        return false;
      }
      if (this.GLCodeData == '' || this.GLCodeData == null || this.GLCodeData == undefined) {
        this.toastMessage.error("GLCode can't be empty, Kindly select a Mode of Payment")
        return false;
      }
      else
      {
        this.savePaytmEDCPayment()
        return
      }
    }
    else if (this.modeofPaymentData == 'UPI' || this.modeofPaymentData == 'CHEQUE' || this.modeofPaymentData == 'CREDITREQ') {
      if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
        this.toastMessage.error("Transaction Reference Number cannot be empty!")
        return false;
      }
    }
    
    const cashPaymentDone = this.newPaymentList.some( item => item.ModeOfPayment == 'CASH')
    if (this.modeofPaymentData === 'CASH' && cashPaymentDone ) {
      this.toastMessage.error("You can't make Multiple Cash Payments!");
      return;
    }
    const hasAdvance = this.newPaymentList.some( item => item.ModeOfPayment == 'ADVANCE')
    if (this.modeofPaymentData === 'ADVANCE' && hasAdvance ) {
      this.toastMessage.error("You can't make Multiple Advance Payments!");
      return;
    }

    if (this.modeofPaymentData == 'ADVANCE' && this.Amount > this.TotalCustomerAdvance) {
      this.toastMessage.error("Advance Payment can't exceed Total Advance!")
      return
    }

    if ( this.modeofPaymentData != 'PINELABS' && this.modeofPaymentData != 'CREDIT CARD/UPI'){
      this.newPaymentList.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": this.modeofPaymentData,
        "AuthenticationNumber": this.AuthNo,
        "AccountNumber": this.AccountNo,
        "AccountHolderName": this.AccountHolderName,
        "BankCode": this.BankCode,
        "BankAccountNumber": this.BankAccountNo == null || this.BankAccountNo == undefined ? '' : this.BankAccountNo,
        "CardType": this.CardTypeData,
        "CardNumber": this.CardNo,
        "Adjudication": this.Adjudication,
        "TerminalId": this.TerminalId,
        "UTRDetails": '',
        "UPITransactionId" : this.UPITransactionId,
        "GLCode": this.GLCodeData,
        "HouseOfBank": this.houseofBank, 
      })
    }
    else if ( this.modeofPaymentData == 'CREDIT CARD/UPI'){
      this.newPaymentList.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI',  // Mode of Payment 
        "AuthenticationNumber": this.AuthNo,
        "AccountNumber": this.AccountNo,
        "AccountHolderName": this.AccountHolderName,
        "BankCode": this.BankCode,
        "BankAccountNumber": this.BankAccountNo == null || this.BankAccountNo == undefined ? '' : this.BankAccountNo,
        "CardType": this.CardTypeData,
        "CardNumber": this.CardNo,
        "Adjudication": this.Adjudication,
        "TerminalId": this.TerminalId,
        "UTRDetails": '',
        "UPITransactionId" : this.UPITransactionId,
        "GLCode": this.GLCodeData,
        "HouseOfBank": this.houseofBank, 
      })
      // this.Amount = 0.00
      // this.modeofPaymentData = '';
      // this.AuthNo = '';
      // this.AccountNo = ''
      // this.AccountHolderName = '';
      // this.BankCode = '';
      // this.BankAccountNo = null
      // this.CardTypeData = '';
      // this.CardNo = '';
      // this.Adjudication = '';
      // this.TerminalId = '';
      // this.UPITransactionId = ''
      // this.GLCodeData = ''
      // this.houseofBank = ''
      // this.allowedPaymentMode = ''
      // this.closePaymentPopUp()
    }
    console.log("Paymnet Object ", this.newPaymentList)

    this.totalPaidAmount = this.totalPaidAmount + this.Amount
    this.Amount = 0.00
    this.modeofPaymentData = '';
    this.AccountNo = ''
    this.AuthNo = '';
    this.CardTypeData = '';
    this.CardNo = '';
    this.Adjudication = '';
    this.TerminalId = '';
    this.UPITransactionId = '';
    this.RequestedAmt = 0.00;
    this.AccountHolderName = '';
    this.BankCode = '';
    this.houseofBank = '';
    this.BankAccountNo = 0.00;
    this.GLCodeData = ''
    this.closePaymentPopUp()
    return true;
  }


  getSalesObject() {
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetInvoicePaymentObject"
    })
    requestdata.push({
      "Key": "InvoiceGUID",
      "Value": this.params.headerguid
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
               ;
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No parts found")
              }
              else {
                console.log("Data ", data)
                this.IRNNumber = data.IRN == null || data.IRN == undefined?'':data.IRN
                this.invoiceCode = data.InvoiceCode;
                this.invoiceDate = data.InvoiceDate;
                this.InvoiceStatus = data.InvoiceStatus;
                this.salesPersonName = data?.SalesPersonName == null ? "" : data?.SalesPersonName
                this.Remarks = data?.Remarks
                this.SAPSOCode = (data.SAPSOCode == null || data.SAPSOCode == undefined) ? "" : data.SAPSOCode;
                this.SAPDeliveryCode = (data.SAPDeliveryCode == null || data.SAPDeliveryCode == undefined) ? "" : data.SAPDeliveryCode;
                this.SAPInvoiceCode = (data.SAPInvoiceCode == null || data.SAPInvoiceCode == undefined) ? "" : data.SAPInvoiceCode;
                this.DeliveryUpdateSuccess = (data.DeliveryUpdateSuccess == null || data.DeliveryUpdateSuccess == undefined) ? false : (data.DeliveryUpdateSuccess == "0" || data.DeliveryUpdateSuccess == "") ? false : true;
                this.DeliveryHeaderSuccess = (data.DeliveryHeaderSuccess == null || data.DeliveryHeaderSuccess == undefined) ? false : (data.DeliveryHeaderSuccess == "0" || data.DeliveryHeaderSuccess == "") ? false : true;
                this.PickingSuccess = (data.PickingSuccess == null || data.PickingSuccess == undefined) ? false : (data.PickingSuccess == "0" || data.PickingSuccess == "") ? false : true;
                this.PGISuccess = (data.PGISuccess == null || data.PGISuccess == undefined) ? false : (data.PGISuccess == "0" || data.PGISuccess == "") ? false : true;
                this.SerialUpdate = (data.SerialUpdateSuccess == null || data.SerialUpdateSuccess == undefined) ? false : (data.SerialUpdateSuccess == "0" || data.SerialUpdateSuccess == "") ? false : true;
                this.ETag = (data.ETag == null || data.ETag == undefined) ? "" : data.ETag;
                this.PaymentSuccess = data.PaymentSuccess == '1' ? true : false
                this.SAPPaymentCode = data.SAPPaymentCode == null || data.SAPPaymentCode == undefined || data.SAPPaymentCode == '' ? null : data.SAPPaymentCode
                this.OriginalPaidAmount = data.PaymentHeaderObject.TotalPaidAmount
             
                this.checkLocalPermission()
                if ( this.PaymentSuccess == false || this.SAPPaymentCode == null){
                  this.changeMOP = true
                }
                else{
                    this.toastMessage.error("SAP Payment already posted, can't change the Payments now!")
                    this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
                }
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

                for ( let payment of this.paymentDetailArray){
                  this.PaymentGuid = payment.PaymentGUID;
                  payment.IsDeleted = 0
                }
                
                
                if (Array.isArray(detailobject)) {
                  for (let item of detailobject) {
                    this.finalSelectedElements.push(item)
                  }

                }
                else {
                  this.finalSelectedElements.push(detailobject)
                }
                this.TotalNetAmount()
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

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    
    if(resp?.View == true){
      this.PaymentSuccess == false ? this.changeMOP = true : this.changeMOP = false
    }
    
    return resp != undefined && resp?.View ? true : false;
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
              console.log("Customer Object ", data)
              if (Array.isArray(data?.Customer)) {
                this.CustomerObject.push(data?.Customer[0])
              }
              else {
                this.CustomerObject.push(data?.Customer)
                this.errorMessage = "";
              }
              this.CreditAmount = this.CustomerObject[0].CreditAmount
              this.DebitAmount = this.CustomerObject[0].DebitAmount
              this.TotalCustomerAdvance = parseFloat( (this.CreditAmount - this.DebitAmount).toFixed(2));
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



  getAccessoryMarginListXml() {
    let rawData = {
      "rows": []
    }
    if (this.InvoiceDocTypeData === "DSALES") {
      for (let item of this.finalSelectedElements) {
        //if (item.StockPrice != null || item.StockPrice != undefined) {
        rawData.rows.push({
          "row": {
            "ItemType": item.ItemType,
            "InvoiceDetailGUID": uuidv4(),
            "ItemCode": item.MaterialCode,
            "ItemDescription": item.MaterialName,
            "Type": '',
            "ImageUrl": item.ImageUrl,
            "ProductCategory": '',
            "Quantity": item.Quantity == null || item.Quantity == undefined ? 1 : item.Quantity,
            "Billable": 1,
            "StockPrice": this.dynamicService.removeCommas(item.StockPrice == null || item.StockPrice == undefined ? "0" : item.StockPrice.toString()),
            "PricingOptions": "STOCKPRICE"
          }
        })
      }
    }
    else if (this.InvoiceDocTypeData === "RSALES") {
      for (let item of this.finalSelectedElements) {
        //if (item.NetPrice != null || item.NetPrice != undefined) {
        rawData.rows.push({
          "row": {
            "ItemType": item?.ItemType,
            "InvoiceDetailGUID": uuidv4(),
            "ItemCode": item.MaterialCode,
            "ItemDescription": item.MaterialName,
            "Type": '',
            "ImageUrl": item.ImageUrl,
            "ProductCategory": '',
            "Quantity": item.Quantity,
            "Billable": 1,
            "UnitPrice": this.dynamicService.removeCommas(item.NetPrice == null || item.NetPrice == undefined ? "0" : item.NetPrice.toString()),
            "PricingOptions": item.PriceType
          }
        })
        //}
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }



  calculatePaidAmount(){
    
    this.totalPaidAmount = 0
    this.paymentDetailArray.forEach((item) => {
      if (item.IsDeleted == '0'){
        this.totalPaidAmount += parseFloat(item.Amount);
      }
    });
    this.newPaymentList.forEach((item) => {
      this.totalPaidAmount += parseFloat(item.Amount);
    })
    // Round all totals to 2 decimal places
    this.totalPaidAmount = parseFloat(this.totalPaidAmount.toFixed(2));
  }
  
  calculatePrices(item)
  {
    item.BaseAmount = (parseFloat(item.UnitPrice) * item.Quantity)
    item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
    item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
    item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
    item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
    item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
    item.TaxAmount = item.GSTAmount
    item.NetAmount = item.TaxableAmount + item.TaxAmount
    this.TotalNetAmount()
  }

  TotalNetAmount() {
    this.totalBaseAmount = 0;
    this.totalDiscountAmount = 0;
    this.totalNetAmount = 0;
    this.totalTaxAmount = 0;
    this.totalTaxableAmount = 0;

    this.finalSelectedElements.forEach((item) => {
      this.totalTaxableAmount += parseFloat(item.TaxableAmount);
      this.totalTaxAmount += parseFloat(item.TaxAmount);
      this.totalDiscountAmount += parseFloat(item.DiscountAmount);
      this.totalBaseAmount += parseFloat(item.BaseAmount);
      // Calculate NetAmount and round it
      let netAmount = parseFloat(item.NetAmount);
      let decimalPart = netAmount - Math.floor(netAmount);
      if (decimalPart < 0.5) {
          item.NetAmount = Math.floor(netAmount);
      } else {
          item.NetAmount = Math.ceil(netAmount);
      }
      this.totalNetAmount += parseFloat(item.NetAmount);
    });

    // Round all totals to 2 decimal places
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
    this.totalNetAmount = parseFloat(this.totalNetAmount.toFixed(2));
  }


  // onSubmit() {
  //   
  //   //this.submitClicked=true;
  //   var hasLesserUnitPrice = false
  //   for(let item of this.finalSelectedElements)
  //   {
  //     this.calculatePrices(item)
  //     if(parseFloat(item.UnitPrice) < parseFloat(item.MinimumUnitPrice))
  //     {
  //       hasLesserUnitPrice=true
  //     }

  //   }

  //   //const hasLesserUnitPrice = this.finalSelectedElements.some((item => (item?.UnitPrice < item?.MinimumUnitPrice) && (item?.ItemType == "Material")))
  //   const hasHigherDiscountPrice = this.finalSelectedElements.some((item =>{item?.DiscountAmount > item?.UnitPrice}))
  //   if(hasHigherDiscountPrice)
  //   {
  //     this.toastMessage.error("Discount Amount cannot be greater than Unit Price")
  //     return
  //   }
  //   if(!(this.params.customercode=="123909249" || this.params.customercode=="123909265" || this.params.customercode=="123909277" || this.params.customercode=="123909247"))
  //   {
  //     if (hasLesserUnitPrice) {
  //       this.toastMessage.error("Unit price cannot be lesser than Minimum Unit Price")
  //       return;
  //     }
  //   }

  //   const hasZeroUnitPrice = this.finalSelectedElements.some((item =>{item?.UnitPrice==0}))
  //   if(hasZeroUnitPrice)
  //   {
  //     this.toastMessage.error("Unit Price cannot be zero")
  //     return
  //   }    

  //   if (this.salesPersonName == '') {
  //     this.toastMessage.error("Please select Sales Person Name")
  //     return
  //   }
  //   const hasBlankKGB = this.finalSelectedElements.some((item => (item?.SerialNo == null || item?.SerialNo == "" || item?.SerialNo == undefined)
  //    && (item?.ItemType == "Material")))
  //   if (hasBlankKGB) {
  //     this.toastMessage.error("Cannot insert null value in Serial No")
  //     return;
  //   }
  //   const hasBlankCostPrice = this.finalSelectedElements.some((item => (item?.CostPrice == null || item?.CostPrice == "0" || item?.CostPrice == undefined) 
  //   && (item?.ItemType == "Material" && item.SerializedModule == "1")))
  //   if (hasBlankCostPrice) {
  //     this.toastMessage.error("Cost Price cant be empty or less than 1")
  //     return;
  //   }
  //   const hasBlankKGB4Insurance = this.finalSelectedElements.some((item => (item?.SerialNo == null || item?.SerialNo == "" || item?.SerialNo == undefined) 
  //   && (item?.ItemType == "Resource" && item.SerializedModule == "1")))
  //   if (hasBlankKGB4Insurance) {
  //     this.toastMessage.error("Cannot insert null value in Serial No")
  //     return;
  //   }
  //   if (this.totalPaidAmount > (this.totalNetAmount + 1) || this.totalPaidAmount < (this.totalNetAmount - 1)) {
  //     this.toastMessage.error("Paid Amount does not match with Total Net Amount")
  //     return;
  //   }
  //   const hasBlankBatch = this.finalSelectedElements.some(item => (item?.Batch == null || item?.Batch === '' || item?.Batch == undefined) && (item?.ItemType == "Material"));
  //   if (hasBlankBatch) {
  //     this.toastMessage.error("Cannot insert null or empty value in Batch Number")
  //     return;
  //   }
  //   const hasBlankMaterialName = this.finalSelectedElements.some(item => item.MaterialName == null || item?.MaterialName === '' || item?.MaterialName == undefined);
  //   if (hasBlankMaterialName) {
  //     this.toastMessage.error("Material Name Not Found...")
  //     return;
  //   }

  //   const hasBlankGSTGroup = this.finalSelectedElements.some(item => item.GSTGroupCode == null || item.GSTGroupCode === '' || item.GSTGroupCode == undefined);
  //   if (hasBlankGSTGroup) {
  //     this.toastMessage.error("GST Detail Not found")
  //     return;
  //   }
    
  //   const hasBlankGSTAmount = this.finalSelectedElements.some(item => item.GSTPercentage == 0);
  //   if(!(this.CustomerObject[0].GSTRegistrationType == "GSEZ"))
  //   {
  //     if (hasBlankGSTGroup) {
  //       this.toastMessage.error("GST is not configured for item")
  //       return;
  //     }
  //   }
  //   if(this.submitClicked == true)
  //   {
  //     return;
  //   }
  //   this.submitClicked=true    
  //   this.ngxSpinnerService.show()
    
  //   for (let item of this.finalSelectedElements) {
  //     item.InvoiceHeaderGUID = this.InvoiceGuid
  //   }

  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "SaveInvoice4Job"
  //   });
  //   requestData.push({
  //     "Key": "InvoiceGuid",
  //     "Value": this.InvoiceGuid
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "InvoiceCode",
  //     "Value": ""
  //   });
  //   requestData.push({
  //     "Key": "SalesPersonName",
  //     "Value": this.salesPersonName == null || this.salesPersonName == undefined ? "" : this.salesPersonName
  //   });
  //   requestData.push({
  //     "Key": "Remarks",
  //     "Value": this.Remarks == null || this.Remarks == undefined ? "" : this.Remarks
  //   });

  //   requestData.push({
  //     "Key": "InvoiceDocType",
  //     "Value": this.InvoiceDocTypeData
  //   });
  //   requestData.push({
  //     "Key": "InvoiceDate",
  //     "Value": new Date(),
  //   });
  //   requestData.push({
  //     "Key": "LocationCode",
  //     "Value": this.locationData
  //   });
  //   requestData.push({
  //     "Key": "CaseGuid",
  //     "Value": this.params.caseguid == null || this.params.caseguid == undefined ? "00000000-0000-0000-0000-000000000000" : this.params.caseguid
  //   });
  //   requestData.push({
  //     "Key": "CaseID",
  //     "Value": ""
  //   });
  //   requestData.push({
  //     "Key": "RetailCustomerCode",
  //     "Value": this.params.customercode == null || this.params.customercode == undefined ? "" : this.params.customercode
  //   });
  //   requestData.push({
  //     "Key": "TotalBaseAmount",
  //     "Value": this.totalBaseAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalDiscountAmount",
  //     "Value": this.totalDiscountAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalTaxableAmount",
  //     "Value": this.totalTaxableAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalTaxAmount",
  //     "Value": this.totalTaxAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalNetAmount",
  //     "Value": this.totalNetAmount
  //   });
  //   requestData.push({
  //     "Key": "InvoiceStatus",
  //     "Value": "RELEASED"
  //   });
  //   requestData.push({
  //     "Key": "InvoiceDetails",
  //     "Value": this.saveInvoiceListXml()
  //   });
  //   requestData.push({
  //     "Key": "PaymentDetail",
  //     "Value": this.savePaymentListXml()
  //   })
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   console.log("Request Data ", requestData)
  //   // alert("Return On")
  //   // return
  //   //this.ngxSpinnerService.show();
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
          
  //         
  //         let response = JSON.parse(value.toString());
  //          ;
  //         if (response.ReturnCode == '0') {
         
  //           let data = JSON.parse(response?.ExtraData);
  //           this.IRNNumber = data.IRN == null || data.IRN == undefined?'':data.IRN
  //           this.invoiceCode = data.InvoiceCode;
  //           this.invoiceDate = data.InvoiceDate;
  //           this.sapinvoiceGUID = data.InvoiceGuid;
  //           this.InvoiceStatus = data?.InvoiceStatus;
  //           this.salesPersonName = data?.SalesPersonName == null ? "" : data?.SalesPersonName
  //           this.Remarks = data?.Remarks
  //           this.SAPSOCode = (data.SAPSOCode == null || data.SAPSOCode == undefined) ? "" : data.SAPSOCode;
  //           this.SAPDeliveryCode = (data.SAPDeliveryCode == null || data.SAPDeliveryCode == undefined) ? "" : data.SAPDeliveryCode;
  //           this.SAPInvoiceCode = (data.SAPInvoiceCode == null || data.SAPInvoiceCode == undefined) ? "" : data.SAPInvoiceCode;
  //           this.DeliveryUpdateSuccess = (data.DeliveryUpdateSuccess == null || data.DeliveryUpdateSuccess == undefined) ? false : (data.DeliveryUpdateSuccess == "0" || data.DeliveryUpdateSuccess == "") ? false : true;
  //           this.DeliveryHeaderSuccess = (data.DeliveryHeaderSuccess == null || data.DeliveryHeaderSuccess == undefined) ? false : (data.DeliveryHeaderSuccess == "0" || data.DeliveryHeaderSuccess == "") ? false : true;
  //           this.PickingSuccess = (data.PickingSuccess == null || data.PickingSuccess == undefined) ? false : (data.PickingSuccess == "0" || data.PickingSuccess == "") ? false : true;
  //           this.PGISuccess = (data.PGISuccess == null || data.PGISuccess == undefined) ? false : (data.PGISuccess == "0" || data.PGISuccess == "") ? false : true;
  //           this.SerialUpdate = (data.SerialUpdateSuccess == null || data.SerialUpdateSuccess == undefined) ? false : (data.SerialUpdateSuccess == "0" || data.SerialUpdateSuccess == "") ? false : true;
  //           this.ETag = (data.ETag == null || data.ETag == undefined) ? "" : data.ETag;
          
  //           this.isEdit = true;
  //           this.newPaymentList=[];
  //           let detailobject = data?.InvoiceDetailObject?.InvoiceDetail
  //           if (!(data?.PaymentObject == null || data?.PaymentObject == undefined)) {
  //             let paymentobject = data?.PaymentObject?.PaymentDetail
  //             if (Array.isArray(paymentobject)){
  //               for (let item of paymentobject){
  //                 this.newPaymentList.push(item)
  //               }
  //             }
  //             else {
  //               this.newPaymentList.push(paymentobject)
  //             }
  //             this.newPaymentList.forEach((payment)=>{
  //               this.totalPaidAmount += parseFloat(payment.Amount)
  //             })
  //           }
  //           this.finalSelectedElements=[];
  //           if (Array.isArray(detailobject)) {
  //             for (let item of detailobject) {
  //               this.finalSelectedElements.push(item)
  //             }

  //           }
  //           else {
  //             this.finalSelectedElements.push(detailobject)
  //           }
  //           this.TotalNetAmount()
      
  //         }
  //         else {
  //           
  //           this.errorMessage = response.ReturnMessage;
  //           this.toastMessage.error("Error While Saving Invoice")
  //           let errorMessage = response.ErrorMessage;
  //            const parser = new xml2js.Parser({ strict: false, trim: true });
  //            parser.parseString( errorMessage , (error, result) => {
  //              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
  //              errorMessages.forEach((errorMessage) => {
  //                this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
  //              });
  //            }); 
  //         }
  //       },
  //       error: err => {
  //         this.submitClicked=false;
  //         this.ngxSpinnerService.hide()
  //         console.log(err);
  //       }
  //     });
  // }

  showAddParts(item){
    this.ngxSpinnerService.show()
    this.discountMaterialCode = item.MaterialCode
    this.discountPartUnitPrice = item.UnitPrice
    let requestData = []
    requestData.push({
      "Key":"APIType",
      "Value":"GetDiscount4Customer"
    })
    requestData.push({
      "Key":"CustomerCode",
      "Value":this.CustomerObject[0].CustomerCode
    })
    requestData.push({
      "Key":"MaterialCode",
      "Value":item.MaterialCode
    })
    requestData.push({
      "Key":"LocationCode",
      "Value":this.locationData
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.popUpArray = []
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No Discount Available")
              }
              else {
                if (Array.isArray(data?.DiscountCouponList?.DiscountCoupon)) {
                  this.popUpArray = data?.DiscountCouponList?.DiscountCoupon
                }
                else {
                  this.popUpArray.push(data?.DiscountCouponList?.DiscountCoupon)
                }
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




  downloadServiceReport(reportType: String) {
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetInvoiceObject4Print",
    });
    PdfData.push({
      "Key": "InvoiceGuid",
      "Value": this.params.headerguid,
    });
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    let storepdf = contentRequest;
    this.reportService.downloadServiceReport(reportType, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
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

  deleteOriginalPayment(item) {

    console.log("Item to be Deleted ", item)
    let index = this.paymentDetailArray.indexOf(item)
    console.log("Item Index to be Deleted ", index)
    let shouldConfirm = item.IsDeleted == "0" ? confirm("Are you sure you want to delete this Payment?") : confirm("Are you sure you want to undo the delete?")  
    if (shouldConfirm == true) {
      item.IsDeleted == "0" ? 
        this.paymentDetailArray[index].IsDeleted = "1" : this.paymentDetailArray[index].IsDeleted = "0" 
    }
    this.calculatePaidAmount()
    console.log( "After Delete ",this.paymentDetailArray)
  }


  deleteNewPayment(item) {
    console.log("Item to be Deleted ", item)
    let index = this.newPaymentList.indexOf(item)
    console.log("Item Index to be Deleted ", index)
    this.newPaymentList.splice(index, 1)
    console.log( "After Delete ",this.finalSelectedElements)
    this.calculatePaidAmount()
  }

  getLocationData() {
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
            this.SAPStorageLocation = this.LocationObject[0]?.SAPStorageLocation
            this.SAPPlantCode = this.LocationObject[0]?.SAPPlantCode
            console.log("SAPPlantCode ", this.SAPPlantCode);

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


  onInvoiceDocTypeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.InvoiceDocType, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          for (let item of value.Data) {
            if (this.params.doctype != undefined || this.params.doctype != null) {
              if (item.Id == this.params.doctype) {
                this.InvoiceDocTypeData = item.Id
                this.title = item.TEXT
                break
              }
            }
          }

          this.InvoiceDocType = value;
        }
      },
      error: (err) => {
        this.InvoiceDocType = DropDownValue.getBlankObject();
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

  onModeofPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ModeofPayment, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ModeofPayment = value;
          console.log("Mode of payments ", this.ModeofPayment)
        }
      },
      error: (err) => {
        this.ModeofPayment = DropDownValue.getBlankObject();
      }
    });

  }

  onSalesPersonSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.SalesPerson, $event.term, {
      LocationCode: this.params.locationcode
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.SalesPersonDD = value;
        }
      },
      error: (err) => {
        this.SalesPersonDD = DropDownValue.getBlankObject();
      }
    });
  }

  onPricingOptionSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.PricingOption, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.PricingOptionDD = value;
        }
      },
      error: (err) => {
        this.PricingOptionDD = DropDownValue.getBlankObject();
      }
    });
  }


  // PineLabs Integration

  isPaymentpopUp: boolean = false
   // PineLabs 
   transactionNumber: string;
   previousEDCPaymentRecords: any[] = [];
   allowedPaymentMode:string;
   edcMachineObject :any[] = [];
   edcMachineName:string ;
   previousRecordsFound:boolean = false
   isEdcPayment: boolean = false;
   isPreviousButton: boolean = false;
   pinelabsPaymentArray: DropDownValue = DropDownValue.getBlankObject();
   isDefaultMOP: boolean = false
   isPaymentProcessing = false

   // Paytm 
   transactionDateTime: string
   transactionAmount: number
   paytmSaveResponseObj : any
   paytmFinalResponseObj : any

  onAllowedPaymentSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.AllowedPaymentMode, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.pinelabsPaymentArray = value;
        }
      },
      error: (err) => {
        this.pinelabsPaymentArray = DropDownValue.getBlankObject();
      }
    });
  }

  // getCustomerModeOfPaymentLink(){
  //   let requestdata = []
  //   requestdata.push({
  //     "Key": "ApiType",
  //     "Value": "GetCustomerModeOfPaymentLink"
  //   })
  //   requestdata.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   })
  //   requestdata.push({
  //     "Key": "CustomerCode",
  //     "Value": this.params.customercode
  //   })
  //   requestdata.push({
  //     "Key": "LocationCode",
  //     "Value": this.params.locationcode
  //   })
  //   requestdata.push({
  //     "Key": "TransactionType",
  //     "Value": 'INVOICE'
  //   })
  //   let strRequestData = JSON.stringify(requestdata);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (Value) => {
  //         this.ngxSpinnerService.hide()
  //         try {
  //           let response = JSON.parse(Value.toString());
  //           console.log("repsonse  ", response)

  //           if (response.ReturnCode == '0') {
  //             let data = JSON.parse(response?.ExtraData);
  //             if (data.Totalrecords != "0") {
  //               this.toastMessage.info("Opening Default Mode of Payment for this Customer")
  //               // Dont show confirm box when Default is Credit Req
  //               data.Link.ModeOfPayment == 'CREDITREQ' ? this.isDefaultMOP = true : this.isDefaultMOP = false
  //               this.openPayment(data.Link.ModeOfPayment)
  //             }
              
  //           }
  //         } catch (ext) {
  //         }
  //       },
  //       error: err => {
  //         this.ngxSpinnerService.hide()
  //         console.log(err)
  //       }
  //     }
  //   );
  // }

  getEDCPinelabsMachineObject() {
 
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetEDCMachineObject"
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    })
    requestdata.push({
      "Key": "EDCType",
      "Value": this.modeofPaymentData
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
                this.edcMachineObject = []
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


  changePineLabsMOP(){
    let paymentType= this.allowedPaymentMode=="1" ? "CREDITCARD":"UPI" 
      for(let item of this.ModeofPayment.Data)
      {
        if(item.Id == paymentType)
        {
          this.GLCodeData = item.GLCode
          this.houseofBank = item.extraData
        }
      }
      this.ResetFiedlsOnChange()
  }

  resetChanges(){
    this.newPaymentList =  []
    this.paymentDetailArray.forEach(item =>
      item.IsDeleted = '0'
    )
    this.calculatePaidAmount()
  }

  validateChangeInPayment ()
  {
    
    const cashPaymentDone = this.newPaymentList.some( item => item.ModeOfPayment == 'CASH')
    const cashOldPaymentDone = this.paymentDetailArray.some( item => item.ModeOfPayment == 'CASH' && item.IsDeleted == '0')
    if (this.modeofPaymentData == 'CASH' && ( cashPaymentDone|| cashOldPaymentDone) ) {
      this.toastMessage.error("You can't make Multiple Cash Payments!");
      return false;
    }
    const hasAdvance = this.newPaymentList.some( item => item.ModeOfPayment == 'ADVANCE')
    const hasOldAdvance = this.paymentDetailArray.some( item => item.ModeOfPayment == 'ADVANCE'  && item.IsDeleted == '0')
  if (this.modeofPaymentData == 'ADVANCE' && ( hasAdvance || hasOldAdvance )  ) {
      this.toastMessage.error("You can't make Multiple Advance Payments!");
      return false;
    }

    if (this.modeofPaymentData == 'ADVANCE' && this.TotalCustomerAdvance < 1 ) {
      this.toastMessage.error("No Advance Found for this Customer!")
      return false;
    }
    if (this.modeofPaymentData == 'CREDITREQ' ){
      const ShouldContinue = confirm("Are you sure you want to choose Credit Request instead of Credit Card Option, Do you want to continue?")
      if (ShouldContinue == false ){
        return false;
      }
    }
    return true;
    
  }

  openPayment(paymentType)
  { 
    // let NEWPAYMENT = item.NEWPAYMENT
    // let index = this.newPaymentList.findIndex(py => item)
    this.modeofPaymentData = paymentType
    let valid = this.validateChangeInPayment()
    if (!valid){

      return
    }
    
    if ( this.modeofPaymentData == 'PINELABS' ){
      this.getEDCPinelabsMachineObject()
    }
    if ( this.modeofPaymentData == 'PAYTM'){
      this.getEDCPaytmMachineObject()
    }
    this.edcMachineName = null
    this.allowedPaymentMode = null

    for(let item of this.ModeofPayment.Data)
    {
      if(item.Id == this.modeofPaymentData)
      {
        this.GLCodeData = item.GLCode
        this.houseofBank = item.extraData
      }
    }
    this.isPaymentpopUp = true
    console.log("MOP ", this.modeofPaymentData);
  }

  callEDCStatus()
  {
    if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
      this.toastMessage.error( ( this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") +  "Machine Name cannot be empty!")
      return false;
    }
    if (this.transactionNumber == '' || this.transactionNumber == null || this.transactionNumber == undefined) {
      this.toastMessage.error(( this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") + "Transaction Number cannot be empty!")
      return false;
    }
    

    for(let item of this.newPaymentList)
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
        this.transactionAmount = item.Amount
        this.transactionDateTime = item.TransactionDateTime
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
    this.modeofPaymentData == 'PINELABS' ? this.getEDCPaymentStatus() :  this.getPaytmEDCPaymentStatus()
  }
  
  
  getPreviousEDCPaymentObj4Customer()
  {
    this.isEdcPayment = false
    this.isPreviousButton = true
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
      Value: this.params.customercode
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.params.locationcode
    });
    requestData.push({
      Key: "TransactionStatus",
      Value: "APPROVED"
    });
    requestData.push({
      Key: "EDCType",
      Value: this.modeofPaymentData
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
                // this.previousRecordsFound = true
            }
          }
          else
          {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.isEdcPayment = true
            // this.previousRecordsFound = false
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
        let response = JSON.parse(Value?.toString());
        console.log("EDC Response ", response)
        let stringresponse = Value.toString()
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
            // this.newPaymentList = []
            this.newPaymentList.push({

              "NEWPAYMENT": 1,
              "TranType": "Payment",
              "TranDate": new Date(),
              "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
              "ModeOfPayment": this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI',
              "AuthenticationNumber": this.AuthNo,
              "AccountNumber": this.AccountNo,
              "AccountHolderName": this.AccountHolderName,
              "BankCode": this.BankCode,
              "BankAccountNumber": this.BankAccountNo == null || this.BankAccountNo == undefined ? '' : this.BankAccountNo,
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
          console.log("Payment List ", this.newPaymentList)
          this.totalPaidAmount = this.totalPaidAmount + this.Amount
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AccountNo = ''
          this.AuthNo = '';
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = '';
          this.RequestedAmt = 0.00;
          this.AccountHolderName = '';
          this.BankCode = '';
          this.houseofBank = '';
          this.BankAccountNo = 0.00;
          this.GLCodeData = ''
          this.houseofBank = '' 
          this.isPaymentpopUp = false
        }
        else if(response.ResponseCode=="1")
        {
          this.isPaymentProcessing = false
          // this.previousRecordsFound = false
          this.errorMessage = response.ResponseMessage;
          this.toastMessage.error(this.errorMessage, "Transaction has been cancelled")
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AccountNo = ''
          this.AuthNo = '';
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = '';
          this.RequestedAmt = 0.00;
          this.AccountHolderName = '';
          this.BankCode = '';
          this.houseofBank = '';
          this.BankAccountNo = 0.00;
          this.GLCodeData = ''
          this.getPreviousEDCPaymentObj4Customer()
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
    this.isEdcPayment=true
    this.isPreviousButton = false
    // this.previousRecordsFound = false
  }
    
  
  savePineLabsEDCPayment()
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
      "EDCType" : this.modeofPaymentData,
      "CompanyCode":glob.getCompanyCode(),
      "LocationCode":this.params.locationcode,
      "CustomerCode":this.params.customercode,
      "CaseGUID":this.params.caseguid == null || this.params.caseguid == undefined ?'00000000-0000-0000-0000-000000000000' : this.params.caseguid ,
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
          this.toastMessage.info("Your Plutus Transaction Reference number", this.transactionNumber,{timeOut: 500000})
          if(response.TransactionNumber != null && response.TransactionNumber != undefined)
          {
            this.toastMessage.success("Your EDC Transaction Reference Number", response.TransactionNumber,{timeOut: 500000})
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

  ///// **************************   PAYTM ***************************************************
  
  getEDCPaytmMachineObject() {
 
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetEDCPaytmMachineObject"
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
                this.edcMachineObject = []
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


  savePaytmEDCPayment()
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
      "EDCType":this.modeofPaymentData,
      "CompanyCode":glob.getCompanyCode(),
      "LocationCode":this.params.locationcode,
      "CustomerCode":this.params.customercode,
      "CaseGUID":this.params.caseguid == null || this.params.caseguid == undefined ?'00000000-0000-0000-0000-000000000000' : this.params.caseguid ,
      "SequenceNumber":"1",
      "AllowedPaymentMode": this.allowedPaymentMode, // this.allowedPaymentMode,
      "MerchantStorePOSCode": "", //edcObject.MerchantStorePOSCode,
      "Amount":parseInt((this.Amount).toString())*100,
      "MerchantID":edcObject.MerchantID,
      "MachineHardwareID":edcObject.HardwareID,
      "SecurityToken":edcObject.MerchantKey,
      "IMEI": "" , // edcObject.UniqueStoreMachineID
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
    this.gsxService.uploadPaytmEDCTransaction(contentRequest).subscribe({
      next: (Value) => {
        
        let response = JSON.parse(Value.toString());
        this.paytmSaveResponseObj = JSON.parse(Value.toString());

        console.log("Response ", response)
        if (this.paytmSaveResponseObj.body.resultInfo.resultCode != "F") {
          this.transactionNumber = this.paytmSaveResponseObj.body.merchantTransactionId
          let timestamp = this.paytmSaveResponseObj.head.responseTimestamp;
          this.transactionDateTime = timestamp.slice(0, 10) + 'T' + timestamp.slice(10); 
          // this.transactionDateTime = this.paytmSaveResponseObj.head.responseTimestamp.insert(10,'T')
          this.transactionAmount = parseInt((this.Amount).toString())*100
          this.toastMessage.info("Your Paytm EDC Transaction number", this.transactionNumber,{timeOut: 2000000})
          this.toastMessage.info("Your Paytm EDC Transaction Timestamp", this.transactionDateTime,{timeOut: 2000000})
          this.getPaytmEDCPaymentStatus()
        }
        else {
          this.isPaymentProcessing = false
          this.errorMessage = response.body.resultInfo.resultMsg;
          this.toastMessage.error(this.errorMessage)
        }
      },
      error: (err) => {
        this.isPaymentProcessing = false
        console.log(err);
      },
    });
  } 


  getPaytmEDCPaymentStatus()
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
      "paytmMid":edcObject.MerchantID,
      "paytmTid" : edcObject.HardwareID,
      "transactionDateTime" : this.transactionDateTime.replace('T' , ' ')  ,
      "merchantTransactionId" : this.transactionNumber ,
      "transactionAmount" : this.transactionAmount,
      "MerchantKey" : edcObject.MerchantKey ,
      // "TransactionNumber" : this.transactionNumber,
      // "EDCType" :  edcObject.EDCType ,
      // "SecurityToken":edcObject.SecurityToken,
      // "IMEI":edcObject.UniqueStoreMachineID,
      // "MerchantStorePosCode":edcObject.MerchantStorePOSCode,  
    }
    let strRequestData = JSON.stringify(objData)
    let contentRequest = {
      "content":strRequestData
    }
    // 
    // return
    // this.ngxSpinnerService.show()
    this.gsxService.getEDCPaytmTransactionStatus(contentRequest).subscribe({
      next: (Value) => {
        
        // this.ngxSpinnerService.hide()
        let response = JSON.parse(Value?.toString());
        console.log("EDC Response ", response)
        let stringresponse = Value.toString()
        var responsemessage=response.ResponseMessage
        if (response.body.resultInfo?.resultCode == "S") 
          {
            this.isPaymentProcessing = false
            var transactiondetail=response.body;
            this.TerminalId= transactiondetail.paytmTid;
            this.Adjudication= "";
            this.transactionNumber = transactiondetail.merchantTransactionId
            this.UPITransactionId=transactiondetail.retrievalReferenceNo;
            if ( transactiondetail.payMethod != "UPI"){
              this.CardTypeData = transactiondetail.cardScheme
              this.CardNo = transactiondetail.issuerMaskCardNo
              this.Adjudication = transactiondetail.authCode
            }
            let paymentType = response.body.payMethod == 'UPI' ? 'UPI' : 'CREDITCARD'
            let mopObj =  this.ModeofPayment.Data.find( mode => mode.Id == paymentType)
            this.GLCodeData = mopObj.GLCode
            this.houseofBank = mopObj.extraData 
            
            this.newPaymentList.push({
              
              "NEWPAYMENT": 1,
              "TranType": "Payment",
              "TranDate": new Date(),
              "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
              "ModeOfPayment": paymentType,
              "AuthenticationNumber": this.AuthNo,
              "AccountNumber": this.AccountNo,
              "AccountHolderName": this.AccountHolderName,
              "BankCode": this.BankCode,
              "BankAccountNumber": this.BankAccountNo == null || this.BankAccountNo == undefined ? '' : this.BankAccountNo,
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
          this.toastMessage.success("Transaction Successfull!", response.body.resultInfo?.resultMsg)
          console.log("Payment List ", this.newPaymentList)
          this.totalPaidAmount = this.totalPaidAmount + this.Amount
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AccountNo = ''
          this.AuthNo = '';
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = '';
          this.RequestedAmt = 0.00;
          this.AccountHolderName = '';
          this.BankCode = '';
          this.houseofBank = '';
          this.BankAccountNo = 0.00;
          this.GLCodeData = ''
          this.houseofBank = '' 
          this.isPaymentpopUp = false
        }
        else if(response.body.resultInfo.resultCode == "F")
        {
          this.isPaymentProcessing = false
          // this.previousRecordsFound = false
          this.errorMessage = response.body.resultInfo.resultMsg;
          this.toastMessage.error(this.errorMessage, "Transaction has been cancelled", {timeOut: 50000})
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AccountNo = ''
          this.AuthNo = '';
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = '';
          this.RequestedAmt = 0.00;
          this.AccountHolderName = '';
          this.BankCode = '';
          this.houseofBank = '';
          this.BankAccountNo = 0.00;
          this.GLCodeData = ''
          this.getPreviousEDCPaymentObj4Customer()
          this.closePaymentPopUp()
        }
        else {
          setTimeout(() => {
            this.toastMessage.info(response.body.resultInfo.resultMsg)
            this.getPaytmEDCPaymentStatus();
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

  getPreviousPaytmEDCObj4Customer()
  {
    this.isEdcPayment = false
    this.isPreviousButton = true
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
      Value: this.params.customercode
    });
    requestData.push({
      Key: "LocationCode",
      Value: this.params.locationcode
    });
    requestData.push({
      Key: "TransactionStatus",
      Value: "APPROVED"
    });
    requestData.push({
      Key: "EDCType",
      Value:  this.modeofPaymentData
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

              this.previousEDCPaymentRecords = Array.isArray(data) ? data : [data]
              // if(Array.isArray(data))
              // {
              //   this.previousEDCPaymentRecords = data
              // }
              // else
              // {
              //   this.previousEDCPaymentRecords.push(data)
              // }
              this.previousEDCPaymentRecords.forEach(item =>{
                if(item.Amount != "0" && item.Amount != '' && item.Amount != null && item.Amount != undefined)
                {
                  item.Amount = parseFloat(item.Amount)
                }
              })
              console.log("previousEDCPaymentRecords ", this.previousEDCPaymentRecords)
                // this.previousRecordsFound = true
            }
          }
          else
          {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.isEdcPayment = true
            // this.previousRecordsFound = false
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

  closePaymentPopUp(){
    this.isPaymentpopUp = false
    this.isPreviousButton = false
    if ( this.modeofPaymentData == 'PINELABS'){
      // this.previousRecordsFound = false
      this.isEdcPayment = false
    }
  }


  // ***************************************** UPDATE PAYMENT *************************************************

  
  savePaymentListXml() {
    let rawData = {
      "rows": []
    }
    if (this.newPaymentList.length > 0) {
      console.log("Payment List ", this.newPaymentList)
      for (let item of this.newPaymentList) {
        if (item.NEWPAYMENT == 1) {
          rawData.rows.push({
            "row": {
              "PaymentGUID": this.PaymentGuid,
              "PaymentDetailGUID" : uuidv4(),
              "TranType": item?.TranType == null || item?.TranType == undefined ? 'Payment' : item?.TranType,
              "TranDate": new Date(),
              "Amount": item?.Amount == null || item?.Amount == undefined ? 0.00 : item?.Amount,
              "ModeOfPayment": item?.ModeOfPayment,
              "AccountNumber": item?.AccountNumber,
              "AuthenticationNumber": item?.AuthenticationNumber,
              "CardType": item?.CardType,
              "CardNumber": item?.CardNumber,
              "Adjudication": item?.Adjudication,
              "TerminalId": item?.TerminalId,
              "HouseOfBank":item?.HouseOfBank == null || item?.HouseOfBank == undefined ?'' : item?.HouseOfBank,
              "RequestedAmount": item?.RequestedAmount == null || item?.RequestedAmount == undefined ? 0.00 : item?.RequestedAmount,
              "AccountHolderName": item?.AccountHolderName,
              "BankCode": item?.BankCode,
              "BankAccountNo": item?.BankAccountNo,
              "UTRNumber":'',
              "UPITransactionId":item?.UPITransactionId,
              "GLCode": item.GLCode == null || item.GLCode == undefined ? "" : item.GLCode,
              "CompanyCode": glob.getCompanyCode(),
              "EDCMachineType":item?.EDCMachineType,
              "EDCMachineReferenceID":item?.EDCMachineReferenceID ==  null || item?.EDCMachineReferenceID  == undefined?"": item.EDCMachineReferenceID ,
              "IsDeleted": false ,
              "AdvanceDocXML":item?.AdvanceDocXML
            }
          })
        }
      }
      for (let item of this.paymentDetailArray) {
        console.log("Payment List ", this.paymentDetailArray)
        rawData.rows.push({
          "row": {
              "PaymentDetailGUID" : item.PaymentDetailGUID,
              "PaymentGUID": this.PaymentGuid,
              "TranType": item?.TranType,
              "TranDate": item?.TranDate,
              "Amount":  item?.Amount,
              "ModeOfPayment": item?.ModeOfPayment,
              "AccountNumber": item?.AccountNumber,
              "AuthenticationNumber": item?.AuthenticationNumber,
              "CardType": item?.CardType,
              "CardNumber": item?.CardNumber,
              "Adjudication": item?.Adjudication,
              "TerminalId": item?.TerminalId,
              "HouseOfBank": item?.HouseOfBank == null || item?.HouseOfBank == undefined ?'' : item?.HouseOfBank,
              "RequestedAmount": item?.RequestedAmount == null || item?.RequestedAmount == undefined ? 0.00 : item?.RequestedAmount,
              "AccountHolderName": item?.AccountHolderName,
              "BankCode": item?.BankCode,
              "BankAccountNo": item?.BankAccountNo,
              "UTRNumber":'',
              "UPITransactionId":item?.UPITransactionId,
              "GLCode": item.GLCode == null || item.GLCode == undefined ? "" : item.GLCode,
              "CompanyCode": glob.getCompanyCode(),
              "EDCMachineType":item?.EDCMachineType,
              "EDCMachineReferenceID": item.EDCMachineReferenceID ,
              "IsDeleted": item.IsDeleted == '1' ? true : false,
            }
          })
      }
    
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(rawData);
      xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
      xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
      console.log("Payment xml ", xml)
      return xml;
    }
  }

  updateInvoice() {
    

    if (this.totalPaidAmount > (this.totalNetAmount + 1) || this.totalPaidAmount < (this.totalNetAmount - 1)) {
      this.toastMessage.error("Paid Amount does not match with Total Net Amount")
      return;
    }
    if ( this.salesPersonName == null || this.salesPersonName == undefined || this.salesPersonName ==''){
      this.toastMessage.error("Please select Sales Person Name")
      return
    }
    // if (this.newPaymentList.length < 1 ) {
    //   this.toastMessage.error("No change in Payment/s detected!")
    //   return;
    // }
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateInvoicePayment"
    });
    requestData.push({
      "Key": "PaymentGuid",
      "Value": this.PaymentGuid
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.InvoiceGuid
    });
    requestData.push({
      "Key": "SalesPersonName",
      "Value": this.salesPersonName
    });
    requestData.push({
      "Key": "Remarks",
      "Value": this.Remarks == null || this.Remarks == undefined ? "" : this.Remarks
    });
    // requestData.push({
    //   "Key": "locationcode",
    //   "Value": this.params.locationcode
    // });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "PaymentDetail",
      "Value": this.savePaymentListXml()
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Request Data ", requestData)
    // alert("Return On")
    // return
    
    if(this.submitClicked == true)
      {
        return;
      }
      this.submitClicked=true    
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
           console.log("Error ", response)

          if (response.ReturnCode == '0') {
         
            let data = JSON.parse(response?.ExtraData);
            this.toastMessage.success("Payment Changed Successfully!")
            this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
          }
          else {
            
            let data = JSON.parse(response?.ExtraData);
            console.log("Error ", data)

            this.errorMessage = response.ErrorMessage;
            this.toastMessage.error("Error While Saving Invoice")
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
          this.submitClicked=false;
          this.ngxSpinnerService.hide()
          console.log(err);
        }
      });
  }

  
   // mode of payment permission 
  
   getModeOfPaymentPermissionFunc(){
    
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetModeOfPaymentPermission"
    });
    requestData.push({
      "Key":"CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key":"LocationCode",
      "Value":this.params.locationcode
    })
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
  
            if(response.ReturnCode =='0'){
              let extraData = JSON.parse(response.ExtraData);
              this.MOPList = Array.isArray(extraData.MOPDetails.mop) 
              ? extraData.MOPDetails.mop 
              : [extraData.MOPDetails.mop];
            }
            console.log('this.MOPList' ,  this.MOPList )
  
             this.isAdvanceAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'ADVANCE')?.isAllowed == 0 ? false:true;
             this.isCashAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CASH')?.isAllowed == 0 ? false:true;
             this.isChequeAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CHEQUE')?.isAllowed == 0 ? false:true;
  
             this.isCreditCardAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CREDITCARD')?.isAllowed == 0 ? false:true;
             this.isCreditReqAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CREDITREQ')?.isAllowed == 0 ? false:true;
             this.isInstCashbackAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'INSTCASHBACK')?.isAllowed == 0 ? false:true;
  
             this.isPineLabsAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'PINELABS')?.isAllowed == 0 ? false:true;
             this.isStafDebitAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'STAFDEBIT')?.isAllowed == 0 ? false:true;
             this.isUpiAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'UPI')?.isAllowed == 0 ? false:true;
  
             this.isPaytmAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'PAYTM')?.isAllowed == 0 ? false:true;
             this.isManualPaytm = this.MOPList[0].mops.find(m => m.MOPCode === 'MANUALPAYTM')?.isAllowed == 0 ? false:true;
             this.isManualPinelabs = this.MOPList[0].mops.find(m => m.MOPCode === 'MANUALPINELABS')?.isAllowed == 0 ? false:true;
            
                
            
  
  
  
          } catch (ext) {
           
            console.log(ext);
          }
        },
        error: err => {
          // this.ngxservice.hide()
          console.log(err);
        }
      }
    );
  }
  
  
  
  
  
  openManualPayment(manualMOP){
    this.ModeOfManualPayment = manualMOP
    this.isManualPayment =true;
  
  }
  ValidateManualPayment(manualPaymentType){
    if(manualPaymentType == '1'){
  
      if(this.ManualPaymentType == '' || this.ManualPaymentType == null || this.ManualPaymentType ==  undefined ){
        this.toastMessage.error('Select Payment Type')
        return
      }
      if(this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined){
        this.toastMessage.error('Card Type Cannot be Empty')
        return
      }
      if(this.CardNo == '' || this.CardNo == null || this.CardNo == undefined){
        this.toastMessage.error('Card Number Cannot be Empty')
        return
      }
    
      if(this.Adjudication == '' || this.Adjudication == null || this.Adjudication ==undefined){
        this.toastMessage.error('Adjudication Cannot be empty')
        return
      }
      if(this.TerminalId == '' || this.TerminalId == null || this.TerminalId ==undefined){
        this.toastMessage.error('TerminalId Cannot be empty')
        return
      }
      if( this.Amount == null || this.Amount ==undefined || this.Amount < 1 ){
        this.toastMessage.error('Invalid Payment Amount')
        return
      }
     
      this.newPaymentList.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": "CREDITCARD",
        "CardType": this.CardTypeData,
        "CardNumber": this.CardNo,
        "Adjudication": this.Adjudication,
        "TerminalId": this.TerminalId,
        "GLCode": this.GLCodeData,
        "HouseOfBank":  this.houseofBank,
        "EDCMachineType":this.ModeOfManualPayment
       
      })
     
      console.log("Paymnet Object Mannual Payment ", this.newPaymentList)
      this.totalPaidAmount =this.totalPaidAmount + this.Amount

      this.Amount = 0.00
      this.ModeOfManualPayment = '';
      this.CardTypeData = '';
      this.CardNo = '';
      this.Adjudication = '';
      this.TerminalId = '';
      this.GLCodeData ='';
      this.houseofBank='';
    
      this.closeManualPayment()
   
    }
    else if(manualPaymentType == '10'){
           if(this.UPITransactionId == null || this.UPITransactionId == undefined  || this.UPITransactionId == ''){
            this.toastMessage.error('UPI Transaction Id Cannot be empty')
            return
           }
           if( this.Amount == null || this.Amount ==undefined || this.Amount < 1 ){
            this.toastMessage.error('Amount Cannot be empty')
            return
          }
  
  
         
          this.newPaymentList.push({
            "NEWPAYMENT": 1,
            "TranType": "Payment",
            "TranDate": new Date(),
            "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
            "ModeOfPayment": "UPI",
            "UPITransactionId" : this.UPITransactionId,
            "EDCMachineType":this.ModeOfManualPayment,
            "GLCode": this.GLCodeData,
            "HouseOfBank":  this.houseofBank
          
          })
          console.log("Paymnet Object Mannual Payment ", this.newPaymentList)
          this.totalPaidAmount =this.totalPaidAmount + this.Amount

          this.Amount = 0.00
          this.ModeOfManualPayment = '';
          this.AccountHolderName = '';
          this.UPITransactionId = '';
          this.GLCodeData ='';
           this.houseofBank='';
          this.closeManualPayment()
    }
    else{
      this.toastMessage.error('Select Payment Type')
      return
    }
  
  }
  
  closeManualPayment(){
    this.isManualPayment =false
  
    this.ManualPaymentType = null
    this.CardTypeData = null
    this.CardNo = null
    this.Adjudication = null
    this.TerminalId = null
    this.Amount =null
    this.UPITransactionId  =null
  
  }
  
  ResetFiedlsOnChange(){
  
    if( this.ManualPaymentType == '1' ){
    this.CardTypeData = null
    this.CardNo = null
    this.Adjudication = null
    this.TerminalId = null
    this.Amount =null
  
    }
    else if(this.ManualPaymentType == '10'){
      this.Amount =null
      this.UPITransactionId  =null
    }
  }



}
