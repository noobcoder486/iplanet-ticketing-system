import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseDetail } from '../repair-process.metadata';
import * as glob from "../../../config/global";
import xml2js from 'xml2js';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { ObjPayment } from './payment.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {

  isPayment: boolean = false
  isCreatePaymentLink: boolean = false;
  isAddPayment: boolean = false 
  isPaymentLinkList: boolean = false 
  isShowPaymentLink: boolean = false 
  PaymentTypeVal: any = ['Payment']
  ModeofPayment: DropDownValue = DropDownValue.getBlankObject();
  CardTypeVal: any = ['Visa','Master Card']
  paymentviewlist: any [] = [] ;
  paymentLinkList: any[] = [];
  date = new Date();
  MOPValue = ""
  paymentForm: FormGroup;
  PaymentLink: FormGroup;
  GLCode: string = ''
  payment: ObjPayment
  errorMessage: any;
  TotalNetValue = ""
  PaidAmount=0
  PendingAmount=0
  houseofBank: string = '';

  ngOnChanges(changes: SimpleChanges): void{
    if(changes['repa'])
    {
      if(this.repa!= null && this.repa != undefined  ){
        if(this.payment == null)
        {
          this.payment = new ObjPayment();
        }
        this.payment.TotalNetAmount = this.repa?.QUOTE?.TotalNetAmount
        this.paymentviewlist=[];
        if(Array.isArray(this.repa?.PAYMENTLIST?.Payment))
        {
          for ( var item of this.repa?.PAYMENTLIST?.Payment)
          {
            this.paymentviewlist.push({
              "PaymentDocType" : item?.PaymentDocType,
              "AccountHolderName": item.AccountHolderName,
              "AccountNumber": item.AccountNumber,
              "UPITransactionId":item.UPITransactionId,
              "Adjudication": item.Adjudication,
              "Amount": item.Amount,
              "AuthenticationNumber": item.AuthenticationNumber,
              "BankAccountNo": item.BankAccountNo,
              "BankCode": item.BankCode,
              "CardNumber": item.CardNumber,
              "CardType": item.CardType,
              "CreatedBy": item.CreatedBy,
              "CreatedDate": item.CreatedDate,
              "ModeOfPayment": item.ModeOfPayment,
              "PaymentGUID": item.PaymentGUID,
              "TerminalId": item.TerminalId,
              "TranDate": item.TranDate,
              "TranType": item.TranType,
           })
          }

        }
        else
        {
          if(!(this.repa?.PAYMENTLIST?.Payment == undefined || this.repa?.PAYMENTLIST?.Payment == null))
          {
          var lstpaymentviewlist=[];
          lstpaymentviewlist.push(this.repa?.PAYMENTLIST?.Payment);
              this.paymentviewlist.push({
                  "AccountHolderName": lstpaymentviewlist[0]?.AccountHolderName,
                  "AccountNumber": lstpaymentviewlist[0]?.AccountNumber,
                  "Adjudication": lstpaymentviewlist[0]?.Adjudication,
                  "UPITransactionId":lstpaymentviewlist[0]?.UPITransactionId,
                  "Amount": lstpaymentviewlist[0]?.Amount,
                  "AuthenticationNumber": lstpaymentviewlist[0]?.AuthenticationNumber,
                  "BankAccountNo": lstpaymentviewlist[0]?.BankAccountNo,
                  "BankCode": lstpaymentviewlist[0]?.BankCode,
                  "CardNumber": lstpaymentviewlist[0]?.CardNumber,
                  "CardType": lstpaymentviewlist[0]?.CardType,
                  "CreatedBy": lstpaymentviewlist[0]?.CreatedBy,
                  "CreatedDate": lstpaymentviewlist[0]?.CreatedDate,
                  "ModeOfPayment": lstpaymentviewlist[0]?.ModeOfPayment,
                  "PaymentGUID": lstpaymentviewlist[0]?.PaymentGUID,
                  "TerminalId": lstpaymentviewlist[0]?.TerminalId,
                  "TranDate": lstpaymentviewlist[0]?.TranDate,
                  "TranType": lstpaymentviewlist[0]?.TranType,
              })
          }
      }
        this.CalculatePaidAmount();
        this.PaymentLink = this.formBuilder.group({
          Payable: [this.payment.TotalNetAmount - this.PaidAmount ]
        })

        if(Array.isArray(this.repa?.PaymentLinkList?.PaymentLink))
        {
          for(let item of this.repa?.PaymentLinkList?.PaymentLink){
            this.paymentLinkList.push({
              "PaymentLinkStatus": item.PaymentLinkStatus,
              "Amount": item.Amount,
              "PaymentLink": item.PaymentLink,
              "PaymentLinkGUID": item.PaymentLinkGUID,
              "PaymentGateway": item.PaymentGateway
            })
          }
        }else{
          var lstpaymentlinklist=[];
          lstpaymentlinklist.push(this.repa?.PaymentLinkList?.PaymentLink);
              this.paymentLinkList.push({
                "PaymentLinkStatus": lstpaymentlinklist[0]?.PaymentLinkStatus,
                "Amount": lstpaymentlinklist[0]?.Amount,
                "PaymentLink": lstpaymentlinklist[0]?.PaymentLink,
                "PaymentLinkGUID": lstpaymentlinklist[0]?.PaymentLinkGUID,
                "PaymentGateway": lstpaymentlinklist[0]?.PaymentGateway
              })
        }
        
      }
    }
  }

  CalculatePaidAmount()
  {
    this.PaidAmount=0
    for(let item of this.paymentviewlist)
    {
        if(item.TranType.toUpperCase()=="PAYMENT")
        {
            this.PaidAmount= parseFloat( this.PaidAmount.toString() )+parseFloat( item.Amount.toString())
        }
        else
        {
          this.PaidAmount= parseFloat(this.PaidAmount.toString())-parseFloat(item.Amount.toString())
        }
    }
    this.PendingAmount= this.payment.TotalNetAmount - this.PaidAmount
   

  }
  @Input() repa: CaseDetail;
  @Output() PaymentUpdated = new EventEmitter<any>();


  constructor(private formBuilder: FormBuilder,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.onModeofPaymentSearch({ term: "", item: [] });
    if(this.payment == null)
    {
      this.payment = new ObjPayment();
    }
    
    this.paymentForm = this.formBuilder.group({
      PaymentType: [null, Validators.required],
      PaymentDate: [null, Validators.required],
      MOPayment: [null, Validators.required],
      QuoteAmount: [null, Validators.required],
      AccountNo: [" "],
      AuthNo: [" "],
      CardType: [" "],
      UPITransactionId: [" "],
      Adjudication: [" "],
      TerminalId: [" "],
      RequestedAmt: [" "],
      AccountHolderName: [" "],
      CardNo: [" "],
      BankCode: [" "],
      BankAccountNo: [" "]
      
    });
    this.PaymentLink = this.formBuilder.group({
    
      Payable: [" "]
      
    });
    this.dataSet();
  }

  setfunction(){
    this.MOPValue = this.paymentForm.controls["MOPayment"].value
    console.log(this.ModeofPayment.Data)
    for(let item of this.ModeofPayment.Data)
    {
      if(item.Id == this.paymentForm.controls["MOPayment"].value)
      {
        this.GLCode = item.GLCode
        this.houseofBank = item.extraData
        break;
      }
    }
  }

  onReset() {
    this.paymentForm.reset();
    this.toaster.info('Form Reset')
  }
  
  addPaymentList() {
    if (this.isPayment == true) {
      // this.isPayment = false;
      this.isCreatePaymentLink = false;
      // this.isShowPaymentLink = false;
    } else {
      this.isPayment = true;
      this.isCreatePaymentLink = false;
      this.isShowPaymentLink = false;
    }
  }

  newGeneratePaymentLink(){
    if (this.isCreatePaymentLink == true) {
      this.isCreatePaymentLink = false;
    } else {
      this.isCreatePaymentLink = true;
    }
  }


  addNewPayment(){
    this.router.navigate(["/auth/" + glob.getCompanyCode() + "/advance-payment/"], {queryParams: {caseguid: this.repa.CaseGUID ,customercode: this.repa.RetailCustomerCode, locationcode: this.repa.LocationCode}});

    // if (this.isAddPayment == true) {
    //   this.isAddPayment = false;
    // } else {
    //   this.isAddPayment = true;
    // }
  }


  onSubmit() {
    const payval = this.paymentForm.value
    if(this.MOPValue != "CREDITCARD" )
    {
      if(payval.UPITransactionId == null || payval.UPITransactionId == undefined || payval.UPITransactionId == ' ')
      {
        this.toaster.error("Transaction Reference Number cannot be empty");
        return;
      }
    }
    let newPaymentGuid = uuidv4();
    let requestData = [];
    this.dynamicService.validateAllFormFields(this.paymentForm);
    var PaymentAMT = this.paymentForm.controls['QuoteAmount'].value
    var PayableAmount = parseInt(this.paymentForm.controls['QuoteAmount'].value)
    if(PayableAmount <= this.PendingAmount){
    if (this.paymentForm.valid) {
      requestData.push({
        "Key": "ApiType",
        "Value": "SavePayment"
      });
      requestData.push({
        "Key": "TranType",
        "Value": payval.PaymentType
      });
      requestData.push({
        "Key": "TranDate",
        "Value": payval.PaymentDate == null || payval.PaymentDate == undefined?new Date():payval.PaymentDate
      });
      requestData.push({
        "Key": "ModeOfPayment",
        "Value": payval.MOPayment
      });
      requestData.push({
        "Key": "UPITransactionId",
        "Value": payval.UPITransactionId
      });
      requestData.push({
        "Key": "GLCode",
        "Value": this.GLCode
      });
      requestData.push({
        "Key": "Amount",
        "Value": payval.QuoteAmount
      });
      requestData.push({
        "Key": "AccountNumber",
        "Value": payval.AccountNo
      });
      requestData.push({
        "Key": "AuthenticationNumber",
        "Value": payval.AuthNo
      });
      requestData.push({
        "Key": "CardType",
        "Value": payval.CardType
      });
      requestData.push({
        "Key": "CardNumber",
        "Value": payval.CardNo
      });
      requestData.push({
        "Key": "Adjudication",
        "Value": payval.Adjudication
      });
      requestData.push({
        "Key": "TerminalID",
        "Value": payval.TerminalId
      });
      requestData.push({
        "Key": "AccountHolderName",
        "Value": payval.AccountHolderName
      });
      requestData.push({
        "Key": "BankCode",
        "Value": payval.BankCode
      });
      requestData.push({
        "Key": "BankAccountNo",
        "Value": payval.BankAccountNo
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": this.repa.CaseGUID
      });
      requestData.push({
        "Key": "PaymentGUID",
        "Value": newPaymentGuid
      });
      requestData.push({
        "Key": "HouseofBank",
        "Value": this.houseofBank
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
              console.log("sucess");
              var getval = JSON.parse(response.ExtraData);
              this.PaymentUpdated.emit(getval)
              this.addNewPayment  ()
              this.toaster.success('Submitted Succesfully')

            }
            else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;

              });
            }
          },
          error: err => {
            console.log(err);
          }
        });
    }
     else {
      this.toaster.error("Fields Cannot be Empty")
    }
  }else {
    this.toaster.error("Payable Amount is more than Pending Amount")
  }
}

  validatePayableAmount(){
  
    var ValidPayableAmount = parseInt(this.PaymentLink.controls['Payable'].value)
    var NetAmount = this.payment.TotalNetAmount
    if(ValidPayableAmount <= NetAmount){
      this.toaster.success("Payable Amount is Validated")
      return true
    }else {
      this.toaster.error("Payable Amount is more than Pending Amount")
      return false
    }
  }
  

  createPaymentLink(){
    if (this.isShowPaymentLink == true) {
      this.isPayment = false;
      this.isShowPaymentLink = false;
    } else {
      this.isPayment = false;
      this.isShowPaymentLink = true;
    }
  }

    dataSet(){
      if(this.repa!= null && this.repa != undefined  ){
        this.payment.TotalNetAmount = this.repa?.QUOTE?.TotalNetAmount
        this.paymentviewlist=[];
        if(Array.isArray(this.repa?.PAYMENTLIST?.Payment))
        {
          for ( var item of this.repa?.PAYMENTLIST?.Payment)
          {
            this.paymentviewlist.push({
              "AccountHolderName": item.AccountHolderName,
              "AccountNumber": item.AccountNumber,
              "Adjudication": item.Adjudication,
              "Amount": item.Amount,
              "AuthenticationNumber": item.AuthenticationNumber,
              "BankAccountNo": item.BankAccountNo,
              "BankCode": item.BankCode,
              "CardNumber": item.CardNumber,
              "CardType": item.CardType,
              "CreatedBy": item.CreatedBy,
              "CreatedDate": item.CreatedDate,
              "ModeOfPayment": item.ModeOfPayment,
              "PaymentGUID": item.PaymentGUID,
              "TerminalId": item.TerminalId,
              "TranDate": item.TranDate,
              "TranType": item.TranType,
           })
          }

        }
        else
        {
          if(!(this.repa?.PAYMENTLIST?.Payment == undefined || this.repa?.PAYMENTLIST?.Payment == null))
          {

              var lstpaymentviewlist=[];
              this.paymentviewlist=[];
              lstpaymentviewlist.push(this.repa?.PAYMENTLIST?.Payment);
              this.paymentviewlist.push({
                  "AccountHolderName": lstpaymentviewlist[0]?.AccountHolderName,
                  "AccountNumber": lstpaymentviewlist[0]?.AccountNumber,
                  "Adjudication": lstpaymentviewlist[0]?.Adjudication,
                  "Amount": lstpaymentviewlist[0]?.Amount,
                  "AuthenticationNumber": lstpaymentviewlist[0]?.AuthenticationNumber,
                  "BankAccountNo": lstpaymentviewlist[0]?.BankAccountNo,
                  "BankCode": lstpaymentviewlist[0]?.BankCode,
                  "CardNumber": lstpaymentviewlist[0]?.CardNumber,
                  "CardType": lstpaymentviewlist[0]?.CardType,
                  "CreatedBy": lstpaymentviewlist[0]?.CreatedBy,
                  "CreatedDate": lstpaymentviewlist[0]?.CreatedDate,
                  "ModeOfPayment": lstpaymentviewlist[0]?.ModeOfPayment,
                  "GLCode":lstpaymentviewlist[0]?.GLCode,
                  "PaymentGUID": lstpaymentviewlist[0]?.PaymentGUID,
                  "TerminalId": lstpaymentviewlist[0]?.TerminalId,
                  "TranDate": lstpaymentviewlist[0]?.TranDate,
                  "TranType": lstpaymentviewlist[0]?.TranType,
              })
            }
        }
         ;
        this.CalculatePaidAmount();
        this.PaymentLink = this.formBuilder.group({
          Payable: [this.payment.TotalNetAmount - this.PaidAmount ==undefined||this.PaidAmount==null ?0 :this.PaidAmount ]
        })
      }
      
    }

    newPaymentLink = ''
   newPaymentLinkGUID = uuidv4();
    generatePaymentLink() {
    
      this.spinner.show()
        if(this.validatePayableAmount()){
          let requestData 
        requestData = {
          "CaseGUID":this.repa?.CaseGUID,
          "FirstName":this.repa?.CUSTOMER?.FirstName,
          "LastName":this.repa?.CUSTOMER?.LastName,
          "MobileNo":this.repa?.CUSTOMER?.MobileNo,
          "EmailID":this.repa?.CUSTOMER?.EmailID,
          "CaseID": 'Payment For CaseID:'+this.repa?.CaseId,
          "PaymentLinkGuid":    this.newPaymentLinkGUID,
          "PayableAmount": parseFloat(this.PaymentLink.controls["Payable"].value) * 100,
          "Description": this.repa?.productDescription
      }
      
        let strRequestData = JSON.stringify(requestData);
        console.log(strRequestData);
        let contentRequest = {
          "content": strRequestData
        };
        ;
        this.dynamicService.generatePaymentLink(contentRequest).subscribe(
          {
            next: (value) => {
              
              let response = JSON.parse(value.toString());
  
              if (response.RESPONSE_CODE == 1) {
                console.log("sucess");
                this.newPaymentLink = response.PAYMENT_URL
                this.toaster.success("Payment Link Generate Sucessfully")
                this.savePaymentLink()
                this.spinner.hide()
              }
              else {
                this.spinner.hide()
                this.errorMessage = response.RESPONSE_MESSAGE;
                  this.toaster.error(this.errorMessage) 
              }
  
            },
            error: err => {
               
              console.log(err);
              this.spinner.hide()
            }
          });
        }else{
          this.spinner.hide()
        }
      
    }


    savePaymentLink() {
      this.spinner.show()

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
        "Value":  this.newPaymentLinkGUID
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": this.repa?.CaseGUID
      });
      requestData.push({
        "Key": "PaymentLink",
        "Value": this.newPaymentLink
      });
      requestData.push({
        "Key": "Amount",
        "Value": this.PaymentLink.controls["Payable"].value
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
      ;
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {

            let response = JSON.parse(value.toString());

            if (response.ReturnCode == '0') {
              console.log("sucess");
              var getval = JSON.parse(response.ExtraData);
              this.toaster.success('Payment Link Save Successfully')
              this.spinner.hide()

            }
            else {

              this.errorMessage = response.ReturnMessage;

              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.toaster.error(result)
                this.spinner.hide()

              });
            }

          },
          error: err => {
            console.log(err);
            this.spinner.hide()

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

}