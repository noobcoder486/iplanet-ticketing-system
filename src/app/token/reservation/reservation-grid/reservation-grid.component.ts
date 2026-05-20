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

@Component({
  selector: 'app-reservation-grid',
  templateUrl: './reservation-grid.component.html',
  styleUrls: ['./reservation-grid.component.css']
})
export class ReservationGridComponent implements OnInit {

  actionDetails: any[]=[
    {"code": "VIEW","icon": "remove_red_eye","title": "View Reservation"},
    // {"code": "CREATE","icon": "create","title": "Create Job"}
  ];
  screen:any;
  Location: any;

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';

  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  ReservationStatusDD: DropDownValue = DropDownValue.getBlankObject();
  // ReservationStatusDD= ['SENT FOR APPROVAL', 'PARTIALLY APPROVED', 'APPROVED', 'REJECTED']
  // ReservationDocType = ''; // Initialized so that the Columns can be updated accordingly
  ReservationStatusCode: string;
  ReservationTypeCode: string;
  MobileNo: string;
  searchCustomerName: string;
  ReservationCode: string;  
  ServiceRefNo: string;
  CaseID: string;

  // Customer List
  openCustomerList = false;
  // columns: Columns[] = [];
  columns: Columns[] = [
    { datatype: "STRING", field: "ReservationCode", title: "Reservation Code" },
    { datatype: "STRING", field: "CaseId", title: "Case Id" },
    { datatype: "STRING", field: "CustomerFirstName", title: "Customer First Name" },
    { datatype: "STRING", field: "CustomerLastName", title: "Customer Last Name" },
    { datatype: "STRING", field: "CustomerMobileNo", title: "Customer Mobile No" },
    { datatype: "STRING", field: "ReservationStatusDesc", title: "Reservation Status" },
    { datatype: "STRING", field: "ReservationType", title: "Reservation Type" },
    { datatype: "STRING", field: "ProblemOrRemark", title: "Reservation Remark" },
    { datatype: "DATE", field: "ReservationDate", title: "Reservation Date" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "ServiceRefNo", title: "Service Ref No" },
  ];

  // Dashboard List Part:- 
  @Input() filters: Observable<any>;
  statuses: { JobStatusDesc: string; JobCount: number }[] = [];
  filterList: any[] =[]

  // Unsubscribe
  private filtersSubscription: Subscription;

  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private dropdownDataService: DropdownDataService,
    private sanitize : DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.onReservationStatusSearch({ term: "", item: [] });
    this.filtersSubscription = this.filters.subscribe({
      next: (value: any) => {
        if (value && Object.keys(value).length > 0) {
          this.filterList = [];
          console.log("Filters", value);
          if (value.ReservationStatusCode) {
            this.ReservationStatusCode = value.ReservationStatusCode
          }
          if (value.ReservationTypeCode) {
            this.ReservationTypeCode = value.ReservationTypeCode
          }
          this.GetReservationList('' , this.MobileNo ,  this.searchCustomerName, this.ReservationCode, this.ServiceRefNo, this.ReservationTypeCode, this.ReservationStatusCode, this.CaseID)

          this.actionDetails = [
            {"code": "VIEW","icon": "remove_red_eye","title": "View Reservation"},
            {"code": "VIEWJOB","icon": "remove_red_eye","title": "View Job"},
            {"code": "CREATE","icon": "create","title": "Create Job"}
          ];

        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the Observable to release resources
    if (this.filtersSubscription) {
      this.filtersSubscription.unsubscribe();
    }
  }

  
  onDocTypeChange(){
    this.GetReservationList('' ,this.MobileNo , this.searchCustomerName, this.ReservationCode, this.ServiceRefNo,this.ReservationTypeCode, this.ReservationStatusCode, this.CaseID)
  }

  GetReservationList(eventDetail, mobileno,  customername, reservationcode,servicerefno, doctype, status, caseid) {
    // console.log("Reservation Against", this.ReservationDocType)
    // if (doctype== null || doctype == undefined || doctype == '' ){
    //   this.toast.error("Please select a Reservation Against Type");
    //   return;
    // }
    //  
    this.ngxservice.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetReservationList"
    })
    requestdata.push({
      "Key":"CustomerMobileNo",
      "Value": mobileno == null || mobileno == undefined ? '' : mobileno
    })
    requestdata.push({
      "Key":"CustomerName",
      "Value": customername == null || customername == undefined ? '' : customername
    })
    requestdata.push({
      "Key":"ReservationCode",
      "Value": reservationcode == null || reservationcode == undefined ? '' : reservationcode
    })
    requestdata.push({
      "Key":"ServiceRefNo",
      "Value": servicerefno == null || servicerefno == undefined ? '' : servicerefno
    })
    requestdata.push({
      "Key":"ReservationType",
      "Value": doctype == null || doctype == undefined ? '' : doctype
    })
    requestdata.push({
      "Key":"CaseId",
      "Value": caseid == null || caseid == undefined ? '' : caseid
    })
    requestdata.push({
      // "Key": this.isApproverL3 ? "ReservationStatusFinal": "ReservationStatusCode",
      "Key":  "ReservationStatus",
      "Value": status == null || status == undefined ? '' : status
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
    console.log("Before Request SP:", requestdata)
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
              if( Array.isArray(data.ReservationList?.Reservation) ) {
                ExtraData = data.ReservationList?.Reservation
              }
              else{
                ExtraData.push(data.ReservationList?.Reservation)
              }
              // this.toast.success("Records Found")
              // console.log("Reservation Rows are:- ",ExtraData)
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
        this.GetReservationList(event.eventDetail , this.MobileNo , this.searchCustomerName, this.ReservationCode , this.ServiceRefNo, this.ReservationTypeCode , this.ReservationStatusCode , this.CaseID)
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
         this.route.navigate(['/auth/' +glob.getCompanyCode() + '/reservation/'], {queryParams: { rc:event.row.ReservationCode , rt : 'RESV'}})
    }
    
    if(event.action == 'CREATE' ){ 
      if (event.row.ReservationStatus=='DTS')
        // this.route.navigate(['/auth/' + glob.getCompanyCode() + '/create-job-customer'], { queryParams: { doctype: 'snr' , cc: glob.getCompanyCode(), nc: this.CustomerCode, tc: this.TokenNumber, td: this.TokenCreatedDate, cn: this.CounterNumber, lc: this.selectedLocationCode } })
        this.route.navigate(['/auth/' +glob.getCompanyCode() + '/customer-list/'], {queryParams: { mb:event.row.CustomerMobileNo ,locationcode:event.row.LocationCode, rc:event.row.ReservationCode}})
      else
        this.toast.error("Can't create job, invalid status!")
    }
    if(event.action == 'VIEWJOB'){ 
      
      if (event.row?.CaseGUID != null || event.row?.CaseGUID != undefined || event.row?.CaseGUID != '' )
        this.route.navigate(['/auth/' +glob.getCompanyCode() + '/repair-process/'], {queryParams: { guid:event.row.CaseGUID}})
      else
        this.toast.error("No job details found!")
    }
    
  }


  onReservationStatusSearch($event: { term: string; item: any[] }) {
    // this.showSpinner = true
    this.dropdownDataService.fetchDropDownData(DropDownType.ReservationStatus, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          
          // this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.ReservationStatusDD = value;
        }
      },
      error: (err) => {
        this.ReservationStatusDD = DropDownValue.getBlankObject();
      }
    });
  }


}
