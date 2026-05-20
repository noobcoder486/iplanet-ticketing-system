import { Component, OnInit, SimpleChanges } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "../../config/global";
import xml2js from 'xml2js';
import { Location } from '@angular/common'
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-incoming-invoice',
  templateUrl: './incoming-invoice.component.html',
  styleUrls: ['./incoming-invoice.component.css']
})
export class IncomingInvoiceComponent implements OnInit {


  typeSelected = 'ball-clip-rotate';
  isPartSelector: boolean = false;
  InvoiceDetailList: any[] = []
  SerialNoList : { InvoiceDetailGuid: string;  ItemCode: string; Quantity: number; SerialNos: any[] }[] =[]
  anySerialNoMissing: boolean = false
  showSerialNoList: any[] =[]
  SerialNo: string;
  ItemCode: string;
  selectedInvoiceDetailGuid: string | null = null;
  MaterialWithMissingSerialNo: Set<string> = new Set();
  CheckSerialNoList : { SerialNo: string;  List : { InvoiceDetailGuid: string;  ItemCode:string; Index: number}[] }[] =[]
  UniquesSerialNos: Set<string> = new Set();
  ItemCodePresent : Set<string> = new Set();
  TotalSerialNos: number =0;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  params: any;
  isEdit: boolean = false
  LocationCode: string;
  InvoiceObject : any;
  InvoiceDocType: string;
  InvoiceStatus: string;
  InvoiceCode: string;
  InvoiceGuid: string;
  CreatedDate: Date;
  errorMessage: any;
  submitClicked= false;
  Remark : string 
  isLocalApprover= false
  EnableBillingFlag: boolean  = false
  constructor(
    private dynamicService : DynamicService,
    private dropdownDataService: DropdownDataService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
    private gsxService: GsxService,
    private location: Location,
    private ngxSpinnerService:NgxSpinnerService
  ) { }


  

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    this.checkLocalPermission()

    if (Object.keys(this.params).length == 0) {
      // console.log("Params are ",this.params))
      this.toastMessage.warning("Access Denied")
      this.location.back()
    }
    else{
     
      if (this.params.invoiceguid != null || this.params.invoiceguid != undefined) {
        this.InvoiceGuid = this.params.invoiceguid
        this.getIncomingInvoiceObject()
      }
      else {
        this.toastMessage.error("Invoice Not Found")
        this.location.back()
      }

      const allowedParams = ['invoiceguid'];

      // Check if any additional parameters are present
      const additionalParams = Object.keys(this.params).filter(param => !allowedParams.includes(param));
      if (additionalParams.length > 0) {
        this.toastMessage.warning("Access Denied");
        this.location.back();
        return;
      }
    }
  }
    
  
  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    
    if(resp?.View == true){
      this.isLocalApprover = true;
      if ( this.InvoiceStatus == 'SERIALNOUPDATED' ){
        this.isEdit = true
      }
    }
    return resp != undefined && resp?.View ? true : false;
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  getIncomingInvoiceObject(){
    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "GetIncomingInvoiceObject"
    })
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.InvoiceGuid
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
              
              console.log("incoming Invoice Object" , data)
              this.InvoiceObject = data
              this.LocationCode = data?.LocationCode
              this.InvoiceDocType = data?.InvoiceDocType
              this.InvoiceStatus = data?.InvoiceStatus
              this.InvoiceCode = data.InvoiceCode
              this.Remark = data.Remark
              this.InvoiceGuid = data.InvoiceGuid
              this.CreatedDate= data.InvoiceDate
              this.EnableBillingFlag = data?.EnableBillingFlag == '1' ? true: false
              this.InvoiceStatus == 'OPEN' ? this.isEdit = true : this.isEdit = false
              this.checkLocalPermission()

              if (Array.isArray(data?.DetailObject?.IncomingInvoiceDetail)) {
                this.InvoiceDetailList = data?.DetailObject?.IncomingInvoiceDetail
              }
              else {
                this.InvoiceDetailList.push(data?.DetailObject?.IncomingInvoiceDetail)
              }

              // Extract Serial Nos for each ItemCode
              let tempSerialList= [];
              if (data?.SerialNoObject?.SerialNoDetail){
                Array.isArray(data?.SerialNoObject?.SerialNoDetail) ? 
                    tempSerialList = data?.SerialNoObject?.SerialNoDetail : 
                        tempSerialList.push(data?.SerialNoObject?.SerialNoDetail)
              }
              console.log("Temp Serial ", tempSerialList)
              this.InvoiceDetailList.forEach(item =>{
                  // const serialNoItem ={
                  //   InvoiceDetailGuid : item.InvoiceDetailGuid,
                  //   ItemCode: item.ItemCode, 
                  //   Quantity: item.Quantity,
                  //   SerialNos: [] 
                  // }
                  // let itemQuantity = +item.Quantity 
                  // this.TotalSerialNos = this.TotalSerialNos + itemQuantity
                  // let currentIndex = 0;

                  // if (tempSerialList.length != 0 && tempSerialList[0] != undefined) {
                  //   tempSerialList.forEach( part => {
                  //     // console.log("currentIndex ", currentIndex)
                  //     if ( part.InvoiceDetailGuid == item.InvoiceDetailGuid) {
                  //       serialNoItem.SerialNos.push({ 
                  //         Index: currentIndex,
                  //         SerialNo: part.SerialNo,
                  //         SerialNoGuid: part.SerialNoGuid,
                  //         LastUpdatedDate: part.LastupdatedDate
                  //       })
                  //       currentIndex ++ // Only after pushing the SerialNoInfo
                  //     }
                  //   })
                  // }
                  // // console.log("itemQuantity  ", itemQuantity)
                  // for ( let i = currentIndex ; i < itemQuantity; i++ ){
                  //   serialNoItem.SerialNos.push({ 
                  //     Index: i ,
                  //     SerialNo: '',
                  //     SerialNoGuid: null,
                  //     LastUpdatedDate: null
                  //   })
                  // }
                  // this.SerialNoList.push(serialNoItem)

                if (item.PartType == 'Material'){
                  const serialNoItem ={
                    InvoiceDetailGuid : item.InvoiceDetailGuid,
                    ItemCode: item.ItemCode, 
                    Quantity: item.Quantity,
                    SerialNos: [] 
                  }


                  let itemQuantity = +item.Quantity 
                  this.TotalSerialNos = this.TotalSerialNos + itemQuantity
                  let currentIndex = 0;

                  if (tempSerialList.length != 0 && tempSerialList[0] != undefined) {
                    tempSerialList.forEach( part => {
                      // console.log("currentIndex ", currentIndex)
                      if ( part.InvoiceDetailGuid == item.InvoiceDetailGuid) {
                        serialNoItem.SerialNos.push({ 
                          Index: currentIndex,
                          SerialNo: part.SerialNo,
                          SerialNoGuid: part.SerialNoGuid,
                          LastUpdatedDate: part.LastupdatedDate
                        })
                        currentIndex ++ // Only after pushing the SerialNoInfo
                      }
                    })
                  }
                  // console.log("itemQuantity  ", itemQuantity)
                  for ( let i = currentIndex ; i < itemQuantity; i++ ){
                    serialNoItem.SerialNos.push({ 
                      Index: i ,
                      SerialNo: '',
                      SerialNoGuid: null,
                      LastUpdatedDate: null
                    })
                  }
                  this.SerialNoList.push(serialNoItem)
                }
              })
              console.log("Serial List", this.SerialNoList)
              console.log("TotalSerialNos", this.TotalSerialNos)
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

  openSerialList(item) {
    if (this.selectedInvoiceDetailGuid != item.InvoiceDetailGuid) {
      this.selectedInvoiceDetailGuid = item.InvoiceDetailGuid;
    }
    let Item = this.SerialNoList.find(item => item.InvoiceDetailGuid == this.selectedInvoiceDetailGuid)
    this.ItemCode = Item.ItemCode;
    this.showSerialNoList = Item.SerialNos
    // console.log("Show serial ", this.showSerialNoList)
  }

  
  storeSerialNo(event){
    // console.log("Serial No event ", event)
    let index = this.SerialNoList.findIndex( item => item.InvoiceDetailGuid == this.selectedInvoiceDetailGuid  )
    // console.log("Index ", index)
    if (index != -1 && event.Index < this.SerialNoList[index].SerialNos.length) {
      this.SerialNoList[index].SerialNos[event.Index].SerialNo = event.SerialNo; 
    }
    // console.log("Serial No Updated: ", this.SerialNoList)
  }
  
  // onItemCodeClick(item) {
  //   if (this.selectedInvoiceDetailGuid != item.InvoiceDetailGuid) {
  //     this.selectedInvoiceDetailGuid = item.InvoiceDetailGuid;
  //   }
  // }

  // getFilteredSerialNos(invoiceDetailGuid: string): { InvoiceDetailGuid: string; ItemCode: string; Quantity: number; SerialNos: string[] } | undefined {
  //   let item = this.SerialNoList.find(item => item.InvoiceDetailGuid == invoiceDetailGuid)
  //   // console.log("Serial List ", item)
  //   return ;  
  // }


   onSubmit() {


    this.MaterialWithMissingSerialNo = new Set()
    this.CheckSerialNoList =[]
    this.UniquesSerialNos = new Set()

    let listLength = this.SerialNoList.length
    let countIndex = 0 , missingSerialNoCount = 0

    while ( countIndex != listLength ) {
      this.SerialNoList[countIndex].SerialNos.forEach( (serial, serialIndex) => {  
        // If No Serial Number Entered:- then add count by 1, and also add the ItemCode in a List
        if ( serial.SerialNo == null || serial.SerialNo == undefined || serial.SerialNo == ''){
          this.anySerialNoMissing = true
          missingSerialNoCount ++ 
          this.MaterialWithMissingSerialNo.add( this.SerialNoList[countIndex].ItemCode ) 
        } 
        else{
        // If Serial Number has been Entered:- then add Serial No and its Duplicate entries in a List
          const key = serial.SerialNo
          if(this.UniquesSerialNos.has(key)){
            let existingSerialIndex = this.CheckSerialNoList.findIndex( sr => sr.SerialNo == key)
            this.CheckSerialNoList[existingSerialIndex].List.push({
              InvoiceDetailGuid : this.SerialNoList[countIndex].InvoiceDetailGuid,
              ItemCode: this.SerialNoList[countIndex].ItemCode,
              Index: serialIndex 
            })
          }
          else{
            this.UniquesSerialNos.add(key)
            this.CheckSerialNoList.push({
              SerialNo : key,
              List: [{
                InvoiceDetailGuid : this.SerialNoList[countIndex].InvoiceDetailGuid,
                ItemCode: this.SerialNoList[countIndex].ItemCode,
                Index: serialIndex 
              }]
            })
          }
        }
      })
      countIndex ++ 
    }

    // console.log("Item with Missing SNo ", this.MaterialWithMissingSerialNo)
    // console.log("missingSerialNoCount", missingSerialNoCount)
    // console.log("CheckSerialNoList", this.CheckSerialNoList)

    if ( missingSerialNoCount == this.TotalSerialNos ){
      this.toastMessage.error("Atleast one Serial Number should be entered!")
      return
    }
    if ( this.CheckSerialNoList.some( serialEntry => serialEntry.List.length > 1) ){
      this.CheckSerialNoList.forEach( serialEntry => {
        if ( serialEntry.List.length > 1 ){
          const duplicatesInfo = serialEntry.List.map(entry => {
            return `ItemCode: ${entry.ItemCode}, Sr. No.: ${entry.Index + 1}`;
          }).join(', ');    
          this.toastMessage.error(`For Serial No: ${serialEntry.SerialNo}, Multiple Entries found in ${duplicatesInfo}`, "", { closeButton: true, disableTimeOut: true });
        }
      })
      return
    }


    if ( missingSerialNoCount < this.TotalSerialNos ){
      this.MaterialWithMissingSerialNo.forEach( partCode => {
        this.toastMessage.warning("some missing Serial Numbers for this Part Code" , partCode, { closeButton: true, disableTimeOut: true })
      })
    }
    if (missingSerialNoCount == 0){
      this.anySerialNoMissing = false    
    }

    let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveSerialNoForIncomingInvoice"
      });
      requestData.push({
        "Key": "InvoiceGuid",
        "Value": this.InvoiceGuid
      });
      requestData.push({
        "Key": "InvoiceStatus",
        "Value": missingSerialNoCount == 0 ? 'SERIALNOUPDATED' : 'OPEN'
      });
      requestData.push({
        "Key": "Remark",
        "Value": this.Remark
      });
      requestData.push({
        "Key": "SerialNoDetailXML",
        "Value": this.GetSerialNoDetailXML()
      });
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Before Save ", requestData);
      let message: string;
      console.log("anySerialNoMissing ", this.anySerialNoMissing);
      this.anySerialNoMissing == true ? message = "Missing Serial Numbers! Do you want to continue?" : message =  "Are you sure, Do you want to continue?" 
      const ShouldContinue = confirm(message)
      if (ShouldContinue == false ){
        return
      }
      if(this.submitClicked == true)
      {
        return;
      }
      this.submitClicked=true 

      // // TODO
      // alert("Return On")
      // this.submitClicked= false
      // return

      this.ngxSpinnerService.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              console.log("After Save ", response);
              window.location.reload();
              this.toastMessage.success("Saved Successfully")
              this.ngxSpinnerService.hide();
            }
            else {
              this.submitClicked = false
              this.ngxSpinnerService.hide();
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
            // this.hideSpinner()
            this.submitClicked = false
            this.ngxSpinnerService.hide();
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex != -1) {
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

  GetSerialNoDetailXML(){
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.SerialNoList) {
      for ( let serial of item.SerialNos){

        if ( serial.SerialNo && serial.SerialNo != ''){
          count += 1
          rawData.rows.push({
            "row": {
              "InvoiceDetailGuid":item.InvoiceDetailGuid,
              "InvoiceGuid": this.InvoiceGuid,
              "SerialNoGuid": serial.SerialNoGuid == null || serial.SerialNoGuid == undefined ? uuidv4() : serial.SerialNoGuid,   
              "SerialNo": serial.SerialNo,   
            }
          })
        }
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log("XML is:- ", xml)
    return xml;
  }


  UpdateIncomingInvoice(){
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateIncomingInvoice"
    });
    requestData.push({
      "Key": "InvoiceGUID",
      "Value": this.InvoiceGuid
    });
    requestData.push({
      "Key": "EnableBillingFlag",
      "Value": this.EnableBillingFlag 
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
            window.location.reload();
            this.toastMessage.success("Restriction updated Successfully")
            this.ngxSpinnerService.hide();
          }
          else {
            this.submitClicked = false
            this.ngxSpinnerService.hide();
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
          // this.hideSpinner()
          this.submitClicked = false
          this.ngxSpinnerService.hide();
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex != -1) {
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
