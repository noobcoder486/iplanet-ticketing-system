import { Component, Input, OnInit, SimpleChanges, EventEmitter , Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { v4 as uuidv4 } from 'uuid';
import { HandOverData } from './hand-over.metadata';
import { CaseDetail } from '../repair-process.metadata';
import * as glob from "../../../config/global";
import xml2js from 'xml2js';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';


@Component({
  selector: 'app-hand-over',
  templateUrl: './hand-over.component.html',
  styleUrls: ['./hand-over.component.css']
})
export class HandOverComponent implements OnInit {

  errorMessage: any;
  isHandOver: boolean = false;
  isAuthPersonSignature : boolean 
  isCustomerSignature : boolean
  HandOverList: any = ['Release']
  HandOverViewList: any [] = []
  HandOverLists: any [] = []
  InputMode=""
  SignatureList: any [] = []
  AuthorisedPersonSignature
  dictData = []
  controlName = ''
  answer = ''
  dictArr = []
  AuthPersonSignature
  CustomerSignature


   // GSX Handover 
   selectedpartlist: any[] = [];
   GSXRepairStatus: String;
   JobStatus: String;
   newrepairGuid: String;
   GSXCode: string;
   rplist: any[] = [];
   compIssueForm: FormGroup;

   ReferralName : any;
   ReferralMobileNo:any;
   ReferralDetailsList : any[] = []

   ContractCode:any
   IsContractApplicable:boolean=false;
   AmcTypeMasterDetailsList: any[] = [];

   TradeinDD: DropDownValue = DropDownValue.getBlankObject();
   Tradein: any;


  ngOnChanges(changes: SimpleChanges): void{
    
    if(changes['repa'])
    {
      console.log('repa from handover' , this.repa)
        if(this.repa!= null && this.repa != undefined  ){
        
          this.HandOverViewList = [];
          this.HandOverLists = [];
          this.HandOverLists.push(this.repa.HANDOVER)
          if(Array.isArray(this.HandOverLists))
          {
            for ( var item of this.HandOverLists)
            {
              this.HandOverViewList.push({
                "HandOverCode":   item?.HandOverCode,
                "HandOverStatus": item?.HandOverStatus,
                "Remark": item?.Remark,
                "CreatedBy": item?.CreatedBy,
                "CreatedDate":item?.CreatedDate,
              })
            }
          }
        }
      }{}
      if(changes['Signature']){
        this.isCustomerSignature = true
        this.CustomerSignature  = this.Signature // "http://carecrm.iplanet.one/nitcgsxapi/" + this.Signature

      }
      if(changes['AuthPerson']){
        this.isAuthPersonSignature = true
        this.AuthPersonSignature  = this.AuthPerson //  "http://carecrm.iplanet.one/nitcgsxapi/"+this.AuthPerson

      }

      // GSX Handover 
      if (changes['repa']) {
        if (this.repa?.REPAIR != null && this.repa?.REPAIR != undefined) {
          console.log("Repa *******************  ", this.repa)
          this.JobStatus = this.repa?.JobStatus
          this.newrepairGuid = this.repa?.REPAIR.RepairGUID
          this.GSXRepairStatus = this.repa?.REPAIR.GSXRepairStatus;
          var order = Math.max(...this.selectedpartlist.map(o => o.order), 0);
          var rowno = Math.max(...this.selectedpartlist.map(o => o.rowno, 0));
          order = order == Infinity ? 1 : order
          rowno = rowno == -Infinity ? 1 : rowno + 1
          var lstRepairList = [];
          if (Array.isArray(this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL)) {
            for (let item of this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL) {
              lstRepairList.push(item)
            }
          }
          else {
            lstRepairList.push(this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL);
          }
          this.selectedpartlist = []
          for (let item of lstRepairList) {

            var objPart = this.getPartObject(item, "DB");
            objPart.rowno = rowno
            objPart.order = order + 1
            objPart.order = order + 1
            objPart.priority = order + 1
            this.selectedpartlist.push(objPart);


            var formcontrolname = 'component' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ComponenyCode, Validators.required));
            formcontrolname = 'issues' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.IssueCode, Validators.required));
            formcontrolname = 'reproducibility' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ReproducibilityCode, Validators.required));
            formcontrolname = 'coverageOption' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.CoverageOption, Validators.required));
            formcontrolname = 'IsConsignmentStockUsed' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ConsignmentStockUsed));
            order = order + 1;
            rowno = rowno + 1
          }
        }

      }

    }

 

  addHandOver() {
    if (this.isHandOver == true) {
      this.isHandOver = false;
    } else {
      this.isHandOver = true;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private gsxService : GsxService,
    private spinner: NgxSpinnerService,
   private activatedRoute: ActivatedRoute,
          private dropdownDataService: DropdownDataService,

   
  ) { }

  handoverForm: FormGroup;
  handover: HandOverData

  ngOnInit(): void {
    this.isAuthPersonSignature = false 
    this.isCustomerSignature = false 

    this.handover = new HandOverData();
    this.handoverForm = this.formBuilder.group({
      HandOverDate:   [null, [Validators.required]],
      HandOverRemark: [null, [Validators.required]],
      HandOverStatus: [null, [Validators.required]],
    });
    this.Checklist_Master()
    if(this.repa!= null && this.repa != undefined  ){
      let currentDate = new Date()
      if ( this.repa?.JobType == 'SNR'){
        this.handoverForm.controls['HandOverStatus'].setValue("Release");
        this.handoverForm.controls['HandOverDate'].setValue(currentDate);
        this.handoverForm.controls['HandOverRemark'].setValue(this.repa.RFP.Remark);
      }
      
      if (this.repa?.JOBATTACHMENT?.ATTACHMENT != null && this.repa?.JOBATTACHMENT?.ATTACHMENT != undefined && this.repa.TableReplacement =='YES' ) {
        let Signature = this.repa?.JOBATTACHMENT?.ATTACHMENT.find(item => item.AttachmentOriginType == 'JOBCREATION' && item.AttachmentType == 'SIGNATURE')
        if(Signature?.AttachmentFile){
          this.isCustomerSignature = true
          this.CustomerSignature  = Signature.AttachmentFile
        }
        if( !Signature?.AttachmentFile ){
          this.toaster.warning("Customer Signature is missing, kindly add manually!")
        }
      }
    }
       
    this.ContractCode = this.repa?.ContractCode
     
    this.GetAmcTypeMasterDetailsList()
        this.onTradeinSearch({ term: "", items: [] });

  }
  @Input() Signature
  @Input() AuthPerson
  @Input() repa: CaseDetail;
  @Output() HanOverUpdated = new EventEmitter<any>();
  @Output() AddSignature = new EventEmitter<any>();


  validateHandOver(){
      
     if (this.activatedRoute.snapshot.queryParams.tc == null || this.activatedRoute.snapshot.queryParams.tc == undefined ||  this.activatedRoute.snapshot.queryParams.tc == '' ) {
      this.toaster.error('Cannot Proceed For HandOver without Token code  ')
      return;
    }
    if (this.activatedRoute.snapshot.queryParams.vp != 'CPR') {
       this.toaster.error('Please Select Visit Purpose as COLLECTION  For Handover while  Token Selection ')
      return;
    }

    if(this.Tradein == null || this.Tradein == undefined ||  this.Tradein == '' ){
       this.toaster.error('Please Select Tradein')
      return;
    }
    
    
    // if(this.repa.RFPFlag == "0")
    //   {
    //     this.toaster.error("RFP Process is not yet completed");
    //     return;
    //   }
      if(this.repa.DIAG.RepairType != "SVNR")
      {
        if( (this.repa.REPAIR?.GSXCode == undefined || this.repa.REPAIR?.GSXCode==null || this.repa.REPAIR?.GSXCode == "") && this.repa?.TableReplacement == "NO")
        {
          this.toaster.error("GSX Repair is not Created For the case Id");
          return;
        }
        
      }
      else
      {
        if( this.repa.DIAG?.GSXCode == undefined || this.repa.DIAG?.GSXCode==null || this.repa.DIAG?.GSXCode == "")
        {
          this.toaster.error("GSX Repair is not Created For the case Id");
          return;
        }
      }
      for (let field of Object.keys(this.handoverForm.controls)) {
        
        let control = this.handoverForm.get(field).value;
        if (control == null || control == undefined) {
          this.toaster.error(field + " Cannot be Empty");
          return;  
        }
      }
      
    this.dynamicService.validateAllFormFields(this.handoverForm);
    let customerSignFlag = true 
    if ( this.repa?.TableReplacement == "NO"){
      customerSignFlag = this.Signature != null && this.Signature != undefined  ? true : false
    }
    if (this.handoverForm.valid && this.AuthPerson != null && this.AuthPerson != undefined  && customerSignFlag ) {
      if(this.repa.DIAG.RepairType != "SVNR" ){
        let markdownList = Array.isArray(this.repa?.GSXMARKDOWNLIST?.GSXMARKDOWN) ? this.repa.GSXMARKDOWNLIST?.GSXMARKDOWN : [this.repa.GSXMARKDOWNLIST?.GSXMARKDOWN]
        console.log("markdownList ",markdownList)
        if ( markdownList.find( item =>  item.JobStatus == 'HANDOVER' && item.GSXCode == this.repa.REPAIR.GSXRepairStatus)){
          this.onSubmit()
        }
        else{
          this.SaveHandOverToGSX()
        }

        // if ( this.repa.REPAIR.GSXRepairStatus == 'SPCM'||  this.repa.REPAIR.GSXRepairStatus == 'SCOM' || this.repa.REPAIR.GSXRepairStatus == 'ENDE' 
        //   || this.repa.REPAIR.GSXRepairStatus == 'SACM'
        // ){
        //   this.onSubmit()
        // }
        // else{
        //   this.SaveHandOverToGSX()
        // }
      }
      else{
        this.onSubmit()
      }
    } else {
      this.toaster.error("Add Signature")
    }
  }

  
   // GSX Handover SPCM
   
  getPartObject(part: any, Method: string) {

    if (Array.isArray(this.repa.DIAG.DIAGLIST.DIAGDETAIL)) {
      this.rplist = this.repa.DIAG.DIAGLIST.DIAGDETAIL;
    }
    else {
      this.rplist.push(this.repa.DIAG.DIAGLIST.DIAGDETAIL);
    }
    //var diagdetail = this.repa.DIAG.DIAGLIST.DIAGDETAIL[0];

    var diag = this.repa?.DIAG;

    var result;
    if (Method == "PartSelect") {
      result = this.selectedpartlist.filter(p => p.PartCode == part.number && p.IsDeleted == 0);
    }
    else if (Method == "GSX") {
      result = this.selectedpartlist.filter(p => p.PartCode == part.number && p.SequenceNumber == part.sequenceNumber);
    }
    else {
      result = this.selectedpartlist.filter(p => p.PartCode == part.PartCode);
    }

    var objPart
    var repairDetailGuid
    if (result == undefined || result == null || result.length == 0) {
      repairDetailGuid = uuidv4()
    }
    else {
      objPart = result
      repairDetailGuid = result[0].RepairDetailGUID
    }


    objPart = {
      "RepairDetailGUID": repairDetailGuid,
      "ComponentCode": Method == "GSX" ? part?.componentIssue?.componentCode : Method == "PartSelect" ? this.rplist[0]?.ComponentCode : part?.ComponentCode,
      "IssueCode": Method == "GSX" ? part?.componentIssue?.issueCode : Method == "PartSelect" ? this.rplist[0]?.IssueCode : part?.IssueCode,
      "ComponentDescription": Method == "GSX" ? part?.componentIssue?.componentDescription : Method == "PartSelect" ? this.rplist[0]?.ComponentDesc : part?.ComponentDescription,
      "IssueDescription": Method == "GSX" ? part?.componentIssue?.issueDescription : Method == "PartSelect" ? this.rplist[0]?.IssueDesc : part?.IssueDescription,
      "ReproducibilityCode": Method == "GSX" ? part?.componentIssue?.reproducibility : Method == "PartSelect" ? this.rplist[0]?.ReproducibilityCode : part?.ReproducibilityCode,
      "ReproducibilityDescription": Method == "GSX" ? part?.componentIssue?.reproducibilityDescription : Method == "PartSelect" ? this.rplist[0]?.ReproducibilityDescription : part?.ReproducibilityDescription,
      "PartCode": Method == "GSX" ? part.number : Method == "PartSelect" ? part.number : part?.PartCode,
      "PartUsed": Method == "GSX" ? part?.partUsed : Method == "PartSelect" ? part.substitutePartNumber == undefined || part.substitutePartNumber == null || part.substitutePartNumber == '' ? part.number : part.substitutePartNumber : part?.PartUsed,
      "PartDescription": Method == "GSX" ? part?.description : Method == "PartSelect" ? part.description : part?.PartDescription,
      "PartUsedDescription": Method == "GSX" ? part?.description : Method == "PartSelect" ? part.description : part?.PartUsedDescription,
      "OrderId": Method == "GSX" ? part?.orderId : Method == "PartSelect" ? "" : part?.OrderId,
      "OrderStatusCode": Method == "GSX" ? part?.orderStatusCode : Method == "PartSelect" ? "" : part?.OrderStatusCode,
      "OrderStatusDescription": Method == "GSX" ? part?.orderStatusDescription : Method == "PartSelect" ? "" : part?.OrderStatusDescription,
      "OrderStatusDate": Method == "GSX" ? part?.orderStatusDate : Method == "PartSelect" ? "" : part?.OrderStatusDate,
      "ReturnOrderNumber": Method == "GSX" ? part?.returnOrderNumber : Method == "PartSelect" ? "" : part?.ReturnOrderNumber,
      "ReturnStatusCode": Method == "GSX" ? part?.returnStatusCode : Method == "PartSelect" ? "" : part?.ReturnStatusCode,
      "ReturnStatusDescription": Method == "GSX" ? part?.returnStatusDescription : Method == "PartSelect" ? "" : part?.ReturnStatusDescription,
      "ImageUrl": Method == "GSX" ? part?.imageUrl : Method == "PartSelect" ? part?.imageUrl : part?.ImageUrl,
      "NetPrice": Method == "GSX" ? this.dynamicService.removeCommas(part?.netPrice == undefined ? "0" : part?.netPrice) : Method == "PartSelect" ? 0 : part?.NetPrice,
      "CoverageCode": Method == "GSX" ? part.coverageCode : Method == "PartSelect" ? this.repa?.GSXWarrantyStatusCode : part?.CoverageCode,
      "CoverageCodeDescription": Method == "GSX" ? part.coverageDescription : Method == "PartSelect" ? this.repa?.GSXWarrantyStatusDesc : part?.CoverageCodeDescription,
      "CoverageOption": Method == "GSX" ? part.coverageOption : Method == "PartSelect" ? diag?.BillingOption : part?.CoverageOption,
      "CoverageOptionDescription": Method == "GSX" ? part.coverageOptionDescription : Method == "PartSelect" ? this.rplist[0]?.BillingOption : part?.CoverageOptionDescription,
      "Type": Method == "GSX" ? part?.type : Method == "PartSelect" ? part?.type : part?.Type,
      "TypeDescription": Method == "GSX" ? part?.typeDescription : Method == "PartSelect" ? part?.typeDescription : part?.TypeDescription,
      "IsDeleted": Method == "GSX" ? 0 : Method == "PartSelect" ? 0 : part?.IsDeleted == "1" ? 1 : 0,
      "IsGSXPosted": Method == "GSX" ? true : Method == "PartSelect" ? false : part?.IsGSXPosted,
      "PartSerialized": Method == "GSX" ? part?.serialized == true ? true : false : Method == "PartSelect" ? part?.serialized == true ? true : false : part?.PartSerialized,
      "DeliveryNumber": Method == "GSX" ? part?.deliveryNumber : Method == "PartSelect" ? "" : part?.DeliveryNumber,
      "DeliveryDate": Method == "GSX" ? part?.deliveryDate : Method == "PartSelect" ? null : part?.DeliveryDate,
      "DeliveryTrackingNumber": Method == "GSX" ? part?.deliveryTrackingNumber : Method == "PartSelect" ? "" : part?.DeliveryTrackingNumber,
      "KBB": Method == "GSX" ? part?.kbbDeviceDetail?.identifiers?.serial : Method == "PartSelect" ? "" : part?.KBB,
      "KGB": Method == "GSX" ? part?.kgbDeviceDetail?.identifiers?.serial : Method == "PartSelect" ? "" : part?.KGB,
      "SequenceNumber": Method == "GSX" ? part?.sequenceNumber : Method == "PartSelect" ? "0" : part?.SequenceNumber,
      "billable": Method == "GSX" ? part?.billable == true ? true : false : Method == "PartSelect" ? false : part?.billable,
      "ConsignmentStockUsed": Method == "GSX" ? part?.fromConsignedStock == true ? 1 : 0 : Method == "PartSelect" ? 0 : part?.ConsignmentStockUsed == "1" ? 1 : 0,
      "ReturnTrackingNumber": Method == "GSX" ? part?.returnTrackingNumber : Method == "PartSelect" ? "" : part?.ReturnTrackingNumber,
      "ReturnPartReceivedDate": Method == "GSX" ? part?.returnPartReceivedDate : Method == "PartSelect" ? null : part?.ReturnPartReceivedDate,
      "ReturnCarrierCode": Method == "GSX" ? part?.returnCarrierCode : Method == "PartSelect" ? null : part?.ReturnCarrierCode,
      "ReturnCarrierName": Method == "GSX" ? part?.returnCarrierName : Method == "PartSelect" ? null : part?.ReturnCarrierName,
      "ReturnCarrierUrl": Method == "GSX" ? part?.returnCarrierUrl : Method == "PartSelect" ? null : part?.ReturnCarrierUrl,
      "CarrierCode": Method == "GSX" ? part?.carrierCode : Method == "PartSelect" ? null : part?.CarrierCode,
      "CarrierName": Method == "GSX" ? part?.carrierName : Method == "PartSelect" ? null : part?.CarrierName,
      "CarrierUrl": Method == "GSX" ? part?.carrierUrl : Method == "PartSelect" ? null : part?.CarrierUrl,
      "PricingOption": Method == "GSX" ? part?.pricingOption : Method == "PartSelect" ? null : part?.PricingOption,
      "PricingOptionDescription": Method == "GSX" ? part?.pricingOptionDescription : Method == "PartSelect" ? null : part?.PricingOptionDescription,
      "PricingOptionList": Method == "GSX" ? [] : Method == "PartSelect" ? part?.pricingOptions : [],
      "SubType": Method == "GSX" ? part?.subType : Method == "PartSelect" ? null : part?.SubType,
      "RelatedSequenceNumber": Method == "GSX" ? part?.subType : Method == "PartSelect" ? null : part?.RelatedSequenceNumber,
      "SubstitutePartNumber": Method == "GSX" ? part?.substitutePartNumber : Method == "PartSelect" ? null : part?.SubstitutePartNumber
    }
    //objPart.PartSerialized=false
    return objPart;
  }

   SaveHandOverToGSX() {
    
    var Partlist = [];
    for (let item of this.selectedpartlist) {
      Partlist.push({
        "ComponentCode": item.ComponentCode,
        "PartType": item.Type,
        "IssueCode": item.IssueCode,
        "ReproducibilityCode": item.ReproducibilityCode,
        "ConsignmentStockUsed": item.ConsignmentStockUsed,
        "PartCode": item.PartCode,
        "PartUsed": item.PartUsed,
        "PartSerialized": item.PartSerialized,
        "KGB": item.KGB == undefined || item.KGB == null || item.KGB == "" ? null : item.KGB,
        "KBB": item.KBB == undefined || item.KBB == null || item.KBB == "" ? null : item.KBB,
        "CoverageOption": item.CoverageOption,
        "PricingOption": item.PricingOption == null || item.PricingOption == undefined ? null : item.PricingOption.code,
        "ReturnStatusCode": "",
        "isGSXPosted": item.isGSXPosted == null || item.isGSXPosted == undefined ? 0 : item.isGSXPosted == true ? 1 : 0,
        "IsDeleted": item.IsDeleted,
        "sequenceNumber": item.SequenceNumber == "0" || item.SequenceNumber == undefined || item.SequenceNumber == null ? null : +item.SequenceNumber
      });
    };
    var objData = {
      "CaseGUID": this.repa.CaseGUID,
      "repairType": this.repa.DIAG.RepairType,
      "repairClassification": this.repa.DIAG.SubmissionType,
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0,
      "requestReviewByApple": false,
      // "markComplete": this.markComplete == undefined || this.markComplete == null ? false : strRepairStatus == "SPCM" ? true : this.markComplete,
      "markComplete": true,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": null,
      "repairStatus": "SPCM"
    };

    let strRequestData = JSON.stringify(objData);
    console.log(objData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    // **************************************************************
    // return
    this.spinner.show();
    this.gsxService.CreateUpdateRepair(contentRequest).subscribe(
      {
        next: (value) => {
          
          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toaster.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            this.spinner.hide();
          }
          else if (!(response.outcome == undefined || response.outcome == null)) {
            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            //this.toaster.error(errorMessage1);
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              //this.toaster.error(errorMessage1);
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toaster.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toaster.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }

            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              this.getRepairDetails(repairid);
            }
          }
          else {
            var repairid = response.repairId;
            this.getRepairDetails(repairid);
          }
        }
      });
  }


  GSXRepairStatusDescription: String;
  GSXRepairStatusDateTime: Date
  RepairDate: Date = new Date();
  RepairDocCode: String;
  shipments: any;
  accounts: any;
  ServiceNotificationNumber: String;
  SubTotalAmount: Number = 0;
  TaxAmount: Number = 0;
  TotalAmount: Number = 0;
  InvoiceAvailable: boolean;
  SelectedRepairStatus: any;
  repairQuestions: any;


  getRepairDetails(repairid: string) {
    let searchData = { "repairId": repairid };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = this.repa?.LocationCode
    var CompanyCode = glob.getCompanyCode()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
      {
        next: (value) => {
          '';
          
          let response = JSON.parse(value.toString());
          console.log("Repair Object GSX")
          
          if ((response.errors == undefined || response.errors == null)) {
            this.selectedpartlist = []
            this.GSXRepairStatusDescription = response.repairStatusDescription
            this.GSXRepairStatus = response.repairStatus;
            this.GSXRepairStatusDateTime = response.repairStatusDateTime //ne
            this.InvoiceAvailable = response.invoiceAvailable //ne
            this.RepairDate = response.repairCreatedOnDate;
            this.GSXCode = repairid;
            this.repairQuestions = response.questionDetails == undefined || response.questionDetails == null ? null : response.questionDetails;
            this.SelectedRepairStatus = {
              "RepairStatusCode": this.GSXRepairStatus,
              "RepairStatusDescription": this.GSXRepairStatusDescription
            }
            this.UpdateRepairStatusList();

            if (response.shipments == undefined || null) {
              this.shipments = []
            }
            else {
              this.shipments = []
              for (let shipment of response.shipments) {
                this.shipments.push({
                  "ShipmentType": shipment.type,
                  "CarrierName": shipment.carrierName,
                  "CarrierUrl": shipment.carrierUrl,
                  "CarrierCode": shipment.carrierCode,
                  "DeviceShipped": shipment.DeviceShipped,
                  "TrackingNumber": shipment.trackingNumber,
                  "ShippedDate": shipment.shippedDate,
                  "ReceivedDate": shipment.receivedDate
                })
              }
            }
            this.ServiceNotificationNumber = response.serviceNotificationNumber;
            var subtotalamount = response.price?.subTotalAmount == undefined || response.price?.subTotalAmount == null ? "0.00" : response.price?.subTotalAmount
            if (!(typeof subtotalamount == 'string')) {
              subtotalamount = "0.00"
            }
            this.SubTotalAmount = this.dynamicService.removeCommas(subtotalamount);

            var taxamount = response.price?.tax == undefined || response.price?.tax == null ? "0.00" : response.price?.tax;
            if (!(typeof taxamount == 'string')) {
              taxamount = "0.00"
            }

            this.TaxAmount = this.dynamicService.removeCommas(taxamount);
            var totalamount = response.price?.totalAmount == undefined || response.price?.totalAmount == null ? "0.00" : response.price?.totalAmount
            if (!(typeof totalamount == 'string')) {
              totalamount = "0.00"
            }
            this.TotalAmount = this.dynamicService.removeCommas(totalamount);

            for (let item of response.parts) {
              var objPart = this.getPartObject(item, "GSX");
              this.selectedpartlist.push(objPart);
            }
            this.onSave(this.GSXCode);
          }
          else
          {
            this.toaster.error(response.errors[0].message,"Error")
           this.spinner.hide(); 
          }
  
        }
      });

  }
  RepairStatusList: any[] = [];

  UpdateRepairStatusList() {
    this.RepairStatusList = [];
    if (this.repa?.DIAG.RepairType == "CIN" || this.repa?.DIAG.RepairType == "CRBR") {
      if (this.GSXRepairStatus == "RLSD") {
        this.RepairStatusList.push({
          "RepairStatusCode": "RLSD",
          "RepairStatusDescription": "Repair released from processing"
        })
      }
      if (this.GSXRepairStatus == "RLSD" || this.GSXRepairStatus == "AWTP" || this.GSXRepairStatus == "AWTR" || this.GSXRepairStatus == "BEGR" || this.GSXRepairStatus == "RFPU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "AWTP",
          "RepairStatusDescription": "Awaiting Parts"
        })

        this.RepairStatusList.push({
          "RepairStatusCode": "AWTR",
          "RepairStatusDescription": "Parts Allocated"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "BEGR",
          "RepairStatusDescription": "In Repair"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "RFPU",
          "RepairStatusDescription": "Ready for Pickup"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "SPCM",
          "RepairStatusDescription": "Repair Marked Complete"
        })


      }
    }
    else if (this.repa?.DIAG.RepairType == "WUMS" || this.repa?.DIAG.RepairType == "WUMC") {

      if (this.GSXRepairStatus == "RABU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RABU",
          "RepairStatusDescription": "Unit Returned Abuse"
        })
      }

      if (this.GSXRepairStatus == "RBER") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RBER",
          "RepairStatusDescription": "Unit Returned BER"
        })
      }
      if (this.GSXRepairStatus == "RCND") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RCND",
          "RepairStatusDescription": "Unit Returned Could Not Duplicate Failure"
        })
      }
      if (this.GSXRepairStatus == "RPOP") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RPOP",
          "RepairStatusDescription": "Returned - No Proof of Purchase"
        })
      }

      if (this.GSXRepairStatus == "RRPL") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPL",
          "RepairStatusDescription": "Unit Returned Replaced"
        })

      }
      if (this.GSXRepairStatus == "RRPP") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPP",
          "RepairStatusDescription": "Unit Returned Partially Repaired"
        })

      }

      if (this.GSXRepairStatus == "RRPR") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPR",
          "RepairStatusDescription": "Unit Returned Repaired"
        })

      }


      if (this.GSXRepairStatus == "RRTN") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRTN",
          "RepairStatusDescription": "Returned - Tampered"
        })

      }


      if (this.GSXRepairStatus == "RVFU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RVFU",
          "RepairStatusDescription": "Component Check Failure - Returned Unrepaired"
        })

      }


      if (this.GSXRepairStatus == "URPL") {

        this.RepairStatusList.push({
          "RepairStatusCode": "URPL",
          "RepairStatusDescription": "Unit to be Replaced"
        })

      }
      if (this.RepairStatusList.length > 0 || this.GSXRepairStatus == "RFPU") {
        this.RepairStatusList.push({
          "RepairStatusCode": "RFPU",
          "RepairStatusDescription": "Ready for Pickup"
        })

        this.RepairStatusList.push({
          "RepairStatusCode": "SPCM",
          "RepairStatusDescription": "Repair Marked Complete"
        })


      }

    }
  }

  
  onSave(GsxCode) {
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveRepair"
    });

    requestData.push({
      "Key": "ServiceNotificationNumber",
      "Value": this.ServiceNotificationNumber
    });

    requestData.push({
      "Key": "SubTotalAmount",
      "Value": this.SubTotalAmount
    });

    requestData.push({
      "Key": "TaxAmount",
      "Value": this.TaxAmount
    });
    requestData.push({
      "Key": "TotalAmount",
      "Value": this.TotalAmount
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "RepairDocType",
      "Value": this.repa.DIAG.RepairType
    });
    requestData.push({
      "Key": "RepairGUID",
      "Value": this.newrepairGuid
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "RepairDocCode",
      "Value": this.RepairDocCode == undefined || this.RepairDocCode == null ? " " : this.RepairDocCode,
    });
    requestData.push({
      "Key": "RepairQuestions",
      "Value": this.repairQuestions == undefined || this.repairQuestions == null ? "" : JSON.stringify(this.repairQuestions),
    });
    requestData.push({
      "Key": "RepairDate",
      "Value": this.RepairDate
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.repa.LocationCode
    });

    requestData.push({
      "Key": "GSXRepairStatus",
      "Value": this.GSXRepairStatus
    });
    requestData.push({
      "Key": "GSXRepairStatusDescription",
      "Value": this.GSXRepairStatusDescription
    });
    requestData.push({
      "Key": "RepairRemark",
      "Value": " "
    });
    requestData.push({
      "Key": "GSXCode",
      "Value": this.GSXCode
    });
    requestData.push({
      "Key": "isGSXPosted",
      "Value": 1
    });
    requestData.push({
      "Key": "TechnicianCode",
      "Value": this.repa.ASGTECH.TechCode
    });
    requestData.push({
      "Key": "RepairDetail",
      "Value": this.getRepairXml()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.spinner.hide();
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            this.toaster.success("Updated Successfully")
            var data = JSON.parse(response.ExtraData)
            this.onSubmit()
          }
          else {
            this.spinner.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              console.log("response", response)
              this.toaster.error("")
            });
          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide();
          this.toaster.error(err.toString());
        }
      });
  }

  getRepairXml() {

    console.log("++", this.selectedpartlist)
    let rawData = {
      "rows": []
    }
    for (let item of this.selectedpartlist) {
      //var repairVal = this.compIssueForm.value
      rawData.rows.push({
        "row": item
      });
    }

    console.log("rawData", rawData);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    //xml = xml.split(' ').join('')
    console.log("xml", xml);
    return xml;
  }



  onSubmit() {
    let handoverguid = uuidv4();
    const handoverval = this.handoverForm.value
     let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveHandOver"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "HandOverGUID",
        "Value": handoverguid
      });
      requestData.push({
        "Key": "HandOverCode",
        "Value": "NEW"
      });
      requestData.push({
        "Key": "HandOverDate",
        "Value": handoverval.HandOverDate
      });
      requestData.push({
        "Key": "HandOverStatus",
        "Value": handoverval.HandOverStatus
      });
      requestData.push({
        "Key": "HandOverRemark",
        "Value": handoverval.HandOverRemark
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": this.repa.CaseGUID
      });
      requestData.push({
        "Key": "JobChecklistDetails",
        "Value": this.ConvertObjectIntoXml()
      });
      requestData.push({
        "Key": "ReferralDetails",
        "Value": this.ConvertReferralDetailsIntoXml()
      });
      requestData.push({
        "Key": "IsContractApplicable",
        "Value": this.IsContractApplicable == null ||  this.IsContractApplicable == undefined ? '0' : this.IsContractApplicable
      });
      requestData.push({
        "Key": "ContractCode",
        "Value":  this.IsContractApplicable == null ||  this.IsContractApplicable == undefined ? '' : this.ContractCode
      });
      requestData.push({
        "Key": "VisitPurpose",
        "Value":  this.activatedRoute.snapshot.queryParams.vp ?? ''
      });
      requestData.push({
        "Key": "TokenCode",
        "Value":  this.activatedRoute.snapshot.queryParams.tc ?? ''
      });
       requestData.push({
        "Key": "Tradein",
        "Value":  this.Tradein ?? ''
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
              this.addHandOver();
              this.toaster.success('Form Submitted Successfully')
              var getval = JSON.parse(response.ExtraData);
              this.HanOverUpdated.emit(getval)
              window.location.reload() // Casa Posting after refresh
            }
            else {
              this.errorMessage = response.ReturnMessage;
              this.toaster.error(this.errorMessage)
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.toaster.error(result)
              });
            }
          },
          error: err => {
            console.log(err);
          }
        });
  
  }


  
  onCustomerSignatureSubmit() {
    let AttachmentGuid = uuidv4();
    if(this.CustomerSignature != null || this.CustomerSignature != undefined || this.CustomerSignature != ''){
    let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveJobAttachment"
      });
      requestData.push({
        "Key": "AttachmentGUID",
        "Value": AttachmentGuid
      });
      requestData.push({
        "Key": "CaseId",
        "Value": this.repa.CaseId
      });
      requestData.push({
        "Key": "CaseGuid",
        "Value": this.repa.CaseGUID
      });
      requestData.push({
        "Key": "AttachmentOriginType",
        "Value": 'JOBCLOSESIGNATURE'
      });
      requestData.push({
        "Key": "AttachmentFile",
        "Value": this.CustomerSignature
      });
      requestData.push({
        "Key": "AttachmentType",
        "Value": "Signature"
      });
      requestData.push({
        "Key": "CloudFlag",
        "Value": "1"
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
              
              this.toaster.success('Submitted Succesfully')
              var getval = JSON.parse(response.ExtraData);
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
      }else{
        this.toaster.error('Please Select Signature Type')
      }
    }
  
  onReset() {

    

    this.handoverForm.reset();
    this.toaster.info("Form Reset")
  }
  


checklistTotalvalues:any[] = [];

Checklist_Master() {

  let strQuestion = [];
    strQuestion.push({
    "Key": "ApiType",
    "Value": "GetCheckListDetails"
  });
  strQuestion.push({
    "Key": "Stage",
    "Value": "JOBCREATE"
  });
  strQuestion.push({
    "Key": "ProductName",
    "Value": this.repa?.productDescription
  });

  let strRequestData = JSON.stringify(strQuestion);
  let contentRequest = {
    "content": strRequestData
  };
  this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
    next: (value) => {
      let response = JSON.parse(value.toString());
      if (response.ReturnCode == '0') {
        let checklistdata = JSON.parse(response.ExtraData);
        this.checklistTotalvalues = [];

        if (Array.isArray(checklistdata.CheckListDetails.CheckList)) {
          this.checklistTotalvalues = checklistdata.CheckListDetails.CheckList;
         
        }
        else {
          this.checklistTotalvalues.push(checklistdata.CheckListDetails.CheckList);
        }
         ;
        var Cnt = 0;
        console.log("Data" , this.checklistTotalvalues)
        
        for (let item of this.checklistTotalvalues) {
          item.formControlName = "Question" + (Cnt + 1).toString();
          item.arrFldValue = this.splitAndformat(item.FldValue);
          item.defaultvalue=item.DefaultValue.trim();
          item.answer=item.defaultvalue.trim();
          var iscontrolexists = this.handoverForm.controls[item.formControlName] == undefined ? 0 : 1;

          if (iscontrolexists == 0) {
            this.handoverForm.addControl(item.formControlName, new FormControl());
            this.handoverForm.controls[item.formControlName].setValue(item.defaultvalue);
          }
          else{
            this.handoverForm.controls[item.formControlName].setValue(item.defaultvalue);
          }
          Cnt = Cnt + 1;
        }
      }
    },
  });
  
}

checklistvaluechange(item,item1)
{
   ;
  item.answer=item1.value;
}

splitAndformat(tags: any) {
  var arr = [];
  for (let item of tags.split(",")) {
    arr.push({ label: item.trim(), value: item.trim() });
  }
  return arr;
}

ConvertObjectIntoXml() {
   ;
  let rawData = {
    "rows": []
  }
  if ( this.repa.JobType != 'SNR') {
    for (let item of this.checklistTotalvalues) {
      var questions = item.ChecklistDescription;
      var answer = item.answer;
  
      rawData.rows.push({
        "row": {
          "question": questions,
          "answer": answer
        }
      });
    }
  }
  else{
    rawData.rows.push({
      "row": {
        "question": '',
        "answer": ''
      }
    });
  }

  console.log("rawData", rawData);
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(rawData);
  xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  console.log("xml", xml);
  return xml;
}

addSignature(){
  var addsignature = true
  this.AddSignature.emit(addsignature)
}


onAuthorisedSubmit(objAttachment) {
  
   
  let AttachmentGuid = uuidv4();
  let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveJobAttachment"
    });
    requestData.push({
      "Key": "AttachmentGUID",
      "Value": AttachmentGuid
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa?.CaseId
    });
    requestData.push({
      "Key": "GsxAssetId",
      "Value": objAttachment?.GsxAssetId == undefined || objAttachment?.GsxAssetId==null ?"":objAttachment?.GsxAssetId
    });
    
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.repa?.CaseGUID
    });
    requestData.push({
      "Key": "AttachmentOriginType",
      "Value": "AuthorisedPersonSignature"
    });
    requestData.push({
      "Key": "AttachmentFile",
      "Value": objAttachment
    });
    requestData.push({
      "Key": "AttachmentType",
      "Value": "Image"
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
           ;
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");

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



  addReferralDetail(){
    console.log('this.ReferralName' ,this.ReferralName)
    console.log('ReferralMobileNo' ,this.ReferralMobileNo)
    if(this.ReferralName == null || this.ReferralName == undefined || this.ReferralName == ''){
      this.toaster.error("REFERRAL NAME SHOULD NOT BE EMPTY !")
      return
    }
    if(!(/^[0-9]{10}$/).test(this.ReferralMobileNo))
     {
      this.toaster.error("INVALID REFERRAL MOBILE NUMBER!")
      return

     }
    this.ReferralDetailsList.push({
      'ReferralName' :this.ReferralName,
      'ReferralMobileNo' : this.ReferralMobileNo
    })

    this.ReferralMobileNo=null;
    this.ReferralName = null;

  }

  deleteReferral(Referral){
    let index = this.ReferralDetailsList.indexOf(Referral)
  this.ReferralDetailsList.splice(index, 1)
  }

  ConvertReferralDetailsIntoXml(){
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
 

//  check if handover with contract 
   GetAmcTypeMasterDetailsList() {
    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetAmcTypeMasterDetailsList"
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
              
              if (Array.isArray(data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails)) {
                this.AmcTypeMasterDetailsList = data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails
              }
              else {
                this.AmcTypeMasterDetailsList.push(data?.AmcTypeMasterDetailsList?.AmcTypeMasterDetails)
              }
              this.CheckForServiceContractApplicability()
            }
       
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

  CheckForServiceContractApplicability(){
    const quoteItems = Array.isArray(this.repa?.QUOTE?.QUOTEDETAILS)?this.repa?.QUOTE?.QUOTEDETAILS : [this.repa?.QUOTE?.QUOTEDETAILS];
     const itemsExists = quoteItems.some(q =>this.AmcTypeMasterDetailsList.some(a => a.PartNumber === q.ItemCode)
    );
    
    if(itemsExists && this.repa?.QUOTE?.QuoteStatus != "REJECTED"){
      this.IsContractApplicable = true;
    }

  }


  onTradeinSearch($event: { term: string; items: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.TRADEIN, $event.term,{Parameter :  '' }).subscribe({
        next: (value) => {
          if (value != null) {
            
            this.TradeinDD = value;
             if(this.TradeinDD.Data){
              
             }
            console.log("TradeinDD ", this.TradeinDD)
          }
        },
        error: (err) => {
          this.TradeinDD = this.getBlankObject();
        }
      });
    }
    getBlankObject(): DropDownValue {
      throw new Error("Method not implemented.");
    }
 
}