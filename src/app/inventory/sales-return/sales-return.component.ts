import { Component, NgModule, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from "../../config/global";
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
import { RemarkListComponent } from '../refund-order/remark-list/remark-list.component';


@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.css']
})
export class SalesReturnComponent implements OnInit {

  @NgModule({
    imports: [
      RemarkListComponent,
    ],
  })

  currentDate: Date;
  CustomerObject: any[] = []
  LocationObject: any[] = []
  typeSelected = 'ball-clip-rotate';
  SAPSOCode: string = "";
  SAPDeliveryCode: string = "";
  SAPInvoiceCode: string = "";
  DeliveryUpdateSuccess: boolean = false;
  PickingSuccess: boolean = false;
  PGISuccess: boolean = false;
  SerialUpdate: boolean = false;
  ETag: string = "";
  sapinvoiceGUID: any;
  invoiceDate: string | number | Date;
  companyObject: any;
  finalSelectedElements: any[] = [];
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
  caseGuid: any;
  caseId: string;
  SalesReturnDocType: string = ''
  retailCustomerCode: any;
  SalesReturnObject: any;
  isEdit: boolean = false;
  approverUser: string = '';
  isnotApprover: boolean = true;
  userName: string;

  LocationDD: DropDownValue = DropDownValue.getBlankObject();
  InvoiceCode: string = ''
  InvoiceGuid: string = ''
  results:any[] = []
  ApprovalStatus : string;
  SalesReturnStatus : string;
  isApproverL1: boolean = false;
  isApproverL2: boolean = false;
  CreatedDate: string

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

   // Refund Part:- 
   RefundGUID: string
   RefundControl: string;
   RefundControlDD = ['Replacement', 'Refund']
   RefundReason: string
   RefundReasonDD: DropDownValue = DropDownValue.getBlankObject();
   // RefundReasonDD = ['Product Defective', 'Wrong Entry (Product mismatch/Price Mismatch/Customer details wrong,updation)', 'Customer Refused Order']
   StorageCondition: string;
   StorageConditionDD = ['Good', 'Defective']
   submitClicked= false 


  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private route: Router,
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
        this.getSalesReturnRequestObject()
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
    // this.getApprovalSettingDetailObject()
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
            // console.log("Customer Obkect ", response)
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              if (Array.isArray(data?.Customer)) {
                this.CustomerObject.push(data?.Customer[0])
              }
              else {
                this.CustomerObject.push(data?.Customer)
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
              this.caseId = data?.caseID
              this.retailCustomerCode = data?.RetailCustomerCode
              this.SalesReturnDocType = data?.SalesReturnDocType
              this.ApprovalStatus = data?.ApprovalStatus
              this.SalesReturnStatus = data?.SalesReturnStatus
              this.RequestCode = data.RequestCode
              this.InvoiceCode = data.InvoiceCode
              this.InvoiceGuid = data.InvoiceGuid
              this.CreatedDate= data.CreatedDate
              this.RefundControl = data.RefundControl
              this.RefundReason = data.RefundReason

              // Remark Part:-
              this.RemarkUploadList[0] = {
                RemarkLevel: 'Request Remark',
                RemarkDescription:data.SalesReturnRemark,
                RemarkDate: data.CreatedDate,
                isEdit: false
              };
              this.GetProcessObject()


              if (Array.isArray(data?.SalesReturnDetail)) {
                this.finalSelectedElements = data?.SalesReturnDetail
              }
              else {
                this.finalSelectedElements.push(data?.SalesReturnDetail)
              }
              this.GetFileObject()
              this.TotalNetAmount()
              this.onRefundReasonSearch({ term: "", item: [] })
              if(this.SalesReturnObject.ApprovalStatus == "SENT FOR APPROVAL" || this.SalesReturnObject.ApprovalStatus == "PARTIALLY APPROVED")
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

  SalesReturnApproveReject(status){

    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "RequestStatusChange"
    });
    requestData.push({
      "Key": "SalesReturnGUID",
      "Value": this.SalesReturnGUID
    });
    // L1 can Accept or Reject in ApprovalStatus only 
    if ( this.isApproverL1 == true ) {
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": status == 'APPROVED' ? 'PARTIALLY APPROVED' : 'REJECTED'
      })
      requestData.push({
        "Key": "Status",
        "Value": 'NA'  
      })
    } 
    // L2 can Accept or Reject in both ApprovalStatus and SalesReturnFinal
    if ( this.isApproverL2 == true ) {
      requestData.push({
        "Key": "ApprovalStatus",
        "Value": status 
      })
      requestData.push({
        "Key": "Status",
        "Value": status == 'APPROVED' ? 'PENDING' : 'NA'  
      })
    } 
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
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Changing Status SP:- ", requestData)
    // // TODO
    // this.SaveProcessApprovalStatus(status);
    // return
    this.showSpinner()
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
            this.ngxSpinnerService.hide()
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.submitClicked= false 
              // console.log("Status Change Object:- ", data)
              this.ApprovalStatus = data.ApprovalStatus
              this.SaveProcessApprovalStatus(status);
            }
            else {
              // console.log("Error Response: " , response)
              this.hideSpinner()
              this.submitClicked= false 
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
            this.hideSpinner()
            this.ngxSpinnerService.hide()
            this.submitClicked= false 
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
        
      }
    );
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
    // console.log("Before Approval Sp", requestData)
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
              console.log("Remarl Level ", this.RemarkLevel)
              if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L1') {
                this.ApprovalStatus == 'SENT FOR APPROVAL' ? this.isnotApprover = false: this.isnotApprover = true
                this.isApproverL1 = true
              } 
              else if ( extraDataResponse?.ApprovalSettingDetail?.ApprovalLevel == 'L2') {
                this.ApprovalStatus == 'PARTIALLY APPROVED' ? this.isnotApprover = false : this.isnotApprover = true
                this.isApproverL2 = true
              }
              // this.ProcessTotalRecords== 0 ? this.CheckRemarks(level) :''

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
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("XML is:- ", xml)
    return xml;
  }

    
  SaveProcessApprovalStatus(status){
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveProcessApprovalStatus"
    });
    requestData.push({
      "Key": "ProcessType",
      "Value": 'SalesReturn'
    });
    requestData.push({
      "Key": "GUID",
      "Value": this.SalesReturnGUID
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
      "Value": remark == null || remark== undefined ? "" : remark
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Changing Status SP:- ", requestData)
    // // TODO
    // this.SaveSalesReturn()
    // return
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
            this.hideSpinner()
            this.ngxSpinnerService.hide()
            this.submitClicked= false 
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("After Process ", response)
              this.toastMessage.success("Status Changed Succesfully");
              this.route.navigate(['/auth/' + glob.getCompanyCode() + '/sales-return-list']);
            }
            else {
              console.log("Error Response: " , response)
              this.submitClicked= false 
              this.hideSpinner()
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
            this.hideSpinner()
            this.ngxSpinnerService.hide();
            this.submitClicked= false 
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
  
  // GetFileObject(){
  //   let requestData = []
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "GetRefundAttachmentObject"
  //   })
  //   requestData.push({
  //     "Key": "SalesReturnGUID",
  //     "Value": this.params.salesreturnguid
  //   })
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         let response = JSON.parse(value.toString());
  //         // console.log("File Object" , response)
  //         if (response.ReturnCode == '0') {
  //           if (response.Totalrecords != "0") {
  //             let data = JSON.parse(response.ExtraData)
  //             console.log("Sales Return File Object" , data)
  //             if(Array.isArray(data?.AttachmentRow))
  //             {
  //               this.FileUploadList = data?.AttachmentRow
  //             }
  //             else{
  //               this.FileUploadList.push(data?.AttachmentRow)
  //             }
  //             // console.log("Sales Return File Object" , this.FileUploadList)
  //           }
  //           else {
  //             this.toastMessage.error("No Files found")
  //           }
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


  savePaymentForSalesXml() {
    let rawData = {
      "rows": []
    }
    // console.log("Selected Items List:- ", this.SelectItemsList)
    let count = 0;
    // console.log("Payment List", this.SelectItemsList, "\nSelected Payments:- ", this.paymentDetailArray)
    for (let item of this.finalSelectedElements) {
      count += 1
      // console.log("item ", item)
      rawData.rows.push({
        "row": {
          "RefundDetailGUID": item.RefundDetailGUID!= null || item.RefundDetailGUID!= undefined? item.RefundDetailGUID : uuidv4(),
          "RefundGUID":  this.RefundGUID,
          "SalesReturnGUID" : this.SalesReturnGUID,
          "PaymentGUID": uuidv4(),
          // remove this when PaymentHeader, PaymentDetail Table is used instead of Payment Table ie Paymnet Table is migrated into Payment Header and Payment Detail Table
          // ***********************************************************************************************************************************************
          "PaymentDetailGUID": '00000000-0000-0000-0000-000000000000',  
          // ***********************************************************************************************************************************************

          "ModeOfPayment": '',
          "Amount": this.totalNetAmount,
          "AcountNumber": '',
          "AuthenticationNumber": '',
          "CardType": '',
          "CardNumber": '',
          "Adjudication":'',
          "TranType": 'SalesReturn',
          "TranDate": new Date(),
          "TerminalId": '',
          "AcountHolderName": '',
          "BanckCode": '',
          "BankAcountNumber": '',
          "GLCode": '',
          "isDeleted": 0
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Payment xml", rawData);
    return xml;
  }


}