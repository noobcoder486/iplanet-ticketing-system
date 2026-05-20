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
  selector: 'app-sales-list-grid',
  templateUrl: './sales-list-grid.component.html',
  styleUrls: ['./sales-list-grid.component.css']
})

export class SalesListGridComponent implements OnInit {
  // [x: string]: any;
  JobStatustype: any;
  JobStatusTitle: any;
  jobPagination: PaginationMetaData;
  JobList: any[];
  JobColumns: Columns[] = [];
  actionDetails: any[] = [];
  @Input() filters: Observable<any>;
  filterList: any[] =[]

  // @Input() filters: { ApprovalStatus: string; LocationCode: string };
  // JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  // From Sales Return List
  typeSelected = 'ball-clip-rotate';
  Location: DropDownValue = DropDownValue.getBlankObject();
  LocationCode:string = ''
  customerCode: string = ''
  results:any[] = []
  ApprovalStatusDD= ['SENT FOR APPROVAL', 'PARTIALLY APPROVED', 'APPROVED', 'REJECTED']
  ApprovalStatus: any;
  // InvoiceDocTypeDD: DropDownValue = DropDownValue.getBlankObject();
  // InvoiceDocType =''

  // Dashboard List Part:- 
  isLoading : boolean = false
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
    // this.injobTable();
    this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters Request", value);
          this.ApprovalStatus = value?.ApprovalStatus
          this.GetSalesReturnRequestList();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }


  GetSalesReturnRequestList() {
    let requestData =[]
    requestData.push({
      "Key": "APIType",
      "Value": "GetSalesReturnRequestList"
    });
    requestData.push({
      "Key":"ApprovalStatus",
      "Value": this.ApprovalStatus == null || this.ApprovalStatus == undefined ? '' : this.ApprovalStatus
    })
    // requestdata.push({
    //   "Key":"PageNo",
    //   "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    // });
    // requestdata.push({
    //   "Key":"PageSize",
    //   "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    // });

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined?"":this.LocationCode
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.customerCode == null || this.customerCode == undefined?"":this.customerCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.isLoading = true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.isLoading = false
          this.results = []
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              // console.log("After SP:- ", data)
              if(data?.Totalrecords < 1)
              {
                this.toaster.info("No Request Record Found")
                this.results =[]
                return
              }
              console.log("Data is ",data)
              if (Array.isArray(data?.SalesReturnList?.SalesReturn)) {
                this.results = data?.SalesReturnList?.SalesReturn
              }
              else {
                this.results.push(data?.SalesReturnList?.SalesReturn)
              }
            }
          } catch (ext) {
            this.isLoading = false
            console.log(ext);
          }
        },
        error: err => {
          this.isLoading = false
          console.log(err);
        }
      }
    );
  }

  redirectToSalesReturnPage(item)
  {
    // console.log("Item Selected", item)
    
    item == '' ? this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-request/'])
        : item?.SalesReturnStatus == "CLOSED" ?   this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-created/'], {queryParams: { salesreturnguid:item.SalesReturnGuid  ,locationcode:item.LocationCode  ,customercode:item.RetailCustomerCode}}) 
          : this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return/'], {queryParams: { salesreturnguid:item.SalesReturnGuid  ,locationcode:item.LocationCode  ,customercode:item.RetailCustomerCode}})
     
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Location = value;
        }
      },
      error: (err) => {
        this.Location = DropDownValue.getBlankObject();
      }
    });
  }

  
  // injobTable() {
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Case Id", "CaseId"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "First Name", "FirstName"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "MOBILE NO", "MobileNo"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "EmailId", "EmailId"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Serial No", "SerialNo1"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Material Desc", "productDescription"));;
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Remark", "Remark"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Fault Description", "ComplainDesc"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Status", "JobStatus"));
  //   this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Type", "JobType"));
  //   this.actionDetails.push({ code: 'Repair', icon: 'build_circle' });
  // }

  // actionEmit(event) {
  //   switch (event.action) {
  //     case "ROWSELECT":
  //       break;
  //     case "Delete":
  //       break;
  //     case "Repair":
  //       this.router.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: event.row.CaseGUID } });
  //       break;
  //   }
  // }

  
  // loadPageData(event){
  //   switch(event.eventType){
  //     case "PageChange":
  //       this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
  //       let requestData =[];

  //       requestData.push({
  //         "Key":"APIType",
  //         "Value": "GetJobDetails"
  //       });
  //       requestData.push({
  //         "Key":"CompanyCode",
  //         "Value": glob.getCompanyCode()
  //       });
  //       requestData.push({
  //         "Key":"PageNo",
  //         "Value": event.eventDetail.pageIndex + 1 
  //       });
  //       requestData.push({
  //         "Key":"PageSize",
  //         "Value": event.eventDetail.pageSize
  //       });

  //       let strRequestData = JSON.stringify(requestData);
  //       let contentRequest =
  //       {
  //         "content" : strRequestData
  //       };    
  //       this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //         {
  //           next : (Value) =>
  //           {
  //             try{
  //               let response = JSON.parse(Value.toString());
  //               if(response.ReturnCode =='0')
  //               {
  //                 response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
  //                 let jobListData = response['ExtraDataJSON']['JobList']['JobData']
  //                 var JobFindData: any = [];
  //                 if (Array.isArray(jobListData)) {
  //                   JobFindData = jobListData;
  //                 }
  //                 else {
  //                   JobFindData.push(jobListData)
  //                 }
  //                 this.JobDetail.next({ totalRecord: jobListData.length, Data: JobFindData });
  //               }
  //             }catch(ext){
  //               console.log(ext);
  //             }
  //           },
  //           error : err =>
  //           {
  //             console.log(err);
  //           }
  //         }
  //       );
  //       break;
  //   }  
  //   setTimeout(()=>{  this.hideSpinnerEvent.next(); }, 1);
  // }

}
