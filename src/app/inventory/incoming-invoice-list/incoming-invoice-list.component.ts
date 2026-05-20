import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { IncomingInvoiceHeader } from './incoming-invoice.metadata';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-incoming-invoice-list',
  templateUrl: './incoming-invoice-list.component.html',
  styleUrls: ['./incoming-invoice-list.component.css']
})
export class IncomingInvoiceListComponent implements OnInit {


  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  IncomingInvStatusDD: DropDownValue = DropDownValue.getBlankObject();

  InvoiceCode: string;
  LocationCode: string;
  SAPGrnCode: string;
  breadCumbList: any[];
  toolBarAction: any[] = [];
  InvoiceStatusData:string[]= ['OPEN', 'SERIALNOUPDATED', 'GRPOCOMPLETED']
   
  InvoiceStatus: string;
  Ship_to_GSX: string;
  selectedCallForm:string;
  IncomingInvoiceList: any[]= [];
  SummaryList: any[]= [];
  uniqueInvoiceCodes: Set<string> = new Set();
  errorMessage: string;
  SummaryLength: number
  isApproverPermission = false
  submitClicked= false 

  //Incoming Invoice
  invObjList : IncomingInvoiceHeader[]
  Remark: string
  StartDate:any;
  EndDate:any;
  StartTime
  EndTime
  IsSerialNoExists : boolean = true
  selectedFileName: string | null = null;
  maxDate : Date
  ExportStartDate:any;
  ExportEndDate:any;
  // Toggle Page Number 
  pageSize : number = 10; 
  pageIndex = 0 
  pageCount: number; 
  ErrorList: any[] = [];
  UpdatedpageSize: number=10;
  Spinner = false
  TotalRecords: number = 0
  currentRange
  TotalPages: number = 0
  CurrentPage: number 
  @ViewChild('callUpdateDialog') callUpdateDialog: TemplateRef<any>;

  // Enable Invoice Pop Up
  hideCashEnablePopUp: boolean = true;
  ReasonForUnlock: string 
  selectAll: boolean = false;
  MultipleLocationCode: any[] =[];

  
  // Update Invoice  Lock Date 
  ShowLockDatePopUp:boolean=false;
  CurrentLockDate : any;
  UpdatedLockDate:any
  CurrentLocationCode :any;
  CurrentInvoiceCode :any
  CurrentInvoiceDate:any
  CurrentInvoiceGuid:any


  constructor(
    private route: Router,
    private gsxService: GsxService ,
    private dialog: MatDialog,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private reportService : ReportService,
    private http : HttpClient
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onIncomingStatusSearch({ term: "", item: [] });
    this.GetIncomingInvoiceList('')
    this.checkLocalPermission()
    this.maxDate = new Date()

  }

  options: number[] = [5, 10, 20, 50 ];
selectedOption: string;

  // actionEvent = (act: any) => {
  //   switch (act.code) {
  //     case ACTIONENUM.ADD:
  //       this.add();
  //       break;
  //   }
  // }

  // add(){
  //   this.route.navigate(['/consignment-delivery/']);
  // }

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }
 
  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  async FileUploadSAPGrn(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveIncomingInvoiceSAPGrnBulk');
      formData.append('Module','SaveIncomingInvoiceSAPGrnBulk');
      this.errorMessage = "";
      this.ngxSpinnerService.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            try {
                
                this.ngxSpinnerService.hide();  
                event.target.value = null; 
                let response = JSON.parse(JSON.stringify(value));
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  if (response.ReturnCode == '0') {
                    this.toast.success('SAP Grn Code/s Uploaded Successfully');
                    this.GetIncomingInvoiceList('')
                  }
                  else {
                    console.log("Error Response: " , response)
                    let errorMessage = response.ErrorMessage;
                    this.toast.error(errorMessage);
                     const parser = new xml2js.Parser({ strict: false, trim: true });
                     parser.parseString( errorMessage, (error, result) => {
                       const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                       console.log("Messages : " ,errorMessages)
                       errorMessages.forEach((errorMessage) => {
                         console.log("Error Message: " , error)
                         this.toast.error(errorMessage.ERRORMESSAGE);
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                this.ngxSpinnerService.hide();  
                console.log(ext);
              }
          },
          error: err => {
            
            this.ngxSpinnerService.hide()
            event.target.value = null; 
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toast.error("Error:-  " + message);
              } else {
                this.toast.error("Error parsing the error message.");
              }
            });
          }
      })
    }
  }

  downloadSampleFile()
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/GRPOUploadExcelFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'GRPOUploadExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  
  SaveIncomingInvoiceSummary(){
    this.ngxSpinnerService.show()
    this.gsxService.SaveIncomingInvoiceSummary('').subscribe({
      next: (value) => {
        
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        console.log("GSX reponse ", response)
        if (!(response.errors == undefined || response.errors == null)) {
          this.toast.error(response.errors,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true })
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true })
          }
        }
        else {
          console.log("Response from GSX ",response)
          if (response?.outcome?.action == "STOP" && response?.outcome?.reasons.length > 0) {
            const reasons = response.outcome.reasons;
            // Loop through reasons
            reasons.forEach((reason, reasonIndex) => {
              const messages = reason.messages;
              console.log("Error Messages ", messages)
              messages.forEach((message, messageIndex) => {
                this.toast.error(message,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true })
              });
            });
          }
          
        }
      },
      error: (err) => {
        
        console.log(err);
        this.toast.error("Please try again. " + err)
        this.ngxSpinnerService.hide()
      }
    });

  }
  
  
 


  GetSummary(pageNumber){
    if (!(this.StartDate && this.EndDate && this.StartTime && this.EndTime)) {
      this.toast.error("Kindly enter Start - End Date & Time");
      return;
    }

    if (new Date(this.StartDate) > new Date(this.maxDate) || new Date(this.EndDate) > new Date(this.maxDate)) {
      this.toast.error("Start or End Date can't be greater than current Date");
      return;
    }

    const startDateTime = this.combineDateTime(this.StartDate, this.StartTime);
    const endDateTime = this.combineDateTime(this.EndDate, this.EndTime);
    
    if (new Date(startDateTime) > new Date(endDateTime)) {
      this.toast.error("End Date-Time can't be greater than Start Date-Time!");
      return;
    }

     
    const obj = {
      "StartDate": startDateTime,
      "EndDate": endDateTime,
      "pageNumber" : pageNumber == '' ? "1" : pageNumber
    };
    if(this.submitClicked == true)
    {
      return;
    }
    this.Spinner = true
    this.ngxSpinnerService.show()
    console.log("Summary obj " , obj)
    this.submitClicked=true
    // alert("Return On ")
    // return
    if (pageNumber == '') {
      this.SummaryList = [];
      this.uniqueInvoiceCodes.clear();
      this.CurrentPage = 1;
    }
    
    this.gsxService.GetInvoiceSummary(obj).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        this.submitClicked= false 
        this.Spinner = false
        this.ngxSpinnerService.hide()
        // console.log("GSX reponse ", response)
        if (!(response.errors == undefined || response.errors == null)) {
          this.toast.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
        else {
          // console.log("Response from GSX ",response)
          if ( response?.code != null && response?.code != undefined){
            if (response.code == '0'){
              
              let responseData =  JSON.parse(response.message);
              let totalCount =0
              let dataArray: any
              try {
                if (responseData?.Headers['x-apple-total-count'] ) 
                totalCount = parseInt (responseData.Headers['x-apple-total-count'])
                dataArray= JSON.parse(responseData.Content);
              }
              catch (e) {
                // this.toast.warning("No Total Records Found! Setting Default to 50 Records!")
                totalCount = responseData.TotalCount  
                dataArray= JSON.parse(responseData.Content);
              }
              
              pageNumber == '' ? this.TotalPages = Math.ceil(totalCount / 50) : this.TotalPages  -= 1
              console.log("************Total Count **********" , totalCount)
              this.toast.info("Processing Page: " + this.CurrentPage.toString(), "Total Invoice Count: " + totalCount )
              this.CurrentPage += 1
              console.log("dataArray ", dataArray)
              if (Array.isArray(dataArray)) {
                dataArray.forEach(item => {
                  if (!this.uniqueInvoiceCodes.has(item.invoiceId)) {
                    this.uniqueInvoiceCodes.add(item.invoiceId);
                    this.SummaryList.push(item);
                  }
                });
              } else {
                if (!this.uniqueInvoiceCodes.has(dataArray.invoiceId)) {
                  this.uniqueInvoiceCodes.add(dataArray.invoiceId);
                  this.SummaryList.push(dataArray);
                }
              }
              
              if ( this.TotalPages <= 1 ){
                console.log("Summary List " , this.SummaryList)
                console.log("uniqueInvoiceCodes  " , this.uniqueInvoiceCodes)
                // alert("Return on, contact Admin!")
                
                // if (this.invObjList[0].invoiceId  && this.invObjList[0].invoiceId.includes('MB48730458')) {
                //   console.log("MGD2 ShipTo containing MB48730458:", this.invObjList[0]);
                //   this.Spinner = false
                //   this.ngxSpinnerService.hide()
                //   return
                // }
                this.onSaveIncomingInvoiceSummary()
             }
             else{
              // console.log("************Next Pages **********" , this.TotalPages)
              this.GetSummary(this.CurrentPage.toString())
             }
            }
            else{
              this.Spinner = false
              this.ngxSpinnerService.hide()
              this.toast.error(response.message)
            }
          }
        }
      },
      error: (err) => {
        this.submitClicked= false 
        this.Spinner = false
        this.ngxSpinnerService.hide()
        console.log(err);
        this.toast.error("Please try again. " + err , "Error", { closeButton: true, disableTimeOut: true })
        this.ngxSpinnerService.hide()
      }
    });

  }

  combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  async GetIncomingInvoiceDetails(inv ){
    this.InvoiceCode = inv?.invoiceId
    // this.InvoiceCode ='MA85537744'
    let requestData = {
      "invoiceId" :  this.InvoiceCode
    }
    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.Spinner = true
    this.ngxSpinnerService.show()

    try{
      const value = await lastValueFrom(this.gsxService.GetIncomingInvoiceDetail(contentRequest));
      this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          this.Spinner = false
          this.ngxSpinnerService.hide()
          this.toast.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
        else {
          // console.log("Response from GSX ",response)
          // console.log("dataArray ", this.invObjList)
          
          if (Array.isArray(response)){
            this.invObjList = response.map(invoice => this.mapToIncomingInvoice(invoice));
          }
          else{
            this.invObjList = [this.mapToIncomingInvoice(response)];
          }
          this.toast.info("Saving Invoice Code: " + this.invObjList[0].invoiceId.toString(), "Kindly Wait!")
          if (this.invObjList.length > 0 ){
            this.onSaveIncomingInvoiceDetails()
          } 
        }
    }
    catch (err) {
      
      this.ngxSpinnerService.hide()
      console.log(err);
      this.toast.error("Please try again. " + err , "Error", { closeButton: true, disableTimeOut: true })
      this.Spinner = false
    }
    

    // this.gsxService.GetIncomingInvoiceDetail(contentRequest).subscribe({
    //   next: (value) => {
        
    //   },
    //   error: (err) => {
       
    //   }
    // });

  }

  
  mapToIncomingInvoice(data: any): IncomingInvoiceHeader {

    let invoice = new IncomingInvoiceHeader();
    invoice.InvoiceGUID = uuidv4();
    invoice.invoiceId = data.invoiceId;
    invoice.invoiceDateTime = data.invoiceDateTime;
    invoice.requestType = data.requestType;
    invoice.invoiceTypeDescription = data.invoiceTypeDescription;
    invoice.invoiceTypeCode = data.invoiceTypeCode;
    invoice.currency = data.currency;
    invoice.CreatedBy = data.account?.CreatedBy; // Assuming CreatedBy is part of account
    invoice.price = data.price;
    invoice.parts = data.parts;
    if ( invoice.parts.length > 1){
      console.log("Invoice Code ",invoice.invoiceId, { closeButton: true, disableTimeOut: true } )
    }
    invoice.parts.forEach(part => {
      part.InvoiceDetailGuid = uuidv4()
      if (part?.device){
        this.IsSerialNoExists = true
        part.device.identifiers.SerialNoGuid = uuidv4()
      }
      else{
        this.IsSerialNoExists = false
      }
    })
    invoice.account = data.account;
    return invoice;
  }

  async onSaveIncomingInvoiceDetails( ) {
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveIncomingInvoice"
    })
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.InvoiceCode
    });
    requestData.push({
      "Key": "InvoiceStatus",
      "Value": 'OPEN'
    });    
    requestData.push({
      "Key": "IncomingInvoiceHeaderXML",
      "Value": this.IncomingInvoiceHeaderXML()
    });
    requestData.push({
      "Key": "IncomingInvoiceDetailsXML",
      "Value": this.IncomingInvoiceDetailsXML()
    });
    // requestData.push({
    //   "Key": "IsSerialNoExists",
    //   "Value": this.IsSerialNoExists
    // });
    requestData.push({
      "Key": "SerialNoDetailXML",
      "Value":  this.IsSerialNoExists ? this.IncomingInvoiceSerialNoXML() : ''
    });
    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    // console.log("Inc Data ", requestData, contentRequest);
    // // TODO:- 
    // alert("UAT TESTING Return On!")
    // return
    this.Spinner = true
    this.ngxSpinnerService.show()
    try {
      const value = await lastValueFrom(this.dynamicService.getDynamicDetaildata(contentRequest));
      
      this.SummaryLength = this.SummaryLength -1      
      this.Spinner = false
      this.ngxSpinnerService.hide()
      let response = JSON.parse(value.toString());
      if (response.ReturnCode == '0') {
        let ExtraData = JSON.parse(response.ExtraData);
        if ( this.SummaryLength == 0 ) {
          // this.GetIncomingInvoiceList('')
          // if (this.TotalPages > 0) {
          //   this.GetSummary(page)
          // }
          this.toast.success("Incoming Invoices saved Successfully!")
          window.location.reload();
        }
      }
      else {
        this.Spinner = false
        this.ngxSpinnerService.hide()
        console.log("Messages : " ,response)
        this.errorMessage = response.ErrorMessage;
        const parser = new xml2js.Parser({ strict: false, trim: true });
        parser.parseString( this.errorMessage , (error, result) => {
          console.log("Error Message: " , error)
          const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
          errorMessages.forEach((errorMessage) => {
            this.toast.error(errorMessage.ERRORMESSAGE,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
          });
        });     
      }
    } catch (err) {
          
          this.SummaryLength -= this.SummaryLength
          this.Spinner = false
          this.ngxSpinnerService.hide()
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toast.error( message,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
            } else {
              this.toast.error("Error parsing the error message.",'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
            }
          });
    }


    // this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
    //   {
    //     next: (value) => {

         
    //     },
    //     error: err => {
          
    //     }
    //   });
  }

  IncomingInvoiceHeaderXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    
    for (let item of this.invObjList) {
      count += 1
      let invoiceDate = item.invoiceDateTime.toString().replace('Z', '');
      rawData.rows.push({
        "row": {
		      "InvoiceGUID": item.InvoiceGUID,
          "InvoiceCode": item.invoiceId,
          "CompanyCode": glob.getCompanyCode() ,
          "InvoiceStatus":'OPEN',
          "InvoiceDocType":  item.invoiceTypeCode,
          "InvoiceTypeDescription" : item.invoiceTypeDescription,
          "Remark" : this.Remark,
          "InvoiceDate": invoiceDate,
          "LocationCode": '',
          "VendorCode": '',
          "ShipToGsxCode": item.account.shipTo,
          "SAPGrnCode": '',
          "IsSerialNoExists" : item.isSerialNoExists,
          "CurrencyCode":item.currency,
          "TotalNetAmount":this.dynamicService.removeCommas(item.price.subTotalAmount== null || item.price.subTotalAmount== undefined ? "0" : item.price.subTotalAmount.toString()),
          "TotalTaxAmount":this.dynamicService.removeCommas(item.price.tax == null || item.price.tax == undefined ? "0" : item.price.tax.toString()),
          "TotalGrossAmount": this.dynamicService.removeCommas(item.price.totalAmount == null || item.price.totalAmount == undefined ? "0" : item.price.totalAmount.toString()),
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    // console.log("Header xml ", xml)
    return xml;
  }
  
  IncomingInvoiceDetailsXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let inv of this.invObjList) {
      for (let item of inv.parts) {
        count += 1
        rawData.rows.push({
          "row": {
            "InvoiceDetailGuid": item.InvoiceDetailGuid,
            "InvoiceGUID": inv.InvoiceGUID ,
            "InvoiceCode": inv.invoiceId,
            "PartType":'',
            "ItemCode":  item.number,
            "ItemDescription": item.description,
            "Quantity": '1',
            "NetAmount": '0',
            "TaxAmount": '0',
            "GrossAmount": '0',
            "PurchaseOrderNumber" : item.purchaseOrderNumber,
            "RepairId" : item.repairId,
            "ServiceOrderNumber" : item.serviceOrderNumber
          }
        })
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    // console.log("Detailxml ", xml)
    return xml;
  }


  IncomingInvoiceSerialNoXML(){
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let inv of this.invObjList) {
      for ( let part of inv.parts){
        if (part?.device){
          if ( part.device.identifiers.serial && part.device.identifiers.serial != ''){
            count += 1
            rawData.rows.push({
              "row": {
                "InvoiceCode": inv.invoiceId,
                "InvoiceDetailGuid": part.InvoiceDetailGuid,
                "InvoiceGUID": inv.InvoiceGUID,
                "SerialNoGuid":  part.device.identifiers.SerialNoGuid,  
                "SerialNo": part.device.identifiers.serial,   
              }
            })
          }
        }
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    // console.log("Serial xml" , xml)
    return xml;
  }



  onSave(){

  }
  // async onSaveIncomingInvoiceDetails( ) {

  //   let requestData = []
  //   requestData.push({
  //     "Key": "APIType",
  //     "Value": "SaveIncomingInvoice"
  //   })
  //   requestData.push({
  //     "Key": "InvoiceGUID",
  //     "Value": this.InvoiceGUID
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
  //     "Key": "InvoiceStatus",
  //     "Value": "RELEASED"
  //   });
  //   requestData.push({
  //     "Key": "InvoiceDocType",
  //     "Value":  this.invoiceDocType
  //   });
  //   requestData.push({
  //     "Key": "InvoiceDate",
  //     "Value": '',
  //   });
  //   requestData.push({
  //     "Key": "LocationCode",
  //     "Value": this.locationData
  //   });
  //   requestData.push({
  //     "Key": "ShipToGsxCode",
  //     "Value": this.ShipToGsxCode
  //   });
  //   requestData.push({
  //     "Key": "SAPGrnCode",
  //     "Value": this.SAPGrnCode
  //   });
  //   requestData.push({
  //     "Key": "CurrencyCode",
  //     "Value": this.CurrencyCode
  //   });
  //   // requestData.push({
  //   //   "Key": "CaseGuid",
  //   //   "Value": this.params.caseguid == null || this.params.caseguid == undefined ? "00000000-0000-0000-0000-000000000000" : this.params.caseguid
  //   // });
  //   // requestData.push({
  //   //   "Key": "RetailCustomerCode",
  //   //   "Value": this.params.customercode == null || this.params.customercode == undefined ? "" : this.params.customercode
  //   // });
    
 
  //   requestData.push({
  //     "Key": "TotalTaxAmount",
  //     "Value": this.totalTaxAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalGrossAmount",
  //     "Value": this.totalGrossAmount
  //   });
  //   requestData.push({
  //     "Key": "TotalNetAmount",
  //     "Value": this.totalNetAmount
  //   });
  //   // requestData.push({
  //   //   "Key": "TotalBaseAmount",
  //   //   "Value": this.totalBaseAmount
  //   // });
  //   // requestData.push({
  //   //   "Key": "TotalTaxableAmount",
  //   //   "Value": this.totalTaxableAmount
  //   // });

  //   requestData.push({
  //     "Key": "IncomingInvoiceDetailsXML",
  //     "Value": this.IncomingInvoiceDetailsXML()
  //   });
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   console.log("Invoice", requestData)
    
  //   // // TODO:- 
  //   // alert("Return On ")
  //   // return
  //   this.ngxSpinnerService.show();
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         let response = JSON.parse(value.toString());
  //         if (response.ReturnCode == '0') {
  //           console.log("Request ", response)
  //           let ExtraData = JSON.parse(response.ExtraData);
  //           this.toast.success("Saved Incoming Invoices Successfully!")
  //         }
  //         else {
  //           this.ngxSpinnerService.hide()
  //           console.log("Messages : " ,response)
  //           this.errorMessage = response.ErrorMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString( this.errorMessage , (error, result) => {
  //             console.log("Error Message: " , error)
  //             const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
  //             errorMessages.forEach((errorMessage) => {
  //               this.toast.error(errorMessage.ERRORMESSAGE);
  //             });
  //           });     
  //         }
  //       },
  //       error: err => {
  //         this.ngxSpinnerService.hide();
  //         console.log("Error Message:- ", err)
  //         const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
  //         errors.forEach(error => {
  //           const messageIndex = error.indexOf("Message: ");
  //           if (messageIndex !== -1) {
  //             const messageSubstring = error.substring(messageIndex + 9).trim();
  //             const message = JSON.parse(messageSubstring).message;
  //             this.toast.error("Error:- " + message);
  //           } else {
  //             this.toast.error("Error parsing the error message.");
  //           }
  //         });
  //       }
  //     });
  // }

  async onSaveIncomingInvoiceSummary( ) {

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveIncomingInvoiceSummary"
    })
    requestData.push({
      "Key": "InvoiceXML",
      "Value": this.InvoiceSummaryXML()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log("Inc Data ", requestData, contentRequest);
    // // TODO:- 
    // alert("UAT TESTING Return On!")
    // return
    // this.Spinner = true
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            this.toast.info("Saved Incoming Invoices Summary Successfully!")
            if (this.SummaryList.length > 0 ){
              this.SummaryLength =this.SummaryList.length
              console.log("Summary lengtyh", this.SummaryLength)
              
              this.SummaryList.forEach ( item => {
                this.GetIncomingInvoiceDetails( item)
              })
            }

          }
          else {
            this.Spinner = false
            
            this.ngxSpinnerService.hide()
            console.log("Messages : " ,response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( this.errorMessage , (error, result) => {
              console.log("Error Message: " , error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toast.error(errorMessage.ERRORMESSAGE,'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
              });
            });     
          }
        },
        error: err => {
          this.Spinner = false
          this.ngxSpinnerService.hide()
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toast.error("Error:- " + message);
            } else {
              this.toast.error("Error parsing the error message.",'Error', { disableTimeOut: true, tapToDismiss: false, closeButton: true });
            }
          });
        }
      });
  }

  InvoiceSummaryXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.SummaryList) {
      count += 1
      let invoiceDate = item.invoiceCreateDate.toString().replace('Z', '');
      rawData.rows.push({
        "row": {
          "InvoiceCode": item.invoiceId,
		      "InvoiceDate": invoiceDate,
          "InvoiceTypeCode": item.invoiceTypeCode,
          "InvoiceTypeDescription": item.invoiceTypeDescription,
          "PartNumber": item.partNumber,
          "PurchaseOrderNumber": item.purchaseOrderNumber,
          "RepairId": item.repairId,
          "SerialNumber": item.serialNumber,
		      "IsProcessed": 0,
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }


  openDialog(item) {
    let dialogRef = this.dialog.open(this.callUpdateDialog, { disableClose: true });

    dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
            if (result === 'yes') {
              this.updateSAPGrnCode(item)
            } else if (result === 'no') {
              
            }
        }
    })
  }

  updateSAPGrnCode(item){
    console.log("Item ", item)
    if(this.SAPGrnCode == null || this.SAPGrnCode == undefined || this.SAPGrnCode == ''){
      this.toast.error("Kindly enter the GRN Code!")
      this.openDialog(item)
      return
    }


    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateIncomingInvoice"
    });
    requestData.push({
      "Key": "InvoiceGUID",
      "Value": item.InvoiceGuid
    });
    requestData.push({
      "Key": "SAPGrnCode",
      "Value": this.SAPGrnCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Save ", requestData);
    const ShouldContinue = confirm("Are you sure, Do you want to continue?" )
    if (ShouldContinue == false ){
      return
    }
    // // TODO 
    // alert("Return on")
    // return
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log("After Save ", response);
            // window.location.reload();
            this.GetIncomingInvoiceList('')
            this.toast.success("Saved Successfully")
            this.ngxSpinnerService.hide();
          }
          else {
            this.ngxSpinnerService.hide();
            console.log("Messages : " ,response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( this.errorMessage , (error, result) => {
              console.log("Error Message: " , error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toast.error(errorMessage.ERRORMESSAGE);
              });
            });     
          }
        },
        error: err => {
          this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex != -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toast.error("Error:- " + message);
            } else {
              this.toast.error("Error parsing the error message.");
            }
          });
        }
      });

  }


  exportReportData()
  {
    const startformattedDate = this.datePipe.transform(this.ExportStartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.ExportEndDate, 'yyyy-MM-dd');
    // this.results = []
    if((this.ExportStartDate != null || this.ExportStartDate != undefined) && (this.ExportEndDate != null || this.ExportEndDate != undefined ))
    {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportIncomingInvoiceReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
        })
        
        requestData.push({
          "Key":"StartDate",
          "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
        })
        requestData.push({
          "Key":"EndDate",
          "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
        })
        requestData.push({
          "Key": "InvoiceCode",
          "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? "" : this.InvoiceCode
        })
        requestData.push({
          "Key": "InvoiceStatus",
          "Value": this.InvoiceStatus == null || this.InvoiceStatus == undefined ? "" : this.InvoiceStatus
        })
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        
        this.reportService.downloadServiceReport('UNIVERSAL',contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                var url = URL.createObjectURL(blob);
                window.open(url);
                this.ngxSpinnerService.hide()

              } catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              console.log(err);
              this.ngxSpinnerService.hide()
            }
          }
        );
      }
    }
    else
    {
      this.toast.error("Please Select Start and End Date")
    }
  
  }



  GetIncomingInvoiceList(eventDetail) {
    // if (this.LocationCode== null || this.LocationCode == undefined || this.LocationCode == '' ){
    //   this.toast.error("Please select a Location");
    //   return;
    // }
    //  
    this.IncomingInvoiceList = []
    this.Spinner = true
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetIncomingInvoiceList"
    })
    requestdata.push({
      "Key":"InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key": "InvoiceStatus",
      "Value": this.InvoiceStatus == null || this.InvoiceStatus == undefined ? '' : this.InvoiceStatus
    });
    requestdata.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestdata.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.Spinner= true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          
          try {
            this.Spinner = false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                return
              }
              if( Array.isArray(data.IncomingInvoiceList?.IncomingInvoice) ) {
                this.IncomingInvoiceList = data.IncomingInvoiceList?.IncomingInvoice;
              }
              else{
                this.IncomingInvoiceList.push(data.IncomingInvoiceList?.IncomingInvoice)
              }
              this.TotalRecords = data.Totalrecords
              this.pageCount = Math.ceil(data.Totalrecords / this.pageSize)
              this.updateCurrentRange()
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.Spinner = false
          this.Spinner = false
          console.log(err)
        }

      }
    );
  }
  onPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
    this.updateCurrentRange()
  }
  updateCurrentRange() {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.TotalRecords);
    this.currentRange = `${start} – ${end} of ${this.TotalRecords}`;
  }

  togglePageSize() {
    if (this.UpdatedpageSize == null) {
      this.UpdatedpageSize = 10;
    }
    this.pageSize = this.UpdatedpageSize;
    this.pageIndex = 0; // Reset to the first page when page size changes
    this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    this.updateCurrentRange()
  }

  onNextPages() {
    
    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      this.updateCurrentRange()
    }
  }



  onClick(item)
  {
    
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/incoming-invoice'], {queryParams: {invoiceguid:item.InvoiceGuid}})
  }

  
  onIncomingStatusSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.IncomingInvoiceStatus, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.IncomingInvStatusDD = value;
        }
      },
      error: (err) => {
        this.IncomingInvStatusDD = DropDownValue.getBlankObject();
      }
    });
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.MultipleLocationCode = []
      this.LocationForJob.Data.forEach(item => {
        this.MultipleLocationCode.push(item.Id)
      } );
    } else {
      this.MultipleLocationCode = []
    }
  }
  

  enableBilling() {
    if(this.MultipleLocationCode == null || this.MultipleLocationCode == undefined || this.MultipleLocationCode.length < 1){
      this.toast.error("Please select a location")
      return 
    }
    this.GetLocationCodeXML()

    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "EnableInvoice",
    });
    requestData.push({
      "Key": "LocationXml",
      "Value": this.GetLocationCodeXML()
    });
    requestData.push({
      "Key": "Reason",
      "Value": this.ReasonForUnlock == null || this.ReasonForUnlock == undefined ? "" : this.ReasonForUnlock
    });
    requestData.push({
      "Key": "LockDocType",
      "Value": 'INCOMINGINVOICE'
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
            let ExtraData = JSON.parse(response.ExtraData);
            this.toast.success("Invoice enabled successfully!")
            this.hideCashEnablePopUp = true
          }
          else {
            console.log("Error Response: " , response)
           let errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( errorMessage , (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              console.log("Messages : " ,errorMessages)
              errorMessages.forEach((errorMessage) => {
                console.log("Error Message: " , error)
                this.toast.error(errorMessage.ERRORMESSAGE);
              });
            });   
          }
        },
        error: err => {
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toast.error("Error:-  " + message);
            } else {
              this.toast.error("Error parsing the error message.");
              
            }
          });
        }
      });
  }


  GetLocationCodeXML(){
    
    let rawData = {
      "rows": []
    }
    for (let item of this.MultipleLocationCode) {
      rawData.rows.push({
        "row": {
          "ReferenceCode":item,
          "LockDocType":'INCOMINGINVOICE',
          "LocationFlag":'1',
          "UserFlag":'0',
        }
      })
      
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("Part XML:- ",xml);
    return xml;

  
  }

  // update lock Date

  UpdateLockDate(){

  }

    LockDatePopUp(item){
      this.ShowLockDatePopUp =true
    console.log('UpdateLockDate' , item)

      this.CurrentLockDate = item.LockDate;
      this.CurrentLocationCode = item.LocationCode;
      this.CurrentInvoiceCode = item.InvoiceCode;
      this.CurrentInvoiceDate =item.InvoiceDate;
      this.CurrentInvoiceGuid=item.InvoiceGuid
  }
    CloseLockDatePopUp(){
      this.ShowLockDatePopUp =false
      
      this.CurrentLockDate = null;
      this.CurrentLocationCode = null;
      this.CurrentInvoiceCode =null;
      this.CurrentInvoiceDate =null;
      this.UpdatedLockDate=null;
      this.CurrentInvoiceGuid=null;
  }






   getDateDifference(invoiceDate: string | Date, lockDate: string | Date): string {
  const invoice = new Date(invoiceDate);
  const lock = new Date(lockDate);
  const diffTime = Math.abs(lock.getTime() - invoice.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 31 ? 'red' : 'green';
}

   UpdateInvoiceLockDate(){
      
    const presentDate = new Date();
    if(this.UpdatedLockDate == null || this.UpdatedLockDate ==undefined || this.UpdatedLockDate == ''){
           this.toast.error('Updated Lock Date cannot be Empty !');
           return
    }
    if(this.datePipe.transform(this.UpdatedLockDate, 'yyyy-MM-dd') < this.datePipe.transform(presentDate, 'yyyy-MM-dd')){
           this.toast.error('Updated Lock Date cannot  be Past date !');
           return
    }
      
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateIncomingInvoiceLockDate",
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.CurrentLocationCode
    });
    requestData.push({
      "Key": "InvoiceCode",
      "Value": this.CurrentInvoiceCode
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.CurrentInvoiceGuid
    });
    requestData.push({
      "Key": "UpdatedLockDate",
      "Value":   this.datePipe.transform(this.UpdatedLockDate, 'yyyy-MM-dd')
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log('update lock date ' ,contentRequest);
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            this.toast.success("Lock Date Updated successfully!")
            this.CloseLockDatePopUp()
             window.location.reload();
            this.hideCashEnablePopUp = true
          }
          else {
            this.CloseLockDatePopUp()
            console.log("Error Response: " , response)
           let errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( errorMessage , (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              console.log("Messages : " ,errorMessages)
              errorMessages.forEach((errorMessage) => {
                console.log("Error Message: " , error)
                this.toast.error(errorMessage.ERRORMESSAGE);
              });
            });   
          }
        },
        error: err => {
          this.CloseLockDatePopUp()
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1);
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toast.error("Error:-  " + message);
            } else {
              this.toast.error("Error parsing the error message.");
              
            }
          });
        }
      });
   }


}
