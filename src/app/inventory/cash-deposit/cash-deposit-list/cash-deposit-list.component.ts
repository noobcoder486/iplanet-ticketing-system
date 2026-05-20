import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Columns } from 'src/app/models/column.metadata';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { Observable } from 'rxjs/internal/Observable';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import * as glob from 'src/app/config/global'
import { Subscription, lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import xml2js from 'xml2js';
import { analyzeFile } from '@angular/compiler';
import { RightSidebarComponent } from 'src/app/layout/right-sidebar/right-sidebar.component';


@Component({
  selector: 'app-cash-deposit-list',
  templateUrl: './cash-deposit-list.component.html',
  styleUrls: ['./cash-deposit-list.component.css']
})
export class CashDepositListComponent implements OnInit {
 
  actionDetails: any[]=[
    {"code": "VIEW","icon": "remove_red_eye","title": "View"}
  ];
  screen:any;
  Location: any;
  IsUnLocked: boolean = true

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';

  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationCode: string;
  CashDepositCode: string;  
  // Customer List
  openCustomerList = false;

  // Enable Cash Pop Up
  hideCashEnablePopUp: boolean = true;
  isApproverPermission: boolean = false;
  ReasonForUnlock: string 
  selectAll: boolean = false;
  MultipleLocationCode: any[] =[];

  // columns: Columns[] = [];
  columns: Columns[] = [
    { datatype: "STRING", field: "CashDepositCode", title: "Cash Deposit Code" },
    { datatype: "STRING", field: "CreatedDate", title: "Deposit Date" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "TotalAmount", title: "Deposit Amount" },
    { datatype: "STRING", field: "Remark", title: "Deposit Remark" },
    { datatype: "STRING", field: "Status", title: "Status" },
    { datatype: "STRING", field: "BankCode", title: "Bank Code" },

  ];
  finalSelectedElements: any;
  Locationxml: any;

  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private dropdownDataService: DropdownDataService,
    private sanitize : DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term:"", item:[]})
    this.GetCashDepositList('')
    this.checkLocalPermission()
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


  Search(){
    this.GetCashDepositList('')
  }
  routeToDeposit(){
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/cash-deposit'])
  }
  public newslide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }


  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }


  enableCashDeposit() {
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
      "Value": "EnableCashDeposit",
    });
    requestData.push({
      "Key": "LocationXml",
      "Value": this.GetLocationCodeXML()
    });
    requestData.push({
      "Key": "IsUnLocked",
      "Value": this.IsUnLocked == true ? "1" : "0"
    });
    requestData.push({
      "Key": "ReasonForUnlock",
      "Value": this.ReasonForUnlock == null || this.ReasonForUnlock == undefined ? "" : this.ReasonForUnlock
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
            this.toast.success("Enabled Cash Deposit successfully!")
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
          "LocationCode":item,
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


  GetCashDepositList(eventDetail) {

    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetCashDepositList"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key":"CashDepositCode",
      "Value": this.CashDepositCode == null || this.CashDepositCode == undefined ? '' : this.CashDepositCode
    })
    
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
    this.ngxservice.show()
    // console.log("Before SP:", requestdata)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          this.ngxservice.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              console.log("Data is ", data)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                this.detail.next({ totalRecord: data?.Totalrecords, Data: '' })
                return
              }
              let ExtraData =[]
              if( Array.isArray(data.CashDepositList?.CashDepositRow) ) {
                ExtraData = data.CashDepositList?.CashDepositRow;
              }
              else{
                ExtraData.push(data.CashDepositList?.CashDepositRow)
              }
              // this.toast.success("Records Found")
              // console.log("Refund Rows are:- ",ExtraData)
              this.detail.next({ totalRecord: data?.Totalrecords, Data: ExtraData })
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.ngxservice.hide()
          console.log(err)  
        }

      }
    );
  }



  PageChange( event){    
    switch(event.eventType){
      case "PageChange":
        this.GetCashDepositList(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'VIEW'){ 
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/cash-deposit'], { queryParams: { cashdepositguid: event.row.CashDepositGUID, locationcode: event.row.LocationCode} })
    }
  }


}
