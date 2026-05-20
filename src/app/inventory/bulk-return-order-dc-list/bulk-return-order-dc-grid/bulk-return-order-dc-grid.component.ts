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
  selector: 'app-bulk-return-order-dc-grid',
  templateUrl: './bulk-return-order-dc-grid.component.html',
  styleUrls: ['./bulk-return-order-dc-grid.component.css']
})
export class BulkReturnOrderDcGridComponent implements OnInit {

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
     {datatype:"STRING",field:"DeliveryChallanNo",title:"DeliveryChallanNo"},
     {datatype:"STRING",field:"StatusDescription",title:"Status"},
     {datatype:"STRING",field:"BulkReturnType",title:"BulkReturnType"},
     {datatype:"STRING",field:"CompanyCode",title:"Company Code"},
     {datatype:"STRING",field:"LocationCode",title:"LocationCode"},
     {datatype:"STRING",field:"TransportationCarrier",title:"TransportationCarrier"},
     {datatype:"STRING",field:"TrackingNo",title:"TrackingNo"},
     {datatype:"STRING",field:"NoOfBoxes",title:"NoOfBoxes"},
     {datatype:"STRING",field:"CreatedBy",title:"CreatedBy"},
     {datatype:"DATE",field:"CreatedDate",title:"CreatedDate"},

   ];
 
 
   // Dashboard List Part:- 
   statuses: { JobStatusDesc: string; JobCount: number }[] = [];
   
   Status:any;
   ChallanNo:any;


 
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
       this.GetBulkOrderList('');

  this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters Request", value);
          this.Status = value.BulkReturnStatusCode
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
       this.router.navigate(['/auth/'+glob.getCompanyCode()+'/create-bulk-return-dc'], { queryParams: {BulkReturnOrderDCHeaderGUID: event.row.BulkReturnOrderDCHeaderGUID} })
     }
   }
 
   GetBulkOrderList(eventDetail) {
     
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetBulkDCList"
    });
    requestData.push({
      "Key":"ChallanNo",
      "Value": this.ChallanNo == null || this.ChallanNo == undefined? '' : this.ChallanNo.trim()
    });
    requestData.push({
      "Key":"Status",
      "Value": this.Status  == null || this.Status  == undefined ? '' :  this.Status 
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
   this.dropdownDataService.fetchDropDownData(DropDownType.BULKRTNORDERDCSTATUS, $event.term, {
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
