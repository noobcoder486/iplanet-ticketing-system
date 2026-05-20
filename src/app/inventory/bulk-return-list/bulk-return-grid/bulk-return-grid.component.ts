import { Component, Input, OnInit } from '@angular/core';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';


@Component({
  selector: 'app-bulk-return-grid',
  templateUrl: './bulk-return-grid.component.html',
  styleUrls: ['./bulk-return-grid.component.css']
})
export class BulkReturnGridComponent implements OnInit {
  JobStatustype: any;
  JobStatusTitle: any;
  jobPagination: PaginationMetaData;
  JobList: any[];
  JobColumns: Columns[] = [];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];
  @Input() filters: Observable<any>;
  filterList: any[] =[]
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationCode: string;
  BulkReturnId: string; 
  TrackingNumber: string;
  breadCumbList: any[];
  screenDetail: any;
  screen:any;
  isChoose: boolean = false;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';
  selectedCallForm: any;
  searchText: String = "";
  toolBarAction: any[] = [];
  BulkReturnTypeDD: DropDownValue = this.getBlankObject();
  BulkReturnType: string = ''
  BulkReturnStatusDD: DropDownValue = this.getBlankObject();
  BulkReturnStatusCode: string = ''
  BulkReturnStatusDesc: string = ''
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  results:any[] = []
  columns: Columns[] = [
    {datatype:"STRING",field:"BulkReturnId",title:"Bulk Return Id"},
    {datatype:"DATE",field:"CreatedDate",title:"Bulk Return Date"},
    {datatype:"STRING",field:"TransportationCarrier",title:"Transportation Carrier"},
    {datatype:"STRING",field:"Length",title:"Length"},
    {datatype:"STRING",field:"Breadth",title:"Breadth"},
    {datatype:"STRING",field:"Height",title:"Height"},
    {datatype:"STRING",field:"Weight",title:"Weight"},
    {datatype:"STRING",field:"TrackingNumber",title:"Tracking Number"},
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
    {datatype:"STRING",field:"ShipTo",title:"Ship To"},
    {datatype:"STRING",field:"ReturnOrderStatus",title:"Status"},
    {datatype:"STRING",field:"ReturnAddress",title:"Return Address"},
  ];


  // Dashboard List Part:- 
  statuses: { JobStatusDesc: string; JobCount: number }[] = [];
  pageTitle: String = "Sales Return";

  constructor(
      private dynamicService: DynamicService,
      private router: Router,
      private toaster: ToastrService,
      private dropdownDataService: DropdownDataService,
      private ngxservice: NgxSpinnerService,
  ) {
    // this.pagination = new PaginationMetaData();
  }

  ngOnInit(): void {

    this.onLocationSearch({ term: "", item: [] });
    this.onBulkReturnType({ term: "", item: [] });
    this.onBulkReturnStatus({ term: "", item: [] });
    // this.injobTable();
    this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters Request", value);
          this.BulkReturnStatusCode = value.BulkReturnStatusCode
          this.BulkReturnType = value.BulkReturnType
          this.BulkReturnStatusDesc = value.BulkReturnStatusDesc
          // if (value.JobStatusTitle) {
          //   this.filterList.push(new Filter("JobStatusTitle", value.JobStatusTitle, ''));
          // }
          console.log("Return Order ", this.BulkReturnStatusCode)
          this.GetBulkOrderList('');
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  Search(statusname){
    this.GetBulkOrderList(statusname)
  }
  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.router.navigate(['/auth/'+glob.getCompanyCode()+'/bulk-return-order'], { queryParams: { headerguid: event.row.BulkReturnOrderHeaderGUID} })
    }
  }

  GetBulkOrderList(eventDetail) {
    
    ;
  //  if (this.BulkReturnType == null || this.BulkReturnType == undefined || this.BulkReturnType == ''){
  //    this.toaster.error("Please select a Return Type")
  //    return
  //  }
  let status: any;
   if( this.BulkReturnStatusCode ){
     status = this.BulkReturnStatusDD.Data.find( status => status.Id == this.BulkReturnStatusCode)
   }
   else{
    status = ''
   }
   console.log("Return Status ", status )

   this.ngxservice.show();
   let requestData = [];
   requestData.push({
     "Key": "APIType",
     "Value": "GetBulkReturnOrderList"
   });
   requestData.push({
     "Key": "ReturnType",
     "Value": this.BulkReturnType  == null ||  this.BulkReturnType  == undefined ? '' : this.BulkReturnType
   });
   requestData.push({
    "Key": "ReturnOrderStatus",
    "Value":  this.BulkReturnStatusCode == null ||  this.BulkReturnStatusCode == undefined ? '' : status.TEXT
  });
   requestData.push({
     "Key": "BulkReturnId",
     "Value": this.BulkReturnId == null || this.BulkReturnId == undefined || this.BulkReturnId == '' ? '' : this.BulkReturnId
   });
   requestData.push({
     "Key": "LocationCode",
     "Value": this.LocationCode == null || this.LocationCode == undefined || this.LocationCode == '' ? '' : this.LocationCode
   });
   requestData.push({
    "Key": "TrackingNumber",
    "Value": this.TrackingNumber == null || this.TrackingNumber == undefined || this.TrackingNumber == '' ? '' : this.TrackingNumber
  });
   requestData.push({
     "Key":"PageNo",
     "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
   });
   requestData.push({
     "Key":"PageSize",
     "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
   });
   let strRequestData = JSON.stringify(requestData);
   let contentRequest =
   {
     "content": strRequestData
   };
   console.log("Return Type: ", requestData)
   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
     {
       next: (Value) => {
         try {
           this.ngxservice.hide()
           let response = JSON.parse(Value.toString());
           console.log("Response ", response)
           if (response.ReturnCode == '0') {
             // this.toast.success("Records Found")
             let data = JSON.parse(response?.ExtraData);

             if (data.Totalrecords == '0') {
               this.toaster.error("No Records Found")
               return
             }
             let results = []
             if(Array.isArray(data?.BulkReturnOrderList?.BulkReturnOrder))
             {
               results = data?.BulkReturnOrderList?.BulkReturnOrder
             }
             else
             {
               results.push(data?.BulkReturnOrderList?.BulkReturnOrder)
             }
             console.log("List ",results)
             this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
             console.log('Data' , this.detail)
           }
         } catch (ext) {
           this.ngxservice.hide()
           console.log(ext);
         }
       },
       error: err => {
         this.ngxservice.hide()
         console.log(err);
       }
     }
   );
 }


 PageChange(event){    
   switch(event.eventType){
     case "PageChange":
       this.GetBulkOrderList(event.eventDetail )
       // setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
       break;
     case "Sorting":
       break;
     }
     setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
 }

 loadPageData(event){
   switch(event.eventType){
     case "PageChange":
       this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
       break;
   }  
   setTimeout(()=>{  this.hideSpinnerEvent.next(); }, 1);
 }

 onBulkReturnType($event: { term: string; item: any[] }) {
   this.dropdownDataService.fetchDropDownData(DropDownType.BulkReturnType, $event.term, {
   }).subscribe({
     next: (value) => {
       if (value != null) {
         this.BulkReturnTypeDD = value;
         console.log("Bulk Return Type ", this.BulkReturnTypeDD)
       }
     },
     error: (err) => {
       this.BulkReturnTypeDD = DropDownValue.getBlankObject();
     }
   });
 }

 onBulkReturnStatus($event: { term: string; item: any[] }) {
  this.dropdownDataService.fetchDropDownData(DropDownType.BulkReturnStatus, $event.term, {
  }).subscribe({
    next: (value) => {
      if (value != null) {
        this.BulkReturnStatusDD = value;
        console.log("Bulk Return Type ", this.BulkReturnStatusDD)
      }
    },
    error: (err) => {
      this.BulkReturnStatusDD = DropDownValue.getBlankObject();
    }
  });
}


  redirectToSalesReturnPage(item)
  {
    // console.log("Item Selected", item)
    item == '' ? 
      this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-request/'])
        : this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return/'], {queryParams: { salesreturnguid:item.SalesReturnGuid  ,locationcode:item.LocationCode  ,customercode:item.RetailCustomerCode}})
     
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
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

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
}
