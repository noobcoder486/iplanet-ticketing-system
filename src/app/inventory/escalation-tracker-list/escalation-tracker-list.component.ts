import { Component, OnInit,Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from "src/app/config/global"
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { Observable } from 'rxjs/internal/Observable';
import { ToastrService } from 'ngx-toastr';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

@Component({
  selector: 'app-escalation-tracker-list',
  templateUrl: './escalation-tracker-list.component.html',
  styleUrls: ['./escalation-tracker-list.component.css']
})
export class EscalationTrackerListComponent implements OnInit {


  filterList: Filter[] = [];
  ticketId: String = '';
  emailId: String = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"FromEmailId",title:"From Email Id"},
    {datatype:"STRING",field:"TicketId",title:"Ticket Id"},
  ];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen:any;
  constructor(
    private dynamicService: DynamicService,
    private route: Router,    
    private ngxservice: NgxSpinnerService,
    private toast : ToastrService,
    private gsxService: GsxService
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});}

    ngOnInit(): void {
      this.GetEscalationTrackerList('', ''); 
    }
  
    search() {
      this.GetEscalationTrackerList(this.ticketId, this.emailId);
    }
 
  
    GetEscalationTrackerList(ticketId, emailId) {
      this.ngxservice.show();
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "GetEscalationTrackerList"
      });
      requestData.push({
        "Key": "TicketId",
        "Value": ticketId
      });
      requestData.push({
        "Key": "FromEmailId",
        "Value": emailId
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
      
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (Value) => {
            try {
              let response = JSON.parse(Value.toString());
              if (response.ReturnCode == '0') {
                let data = JSON.parse(response?.ExtraData);
                
                let results = []
                if(Array.isArray(data?.EscalationTrackerList?.EscalationTracker))
                {
                  results = data?.EscalationTrackerList?.EscalationTracker
                }
                else
                {
                  results.push(data?.EscalationTrackerList?.EscalationTracker)
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
  
  
    actionEmit(event){
      console.log("action Emit", event);
      if(event.action == 'EDIT'){
        this.route.navigate(['/auth/'+glob.getCompanyCode()+'/escalation-tracker'], { queryParams: { trackerguid:event.row.EscalationTrackerGUID } })
      }
    }
  
    loadPageData(event){
      switch(event.eventType){
        case "PageChange":
          this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
          let requestData =[];
  
          requestData.push({
            "Key":"APIType",
            "Value": "GetEscalationTrackerList"
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
                    this.detail.next({totalRecord:data?.Totalrecords , Data: data?.EscalationTrackerList?.EscalationTracker });
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
  
  



  // Testing Map GID 
  getRepairDetails() {
    let searchData = { "repairId": 'G621375560' };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = 'CBE5'
    var CompanyCode = glob.getCompanyCode()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("Repair response:- " , response)
          if ((response.errors == undefined || response.errors == null)) {
            this.getRepair() 
          }
          else
          {
            this.toast.error(response.errors[0].message,"Error")
          }
  
        }
      });

  }
  repa
  PartSelectionMode
  getRepair() {
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "GetJobObject"
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": "974A76D1-EC91-4967-87F4-8BC4D1A51259",
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
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (Value) => {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
              this.repa = response['ExtraDataJSON'];
              this.getPartSummaryData()
              console.log("JOB ", this.repa)
            }
          },
          error: err => {
            console.log(err);
          }
        }
      );
    }


  getPartSummaryData() {
    
    this.PartSelectionMode="Normal";
    var showOnluWholeUsit = false
    if(this.repa.DIAG?.RepairType=="WUMS")
    {
      showOnluWholeUsit = true
    }  
      var iCtr=1
      var SelectedComponentIssue=[];
    
      if(Array.isArray(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL))
      {
        for ( var item of this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL)
        {
          SelectedComponentIssue.push({
            "componentCode": item.ComponentCode,
            "issueCode": item.IssueCode,
            "type": "TECH",
            "reproducibility": this.repa.DIAG?.RepairType=="WUMS" ? item.ReproducibilityCode:null,
            "order":iCtr,
            "priority":iCtr
          })
        }
    
      }
      else
      {
        var lstDiagDetail=[];
        lstDiagDetail.push(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL);
        SelectedComponentIssue.push({
          "componentCode": lstDiagDetail[0].ComponentCode,
          "issueCode": lstDiagDetail[0].IssueCode,
          "type": "TECH",
          "reproducibility": this.repa.DIAG?.RepairType=="WUMS" ? lstDiagDetail[0].ReproducibilityCode:null,
          "order":1,
          "priority":1
        })
      }
      var requestObject
    
      if(this.repa.DIAG?.RepairType=="WUMS")
      {
        requestObject = {
        
          "wholeUnitPartsOnly":showOnluWholeUsit,
          "repairType":this.repa.DIAG?.RepairType,
          "devices":[{"id":this.repa?.SerialNo1}],
          "coverageOption":this.repa.DIAG?.RepairType=="WUMS" ?this.repa.DIAG?.BillingOption:null,
          "componentIssues":this.repa.DIAG?.RepairType=="WUMS" ?SelectedComponentIssue:null
      }
      }
      else
      {
        requestObject = {
          "repairType":this.repa.DIAG?.RepairType,
          "devices":[{"id":this.repa?.SerialNo1}],
        }
    
      }
    
      var strData = JSON.stringify(requestObject);
      var data = {
        "Content":strData
      };
  
      this.gsxService.getPartsSummary(data).subscribe({
        next: (value) => {
          
          this.ngxservice.hide()
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
             ;
            var errorMessage = "";
            for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
            {
                errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
                this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
            }
  
          }
          else
          {   
            console.log(response,"response")
            response.forEach( item => {
              let partList = Array.isArray ( this.repa.REPAIR.REPAIRLIST.REPAIRDETAIL)? this.repa.REPAIR.REPAIRLIST.REPAIRDETAIL: [this.repa.REPAIR.REPAIRLIST.REPAIRDETAIL]
              partList.forEach( part =>{
                if ( part.PartCode == item.number ){
                  console.log( "Part Labor ", item)
                }
              })
            })

          }
          
        },
        error:(err) => {
          console.log(err);
          this.toast.error("Please try again. "+ err)
          this.ngxservice.hide()
  
        }
      });
    }

  
  }

