import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { HttpClient } from '@angular/common/http';
import { Columns } from 'src/app/models/column.metadata';


@Component({
  selector: 'app-happy-calling-list',
  templateUrl: './happy-calling-list.component.html',
  styleUrls: ['./happy-calling-list.component.css']
})
export class HappyCallingListComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  IncomingInvStatusDD: DropDownValue = DropDownValue.getBlankObject();

  EmailId: string;
  MobileNo: string;
  CaseId
  LocationCode: string;
  SAPGrnCode: string;
  breadCumbList: any[];
  toolBarAction: any[] = [];
  StatusDD:string[]= ['OPEN', 'FOLLOW-UP', 'CLOSED']
  LeadStatus: string 
  InvoiceStatus: string;
  Ship_to_GSX: string;
  selectedCallForm:string;
  LeadManagementList: any[]= [];
  errorMessage: string;
  isApproverPermission = false
  submitClicked= false 

  //Incoming Invoice
  
  Remark: string
  StartDate:any;
  EndDate:any;
  StartTime
  EndTime
  IsSerialNoExists : boolean = true
  selectedFileName: string | null = null;
  maxDate : Date
  ExportStartDate:any;
  ExportEndDate:any;
  // Toggle Page Number 
  pageSize : number = 10; 
  pageIndex = 0 
  pageCount: number; 
  ErrorList: any[] = [];
  UpdatedpageSize: number=10;
  Spinner = false
  TotalRecords: number = 0
  currentRange
  gridDetailColumns: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  LocationCodeForExport


  columns: Columns[] =
  [
    { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
    { datatype: "STRING", field: "UniqueId", title: "Case Id" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "LeadStatus", title: "Happy Calling Status" },
    { datatype: "STRING", field: "ParentDetails", title: "Parent Details" },
    { datatype: "STRING", field: "CallType", title: "Call Type" },
    { datatype: "STRING", field: "CallCategory", title: "Call Category" },
    { datatype: "STRING", field: "CustomerName", title: "Customer Name" },
    { datatype: "STRING", field: "LeadDisposition", title: "Happy Calling Disposition" },
    { datatype: "STRING", field: "Notes", title: "Notes" },
  
  ]


  constructor(
    private route: Router,
    private dialog: MatDialog,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private reportService : ReportService,
    private http : HttpClient,
    private gsxService : GsxService
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    // this.onIncomingStatusSearch({ term: "", item: [] });
    this.GetLeadManagementList('')
    this.checkLocalPermission()
    this.maxDate = new Date()

  }

  options: number[] = [5, 10, 20, 50 ];
selectedOption: string;

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }
 


  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];

 


  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/happy-calling'], { queryParams: { leadguid: event.row.LeadManagementGUID } })
    }
  }
  PageChange( event){
    switch(event.eventType){
      case "PageChange":
        this.GetLeadManagementList(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  GetLeadManagementList(eventDetail) {
    this.LeadManagementList = []
    this.Spinner = true
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetLeadManagementList"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key":"LeadType",
      "Value": "HAPPYCALLING"
    })
    requestdata.push({
      "Key": "CaseId",
      "Value": this.CaseId == null || this.CaseId == undefined ? '' : this.CaseId
    });
    requestdata.push({
      "Key": "MobileNo",
      "Value": this.MobileNo == null || this.MobileNo == undefined ? '' : this.MobileNo
    });
    requestdata.push({
      "Key": "LeadStatus",
      "Value": this.LeadStatus == null || this.LeadStatus == undefined ? '' : this.LeadStatus
    });
    
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
    this.Spinner= true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          
          try {
            this.Spinner = false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.TotalRecords == "0"){
                this.toast.error("No Data Found")
                return
              }
              if( Array.isArray(data.LeadManagementList?.LeadRow) ) {
                this.LeadManagementList = data.LeadManagementList?.LeadRow;
              }
              else{
                this.LeadManagementList.push(data.LeadManagementList?.LeadRow)
              }
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.LeadManagementList });
              this.ngxSpinnerService.hide()
            
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.Spinner = false
          this.Spinner = false
          console.log(err)
        }

      }
    );
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  exportHappyCallingData() {
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      let requestData = []
      this.ngxSpinnerService.show();
      requestData.push({
        "Key": "APIType",
        "Value": "ExportHappyCallingList"
      })
      requestData.push({
        "Key": "StartDate",
        "Value": this.StartDate
      })
      requestData.push({
        "Key": "EndDate",
        "Value": this.EndDate
      })
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationCodeForExport
      })
      
      let strRequestData = JSON.stringify(requestData);
      let contentRequest =
      {
        "content": strRequestData
      };
      
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
        {
          next: (Value) => {
            this.ngxSpinnerService.hide()
            try {
              
              const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
              const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
              let response = JSON.parse(Value.toString());
              console.log("this is from export by Amit " , response);
              const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
              var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
              // Create a download link
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.href = url;
              const fileName = `HappyCalling_Report_${startformattedDate}_to_${endformattedDate}.xls`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();

            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
          }
        }
      );
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }

  }
  
}
