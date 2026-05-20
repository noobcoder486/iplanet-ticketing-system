import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from "src/app/config/global"
import { ToastrService } from 'ngx-toastr';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-resource-master',
  templateUrl: './resource-master.component.html',
  styleUrls: ['./resource-master.component.sass']
})
export class ResourceMasterComponent implements OnInit {
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  filterList: Filter[] = [];
  resourceCode: String = '';
  resourceName: String = '';
  resourceType: String = '';
  productCategory: String = '';
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"ResourceCode",title:"Resource Code"},
    {datatype:"STRING",field:"ResourceName",title:"Resource Name"},
    {datatype:"STRING",field:"ResourceType",title:"Resource Type"},
    {datatype:"STRING",field:"ResourceDescription",title:"Resource Description"},
    {datatype:"STRING",field:"ProductCategory",title:"Product Category"},
  ];

  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm:FormGroup;
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen:any;
  constructor(
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private ngxservice: NgxSpinnerService,
    private route: Router,
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
   }

  ngOnInit(): void {
    this.GetResourceList('', '', '', '');  
  }
  
  search() {
    this.GetResourceList(this.resourceCode, this.resourceName, this.resourceType, this.productCategory);
  }

  GetResourceList(resourcecode, resourcename, resourcetype, productcategory) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetResourceList"
    });
    requestData.push({
      "Key": "ResourceName",
      "Value": resourcename
    });
    requestData.push({
      "Key": "ResourceCode",
      "Value": resourcecode
    });
    requestData.push({
      "Key": "ResourceType",
      "Value": resourcetype
    });
    requestData.push({
      "Key": "ProductCategory",
      "Value": productcategory
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
              if(Array.isArray(data?.ResourceList?.Resource))
              {
                results = data?.ResourceList?.Resource
              }
              else
              {
                results.push(data?.ResourceList?.Resource)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-resource-master']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-resource-master'], { queryParams: { cc: event.row.CompanyCode, nc:event.row.ResourceCode } })
    }
  }

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetResourceList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.ResourceList?.Resource });
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