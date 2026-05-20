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

@Component({
  selector: 'app-gst-group',
  templateUrl: './gst-group.component.html',
  styleUrls: ['./gst-group.component.sass']
})
export class GstGroupComponent implements OnInit {

  filterList: Filter[] = [];
  gstGroupCode: String = '';
  hsnsacCode: String = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"GSTGroupCode",title:"GST Group Code"},
    {datatype:"STRING",field:"Description",title:"Description"},
    {datatype:"STRING",field:"HSNSACCode",title:"HSNSAC Code"},
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
    this.GetGSTGroupList('', ''); 
  }

  search() {
    this.GetGSTGroupList(this.gstGroupCode, this.hsnsacCode);
  }

  GetGSTGroupList(gstgroupcode, hsnsaccode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetGSTGroupList"
    });
    requestData.push({
      "Key": "GSTGroupCode",
      "Value": gstgroupcode
    });
    requestData.push({
      "Key": "HSNSACCode",
      "Value": hsnsaccode
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
              if(Array.isArray(data?.GSTGroupList?.GSTGroup))
              {
                results = data?.GSTGroupList?.GSTGroup
              }
              else
              {
                results.push(data?.GSTGroupList?.GSTGroup)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-gst-group']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-gst-group'], { queryParams: { nc:event.row.GSTGroupCode } })
    }
  }

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetGSTGroupList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.GSTGroupList?.GSTGroup });
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
