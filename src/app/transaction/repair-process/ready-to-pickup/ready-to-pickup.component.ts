import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseDetail } from '../repair-process.metadata';
import { PickUp } from './pickUp.metadata';
import * as glob from "../../../config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { v4 as uuidv4 } from 'uuid';

import xml2js from 'xml2js';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';

@Component({
  selector: 'app-ready-to-pickup',
  templateUrl: './ready-to-pickup.component.html',
  styleUrls: ['./ready-to-pickup.component.sass']
})
export class ReadyToPickupComponent implements OnInit {

  errorMessage: any;
  RPFStatusList: any = ['Release']
  isRPF: boolean = false;
  productDescription: any
  UnclaimedDeviceDD: DropDownValue = this.getBlankObject()  
  UnclaimedDeviceReason: string;
  currentDate

      RFUStatusDD: DropDownValue = DropDownValue.getBlankObject();
  

  constructor(
    private formBuilder: FormBuilder,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private gsxService : GsxService

  ) { }

  addRPFList() {
    if (this.isReadyToPick == true) {
      this.isReadyToPick = false;
    } else {
      this.isReadyToPick = true;
    }
  }

  pickupForm: FormGroup;
  pickup: PickUp
  isReadyToPick: boolean = false;
  rpf: any[] = []
  rpfviewlist: any[] = []
  InputMode=""
  today: any;
  isUnclaimed : boolean = false
  noOfDaysFromCreation: number;
  UnclaimedGUID : any;
  submitClicked= false 

  // GSX RFPU
  selectedpartlist: any[] = [];
  GSXRepairStatus: String;
  JobStatus: String;
  newrepairGuid: String;
  GSXCode: string;
  rplist: any[] = [];
  compIssueForm: FormGroup;
  isApproverPermission: boolean = false
  @Input() repa: CaseDetail;
  @Output() RPFUpdated = new EventEmitter<any>();
  @Output() UnclaimedUpdated = new EventEmitter<any>();

  addReadyToPickUp() {
    if (this.isReadyToPick == true) {
      this.isReadyToPick = false;
    } else {
      this.isReadyToPick = true;
    }
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  ngOnChanges(changes: SimpleChanges): void{
    this.today = new Date();
    if(changes['repa'])
    {
        if(this.repa!= null && this.repa != undefined  ){
          this.rpfviewlist = [];
          this.rpf=[];
          this.rpf.push(this.repa?.RFP)
          this.productDescription = this.repa?.productDescription
          if(Array.isArray(this.rpf))
          {
            for ( var item of this.rpf)
            {
                this.rpfviewlist.push({
                  "RFPGUID": item?.RFPGUID,
                  "RFPCode":   item?.RFPCode,
                  "RFPStatus": item?.RFPStatus,
                  "Remark": item?.Remark,
                  "CreatedBy": item?.CreatedBy,
                  "CreatedDate":item?.CreatedDate,
                  "RFPStatusDesc" : item?.RFPStatusDesc ?? ''

                })
              
            }
          }

          // Check if Unclaimed 
          if (this.repa.RFPFlag == '1' && this.repa.HandoverFlag == '0') {
              let createdDate = new Date(this.repa.CreatedDate);
              createdDate.setHours(0, 0, 0, 0);
              let today = new Date();
              today.setHours(0, 0, 0, 0);
              let differenceInMs = today.getTime() - createdDate.getTime();
              this.noOfDaysFromCreation = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
              if (this.noOfDaysFromCreation > 40) {
                this.isUnclaimed = true;
              }
              if (this.repa.JobStatus == 'S15') {
                this.UnclaimedDeviceReason = this.repa.UNCLAIMED.UnclaimedDeviceReason.toString();
              }
          }

      }
    }

    // GSX RFPU 
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

  


  ngOnInit(): void {
    this.onRFUStatusSearch({ term: "", items: [] })

    this.pickup = new PickUp();
    this.pickupForm = this.formBuilder.group({
      PickUpDate: [null, [Validators.required]],
      PickUpRemark: [null, [Validators.required]],
      PickUpStatus: [null, [Validators.required]]
    });

    this.UnclaimedGUID = uuidv4(); 
    this.onUnclaimedDeviceReason({ term: "", items: [] });
    this. checkLocalPermission()
    this.currentDate = new Date()
    if ( this.repa?.JobType == 'SNR'){
      this.pickupForm.controls['PickUpStatus'].setValue("Release");
      this.pickupForm.controls['PickUpDate'].setValue(this.currentDate);
    }

  }
  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }


  onUnclaimedDeviceReason($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.UnclaimDeviceReason, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.UnclaimedDeviceDD = value;
          console.log("UnclaimedDeviceDD ", this.UnclaimedDeviceDD )
        }
      },
      error: (err) => {
        this.UnclaimedDeviceDD = this.getBlankObject();
      }
    })
  }
  
  onSubmitUnclaimedDevice(){

    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true 


    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveUnclaimedDevice"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "UnclaimedDeviceGUID",
      "Value": this.UnclaimedGUID
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "UnclaimedDeviceReason",
      "Value": this.UnclaimedDeviceReason
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

         
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            this.spinner.hide()
            this.toaster.success('Submitted Succesfully')
            this.UnclaimedUpdated.emit(getval)
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
          this.submitClicked = false
          this.spinner.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toaster.error("Error:- " + message);
            } else {
              this.toaster.error("Error parsing the error message.");
            }
          });
        }
      });
  }

  ReverseUnclaimedDevice(){

    if ( this.repa.RFPFlag == '0' ){
      this.toaster.error('Ready for Pickup not done yet!')
      return
    }

    if ( this.repa.HandoverFlag == '1' ){
      this.toaster.error('Handover already done!')
      return
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


    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "ReverseUnclaimedDevice"
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {         
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            this.spinner.hide()
            this.toaster.success('Submitted Succesfully')
            window.location.reload()
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
          this.submitClicked = false
          this.spinner.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toaster.error("Error:- " + message);
            } else {
              this.toaster.error("Error parsing the error message.");
            }
          });
        }
      });
  }

  onReset() {
    this.pickupForm.reset();
    this.toaster.info('Form Reset')
  }


  validateRFP(){
    

    
     if(this.repa?.JobStatus == 'S17'){
      this.toaster.error('Job Status is PART CONSTRAINT , Please Remove from Part Constraint to Proceed');
      return
     }
    
    // Object.keys(this.pickupForm.controls).forEach(field => {
    //   let control = this.pickupForm.get(field).value
    //   if (control == null || control == undefined) {
    //     this.toaster.error(field + " Cannot be Empty")
    //     return 
    //   }
    // })

    if(this.repa.DIAG.RepairType != "SVNR"){
      if( (this.repa.REPAIR?.GSXCode == undefined || this.repa.REPAIR?.GSXCode==null || this.repa.REPAIR?.GSXCode == "") && this.repa?.TableReplacement == "NO")
      {
        this.toaster.error("GSX Repair is not Created For the case Id");
        return ;
      }
      var isGsxPosted = this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0;
      if(isGsxPosted==0)
      {
          this.toaster.error("No GID found!")
          return 
      }
    }
    else{
      if( this.repa.DIAG?.GSXCode == undefined || this.repa.DIAG?.GSXCode==null || this.repa.DIAG?.GSXCode == "")
      {
        this.toaster.error("GSX Repair is not Created For the case Id");
        return ;
      }
    }
  

    const RFPVal = this.pickupForm.value
    this.dynamicService.validateAllFormFields(this.pickupForm);
    if (this.pickupForm.valid) {
        const ShouldContinue = confirm("Are you sure? Do you want to continue")
        if (ShouldContinue == false ){
          return
        }
    
        if(this.submitClicked == true)
        {
          return;
        }
        this.submitClicked=true 
        // alert("Alert on")
        if(this.repa.DIAG.RepairType != "SVNR"){
          
          let markdownList = Array.isArray(this.repa?.GSXMARKDOWNLIST?.GSXMARKDOWN) ? this.repa.GSXMARKDOWNLIST?.GSXMARKDOWN : [this.repa.GSXMARKDOWNLIST?.GSXMARKDOWN]
          console.log("markdownList ",markdownList)
          if ( markdownList.find( item =>  item.JobStatus == 'RFP' && item.GSXCode == this.repa.REPAIR.GSXRepairStatus)){
            this.onSubmit()
          }
          else{
            this.SaveRFPToGSX()
          }
        }
        else{
          this.onSubmit()
        }
  
    } else {
      return false
    }
    
  }

   // GSX RFPU
   SaveRFPToGSX() {
    
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
      "markComplete": false,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": null,
      "repairStatus": "RFPU"
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
    const RFPVal = this.pickupForm.value
     let newRFPGuid = uuidv4();
      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveRFP"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "RFPGUID",
        "Value": newRFPGuid
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": this.repa.CaseGUID
      });
      requestData.push({
        "Key": "RFPCode",
        "Value": "NEW"
      });
      requestData.push({
        "Key": "RFPStatus",
        "Value": RFPVal.PickUpStatus
      });
      requestData.push({
        "Key": "RFPDate",
        "Value": RFPVal.PickUpDate
      });
      requestData.push({
        "Key": "Remark",
        "Value": RFPVal.PickUpRemark
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
              this.toaster.success('Form Submitted Successfully')
              var getval = JSON.parse(response.ExtraData);
              // this.RPFUpdated.emit(getval)
              // this.addReadyToPickUp()              
              this.sendMail(getval)
              window.location.reload()

            }
            else {
              this.errorMessage = response.ReturnMessage;
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


  sendMail(obj) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetMailObject"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID,
    });
    requestData.push({
      "Key": "QueueGUID",
      "Value": 'F46D1DE5-D368-493C-A9EA-FE2F238C4469'
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
            let data  = JSON.parse(response.ExtraData);
            console.log("data ", data)
            let dataObj = 
            {
              "QueueGUID": data.MAIL.QueueGUID,
              "TOEmailID": data.MAIL.TOEmailID,
              "CCEmailID": data.MAIL.CCEmailID == null || data.MAIL.CCEmailID == undefined ? "" : data.MAIL.CCEmailID,
              "BCCEmailID": data.MAIL.BCCEmailID== null || data.MAIL.BCCEmailID== undefined ?  "" : data.MAIL.BCCEmailID,
              "MessageBody": data.MAIL.MessageBody,
              "MessageSubject": data.MAIL.MessageSubject,
              "TransactionObject":JSON.stringify(data.MAIL.TransactionObject) ,
              "AttachmentData": data.MAIL.AttachmentData,
              "AttachmentFileName": data.MAIL.AttachmentFileName
            }
            let strRequestObj= JSON.stringify(dataObj);
            console.log("obj ", strRequestObj)
            
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }



     onRFUStatusSearch($event: { term: string; items: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.RFUSTATUS, $event.term).subscribe({
        next: (value) => {
          if (value != null) {
            
            this.RFUStatusDD = value;
            console.log("RFUStatusDD ", this.RFUStatusDD)
          }
        },
        error: (err) => {
          this.RFUStatusDD = this.getBlankObject();
        }
      });
    }
}
