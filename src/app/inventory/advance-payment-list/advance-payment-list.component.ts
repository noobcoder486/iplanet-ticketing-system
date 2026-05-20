import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as glob from "../../config/global";
import { BehaviorSubject } from 'rxjs';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';


@Component({
  selector: 'app-advance-payment-list',
  templateUrl: './advance-payment-list.component.html',
  styleUrls: ['./advance-payment-list.component.css']
})
export class AdvancePaymentListComponent implements OnInit {

 
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  typeSelected = 'ball-clip-rotate';
  MobileNo: string;
  CaseId : string;
  LocationCode: string;
  actionDetails: any[]=[  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  isApproverPermission= false
  userName: string 
   allowedUsers = [
    'sarathnesh@consolidated.one',
    'parthasarathys@consolidated.one',
    'lakshminarayanan.intern@consolidated.one'
  ];

  // columns: Columns[] = [];
  columns: Columns[] = [
    { datatype: "STRING", field: "PaymentCode", title: "Payment Code" },
    { datatype: "STRING", field: "CaseId", title: "Case Id" },
    { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "TotalPaidAmount", title: "Advance Payment Amount" },
    { datatype: "STRING", field: "CurrencyCode", title: "Currency Code" },
    { datatype: "DATE", field: "CreatedDate", title: "Payment Date" },
  ];

  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private ngxSpinner:NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.GetAdvancePaymentList('','','','');
    this.userName = glob.getLogedInUser().UserDetails.UserName.toString();
    this.userName = this.userName.toLowerCase()
    this.checkLocalPermission()
  }

  search(){
    this.GetAdvancePaymentList('', this.MobileNo, this.LocationCode, this.CaseId) 
  }
  actionEmit(event){
    // console.log("action Emit", event);
    if(event.action == 'VIEW'){ 
      this.router.navigate(['/auth/' +glob.getCompanyCode() + '/advance-payment/'], {queryParams: { caseguid:event.row.CaseGUID, paymentguid:event.row.PaymentGUID,customercode:event.row.CustomerCode ,locationcode:event.row.LocationCode}})
    }
    if(event.action == 'CANCEL'){ 
      this.router.navigate(['/auth/' +glob.getCompanyCode() + '/cancel-advance/'], {queryParams: { caseguid:event.row.CaseGUID, paymentguid:event.row.PaymentGUID,customercode:event.row.CustomerCode ,locationcode:event.row.LocationCode}})
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
    
    if ( this.allowedUsers.includes(this.userName) ){
      this.actionDetails =[
        {"code": "VIEW","icon": "view","title": "View"},
        {"code": "CANCEL","icon": "delete","title": "Cancel Advance"},
      ];
    }
    else{
      this.actionDetails =[
        {"code": "VIEW","icon": "view","title": "View"},
      ];
    }
    return resp != undefined && resp?.View ? true : false;
  }  

  
  // checkLocalPermission() {
  //   let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
  //   console.log("Permissions ", allPermision)
  //   let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
  //   console.log("Data Local Approver Permissions ", resp)
    
  //   if(resp?.View == true){
  //     this.isApproverPermission = true;
  //   }
  //   
  //   if ( this.userName == 'sarathnesh@consolidated.one' ){
  //     this.actionDetails =[
  //       {"code": "VIEW","icon": "view","title": "View"},
  //       {"code": "CANCEL","icon": "delete","title": "Cancel Advance"},
  //     ];
  //   }
  //   else{
  //     this.actionDetails =[
  //       {"code": "VIEW","icon": "view","title": "View"},
  //     ];
  //   }
  //   return resp != undefined && resp?.View ? true : false;
  // }  


  GetAdvancePaymentList(eventDetail, mobileno, locationcode, caseid) {
  
    this.ngxSpinner.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetAdvancePaymentList"
    })
    requestdata.push({
      "Key":"MobileNo",
      "Value": mobileno == null || mobileno == undefined ? '' : mobileno
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": locationcode == null || locationcode == undefined ? '' : locationcode
    })
    requestdata.push({
      "Key":"CaseId",
      "Value": caseid == null || caseid == undefined ? '' : caseid
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
    console.log("Before Advance payment SP:", requestdata)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxSpinner.hide()
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
              if( Array.isArray(data.AdvancePaymentList?.AdvancePaymentRow) ) {
                ExtraData = data.AdvancePaymentList?.AdvancePaymentRow;
              }
              else{
                ExtraData.push(data.AdvancePaymentList?.AdvancePaymentRow)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: ExtraData })
              }
            } catch (ext) {
          }
        },
        error: err => {
          this.ngxSpinner.hide()
          console.log(err)
        }

      }
    );
  }


  PageChange( event){
    switch(event.eventType){
      case "PageChange":
        this.GetAdvancePaymentList(event.eventDetail , this.MobileNo , this.LocationCode , this.CaseId )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;

      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
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

  newAdvancePayment(){
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/advance-payment']);
  }
}
