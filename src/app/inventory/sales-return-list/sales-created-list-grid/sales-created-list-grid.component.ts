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
  selector: 'app-sales-created-list-grid',
  templateUrl: './sales-created-list-grid.component.html',
  styleUrls: ['./sales-created-list-grid.component.css']
})
export class SalesCreatedListGridComponent implements OnInit {
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
  SalesReturnCode:string = ''
  customerCode: string = ''
  LocationCode: string;
  results:any[] = []
  SalesReturnStatusDD=['PENDING', 'CLOSED']
  SalesReturnStatus: any; 
  isLoading : boolean = false
  // Dashboard List Part:- 
  statuses: { JobStatusDesc: string; JobCount: number }[] = [];
  pageTitle: String = "Sales Return";

  constructor(
      private dynamicService: DynamicService,
      private router: Router,
      private toaster: ToastrService,
      private dropdownDataService: DropdownDataService,
      private ngxservice: NgxSpinnerService,
  ){
    // this.pagination = new PaginationMetaData();
  }

  ngOnInit(): void {

    this.onLocationSearch({ term: "", item: [] });
    // this.injobTable();
    this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters", value);
          if (value.SalesReturnStatus) {
            this.SalesReturnStatus = value.SalesReturnStatus
          }
          // if (value.JobStatusTitle) {
          //   this.filterList.push(new Filter("JobStatusTitle", value.JobStatusTitle, ''));
          // }
          // Call the method to fetch data with the filters applied.
          this.GetSalesReturnList();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  Search(event){
    this.GetSalesReturnList()
  }

  GetSalesReturnList() {
    let requestData =[]
    requestData.push({
      "Key": "APIType",
      "Value": "GetSalesReturnList"
    });
    requestData.push({
      "Key":"CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key":"SalesReturnStatus",
      "Value": this.SalesReturnStatus == null || this.SalesReturnStatus == undefined ? '' : this.SalesReturnStatus
    })
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.customerCode == null || this.customerCode == undefined?"":this.customerCode
    });
    requestData.push({
      "Key":"Code",
      "Value": this.SalesReturnCode == null || this.SalesReturnCode == undefined ? '' : this.SalesReturnCode
    })
    // requestdata.push({
    //   "Key":"PageNo",
    //   "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    // });
    // requestdata.push({
    //   "Key":"PageSize",
    //   "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    // });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before SP:-", requestData)
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
              console.log("After SP:- ", data)
              if(data?.Totalrecords < 1)
              {
                this.toaster.info("No Record Found")
                this.results =[]
                return
              }
              // 
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

  redirectToRefundPage(item)
  {
    console.log("Item Selected", item)
    this.router.navigate(['/auth/' +glob.getCompanyCode() + '/sales-return-created/'], {queryParams: { salesreturnguid:item.SalesReturnGuid ,locationcode:item.LocationCode  ,customercode:item.RetailCustomerCode}})

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


}
