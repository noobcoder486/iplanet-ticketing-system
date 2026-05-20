import { Component, OnInit, Input } from '@angular/core';
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
import * as glob from 'src/app/config/global'
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-bulk-return-list',
  templateUrl: './bulk-return-list.component.html',
  styleUrls: ['./bulk-return-list.component.css']
})
export class BulkReturnListComponent implements OnInit {

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationCode: string;
  BulkReturnId: string; 
  breadCumbList: any[];
  screenDetail: any;
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];
  screen:any;
  isChoose: boolean = false;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  @Input() filters: Observable<Filter[]>;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';
  selectedCallForm: any;
  searchText: String = "";
  // returnTypeArray:any[] = ["Parts-Pending","Mail-In"];
  // returnTypeData:string;
  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  BulkReturnTypeDD: DropDownValue = this.getBlankObject();
  BulkReturnType: string = ''
  results: any[] = []


  // Dashboard List Part:- 
  BulkReturnData: any[] = [];
  statuses: { BulkReturnType: string; JobStatusDesc: string; JobCount: number }[] = [];
  pageTitle: String = " Bulk Return";
  content = this.sanitize.bypassSecurityTrustHtml(`
  <svg style="width:28px;height:23px;"viewBox="0 0 28 23" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.22664 1.53345H5.1333C4.70584 1.53345 4.3381 1.53345 4.0133 1.59631C3.51049 1.69501 3.05076 1.90612 2.68504 2.20626C2.31933 2.5064 2.06191 2.88384 1.9413 3.29678C1.86664 3.56358 1.86664 3.86411 1.86664 4.21678V8.05011C1.86664 8.40125 1.86664 8.70331 1.94317 8.97011C2.06332 9.38314 2.32032 9.76078 2.68571 10.0612C3.0511 10.3616 3.5106 10.573 4.0133 10.6721C4.3381 10.7334 4.70397 10.7334 5.1333 10.7334H9.79997C10.2274 10.7334 10.5952 10.7334 10.92 10.6706C11.4228 10.5719 11.8825 10.3608 12.2482 10.0606C12.614 9.7605 12.8714 9.38305 12.992 8.97011C13.0666 8.70331 13.0666 8.40278 13.0666 8.05011V4.21678C13.0666 3.86565 13.0666 3.56358 12.9901 3.29678C12.87 2.88376 12.613 2.50612 12.2476 2.20571C11.8822 1.9053 11.4227 1.69385 10.92 1.59478C10.5952 1.53345 10.2293 1.53345 9.79997 1.53345H5.22664ZM4.44824 3.08825C4.5285 3.07291 4.65357 3.06678 5.22664 3.06678H9.70664C10.2816 3.06678 10.4048 3.07138 10.485 3.08825C10.6527 3.12119 10.806 3.19163 10.9279 3.29177C11.0498 3.39192 11.1356 3.51784 11.1757 3.65558C11.1944 3.71998 11.2 3.82118 11.2 4.29345V7.97345C11.2 8.44571 11.1944 8.54691 11.1738 8.61285C11.1337 8.75059 11.048 8.87651 10.9261 8.97665C10.8042 9.07679 10.6509 9.14724 10.4832 9.18018C10.4066 9.19398 10.2834 9.20011 9.70664 9.20011H5.22664C4.6517 9.20011 4.5285 9.19551 4.44824 9.17865C4.28056 9.14571 4.12726 9.07526 4.00534 8.97512C3.88343 8.87498 3.79767 8.74905 3.75757 8.61131C3.74077 8.54845 3.7333 8.44725 3.7333 7.97345V4.29345C3.7333 3.82118 3.7389 3.71998 3.75944 3.65405C3.79954 3.51631 3.8853 3.39038 4.00721 3.29024C4.12912 3.1901 4.28242 3.11965 4.4501 3.08671L4.44824 3.08825ZM18.2933 1.53345H18.2C17.7725 1.53345 17.4048 1.53345 17.08 1.59631C16.5772 1.69501 16.1174 1.90612 15.7517 2.20626C15.386 2.5064 15.1286 2.88384 15.008 3.29678C14.9333 3.56358 14.9333 3.86411 14.9333 4.21678V8.05011C14.9333 8.40125 14.9333 8.70331 15.0098 8.97011C15.13 9.38314 15.387 9.76078 15.7524 10.0612C16.1178 10.3616 16.5773 10.573 17.08 10.6721C17.4048 10.7334 17.7706 10.7334 18.2 10.7334H22.8666C23.2941 10.7334 23.6618 10.7334 23.9866 10.6706C24.4895 10.5719 24.9492 10.3608 25.3149 10.0606C25.6806 9.7605 25.938 9.38305 26.0586 8.97011C26.1333 8.70331 26.1333 8.40278 26.1333 8.05011V4.21678C26.1333 3.86565 26.1333 3.56358 26.0568 3.29678C25.9366 2.88376 25.6796 2.50612 25.3142 2.20571C24.9488 1.9053 24.4893 1.69385 23.9866 1.59478C23.6618 1.53345 23.296 1.53345 22.8666 1.53345H18.2933ZM17.5149 3.08825C17.5952 3.07291 17.7202 3.06678 18.2933 3.06678H22.7733C23.3482 3.06678 23.4714 3.07138 23.5517 3.08825C23.7194 3.12119 23.8727 3.19163 23.9946 3.29177C24.1165 3.39192 24.2023 3.51784 24.2424 3.65558C24.261 3.71998 24.2666 3.82118 24.2666 4.29345V7.97345C24.2666 8.44571 24.2592 8.54691 24.2405 8.61285C24.2004 8.75059 24.1146 8.87651 23.9927 8.97665C23.8708 9.07679 23.7175 9.14724 23.5498 9.18018C23.4714 9.19551 23.3482 9.20011 22.7733 9.20011H18.2933C17.7184 9.20011 17.5952 9.19551 17.5149 9.17865C17.3472 9.14571 17.1939 9.07526 17.072 8.97512C16.9501 8.87498 16.8643 8.74905 16.8242 8.61131C16.8074 8.54845 16.8 8.44725 16.8 7.97345V4.29345C16.8 3.82118 16.8056 3.71998 16.8261 3.65405C16.8662 3.51631 16.952 3.39038 17.0739 3.29024C17.1958 3.1901 17.3491 3.11965 17.5168 3.08671L17.5149 3.08825ZM5.1333 12.2668H9.79997C10.2274 12.2668 10.5952 12.2668 10.92 12.3296C11.4228 12.4283 11.8825 12.6395 12.2482 12.9396C12.614 13.2397 12.8714 13.6172 12.992 14.0301C13.0666 14.2969 13.0666 14.5974 13.0666 14.9501V18.7834C13.0666 19.1346 13.0666 19.4366 12.9901 19.7034C12.87 20.1165 12.613 20.4941 12.2476 20.7945C11.8822 21.0949 11.4227 21.3064 10.92 21.4054C10.5952 21.4668 10.2293 21.4668 9.79997 21.4668H5.1333C4.70584 21.4668 4.3381 21.4668 4.0133 21.4039C3.51049 21.3052 3.05076 21.0941 2.68504 20.794C2.31933 20.4938 2.06191 20.1164 1.9413 19.7034C1.86664 19.4366 1.86664 19.1361 1.86664 18.7834V14.9501C1.86664 14.599 1.86664 14.2969 1.94317 14.0301C2.06332 13.6171 2.32032 13.2394 2.68571 12.939C3.0511 12.6386 3.5106 12.4272 4.0133 12.3281C4.3381 12.2668 4.70397 12.2668 5.1333 12.2668ZM5.22664 13.8001C4.6517 13.8001 4.5285 13.8047 4.44824 13.8216C4.28056 13.8545 4.12726 13.925 4.00534 14.0251C3.88343 14.1252 3.79767 14.2512 3.75757 14.3889C3.74077 14.4518 3.7333 14.553 3.7333 15.0268V18.7068C3.7333 19.179 3.7389 19.2802 3.75944 19.3462C3.79954 19.4839 3.8853 19.6098 4.00721 19.71C4.12912 19.8101 4.28242 19.8806 4.4501 19.9135C4.52851 19.9288 4.6517 19.9334 5.22664 19.9334H9.70664C10.2816 19.9334 10.4048 19.9273 10.485 19.912C10.6527 19.879 10.806 19.8086 10.9279 19.7085C11.0498 19.6083 11.1356 19.4824 11.1757 19.3446C11.1944 19.2802 11.2 19.179 11.2 18.7068V15.0268C11.2 14.5545 11.1944 14.4533 11.1738 14.3874C11.1337 14.2496 11.048 14.1237 10.9261 14.0236C10.8042 13.9234 10.6509 13.853 10.4832 13.82C10.4066 13.8062 10.2834 13.8001 9.70664 13.8001H5.22664ZM18.2933 12.2668H18.2C17.7725 12.2668 17.4048 12.2668 17.08 12.3296C16.5772 12.4283 16.1174 12.6395 15.7517 12.9396C15.386 13.2397 15.1286 13.6172 15.008 14.0301C14.9333 14.2969 14.9333 14.5974 14.9333 14.9501V18.7834C14.9333 19.1346 14.9333 19.4366 15.0098 19.7034C15.13 20.1165 15.387 20.4941 15.7524 20.7945C16.1178 21.0949 16.5773 21.3064 17.08 21.4054C17.4048 21.4683 17.7725 21.4683 18.2 21.4683H22.8666C23.2941 21.4683 23.6618 21.4683 23.9866 21.4054C24.4891 21.3065 24.9484 21.0953 25.3138 20.7952C25.6792 20.495 25.9363 20.1177 26.0568 19.705C26.1333 19.4382 26.1333 19.1361 26.1333 18.785V14.9501C26.1333 14.599 26.1333 14.2969 26.0568 14.0301C25.9366 13.6171 25.6796 13.2394 25.3142 12.939C24.9488 12.6386 24.4893 12.4272 23.9866 12.3281C23.6618 12.2668 23.296 12.2668 22.8666 12.2668H18.2933ZM17.5149 13.8216C17.5952 13.8062 17.7202 13.8001 18.2933 13.8001H22.7733C23.3482 13.8001 23.4714 13.8047 23.5517 13.8216C23.7194 13.8545 23.8727 13.925 23.9946 14.0251C24.1165 14.1252 24.2023 14.2512 24.2424 14.3889C24.261 14.4533 24.2666 14.5545 24.2666 15.0268V18.7068C24.2666 19.179 24.2592 19.2802 24.2405 19.3462C24.2004 19.4839 24.1146 19.6098 23.9927 19.71C23.8708 19.8101 23.7175 19.8806 23.5498 19.9135C23.4714 19.9288 23.3482 19.9334 22.7733 19.9334H18.2933C17.7184 19.9334 17.5952 19.9273 17.5149 19.912C17.3472 19.879 17.1939 19.8086 17.072 19.7085C16.9501 19.6083 16.8643 19.4824 16.8242 19.3446C16.8074 19.2818 16.8 19.1806 16.8 18.7068V15.0268C16.8 14.5545 16.8056 14.4533 16.8261 14.3874C16.8662 14.2496 16.952 14.1237 17.0739 14.0236C17.1958 13.9234 17.3491 13.853 17.5168 13.82L17.5149 13.8216Z"  fill="#767676" class="svg-color"/>
  </svg>
  `);
  contentOne = this.sanitize.bypassSecurityTrustHtml(`
  <svg xmlns="http://www.w3.org/2000/svg" style="width:22px;height:23px;" viewBox="0 0 23 21" fill="none">
  <path d="M21.6474 0.272705H1.18588C0.959763 0.272705 0.74291 0.381893 0.583023 0.576249C0.423136 0.770605 0.333313 1.03421 0.333313 1.30907V18.9272C0.333313 19.477 0.51296 20.0042 0.832733 20.3929C1.15251 20.7816 1.58621 21 2.03844 21H20.7949C21.2471 21 21.6808 20.7816 22.0006 20.3929C22.3203 20.0042 22.5 19.477 22.5 18.9272V1.30907C22.5 1.03421 22.4102 0.770605 22.2503 0.576249C22.0904 0.381893 21.8735 0.272705 21.6474 0.272705ZM2.03844 8.56361H6.30126V12.7091H2.03844V8.56361ZM8.00639 8.56361H20.7949V12.7091H8.00639V8.56361ZM20.7949 2.34543V6.49089H2.03844V2.34543H20.7949ZM2.03844 14.7818H6.30126V18.9272H2.03844V14.7818ZM20.7949 18.9272H8.00639V14.7818H20.7949V18.9272Z" fill="#767676" fill-opacity="1" class="svg-color"/>
  </svg>
  `);
  //Filter Part:- 
  tabs:{ title: string; gridicon: any; active: boolean }[] = [];
  requestData: any[] = [];
  createdData: any[] = [];
  filtersEventRequest: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  filtersEventCreated: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  filterDataRequest: { BulkReturnType: string, BulkReturnStatusCode: string; BulkReturnStatusDesc: string; LocationCode: string } = {
    BulkReturnType: '',
    BulkReturnStatusCode: '',
    BulkReturnStatusDesc: '',
    LocationCode: '',
  };
  Spinner = false

 
  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private dropdownDataService: DropdownDataService,
    private sanitize : DomSanitizer,    

  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/bulk-return-order'], { queryParams: { headerguid: event.row.BulkReturnOrderHeaderGUID} })
    }
  }

  ngOnInit(): void {
    // Dashboard Part:-
    this.statuses = this.BulkReturnTypeDD.Data.map((index) => ({
      BulkReturnType: '',
      JobStatusDesc: index.TEXT,
      JobCount: 0
    }));
    this.tabs.push({ 'title': '', 'gridicon': this.content, 'active': true})
    this.tabs.push({ 'title': '', 'gridicon': this.contentOne, 'active': false})
    this.getStatusCount()

    this.onLocationSearch({ term: "", item: [] });
    this.onBulkReturnType({ term: "", item: [] });
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

    // Dashboard Part:- 
  selectTab(index) {
    this.tabs = this.tabs.map((tab, tabIndex) => ({
      ...tab,
      active: tabIndex === index
    }));
  }

  AddBulkReturn(){

  }

  
  onCardSelected(status) {

    this.tabs[0].active = false;
    this.tabs[1].active = true;

    console.log("Selected ", status)
    this.filterDataRequest.BulkReturnStatusCode = status.BulkReturnStatusCode
    this.filterDataRequest.BulkReturnStatusDesc = status.BulkReturnStatusDesc
    this.filterDataRequest.BulkReturnType = status.ReturnTypeCode
    this.filterDataRequest.LocationCode = this.LocationCode;
    this.filtersEventRequest.next(this.filterDataRequest);
   
  }
  

  getStatusCount(){
    this.showSpinner()

      let requestData =[]
      requestData.push({
        "Key": "APIType",
        "Value": "GetBulkReturnDashboard"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest =
      {
        "content": strRequestData
      };
      // console.log("Before SP:-", requestData)
      this.ngxservice.show()
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (Value) => {
            this.ngxservice.hide()
            this.results = []
            try {
              let response = JSON.parse(Value.toString());
              if(response.ReturnCode =='0'){
                response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
                console.log("Response", response)
                let ReturnTypeDesc=[];
                if(response?.ExtraDataJSON?.Dashboard != null && !Array.isArray(response.ExtraDataJSON.Dashboard)) {
                  response.ExtraDataJSON.Dashboard = [response.ExtraDataJSON.Dashboard];
                }
                for(let job of response.ExtraDataJSON.Dashboard){
                  ReturnTypeDesc.push(job.ReturnTypeDesc);
                }
                var set = new Set(ReturnTypeDesc);
                ReturnTypeDesc=[...set];
                this.BulkReturnData = [];
                for(let job of ReturnTypeDesc) {
                  let jobList = [];
                  for(let jobItem of response.ExtraDataJSON.Dashboard){
                    if(jobItem.ReturnTypeDesc == job){
                      jobItem.JobStatusDesc= jobItem.BulkReturnStatusDesc
                      jobItem.JobCount = jobItem.BulkReturnStatusCount
                      jobList.push(jobItem);
                    }
                  }
                  this.BulkReturnData.push( {
                    "header": job,
                    "list": jobList
                  });
                }
              }
              console.log("Job List ", this.BulkReturnData)
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
    

      // this.requestData.push( {
      //   "header": 'Sales Return Request',
      //   "list": this.statuses
      // });
      // this.statuses = this.BulkReturnTypeDD.Data.map((status) => ({
      //   SalesReturnType: '',
      //   JobStatusDesc: status,
      //   JobCount: 0
      // }));
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add(){
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/bulk-return-order/']);
  }

  Search(){
    this.GetBulkOrder('')
  }

  GetBulkOrder(eventDetail) {
    
     ;
    if (this.BulkReturnType == null || this.BulkReturnType == undefined || this.BulkReturnType == ''){
      this.toast.error("Please select a Return Type")
      return
    }
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetBulkReturnOrderList"
    });
    requestData.push({
      "Key": "ReturnType",
      "Value": this.BulkReturnType
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
                this.toast.error("No Records Found")
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
        this.GetBulkOrder(event.eventDetail )
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

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  
  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }


}
