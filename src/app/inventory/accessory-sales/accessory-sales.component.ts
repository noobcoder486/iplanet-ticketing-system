import { Component, OnInit } from '@angular/core';
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
import { Location } from '@angular/common'
import { DatePipe } from '@angular/common';
import { debug } from 'console';


@Component({
  selector: 'app-accessory-sales',
  templateUrl: './accessory-sales.component.html',
  styleUrls: ['./accessory-sales.component.css']
})
export class AccessorySalesComponent implements OnInit {

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
  SAPPaymentCode: string
  SAPInvoiceCode: string = "";
  DeliveryUpdateSuccess: boolean = false;
  DeliveryHeaderSuccess: boolean = false;
  PickingSuccess: boolean = false;
  PGISuccess: boolean = false;
  SerialUpdate: boolean = false;
  ETag: string = "";
  houseofBank: string = '';
  storageLocationResponse: string = '';
  IRNNumber: string = ''
  refundObject: any[] = [];
  totalRefundAmount: number = 0;
  hideDiscountForm: boolean = true;
  hidePopup: boolean = true;
  discountMaterialCode: string = '';
  discountPartUnitPrice: number = 0;
  popUpArray: any[] = [];
  discountAmountRequested: number = 0;
  submitClicked: boolean = false;
  CreditAmount: number = 0;
  DebitAmount: number = 0;
  TotalCustomerAdvance: number = 0;
  ARAgainstJob: number = 0;
  InvoiceStatus: string;
  paytmEDCObj: any;
  objCaseDetail: any
  discountInvoiceDetailGUID
  isApproverPermission = false
  MembershipCardNo
  SecurityNo
  cardDetailObject: any
  ServiceList: any[] = []
  PartObject
  hideCardPopup: boolean = true
  InvoiceLockObject: any
  // Direct Discount 
  DirectDiscountList: any[] = []

  // GST Registration 
  DoGST: boolean = false
  GSTRegistrationNo
  GSTRegistrationType
  GSTRegistration: DropDownValue = this.getBlankObject();

  ReferralName: any;
  ReferralMobileNo: any;
  ReferralDetailsList: any[] = []


  // Mode of payment permission 
  MOPList: any[] = [];


  isAdvanceAllowed: boolean = true;
  isCashAllowed: boolean = true;
  isChequeAllowed: boolean = true;

  isCreditCardAllowed: boolean = true;
  isCreditReqAllowed: boolean = true;
  isInstCashbackAllowed: boolean = true;

  isPineLabsAllowed: boolean = true;
  isStafDebitAllowed: boolean = true;
  isUpiAllowed: boolean = true;

  isPaytmAllowed: boolean = true;
  isManualPaytm: boolean = true;
  isManualPinelabs: boolean = true;

  // Manual Payment 
  isManualPayment: boolean = false;
  ModeOfManualPayment: any;
  ManualPaymentType: any;
  ManualPaymentTypes: any[] = [
    { ID: 'Debit/CreditCard', TEXT: 'Debit/Credit Card' },
    { ID: 'UPIQR', TEXT: 'UPI QR Code' }
  ];


  // AMC Sales

  CoverageStartDate: any;
  CoverageEndDate: any;
  AmcTypeCode: any;
  AmcSerialNo: any;
  BindAmcTypeMasterDD: DropDownValue = DropDownValue.getBlankObject();
  unitReceivedDateTime = new Date();
  ProductTypeDD: DropDownValue = DropDownValue.getBlankObject();
  ProductType: any;
  ProductName: any;
  BillingMaterialCode: any;
  BillingMaterialDesc: any;

  AMCSelectedList: any[] = []

  AmcContractDetailsList: any[] = [];

  SavedRepairItems : any[]=[];
  SavedQuoteItems : any[]=[];

  DiscountTypeSearchDD: DropDownValue = DropDownValue.getBlankObject();
  DiscountType:any;

  AutoApproveDiscountDetailsList: any[] = [];
  PartTypeApplicableForAutoApprove:any[]=[];
  IsAutoDiscountApplicable:boolean=false;
  Discount_Add_Amount:any;

  IsCustUnitPriceEditAllwoed:boolean=false;

  CustomerAllowedtoChangeUnitPriceList:any[]=[];

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  BindSchemeMasterDD: DropDownValue = DropDownValue.getBlankObject();
  SchemeCode: any;
  SchemePercentage: number = 0;;
  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private gsxService: GsxService,
    private ngxSpinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private route: Router,
    private Location: Location,
    private reportService: ReportService,
    private datePipe: DatePipe,

  ) { }


  ngOnInit(): void {
   

    this.onDiscountTypeSearch({ term: "", items: [] });
    this.submitClicked = false;
    this.currentDate = new Date();
    this.onGLCodeSearch({ term: "", item: [] });
    this.onModeofPaymentSearch({ term: "", item: [] });
    this.onInvoiceDocTypeSearch({ term: "", item: [] });
    this.onPricingOptionSearch({ term: "", item: [] });
    this.onRefundSearch({ term: "", item: [] });
    this.onGSTRegistrationSearch({ term: "", items: [] })
    this.onBindSchemeMaster({ term: "", item: [] });
    this.onBindAmcTypeMaster({ term: "", item: [] });
    this.GetAutoApproveDiscountDetails()

    this.params = this.activatedRoute.snapshot.queryParams;
    this.onSalesPersonSearch({ term: "", item: [] });
    if (this.params.locationcode != null && this.params.locationcode != undefined) {
      this.locationData = this.params.locationcode
      this.getLocationData()
      this.getCompanyObject()
      this.getModeOfPaymentPermissionFunc()

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
    this.InvoiceGuid = uuidv4()
    if (this.params.doctype == "RSALES") {
      
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid = this.params.headerguid;
        this.getSalesObject()
      }
      else if (this.params.caseguid == null || this.params.caseguid == undefined) {
        this.toastMessage.error("CaseGuid Not Found!")
        this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales-list'])
      }
      else {


        this.GetInvoiceLockObject()
        this.getRepair()
        this.getCustomerModeOfPaymentLink()
      }
      
    }
    else {
      if (this.params.headerguid != null && this.params.headerguid != undefined) {
        this.isEdit = true;
        this.InvoiceGuid = this.params.headerguid;
        this.getSalesObject()
      }
      else {
        this.GetInvoiceLockObject()
        this.getCustomerModeOfPaymentLink()
      }
    }

    this.GetDirectDiscountList()
    this.checkLocalPermission()
    this.onAllowedPaymentSearch({ term: "", item: [] });


    if (this.params.doctype == 'AMCSALES') {

      this.CoverageStartDate = new Date();
      this.CoverageEndDate = new Date(this.CoverageStartDate);
      this.CoverageEndDate.setFullYear(this.CoverageEndDate.getFullYear() + 1);
    }
    this.onProductType({ term: "", items: [] });

    // this.IsCustAllowedtoChangeUnitPrice()
    this.GetCustomerAllowedtoChangeUnitPriceList()
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

  // setfunction(){
  //   for(let item of this.ModeofPayment.Data)
  //   {
  //     if(item.Id == this.modeofPaymentData)
  //     {
  //       this.GLCodeData = item.GLCode
  //       this.houseofBank = item.extraData
  //       break;
  //     }
  //   }
  // }
  validateCard() {
    if (this.MembershipCardNo == null || this.MembershipCardNo == undefined || this.MembershipCardNo == '') {
      this.toastMessage.error("Enter valid card no!");
      return;
    }
    if (this.SecurityNo == null || this.SecurityNo == undefined || this.SecurityNo == '') {
      this.toastMessage.error("Enter valid CVV!");
      return;
    }

    let strQuestion = [];
    strQuestion.push({
      "Key": "ApiType",
      "Value": "ValidateCardDetails"
    });
    strQuestion.push({
      "Key": "MembershipCardNo",
      "Value": this.MembershipCardNo
    });
    strQuestion.push({
      "Key": "SecurityNo",
      "Value": this.SecurityNo
    });

    let strRequestData = JSON.stringify(strQuestion);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {

        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          let data = JSON.parse(response.ExtraData);
          if (data.Totalrecords == 0) {
            this.toastMessage.error("Invalid Card Details, try again!")
            this.MembershipCardNo = ''
            this.SecurityNo = ''
          }
          else {
            this.toastMessage.success("Card Details validated successfully!")
          }
        } else {

        }
      },
    });
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

    if (this.modeofPaymentData == 'CREDIT CARD/UPI') {
      if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
        this.toastMessage.error("Mode of Payment cannot be empty!")
        return false;
      }

      if (this.allowedPaymentMode == '1') {
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
      else if (this.allowedPaymentMode == '10') {
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
      else {
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
      else {
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
    else if (this.modeofPaymentData == 'ADVANCE') {
      this.TotalAdvBiledAmount = 0;
      this.AdvanceDocumentList.forEach((item) => {
        if (item?.Amount != null || item?.Amount != undefined) {
          this.TotalAdvBiledAmount += item?.Amount;
        }
      });
      this.TotalAdvBiledAmount = parseFloat(this.TotalAdvBiledAmount.toFixed(2));
      if (this.TotalAdvBiledAmount > this.Amount) {
        this.toastMessage.error("Amount cannot be greater than the Total Amount")
        return
      }
      else if (this.TotalAdvBiledAmount > this.TotalCustomerAdvance) {
        this.toastMessage.error("Amount cannot be greater than the Advance Amount")
        return
      }
      this.Amount = this.TotalAdvBiledAmount
    }


    const cashPaymentDone = this.paymentDetailArray.some(item => item.ModeOfPayment == 'CASH')
    if (this.modeofPaymentData === 'CASH' && cashPaymentDone) {
      this.toastMessage.error("You can't make Multiple Cash Payments!");
      return;
    }
    const hasAdvance = this.paymentDetailArray.some(item => item.ModeOfPayment == 'ADVANCE')
    if (this.modeofPaymentData === 'ADVANCE' && hasAdvance) {
      this.toastMessage.error("You can't make Multiple Advance Payments!");
      return;
    }

    if (this.modeofPaymentData == 'ADVANCE' && this.Amount > this.TotalCustomerAdvance) {
      this.toastMessage.error("Advance Payment can't exceed Total Advance!")
      return
    }


    if (this.modeofPaymentData != 'CREDIT CARD/UPI') {
      this.paymentDetailArray.push({
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
        "UPITransactionId": this.UPITransactionId,
        "GLCode": this.GLCodeData,
        "HouseOfBank": this.houseofBank,
        "AdvanceDocXML": this.modeofPaymentData == 'ADVANCE' ? this.AdvanceDocXML() : null
      })
    }
    else if (this.modeofPaymentData == 'CREDIT CARD/UPI') {
      this.paymentDetailArray.push({
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
        "UPITransactionId": this.UPITransactionId,
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
    console.log("Paymnet Object ", this.paymentDetailArray)

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
          debugger
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              ;
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No parts found")
              }
              else {

                this.IRNNumber = data.IRN == null || data.IRN == undefined ? '' : data.IRN
                this.invoiceCode = data.InvoiceCode;
                this.invoiceDate = data.InvoiceDate;
                this.sapinvoiceGUID = data.InvoiceGuid;
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
                this.SAPPaymentCode = (data.SAPPaymentCode == null || data.SAPPaymentCode == undefined) ? "" : data.SAPPaymentCode;

                if (this.PGISuccess == false) {
                  this.showSAPButton = true;
                }

                this.isEdit = true;


                let detailobject = data?.InvoiceDetailObject?.InvoiceDetail
                console.log('detailobject', detailobject)
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
                  this.paymentDetailArray.forEach((payment) => {
                    this.totalPaidAmount += parseFloat(payment.Amount)
                  })
                }
                if (Array.isArray(detailobject)) {
                  for (let item of detailobject) {
                    this.finalSelectedElements.push(item)
                  }

                }
                else {
                  this.finalSelectedElements.push(detailobject)
                }
                this.TotalNetAmount4Edit()
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


  getRepair() {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobObject"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.params.caseguid,
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
          
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
            this.objCaseDetail = response['ExtraDataJSON'];
            console.log("JOB ", this.objCaseDetail)
            if (this.objCaseDetail.HandoverFlag != '1' && this.objCaseDetail.JobStatus != 'S15') {
              this.toastMessage.error("Cant create invoice as handover still pending!")
              this.isEdit = true
            }
            this.MembershipCardNo = this.objCaseDetail.MembershipCardNo
            this.SecurityNo = this.objCaseDetail.SecurityNo
            this.cardDetailObject = this.objCaseDetail.CARDDETAILS
            if (this.cardDetailObject?.SERVICELIST != null && this.cardDetailObject?.SERVICELIST != undefined) {
              this.ServiceList = Array.isArray(this.cardDetailObject.SERVICELIST.SERVICE)
                ? this.cardDetailObject.SERVICELIST.SERVICE : [this.cardDetailObject.SERVICELIST.SERVICE]
            }
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

 async getRepairSalesDetails() {
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetRepairSalesObject"
    })
    requestdata.push({
      "Key": "CaseGUID",
      "Value": this.params.caseguid
    })
    requestdata.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
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
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (data.Totalrecords == "0") {
                this.toastMessage.error("No parts found")
              }
              else {
                
                if (Array.isArray(data.RepairDetail.Repair)) {
                  // this.finalSelectedElements = data?.RepairDetail?.Repair
                  this.SavedRepairItems = data?.RepairDetail?.Repair
                  this.SavedQuoteItems = data?.RepairDetail?.Repair
                  //this.getRepairPaymentObject()
                  //this.getStockPrice()
                  //this.fetchGSTDetails()

                }
                else {
                  // this.finalSelectedElements.push(data?.RepairDetail?.Repair)

                   this.SavedRepairItems.push(data?.RepairDetail?.Repair)
                   this.SavedQuoteItems.push(data?.RepairDetail?.Repair)
                  //this.getRepairPaymentObject()
                  //this.getStockPrice()

                  //this.fetchGSTDetails()

                }


                 // from quote parts 
                   for(let item of this.SavedQuoteItems){
                       this.finalSelectedElements.push({
                          "InvoiceDetailGUID": uuidv4(),
                          "ItemType": item.ItemType,
                          "SerialNo": item.SerialNo ?? '',
                          "MaterialCode": item.MaterialCode,
                          "PricingOption": item.PriceType,
                          "DivisionCode": item.DivisionCode ?? '',
                          "MaterialName": item.MaterialName,
                          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
                          "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
                          "Quantity": item.Quantity,
                          "UnitPrice": item.UnitPrice,
                          "CostPrice": item.CostPrice == null || item.CostPrice == undefined ? "0" : item.CostPrice,
                          "Batch": item.Batch ?? '',
                          "BaseAmount": item.BaseAmount,
                          "DiscountCoupon": item.DiscountCouponCode == null || item.DiscountCouponCode == undefined ? "0" : item.DiscountCouponCode,
                          "DiscountAmount": item.DiscountAmount,
                          "TaxableAmount": item.TaxableAmount,
                          "TaxPercentage": item.TaxPercentage,
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
                          "isDeleted": 0,
                          "PriceRangeApplicable": item?.PriceRangeApplicable == null || item?.PriceRangeApplicable == undefined ? 0 : item?.PriceRangeApplicable,
                          "PriceRangeStart": item?.PriceRangeStart == null || item?.PriceRangeStart == undefined ? 0 : item?.PriceRangeStart,
                          "PriceRangeEnd": item?.PriceRangeEnd == null || item?.PriceRangeEnd == undefined ? 0 : item?.PriceRangeEnd,
                          "CoverageStartDate": item?.CoverageStartDate == null || item?.CoverageStartDate == undefined ? '1900-01-01' : item?.CoverageStartDate,
                          "CoverageEndDate": item?.CoverageEndDate == null || item?.CoverageEndDate == undefined ? '1900-01-01' : item?.CoverageEndDate,
                          "ItemSource" : item?.ItemSource ?? '',
                          "PriceType" : item?.PriceType ?? '' ,
                          "InventoryStockType" : item?.PartType ?? '',
                          "PriceSource" : item?.PriceSource,
                          "GSTPercentage" : item?.GSTPercentage,
                          "RevenueType" : item?.RevenueType ?? ''
                       })
                   }

                

                 
                 // from quote parts 




                 (async () => {

                  // await this.getStockPrice();  
                  
                  // this.getInvoiceStockPrice()
                 
                this.TotalNetAmount()
                   


                })()

                
               
             
               
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
                this.toastMessage.error("Payment Records Not Found, kindly complete the payment");
              }
              else {
                if (data?.PaymentList?.Payment != null && data?.PaymentList?.Payment != undefined) {
                  if (Array.isArray(data?.PaymentList.Payment)) {
                    this.paymentDetailArray = data?.PaymentList?.Payment
                  }
                  else {
                    this.paymentDetailArray.push(data?.PaymentList?.Payment)
                    this.errorMessage = "";
                  }
                }
                if (data?.PaymentList?.RefundObject?.Refund != null && data?.PaymentList?.RefundObject?.Refund != undefined) {
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
            this.CustomerObject = []
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
              this.GSTRegistrationNo = this.CustomerObject[0].GSTRegistrationNo
              this.GSTRegistrationType = this.CustomerObject[0].GSTRegistrationType
              this.DoGST = this.GSTRegistrationNo && this.GSTRegistrationNo != '' ? true : false

              if (this.params.doctype == "RSALES") {
                if ((this.params.headerguid == null || this.params.headerguid == undefined) && this.params.caseguid) {
                    this.getRepairSalesDetails()
                }
              }

              this.CreditAmount = this.CustomerObject[0].CreditAmount
              this.DebitAmount = this.CustomerObject[0].DebitAmount
              this.TotalCustomerAdvance = parseFloat((this.CreditAmount - this.DebitAmount).toFixed(2));
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

  GetDirectDiscountList() {
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDirectDiscountList"
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

            let data = JSON.parse(response.ExtraData);
            if (data.Totalrecords > 0) {
              this.DirectDiscountList = Array.isArray(data?.DirectDiscountList?.DirectDiscount) ? data?.DirectDiscountList?.DirectDiscount : [data?.DirectDiscountList?.DirectDiscount]
              console.log("DirectDiscountList ", this.DirectDiscountList)
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

  GetInvoiceLockObject() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetInvoiceLockObject"
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

            let data = JSON.parse(response.ExtraData);
            if (data.Totalrecords > 0) {
              // this.InvoiceLockObject.push(data?.InvoiceList)
              let LockList = Array.isArray(data?.InvoiceList?.Invoice) ? data?.InvoiceList?.Invoice : [data?.InvoiceList?.Invoice]
              console.log("InvoiceLockObject ", this.InvoiceLockObject)
              LockList.forEach(item => {
                let obj = item
                // let message = `CaseId: ${obj.PurchaseOrderNumber} has not been billed yet, received ${obj.ReceivedNoOfDays} days ago. Invoice creation will be disabled soon at this Location!`
                let message = item.ErrorMessage
                this.toastMessage.warning(message, "ACSH Billing Warning: ", { disableTimeOut: true, tapToDismiss: false, closeButton: true });

                // setTimeout(() => {
                //     document.getElementById(`copyCaseId-${caseId}`).addEventListener('click', () => {
                //         this.copyToClipboard(caseId);
                //     });
                // }, 0);

              })
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

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.toastMessage.success('Success', `Case Id ${text} copied to clipboard!`);
    }).catch(err => {
      this.toastMessage.error('Error', 'Failed to copy case ID');
    });
  }

  openInvoicePartSelector() {
    if (this.locationData != null || this.locationData != undefined) {
      const dialogRef = this.dialog.open(InvoiceSalesStockSelectorComponent, {
        data: {
          SAPPlantCode: this.SAPPlantCode, SAPStorageLocation: this.SAPStorageLocation
          , DocType: this.params.doctype, CustomerObject: this.CustomerObject[0]
        },
        width: '90%',
        height: '80%'
      });
      dialogRef.afterClosed().subscribe(async result => {
        if (result) {

          for (let item of result) {
             debugger
            if( (item?.RevenueType == 'Service Revenue' || item?.RevenueType == 'Repair Revenue' ) &&  this.params.doctype == 'RSALES' ){
               this.toastMessage.error( 'Please Add Service Revenue Parts in Quotation and then proceed for billing !!')
            }
            else{
            this.finalSelectedElements.push({
              "Batch": item.Batch == null || item.Batch == undefined ? "" : item.Batch,
              "MaterialCode": item.Material,
              "MaterialName": item.MaterialName,
              "SerialNo": item.SerialNumber,
              "ItemType": item.ItemType,
              "SerializedModule": item?.SerializedModule,
              "Billable": 1,
              "PriceType": "StockPrice",
              "InventoryStockType": item?.InventoryStockType == null || item?.InventoryStockType == undefined ? '' : item?.InventoryStockType,
              "PriceSource": item?.PriceSource ?? 'PRICELIST',
              "UnitPrice": 0,
              "ItemSource" : 'NEW',
              "RevenueType" : item?.RevenueType ?? ''
              


            })
          }
          }
            
          for (let item1 of this.finalSelectedElements) {

            console.log("item ", item1)
            if (item1.ItemType == "Material" && item1?.ItemSource == 'NEW') {
              this.fetchCostPrice(item1);
            }
          }



       
         

              let TempList = this.finalSelectedElements.filter(f =>
                f.ItemSource != 'QUOTATION' && f.PriceSource === 'GSX'
              )

            console.log('TempList' , TempList)


           if(TempList.length > 0){
          await this.getStockPrice(TempList);
             
           }

          this.getInvoiceStockPrice()
          
          this.SetSchemeCode()

        }
      });
    }
    else {
      this.toastMessage.error("Please select location to add parts")
    }
  }


  async getStockPrice(TempList): Promise<void> {
    

     console.log('finalSelectedElements filtered' ,this.finalSelectedElements)
    let tempSelectedElements = [...TempList];
    let apiCalls: Promise<void>[] = [];

    while (tempSelectedElements.length > 0) {

      const partlist = tempSelectedElements
        .splice(0, 5)
        .map(x => x?.MaterialCode);

      const requestdata = { partNumbers: partlist };
      const data = { Content: JSON.stringify(requestdata) };

      apiCalls.push(
        new Promise<void>((resolve, reject) => {

          this.gsxService.getPartsSummary(data).subscribe({
            next: (value) => {

              const response = JSON.parse(value.toString());
              console.log('api response ', response);

              if (response?.errors?.length) {
                response.errors.forEach(err =>
                  this.toastMessage.error(
                    `${err.code} - ${err.message}`,
                    'Error',
                    { closeButton: true, disableTimeOut: true }
                  )
                );
              } else {
                for (let object of response) {
                  for (let item of this.finalSelectedElements) {
                    if (item.MaterialCode === object.number) {
                       
                      // item.UnitPrice =  item.PriceType === 'ExchangePrice'
                      //     ? this.dynamicService.removeCommas(object.exchangePrice ?? 0)
                      //     : this.dynamicService.removeCommas(object.stockPrice ?? 0);

                      // item.PriceSource = 'GSX';

                      if (item.PriceType === 'ExchangePrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.exchangePrice ?? 0)
                      }
                      else if (item.PriceType === 'StockPrice') {
                        item.UnitPrice = this.dynamicService.removeCommas(object?.stockPrice ?? 0);
                      }
                      else {
                        const option = object?.pricingOptions?.find(x => x?.description === item.PriceType);
                        item.UnitPrice = this.dynamicService.removeCommas(option?.price ?? 0);
                      }
                    }
                  }//for
                }//2 for
              }// for
            },
            error: err => {
              this.toastMessage.error('Please try again. ' + err);
              reject(err);
            },
            complete: () => {
              
              resolve();
            }
          });

        })
      );
    }
    try {
      await Promise.all(apiCalls);
      this.ngxSpinnerService.hide();
      console.log('getStockPrice fully completed');
    } catch (err_3) {
      this.ngxSpinnerService.hide();
      throw err_3;
    }
  }


  validateSerialNo(item) {
    
    if (item.SerialNo != null && item.SerialNo != undefined && item.SerialNo != '') {
      if (item.MaterialCode != null && item.MaterialCode != undefined && item.MaterialCode != '') {
        this.ngxSpinnerService.show()
        this.gsxService.getSAPSerialNoData(item.MaterialCode, item.SerialNo).subscribe({
          next: (value: any) => {
            ;
            
            this.ngxSpinnerService.hide()
            if (value.error != null || value.error != undefined) {
              this.toastMessage.error(value.error.errorMessage)
            }
            else {
              let data = JSON.parse(value?.serialdata)
              if (this.LocationObject[0].SAPStorageLocation != null && this.LocationObject[0].SAPStorageLocation != undefined) {
                if (data.d.StorageLocation
                  != this.LocationObject[0].SAPStorageLocation) {
                  this.toastMessage.error("Serial No is invalid for this Location")
                }
                else {
                  item.Batch = data.d.Batch
                  this.storageLocationResponse = data?.d?.StorageLocation
                  this.fetchCostPrice(item)
                  this.toastMessage.success("Serial No validation successfull")
                }
              }
            }
          },
          error: (err) => {
            this.ngxSpinnerService.hide()
            console.log(err)
          }
        })
      }
      else {
        this.toastMessage.error("MaterialCode cant be blank for", item.PartDescription)
      }
    }
    else {
      this.toastMessage.error("Serial No cannot be blank for", item.PartCode)
    }

  }

  fetchCostPrice(item) {
    

    if (item.Batch != null && item.Batch != undefined && item.Batch != '') {
      if (item.MaterialCode != null && item.MaterialCode != undefined && item.MaterialCode != '') {

        this.ngxSpinnerService.show()

        this.gsxService.getCostPrice(item.MaterialCode, this.LocationObject[0].SAPPlantCode, item.Batch).subscribe({
          next: (value: any) => {
            console.log(value)
           

            this.ngxSpinnerService.hide()
            if (value.error != null || value.error != undefined) {
              this.toastMessage.error(value.error.errorMessage)
            }
            else {
              ;


              let data = JSON.parse(value?.serialdata)
              console.log("SAP data", data)
              /*var TotalGoodsMvtAmtInCCCrcy =0
              var QuantityInEntryUnit =0
              for (let gvmitem of data.d.results)
              {
                TotalGoodsMvtAmtInCCCrcy = TotalGoodsMvtAmtInCCCrcy + parseFloat(gvmitem.TotalGoodsMvtAmtInCCCrcy.toString())
                QuantityInEntryUnit =  QuantityInEntryUnit + parseFloat(gvmitem.QuantityInEntryUnit.toString())
 
              }*/
              var movingAvgPrice = 0;
              if (data?.d?.results[0]?.MovingAveragePrice) {
                // movingAvgPrice= data.d.results[0].MovingAveragePrice
                let costdata = data?.d?.results.find(item => item?.ValuationArea == this.LocationObject[0].SAPPlantCode)
                costdata ? movingAvgPrice = costdata.MovingAveragePrice : movingAvgPrice = data.d.results[0].MovingAveragePrice
              }
              else {
                movingAvgPrice = 0;
                this.toastMessage.warning("Warning : Cost Price not found for this Item!", item.MaterialCode)
              }

              item.CostPrice = parseFloat((movingAvgPrice).toString()).toFixed(2)
              // Unit Price as Cost price only for local approvers
              if (this.CustomerObject[0].CustAccGroupCode == "ALLSTAFF" && this.isApproverPermission == true) {
                item.UnitPrice = item.CostPrice == undefined || item.CostPrice == null ? 0 : item.CostPrice;

                if (this.CustomerObject[0].GSTRegistrationType == "GSEZ") {
                  item.CGSTPercentage = 0
                  item.GSTPercentage = 0
                  item.SGSTPercentage = 0
                  item.IGSTPercentage = 0
                }
                else {
                  item.CGSTPercentage = item.CGSTPercentage
                  item.GSTPercentage = item.GSTPercentage
                  item.SGSTPercentage = item.SGSTPercentage
                  item.IGSTPercentage = item.IGSTPercentage
                }
                item.MarginPercentage = 0; //parseFloat(object.Margin)
                item.MarginAmount = 0; // (parseFloat(object.StockPrice) / ( 1 - (object.Margin / 100)))-parseFloat(object.StockPrice)
                // item.SAC_HSNCode = item.SAC_HSNCode
                item.DiscountAmount = 0.00
                // item.UnitPrice = item.UnitPrice == undefined || item.UnitPrice == null ? 0 : item.UnitPrice;
                item.MinimumUnitPrice = item?.UnitPrice == undefined || item?.UnitPrice == null ? 0 : item?.UnitPrice;
                item.BaseAmount = parseFloat(item.UnitPrice) * item.Quantity

                item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
                item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
                item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
                item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
                item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
                item.TaxAmount = item.GSTAmount
                item.NetAmount = item.TaxableAmount + item.TaxAmount
                // item.ItemType = item.ItemType
                // item.GSTGroupCode = item.GSTGroupCode
                // item.SalesUOM = item.SalesUOM
                // item.DivisionCode = item.DivisionCode
                // item.InvoiceDetailGUID = uuidv4()
                this.TotalNetAmount()
              }
            }
          },
          error: (err) => {
            this.ngxSpinnerService.hide()
            console.log(err)
          }
        })
      }
      else {
        this.toastMessage.error("MaterialCode cant be blank for", item.PartDescription)
      }
    }
    else {
      this.toastMessage.error("Serial No cannot be blank for", item.PartCode)
    }

  }

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver

    if (resp?.View == true) {
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }

  getAccessoryMarginListXml() {
    let rawData = {
      "rows": []
    }
    if (this.InvoiceDocTypeData === "DSALES") {
      for (let item of this.finalSelectedElements) {
        if(item.ItemSource == 'NEW')
        {
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
            "UnitPrice": this.dynamicService.removeCommas(item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString()),
            "StockPrice": this.dynamicService.removeCommas(item.StockPrice == null || item.StockPrice == undefined ? "0" : item.StockPrice.toString()),
            "PricingOptions": "STOCKPRICE",
            "PriceSource": item.PriceSource == null || item.PriceSource == undefined ? '' : item.PriceSource
          }
        })
      }

      }
    }
    else if (this.InvoiceDocTypeData === "RSALES") {
      for (let item of this.finalSelectedElements) {
        if(item.ItemSource == 'NEW')
        {
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
            "UnitPrice": this.dynamicService.removeCommas(item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString()),
            "PricingOptions": item.PriceType,
            "PriceSource": item.PriceSource == null || item.PriceSource == undefined ? '' : item.PriceSource

          }
        })
      }
        
      }
    }
    else if (this.InvoiceDocTypeData === "AMCSALES") {
      for (let item of this.finalSelectedElements) {
       
        rawData.rows.push({
          "row": {
            "ItemType": "Resource",
            "InvoiceDetailGUID": uuidv4(),
            "ItemCode": item.MaterialCode,
            "ItemDescription": '',
            "Type": '',
            "ImageUrl": item?.ImageUrl == null || item?.ImageUrl == undefined ? item?.ImageUrl : '',
            "ProductCategory": '',
            "Quantity": item.Quantity ?? 1,
            "Billable": 1,
            "UnitPrice": this.dynamicService.removeCommas(item.UnitPrice == null || item.UnitPrice == undefined ? "0" : item.UnitPrice.toString()),
            "PricingOptions": "STOCKPRICE",
            "PriceSource": item.PriceSource == null || item.PriceSource == undefined ? '' : item.PriceSource

          }
        })
        
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    return xml;
  }
  fetchGSTDetails() {
    ;
    
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetAccessoryPriceDetails"
    })
    requestdata.push({
      "Key": "ItemType",
      "Value": "MaterialCode"
    })
    requestdata.push({
      "Key": "ItemList",
      "Value": this.getAccessoryMarginListXml()
    })
    requestdata.push({
      "Key": "CustomerCode",
      "Value": this.params.customercode
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.locationData
    })
    requestdata.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    console.log('requestdata fetchGSTDetails', requestdata)

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = {
      "content": strRequestData
    };
    ;

    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (response: any) => {
        debugger
        this.ngxSpinnerService.hide();
        let data = JSON.parse(response)
          ;

        if (data.ReturnCode == "0") {
          let extraData = JSON.parse(data.ExtraData)
          console.log("Repair Details ", extraData)
          //if (this.InvoiceDocTypeData == "DSALES") {
          if (Array.isArray(extraData?.QuoteItem)) {
            for (let object of extraData?.QuoteItem) {
              for (let item of this.finalSelectedElements) {
                if (item?.MaterialCode == object.ItemCode) {
                  if (this.CustomerObject[0].GSTRegistrationType == "GSEZ") {
                    item.CGSTPercentage = 0
                    item.GSTPercentage = 0
                    item.SGSTPercentage = 0
                    item.IGSTPercentage = 0
                  }
                  else {
                    item.CGSTPercentage = object.CGSTPercentage
                    item.GSTPercentage = object.GSTPercentage
                    item.SGSTPercentage = object.SGSTPercentage
                    item.IGSTPercentage = object.IGSTPercentage
                  }
                  item.SerializedModule = object.SerializedModule;
                  item.MarginPercentage = 0; //parseFloat(object.Margin)
                  item.MarginAmount = 0; // (parseFloat(object.StockPrice) / ( 1 - (object.Margin / 100)))-parseFloat(object.StockPrice)
                  item.SAC_HSNCode = object.SAC_HSNCode
                  item.DiscountAmount = 0.00

                  item.UnitPrice = object.UnitPrice == undefined || object.UnitPrice == null ? 0 : object.UnitPrice;


                  // if (item.ItemType=='Resource' && (item.SerializedModule == '1') ){
                  //   item.SerialNoRequired = 1
                  //   // item.CostPrice = parseFloat( (item.UnitPrice).toString()).toFixed(2)
                  // }
                  // if( item.ItemType=='Material' && (item.Batch==undefined || item.Batch=='')){
                  //   item.SerialNoRequired = 1
                  // }
                  item.MinimumUnitPrice = object?.UnitPrice == undefined || object?.UnitPrice == null ? 0 : object?.UnitPrice;
                  item.BaseAmount = parseFloat(item.UnitPrice) * item.Quantity
                  item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
                  item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
                  item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
                  item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
                  item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
                  item.TaxAmount = item.GSTAmount
                  item.NetAmount = item.TaxableAmount + item.TaxAmount
                  item.ItemType = object.ItemType
                  item.GSTGroupCode = object.GSTGroupCode
                  item.SalesUOM = object.SalesUOM
                  item.DivisionCode = object.DivisionCode
                  item.InvoiceDetailGUID = uuidv4()
                  item.PriceRangeApplicable = object?.PriceRangeApplicable;
                  item.PriceRangeStart = object?.PriceRangeStart;
                  item.PriceRangeEnd = object?.PriceRangeEnd;
                  item.InventoryStockType = object?.Type;
                  item.RevenueType = object?.RevenueType;

                }
              }
            }
            this.TotalNetAmount()
          }
          else {
            for (let obj of this.finalSelectedElements) {
              if (obj.MaterialCode === extraData?.QuoteItem.ItemCode) {

                if (this.CustomerObject[0].GSTRegistrationType == "GSEZ") {
                  obj.CGSTPercentage = 0
                  obj.GSTPercentage = 0
                  obj.SGSTPercentage = 0
                  obj.IGSTPercentage = 0

                }
                else {
                  obj.CGSTPercentage = extraData?.QuoteItem.CGSTPercentage
                  obj.GSTPercentage = extraData?.QuoteItem.GSTPercentage
                  obj.SGSTPercentage = extraData?.QuoteItem.SGSTPercentage
                  obj.IGSTPercentage = extraData?.QuoteItem.IGSTPercentage

                }
                obj.SerializedModule = extraData?.QuoteItem?.SerializedModule;
                obj.MarginPercentage = 0; // extraData?.QuoteItem.Margin
                 
                obj.UnitPrice = extraData?.QuoteItem?.UnitPrice == undefined || extraData?.QuoteItem?.UnitPrice == null ? 0 : extraData?.QuoteItem?.UnitPrice;
               
                obj.MinimumUnitPrice = extraData?.QuoteItem?.UnitPrice == undefined || extraData?.QuoteItem?.UnitPrice == null ? 0 : extraData?.QuoteItem?.UnitPrice;
                obj.MarginAmount = 0;
                obj.SAC_HSNCode = extraData?.QuoteItem.SAC_HSNCode
                obj.DiscountAmount = 0.00
                obj.BaseAmount = (parseFloat(obj.UnitPrice) * obj.Quantity)

                obj.TaxableAmount = parseFloat(obj.BaseAmount) - obj.DiscountAmount
                obj.SGSTAmount = obj.TaxableAmount * (obj.SGSTPercentage / 100)
                obj.CGSTAmount = obj.TaxableAmount * (obj.CGSTPercentage / 100)
                obj.IGSTAmount = obj.TaxableAmount * (obj.IGSTPercentage / 100)
                obj.GSTAmount = obj.TaxableAmount * (obj.GSTPercentage / 100)
                obj.TaxAmount = obj.GSTAmount
                obj.ItemType = extraData?.QuoteItem?.ItemType
                obj.GSTGroupCode = extraData?.QuoteItem?.GSTGroupCode
                obj.SalesUOM = extraData?.QuoteItem?.SalesUOM
                obj.NetAmount = obj.TaxableAmount + obj.TaxAmount
                obj.GSTGroupCode = extraData?.QuoteItem.GSTGroupCode
                obj.InvoiceDetailGUID = uuidv4()
                obj.PriceRangeApplicable = extraData?.QuoteItem?.PriceRangeApplicable;
                obj.PriceRangeStart = extraData?.QuoteItem?.PriceRangeStart;
                obj.PriceRangeEnd = extraData?.QuoteItem?.PriceRangeEnd;
                // obj.InventoryStockType =obj?.Type ?? '';
                obj.InventoryStockType = extraData?.QuoteItem?.Type ?? '';
                obj.RevenueType =  extraData?.QuoteItem?.RevenueType ?? '';



              }
            }
            this.TotalNetAmount()

          }
          console.log("finalSelectedElements ", this.finalSelectedElements)
        }
      },
      error: err => {
        this.ngxSpinnerService.hide();
        console.log(err);
      }
    })

  }


  calculatePrices(item) {
    

      this.ngxSpinnerService.show()
      if(item.Quantity <=0 ){
        this.toastMessage.error('Quantity Cannot be 0 OR Negative')
        this.ngxSpinnerService.hide()
        item.Quantity = 1 
        return
      }

    
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
      
      const matchingDiscount = this.DirectDiscountList.find(disc =>
        disc.Discount_PartCode === item.MaterialCode &&
        this.finalSelectedElements.some(x => x.MaterialCode == disc.PartCode)
      );
      if (matchingDiscount) {
        item.DiscountAmount = parseFloat(item.BaseAmount) * (1 - parseFloat(matchingDiscount.Discount_Percent))
        this.toastMessage.info("Discount applied for " + matchingDiscount.Discount_PartCode, 'Direct Discount', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
      }
      //  contract discount
      // else if (this.objCaseDetail?.IsContractApplicable == "1" && this.objCaseDetail?.ContractCode) {

      //   const quoteItems = Array.isArray(this.objCaseDetail?.QUOTE?.QUOTEDETAILS?.QuoteItem) ? this.objCaseDetail?.QUOTE?.QUOTEDETAILS?.QuoteItem : [this.objCaseDetail?.QUOTE?.QUOTEDETAILS?.QuoteItem]

      //   for (let quoteItem of quoteItems) {
      //     if (quoteItem?.ItemCode == item?.MaterialCode) {
      //       item.DiscountAmount = parseFloat(quoteItem?.DiscountAmount);
      //       item.DiscountAmount = parseFloat(item.DiscountAmount.toFixed(2));
      //       item.DiscountCoupon = this.objCaseDetail?.ContractCode;
      //     }
      //   }
      // }

      //
      else {
        if (item.InventoryStockType == "3PP" && this.SchemePercentage > 0 && this.CustomerObject[0]?.CustAccGroupCode != "ALLSTAFF") {
          item.DiscountAmount = parseFloat(item.BaseAmount) * (this.SchemePercentage / 100)
          item.DiscountAmount = parseFloat(item.DiscountAmount.toFixed(2));
          item.DiscountCoupon = this.SchemeCode;
        }
      }

   

      item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
      item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
      item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
      item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
      item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
      item.TaxAmount = item.GSTAmount
      item.NetAmount = item.TaxableAmount + item.TaxAmount

     


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

    // this.SetSchemeCode()

    this.ngxSpinnerService.hide()
  }


  TotalNetAmount4Edit() {


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

    // this.SetSchemeCode()

  }


  saveSAPBillingDocument() {

    if (this.invoiceCode == '' || this.invoiceCode == null) {
      this.toastMessage.error("Error: Invalid invoice code found, contact Admin...")
      return
    }

    var obj = {
      "SAPSOCode": this.SAPSOCode,
      "InvoiceCode": this.invoiceCode,
      "SAPInvoiceCode": this.SAPInvoiceCode,
      "InvoiceGUID": this.sapinvoiceGUID,
      "InvoiceDate": new Date(this.invoiceDate),
      "SAPDeliveryCode": this.SAPDeliveryCode,
      "PickingSuccess": this.PickingSuccess,
      "SerialUpdate": this.SerialUpdate,
      "PGISuccess": this.PGISuccess,
      "DeliveryUpdateSuccess": this.DeliveryUpdateSuccess,
      "DeliveryHeaderSuccess": this.DeliveryHeaderSuccess,
      "ETag": this.ETag,
      "CompanyObject": this.companyObject[0],
      "LocationObject": this.LocationObject[0],
      "CustomerObject": this.CustomerObject[0],
      "ItemList": this.finalSelectedElements,
      "PaymentList": this.paymentDetailArray
    };
    // console.log(obj);
    // alert("UAT On")
    //return
    this.gsxService.saveSAPBillingDocument(obj).subscribe(
      {
        next: (value) => {
          ;
          let response = JSON.parse(value.toString());
          if (response.code == '0') {
            this.toastMessage.success(response.message, "SAP Posting")
            this.submitClicked = false;
            this.ngxSpinnerService.hide();
            this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { headerguid: this.InvoiceGuid, doctype: this.InvoiceDocTypeData, locationcode: this.locationData, customercode: this.params.customercode } })
          }
          else {
            this.toastMessage.error(response.message, "SAP Posting")
            this.submitClicked = false;
            this.ngxSpinnerService.hide();
            this.route.navigate(['auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { headerguid: this.InvoiceGuid, doctype: this.InvoiceDocTypeData, locationcode: this.locationData, customercode: this.params.customercode } })

          }
        },
        error: err => {
          this.submitClicked = false;
          this.ngxSpinnerService.hide();
          console.log(err);
        }
      });
  }
  generateEInvoice() {
    this.ngxSpinnerService.show()
    var data = {
      "InvoiceGUID": this.sapinvoiceGUID
    }
    let strContentRequest = JSON.stringify(data)
    let contentRequest = {
      "content": strContentRequest
    };
    
    this.gsxService.generateEInvoice(contentRequest).subscribe({
      next: (value) => {
        console.log(value)
        let response = JSON.parse(value.toString());
        if (response.code == '0') {
          this.toastMessage.success(response.message, "Success")
          this.ngxSpinnerService.hide();
          window.location.reload()
        }
        else {
          this.toastMessage.error(response.message, "Error")
          this.ngxSpinnerService.hide();

        }

      },
      error: (Err) => {
        this.ngxSpinnerService.hide();
        this.toastMessage.error(Err)
      }
    })
  }

  onGSTRegistrationSearch($event: { term: string; items: any[] }) {
    
    this.dropdownDataService
      .fetchDropDownData(DropDownType.GSTRegistration, $event.term, {})
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.GSTRegistration = value;
          }
        },
        error: (err) => {
          this.GSTRegistration = this.getBlankObject();
        },
      });
  }
  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }
  onGSTSelect() {
    if (this.DoGST != true) {
      this.GSTRegistrationType = "GSTU"
    } else {
      this.GSTRegistrationType = "GRR"
    }
  }
  onSaveRetailCustomer() {
    console.log(this.params.customercode);

    if (this.DoGST == true) {
      if (this.GSTRegistrationNo.toString().length != 15) {
        this.toastMessage.error("Invalid GST Registration Number")
        return;
      }
      if (!this.GSTRegistrationType) {
        this.toastMessage.error("Kindly enter a GST registration type")
        return;
      }
    }

    this.errorMessage = "";
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "SaveRetailCustomer",
    });
    requestData.push({
      Key: "CustAccGroupCode",
      Value: this.CustomerObject[0].CustAccGroupCode,
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CompanyCode",
      Value: this.CustomerObject[0].CompanyCode || glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.CustomerObject[0].CustomerCode || "",
    });
    requestData.push({
      Key: "FirstName",
      Value: this.CustomerObject[0].FirstName || "",
    });
    requestData.push({
      Key: "LastName",
      Value: this.CustomerObject[0].LastName || "",
    });
    requestData.push({
      Key: "Blocked",
      Value: "0",
    });
    requestData.push({
      Key: "Address1",
      Value: this.CustomerObject[0].Address1 || "",
    });
    requestData.push({
      Key: "Address2",
      Value: this.CustomerObject[0].Address2 || "",
    });
    requestData.push({
      Key: "Address3",
      Value: this.CustomerObject[0].Address3 || "",
    });
    requestData.push({
      Key: "LandMark",
      Value: this.CustomerObject[0].LandMark || "",
    });
    requestData.push({
      Key: "CountryCode",
      Value: this.CustomerObject[0].CountryCode || "",
    });
    requestData.push({
      Key: "StateCode",
      Value: this.CustomerObject[0].StateCode || "",
    });
    requestData.push({
      Key: "City",
      Value: this.CustomerObject[0].City || "",
    });
    requestData.push({
      Key: "ZipCode",
      Value: this.CustomerObject[0].ZipCode || "",
    });
    requestData.push({
      Key: "MobileNo",
      Value: this.CustomerObject[0].MobileNo || "",
    });
    requestData.push({
      Key: "PhoneNo",
      Value: this.CustomerObject[0].PhoneNo || "",
    });
    requestData.push({
      Key: "EmailID",
      Value: this.CustomerObject[0].EmailID || "",
    });
    requestData.push({
      Key: "TaxType",
      Value: "GST",
    })
    requestData.push({
      Key: "DefaultPartnerCode",
      Value: this.CustomerObject[0].DefaultPartnerCode || "",
    });
    requestData.push({
      Key: "BillToCustomerCode",
      Value: this.CustomerObject[0].BillToCustomerCode || "",
    });
    requestData.push({
      Key: "PriceGroup",
      Value: this.CustomerObject[0].PriceGroup || '',
    });
    requestData.push({
      Key: "IdentificationDocument",
      Value: this.CustomerObject[0].IdentificationDocument || "",
    });
    requestData.push({
      Key: "SubmissionType",
      Value: this.CustomerObject[0].SubmissionType || "",
    });
    requestData.push({
      Key: "ReferredBy",
      Value: this.CustomerObject[0].ReferredBy || "",
    });
    requestData.push({
      Key: "GSTRegistrationNo",
      Value: this.GSTRegistrationNo || "",
    });
    requestData.push({
      Key: "GSTRegistrationType",
      Value: this.GSTRegistrationType || "",
    });


    console.log("Before SP ", requestData);
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      content: strRequestData,
    };
    ;
    // TODO 
    alert("UAT Return On")
    return
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false) {
      return
    }

    this.ngxSpinnerService.hide()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        console.log("CustomerValue:", value);

        let response = JSON.parse(value.toString());
        if (response.ReturnCode == "0") {
          let data = JSON.parse(response?.ExtraData);
          this.toastMessage.success("Customer Added Successfully");
          this.getCustomerObject()
        } else {
          this.ngxSpinnerService.hide()
          console.log("Error Response: ", response)
          let errorMessage = response.ErrorMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(errorMessage, (error, result) => {
            const errorMessages = result.ERRORLIST.ERRORMESSAGE;
            console.log("Messages : ", errorMessages)
            this.errorMessage = ''
            errorMessages.forEach((errorMessage) => {
              console.log("Error Message: ", error)
              this.toastMessage.error(errorMessage.ERRORMESSAGE);
              this.errorMessage = this.errorMessage + errorMessage.ERRORMESSAGE
            });
          });
        }
      },
      error: (err) => {
        this.submitClicked = false
        this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  }


  onSubmit() {
    
    var hasLesserUnitPrice = false
    for (let item of this.finalSelectedElements) {

      this.calculatePrices(item)
      if (parseFloat(item.UnitPrice) < parseFloat(item.MinimumUnitPrice)) {
        hasLesserUnitPrice = true
      }
      if (item?.CostPrice == null || item?.CostPrice == undefined) {
        item.CostPrice = "0.00"
      }

    }

    const hasHigherDiscountPrice = this.finalSelectedElements.some((item => { item?.DiscountAmount > item?.UnitPrice }))
    if (hasHigherDiscountPrice) {
      this.toastMessage.error("Discount Amount cannot be greater than Unit Price")
      return
    }

    if (!(this.params.customercode == "123909249" || this.params.customercode == "123909265" || this.params.customercode == "123909277"
      || this.params.customercode == "123909247" || this.params.customercode == "12324918747" || this.params.customercode == "12324889135"
    )) {
      // || this.isApproverPermission == true)
      if (hasLesserUnitPrice) {
        this.toastMessage.error("Unit price cannot be lesser than Minimum Unit Price")
        return;
      }
    }

    const hasZeroUnitPrice = this.finalSelectedElements.some((item => { item?.UnitPrice == 0 }))
    if (hasZeroUnitPrice) {
      this.toastMessage.error("Unit Price cannot be zero")
      return
    }

    if (this.salesPersonName == '') {
      this.toastMessage.error("Please select Sales Person Name")
      return
    }
    const hasBlankKGB = this.finalSelectedElements.some((item => (item?.SerialNo == null || item?.SerialNo == "" || item?.SerialNo == undefined)
      && (item?.ItemType == "Material")))
    if (hasBlankKGB) {
      this.toastMessage.error("Cannot insert null value in Serial No")
      return;
    }
    const hasBlankKGB4Insurance = this.finalSelectedElements.some((item => (item?.SerialNo == null || item?.SerialNo == "" || item?.SerialNo == undefined)
      && (item?.ItemType == "Resource" && item.SerializedModule == "1")))
    if (hasBlankKGB4Insurance) {
      this.toastMessage.error("Cannot insert null value in Serial No")
      return;
    }
    if (this.totalPaidAmount > (this.totalNetAmount + 1) || this.totalPaidAmount < (this.totalNetAmount - 1)) {
      this.toastMessage.error("Paid Amount does not match with Total Net Amount")
      return;
    }
  
    const hasBlankBatch = this.finalSelectedElements.some(item => (item?.Batch == null || item?.Batch === '' || item?.Batch == undefined) && (item?.ItemType == "Material"));
    if (hasBlankBatch) {
      this.toastMessage.error("Cannot insert null or empty value in Batch Number")
      return;
    }
    const hasBlankMaterialName = this.finalSelectedElements.some(item => item.MaterialName == null || item?.MaterialName === '' || item?.MaterialName == undefined);
    if (hasBlankMaterialName) {
      this.toastMessage.error("Material Name Not Found...")
      return;
    }
    const hasBlankGSTGroup = this.finalSelectedElements.some(item => item.GSTGroupCode == null || item.GSTGroupCode === '' || item.GSTGroupCode == undefined);
    if (hasBlankGSTGroup) {
      this.toastMessage.error("GST Detail Not found")
      return;
    }
    const hasBlankGSTAmount = this.finalSelectedElements.some(item => item.GSTPercentage == 0);
    if (!(this.CustomerObject[0].GSTRegistrationType == "GSEZ")) {
      if (hasBlankGSTGroup) {
        this.toastMessage.error("GST is not configured for item")
        return;
      }
    }
    // const hasBlankCostPrice = this.finalSelectedElements.some((item =>  item?.CostPrice == "0.00" && (item?.ItemType == "Material" && item.SerializedModule == "1")))
    // if (hasBlankCostPrice) {
    //   this.toastMessage.error("Cost Price cant be empty or less than 1")
    //   return;
    // }

    // const hasBlankCostPriceSAP = this.finalSelectedElements.some((item => item?.CostPrice == "0.00" && item?.ItemType == "Material" && item.Batch != ''))
    // if (hasBlankCostPriceSAP) {
    //   this.toastMessage.error("Error : Cost Price not found for some items!")
    //   return;
    // }


    // alert("Return On")
    // return

    // if (this.modeofPaymentData == 'ADVANCE' && this.Amount > this.TotalCustomerAdvance) {
    //   this.toastMessage.error("Advance Payment can't exceed Total Advance!")
    //   return
    // }

    if (this.submitClicked == true) {
      return;
    }
    this.submitClicked = true
    this.ngxSpinnerService.show()

    for (let item of this.finalSelectedElements) {
      item.InvoiceHeaderGUID = this.InvoiceGuid
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveInvoice4Job"
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.InvoiceGuid
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "InvoiceCode",
      "Value": ""
    });
    requestData.push({
      "Key": "SalesPersonName",
      "Value": this.salesPersonName == null || this.salesPersonName == undefined ? "" : this.salesPersonName
    });
    requestData.push({
      "Key": "Remarks",
      "Value": this.Remarks == null || this.Remarks == undefined ? "" : this.Remarks
    });
    requestData.push({
      "Key": "InvoiceDocType",
      "Value": this.InvoiceDocTypeData
    });
    requestData.push({
      "Key": "InvoiceDate",
      "Value": new Date(),
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.params.caseguid == null || this.params.caseguid == undefined ? "00000000-0000-0000-0000-000000000000" : this.params.caseguid
    });
    requestData.push({
      "Key": "CaseID",
      "Value": ""
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.params.customercode == null || this.params.customercode == undefined ? "" : this.params.customercode
    });
    requestData.push({
      "Key": "TotalBaseAmount",
      "Value": this.totalBaseAmount
    });
    requestData.push({
      "Key": "TotalDiscountAmount",
      "Value": this.totalDiscountAmount
    });
    requestData.push({
      "Key": "TotalTaxableAmount",
      "Value": this.totalTaxableAmount
    });
    requestData.push({
      "Key": "TotalTaxAmount",
      "Value": this.totalTaxAmount
    });
    requestData.push({
      "Key": "TotalNetAmount",
      "Value": this.totalNetAmount
    });
    requestData.push({
      "Key": "MembershipCardNo",
      "Value": this.MembershipCardNo
    });
    requestData.push({
      "Key": "SecurityNo",
      "Value": this.SecurityNo
    });
    requestData.push({
      "Key": "InvoiceStatus",
      "Value": "RELEASED"
    });
    requestData.push({
      "Key": "InvoiceDetails",
      "Value": this.saveInvoiceListXml()
    });
    requestData.push({
      "Key": "PaymentDetail",
      "Value": this.savePaymentListXml()
    })
    requestData.push({
      "Key": "ReferralDetails",
      "Value": this.ConvertReferralDetailsIntoXml()
    })
    requestData.push({
      "Key": "ReferredBy",
      "Value": ''
    })
    requestData.push({
      "Key": "CustomerVisitSource",
      "Value": this.params?.CVS == null || this.params?.CVS == undefined ? '' : this.params?.CVS
    })
    requestData.push({
      "Key": "CustomerSourceName",
      "Value": this.params?.CSN == null || this.params?.CSN == undefined ? '' : this.params?.CSN
    })
    requestData.push({
      "Key": "IsSchemeApplicable",
      "Value": this.SchemeCode == null || this.SchemeCode == undefined || this.SchemeCode == '' ? '0' : '1'
    })
    requestData.push({
      "Key": "SchemeCode",
      "Value": this.SchemeCode == null || this.SchemeCode == undefined ? '' : this.SchemeCode
    })
    requestData.push({
      "Key": "IsInsuranceApplicable",
      "Value": this.CustomerObject[0]?.IsInsuranceApplicable ?? 0
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Request Data ", requestData)

    // alert("UAT Testing, contact Admin!")
     

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          
          let response = JSON.parse(value.toString());
          ;
          if (response.ReturnCode == '0') {

            let data = JSON.parse(response?.ExtraData);
            this.IRNNumber = data.IRN == null || data.IRN == undefined ? '' : data.IRN
            this.invoiceCode = data.InvoiceCode;
            this.invoiceDate = data.InvoiceDate;
            this.sapinvoiceGUID = data.InvoiceGuid;
            this.InvoiceStatus = data?.InvoiceStatus;
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
            if (this.PGISuccess == false) {
              this.showSAPButton = true;
            }
            this.isEdit = true;
            this.paymentDetailArray = [];
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
              this.paymentDetailArray.forEach((payment) => {
                this.totalPaidAmount += parseFloat(payment.Amount)
              })
            }
            this.finalSelectedElements = [];
            if (Array.isArray(detailobject)) {
              for (let item of detailobject) {
                this.finalSelectedElements.push(item)
              }

            }
            else {
              this.finalSelectedElements.push(detailobject)
            }
            this.TotalNetAmount4Edit()
            // alert("UAT Testing contact Admin!!!")
            // return

            this.saveCasaInvoiceLead(this.sapinvoiceGUID)
            this.toastMessage.success('Submitted Succesfully...Posting to SAP')
            this.saveSAPBillingDocument()
          }
          else {
            
            this.errorMessage = response.ReturnMessage;
            this.toastMessage.error("Error While Saving Invoice")
            let errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(errorMessage, (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
              errorMessages.forEach((errorMessage) => {
                this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
              });
            });
          }
        },
        error: err => {
          
          this.submitClicked = false;
          this.ngxSpinnerService.hide()
          console.log(err);
        }
      });
  }
  saveCasaInvoiceLead(data) {
    try {
      let obj = {
        InvoiceGUID: data
      };
      let strRequestData = JSON.stringify(obj);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.saveCasaInvoiceLead(contentRequest).subscribe(
        {
          next: (value) => {

            let response = JSON.parse(value.toString());
            if (response.code == '0') {
              this.toastMessage.info("Info ", "Posted to Casa successfully!");
            }
            else {

              let errorMessage: string = response.message;
              // errorMessage = errorMessage.replace("'", "").replace('"', "")
              errorMessage = errorMessage.replace(/['"]/g, "")
              this.toastMessage.error("Error While Posting to Casa", errorMessage);
            }
          },
          error: err => {

            //this.ngxSpinnerService.hide()
            this.toastMessage.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
            console.log(err);
          }
        });
    }
    catch (err) {

      this.toastMessage.error(err, "Error:-", { closeButton: true, disableTimeOut: true });
    }
  }


  availableServices(item) {
    this.PartObject = null
    if (this.cardDetailObject?.SERVICELIST != null && this.cardDetailObject?.SERVICELIST != undefined) {
      this.ServiceList.forEach(serv => {

        if (parseInt(serv.QtySpent) < parseInt(serv.MaxQtyAllowed)) {
          let partList = Array.isArray(serv.SERVICEPARTLIST.SERVICEPART) ? serv.SERVICEPARTLIST.SERVICEPART : [serv.SERVICEPARTLIST.SERVICEPART]
          partList.forEach(part => {
            if (part.PartCode == item.MaterialCode) {
              let cardDiscountAmount = parseInt(serv.MaxValueAllowed) - parseInt(serv.ValueSpent)
              this.PartObject = { MaterialCode: part.PartCode, CardDiscountAmount: cardDiscountAmount, ServiceTypeDesc: serv.ServiceTypeDesc }
            }
          })
        }
      })
    }
  }
  showAddParts(item) {
       debugger
    if(this.params.doctype == 'RSALES' && item?.ItemSource != 'NEW' ){
      this.toastMessage.error('Cannot Apply Discount while billing for RSALES')
      return
    }

    console.log("Discount item ", item)
    this.hidePopup = !this.hidePopup;
    this.ngxSpinnerService.show()
    this.discountMaterialCode = item.MaterialCode
    this.discountPartUnitPrice = item.UnitPrice
    this.discountInvoiceDetailGUID = item.InvoiceDetailGUID
    this.availableServices(item)
    this.IsApplicable4AutoDiscountApprove(item);
    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetDiscount4Customer"
    })
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerObject[0].CustomerCode
    })
    requestData.push({
      "Key": "MaterialCode",
      "Value": item.MaterialCode
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    }
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

  showCardDetails() {
    this.hideCardPopup = !this.hideCardPopup;
  }
  hideAddParts() {
    this.hidePopup = !this.hidePopup;
  }

  toggleRequestDiscount() {

    this.hideAddParts
    this.hideDiscountForm = !this.hideDiscountForm

  }

  addDiscount(item) {

    console.log("Discount Item ", item)
    console.log("finalSelectedElements ", this.finalSelectedElements)
    let discountExists
    this.finalSelectedElements.forEach(obj => {

      discountExists = this.finalSelectedElements.findIndex(part => part.DiscountCoupon == item.CouponCode)
      if (discountExists == -1) {
        if (item.MaterialCode == obj.MaterialCode && obj.InvoiceDetailGUID == this.discountInvoiceDetailGUID) {
          if(item.DiscountType == 'ADD')
          {
          obj.DiscountAmount = - parseFloat(item.DiscountAmount).toFixed(2)
          }
          else{
          obj.DiscountAmount = parseFloat(item.DiscountAmount).toFixed(2)
          }
          obj.DiscountCoupon = item.CouponCode
          this.calculatePrices(obj)
          // this.updateDiscount(item)
        }
      }
    })
    this.hideAddParts()
  }

  
  RemoveDiscount(item){
   
     item.DiscountAmount = 0.00,
     item.DiscountCoupon = '',
     this.calculatePrices(item)
  }


  addMembershipBenefits(item) {
    // this.toastMessage.warning("Curently In-Active!")
    // return
    this.finalSelectedElements.forEach(obj => {

      if (item.MaterialCode == obj.MaterialCode) {
        obj.DiscountAmount = parseFloat(item.CardDiscountAmount).toFixed(2)
        obj.CardUsed = "1"
        this.calculateMembershipPrices(obj)
      }
    })
    this.hideAddParts()
  }

  calculateMembershipPrices(item) {

    // item.BaseAmount = (parseFloat(item.UnitPrice) * item.Quantity)
    item.BaseAmount = parseFloat(item.DiscountAmount)
    item.TaxableAmount = parseFloat(item.BaseAmount) - item.DiscountAmount
    item.SGSTAmount = item.TaxableAmount * (item.SGSTPercentage / 100)
    item.CGSTAmount = item.TaxableAmount * (item.CGSTPercentage / 100)
    item.IGSTAmount = item.TaxableAmount * (item.IGSTPercentage / 100)
    item.GSTAmount = item.TaxableAmount * (item.GSTPercentage / 100)
    item.TaxAmount = item.GSTAmount
    item.NetAmount = item.TaxableAmount + item.TaxAmount
    this.TotalNetAmount()
  }
  saveDiscount() {
    
    if (this.discountMaterialCode == null || this.discountMaterialCode == undefined || this.discountMaterialCode == '') {
      this.toastMessage.error("Material Code not found for discount")
      return
    }
    if (this.discountPartUnitPrice == null || this.discountPartUnitPrice == undefined || this.discountPartUnitPrice == 0) {
      this.toastMessage.error("Material Unit Price not found for discount")
      return
    }
    if (this.discountAmountRequested == null || this.discountAmountRequested == undefined || this.discountAmountRequested == 0) {
      this.toastMessage.error("Discount Amount not found for discount")
      return
    }
    if (this.discountAmountRequested > this.discountPartUnitPrice) {
      this.toastMessage.error("Discount Amount cannot be greater than Unit Price")
      return
    }
    if (this.DiscountType == null   || this.DiscountType  == undefined ||  this.DiscountType  == '') {
      this.toastMessage.error("Discount Type not found for discount")
      return
    }
    this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveDiscount"
    })
    requestData.push({
      "Key": "DiscountGUID",
      "Value": uuidv4()
    })
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.params.caseguid == null || this.params.caseguid == undefined ? '00000000-0000-0000-0000-000000000000' : this.params.caseguid
    })
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerObject[0].CustomerCode
    })
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.discountMaterialCode
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "IsConsumed",
      "Value": "0"
    })
    requestData.push({
      "Key": "UnitPrice",
      "Value": this.discountPartUnitPrice
    })
    requestData.push({
      "Key": "DiscountAmount",
      "Value": this.discountAmountRequested
    })
    requestData.push({
      "Key": "CouponCode",
      "Value": ''
    })
    requestData.push({
      "Key": "DiscountCouponStatus",
      "Value": 'SENT FOR APPROVAL'
    })
    requestData.push({
      "Key": "DiscountType",
      "Value":  this.DiscountType
    })
    requestData.push({
      "Key": "IsAutoApprove",
      "Value":  (this.discountAmountRequested <= this.Discount_Add_Amount && this.IsAutoDiscountApplicable == true ) ? 1 : 0
    })
    console.log('requestData' , requestData)
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
              if (data.Totalrecords == "0") {
                this.toastMessage.error("Discount Request Failed")
              }
              else {
                this.toastMessage.success("Discount Requested Submitted Successfully")
                this.hideDiscountForm = true;
              }
            }
            else {
              this.errorMessage = response.ReturnMessage;
              this.toastMessage.error("Error While Saving Discount")
              let errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(errorMessage, (error, result) => {
                const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                errorMessages.forEach((errorMessage) => {
                  this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                });
              });
            }
          } catch (ext) {
            this.toastMessage.error("Internal Error: ", ext)
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


  savePaymentListXml() {
    //if (this.InvoiceDocTypeData == "DSALES") {
    console.log("Payment List ", this.paymentDetailArray)
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
              "HouseOfBank": item?.HouseOfBank == null || item?.HouseOfBank == undefined ? '' : item?.HouseOfBank,
              "RequestedAmount": item?.RequestedAmount == null || item?.RequestedAmount == undefined ? 0.00 : item?.RequestedAmount,
              "AccountHolderName": item?.AccountHolderName,
              "BankCode": item?.BankCode,
              "BankAccountNo": item?.BankAccountNo,
              "UTRNumber": '',
              "UPITransactionId": item?.UPITransactionId,
              "PaymentGUID": uuidv4(),
              "GLCode": item.GLCode == null || item.GLCode == undefined ? "" : item.GLCode,
              "CompanyCode": glob.getCompanyCode(),
              "EDCMachineType": item?.EDCMachineType,
              "EDCMachineReferenceID": item?.EDCMachineReferenceID == null || item?.EDCMachineReferenceID == undefined ? "" : item.EDCMachineReferenceID,
              "AdvanceDocXML": item?.AdvanceDocXML
            }
          })
        }
      }
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(rawData);
      xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
      xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
      console.log("Payment xml ", xml)
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
          "PricingOption": item.PriceType,
          "DivisionCode": item.DivisionCode,
          "ItemDescription": item.MaterialName,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
          "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
          "Quantity": item.Quantity,
          "UnitPrice": item.UnitPrice,
          "CostPrice": item.CostPrice == null || item.CostPrice == undefined ? "0" : item.CostPrice,
          "Batch": item.Batch,
          "BaseAmount": item.BaseAmount,
          "DiscountCoupon": item.DiscountCoupon == null || item.DiscountCoupon == undefined ? "0" : item.DiscountCoupon,
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
          "CardUsed": item?.CardUsed == null || item?.CardUsed == undefined ? "0" : item?.CardUsed,
          "isDeleted": 0,
          "PriceRangeApplicable": item?.PriceRangeApplicable == null || item?.PriceRangeApplicable == undefined ? 0 : item?.PriceRangeApplicable,
          "PriceRangeStart": item?.PriceRangeStart == null || item?.PriceRangeStart == undefined ? 0 : item?.PriceRangeStart,
          "PriceRangeEnd": item?.PriceRangeEnd == null || item?.PriceRangeEnd == undefined ? 0 : item?.PriceRangeEnd,
          "CoverageStartDate": item?.CoverageStartDate == null || item?.CoverageStartDate == undefined ? '1900-01-01' : item?.CoverageStartDate,
          "CoverageEndDate": item?.CoverageEndDate == null || item?.CoverageEndDate == undefined ? '1900-01-01' : item?.CoverageEndDate,
          "ProductType": item?.ProductType == null || item?.ProductType == undefined ? '' : item?.ProductType,
          "ProductName": item?.ProductName == null || item?.ProductName == undefined ? '' : item?.ProductName,
          "AmcTypeCode": item?.AmcTypeCode == null || item?.AmcTypeCode == undefined ? '' : item?.AmcTypeCode


        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    return xml;
  }


  deleteitem(item) {
    debugger
    if(this.params.doctype == 'RSALES' && item.RevenueType == 'Service Revenue'){
        this.toastMessage.error('Cannot Delete ,As it is present in quotation !!')
        return
    }

    let index = this.finalSelectedElements.indexOf(item)
    this.finalSelectedElements.splice(index, 1)
    this.SetSchemeCode()
    this.TotalNetAmount()
  }


  deletePaymentitem(item) {

    if (item.ModeOfPayment == 'ADVANCE') {
      this.AdvanceDocumentList = [];
    }
    this.totalPaidAmount -= item?.Amount
    let index = this.paymentDetailArray.indexOf(item)
    this.paymentDetailArray.splice(index, 1)
  }


  getInvoiceStockPrice() {
    var requestdata
    this.ngxSpinnerService.show()
    var partlist = []
    let i = 0;
    
    for (let item of this.finalSelectedElements) {
      if(item?.ItemSource == 'NEW' )
      {
           item.StockPrice = "0"
           item.Quantity = 1
      }
     
    }
    var tempSelectedElements = this.finalSelectedElements.slice()
    this.fetchGSTDetails()
  }
  

     async onPriceOptionChange(item){
          
          item.ItemSource = 'NEW';
          let tempList = [item]
            console.log('tempList' , tempList)
            if(item.PriceSource === 'GSX'){
             await this.getStockPrice(tempList);
            }
          this.fetchGSTDetails()
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
  allowedPaymentMode: string;
  edcMachineObject: any[] = [];
  edcMachineName: string;
  previousRecordsFound: boolean = false
  isEdcPayment: boolean = false;
  isPreviousButton: boolean = false;
  pinelabsPaymentArray: DropDownValue = DropDownValue.getBlankObject();
  isDefaultMOP: boolean = false
  isPaymentProcessing = false

  // Paytm 
  transactionDateTime: string
  transactionAmount: number
  paytmSaveResponseObj: any
  paytmFinalResponseObj: any

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

  getCustomerModeOfPaymentLink() {
    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "GetCustomerModeOfPaymentLink"
    })
    requestdata.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestdata.push({
      "Key": "CustomerCode",
      "Value": this.params.customercode
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
    })
    requestdata.push({
      "Key": "TransactionType",
      "Value": 'INVOICE'
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
            console.log("repsonse  ", response)

            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (data.Totalrecords != "0") {
                this.toastMessage.info("Opening Default Mode of Payment for this Customer")
                // Dont show confirm box when Default is Credit Req
                data.Link.ModeOfPayment == 'CREDITREQ' ? this.isDefaultMOP = true : this.isDefaultMOP = false
                this.openPayment(data.Link.ModeOfPayment)
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


  changePineLabsMOP() {
    let paymentType = this.allowedPaymentMode == "1" ? "CREDITCARD" : "UPI"
    for (let item of this.ModeofPayment.Data) {
      if (item.Id == paymentType) {
        this.GLCodeData = item.GLCode
        this.houseofBank = item.extraData
      }
    }
    this.ResetFiedlsOnChange()
  }

  openPayment(paymentType) {
    this.modeofPaymentData = paymentType

    // const AdvanceObj = this.paymentDetailArray.find( item => item.ModeOfPayment == 'ADVANCE')
    // if (this.modeofPaymentData != 'ADVANCE' && this.TotalCustomerAdvance > 1 ) {
    //     let advAmount = AdvanceObj.Amount == null ? 0 : AdvanceObj.Amount
    //     if ( AdvanceObj && this.TotalCustomerAdvance != advAmount  ){
    //     const ShouldContinue = confirm("Advance Amount not fully consumed for this Customer! Do you want to continue?")
    //     if (ShouldContinue == false ){
    //       return
    //     }
    //   }
    // }
    if (this.modeofPaymentData != 'ADVANCE') {
      // If Adv not consumed 
      if (this.totalPaidAmount < this.TotalCustomerAdvance) {
        this.toastMessage.warning("Advance Amount is not consumed yet")
        const ShouldContinue = confirm("Advance Amount not consumed for this Customer! Do you want to continue?")
        if (ShouldContinue == false) {
          return
        }
      }
    }
    else {
      if (this.objCaseDetail?.ADVANCEPAYMENTLIST != null && this.objCaseDetail?.ADVANCEPAYMENTLIST != undefined) {
        let LocationList: any[] = Array.isArray(this.objCaseDetail.ADVANCEPAYMENTLIST.PAYMENT) ? this.objCaseDetail.ADVANCEPAYMENTLIST.PAYMENT : [this.objCaseDetail.ADVANCEPAYMENTLIST.PAYMENT]
        if ((LocationList.findIndex(item => item.LocationCode == this.params.locationcode)) == -1) {
          this.toastMessage.warning("Warning:- Advance raised in a different location!")
        }
      }
    }
    if (this.modeofPaymentData == 'PINELABS') {
      this.getEDCPinelabsMachineObject()
    }
    if (this.modeofPaymentData == 'PAYTM') {
      this.getEDCPaytmMachineObject()
    }
    this.edcMachineName = null
    this.allowedPaymentMode = null

    for (let item of this.ModeofPayment.Data) {
      if (item.Id == this.modeofPaymentData) {
        this.GLCodeData = item.GLCode
        this.houseofBank = item.extraData
      }
    }
    const cashPaymentDone = this.paymentDetailArray.some(item => item.ModeOfPayment == 'CASH')
    if (this.modeofPaymentData === 'CASH' && cashPaymentDone) {
      this.toastMessage.error("You can't make Multiple Cash Payments!");
      return;
    }
    const hasAdvance = this.paymentDetailArray.some(item => item.ModeOfPayment == 'ADVANCE')
    if (this.modeofPaymentData === 'ADVANCE' && hasAdvance) {
      this.toastMessage.error("You can't make Multiple Advance Payments!");
      return;
    }

    if (this.modeofPaymentData == 'ADVANCE' && this.TotalCustomerAdvance < 1) {
      this.toastMessage.error("No Advance Found for this Customer!")
      return
    }
    if (this.modeofPaymentData == 'CREDITREQ') {
      const ShouldContinue = confirm("Are you sure you want to choose Credit Request instead of Credit Card Option, Do you want to continue?")
      if (ShouldContinue == false) {
        return
      }
    }
    this.isPaymentpopUp = true
    console.log("MOP ", this.modeofPaymentData);
  }

  callEDCStatus() {
    if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
      this.toastMessage.error((this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") + "Machine Name cannot be empty!")
      return false;
    }
    if (this.transactionNumber == '' || this.transactionNumber == null || this.transactionNumber == undefined) {
      this.toastMessage.error((this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") + "Transaction Number cannot be empty!")
      return false;
    }


    for (let item of this.paymentDetailArray) {
      if (item.EDCMachineReferenceID == this.transactionNumber) {
        this.toastMessage.error("This payment has been already added, kindly select a different transaction")
        return
      }
    }
    var selectedpaymentobj;
    for (let item of this.previousEDCPaymentRecords) {
      if (item.TransactionReferenceID == this.transactionNumber) {
        selectedpaymentobj = item;
        this.allowedPaymentMode = item.AllowedPaymentMode
        this.transactionAmount = item.Amount
        this.transactionDateTime = item.TransactionDateTime
        this.Amount = parseFloat(item.Amount) / 100
      }
    }
    for (let obj of this.edcMachineObject) {
      if (obj.HardwareID == selectedpaymentobj.MachineHardwareID) {
        this.edcMachineName = obj.PODDeviceName
        break
      }
    }
    this.isPaymentProcessing = true
    this.modeofPaymentData == 'PINELABS' ? this.getEDCPaymentStatus() : this.getPaytmEDCPaymentStatus()
  }


  getPreviousEDCPaymentObj4Customer() {
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
          if (extraData?.Totalrecords != "0") {
            this.toastMessage.success("Records found!")
            if (data != null && data != undefined) {
              if (Array.isArray(data)) {
                this.previousEDCPaymentRecords = data
              }
              else {
                this.previousEDCPaymentRecords.push(data)
              }
              this.previousEDCPaymentRecords.forEach(item => {
                if (item.Amount != "0" && item.Amount != '' && item.Amount != null && item.Amount != undefined) {
                  item.Amount = parseFloat(item.Amount)
                  // item.Amount = parseFloat(item.Amount)/100
                }
              })
              // this.previousRecordsFound = true
            }
          }
          else {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.isEdcPayment = true
            // this.previousRecordsFound = false
            return;
          }
        }
        else {
          console.log("error", response);
        }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  }

  getEDCPaymentStatus() {
    if (this.transactionNumber == null || this.transactionNumber == undefined || this.transactionNumber == '') {
      this.toastMessage.error("No Transaction Reference ID found")
      return
    }
    if (this.edcMachineName == null || this.edcMachineName == undefined) {
      this.toastMessage.error("No Transaction Machine Name found")
      return
    }
    var edcObject;
    for (let item of this.edcMachineObject) {
      if (item.PODDeviceName == this.edcMachineName) {
        edcObject = item
        break
      }
    }
    let objData = {
      "MerchantID": edcObject.MerchantID,
      "SecurityToken": edcObject.SecurityToken,
      "IMEI": edcObject.UniqueStoreMachineID,
      "MerchantStorePosCode": edcObject.MerchantStorePOSCode,
      "PlutusTransactionReferenceID": this.transactionNumber
    }
    let strRequestData = JSON.stringify(objData)
    let contentRequest = {
      "content": strRequestData
    }
    // this.ngxSpinnerService.show()
    this.gsxService.getEDCTransactionStatus(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value?.toString());
        console.log("EDC Response ", response)
        let stringresponse = Value.toString()
        var responsemessage = response.ResponseMessage
        if (response.ResponseCode == "0" && responsemessage == "TXN APPROVED") {
          this.isPaymentProcessing = false
          this.transactionNumber = response?.PlutusTransactionReferenceID
          var transactiondetail = response.TransactionData;
          for (let item of transactiondetail) {
            if (item.Tag == "TID") {
              this.TerminalId = item.Value;
            }
            if (item.Tag == "ApprovalCode") {
              this.Adjudication = item.Value;
            }
            if (item.Tag == "Card Number") {
              this.CardNo = item.Value;
            }
            if (item.Tag == "Card Type") {
              this.CardTypeData = item.Value;
            }
            if (item.Tag == "RRN") {
              this.UPITransactionId = item.Value;
            }
            // if ( item.Tag == "PaymentMode" && item.Value == "CARD"){

            // }
          }
          let originalMOP = this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI'
          for (let item of this.ModeofPayment.Data) {
            if (item.Id == originalMOP) {
              this.GLCodeData = item.GLCode
              this.houseofBank = item.extraData
            }
          }
          this.paymentDetailArray.push({

            "NEWPAYMENT": 1,
            "TranType": "Payment",
            "TranDate": new Date(),
            "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
            "ModeOfPayment": originalMOP,
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
            "UPITransactionId": this.UPITransactionId,
            "EDCMachineType": "PINELABS",
            "EDCMachineReferenceID": this.transactionNumber == null || this.transactionNumber == undefined ? "" : this.transactionNumber,
            // "RequestedAmount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
            // "BankAccountNo": this.BankAccountNumber == null || this.BankAccountNumber == undefined ? '' : this.BankAccountNumber,
            // "UTR" : this.UTR == null || this.UTR == undefined ? '' : this.UTR,
            // "ChequeNo" : this.ChequeNo == null || this.ChequeNo == undefined ? '' : this.ChequeNo

            "GLCode": this.GLCodeData,
            "HouseOfBank": this.houseofBank,
          })
          console.log("Payment List ", this.paymentDetailArray)
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
        else if (response.ResponseCode == "1") {
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

  newPayment() {
    this.isEdcPayment = true
    this.isPreviousButton = false
    // this.previousRecordsFound = false
  }


  savePineLabsEDCPayment() {
    var edcObject;
    for (let item of this.edcMachineObject) {
      if (item.PODDeviceName == this.edcMachineName) {
        edcObject = item
        break
      }
    }
    console.log("EDC Object ", edcObject)
    let objData = {
      "EDCType": this.modeofPaymentData,
      "CompanyCode": glob.getCompanyCode(),
      "LocationCode": this.params.locationcode,
      "CustomerCode": this.params.customercode,
      "CaseGUID": this.params.caseguid == null || this.params.caseguid == undefined ? '00000000-0000-0000-0000-000000000000' : this.params.caseguid,
      "SequenceNumber": "1",
      "AllowedPaymentMode": this.allowedPaymentMode,
      "MerchantStorePOSCode": edcObject.MerchantStorePOSCode,
      "Amount": parseInt((this.Amount).toString()) * 100,
      "MerchantID": edcObject.MerchantID,
      "MachineHardwareID": edcObject.HardwareID,
      "SecurityToken": edcObject.SecurityToken,
      "IMEI": edcObject.UniqueStoreMachineID
    }
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      content: strRequestData,
    };
    console.log("Request EDC", objData)
    console.log("Content Request", contentRequest)

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
          this.toastMessage.info("Your Plutus Transaction Reference number", this.transactionNumber, { timeOut: 500000 })
          if (response.TransactionNumber != null && response.TransactionNumber != undefined) {
            this.toastMessage.success("Your EDC Transaction Reference Number", response.TransactionNumber, { timeOut: 500000 })
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


  savePaytmEDCPayment() {
    var edcObject;
    for (let item of this.edcMachineObject) {
      if (item.PODDeviceName == this.edcMachineName) {
        edcObject = item
        break
      }
    }
    console.log("EDC Object ", edcObject)
    let objData = {
      "EDCType": this.modeofPaymentData,
      "CompanyCode": glob.getCompanyCode(),
      "LocationCode": this.params.locationcode,
      "CustomerCode": this.params.customercode,
      "CaseGUID": this.params.caseguid == null || this.params.caseguid == undefined ? '00000000-0000-0000-0000-000000000000' : this.params.caseguid,
      "SequenceNumber": "1",
      "AllowedPaymentMode": this.allowedPaymentMode, // this.allowedPaymentMode,
      "MerchantStorePOSCode": "", //edcObject.MerchantStorePOSCode,
      "Amount": parseInt((this.Amount).toString()) * 100,
      "MerchantID": edcObject.MerchantID,
      "MachineHardwareID": edcObject.HardwareID,
      "SecurityToken": edcObject.MerchantKey,
      "IMEI": "", // edcObject.UniqueStoreMachineID
    }
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      content: strRequestData,
    };
    console.log("Request EDC", objData)
    console.log("Content Request", contentRequest)

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
          this.transactionAmount = parseInt((this.Amount).toString()) * 100
          this.toastMessage.info("Your Paytm EDC Transaction number", this.transactionNumber, { timeOut: 2000000 })
          this.toastMessage.info("Your Paytm EDC Transaction Timestamp", this.transactionDateTime, { timeOut: 2000000 })
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


  getPaytmEDCPaymentStatus() {

    if (this.transactionNumber == null || this.transactionNumber == undefined || this.transactionNumber == '') {
      this.toastMessage.error("No Transaction Reference ID found")
      return
    }
    if (this.edcMachineName == null || this.edcMachineName == undefined) {
      this.toastMessage.error("No Transaction Machine Name found")
      return
    }
    var edcObject;
    for (let item of this.edcMachineObject) {
      if (item.PODDeviceName == this.edcMachineName) {
        edcObject = item
        break
      }
    }
    let objData = {
      "paytmMid": edcObject.MerchantID,
      "paytmTid": edcObject.HardwareID,
      "transactionDateTime": this.transactionDateTime.replace('T', ' '),
      "merchantTransactionId": this.transactionNumber,
      "transactionAmount": this.transactionAmount,
      "MerchantKey": edcObject.MerchantKey,
      // "TransactionNumber" : this.transactionNumber,
      // "EDCType" :  edcObject.EDCType ,
      // "SecurityToken":edcObject.SecurityToken,
      // "IMEI":edcObject.UniqueStoreMachineID,
      // "MerchantStorePosCode":edcObject.MerchantStorePOSCode,  
    }
    let strRequestData = JSON.stringify(objData)
    let contentRequest = {
      "content": strRequestData
    }

    // return
    // this.ngxSpinnerService.show()
    this.gsxService.getEDCPaytmTransactionStatus(contentRequest).subscribe({
      next: (Value) => {

        // this.ngxSpinnerService.hide()
        let response = JSON.parse(Value?.toString());
        console.log("EDC Response ", response)
        let stringresponse = Value.toString()
        var responsemessage = response.ResponseMessage
        if (response.body.resultInfo?.resultCode == "S") {
          this.isPaymentProcessing = false
          var transactiondetail = response.body;
          this.TerminalId = transactiondetail.paytmTid;
          this.Adjudication = "";
          this.transactionNumber = transactiondetail.merchantTransactionId
          this.UPITransactionId = transactiondetail.retrievalReferenceNo;
          if (transactiondetail.payMethod != "UPI") {
            this.CardTypeData = transactiondetail.cardScheme
            this.CardNo = transactiondetail.issuerMaskCardNo
            this.Adjudication = transactiondetail.authCode
          }
          let paymentType = response.body.payMethod == 'UPI' ? 'UPI' : 'CREDITCARD'
          let mopObj = this.ModeofPayment.Data.find(mode => mode.Id == paymentType)
          this.GLCodeData = mopObj.GLCode
          this.houseofBank = mopObj.extraData

          this.paymentDetailArray.push({

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
            "UPITransactionId": this.UPITransactionId,
            "EDCMachineType": "PINELABS",
            "EDCMachineReferenceID": this.transactionNumber == null || this.transactionNumber == undefined ? "" : this.transactionNumber,
            // "RequestedAmount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
            // "BankAccountNo": this.BankAccountNumber == null || this.BankAccountNumber == undefined ? '' : this.BankAccountNumber,
            // "UTR" : this.UTR == null || this.UTR == undefined ? '' : this.UTR,
            // "ChequeNo" : this.ChequeNo == null || this.ChequeNo == undefined ? '' : this.ChequeNo
            "GLCode": this.GLCodeData,
            "HouseOfBank": this.houseofBank,
          })
          this.toastMessage.success("Transaction Successfull!", response.body.resultInfo?.resultMsg)
          console.log("Payment List ", this.paymentDetailArray)
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
        else if (response.body.resultInfo.resultCode == "F") {
          this.isPaymentProcessing = false
          // this.previousRecordsFound = false
          this.errorMessage = response.body.resultInfo.resultMsg;
          this.toastMessage.error(this.errorMessage, "Transaction has been cancelled", { timeOut: 50000 })
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

  getPreviousPaytmEDCObj4Customer() {
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
          if (extraData?.Totalrecords != "0") {
            this.toastMessage.success("Records found!")
            if (data != null && data != undefined) {

              this.previousEDCPaymentRecords = Array.isArray(data) ? data : [data]
              // if(Array.isArray(data))
              // {
              //   this.previousEDCPaymentRecords = data
              // }
              // else
              // {
              //   this.previousEDCPaymentRecords.push(data)
              // }
              this.previousEDCPaymentRecords.forEach(item => {
                if (item.Amount != "0" && item.Amount != '' && item.Amount != null && item.Amount != undefined) {
                  item.Amount = parseFloat(item.Amount)
                }
              })
              console.log("previousEDCPaymentRecords ", this.previousEDCPaymentRecords)
              // this.previousRecordsFound = true
            }
          }
          else {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.isEdcPayment = true
            // this.previousRecordsFound = false
            return;
          }
        }
        else {
          console.log("error", response);
        }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  }

  closePaymentPopUp() {
    this.isPaymentpopUp = false
    this.isPreviousButton = false
    if (this.modeofPaymentData == 'PINELABS') {
      // this.previousRecordsFound = false
      this.isEdcPayment = false
    }
  }

  // Advance Doc Type 
  // Refund Advance Options
  isAdvanceOld: boolean = false;
  RefundDocType: string;
  // RefundDocumentList : {RefundDocType : string, RefundDocCode: string , Amount: number,TransactionGUID: string }[] =[]
  TransactionType: string;
  TransactionCode: string;

  AdvanceDocumentList: { TransactionType: string, TransactionCode: string, Amount: number, TransactionGUID: string }[] = []
  RefundDocCode: string;
  RefundAgainstDD: DropDownValue = DropDownValue.getBlankObject();
  // RefundDocCodeDD : DropDownValue = DropDownValue.getBlankObject();
  AdvanceDocCodeDD: DropDownValue = DropDownValue.getBlankObject();
  AdvBilledAmount: number;
  TotalAdvBiledAmount: number;

  onRefundSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundDocType, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.RefundAgainstDD = value;
        }
      },
      error: (err) => {
        this.RefundAgainstDD = DropDownValue.getBlankObject();
      }
    });
  }

  AdvanceDocXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.AdvanceDocumentList) {
      count += 1
      rawData.rows.push({
        "row": {
          "TransactionType": item?.TransactionType,
          "TransactionCode": item?.TransactionCode,
          "Amount": item?.Amount,
          "TransactionGUID": item?.TransactionGUID
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

  changeAdvanceDocType() {
    if (this.TransactionType) {
      this.TransactionCode = null
      this.onDocumentCodeSearch({ term: "", item: [] })
    }
    else {
      this.AdvanceDocCodeDD = DropDownValue.getBlankObject();
    }
  }


  onDocumentCodeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.AdvancePaymentCode, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      DocType: this.TransactionType,
      CustomerCode: this.params.customercode
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.AdvanceDocCodeDD = value;
          console.log("AdvanceDocCodeDD  :- ", this.AdvanceDocCodeDD);
        }
      },
      error: (err) => {
        this.AdvanceDocCodeDD = DropDownValue.getBlankObject();
      }
    });
  }

  AddAdvanceAgainst() {

    if (!this.TransactionType) {
      this.toastMessage.error("Select Doc Type first!")
      return
    }
    else if (this.TransactionCode == null || this.TransactionCode == undefined) {
      this.toastMessage.error("Select Document Code first!")
      return
    }
    else if (this.AdvBilledAmount == null || this.AdvBilledAmount < 1) {
      this.toastMessage.error("Enter Valid Amount")
      return
    }
    else if ((this.AdvBilledAmount > this.TotalCustomerAdvance) || (this.AdvBilledAmount > (this.totalNetAmount - this.totalPaidAmount))) {
      this.toastMessage.error("Amount exceeds Advance Amount or Payable Amount")
      return
    }
    let docData = this.AdvanceDocCodeDD.Data.find(docCode => docCode.Id == this.TransactionCode)
    // console.log("RefundDocCode " , docData)


    if (this.locationData > docData.extraDataJson.Data.LocationCode[0]) {
      this.toastMessage.error("Cant bill for advance from a different location!")
      return
    }

    let OriginalAmount: number;
    OriginalAmount = docData.extraDataJson.Data.Amount[0]
    const TransactionGUID = docData.extraDataJson.Data.TransactionGUID[0]
    // if ( this.RefundDocType == 'RREFUND' ){
    //   // check if Advance older than 45 days  
    //   const createdDate = new Date(docData.extraDataJson.Data.CreatedDate)
    //   const currentDate = new Date();
    //   const dayDifference = (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    //   if (dayDifference > 45) {
    //       this.toastMessage.error("The advance is older than 45 days and kindly apply for Approval.");
    //       this.isAdvanceOld = true 
    //       return;
    //   }
    //   else{
    //     this.isAdvanceOld = false
    //   }
    // }


    if (this.AdvBilledAmount > OriginalAmount) {
      this.toastMessage.error("Amount entered can't be greater than Advance available for this "
        + (this.TransactionType == "RREFUND" ? 'Payment' : (this.TransactionType == 'SREFUND' ? 'Sales Return' : 'Amount Transfer')) + " Code")
      return
    }
    // console.log("Refund Type", this.RefundDocType)
    if (this.AdvanceDocumentList.find(item => item.TransactionCode == this.TransactionCode)) {
      //  this.toastMessage.error("This " + (this.TransactionType == "RREFUND" ? 'Payment': 'Sales Return') + ' Code already exists')
      this.toastMessage.error("This " + (this.TransactionType == "RREFUND" ? 'Payment' : (this.TransactionType == 'SREFUND' ? 'Sales Return' : 'Amount Transfer')) + ' Code already exists')

      return
    }
    this.AdvanceDocumentList.push({ TransactionType: this.TransactionType, TransactionCode: this.TransactionCode, Amount: this.AdvBilledAmount, TransactionGUID: TransactionGUID })
    this.calculateTotalAdvance()
    this.TransactionType = null
    this.TransactionCode = null
    this.AdvBilledAmount = null

  }

  calculateTotalAdvance() {
    this.Amount = 0
    this.AdvanceDocumentList.forEach((item) => {
      this.Amount += item.Amount
    });
    this.Amount = parseFloat(this.Amount.toFixed(2));
  }


  deleteDocItem(item) {
    let index = this.AdvanceDocumentList.indexOf(item)
    this.AdvanceDocumentList.splice(index, 1);
  }


  createAdvanceDSales() {
    this.route.navigate(["/auth/" + glob.getCompanyCode() + "/advance-payment/"], { queryParams: { caseguid: '00000000-0000-0000-0000-000000000000', customercode: this.params.customercode, locationcode: this.params.locationcode } });
  }

  saveAdvancePaymentApproval() {
    if (!this.TransactionType) {
      this.toastMessage.error("Select Doc Type first!")
      return
    }
    else if (this.TransactionCode == null || this.TransactionCode == undefined) {
      this.toastMessage.error("Select Document Code first!")
      return
    }
    else if (this.AdvBilledAmount == null || this.AdvBilledAmount < 1) {
      this.toastMessage.error("Enter Valid Amount")
      return
    }
    let docData = this.AdvanceDocCodeDD.Data.find(docCode => docCode.Id == this.TransactionCode)


    if (this.locationData > docData.extraDataJson.Data.LocationCode[0]) {
      this.toastMessage.error("Cant bill for advance from a different location!")
      return
    }

    this.ngxSpinnerService.show()
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveAdvancePaymentApproval"
    })
    requestData.push({
      "Key": "AdvancePaymentApprovalGUID",
      "Value": uuidv4()
    })
    requestData.push({
      "Key": "PaymentGUID",
      "Value": this.params.caseguid == null || this.params.caseguid == undefined ? '00000000-0000-0000-0000-000000000000' : this.params.caseguid
    })
    requestData.push({
      "Key": "PaymentCode",
      "Value": this.CustomerObject[0].CustomerCode
    })
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.discountMaterialCode
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    })
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "IsConsumed",
      "Value": "0"
    })
    requestData.push({
      "Key": "UnitPrice",
      "Value": this.discountPartUnitPrice
    })
    requestData.push({
      "Key": "DiscountAmount",
      "Value": this.discountAmountRequested
    })
    requestData.push({
      "Key": "CouponCode",
      "Value": ''
    })
    requestData.push({
      "Key": "DiscountCouponStatus",
      "Value": 'SENT FOR APPROVAL'
    })
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
              if (data.Totalrecords == "0") {
                this.toastMessage.error("Discount Request Failed")
              }
              else {
                this.toastMessage.success("Discount Requested Submitted Successfully")
                this.hideDiscountForm = true
              }
            }
            else {
              this.errorMessage = response.ReturnMessage;
              this.toastMessage.error("Error While Saving Discount")
              let errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(errorMessage, (error, result) => {
                const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                errorMessages.forEach((errorMessage) => {
                  this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                });
              });
            }
          } catch (ext) {
            this.toastMessage.error("Internal Error: ", ext)
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    );
  }


  addReferralDetail() {

    if (this.ReferralName == null || this.ReferralName == undefined || this.ReferralName == '') {
      this.toastMessage.error("REFERRAL NAME SHOULD NOT BE EMPTY !")
      return
    }
    if (!(/^[0-9]{10}$/).test(this.ReferralMobileNo)) {
      this.toastMessage.error("INVALID REFERRAL MOBILE NUMBER!")
      return

    }
    this.ReferralDetailsList.push({
      'ReferralName': this.ReferralName,
      'ReferralMobileNo': this.ReferralMobileNo
    })

    this.ReferralMobileNo = null;
    this.ReferralName = null;

  }

  deleteReferral(Referral) {
    let index = this.ReferralDetailsList.indexOf(Referral)
    this.ReferralDetailsList.splice(index, 1)
  }

  ConvertReferralDetailsIntoXml() {
    let rawData = {
      "rows": []
    }

    for (let item of this.ReferralDetailsList) {
      rawData.rows.push({
        "row": {
          "ReferralName": item.ReferralName,
          "ReferralMobileNo": item.ReferralMobileNo
        }
      });
    }


    console.log("rawData", rawData);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Referral xml", xml);
    return xml;
  }

  // mode of payment permission 

  getModeOfPaymentPermissionFunc() {

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetModeOfPaymentPermission"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode
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

            if (response.ReturnCode == '0') {
              let extraData = JSON.parse(response.ExtraData);
              this.MOPList = Array.isArray(extraData.MOPDetails.mop)
                ? extraData.MOPDetails.mop
                : [extraData.MOPDetails.mop];
            }
            console.log('this.MOPList', this.MOPList)

            this.isAdvanceAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'ADVANCE')?.isAllowed == 0 ? false : true;
            this.isCashAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CASH')?.isAllowed == 0 ? false : true;
            this.isChequeAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CHEQUE')?.isAllowed == 0 ? false : true;

            this.isCreditCardAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CREDITCARD')?.isAllowed == 0 ? false : true;
            this.isCreditReqAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'CREDITREQ')?.isAllowed == 0 ? false : true;
            this.isInstCashbackAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'INSTCASHBACK')?.isAllowed == 0 ? false : true;

            this.isPineLabsAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'PINELABS')?.isAllowed == 0 ? false : true;
            this.isStafDebitAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'STAFDEBIT')?.isAllowed == 0 ? false : true;
            this.isUpiAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'UPI')?.isAllowed == 0 ? false : true;

            this.isPaytmAllowed = this.MOPList[0].mops.find(m => m.MOPCode === 'PAYTM')?.isAllowed == 0 ? false : true;
            this.isManualPaytm = this.MOPList[0].mops.find(m => m.MOPCode === 'MANUALPAYTM')?.isAllowed == 0 ? false : true;
            this.isManualPinelabs = this.MOPList[0].mops.find(m => m.MOPCode === 'MANUALPINELABS')?.isAllowed == 0 ? false : true;






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





  openManualPayment(manualMOP) {
    this.ModeOfManualPayment = manualMOP
    this.isManualPayment = true;

  }
  ValidateManualPayment(manualPaymentType) {
    if (manualPaymentType == '1') {

      if (this.ManualPaymentType == '' || this.ManualPaymentType == null || this.ManualPaymentType == undefined) {
        this.toastMessage.error('Select Payment Type')
        return
      }
      if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
        this.toastMessage.error('Card Type Cannot be Empty')
        return
      }
      if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
        this.toastMessage.error('Card Number Cannot be Empty')
        return
      }

      if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
        this.toastMessage.error('Adjudication Cannot be empty')
        return
      }
      if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
        this.toastMessage.error('TerminalId Cannot be empty')
        return
      }
      if (this.Amount == null || this.Amount == undefined || this.Amount < 1) {
        this.toastMessage.error('Invalid Payment Amount')
        return
      }

      this.paymentDetailArray.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": "CREDITCARD",
        "CardType": this.CardTypeData,
        "CardNumber": this.CardNo,
        "Adjudication": this.Adjudication,
        "TerminalId": this.TerminalId,
        "EDCMachineType": this.ModeOfManualPayment,
        "GLCode": this.GLCodeData,
        "HouseOfBank": this.houseofBank

      })
      console.log("Paymnet Object Mannual Payment ", this.paymentDetailArray)
      this.totalPaidAmount = this.totalPaidAmount + this.Amount

      this.Amount = 0.00
      this.ModeOfManualPayment = '';
      this.CardTypeData = '';
      this.CardNo = '';
      this.Adjudication = '';
      this.TerminalId = '';
      this.closeManualPayment()

    }
    else if (manualPaymentType == '10') {
      if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
        this.toastMessage.error('UPI Transaction Id Cannot be empty')
        return
      }
      if (this.Amount == null || this.Amount == undefined || this.Amount < 1) {
        this.toastMessage.error('Amount Cannot be empty')
        return
      }



      this.paymentDetailArray.push({
        "NEWPAYMENT": 1,
        "TranType": "Payment",
        "TranDate": new Date(),
        "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
        "ModeOfPayment": "UPI",
        "UPITransactionId": this.UPITransactionId,
        "GLCode": this.GLCodeData,
        "HouseOfBank": this.houseofBank,
        "EDCMachineType": this.ModeOfManualPayment,
      })
      console.log("Paymnet Object Mannual Payment ", this.paymentDetailArray)
      this.totalPaidAmount = this.totalPaidAmount + this.Amount

      this.Amount = 0.00
      this.ModeOfManualPayment = '';
      this.UPITransactionId = ''
      this.GLCodeData = '',
        this.houseofBank = ''
      this.closeManualPayment()

    }
    else {
      this.toastMessage.error('Select Payment Type')
      return
    }

  }

  closeManualPayment() {
    this.isManualPayment = false

    this.ManualPaymentType = null
    this.CardTypeData = null
    this.CardNo = null
    this.Adjudication = null
    this.TerminalId = null
    this.Amount = null
    this.UPITransactionId = null

  }

  ResetFiedlsOnChange() {

    if (this.ManualPaymentType == '1') {
      this.CardTypeData = null
      this.CardNo = null
      this.Adjudication = null
      this.TerminalId = null
      this.Amount = null

    }
    else if (this.ManualPaymentType == '10') {
      this.Amount = null
      this.UPITransactionId = null
    }
  }

  onBindSchemeMaster($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BindSchemeMaster, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {

          this.BindSchemeMasterDD = value;
          console.log('BindSchemeMasterDD', this.BindSchemeMasterDD);
        }
      },
      error: (err) => {
        this.BindSchemeMasterDD = DropDownValue.getBlankObject();
      }
    });
  }

  SetSchemeCode() {
   
    let count3PP = 0;

    this.finalSelectedElements.forEach(item => {
      console.log('item', item);

      if (item.InventoryStockType == "3PP") {
        count3PP = count3PP + 1;
      }
      if(item.ItemSource !== 'QUOTATION'){
           item.DiscountCoupon = 0;
           item.DiscountAmount = 0;
      }
    
    });


    if (count3PP == 3 && this.CustomerObject[0]?.CustAccGroupCode != "ALLSTAFF") {
      this.SchemeCode = "DISC30"
      const SelectedSchemeCode = this.BindSchemeMasterDD?.Data.find(item => item?.Id == this.SchemeCode)
      this.SchemePercentage = SelectedSchemeCode.extraDataJson.Data.SchemePercentage[0]
    }
    else if (count3PP == 4 && this.CustomerObject[0]?.CustAccGroupCode != "ALLSTAFF") {
      this.SchemeCode = "DISC40"
      const SelectedSchemeCode = this.BindSchemeMasterDD?.Data.find(item => item?.Id == this.SchemeCode)
      this.SchemePercentage = SelectedSchemeCode.extraDataJson.Data.SchemePercentage[0]
    }
    else if (count3PP >= 5 && this.CustomerObject[0]?.CustAccGroupCode != "ALLSTAFF") {
      this.SchemeCode = "DISC50"
      const SelectedSchemeCode = this.BindSchemeMasterDD?.Data.find(item => item?.Id == this.SchemeCode)
      this.SchemePercentage = SelectedSchemeCode.extraDataJson.Data.SchemePercentage[0]

    }
    else {
      this.SchemeCode = ''
      this.SchemePercentage = 0.00;
    }

    console.log('count3PP', count3PP);
    console.log('this.SchemePercentage', this.SchemePercentage);

    // this.calculateSchemeDiscount()

  }


  calculateSchemeDiscount() {

    if (this.SchemePercentage > 0.00) {

      this.finalSelectedElements.forEach(item => {
        if (item.InventoryStockType == "3PP") {

          item.DiscountAmount = ((this.SchemePercentage) / 100) * (item.UnitPrice)
        }
      })
    }
    else if (this.SchemePercentage == 0.00) {
      this.finalSelectedElements.forEach(item => {

        if (item.InventoryStockType == "3PP") {
          item.DiscountAmount = 0.00
        }
      })
    }
    console.log('this.finalSelectedElements from Calculate Scheme Discount', this.finalSelectedElements)

  }

  validatePriceRange() {

    for (let item of this.finalSelectedElements) {
      if (item?.PriceRangeApplicable == true) {
        if (parseFloat(Number(item.UnitPrice).toFixed(2)) < item.PriceRangeStart) {
          this.toastMessage.error(`Unit Price cannot be less than the PriceRangeStart for Material Code ${item.MaterialCode} `)
          return false;
        }
        if (parseFloat(Number(item.UnitPrice).toFixed(2)) > item.PriceRangeEnd) {
          this.toastMessage.error(`Unit Price cannot be greater than the PriceRangeEnd for Material Code ${item.MaterialCode} `)
          return false;
        }
      }
    }
    return true;
  }




  onBindAmcTypeMaster($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BindAmcTypeMaster, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {

          this.BindAmcTypeMasterDD = value;
          console.log('BindAmcTypeMasterDD', this.BindAmcTypeMasterDD);
        }
      },
      error: (err) => {
        this.BindAmcTypeMasterDD = DropDownValue.getBlankObject();
      }
    });
  }

  AmcTypeChange(typeCode) {

    console.log(typeCode);
    console.log('this.BindAmcTypeMasterDD.Data', this.BindAmcTypeMasterDD.Data);

    this.BindAmcTypeMasterDD.Data.forEach((item) => {

      if (item?.Id === typeCode) {
        this.BillingMaterialCode = item?.Id
        this.BillingMaterialDesc = item?.TEXT
      }
    });

  }


  onCoverageDateChange(newStartDate) {

    console.log('newStartDate', newStartDate)

    this.CoverageEndDate = new Date(newStartDate);
    // this.CoverageEndDate.setFullYear(newStartDate.getFullYear() + 1);

    this.CoverageEndDate.setDate(this.CoverageEndDate.getDate() + 365);

  }


  Search_Serialno() {

    let searchData = { unitReceivedDateTime: this.unitReceivedDateTime, device: { "id": this.AmcSerialNo } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("device ", contentRequest)
    this.gsxService.getDeviceDetails(contentRequest).subscribe(
      {
        next: (value) => {

          let StoreAllResponse = JSON.parse(value.toString());
          console.log("Data After ", StoreAllResponse)
          if (!(StoreAllResponse["errors"] == undefined || StoreAllResponse["errors"] == null)) {
            this.toastMessage.error(StoreAllResponse["errors"][0].code + ' - ' + StoreAllResponse["errors"][0].message);
            this.ngxSpinnerService.hide();
            return;
          }
          else {
            this.toastMessage.success("Serial number  found successfully");
            console.log('StoreAllResponse', StoreAllResponse);
            this.ProductName = StoreAllResponse.device.productDescription;
            this.ngxSpinnerService.hide();
          }

        }
      });
  }

  onProductType($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductType, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductTypeDD = value;
          console.log("Product Type", this.ProductTypeDD)
          if (this.params?.doctype == 'AMCSALES') {
            this.ProductType = 'SERIALIZED'
          }
        }
      },
      error: (err) => {
        this.ProductTypeDD = this.getBlankObject();
      }
    });
  }

  addAmcPart() {

    if (this.AmcSerialNo == null || this.AmcSerialNo == '' || this.AmcSerialNo == undefined) {
      this.toastMessage.error('Serial No cannot be empty!');
      return
    }
    if (this.ProductName == null || this.ProductName == '' || this.ProductName == undefined) {
      this.toastMessage.error('Enter Serial No and click on search to get Product Name !');
      return
    }

    if (this.BillingMaterialCode == null || this.BillingMaterialCode == '' || this.BillingMaterialCode == undefined) {
      this.toastMessage.error('Material Code Cannot be empty !! ');
      return
    }

    
    console.log('this.finalSelectedElements', this.finalSelectedElements);
    this.finalSelectedElements.push({

      "Batch": "",
      "MaterialCode": this.BillingMaterialCode,
      "MaterialName": this.BillingMaterialDesc == null || this.BillingMaterialDesc == undefined ? '' : this.BillingMaterialDesc,
      "SerialNo": this.AmcSerialNo,
      "ItemType": "Resource",
      "SerializedModule": "",
      "Billable": 1,
      "PriceType": "StockPrice",
      "InventoryStockType": "",
      "CoverageStartDate": this.CoverageStartDate == null || this.CoverageStartDate == undefined ? '' : this.datePipe.transform(this.CoverageStartDate, 'yyyy-MM-dd'),
      "CoverageEndDate": this.CoverageEndDate == null || this.CoverageEndDate == undefined ? '' : this.datePipe.transform(this.CoverageEndDate, 'yyyy-MM-dd'),
      "ProductType": this.ProductType == null || this.ProductType == undefined ? '' : this.ProductType,
      "ProductName": this.ProductName == null || this.ProductName == undefined ? '' : this.ProductName,
      "AmcTypeCode": this.AmcTypeCode == null || this.AmcTypeCode == undefined ? '' : this.AmcTypeCode,
      "Quantity" : 1,
      "PriceSource" : 'PRICELIST'
    })
    console.log(' this.finalSelectedElements from addAmcPart', this.finalSelectedElements)

    this.BillingMaterialCode = null;
    this.BillingMaterialDesc = null;
    this.AmcSerialNo = null;
    this.AmcTypeCode = null;
    this.ProductName = null;

    this.getInvoiceStockPrice()

  }


  // download contract report

  downloadContractReport(reportType: String) {
    
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetContractObject4Print",
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





   onDiscountTypeSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DISCOUNTTYPE, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.DiscountTypeSearchDD = value;
          console.log("DiscountTypeSearchDD ", this.DiscountTypeSearchDD)
        }
      },
      error: (err) => {
        this.DiscountTypeSearchDD = this.getBlankObject();
      }
    });
  }



   GetAutoApproveDiscountDetails() {
    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetAutoApproveDiscountDetails"
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
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (Array.isArray(data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails)) {
                this.AutoApproveDiscountDetailsList = data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails
              }
              else {
                this.AutoApproveDiscountDetailsList.push(data?.AutoApproveDiscountDetailsList?.AutoApproveDiscountDetails)
              }
             
               this.AutoApproveDiscountDetailsList.forEach(x =>{
                   this.PartTypeApplicableForAutoApprove.push(x.PartType)
               })

               console.log('this.PartTypeApplicableForAutoApprove' , this.PartTypeApplicableForAutoApprove)
              
            }
            console.log('this.AutoApproveDiscountDetailsList', this.AutoApproveDiscountDetailsList)
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );

  }

  IsApplicable4AutoDiscountApprove(item){ 
      const safeRound = (value) => isNaN(value) ? 0 : Math.round(value * 100) / 100;
      
     if(this.PartTypeApplicableForAutoApprove.includes(item.InventoryStockType?.toLowerCase()) ){
      this.IsAutoDiscountApplicable=true;
       const PartTypeApplicableForAutoDisc = this.AutoApproveDiscountDetailsList.find(a => a.PartType?.toLowerCase() == item.InventoryStockType?.toLowerCase() )
       this.Discount_Add_Amount = safeRound(((PartTypeApplicableForAutoDisc?.DiscountPercentage)/100) * item.UnitPrice)
     }
     else{
      this.IsAutoDiscountApplicable=false;
     }
  }


  

   GetCustomerAllowedtoChangeUnitPriceList() {
    debugger
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetCustomerAllowedtoChangeUnitPriceList"
    })
    
    let strRequestData = JSON.stringify(requestData);
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
              let data = JSON.parse(response?.ExtraData);
              
              if (Array.isArray(data?.CustomerAllowedtoChangeUnitPriceList?.CustomerAllowedtoChangeUnitPrice)) {
                this.CustomerAllowedtoChangeUnitPriceList = data?.CustomerAllowedtoChangeUnitPriceList?.CustomerAllowedtoChangeUnitPrice
              }
              else {
                this.CustomerAllowedtoChangeUnitPriceList.push(data?.CustomerAllowedtoChangeUnitPriceList?.CustomerAllowedtoChangeUnitPrice)
              }
            }
            console.log('this.CustomerAllowedtoChangeUnitPriceList', this.CustomerAllowedtoChangeUnitPriceList)

           this.IsCustUnitPriceEditAllwoed = this.CustomerAllowedtoChangeUnitPriceList.some( x => x.CustomerCode === this.params.customercode && x.IsAllowed === "1" );
            

     

            
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );

  }



}