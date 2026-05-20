import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { CaseDetail } from '../../transaction/repair-process/repair-process.metadata';
import { Observable } from 'rxjs';
import * as glob from "../../config/global";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImagepopupComponent } from './imagepopup/imagepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import xml2js from "xml2js";


@Component({
  selector: 'app-cancellation-view',
  templateUrl: './cancellation-view.component.html',
  styleUrls: ['./cancellation-view.component.css']
})
export class CancellationViewComponent implements OnInit {
  approverObject: any[] = [];
  isPartOrderApprover: boolean = false;
  isReplacementApprover: boolean = false;
  partOrderRemark: string = '';
  isTimelineOpen: boolean = false;
  partOrderList: any[] = [];
  errorMessage: String;
  cancelReason: string;
  repairReason: string;

  
  QuoteResetReason : any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private dialog: MatDialog,


  ) { }

  caseGUID: any;
  objCaseDetail: CaseDetail;
  objCaseDetailObServable: Observable<CaseDetail>;
  private imageExtensions = ['jpg', 'jpeg', 'png'];
  hidePopup: boolean = true
  hideConfirmpopUp: boolean = true;
  isCancellationApprover: boolean = false
  hideCancelpopup: boolean = true;
  ApprovalCommand: string = ""

  CustomerConfirmationNotes: any;

  @Input() repa;

  CancelFlag: any;

  //Boolean for show RP
  isShowQuote: boolean = false;
  isShowPartOrderObj: boolean = false
  isShowRepairParts: boolean = false;
  isShowInvoice: boolean = false;
  isShowNotes: boolean = false;
  isShowRFP: boolean = false;
  isShowVerification: boolean = false;
  isattachmentShow: boolean = false;
  imageURL: string = ""

  ngOnInit(): void {
    this.caseGUID = this.activatedRoute.snapshot.queryParams.guid;
    this.getRepair();
  }

  reapairList: any[] = []
  notesList: any[] = []
  invoiceList: any[] = []
  quoteList: any[] = []
  RFPList: any[] = [];
  verificationList: any[] = [];
  attachmentList: any[] = [];


  getRepair() {
    this.imageURL = glob.GLOBALVARIABLE.SERVER_LINK;
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobObject"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.caseGUID,
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == '0') {
          ;
          response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
          this.objCaseDetailObServable = response['ExtraDataJSON'];
          this.objCaseDetail = response['ExtraDataJSON'];

          this.objCaseDetail = Object.assign({}, this.objCaseDetail);


          //Repair List
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {


            if (this.objCaseDetail?.REPAIR?.REPAIRLIST?.REPAIRDETAIL != null || this.objCaseDetail?.REPAIR?.REPAIRLIST?.REPAIRDETAIL != undefined) {
              this.isShowRepairParts = true;

              if (Array.isArray(this.objCaseDetail?.REPAIR?.REPAIRLIST?.REPAIRDETAIL)) {
                this.reapairList = this.objCaseDetail?.REPAIR?.REPAIRLIST?.REPAIRDETAIL

              }
              else {
                this.reapairList.push(this.objCaseDetail?.REPAIR?.REPAIRLIST?.REPAIRDETAIL)
              }
            }
          }

          //Quote
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {
            if (this.objCaseDetail?.QUOTE?.QUOTEDETAILS.QuoteItem != null || this.objCaseDetail?.QUOTE?.QUOTEDETAILS.QuoteItem != undefined) {
              this.isShowQuote = true

              if (Array.isArray(this.objCaseDetail?.QUOTE?.QUOTEDETAILS.QuoteItem)) {
                this.quoteList = this.objCaseDetail?.QUOTE?.QUOTEDETAILS.QuoteItem
              }
              else {
                this.quoteList.push(this.objCaseDetail?.QUOTE.QUOTEDETAILS.QuoteItem)
              }
            }
          }

          //Notes 
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {
            if (this.objCaseDetail?.NOTESLIST?.Notes != null || this.objCaseDetail?.NOTESLIST?.Notes != undefined) {
              this.isShowNotes = true
              if (Array.isArray(this.objCaseDetail?.NOTESLIST?.Notes)) {
                for (let item of this.objCaseDetail?.NOTESLIST?.Notes) {
                  this.notesList = item
                }
              }
              else {
                this.notesList.push(this.objCaseDetail?.NOTESLIST.Notes)
              }
            }
          }

          // Invoice 
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {
            if (this.objCaseDetail?.INVOICE?.INVOICEDETAILS?.InvoiceItem != null || this.objCaseDetail?.INVOICE?.INVOICEDETAILS?.InvoiceItem != undefined) {
              this.isShowInvoice = true;

              if (Array.isArray(this.objCaseDetail?.INVOICE?.INVOICEDETAILS?.InvoiceItem)) {
                for (let item of this.objCaseDetail?.INVOICE?.INVOICEDETAILS?.InvoiceItem) {
                  this.invoiceList = item
                }
              }
              else {
                this.invoiceList.push(this.objCaseDetail?.INVOICE?.INVOICEDETAILS?.InvoiceItem)
              }
            }
          }

          //RFP
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {
            if (this.objCaseDetail.RFP != null || this.objCaseDetail.RFP != undefined) {
              this.isShowRFP = true;

              if (Array.isArray(this.objCaseDetail.RFP)) {
                for (let item of this.objCaseDetail.RFP) {
                  this.RFPList = item
                }
              }
              else {
                this.RFPList.push(this.objCaseDetail.RFP)
              }
            }
          }
          ;
          //Attachment
          if (this.objCaseDetail != null && this.objCaseDetail != undefined) {
            if (this.objCaseDetail?.JOBATTACHMENT?.ATTACHMENT != null && this.objCaseDetail?.JOBATTACHMENT?.ATTACHMENT != undefined) {
              this.isattachmentShow = true
              if (Array.isArray(this.objCaseDetail?.JOBATTACHMENT?.ATTACHMENT)) {
                this.attachmentList = this.objCaseDetail?.JOBATTACHMENT?.ATTACHMENT
              }
              else {
                this.attachmentList.push(this.objCaseDetail?.JOBATTACHMENT?.ATTACHMENT)
              }
              this.attachmentList.forEach(item => {
                const fileExtension = item.AttachmentFile.split('.').pop()?.toLowerCase();
                if (fileExtension && this.imageExtensions.includes(fileExtension)) {
                  item.src = glob.GLOBALVARIABLE.SERVER_LINK + item?.AttachmentFile;
                }
                else {
                  item.src = 'assets/images/tick.png';
                }
              })
            }
          }

          // this.FlagCheck(); 
        }
      },
      error: err => {
        console.log(err);
      }
    }
    );
  }


  openFile(item) {
    var url = glob.GLOBALVARIABLE.SERVER_LINK + item.AttachmentFile
    return url
  }




  isEstimationReject: boolean = false;
  isEstimationPrepaid: boolean = false;
  isEstimationPending: boolean = false;
  isSerialNoAproval: boolean = false;


  //Confirm cancel function
  SubmitRequest() {

    // if (this.ApprovalCommand == 'CANCELLATION_APPROVED' || this.ApprovalCommand == 'CANCELLATION_REJECTED') {
    //   this.SubmitCancellationRequest(this.ApprovalCommand)
    // }

  }


  toggleTimeline() {
    this.isTimelineOpen = !this.isTimelineOpen;
  }

  viewImage(item) {
    this.dialog.open(ImagepopupComponent, {
      data: { Imagesrc: item.src }
    });
  }


  saveResetRepair() {

    if (this.repairReason == null || this.repairReason == undefined || this.repairReason == '') {
      this.toastMessage.error("Please enter the reason");
      return;
    }

    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "ResetRepair",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CaseGuid",
      Value: this.caseGUID,
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("res", contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode === "0") {
          this.toastMessage.success("Submitted Successfully");

        } else {
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            response["errorMessageJson"] = result;
            this.handleError(response);
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.toastMessage.error("An error occurred while submitting the form", "Error");
      },
    });
  }

  saveCancelJob() {

    if (this.cancelReason == null || this.cancelReason == undefined || this.cancelReason == '') {
      this.toastMessage.error("Please enter the reason");
      return;
    }

    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "CancelJob",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CaseGUID",
      Value: this.caseGUID,
    });
    requestData.push({
      Key: "CancellationReason",
      Value: this.cancelReason,
    });
 
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode === '0') {
            this.toastMessage.success("Submitted Successfully");

          } else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });
          }
        },
        error: err => {
          console.error(err);
        }
      });
  }

  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
    error.forEach( err => {
      this.toastMessage.error("Error:- ", err)
    })
  }
   


    //Reset Quote 
       
     ResetQuote(){
      
      this.ngxSpinnerService.show()
       const IsConfirm = confirm("Are You Sure? want to Reset The Quote")
       if(!IsConfirm){
        return
       }
  
      if(this.activatedRoute.snapshot.queryParams.guid == null || this.activatedRoute.snapshot.queryParams.guid ==undefined || this.activatedRoute.snapshot.queryParams.guid ==''){
        this.toastMessage.error('Guid Cannot be empty!');
        return
      }
        
      // if(this.QuoteResetReason == null || this.QuoteResetReason == undefined || this.QuoteResetReason == '' ){
      //     this.toastMessage.error('Reason Cannot be empty!');
      //   return
      // }
  
      let requestData = [];
      requestData.push({
        Key: "ApiType",
        Value: "ResetQuotation",
      });
      requestData.push({
        Key: "CompanyCode",
        Value: glob.getCompanyCode(),
      });
      requestData.push({
        Key: "CaseGuid",
        Value: this.activatedRoute.snapshot.queryParams.guid
      });
        requestData.push({
           Key: "ResetReason",
           Value: ''
         });
     
      // requestData.push({
      //   Key: "Remarks",
      //   Value: this.QuoteResetReason == null || this.QuoteResetReason == undefined ? '' : this.QuoteResetReason
      // });
  
  
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
           
      console.log('Resest Quote contentRequest' , contentRequest);
     
      
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
  
            this.toastMessage.success("Submitted Successfully");
              this.ngxSpinnerService.hide()
          } else {

            console.log('response.ReturnMessage' , response.ReturnMessage);
              this.toastMessage.error("Something Went Wrong!" ,response.ReturnMessage);
            // this.errorMessage = response.ReturnMessage;
            // const parser = new xml2js.Parser({ strict: false, trim: true });
            // parser.parseString(response.ErrorMessage, (err, result) => {
            //   response["errorMessageJson"] = result;
            //   this.handleError(response);
            // });
            // this.ngxSpinnerService.hide()
          }
        },
        error: (err) => {
        
          console.error(err);
          this.toastMessage.error("An error occurred while Resetting the Quote", "Error");
          this.ngxSpinnerService.hide()
        },
      });
     }

}
