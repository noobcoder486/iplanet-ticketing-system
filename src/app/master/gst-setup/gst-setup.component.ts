import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from "src/app/config/global";
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-gst-setup',
  templateUrl: './gst-setup.component.html',
  styleUrls: ['./gst-setup.component.sass']
})
export class GstSetupComponent implements OnInit {

  filterList: Filter[] = [];
  gstComponentCode: String = '';
  gstGroupCode: String = '';
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"GSTGUID",title:"GST GUID"},
    {datatype:"STRING",field:"GSTComponentCode",title:"GST Component Code"},
    {datatype:"STRING",field:"GSTGroupCode",title:"GST Group Code"},
    {datatype:"STRING",field:"CountryCode",title:"Country Code"},
    {datatype:"STRING",field:"GSTStateCode",title:"GST State Code"},
    {datatype:"STRING",field:"GSTJuridictionCode",title:"GST Juridiction Code"},
    {datatype:"STRING",field:"EffectiveDate",title:"Effective Date"},
    {datatype:"STRING",field:"CalculationOrder",title:"Calculation Order"},
    {datatype:"STRING",field:"GSTPercentage",title:"GST Percentage"},
    
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
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
   }

  ngOnInit(): void {
    this.GetGSTSetupList('', ''); 
  }

  search() {
    this.GetGSTSetupList(this.gstComponentCode, this.gstGroupCode);
  }

  GetGSTSetupList(gstcomponentcode, gstgroupcode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetGSTSetupList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "GSTComponentCode",
      "Value": gstcomponentcode
    });
    requestData.push({
      "Key": "GSTGroupCode",
      "Value": gstgroupcode
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
              if(Array.isArray(data?.GSTSetupList?.GSTSetup))
              {
                results = data?.GSTSetupList?.GSTSetup
              }
              else
              {
                results.push(data?.GSTSetupList?.GSTSetup)
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

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add(){
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-gst-setup']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-gst-setup'], { queryParams: { cc: event.row.CompanyCode, nc:event.row.GSTGUID } })
    }
  }

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetGSTSetupList"
        });
        requestData.push({
          "Key":"CompanyCode",
          "Value": glob.getCompanyCode()
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.GSTSetupList?.GSTSetup });
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

}
