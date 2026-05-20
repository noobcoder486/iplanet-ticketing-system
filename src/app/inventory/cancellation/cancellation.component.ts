import * as core from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "../../config/global";
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceSalesStockSelectorComponent } from '../invoice-sales-stock-selector/invoice-sales-stock-selector.component';
import { QuoteItem } from 'src/app/transaction/repair-process/repair-process.metadata';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import {Location} from '@angular/common'
import { Columns } from 'src/app/models/column.metadata';
import { BehaviorSubject, lastValueFrom } from 'rxjs';



@core.Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.component.html',
  styleUrls: ['./cancellation.component.css']
})
export class CancellationComponent implements core.OnInit {


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
  paymentDetailArray: any[] = []
  totalPaidAmount: number = 0.00;
  GLCodeData: string;
  invoiceCode: string = '';
  invoiceDate: string = ''
  sapinvoiceGUID: any;
  companyObject: any[] = [];
  showSAPButton: boolean = false;
  salesPersonName: string = ''
  Remarks: string = ''
  SAPSOCode: string = "";
  SAPDeliveryCode: string = "";
  SAPInvoiceCode: string = "";
  SAPPaymentCode: string;
  InvoiceStatus: string;

  refundObject: any[]=[];
  totalRefundAmount: number=0;
  
  hidePopup: boolean = true;
  discountMaterialCode: string = '';
  discountPartUnitPrice: number = 0;
  popUpArray: any[] = [];
  discountAmountRequested: number = 0;
  submitClicked :boolean=false;
  CreditAmount: number = 0;
  DebitAmount:  number = 0;
  TotalCustomerAdvance : number = 0;
  ARAgainstJob: number = 0;

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
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  // Cash Register 
  TotalCashRegisterCreditAmount: number = 0;
  TotalCashRegisterBalanceAmount: number = 0;
  TotalCashRegisterDebitAmount: number = 0;
  CashRegisterList: any[] =[]
  registryColumns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "TransactionCode", title: "Transaction Code" },
    { datatype: "STRING", field: "TransactionType", title: "Transaction Type" },
    { datatype: "STRING", field: "CreditAmount", title: "Credit Amount" },
    { datatype: "STRING", field: "DebitAmount", title: "Debit Amount" },
    { datatype: "STRING", field: "CreatedDate", title: "Transaction Date" },
  ];
  cashRegisterLedger: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  TransactionCode: string
  userName: string


  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toasty: ToastrService,
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
    }
    else {
      this.toasty.error("Location Details not found")
      this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
    }

    if (this.params.customercode != null && this.params.customercode != undefined) {
      this.getCustomerObject()
      this.GetCustomerLedgerObject( '' ) 
      this.GetCashRegisterObject( '' )
    }
    else {
      this.toasty.error("Customer Details not found")
    }
    if (this.params.doctype == "RSALES") {
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid=this.params.headerguid;
        this.getSalesObject()
      }
      else if (this.params.caseguid == null || this.params.caseguid == undefined) {
        this.toasty.error("CaseGuid Not Found!")
        this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
      }
      else {
        // this.getRepairSalesDetails()
      }
    }
    else {
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid=this.params.headerguid;
        this.getSalesObject()
      }
    }

    this.userName = glob.getLogedInUser().UserDetails.UserName.toString();
    this.userName = this.userName.toLowerCase()
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
                this.toasty.error("Company details not found")
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


  
  actionEmit(event){
    // console.log("action Emit", event);
    if(event.action == 'APPROVE'){ 
      return
    }
  }

  GetCustomerLedgerObject( eventDetail ) {
    let requestData = [];
    this.CustomerLedgerList =[]
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
              this.TotalCreditAmount = parseFloat(data?.CreditAmount)
              this.TotalDebitAmount = parseFloat(data?.DebitAmount)
              this.TotalBalanceAmount = this.TotalCreditAmount - this.TotalDebitAmount
              if ( this.TotalBalanceAmount < 0 ){
                this.toasty.error("You can't Refund this Customer! As the Balance Amount is Negative")
                // this.route.navigate(['/auth/' +glob.getCompanyCode() + '/refund-list/'])
              }
              if( data?.Totalrecords < 1){
                this.toasty.error("No Ledger Data Found")
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

  GetCashRegisterObject( eventDetail ) {
    
    this.CashRegisterList =[]
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
      "Key": "TransactionCode",
      "Value": this.TransactionCode == null || this.TransactionCode == undefined ? '' : this.TransactionCode
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
              this.TotalCashRegisterCreditAmount = parseFloat(data?.CreditAmount)
              this.TotalCashRegisterDebitAmount = parseFloat(data?.DebitAmount)
              this.TotalCashRegisterBalanceAmount =  this.TotalCashRegisterDebitAmount - this.TotalCashRegisterCreditAmount
              if( data?.Totalrecords < 1){
                this.toasty.error("No Ledger Data Found")
                this.detailLedger.next({ totalRecord: data?.Totalrecords, Data: '' })
                return
              }
              if (Array.isArray(data?.CashRegisterDetails?.CashRegister)) {
                this.CashRegisterList = data?.CashRegisterDetails?.CashRegister;
              }
              else {
                this.CashRegisterList.push(data?.CashRegisterDetails?.CashRegister)
                this.errorMessage = "";
              }
              // console.log("Ledger List:- ", this.CustomerLedgerList)
              // Total Customer Ledger Records needs to be shown and viewed
              this.cashRegisterLedger.next({ totalRecord: data?.Totalrecords , Data: this.CashRegisterList })

            }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    );
  }

  PageChangeLedger( event, type){    
    switch(event.eventType){
      case "PageChange":
        type ==  'REGISTER' ? this.GetCashRegisterObject(event.eventDetail ) : this.GetCustomerLedgerObject(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  // validatePayment() {
  //   if (this.Amount == null || this.Amount == undefined || this.Amount == 0) {
  //     this.toasty.error("Payment Amount cannot be zero!")
  //     return;
  //   }
  //   else if (this.modeofPaymentData == '') {
  //     this.toasty.error("Mode of Payment cannot be empty")
  //     return;
  //   }
  //   // else if (this.GLCodeData == '') {
  //   //   this.toasty.error("GLCode cannot be empty")
  //   //   return false;
  //   // }
  //   else if (this.modeofPaymentData == 'PINELABS') {
  //     if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
  //       this.toasty.error("Transaction Reference Number cannot be empty!")
  //       return;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'CREDITREQ') {
  //     if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
  //       this.toasty.error("Transaction Reference Number cannot be empty!")
  //       return;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'OLDSYSTEM') {
  //     if (this.UPITransactionId == '' || this.UPITransactionId == null || this.UPITransactionId == undefined) {
  //       this.toasty.error("Transaction Reference Number cannot be empty!")
  //       return;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'CREDITCARD') {
  //     if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
  //       this.toasty.error("Card Type cannot be empty!")
  //       return;
  //     }
  //     else if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
  //       this.toasty.error("Card number cannot be empty")
  //       return;
  //     }
  //     else if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
  //       this.toasty.error("Adjudication cannot be empty")
  //       return;
  //     }
  //     else if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
  //       this.toasty.error("TerminalId cannot be empty")
  //       return;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'CHEQUE') {
  //     if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
  //       this.toasty.error("Transaction Reference Number cannot be empty!")
  //       return;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'UPI') {
  //     if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
  //       this.toasty.error("Transaction Reference Number cannot be empty!")
  //       return;
  //     }
  //   }
  //   const hasAdvance = this.paymentDetailArray.some( item => item.ModeOfPayment == 'ADVANCE')
  //   if (this.modeofPaymentData === 'ADVANCE' && hasAdvance ) {
  //     this.toasty.error("You can't make Multiple Advance Payments!");
  //     return;
  //   }

  //   if (this.modeofPaymentData == 'ADVANCE' && this.Amount > this.TotalCustomerAdvance) {
  //     this.toasty.error("Advance Payment can't exceed Total Advance!")
  //     return
  //   }

  //   this.paymentDetailArray.push({
  //     "NEWPAYMENT": 1,
  //     "TranType": "Payment",
  //     "TranDate": new Date(),
  //     "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
  //     "ModeOfPayment": this.modeofPaymentData,
  //     "AccountNumber": this.AccountNo,
  //     "AuthenticationNumber": this.AuthNo,
  //     "CardType": this.CardTypeData,
  //     "CardNumber": this.CardNo,
  //     "Adjudication": this.Adjudication,
  //     "TerminalId": this.TerminalId,
  //     "RequestedAmount": this.RequestedAmt == null || this.RequestedAmt == undefined ? 0.00 : this.RequestedAmt,
  //     "AccountHolderName": this.AccountHolderName,
  //     "BankCode": this.BankCode,
  //     "HouseOfBank":this.houseofBank,
  //     "GLCode": this.GLCodeData,
  //     "BankAccountNo": this.BankAccountNo == null || this.BankAccountNo == undefined ? '' : this.BankAccountNo,
  //     "UPITransactionId":this.UPITransactionId == null || this.UPITransactionId == undefined?'':this.UPITransactionId
  //   })
  //   this.totalPaidAmount = this.totalPaidAmount + this.Amount
  //   this.Amount = 0.00
  //   this.modeofPaymentData = '';
  //   this.AccountNo = ''
  //   this.AuthNo = '';
  //   this.CardTypeData = '';
  //   this.CardNo = '';
  //   this.Adjudication = '';
  //   this.TerminalId = '';
  //   this.UPITransactionId = '';
  //   this.RequestedAmt = 0.00;
  //   this.AccountHolderName = '';
  //   this.BankCode = '';
  //   this.houseofBank = '';
  //   this.BankAccountNo = 0.00;
  //   this.GLCodeData = ''
  //   return true;
  // }


  getSalesObject() {
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetInvoiceObject"
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
                this.toasty.error("No parts found")
              }
              else {
                console.log("Invoice object  ", data)
                this.invoiceCode = data.InvoiceCode;
                this.invoiceDate = data.InvoiceDate;
                this.InvoiceStatus = data.InvoiceStatus;
                this.InvoiceStatus == 'RELEASED' ? this.isEdit = true : this.isEdit = false
                this.sapinvoiceGUID = data.InvoiceGuid;
                this.salesPersonName = data?.SalesPersonName == null ? "" : data?.SalesPersonName
                this.Remarks = data?.Remarks
                this.SAPSOCode = (data.SAPSOCode == null || data.SAPSOCode == undefined) ? "" : data.SAPSOCode;
                this.SAPDeliveryCode = (data.SAPDeliveryCode == null || data.SAPDeliveryCode == undefined) ? "" : data.SAPDeliveryCode;
                this.SAPInvoiceCode = (data.SAPInvoiceCode == null || data.SAPInvoiceCode == undefined) ? "" : data.SAPInvoiceCode;
                this.SAPPaymentCode = (data.SAPPaymentCode == null || data.SAPPaymentCode == undefined) ? "" : data.SAPPaymentCode;


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
                else{
                  this.toasty.error("Payment has OLDSYSTEM/CREDITREQ MOP ")
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


  // getRepairSalesDetails() {
  //   let requestdata = []
  //   requestdata.push({
  //     "Key": "ApiType",
  //     "Value": "GetRepairSalesObject"
  //   })
  //   requestdata.push({
  //     "Key": "CaseGUID",
  //     "Value": this.params.caseguid
  //   })
  //   requestdata.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
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
  //           if (response.ReturnCode == '0') {
  //             let data = JSON.parse(response?.ExtraData);
  //             
  //             if (data.Totalrecords == "0") {
  //               this.toasty.error("No parts found")
  //             }
  //             else {
  //               if (Array.isArray(data.RepairDetail.Repair)) {
  //                 this.finalSelectedElements = data?.RepairDetail?.Repair
  //                 //this.getRepairPaymentObject()
  //                 this.fetchGSTDetails()
  //               }
  //               else {
  //                 this.finalSelectedElements.push(data?.RepairDetail?.Repair)
  //                 //this.getRepairPaymentObject()
  //                 this.fetchGSTDetails()

  //               }

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


  getRepairPaymentObject() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetPaymentObject"
    });
    requestData.push({
      "Key": "Caseguid",
      "Value": this.params.caseguid
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
             ;
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (data.Totalrecords == "0") {
                this.toasty.error("Payment Records Not Found, kindly complete the payment");
              }
              else {
                if(data?.PaymentList?.Payment != null && data?.PaymentList?.Payment != undefined)
                {
                  if (Array.isArray(data?.PaymentList.Payment)) {
                    this.paymentDetailArray = data?.PaymentList?.Payment
                  }
                  else {
                    this.paymentDetailArray.push(data?.PaymentList?.Payment)
                    this.errorMessage = "";
                  }
                }
                if(data?.PaymentList?.RefundObject?.Refund != null && data?.PaymentList?.RefundObject?.Refund != undefined)
                {
                  if (Array.isArray(data?.PaymentList?.RefundObject?.Refund)) {
                    this.refundObject = data?.PaymentList.RefundObject?.Refund
                  }
                  else {
                    this.refundObject.push(data?.PaymentList?.RefundObject?.Refund)
                    this.errorMessage = "";
                  } 
                }
                this.totalPaidAmount = 0.00
                this.paymentDetailArray.forEach((item) => {
                  item.NEWPAYMENT = 0;
                  this.totalPaidAmount += parseFloat(item.Amount);
                })
                 ;
                this.totalPaidAmount = parseFloat(this.totalPaidAmount.toFixed(2))
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


  // fetchGSTDetails() {
  //    ;
  //   let requestdata = []
  //   requestdata.push({
  //     "Key": "ApiType",
  //     "Value": "GetAccessoryPriceDetails"
  //   })
  //   requestdata.push({
  //     "Key": "ItemType",
  //     "Value": "MaterialCode"
  //   })
  //   requestdata.push({
  //     "Key": "ItemList",
  //     "Value": this.getAccessoryMarginListXml()
  //   })
  //   requestdata.push({
  //     "Key": "CustomerCode",
  //     "Value": this.params.customercode
  //   })
  //   requestdata.push({
  //     "Key": "LocationCode",
  //     "Value": this.locationData
  //   })
  //   requestdata.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   })
  //   let strRequestData = JSON.stringify(requestdata);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //    ;
  //   this.ngxSpinnerService.show();
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
  //     next: (response: any) => {
  //       this.ngxSpinnerService.hide();
  //       let data = JSON.parse(response)
  //        ;
  //        
  //       if (data.ReturnCode == "0") {
  //         let extraData = JSON.parse(data.ExtraData)
  //         //if (this.InvoiceDocTypeData == "DSALES") {
  //         if (Array.isArray(extraData?.QuoteItem)) {
  //           for (let object of extraData?.QuoteItem) {
  //             for (let item of this.finalSelectedElements) {
  //               if (item?.MaterialCode == object.ItemCode) {
  //                 if(this.CustomerObject[0].GSTRegistrationType == "GSEZ")
  //                 {
  //                   item.CGSTPercentage = 0
  //                   item.GSTPercentage = 0
  //                   item.SGSTPercentage = 0
  //                   item.IGSTPercentage = 0
  //                 }
  //                 else
  //                 {
  //                   item.CGSTPercentage = object.CGSTPercentage
  //                   item.GSTPercentage = object.GSTPercentage
  //                   item.SGSTPercentage = object.SGSTPercentage
  //                   item.IGSTPercentage = object.IGSTPercentage
  //                 }
  //                 item.MarginPercentage = 0; //parseFloat(object.Margin)
  //                 item.MarginAmount = 0; // (parseFloat(object.StockPrice) / ( 1 - (object.Margin / 100)))-parseFloat(object.StockPrice)
  //                 item.SAC_HSNCode = object.SAC_HSNCode
  //                 item.DiscountAmount = 0.00
  //                 item.UnitPrice = object.UnitPrice == undefined || object.UnitPrice == null ? 0 : object.UnitPrice;
  //                 item.MinimumUnitPrice = object?.UnitPrice == undefined || object?.UnitPrice == null ? 0 : object?.UnitPrice;
  //                 item.BaseAmount = parseFloat(item.UnitPrice) * item.Quantity
  //                 item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
  //                 item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
  //                 item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
  //                 item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
  //                 item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
  //                 item.TaxAmount = item.GSTAmount
  //                 item.NetAmount = item.TaxableAmount + item.TaxAmount
  //                 item.ItemType = object.ItemType
  //                 item.GSTGroupCode = object.GSTGroupCode
  //                 item.SalesUOM = object.SalesUOM
  //                 item.DivisionCode = object.DivisionCode
  //                 item.InvoiceDetailGUID = uuidv4()
  //               }
  //             }
  //           }
  //           this.TotalNetAmount()
  //         }
  //         else {
  //           for (let obj of this.finalSelectedElements) {
  //             if (obj.MaterialCode === extraData?.QuoteItem.ItemCode) {
  //               if(this.CustomerObject[0].GSTRegistrationType == "GSEZ")
  //               {
  //                 obj.CGSTPercentage = 0
  //                 obj.GSTPercentage = 0
  //                 obj.SGSTPercentage = 0
  //                 obj.IGSTPercentage = 0

  //               }
  //               else
  //               {
  //                 obj.CGSTPercentage = extraData?.QuoteItem.CGSTPercentage
  //                 obj.GSTPercentage = extraData?.QuoteItem.GSTPercentage
  //                 obj.SGSTPercentage = extraData?.QuoteItem.SGSTPercentage
  //                 obj.IGSTPercentage = extraData?.QuoteItem.IGSTPercentage
  
  //               }
  //               obj.MarginPercentage = 0; // extraData?.QuoteItem.Margin
  //               obj.UnitPrice = extraData?.QuoteItem?.UnitPrice == undefined || extraData?.QuoteItem?.UnitPrice == null ? 0 : extraData?.QuoteItem?.UnitPrice;
  //               obj.MinimumUnitPrice = extraData?.QuoteItem?.UnitPrice == undefined || extraData?.QuoteItem?.UnitPrice == null ? 0 : extraData?.QuoteItem?.UnitPrice;
  //               obj.MarginAmount = 0;
  //               obj.SAC_HSNCode = extraData?.QuoteItem.SAC_HSNCode
  //               obj.DiscountAmount = 0.00
  //               obj.BaseAmount = (parseFloat(obj.UnitPrice) * obj.Quantity)
  //               obj.TaxableAmount = parseFloat(obj.BaseAmount) - obj.DiscountAmount
  //               obj.SGSTAmount = obj.TaxableAmount * (obj.SGSTPercentage / 100)
  //               obj.CGSTAmount = obj.TaxableAmount * (obj.CGSTPercentage / 100)
  //               obj.IGSTAmount = obj.TaxableAmount * (obj.IGSTPercentage / 100)
  //               obj.GSTAmount = obj.TaxableAmount * (obj.GSTPercentage / 100)
  //               obj.TaxAmount = obj.GSTAmount
  //               obj.ItemType = extraData?.QuoteItem?.ItemType
  //               obj.GSTGroupCode = extraData?.QuoteItem?.GSTGroupCode
  //               obj.SalesUOM = extraData?.QuoteItem?.SalesUOM
  //               obj.NetAmount = obj.TaxableAmount + obj.TaxAmount
  //               obj.GSTGroupCode = extraData?.QuoteItem.GSTGroupCode
  //               obj.InvoiceDetailGUID = uuidv4()
  //             }
  //           }
  //           this.TotalNetAmount()
  //         }

  //       }
  //     },
  //     error: err => {
  //       this.ngxSpinnerService.hide();
  //       console.log(err);
  //     }
  //   })

  // }

  
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
      this.totalNetAmount += parseFloat(item.NetAmount);
      this.totalDiscountAmount += parseFloat(item.DiscountAmount);
      this.totalBaseAmount += parseFloat(item.BaseAmount);
    });

    // Round all totals to 2 decimal places
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.totalNetAmount = parseFloat(this.totalNetAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
  }



  generateEInvoice()
  {
    this.ngxSpinnerService.show()
    var data = {
      "InvoiceGUID":this.sapinvoiceGUID
    }
    let strContentRequest = JSON.stringify(data)
    let contentRequest = {
      "content": strContentRequest
    };
    
     ;

    this.gsxService.generateEInvoice(contentRequest).subscribe({
      next:(value)=>{
        console.log(value)
        let response = JSON.parse(value.toString());
        if (response.code == '0') {
          this.toasty.success(response.message, "Success")
          this.ngxSpinnerService.hide();
          window.location.reload()
        }
        else
        {
          this.toasty.error(response.message, "Error")
          this.ngxSpinnerService.hide();

        }

      },
      error:(Err)=>{
        this.ngxSpinnerService.hide();
        this.toasty.error(Err)
      }
    })
  }   


  onSubmit() {

    if (this.userName != 'sarathnesh@consolidated.one') {
      this.toasty.error("Access denied! Kindly contact your administrator...")
      return 
    }
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
      "Value": "CancelInvoice"
    });
    requestData.push({
      "Key": "InvoiceGUID",
      "Value": this.InvoiceGuid
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
          this.ngxSpinnerService.hide()
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            
            let data = JSON.parse(response?.ExtraData);
            console.log("Response ", data)
         
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
            this.TotalNetAmount()
            window.location.reload()
           // this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { caseguid: getval?.INVOICE?.CaseGuid, locationcode: this.locationData, customercode: this.params.customercode, doctype: this.InvoiceDocTypeData, headerguid: getval?.INVOICE?.InvoiceGuid } })

          }
          else {
            this.submitClicked=false;
            this.ngxSpinnerService.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.toasty.error("Error While Saving Invoice")
          
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


  savePaymentListXml() {
    //if (this.InvoiceDocTypeData == "DSALES") {
    let rawData = {
      "rows": []
    }
    if (this.paymentDetailArray.length > 0) {
      for (let item of this.paymentDetailArray) {
        if (item.NEWPAYMENT == 1) {
          rawData.rows.push({
            "row": {
              "TranType": item?.TranType == null || item?.TranType == undefined ? 'Payment' : item?.TranType,
              "TranDate": item?.TranDate == null || item?.TranDate == undefined ? new Date() : item?.TranDate,
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
              "PaymentGUID": uuidv4(),
              "GLCode": item.GLCode == null || item.GLCode == undefined ? "" : item.GLCode,
              "CompanyCode": glob.getCompanyCode()
            }
          })
        }
      }
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(rawData);
      xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
      xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
      return xml;
    }
    //}
  }


  saveInvoiceListXml() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    //if (this.InvoiceDocTypeData == "DSALES") {
    for (let item of this.finalSelectedElements) {
      count += 1
      rawData.rows.push({
        "row": {
          "InvoiceDetailGuid": item.InvoiceDetailGUID,
          "InvoiceGUID": this.InvoiceGuid,
          "ItemType": item.ItemType,
          "ItemNo": count,
          "SerialNo": item.SerialNo,
          "ItemCode": item.MaterialCode,
          "DivisionCode": item.DivisionCode,
          "ItemDescription": item.MaterialName,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
          "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
          "Quantity": item.Quantity,
          "UnitPrice": item.UnitPrice,
          "CostPrice": item.CostPrice==null || item.CostPrice == undefined ? "0":item.CostPrice,
          "Batch": item.Batch,
          "BaseAmount": item.BaseAmount,
          "DiscountCoupon":item.DiscountCoupon==null || item.DiscountCoupon == undefined ? "0":item.DiscountCoupon,
          "DiscountAmount": item.DiscountAmount,
          "TaxableAmount": item.TaxableAmount,
          "TaxPercentage": item.GSTPercentage,
          "CGSTPercentage": item.CGSTPercentage,
          "SGSTPercentage": item.SGSTPercentage,
          "IGSTPercentage": item.IGSTPercentage,
          "LavyPercentage": item.LavyPercentage == null || item.LavyPercentage == undefined ? 0 : item.LavyPercentage,
          "CGSTAmount": item.CGSTAmount,
          "SGSTAmount": item.SGSTAmount,
          "IGSTAmount": item.IGSTAmount,
          "LavyAmount": item.LavyAmount == null || item.LavyAmount == undefined ? 0.00 : item.LavyAmount,
          "NetAmount": item.NetAmount,
          "TaxAmount": item.TaxAmount,
          "isDeleted": 0
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
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

}
