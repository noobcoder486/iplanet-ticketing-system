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
import { DatePipe, Location } from '@angular/common';
import xml2js from 'xml2js';
import { v4 as uuidv4, parse } from 'uuid';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';


@Component({
  selector: 'app-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.css']
})
export class AdvancePaymentComponent implements OnInit {

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

  // Payment Link 
  CustomerMobileNo
  CustomerEmailID
  PaymentLinkURL
  PaymentLinkId
  PaymentLinkGUID


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
      this.customercodedata = this.params.customercode
    }
    else {
      this.toastMessage.error("Customer Details not found")
    }

    if (this.params.locationcode != null && this.params.locationcode != undefined) {
      this.getLocationObject()
      this.locationdata = this.params.locationcode
      this.getModeOfPaymentPermissionFunc() // function to get the mode of payment permission 

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
    else{
      this.getCustomerModeOfPaymentLink()
      this.PaymentLinkGUID = uuidv4()
      this.isEdit = true
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
              this.CustomerMobileNo = this.CustomerObject[0].MobileNo
              this.CustomerEmailID = this.CustomerObject[0].EmailID


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

  getCustomerModeOfPaymentLink(){
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
      "Value": this.customercodedata
    })
    requestdata.push({
      "Key": "LocationCode",
      "Value": this.locationdata
    })
    requestdata.push({
      "Key": "TransactionType",
      "Value": 'ADVANCE'
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
                
                console.log("EDC ", this.edcMachineObject)
              
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
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.isPaymentProcessing = true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.isPaymentProcessing = false
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
          this.isPaymentProcessing = false
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


  // setfunction(){
  //   for(let item of this.AdvModeofPaymentDD.Data)
  //   {
  //     if(item.Id == this.modeofPaymentData)
  //     {
  //       this.GLCodeData = item.GLCode
  //       this.houseofBank = item.extraData
  //     }
  //   }
  //   console.log("MOP ", this.modeofPaymentData);

  // }


  // validatePaymentResq() {
  //   if (this.modeofPaymentData == '') {
  //     this.toastMessage.error("Mode of Payment cannot be empty")
  //     return false;
  //   }
  //   else if (this.Amount == null || this.Amount == undefined || this.Amount == 0) {
  //     this.toastMessage.error("Payment Amount cannot be zero!")
  //     return false;
  //   }
  //   else if (this.modeofPaymentData == 'CHEQUE') {
  //     if (this.AccountNumber == '' || this.AccountNumber == null || this.AccountNumber == undefined) {
  //       this.toastMessage.error("Account No cannot be empty!")
  //       return false;
  //     }
  //     else if (this.AuthenticationNumber == '' || this.AuthenticationNumber == null || this.AuthenticationNumber == undefined) {
  //       this.toastMessage.error("Auth number cannot be empty")
  //       return false;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'CREDITCARD') {
  //     if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
  //       this.toastMessage.error("Card Type cannot be empty!")
  //       return false;
  //     }
  //     else if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
  //       this.toastMessage.error("Card number cannot be empty")
  //       return false;
  //     }
  //     else if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
  //       this.toastMessage.error("Adjudication cannot be empty")
  //       return false;
  //     }
  //     else if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
  //       this.toastMessage.error("TerminalId cannot be empty")
  //       return false;
  //     }
  //   }
  //   else if (this.modeofPaymentData == 'NEFT/RTGS') {
  //     /*if (this.RequestedAmt == null || this.RequestedAmt == undefined) {
  //       this.toastMessage.error("Requested Amount cannot be zero!")
  //       return false;
  //     }
  //     else*/
  //     if (this.AccountHolderName == '' || this.AccountHolderName == null || this.AccountHolderName == undefined) {
  //       this.toastMessage.error("Account Holder Name cannot be empty")
  //       return false;
  //     }
  //     else if (this.BankCode == '' || this.BankCode == null || this.BankCode == undefined) {
  //       this.toastMessage.error("Bank Code cannot be empty")
  //       return false;
  //     }
  //     else if (this.BankAccountNumber == null || this.BankAccountNumber == undefined) {
  //       this.toastMessage.error("Bank Account No cannot be empty")
  //       return false;
  //     }
  //   }
  //   this.paymentDetailArray.push({
  //     "TranType": "Payment",
  //     "TranDate": new Date(),
  //     "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
  //     "ModeOfPayment": this.modeofPaymentData,
  //     "AccountNumber": this.AccountNumber == null || this.AccountNumber == undefined ? "" : this.AccountNumber,
  //     "AuthenticationNumber": this.AuthenticationNumber == null || this.AuthenticationNumber == undefined ? "" : this.AuthenticationNumber,
  //     "CardType": this.CardTypeData == null || this.CardTypeData == undefined ? "" : this.CardTypeData,
  //     "CardNumber": this.CardNo == null || this.CardNo == undefined ? "" : this.CardNo,
  //     "Adjudication": this.Adjudication == null || this.Adjudication == undefined ? "" : this.Adjudication,
  //     "TerminalId": this.TerminalId == null || this.TerminalId == undefined ? "" : this.TerminalId,
  //     "RequestedAmount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
  //     "AccountHolderName": this.AccountHolderName,
  //     "BankCode": this.BankCode,
  //     "GLCode": this.GLCodeData == null || this.GLCodeData == undefined ?"":this.GLCodeData,
  //     "BankAccountNumber": this.BankAccountNumber == null || this.BankAccountNumber == undefined ? '' : this.BankAccountNumber,
  //     "UPITransactionId" : this.UPITransactionId == null || this.UPITransactionId == undefined ? '' : this.UPITransactionId,
  //     "ChequeNo" : this.ChequeNo == null || this.ChequeNo == undefined ? '' : this.ChequeNo
  //   })
  //   this.totalPaidAmount = this.totalPaidAmount + this.Amount
  //   this.Amount = 0.00
  //   this.modeofPaymentData = '';
  //   this.AccountNumber = ''
  //   this.AuthenticationNumber = '';
  //   this.CardTypeData = '';
  //   this.CardNo = '';
  //   this.Adjudication = '';
  //   this.TerminalId = '';
  //   this.AccountHolderName = '';
  //   this.BankCode = '';
  //   this.BankAccountNumber = "";
  //   this.GLCodeData = ''
  //   this.UPITransactionId="";
  //   return true;
  // }

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
    
    if (this.modeofPaymentData == 'Credit Card/UPI' ){
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
    // else if (this.modeofPaymentData == 'Credit Card/UPI') {
    //   if (this.CardTypeData == '' || this.CardTypeData == null || this.CardTypeData == undefined) {
    //     this.toastMessage.error("Card Type cannot be empty!")
    //     return false;
    //   }
    //   else if (this.CardNo == '' || this.CardNo == null || this.CardNo == undefined) {
    //     this.toastMessage.error("Card number cannot be empty")
    //     return false;
    //   }
    //   else if (this.Adjudication == '' || this.Adjudication == null || this.Adjudication == undefined) {
    //     this.toastMessage.error("Adjudication cannot be empty")
    //     return false;
    //   }
    //   else if (this.TerminalId == '' || this.TerminalId == null || this.TerminalId == undefined) {
    //     this.toastMessage.error("TerminalId cannot be empty")
    //     return false;
    //   }
    // }
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
    // else if (this.modeofPaymentData == 'PAYMENTLINK') {
   
    //   if (this.allowedPaymentMode == '' || this.allowedPaymentMode == null || this.allowedPaymentMode == undefined) {
    //   }
    //   else
    //   {
    //     this.savePaymentLink()
    //     return
    //   }
    // }

    else if (this.modeofPaymentData == 'UPI' || this.modeofPaymentData == 'CHEQUE' || this.modeofPaymentData == 'CREDITREQ') {
      if (this.UPITransactionId == null || this.UPITransactionId == undefined || this.UPITransactionId == '') {
        this.toastMessage.error("Transaction Reference Number cannot be empty!")
        return false;
      }
    }
    // else if (this.modeofPaymentData == 'Credit Card/UPI') {
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

    if ( this.modeofPaymentData != 'PINELABS' && this.modeofPaymentData != 'PAYTM' && this.modeofPaymentData != 'Credit Card/UPI'){
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
    else if ( this.modeofPaymentData == 'Credit Card/UPI'){
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

    if ( this.modeofPaymentData == 'PINELABS'|| this.modeofPaymentData == 'PAYTM'){
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
          this.getEDCPinelabsPaymentStatus()
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
      this.ResetFiedlsOnChange()
  }

  openPayment(paymentType)
  { 
    
    this.edcMachineName =null
    this.modeofPaymentData = paymentType
    if ( this.modeofPaymentData == 'PINELABS' ){
      this.newPayment()
      this.getEDCPinelabsMachineObject()
    }
    if ( this.modeofPaymentData == 'PAYTM'){
      this.newPayment()
      this.getEDCPaytmMachineObject()
    }
    // if ( this.modeofPaymentData != 'PINELABS'){
      for(let item of this.AdvModeofPaymentDD.Data)
      {
        if(item.Id == this.modeofPaymentData)
        {
          this.GLCodeData = item.GLCode
          this.houseofBank = item.extraData
        }
      }
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
      this.toastMessage.error( ( this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") +  "Machine Name cannot be empty!")
      return false;
    }
    if (this.transactionNumber == '' || this.transactionNumber == null || this.transactionNumber == undefined) {
      this.toastMessage.error(( this.modeofPaymentData == 'PINELABS' ? "PineLabs " : "Paytm ") + "Transaction Number cannot be empty!")
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
    this.modeofPaymentData == 'PINELABS' ? this.getEDCPinelabsPaymentStatus() :  this.getPaytmEDCPaymentStatus()
  }
  // callEDCStatus()
  // {
  //   if (this.edcMachineName == '' || this.edcMachineName == null || this.edcMachineName == undefined) {
  //     this.toastMessage.error("PineLabs Machine Name cannot be empty!")
  //     return false;
  //   }
  //   if (this.transactionNumber == '' || this.transactionNumber == null || this.transactionNumber == undefined) {
  //     this.toastMessage.error("PineLabs Transaction Number cannot be empty!")
  //     return false;
  //   }
    

  //   for(let item of this.paymentDetailArray)
  //   {
  //     if(item.EDCMachineReferenceID == this.transactionNumber)
  //     {
  //       this.toastMessage.error("This payment has been already added, kindly select a different transaction")
  //       return
  //     }
  //   }
  //   var selectedpaymentobj ;
  //   for(let item of this.previousEDCPaymentRecords)
  //   {
  //     if(item.TransactionReferenceID == this.transactionNumber)
  //     {
  //       selectedpaymentobj = item;
  //       this.allowedPaymentMode = item.AllowedPaymentMode
  //       this.Amount = parseFloat(item.Amount)/100
  //     }
  //   }
  //   for(let obj of this.edcMachineObject)
  //   {
  //     if(obj.HardwareID == selectedpaymentobj.MachineHardwareID)
  //     {
  //       this.edcMachineName = obj.PODDeviceName
  //       break
  //     }
  //   }
  //   this.isPaymentProcessing = true
  //   this.getEDCPinelabsPaymentStatus()
  // }
  
  
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
                this.isNewPayment = false
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

  getEDCPinelabsPaymentStatus()
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

            let originalMOP = this.allowedPaymentMode == '1' ? 'CREDITCARD' : 'UPI'
            for(let item of this.AdvModeofPaymentDD.Data)
            {
              if(item.Id == originalMOP)
              {
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
            this.getEDCPinelabsPaymentStatus();
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
  oldPayment()
  {
    this.isNewPayment=false
    // this.isNewTxnBtn=false
    this.previousRecordsFound = true
  }


   // variable declarations for Paytm 
   transactionDateTime: string
   transactionAmount: number
   paytmSaveResponseObj: any
   RequestedAmt: any

   getEDCPaytmMachineObject() {

    let requestdata = []
    requestdata.push({
      "Key": "ApiType",
      "Value": "getEDCPaytmMachineObject"
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
    this.isPaymentProcessing = true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.isPaymentProcessing = false
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
          this.isPaymentProcessing = false
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
    this.ngxSpinnerService.show()

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
    }
    let strRequestData = JSON.stringify(objData)
    let contentRequest = {
      "content": strRequestData
    }
    this.isPaymentProcessing = true
    // console.log(' from  getPaytmEDCPaymentStatus ');
    // return
    this.gsxService.getEDCPaytmTransactionStatus(contentRequest).subscribe({
      next: (Value) => {
        
        this.ngxSpinnerService.hide()
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
          let mopObj = this.AdvModeofPaymentDD.Data.find(mode => mode.Id == paymentType)
          this.GLCodeData = mopObj.GLCode
          this.houseofBank = mopObj.extraData

          this.paymentDetailArray.push({

            "NEWPAYMENT": 1,
            "TranType": "Payment",
            "TranDate": new Date(),
            "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
            "ModeOfPayment": paymentType,
            // "AuthenticationNumber": this.AuthNo,
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
            "UPITransactionId": this.UPITransactionId,
            "EDCMachineType": "PAYTM",
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
        else if (response.body.resultInfo.resultCode == "F") {
          this.isPaymentProcessing = false
          // this.previousRecordsFound = false
          this.errorMessage = response.body.resultInfo.resultMsg;
          this.toastMessage.error(this.errorMessage, "Transaction has been cancelled", { timeOut: 50000 })
          this.Amount = 0.00
          this.modeofPaymentData = '';
          this.AccountNumber = ''
          this.AuthenticationNumber = '';
          this.CardTypeData = '';
          this.CardNo = '';
          this.Adjudication = '';
          this.TerminalId = '';
          this.UPITransactionId = '';
          this.RequestedAmt = 0.00;
          this.AccountHolderName = '';
          this.BankCode = '';
          this.houseofBank = '';
          // this.BankAccountNo = 0.00;
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
        this.ngxSpinnerService.hide()
        console.log(err);
      },
    });
  }

  getPreviousPaytmEDCObj4Customer() {
    this.isNewPayment = false
    // this.isEdcPayment = false
    // this.isPreviousButton = true
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

    console.log('this is from  getPreviousPaytmEDCObj4Customer', contentRequest);
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
              this.previousEDCPaymentRecords.forEach(item => {
                if (item.Amount != "0" && item.Amount != '' && item.Amount != null && item.Amount != undefined) {
                  item.Amount = parseFloat(item.Amount)
                }
              })
              console.log("previousEDCPaymentRecords ", this.previousEDCPaymentRecords)
              this.oldPayment()
            }
          }
          else {
            this.toastMessage.error("No Previous Open Transacations Found")
            this.newPayment()
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

  onSubmit() {
    if (this.advancePaymentAmount == 0.00) {
      this.toastMessage.error("There is no advance payment for this transaction!")
      return;
    }
    // if (this.totalPaidAmount > (this.advancePaymentAmount + 1) || this.totalPaidAmount < (this.advancePaymentAmount - 1)) {
    //   this.toastMessage.error("Paid Amount and Advance Amount does not match")
    //   return;
    // }

    // if(this.advanceAmountPaid == this.advancePaymentAmount)
    // {
    //   this.toastMessage.error("Payment is already done")
    //   return;
    // }
    this.PaymentGUID = uuidv4()
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveAdvancePayment"
    });
    requestData.push({
      "Key": "PaymentGUID",
      "Value": this.PaymentGUID
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "PaymentDocType",
      "Value": 'PADV'
    });
    requestData.push({
      "Key": "InvoiceGUID",
      "Value": "00000000-0000-0000-0000-000000000000"
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.caseguid
    });
    requestData.push({
      "Key": "SalesOrderGUID",
      "Value": "00000000-0000-0000-0000-000000000000"
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.customercodedata
    });
    requestData.push({
      "Key": "BillToCustomerCode",
      "Value": this.customercodedata
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationdata
    });
    requestData.push({
      "Key": "TotalPaidAmount",
      "Value": this.advancePaymentAmount
    });
    requestData.push({
      "Key": "CurrencyCode",
      "Value": "INR"
    });
    requestData.push({
      "Key": "PaymentDetails",
      "Value": this.savePaymentListXml()
    })

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    // // // TODO
    // console.log("Before Saving Advance payment ", requestData)
    // console.log("Payment List ", this.paymentDetailArray)
    // return
    
    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true 

    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.submitClicked= false 
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            console.log("success ", getval)

            this.paymentSuccessData=getval;
            this.toastMessage.success('Submitted Succesfully')
            this.route.navigate(['auth/' + glob.getCompanyCode() + '/advance-payment-list'])
            // this.saveSapAdvancePayment()
          }
          else {
              this.submitClicked= false 
              console.log("Error Response: " , response)
              
              this.errorMessage = response.ReturnMessage;
              this.toastMessage.error("Error While Saving Advance")
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

  // Payment Link 
  uploadPaymentLink()
  {
    if (this.Amount == null || this.Amount == undefined || this.Amount < 1) {
      this.toastMessage.error("Invalid Payment Amount!")
      return false;
    }
    
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }


    let objData = {
      // "MERCHANT_ID":edcObject.MerchantID,
      // "MERCHANT_ACCESS_CODE":edcObject.SecurityToken,
      "REFERENCE_NO": this.PaymentLinkGUID,
      "AMOUNT":parseInt((this.Amount).toString())*100,
      "CUSTOMER_MOBILE_NO":this.CustomerMobileNo,
      "CUSTOMER_EMAIL_ID":this.CustomerEmailID,
      "CaseGUID":this.caseguid,
      "Description" : ''
    }
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      content: strRequestData,
    };
    console.log("Request EDC", objData )
    console.log("Content Request", contentRequest )

    // // // TODO 
    // alert("Return ON")
    // return
    this.isPaymentProcessing = true
    this.dynamicService.generatePaymentLink(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        console.log("Response ", response)
        if (response.RESPONSE_CODE == "1") {
          this.isPaymentProcessing = false
          this.PaymentLinkURL = response?.PAYMENT_URL

          // this.toastMessage.info( this.PaymentLinkURL.toString(),"Your Payment Link URL is: ",  {
          //   closeButton: true, tapToDismiss: false, disableTimeOut: true
          // });

          // this.toastMessage.info("Your Payment Link URL is", this.PaymentLinkURL,{closeButton:true,disableTimeOut:true})
          // this.PaymentLinkId = response?.PAYMENT_LINK_ID
          // this.toastMessage.info("Your Payment Link Id is", this.PaymentLinkId,{closeButton:true,disableTimeOut:true})
          this.toastMessage.info("Your Payment Link URL is", this.PaymentLinkURL,{ closeButton: true, tapToDismiss: false, disableTimeOut: true})
          this.PaymentLinkId = response?.PAYMENT_LINK_ID
          this.toastMessage.info("Your Payment Link Id is", this.PaymentLinkId,{ closeButton: true, tapToDismiss: false, disableTimeOut: true })

          this.savePaymentLink()

        } 
        else {
          this.isPaymentProcessing = false
          this.PaymentLinkGUID = uuidv4()
          this.Amount = 0 
          this.errorMessage = response.RESPONSE_MESSAGE;
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

  // generatePaymentLink() {
    
  //   this.spinner.show()
  //     if(this.validatePayableAmount()){
  //       let requestData 
  //     requestData = {
  //       "CaseGUID":this.repa?.CaseGUID,
  //       "FirstName":this.repa?.CUSTOMER?.FirstName,
  //       "LastName":this.repa?.CUSTOMER?.LastName,
  //       "MobileNo":this.repa?.CUSTOMER?.MobileNo,
  //       "EmailID":this.repa?.CUSTOMER?.EmailID,
  //       "CaseID": 'Payment For CaseID:'+this.repa?.CaseId,
  //       "PaymentLinkGuid":    this.newPaymentLinkGUID,
  //       "PayableAmount": parseFloat(this.PaymentLink.controls["Payable"].value) * 100,
  //       "Description": this.repa?.productDescription
  //   }
  //   
  //     let strRequestData = JSON.stringify(requestData);
  //     console.log(strRequestData);
  //     let contentRequest = {
  //       "content": strRequestData
  //     };
  //     ;
  //     this.dynamicService.generatePaymentLink(contentRequest).subscribe(
  //       {
  //         next: (value) => {
            
  //           let response = JSON.parse(value.toString());

  //           if (response.RESPONSE_CODE == 1) {
  //             console.log("sucess");
  //             this.newPaymentLink = response.PAYMENT_URL
  //             this.toaster.success("Payment Link Generate Sucessfully")
  //             this.savePaymentLink()
  //             this.spinner.hide()
  //           }
  //           else {
  //             this.spinner.hide()
  //             this.errorMessage = response.RESPONSE_MESSAGE;
  //               this.toaster.error(this.errorMessage) 
  //           }

  //         },
  //         error: err => {
             
  //           console.log(err);
  //           this.spinner.hide()
  //         }
  //       });
  //     }else{
  //       this.spinner.hide()
  //     }
    
  // }


  savePaymentLink() {
    this.ngxSpinnerService.show()

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveJobPaymentLink"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    
    requestData.push({
      "Key": "PaymentGateway",
      "Value": "PineLabs"
    });
    requestData.push({
      "Key": "PaymentLinkGUID",
      "Value":  this.PaymentLinkGUID
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.caseguid
    });
    requestData.push({
      "Key": "PaymentLink",
      "Value": this.PaymentLinkURL
    });
    requestData.push({
      "Key": "PaymentLinkID",
      "Value": this.PaymentLinkId
    });
    requestData.push({
      "Key": "Amount",
      "Value": this.Amount
    });
    requestData.push({
      "Key": "PaymentLinkStatus",
      "Value": "OPEN"
    });
    
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");
            var getval = JSON.parse(response.ExtraData);
            this.toastMessage.success('Payment Link saved Successfully')
            this.ngxSpinnerService.hide()

          }
          else {

            this.errorMessage = response.ReturnMessage;

            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.toastMessage.error(result)
              this.ngxSpinnerService.hide()

            });
          }

        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
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
   
    this.paymentDetailArray.push({
      "NEWPAYMENT": 1,
      "TranType": "Payment",
      "TranDate": new Date(),
      "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
      "ModeOfPayment": "CREDITCARD",
      "AuthenticationNumber":'',
      "AccountNumber": '',
      "AccountHolderName": '',
      "BankCode": '',
      "BankAccountNumber": '',
      "CardType": this.CardTypeData,
      "CardNumber": this.CardNo,
      "Adjudication": this.Adjudication,
      "TerminalId": this.TerminalId,
      "UTRDetails": '',
      "UPITransactionId" : '',
      "GLCode": this.GLCodeData,
      "EDCMachineType": this.ModeOfManualPayment,
      "HouseOfBank":  this.houseofBank
    })
    this.advancePaymentAmount += Number(this.Amount)

    console.log("Paymnet Object Mannual Payment ", this.paymentDetailArray)
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
    this.allowedPaymentMode = '',
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


        this.advancePaymentAmount += Number(this.Amount)

        this.paymentDetailArray.push({
          "NEWPAYMENT": 1,
          "TranType": "Payment",
          "TranDate": new Date(),
          "Amount": this.Amount == null || this.Amount == undefined ? 0.00 : this.Amount,
          "ModeOfPayment": "UPI",
          "AuthenticationNumber":'',
          "AccountNumber": '',
          "AccountHolderName": '',
          "BankCode": '',
          "BankAccountNumber": '',
          "CardType": '',
          "CardNumber": '',
          "Adjudication": '',
          "TerminalId": '',
          "UTRDetails": '',
          "UPITransactionId" : this.UPITransactionId,
      "EDCMachineType": this.ModeOfManualPayment,
         "GLCode": this.GLCodeData,
      "HouseOfBank":  this.houseofBank,
      
        })
        console.log("Paymnet Object Mannual Payment ", this.paymentDetailArray)
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
        this.allowedPaymentMode = '',
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
