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
  selector: 'app-dropoff-management-grid',
  templateUrl: './dropoff-management-grid.component.html',
  styleUrls: ['./dropoff-management-grid.component.css']
})
export class DropoffManagementGridComponent implements OnInit {

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
  DropoffLocationCode : string;
  
  ParentLocationCode: string;
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
  
  DropoffType: string = ''
  DropoffStatusDD: DropDownValue = this.getBlankObject();
  DropoffStatusCode: string = ''
  DropoffStatusDesc: string = ''
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  results:any[] = []
  columns: Columns[] = [
    {datatype:"STRING",field:"DeliveryChallanNo",title:"Dropoff No"},
    {datatype:"DATE",field:"CreatedDate",title:"Dropoff Date"},
    {datatype:"STRING",field:"DeliveryChallanStatus",title:"Dropoff Status"},
    {datatype:"STRING",field:"LocationCode",title:"Dropoff Location Code"},
    {datatype:"STRING",field:"ToLocationCode",title:"Dropoff Parent Location Code"},
  ];
  DeliveryChallanNo:string =''

  // Dashboard List Part:- 
  statuses: { JobStatusDesc: string; JobCount: number }[] = [];
  pageTitle: String = "Dropoff";
BulkReturnType: any;

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

       
    this.onDropoffStatus({ term: "", item: [] });
    // this.injobTable();

   
    this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters Request", value);
          this.DropoffStatusCode = value.DropoffStatusCode
          this.DropoffType = value.DropoffType
          this.DropoffStatusDesc = value.DropoffStatusDesc
          // if (value.JobStatusTitle) {
          //   this.filterList.push(new Filter("JobStatusTitle", value.JobStatusTitle, ''));
          // }
          console.log("Return Order ", this.DropoffStatusCode)
          this.GetDropoffJobList('');
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  Search(statusname){
    this.GetDropoffJobList(statusname)
  }
  actionEmit(event){
    
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      
      this.router.navigate(['/auth/'+glob.getCompanyCode()+'/dropoff-management'], { queryParams: { headerguid: event.row.DeliveryChallanGUID} })
    }
  }  


  GetDropoffJobList(eventDetail) {
  
   this.ngxservice.show();
   let requestData = [];
   requestData.push({
    "Key": "APIType",
    "Value": "GetDeliveryChallanList"
  });
  requestData.push({
   "Key": "DeliveryChallanType",
   "Value": "DROPOFF"
 });
 
  requestData.push({
   "Key": "DeliveryChallanStatus",
   "Value":  this.DropoffStatusCode == null ||  this.DropoffStatusCode == undefined ? '' : this.DropoffStatusCode 
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
           console.log("Dropoff GRID ", response)
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
             console.log('Data from this.detail ' , this.detail)
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
       this.GetDropoffJobList(event.eventDetail )
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


 onDropoffStatus($event: { term: string; item: any[] }) {
  this.dropdownDataService.fetchDropDownData(DropDownType.DropoffStatus, $event.term, {
  }).subscribe({
    next: (value) => {
      if (value != null) {
        this.DropoffStatusDD = value;
        console.log("Dropoff Type ", this.DropoffStatusDD)
      }
    },
    error: (err) => {
      this.DropoffStatusDD = DropDownValue.getBlankObject();
    }
  });
}


  redirectToSalesReturnPage(item)
  {
    // console.log("Item Selected", item)
    item == '' ? 
      this.router.navigate(['/auth/' +glob.getCompanyCode() + '/dropff-management/'])
        : this.router.navigate(['/auth/' +glob.getCompanyCode() + '/dropoff-management-list/'], {queryParams: { dropoffguid:item.DropoffGuid  ,locationcode:item.LocationCode  ,customercode:item.RetailCustomerCode}})
     
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
