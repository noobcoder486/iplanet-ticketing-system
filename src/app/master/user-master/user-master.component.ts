import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { Observable } from 'rxjs/internal/Observable';
import * as glob from 'src/app/config/global'
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';

@Component({
  selector: 'app-user-master',
  templateUrl: './user-master.component.html',
  styleUrls: ['./user-master.component.css']
})
export class UserMasterComponent implements OnInit {
  filterList: Filter[] = [];
  userName: string = '';
  primaryEmail: string = '';
  mobieleNo: string = '';

  EmployeeCode:string='';
  BaseLocationCode:string='';

  jobPagination: PaginationMetaData;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"UserName",title:"User Name"},
    {datatype:"STRING",field:"FirstName",title:"First Name"},
    {datatype:"STRING",field:"LastName",title:"Last Name"},
    {datatype:"STRING",field:"PrimaryEmail",title:"Primary Email"},
    {datatype:"STRING",field:"Status",title:"Status"},
    {datatype:"STRING",field:"MobileNo",title:"Mobile Number"},
    {datatype:"STRING",field:"JobRoleId",title:"Job Role"},
    {datatype:"STRING",field:"OrgRoleId",title:"Org Role"},
    {datatype:"STRING",field:"AddressLine1",title:"Address 1"},
    {datatype:"STRING",field:"AddressLine2",title:"Address 2"},
    {datatype:"STRING", field:"AddressCity", title:"City"},
    {datatype:"STRING", field:"AddressStateCode", title:"State Code"},
    {datatype:"STRING", field:"AddressPostalCode", title:"Postal Code"},
    {datatype:"STRING", field:"AddressCountry", title:"Country Code"},
    {datatype:"STRING", field:"GsxUserId", title:"GSX User Id"},
    {datatype:"STRING", field:"GSXTechId", title:"GSX Tech Id"},
    {datatype:"STRING", field:"GsxIdFlag", title:"GSX Flag Id"},
    {datatype:"STRING", field:"EmployeeCode", title:"Employee Code"},
    {datatype:"STRING", field:"BaseLocationCode", title:"Base Location Code"},

  ];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  constructor(
    private dynamicService: DynamicService,
    private route: Router,    
    private ngxservice: NgxSpinnerService,
    private datePipe: DatePipe,
    private reportService: ReportService,

  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
  }

  ngOnInit(): void {
    this.GetUserList('', '', '','','');
  }

  search() {
     this.EmployeeCode=this.EmployeeCode.trim();
    this.GetUserList(this.userName, this.primaryEmail, this.mobieleNo,this.EmployeeCode,this.BaseLocationCode);
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['auth/'+glob.getCompanyCode()+'/add-user-master'], { queryParams: { nc:event.row.UserName } })
    }
  }

  add(){
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-user-master']);
  }

  GetUserList(username, primaryemail,mobileno , EmployeeCode ,BaseLocationCode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetUserList"
    });
    requestData.push({
      "Key": "UserName",
      "Value": username
    });
    requestData.push({
      "Key": "PrimaryEmail",
      "Value": primaryemail
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": mobileno
    });
    requestData.push({
      "Key": "EmployeeCode",
      "Value": EmployeeCode == null || EmployeeCode == undefined ? '' : EmployeeCode
    });
    requestData.push({
      "Key": "BaseLocationCode",
      "Value": BaseLocationCode == null || BaseLocationCode == undefined ? '' :BaseLocationCode
    });
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log(strRequestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              let results = []
              if(Array.isArray(data?.UserList?.User))
              {
                results = data?.UserList?.User
              }
              else
              {
                results.push(data?.UserList?.User)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
              this.ngxservice.hide()
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetUserList"
        });
        requestData.push({
          "Key":"PageNo",
          "Value": event.eventDetail.pageIndex + 1 
        });
        requestData.push({
          "Key":"PageSize",
          "Value": event.eventDetail.pageSize
        });

        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content" : strRequestData
        };
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next : (Value) =>
            {
              try{
                let response = JSON.parse(Value.toString());
                if(response.ReturnCode =='0')
                {
                  let data = JSON.parse(response?.ExtraData);
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.UserList?.User });
                }
              }catch(ext){
                console.log(ext);
              }
            },
            error : err =>
            {
              console.log(err);
            }
          }
        );
        break;
    }  
    setTimeout(()=>{  this.hideSpinnerEvent.next(); }, 1);
  }

  results
  StartDate = '2000-01-01'
  EndDate = new Date()
  exportReportData()
  {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    // if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
    // {
      {
        let requestData = []
        this.ngxservice.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportUserLocationData"
        })       
        requestData.push({
          "Key":"StartDate",
          "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
        })
        requestData.push({
          "Key":"EndDate",
          "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
        })
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        

        // EXPORTPAYMENT Should be change for advance payment report
        this.reportService.downloadServiceReport('UNIVERSAL',contentRequest).subscribe(
          {
            next: (Value) => {
              try {

                const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
                const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `User_Report_${startformattedDate}_to_${endformattedDate}.xls`;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                this.ngxservice.hide();

              } catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              console.log(err);
              this.ngxservice.hide()
            }
          }
        );
      }
  }
}