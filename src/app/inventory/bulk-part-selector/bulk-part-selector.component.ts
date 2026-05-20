import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';

import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';



@Component({
  selector: 'app-bulk-part-selector',
  templateUrl: './bulk-part-selector.component.html',
  styleUrls: ['./bulk-part-selector.component.css']
})
export class BulkPartSelectorComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';

  toastr: any;
  validateAllFormFields: any;
  returnOrderPartList: any[] = [];
  resourceData: any[] = []
  SelectedReturnOrderPartList: any[] = [];
  SelectedPartCount: Number = 0;
  searchText: String = "";
  close: boolean = false
  showonlyselected: boolean = false;
  @Input() returnType:string;
  @Input() finalSelectedElements: any[] = [];
  @Input() shipTo: string;
  @Output() returnOrderPartSelector = new EventEmitter<any>();
  @Output() closeReturnOrderPartSelector  = new EventEmitter<any>();


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['objcasedetail']) {
      this.getReturnOrder();
    }
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  constructor(
    private gsxService: GsxService,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private dynamicService: DynamicService,

  ) { }


  ngOnInit() {
    this.getReturnOrder();
  }

  onSubmit() {
    this.SelectedReturnOrderPartList = [];
    for (let item of this.returnOrderPartList) {
      if (item.selected == true) {
        let retvalue = this.returnOrderPartList.filter(partNumber => partNumber.toString() == item.partNumber.toString());
        this.SelectedReturnOrderPartList.push(item);
      }
    }
    this.returnOrderPartSelector.emit(this.SelectedReturnOrderPartList);
    this.closeReturnOrderPartSelector.emit(this.close);

  }

  UpdateSelectedCount() {
    this.SelectedPartCount = this.returnOrderPartList.filter(x => x.selected == true).length;
  }

  getReturnOrder() { 
       
    this.ngxSpinnerService.show()
    let returnTypeData;
    console.log("Return Type ", this.returnType)
    if(this.returnType=='MailIn')
    {
      returnTypeData = "WU_REPAIR_RETURN_KBB"
    }
    else{
      returnTypeData = "CI_ON_REPAIR_RETURN_KBB"
    }
    //"shipTo": this.shipTo, "returnType":returnTypeData,
    var objData = { "shipTo": this.shipTo, "returnType":returnTypeData,  "returnStatusType": "PARTS_PENDING_RETURN"}
    var strRequestData = JSON.stringify(objData);
    var data = {
      "Content": strRequestData
    }
    this.gsxService.getReturnsLookup(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        console.log(" Response ",response)
        
        this.returnOrderPartList = response.parts
        console.log("Parts from Response ",response.parts)
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
        else {

           if(this.returnType == 'KBB'){
              this.SaveGSXBulkPartList()
           }
          this.returnOrderPartList = this.returnOrderPartList.filter(item => this.validateReturnItem(item));
          console.log("No of parts ", this.returnOrderPartList.length, "\nParts ", this.returnOrderPartList)
          // this.returnOrderPartList = this.sortArrayOfObjects(response, "selected", "ascending");
        }

      },
      error: (err) => {
        console.log(err);
        this.toast.error("Please try again. " + err)
        this.ngxSpinnerService.hide()

      }
    });
  }
 validateReturnItem(com: any) {
    for (let item of this.finalSelectedElements) {
      if (item.repairId == com.repairId && item.sequenceNumber == com.sequenceNumber && item.partNumber == com.partNumber) {
        // this.toast.error("Part Code: " + item.partNumber + " Repair Id: " + "" + " already exists")
        return false;
      }
    }
    return true;
  }
  onSearchChange(text) {
    console.log(text);

    for (let item of this.returnOrderPartList) {
      if (text.length > 1) {
        if(item.partDescription && item.repairDevice?.identifiers?.serial){
          item.inSearch = (item.partDescription.toLowerCase().includes(text.toLowerCase()) || item.repairId.toLowerCase().includes(text.toLowerCase()) || item.repairDevice?.identifiers?.serial.toLowerCase().includes(text.toLowerCase()) || item.partNumber.toLowerCase().includes(text.toLowerCase()));
        }
      } else {
        item.inSearch = false;
      }
    }
  }


  sortArrayOfObjects = <T>(
    data: T[],
    keyToSort: keyof T,
    direction: 'ascending' | 'descending' | 'none',
  ) => {
    if (direction === 'none') {
      return data
    }
    const compare = (objectA: T, objectB: T) => {
      const valueA = objectA[keyToSort]
      const valueB = objectB[keyToSort]

      if (valueA === valueB) {

        return 0
      }

      if (valueA > valueB) {
        return direction === 'ascending' ? 1 : -1
      } else {
        return direction === 'ascending' ? -1 : 1
      }
    }

    return data.slice().sort(compare)
  }



  isToShowTr(item): Boolean {
    if (this.showonlyselected == false) {
      if (this.searchText.length <= 1) {
        return true;
      } else if (item.selected == true) {
        return true;
      } else if (item.inSearch) {
        return true;
      } else {
        return false;
      }
    }
    else {
      if (item.selected == true) {
        return true;
      } else {
        return false;
      }

    }
  }

  closepartSelector(){
    this.closeReturnOrderPartSelector.emit(false);
  }
 //     Saving all the GSX part list into db table : GSXBulkPartList
       GSXBulkPartListIntoXML() {
         let rawData = { "rows": [] }
         
       
         for (let item of this.returnOrderPartList) {
           rawData.rows.push({
             "row": {
                  "GSXBulkPartListGUID": item.GSXBulkPartListGUID == null  || item.GSXBulkPartListGUID == undefined ? uuidv4() : item.GSXBulkPartListGUID,
                  "bulkReturnId" :item.bulkReturnId == null || item.bulkReturnId == undefined ? '' :item.bulkReturnId ,
                  "partNumber" : item.partNumber ,
                  "partDescription" : item.partDescription,
                  "productDescription" : item.productDescription,
                  "purchaseOrderNumber": item.purchaseOrderNumber,
                  "componentCode": item.componentCode,
                  "countryOfOriginCode":item.countryOfOriginCode,
                  "countryOfOriginName": item.countryOfOriginName,
                  "coverageOption":item.coverageOption == null || item.coverageOption == undefined ? '' : item.coverageOption,
                  "coverageStatusCode":item.coverageStatusCode ,
                  "dangerousGoods":item.dangerousGoods == null || item.dangerousGoods == undefined ? '' : item.dangerousGoods,
                  "deliveryNumber":item.deliveryNumber,
                  "expectedReturnDate":item.expectedReturnDate ==  null || item.expectedReturnDate == undefined ? '1900-01-01' : item.expectedReturnDate,
                  "returnUpdatedDate" :item.returnUpdatedDate,
                  "issueCode": item.issueCode == null || item.issueCode == undefined ? '' : item.issueCode,
                  "repairId" :item.repairId ,
                  "repairStatusCode" :item.repairStatusCode,
                  "repairStatusDescription" : item.repairStatusDescription,
                  "repairType": item.repairType,
                  "returnCreatedDate": item.returnCreatedDate ,
                  "returnLabelPrinted" :item.returnLabelPrinted,
                  "returnStatus":item.returnStatus,
                  "returnStatusCode":item.returnStatusCode,
                  "returnStatusCodeDescription": item.returnStatusCodeDescription,
                  "returnType":item.returnType,
                  "sequenceNumber":item.sequenceNumber,
                  "serviceNotificationNumber":item.serviceNotificationNumber ,
                  "shipTo" :item.shipTo
               
             }
           })
         }
         var builder = new xml2js.Builder();
         var xml = builder.buildObject(rawData);
         xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
         xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
         xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
         console.log('GSXBulkPartListIntoXML',xml)
         return xml;
         
       }
    
       SaveGSXBulkPartList() {
           let requestData = [];
           requestData.push({
             "Key": "ApiType",
             "Value": "SaveGSXBulkPartList"
           });
             requestData.push({
             "Key": "GSXBulkPartListDetail",
             "Value": this.GSXBulkPartListIntoXML()
           });
           let strRequestData = JSON.stringify(requestData);
           let contentRequest = {
             "content": strRequestData
           };
          
           this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
             {
               next: (value) => {
                 let response = JSON.parse(value.toString());
                 console.log("After OnSubmit BulkReturn Header SP :- ", response)
                 if (response.ReturnCode == '0') {
                    console.log('GSXBulkPartList Saved Successfully!!')
                 }
                  
                 else {
                   this.toastr.error(response.ReturnMessage)
                    console.log('Error while saving GSXBulkPartList')

                 }
               },
               error: err => {
                 console.log("After SP error ", err);
                 console.log("Error Message:- ", err)
                 const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
                 errors.forEach(error => {
                   const messageIndex = error.indexOf("Message: ");
                   if (messageIndex !== -1) {
                     const messageSubstring = error.substring(messageIndex + 9).trim();
                     const message = JSON.parse(messageSubstring).message;
                     this.toast.error("Error:- ", message, { closeButton: true, disableTimeOut: true });
                   } else {
                     this.toastr.error("Error parsing the error message.");
                   }
                 });
               }
             });
         }
}
