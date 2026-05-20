import { Component, NgModule, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from "src/app/config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { MatDialog } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'uuid';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { RemarkListComponent } from '../../refund-order/remark-list/remark-list.component';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';


@Component({
  selector: 'app-sales-return-created',
  templateUrl: './sales-return-created.component.html',
  styleUrls: ['./sales-return-created.component.css']
})
export class SalesReturnCreatedComponent implements OnInit {

  @NgModule({
    imports: [
      RemarkListComponent,
    ],
  })

  currentDate: Date;
  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  invoiceDate: string | number | Date;
  companyObject: any;
  finalSelectedElements: any[] = [];
  InvoiceDocTypeData: any;
  LocationCode: any;
  params: any;
  errorMessage: string;
  popUpArray: any[] = [];
  hidePopup: boolean = true
  totalBaseAmount: number = 0;
  totalDiscountAmount: number = 0;
  totalNetAmount: number = 0;
  totalTaxAmount: number = 0;
  totalTaxableAmount: number = 0;
  SalesReturnGUID: any;
  RequestCode: string;
  SalesReturnCode: string;
  RefundGuid: string;
  caseGuid: any;
  caseId: string;
  SalesReturnDocType: string = ''
  retailCustomerCode: any;
  SalesReturnObject: any;
  isEdit: boolean = false;
  userName: string;
  // Refund Part
  RefundStatus: string
  RefundDocType: string
  CreatedDate : string
  submitClicked: boolean = false

  LocationDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceCode: string = ''
  InvoiceGuid: string = ''
  results:any[] = []

  // Financier Part
  ApprovalStatus: string;
  SalesReturnStatus: string;
  isFinancier: boolean = false;


  // PopUp Variables:-
  popUpArraySelectedIndexes: number[] =[];
  showOnlySelected= false
  selectedItemList: any[] = []
  ItemList: any[] = [];
  totalSelectedNetAmount = 0;
  totalSelectedBaseAmount = 0;
  totalSelectedDiscountAmount = 0;
  totalSelectedTaxAmount = 0;
  totalSelectedTaxableAmount = 0;
  MaterialCode : string;
  MaterialName: string;
  searchAmount: string;
  // File Upload
  isImageUpload= false;
  FileUploadList: any[] = [];

  // Remarks Part
  isRemarkUpload= false;
  RemarkLevel: number;
  RemarkUploadList: any[] = [] // Remark in request is object and in Approval is List
  ProcessTotalRecords: number =0;
  Spinner = false;

  // Payment Part:- 
  paymentDetailArray: any[] = []
  TotalPaymentAmount: number = 0;
  totalRefundAmount: number = 0;
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
  // Refund Part:- 
  RefundGUID: string
  RefundControl: string;
  RefundControlDD = ['Replacement', 'Refund']
  RefundReason: string
  RefundReasonDD: DropDownValue = DropDownValue.getBlankObject();
  // RefundReasonDD = ['Product Defective', 'Wrong Entry (Product mismatch/Price Mismatch/Customer details wrong,updation)', 'Customer Refused Order']
  StorageCondition: string;
  StorageConditionDD = ['Good', 'Defective']
  ifCreated = false
  ifGenerateEInvoice: boolean = false;
  isPostToSAP : boolean = false
  GSTRegistrationNo: string;
  // Print
  printTypeArray: any[] = ["Credit-Memo", "E-Invoice"];
  printTypeData:string;
  SignedQRCode: string;
  SAPSalesReturnCode: string;
  
  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,

    private activatedRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private route: Router,
    private reportService: ReportService,
    private dropdownDataService: DropdownDataService

  ) { }



  ngOnInit(): void {
    this.currentDate = new Date();
    this.params = this.activatedRoute.snapshot.queryParams;

    // Remark Part:- 
    this.RemarkLevel = 0


    if (Object.keys(this.params).length == 0) {
      // console.log("Params are ",this.params))
      this.toastMessage.warning("Access Denied")
      this.location.back()
    }
    else{
      if (this.params.customercode != null && this.params.customercode != undefined) {
        this.getCustomerObject()
      }
      else {
        this.toastMessage.error("Customer Details Not found")
      }
  
      if (this.params.locationcode != null && this.params.locationcode != undefined) {
        this.LocationCode = this.params.locationcode
        this.getLocationData()
      }
      else {
        this.toastMessage.error("Location Details not found")
      }
      if (this.params.salesreturnguid != null || this.params.salesreturnguid != undefined) {
        this.isEdit = true
        this.SalesReturnGUID = this.params.salesreturnguid
        // this.getSalesReturnRequestObject()
      }
      else {
        this.toastMessage.error("Sales Return Not Found")
        this.location.back()
      }

      const allowedParams = ['customercode', 'locationcode', 'salesreturnguid'];
      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }
    }
    this.onLocationSearch({ term: "", item: [] });
  }

  onRefundReasonSearch($event: { term: string; item: any[] } ) {
    let Reason = this.RefundReason
    // console.log("onRefundDocTypeSearch:- " , this.RefundDocType , "\n")
    this.dropdownDataService.fetchDropDownData(DropDownType.RefundReason, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
      RefundReason: ''
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log("Reason DD ", value )
          this.RefundReasonDD = value;
          // // Set the Refund Doc type
          // const refundType = this.RefundAgainstDD.Data.find(item =>item.Id == DocType)
          // if(refundType){
          //   this.RefundDocType = refundType.Id;
          //   this.RefundAgainst = refundType.TEXT;
          // }
        }
      },
      error: (err) => {
        this.RefundReasonDD = DropDownValue.getBlankObject();
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
              if (Array.isArray(data?.Customer)) {
                this.CustomerObject.push(data?.Customer[0])
              }
              else {
                this.CustomerObject.push(data?.Customer)
                this.errorMessage = "";
              }
              console.log("Customer Object ", this.CustomerObject)
              if (this.params.salesreturnguid != null || this.params.salesreturnguid != undefined) {
                this.isEdit = true
                this.SalesReturnGUID = this.params.salesreturnguid
                this.getSalesReturnRequestObject()
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
      "Value": this.params.locationcode == null || this.params.locationcode == undefined ? this.LocationCode : this.params.locationcode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("Location Object ",response )
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

  
  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationDD = value;
        }
      },
      error: (err) => {
        this.LocationDD = DropDownValue.getBlankObject();
      }
    });
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
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.totalNetAmount = parseFloat(this.totalNetAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
  }

  getSalesReturnRequestObject() {
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetSalesReturnRequestObject"
    })
    requestData.push({
      "Key": "SalesReturnGuid",
      "Value": this.params.salesreturnguid == null || this.params.salesreturnguid == undefined ? '': this.params.salesreturnguid
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)
            if (data.Totalrecords != "0") {
              console.log("Sales Return Object" , data)
              this.SalesReturnObject = data
              this.caseGuid = data?.CaseGuid
              this.caseId = data?.CaseID
              this.retailCustomerCode = data?.RetailCustomerCode
              this.SalesReturnDocType = data?.SalesReturnDocType
              this.ApprovalStatus = data?.ApprovalStatus
              this.SalesReturnStatus = data?.SalesReturnStatus
              this.RequestCode = data.RequestCode
              this.SalesReturnCode = data.SalesReturnCode
              this.SalesReturnCode == null || this.SalesReturnCode == undefined ? this.ifCreated = false : this.ifCreated = true
              console.log("Sales Return Code ", this.SalesReturnCode)
              this.CreatedDate= data.CreatedDate
              this.InvoiceCode = data.InvoiceCode
              this.InvoiceGuid = data.InvoiceGuid
              this.RefundControl = data.RefundControl
              this.RefundReason = data.RefundReason
              this.SignedQRCode = data.SignedQRCode
              this.SAPSalesReturnCode =data.SAPSalesReturnCode

              console.log("CustObj ",this.CustomerObject)
              if(this.CustomerObject[0].GSTRegistrationNo != null || this.CustomerObject[0].GSTRegistrationNo != undefined){
                this.GSTRegistrationNo = this.CustomerObject[0].GSTRegistrationNo
                if (this.ifCreated== true && (this.SignedQRCode == null || this.SignedQRCode== undefined)){
                  this.ifGenerateEInvoice = true
                }
              }

              if(this.SalesReturnStatus == 'CLOSED'){
                if ( this.SAPSalesReturnCode == null || this.SAPSalesReturnCode == undefined || this.SAPSalesReturnCode == ''){
                  this.isPostToSAP = true
                }
              }
              

              // Remark Part:-
              this.RemarkUploadList[0] = {
                RemarkLevel: 'Request Remark',
                RemarkDescription:data.SalesReturnRemark,
                RemarkDate: data.CreatedDate,
                isEdit: false
              };
              this.GetProcessObject()
              this.onRefundReasonSearch({ term: "", item: [] })

              if (Array.isArray(data?.SalesReturnDetail)) {
                this.finalSelectedElements = data?.SalesReturnDetail
              }
              else {
                this.finalSelectedElements.push(data?.SalesReturnDetail)
              }
              console.log("Reason ", this.finalSelectedElements)
              this.GetFileObject()
              this.TotalNetAmount()
            
              if( data?.SalesReturnStatus == "PENDING")
              {
                this.getApprovalSettingDetailObject()
              }
            }
            else {
              this.toastMessage.error("No records found")
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


  async getApprovalSettingDetailObject() {

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "SalesReturnApproval"
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Approval Sp", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
           console.log("Approval Object Response", response)
          if (response.ReturnCode == '0') {
            this.userName = glob.getLogedInUser().UserDetails.UserName;
            let extraDataResponse = JSON.parse(response?.ExtraData);
            if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName ) {
              let level = extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel
              this.RemarkLevel = parseInt(level.replace('L', ''));
              if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L3') {
                this.ApprovalStatus == 'APPROVED' && this.SalesReturnStatus == 'PENDING' ? this.isFinancier = true: this.isFinancier = false
                // this.onModeofPaymentSearch({ term: "", item: [] });
              } 
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

  SaveSalesReturn(){

  // if ( this.totalNetAmount> (this.totalRefundAmount+ 1) || this.totalNetAmount < (this.totalRefundAmount-1) ) {
  //   this.toastMessage.error("Refund Amount should match the Paid Amount");
  //   return
  // }

  this.showSpinner()
  let requestData = []
  requestData.push({
    "Key": "APIType",
    "Value": "SaveSalesReturn"
  })
  requestData.push({
    "Key": "SalesReturnGUID",
    "Value": this.SalesReturnGUID
  })
  requestData.push({
    "Key": "RequestCode",
    "Value": this.RequestCode
  })
  requestData.push({
    "Key": "CompanyCode",
    "Value": glob.getCompanyCode()
  })
  requestData.push({
    "Key": "SalesReturnDocType",
    "Value": this.SalesReturnDocType
  })
  requestData.push({
    "Key": "SalesReturnStatus",
    "Value": 'CLOSED'
  })
  requestData.push({
    "Key": "LocationCode",
    "Value": this.LocationCode
  })
  requestData.push({
    "Key": "CaseGuid",
    "Value": this.caseGuid == null || this.caseGuid == undefined ? "00000000-0000-0000-0000-000000000000" : this.caseGuid
  })
  requestData.push({
    "Key": "CaseId",
    "Value": this.caseId == null || this.caseId == undefined ? "" : this.caseId
  })
  requestData.push({
    "Key": "InvoiceGuid",
    "Value": this.InvoiceGuid
  })
  requestData.push({
    "Key": "InvoiceCode",
    "Value": this.InvoiceCode
  })
  requestData.push({
    "Key": "RetailCustomerCode",
    "Value": this.retailCustomerCode
  })
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
    "Key": "RefundControl",
    "Value": this.RefundControl == null || this.RefundControl == undefined ? '' : this.RefundControl
  });
  requestData.push({
    "Key": "RefundReason",
    "Value": this.RefundReason == null || this.RefundReason== undefined ? '' : this.RefundReason
  });
  requestData.push({
    "Key": "SalesReturnDetail",
    "Value": this.saveSalesReturnXML()
  });
   let remark = this.RemarkUploadList[this.RemarkLevel]?.RemarkDescription 
  requestData.push({
    "Key": "SalesReturnRemark",
    "Value": remark == null || remark== undefined ? "" : remark
  });
  const ShouldContinue = confirm("Are you sure? Do you want to continue")
  if (ShouldContinue == false ){
    return
  }
  
  if(this.submitClicked == true)
  {
    return;
  }
  this.submitClicked=true 
  
  let strRequestData = JSON.stringify(requestData);
  let contentRequest = {
    "content": strRequestData
  };
  console.log("Sales Created Before SP:- ", requestData)
  // TODO
  // return
  // this.ngxSpinnerService.show();
  this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
    {
      next: (value) => {
        this.hideSpinner()
        // this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.submitClicked = false;
          this.saveSalesReturnToSAP()
          this.toastMessage.success("Sales Return Created Successfully")
          // this.route.navigate(['/auth/' + glob.getCompanyCode() + '/sales-return-list']);
        }
        else {
              // console.log("Error Response: " , response)
              this.submitClicked = false;
              this.errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString( this.errorMessage , (error, result) => {
                const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
                console.log("Messages : " ,errorMessages)
                errorMessages.forEach((errorMessage) => {
                  // console.log("Error Message: " , error)
                  this.toastMessage.error(errorMessage.ERRORMESSAGE);
                });
              });  
        }
      },
      error: err => {
        this.ngxSpinnerService.hide();
        this.hideSpinner()
        this.submitClicked = false
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

  saveSalesReturnToSAP(){
    this.ngxSpinnerService.show()
    this.gsxService.saveSalesReturnToSAP(this.SalesReturnGUID).subscribe({
      next: (value: any) => {
        console.log("After Saving to SAP ",value) ;
        let data = JSON.parse(JSON.stringify(value));
        this.ngxSpinnerService.hide()
        
        if (data.code == '0') {
          this.toastMessage.success("Posted To SAP successfully!")
          window.location.reload(); // TODO 
          console.log("Data successful ",data)
        }
        else {
          if (data.message != null || data.message != undefined) {
            this.toastMessage.error(data.message, 'Error', { closeButton: true, disableTimeOut: true })
          }
        }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err)
      }
    })
  }

  saveSalesReturnXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.finalSelectedElements) {
      count += 1
      rawData.rows.push({
        "row": {
          "SalesReturnDetailGuid": item.SalesReturnDetailGuid == null || item.SalesReturnDetailGuid == undefined ? uuidv4() : item.SalesReturnDetailGuid,
          "SalesReturnGUID": this.SalesReturnGUID,
          "InvoiceGUID": item.InvoiceGUID ,
          "InvoiceDetailGuid": item.InvoiceDetailGuid,
          "ItemType": item.ItemType,
          "DivisionCode": item.DivisionCode == null || item.DivisionCode == undefined ? "" : item.DivisionCode,
          "SalesUOM": item.SalesUOM == null || item.SalesUOM == undefined ? "" : item.SalesUOM,
          "ItemNo": count,
          "OriginalItemNo": item.ItemNo == undefined || item.ItemNo == null ? 0 : item.ItemNo,
          "SerialNo": item.SerialNo == undefined || item.SerialNo == null ? "" : item.SerialNo,
          "ItemCode": item.ItemCode == undefined || item.ItemCode == null ? "" : item.ItemCode,
          "ItemDescription": item.ItemDescription == undefined || item.ItemDescription == null ? "" : item.ItemDescription,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
          "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
          "Quantity": item.Quantity == null || item.Quantity == undefined ? "0" : item.Quantity,
          "UnitPrice": item.UnitPrice,
          "BaseAmount": item.BaseAmount,
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
          "Batch": item.Batch == null || item.Batch == undefined ? "" : item.Batch,
          "StorageCondition": item.StorageCondition == null || item.StorageCondition == undefined ? "" : item.StorageCondition,
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
    
  TotalNetSalesReturnAmount() {
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
    this.totalTaxableAmount = parseFloat(this.totalTaxableAmount.toFixed(2));
    this.totalTaxAmount = parseFloat(this.totalTaxAmount.toFixed(2));
    this.totalNetAmount = parseFloat(this.totalNetAmount.toFixed(2));
    this.totalDiscountAmount = parseFloat(this.totalDiscountAmount.toFixed(2));
    this.totalBaseAmount = parseFloat(this.totalBaseAmount.toFixed(2));
  }

  deletePaymentitem(item) {
    this.totalRefundAmount -= item?.Amount
    let index = this.paymentDetailArray.indexOf(item)
    this.paymentDetailArray.splice(index, 1)
  }



  // Files Part 
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
      "Value": this.params.salesreturnguid
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("File Object" , response)
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
      "Value": 'SalesReturn'
    })
    requestData.push({
      "Key": "GUID",
      "Value": this.SalesReturnGUID
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
                    RemarkDescription: process.ApprovalRemark,
                    RemarkDate: new Date(process.CreatedDate),
                    isEdit: false
                  })
                }
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

  printDocuments(){
    console.log("Print ", this.printTypeData)
    this.printSalesReturn()
  }

  downloadServiceReport(reportType: String) {
    this.ngxSpinnerService.show()
    this.showSpinner()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetSalesReturnObject4Print",
    });
    PdfData.push({
      "Key": "SalesReturnGUID",
      "Value": this.SalesReturnGUID,
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
          this.hideSpinner()
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.ngxSpinnerService.hide()
        },
        error: err => {
          this.hideSpinner()
          console.log(err);
          this.ngxSpinnerService.hide()
          
        }
      });
  }

  printSalesReturn(){

    this.showSpinner()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetSalesReturnObject4Print",
    });
    PdfData.push({
      "Key": "SalesReturnGUID",
      "Value": this.SalesReturnGUID
    });
  
  
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    // console.log("Payment Report ", PdfData)
    let storepdf = contentRequest;
    this.ngxSpinnerService.show()
    this.reportService.downloadServiceReport('SALESRETURN',contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("Report response ", response)
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.hideSpinner()
          this.ngxSpinnerService.hide()
        },
        error: err => {
          console.log(err);
          this.hideSpinner()
          this.ngxSpinnerService.hide()
        }
      });
  }
  
  generateEInvoiceForCRN()
  {
    if(this.SalesReturnStatus != 'CLOSED'){
      this.toastMessage.error("No Sales Return Created Yet")
      return
    }
    if(this.GSTRegistrationNo == null || this.GSTRegistrationNo == undefined){
      this.toastMessage.error("No GST Registration No. found for this Customer!")
      return
    }
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    this.showSpinner()
    this.ngxSpinnerService.show()
    var data = {
      "SalesReturnGUID":this.SalesReturnGUID
    }
    let strContentRequest = JSON.stringify(data)
    let contentRequest = {
      "content": strContentRequest
    };
    
     ;
    this.gsxService.generateEInvoiceForCRN(contentRequest).subscribe({
      next:(value)=>{
        this.hideSpinner()
        console.log("Value ", value)
        let response = JSON.parse(value.toString());
        console.log("Response ", response)
        if (response.code == '0') {
          this.toastMessage.success(response.message, "Success", { closeButton: true, disableTimeOut: true })
          this.ngxSpinnerService.hide();
          window.location.reload() // TODO
        }
        else
        {
          this.toastMessage.error(response.message, "Error", { closeButton: true, disableTimeOut: true })
          this.ngxSpinnerService.hide();
        }

      },
      error:(Err)=>{
        this.ngxSpinnerService.hide();
        this.toastMessage.error(Err)
      }
    })
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