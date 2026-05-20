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
import { MatDatepicker } from '@angular/material/datepicker';import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import {DatePipe, Location} from '@angular/common'
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';


@Component({
  selector: 'app-cash-deposit',
  templateUrl: './cash-deposit.component.html',
  styleUrls: ['./cash-deposit.component.css']
})
export class CashDepositComponent implements OnInit {

  // Cash Deposit 
  CashDepositGUID: string;
  CashDepositCode: string;
  LocationCode: string;
  selectedDate : Date
  BankCode: string
  Remark: string
  TotalDepositAmount: number =0
  NotesUsed: number = 0;
  hideLocation = true
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  BankDD: DropDownValue = DropDownValue.getBlankObject();
  openCustomerList=false
  errorMessage = "";
  CurrencyNotes = [2000, 500, 200, 100, 50,20, 10, 5, 2,1]
  CurrencyList: any[] = []
  DebitAmount: number =0
  CreditAmount: number =0
  TotalCollection: number =0
  ThisDayCollection: number =0;
  // Misc:-
  CustomerObject: any[] = []
  LocationObject: any[] = []
  spinner = false
  params: any;
  currentDate: Date;
  userName: string; 
  isEdit = false
  UploadImage = false
  // Local Approver:-
  isApprover: boolean = false;
  ApproverLevel: number = 0;
  CreatedBy: string;
  showButtons = false ;
  // Status
  ApprovalStatusDD = ['SENT FOR APPROVAL', 'APPROVED', 'PARTIALLY APPROVED' ];
  // File Upload
  isImageUpload = false
  FileUploadList: any[] =[]
  
  // Remarks Part
  isRemark = false;
  isRemarkUpload= false;
  RemarkLevel: number;
  RemarkUploadList: any[] =[]; // Remark in request is object and in Approval is List

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  submitClicked = false

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
    private route: Router,
    private datePipe: DatePipe,
    private location:Location,
    private gsxService: GsxService,
  ) { }


  ngOnInit(): void {
    
    this.submitClicked=false;
    this.currentDate = new Date();
    this.params = this.activatedRoute.snapshot.queryParams;
    this.userName = glob.getLogedInUser().UserDetails.UserName;
    this.onLocationSearch({ term:"", item:[]})
    
    this.CashDepositGUID = uuidv4()
    if (Object.keys(this.params).length == 0) {
      this.hideLocation = false 
    }
    else{
      this.GetCashDepositObject()
    }
    
    const allowedParams = ['locationcode',  'cashdepositguid'];
    // Check if any additional parameters are present
    const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
    if (additionalParams.length > 0) {
      this.toastMessage.warning("Access Denied");
      this.location.back();
      return;
    }
    this.onBankSearch({ term:"", item:[]})
  }

 
  onLocationSearch($event: { term: string; item: any[] }) {
    // console.log("Term", event)
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          // console.log("Location Data :- ", this.LocationForJob);
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }
  onBankSearch($event: { term: string; item: any[] }) {
    // console.log("Term", event)
    this.dropdownDataService.fetchDropDownData(DropDownType.Bank, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BankDD = value;
          console.log("Bank Data :- ", this.BankDD);
        }
      },
      error: (err) => {
        this.BankDD = DropDownValue.getBlankObject();
      }
    });
  }

  async IsApproverObject(){
    this.ngxSpinnerService.show()

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetApprovalSettingDetailObject"
    })
    requestData.push({
      "Key": "ApprovalProcess",
      "Value": "RefundApproval"
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode == null || this.params.locationcode ==undefined ? this.LocationCode : this.params.locationcode
    })
    let strRequestData = JSON.stringify(requestData)
    let contentRequest ={
      "content": strRequestData,
    }
    try {
        const observable = this.dynamicService.getDynamicDetaildata(contentRequest);
        const value = await lastValueFrom(observable);

        const response = JSON.parse(value.toString());
        console.log("Approval Object Response", response)
        if (response.ReturnCode == '0') {
         
          let extraDataResponse = JSON.parse(response?.ExtraData);
          console.log("Approval Object Extra", extraDataResponse);
          if (extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson == this.userName ) {
              console.log( " Approver ", extraDataResponse?.ApprovalSettingDetail?.ApprovalPerson)
              this.isApprover = true
              this.toastMessage.error("Approvers can't create a Refund Request")
          }
        } else {
          console.log("Error in getting the Approval Object");
        }
      } catch (error) {
        console.log("Error:- ", error);
        // Handle the error
      }
  }
  
  GetLocationObject() {
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetLocationObject"
    })
    if ( this.params.locationcode == null || this.params.locationcode == undefined){
      this.toastMessage.error("No Location Code found!")
      return
    } 
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.params.locationcode
    })
    requestdata.push({
      "Key":"CompanyCode",
      "Value":glob.getCompanyCode()
    })
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest = {
      "content": strRequestData
    };
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next:(response:any)=>{
        this.ngxSpinnerService.hide();
        let data = JSON.parse(response)
        if(data.ReturnCode == "0")
        {
          let extraData = JSON.parse(data.ExtraData)
          this.LocationObject = [extraData.Location] // Wrap the Object as an Array instead
          this.LocationCode = extraData?.Location?.LocationCode
          // console.log("Location Object:- ", extraData)
          this.ngxSpinnerService.hide()
        }
      }
    });
  }


  addDeposit(){
    const today = new Date();
    if (this.LocationCode == null || this.LocationCode == undefined){
      this.toastMessage.error("Please select a location")
    }
    else{
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/cash-deposit'], { queryParams: { locationcode: this.LocationCode} })
    }
  }

  async GetCashDepositObject()
  {
    const today = new Date();
    if ( this.params.locationcode == null || this.params.locationcode == undefined){
      this.toastMessage.error("Please select a location")
      return
    }
    // if ( this.selectedDate > today ){
    //   this.toastMessage.error("Can't Select a Future Date")
    //   this.selectedDate = null
    //   this.TotalCollection = 0
    //   this.ThisDayCollection = 0
    //   return
    // }

    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetCashDepositObject"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value":  this.params.locationcode == null || this.params.locationcode == undefined ? this.LocationCode : this.params.locationcode
    })
    requestdata.push({
      "Key":"Date",
      "Value": this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    })
    if (this.params.cashdepositguid != null || this.params.cashdepositguid != undefined)
    {
      requestdata.push({
        "Key":"CashDepositGUID",
        "Value": this.params.cashdepositguid 
      })
    }
    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Sending ", requestdata)
    this.showSpinner()
    try {
          let Value = await lastValueFrom(this.dynamicService.getDynamicDetaildata(contentRequest));
          this.hideSpinner()
          this.ngxSpinnerService.hide();
          let response = JSON.parse(Value.toString());
          console.log("Response is ", response)
          // Get Cash Deposit Object
          if (this.params.cashdepositguid != null || this.params.cashdepositguid != undefined)
          {
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
                if (data.Totalrecords == "0"){
                  this.toastMessage.error("No Data Found")
                  this.route.navigate(['/auth/' + glob.getCompanyCode() + '/cash-deposit-list']);
                  return
                }
                console.log("Cash Deposit Object:- ", data)
                // Set all the Data like DDs and Objects:- 
                this.CashDepositGUID = data.CashDepositObject.CashDepositGUID
                this.LocationCode = data.CashDepositObject.LocationCode
                this.TotalDepositAmount = data.CashDepositObject.TotalAmount
                this.CashDepositCode = data.CashDepositObject.CashDepositCode
                this.BankCode = data.CashDepositObject.BankCode
                this.Remark = data.CashDepositObject.Remark
                this.selectedDate = data.CashDepositObject.CreatedDate
                this.TotalCollection =  data.CashDepositObject.TotalCollection

                if( Array.isArray(data?.CashDepositObject?.CashDepositRow) ) {
                  this.CurrencyList = data?.CashDepositObject?.CashDepositRow;
                }
                else{
                  this.CurrencyList.push(data?.CashDepositObject?.CashDepositRow)
                }
                this.NotesUsed = this.CurrencyList.length
                this.GetFileObject()
                // this.IsApproverObject();
            }
            else{
              this.toastMessage.error("Error ")
            }
          }
          // Get Total Cash Deposit Amount
          else{
            this.isEdit = true
            this.UploadImage = true
            this.CurrencyList = []
            // Cash Deposit Initialization
            for (const note of this.CurrencyNotes) {
              this.CurrencyList.push({
                Denomination: note,
                DenominationQty: 0,
                DenominationAmount: 0
              });
            }
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
                console.log("Cash Deposit Object:- ", data)
                this.DebitAmount = data.CashDepositObject.DebitAmount
                this.CreditAmount = data.CashDepositObject.CreditAmount
                this.TotalCollection = this.DebitAmount - this.CreditAmount
                this.ThisDayCollection = data.CashDepositObject.ThisDayCollection
                // console.log("cash  List :- ", this.SelectItemsList)
              }
              else{
                // Cash Deposit Already Exists for the Day
                console.log("Error:- ", response.ErrorMessage)
                this.toastMessage.error(response.ErrorMessage)
                this.selectedDate = null
                this.TotalCollection = 0
                this.ThisDayCollection = 0
            }
      
          }
          this.GetLocationObject()
    
      } catch (ext) {
        error: err => {
          this.hideSpinner()
          console.log(err)
        }
      }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  onDenominationQtyKeyPress(event: KeyboardEvent) {
    // Prevent the key press if it's 'e'
    if (event.key.toLowerCase() == "e") {
      event.preventDefault();
    }
  }

  CalculateAmount(event, note) {
    //  
    // console.log(" Note event ", event ,"\nNote event ", note)
    let index = this.CurrencyList.findIndex(item => item.Denomination == note.Denomination);
    let previousQty = this.CurrencyList[index].DenominationQty

    if (event.data === "e" || event.data === "." || event.data === "-") {
      this.CurrencyList[index].DenominationQty = previousQty;
      event.target.value = previousQty;
      this.toastMessage.error("Invalid Quantity! Please enter again")
      // return
    }
    if (Number.isInteger(note.DenominationQty) && note.DenominationQty >= 0) {
      this.CurrencyList[index].DenominationAmount = note?.Denomination * note?.DenominationQty;
    }
    else {
      this.CurrencyList[index].DenominationQty = 0
      this.CurrencyList[index].DenominationAmount = 0
    }
    this.TotalDepositAmount = this.CurrencyList
  .reduce((total, item) => total + (item.DenominationAmount || 0), 0);

    
    // this.TotalDepositAmount = this.CurrencyList
    //   .filter(item => item.DenominationAmount != 0 ||  item.DenominationAmount == null ||  item.DenominationAmount == undefined)
    //   .reduce((total, item) => total + item.DenominationAmount, 0);
    
    this.NotesUsed = this.CurrencyList.reduce(
      (noteCount, item) => noteCount + (item.DenominationQty != 0 ? 1 : 0),0
    );
    // console.log("Currency List ", this.CurrencyList)

  }
  

  async onSubmit() {


    const allAmountsZero = this.CurrencyList.every(item => item.DenominationAmount == 0);
    if (allAmountsZero) {
        this.toastMessage.error("Please enter atleast one Quantity!");
        return;
    }
    const isValidAmounts = this.CurrencyList.every(item => item.DenominationAmount == item.Denomination * item.DenominationQty);
    if (!isValidAmounts) {
        this.toastMessage.error("Denomination Amounts do not match with Denomination Quantities.");
        return;
    }
    const isAmountNonNegative = this.CurrencyList.every(item => item.DenominationAmount>=0 && item.DenominationQty>=0);
    if (!isAmountNonNegative) {
        this.toastMessage.error("Denomination Amount or Denomination Quantities can't be negative");
        return;
    }
    if (this.BankCode == '' || this.BankCode == null || this.BankCode== undefined ) {
      this.toastMessage.error("Please select a Bank")
      return
    }
    if ( this.TotalDepositAmount == null || this.TotalDepositAmount == undefined || this.TotalDepositAmount < 1){
      this.toastMessage.error("Deposit Amount must be greater than zero")
      return
    }
    console.log("Math Round ", Math.round(this.TotalCollection - 100) )
    console.log("Math Round ", Math.round(this.TotalCollection + 100) )
    if ( (this.TotalDepositAmount >  Math.round(this.TotalCollection + 100))){
      this.toastMessage.error("Deposit Amount can't be greater than +100 Rs. to the Cash In Hand Amount")
      return
    }
    if ( this.FileUploadList.length < 1 ){
      this.toastMessage.error("Atleast one attachment has to be uploaded!")
      return
    }
    // if (this.Remark) {
    //   this.toastMessage.error("Please enter Remark")
    //   return;
    // }
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false ){
      return
    }
    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true  
    this.showSpinner()
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveCashDeposit",
    });
    requestData.push({
      "Key": "CashDepositGUID",
      "Value": this.CashDepositGUID
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.params.locationcode == null || this.params.locationcode == undefined ?  this.LocationCode : this.params.locationcode
    });
    requestData.push({
      "Key": "CashDepositDate",
      "Value": this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    });
    requestData.push({
      "Key": "BankCode",
      "Value": this.BankCode
    });
    requestData.push({
      "Key": "Status",
      "Value": 'VERIFIED'
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.Remark == null || this.Remark == undefined ? "" : this.Remark
    });
    requestData.push({
      "Key": "PreviousDepositAmount",
      "Value": this.TotalCollection
    });
    requestData.push({
      "Key": "TotalAmount",
      "Value": this.TotalDepositAmount
    });
    requestData.push({
      "Key": "CashDepositDetailXML",
      "Value": this.cashDepositDetailsXML()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before ", requestData)
    // // TODO
    // this.submitClicked = false
    // this.SaveFiles();
    // alert("Return On")
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            
            console.log("Request ", response)
            let ExtraData = JSON.parse(response.ExtraData);
            this.toastMessage.success('Cash Deposited Succesfully')
            this.saveCashDepositToSAP();
          }
          else {
            this.submitClicked= false 
            this.hideSpinner()
            console.log("Error Response: " , response)
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
          this.submitClicked= false
          this.hideSpinner()
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

  async saveCashDepositToSAP(){
    
    this.ngxSpinnerService.show()
    this.gsxService.saveCashDeposit(this.CashDepositGUID).subscribe({
      next: (value: any) => {
        
        console.log("After Saving to SAP ",value) ;
        this.ngxSpinnerService.hide()
        if (value.error != null || value.error != undefined) {
          this.toastMessage.error(value.error.errorMessage)
        }
        else {
          this.SaveFiles()
          this.toastMessage.info('Cash Posted to SAP successfully!')
          console.log(value)
        }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err)
      }
    })
  }

  cashDepositDetailsXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.CurrencyList) {
      if (item.DenominationAmount > 0 && item.DenominationAmount == item.Denomination * item.DenominationQty) {
        count ++;
        rawData.rows.push({
          "row": {
            "CashDepositDetailGUID": uuidv4(),
            "CashDepositGUID": this.CashDepositGUID,
            "Denomination": item.Denomination ,
            "DenominationQty": item.DenominationQty,
            "DenominationAmount": item.DenominationAmount,
          }
        })
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("XML is:- ", xml)
    console.log("Length is:- ", count)
    return xml;
  }

  showSpinner() {
    this.spinner = true;
  }

  hideSpinner() {
    this.spinner = false;
  }
  printCashDeposit(){

  }

  // FILE UPLOAD PART ************************************************************************************************
  onFileListChanged(event){
    this.FileUploadList = event;
    this.isImageUpload = false;
  }

    
  GetFileObject(){
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetTransactionAttachmentObject"
    })
    requestData.push({
      "Key": "TransactionGUID",
      "Value": this.CashDepositGUID
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
            if (response.Totalrecords != "0") {
              let data = JSON.parse(response.ExtraData)
              console.log("File Object" , data)
              
              if ( data?.AttachmentList == null || data?.AttachmentList == undefined ){
                this.UploadImage = true
                this.toastMessage.error("No Files found, kindly upload atleast one file!")
                return
              }
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
  
    
  async sendFilesToServer(){
    
    const uploadPromises = this.FileUploadList.map(async (file) => {
      var ext =  file.filename.split('.').pop();
      var filename = uuidv4() +"." +  ext;
      // let formData = new FormData();
      // formData.append('file', , filename);
      const result = await this.dynamicService.uploadFileToS3Local(file.AttachmentFile, filename);
      file.src = result['dbPath'] // glob.GLOBALVARIABLE.SERVER_LINK + result['dbPath']
    });
    await Promise.all(uploadPromises);
  }

  saveFilesXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.FileUploadList) {
      count += 1
      rawData.rows.push({
        "row": {
          "AttachmentGUID": item.AttachmentGUID == null || item.AttachmentGUID == undefined ? uuidv4() : item.AttachmentGUID,
          "FileName": item.filename ,
          "FileType": item.type,
          "CreatedDateTime": item.createdDateTime == null || item.createdDateTime == undefined ? new Date().toISOString() : item.createdDateTime.toISOString(),
          "AttachmentFile": item.src,  
          "CloudFlag" : "1"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    // console.log("File XML is:- ", xml)
    return xml;
  }

  async SaveFiles(){
    
    let requestData = []
    try{
        await this.sendFilesToServer();
    } 
    catch (error) {
        this.submitClicked= false
        this.toastMessage.error("Error in Uploading Files to Server");
        return;
    }
    
    requestData.push({
      "Key": "APIType",
      "Value": "SaveTransactionAttachment"
    })
    requestData.push({
      "Key": "TransactionGUID",
      "Value": this.CashDepositGUID
    })
    requestData.push({
      "Key":  "TransactionDocType",
      "Value": 'DEPOSIT'
    })
    requestData.push({
      "Key": "FilesXml",
      "Value": this.saveFilesXML()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    }
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.submitClicked= false
          // this.ngxSpinnerService.hide()
          // console.log("Request ", value)
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            // console.log("ExtarData", ExtraData)
            this.hideSpinner();
            this.toastMessage.success('File uploaded succesfully')
            this.route.navigate(['/auth/' + glob.getCompanyCode() + '/cash-deposit-list']);
          }
          else {
            this.submitClicked= false
            this.hideSpinner()
            console.log("Messages : " ,response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( this.errorMessage , (error, result) => {
              console.log("Error Message: " , error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toastMessage.error(errorMessage.ERRORMESSAGE);
              });
            });     
          }
        },
        error: err => {
          
          this.submitClicked= false
          this.hideSpinner()
          // this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });

  }


}
