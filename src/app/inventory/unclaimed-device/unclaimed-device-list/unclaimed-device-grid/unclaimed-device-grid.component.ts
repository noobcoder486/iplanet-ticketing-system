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
  selector: 'app-unclaimed-device-grid',
  templateUrl: './unclaimed-device-grid.component.html',
  styleUrls: ['./unclaimed-device-grid.component.css']
})
export class UnclaimedDeviceGridComponent implements OnInit {

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
  ToLocationCode: string;
  SerialNo:string
  DeliveryChallanNo: string; 
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
  DeliveryChallanTypeDD: DropDownValue = this.getBlankObject();
  DeliveryChallanType: string = ''
  DeliveryChallanStatusDD: DropDownValue = this.getBlankObject();
  DeliveryChallanStatusCode: string = ''
  DeliveryChallanStatusDesc: string = ''
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  results:any[] = []
  columns: Columns[] = [
    {datatype:"STRING",field:"DeliveryChallanNo",title:"Delivery Challan No"},
    {datatype:"DATE",field:"CreatedDate",title:"Challan Date"},
    {datatype:"STRING",field:"DeliveryChallanStatusDesc",title:"Challan Status"},
    {datatype:"STRING",field:"TransportationCarrier",title:"Transportation Carrier"},
    {datatype:"STRING",field:"LocationCode",title:"From Location Code"},
    {datatype:"STRING",field:"ToLocationCode",title:"To Location Code"},
  ];
  SelectedDocType:any
  DocTypeForJob: DropDownValue = DropDownValue.getBlankObject();



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
    this.onDocTypeSearch({ term: "", item: [] });
   
    this.onLocationSearch({ term: "", item: [] });
    // this.onDeliveryChallanType({ term: "", item: [] });
    this.onDeliveryChallanStatus({ term: "", item: [] });
    // this.injobTable();
    this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters Request", value);
          this.DeliveryChallanStatusCode = value.DeliveryChallanStatusCode
          this.DeliveryChallanType = value.DeliveryChallanType
          this.DeliveryChallanStatusDesc = value.DeliveryChallanStatusDesc
          this.SelectedDocType = value.SelectedDocType
          // if (value.JobStatusTitle) {
          //   this.filterList.push(new Filter("JobStatusTitle", value.JobStatusTitle, ''));
          // }
          console.log("Return Order ", this.DeliveryChallanStatusCode)
          this.GetDeliveryChallanList('');
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  Search(statusname){
    this.GetDeliveryChallanList(statusname)
  }
  actionEmit(event){
    
    console.log("action Emit", event);
    if(event.action == 'EDIT' && event.row.DocType=='UNCRET'){
      this.router.navigate(['/auth/'+glob.getCompanyCode()+'/return-unclaimed-device'], { queryParams: { headerguid: event.row.DeliveryChallanGUID} })
    }
    if(event.action == 'EDIT' && event.row.DocType!=='UNCRET'){
      this.router.navigate(['/auth/'+glob.getCompanyCode()+'/unclaimed-device'], { queryParams: { headerguid: event.row.DeliveryChallanGUID} })
    }
  }

  GetDeliveryChallanList(eventDetail) {
    
    ;
  //  if (this.DeliveryChallanType == null || this.DeliveryChallanType == undefined || this.DeliveryChallanType == ''){
  //    this.toaster.error("Please select a Return Type")
  //    return
  //  }
  let status: any;
   if( this.DeliveryChallanStatusCode ){
     status = this.DeliveryChallanStatusDD.Data.find( status => status.Id == this.DeliveryChallanStatusCode)
   }
   else{
    status = ''
   }
   console.log("Return Status ", status )

   this.ngxservice.show();
   let requestData = [];
   requestData.push({
     "Key": "APIType",
     "Value": "GetDeliveryChallanList"
   });
   requestData.push({
    "Key": "DeliveryChallanType",
    "Value": "UNCLAIMED"
  });
   requestData.push({
    "Key": "DeliveryChallanStatus",
    "Value":  this.DeliveryChallanStatusCode == null ||  this.DeliveryChallanStatusCode == undefined ? '' : status.Id
  });
   requestData.push({
     "Key": "DeliveryChallanNo",
     "Value": this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined || this.DeliveryChallanNo == '' ? '' : this.DeliveryChallanNo
   });
   requestData.push({
     "Key": "LocationCode",
     "Value": this.LocationCode == null || this.LocationCode == undefined || this.LocationCode == '' ? '' : this.LocationCode
   });
   requestData.push({
     "Key": "DocType",
     "Value":this.SelectedDocType  == null || this.SelectedDocType == undefined  ? '' : this.SelectedDocType
   });
   requestData.push({
     "Key": "ToLocationCode",
     "Value": this.ToLocationCode == null || this.ToLocationCode == undefined || this.ToLocationCode == '' ? '' : this.ToLocationCode
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
             if(Array.isArray(data?.DeliveryChallanList?.DeliveryChallan))
             {
               results = data?.DeliveryChallanList?.DeliveryChallan
             }
             else
             {
               results.push(data?.DeliveryChallanList?.DeliveryChallan)
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
       this.GetDeliveryChallanList(event.eventDetail )
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

//  onDeliveryChallanType($event: { term: string; item: any[] }) {
//    this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanType, $event.term, {
//    }).subscribe({
//      next: (value) => {
//        if (value != null) {
//          this.DeliveryChallanTypeDD = value;
//          console.log("Bulk Return Type ", this.DeliveryChallanTypeDD)
//        }
//      },
//      error: (err) => {
//        this.DeliveryChallanTypeDD = DropDownValue.getBlankObject();
//      }
//    });
//  }

 onDeliveryChallanStatus($event: { term: string; item: any[] }) {
  this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanStatus, $event.term, {
  }).subscribe({
    next: (value) => {
      if (value != null) {
        this.DeliveryChallanStatusDD = value;
        console.log("DeliveryChallan Type ", this.DeliveryChallanStatusDD)
      }
    },
    error: (err) => {
      this.DeliveryChallanStatusDD = DropDownValue.getBlankObject();
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
  onDocTypeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.UnclaimedDocType, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.DocTypeForJob = value;
        }
      },
      error: (err) => {
        this.DocTypeForJob = DropDownValue.getBlankObject();
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
