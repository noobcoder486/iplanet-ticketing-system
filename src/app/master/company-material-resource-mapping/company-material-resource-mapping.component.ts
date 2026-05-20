import { Component, OnInit,Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { Columns } from 'src/app/models/column.metadata';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from "src/app/config/global"
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/internal/Observable';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-material-resource-mapping',
  templateUrl: './company-material-resource-mapping.component.html',
  styleUrls: ['./company-material-resource-mapping.component.sass']
})
export class CompanyMaterialResourceMapping implements OnInit {

  filterList: Filter[] = [];
  itemCode: string = '';
  gstGroupCode: string = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;

  columns: Columns[] = [
    { datatype: "STRING", field: "ItemType", title: "Item Type" },
    { datatype: "STRING", field: "ItemCode", title: "Item Code" },
    { datatype: "STRING", field: "TAXType", title: "Tax Type" },
    { datatype: "STRING", field: "GSTGroupCode", title: "GST Group Code" },
    { datatype: "STRING", field: "UnitPrice", title: "Unit Price" },
    { datatype: "STRING", field: "LocalCurrencyCode", title: "Local Currency Code" },
  ];
  
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" },
    { "code": "DELETE", "icon": "delete", "title": "Delete Mapping" }

  ];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen: any;

  constructor(
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private route: Router,
    private toast: ToastrService
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.getCompanyMappingList('', '');
  }


  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-company-mapping']);
  }

  actionEmit(event) {
    if (event.action == 'EDIT') {
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-company-mapping'], { queryParams: { cc: event.row.CompanyCode, nc: event.row.ItemCode } })
    }
    // DELETE FUNCTION
    if(event.action == 'DELETE'){
    const shouldContinue = confirm("Are you sure, you want to Delete?")
    if (shouldContinue == false) 
    {
      return
    }
    else
    {
      //delete
      this.ngxservice.show();
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "DeleteCompanyMaterialResource"
      });
      requestData.push({
        "Key": "ItemCode",
        "Value": event.row.ItemCode
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "ItemType",
        "Value": event.row.ItemType
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
              if (response.ReturnCode == '0') 
              { 
                this.toast.success("Deleted Successfully")
                this.getCompanyMappingList('','');
              }
              else
              {
                this.toast.warning('No  Mapping Found')
              }            
              this.ngxservice.hide()
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
    }
  }

  search() {
    this.getCompanyMappingList(this.itemCode, this.gstGroupCode);
  }

  getCompanyMappingList(itemcode, gstgroupcode) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCompanyMappingList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "ItemCode",
      "Value": itemcode
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
              if(Array.isArray(data?.CompanyMappingList?.CompanyMapping))
              {
                results = data?.CompanyMappingList?.CompanyMapping
              }
              else
              {
                results.push(data?.CompanyMappingList?.CompanyMapping)
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

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];

        requestData.push({
          "Key": "APIType",
          "Value": "GetCompanyMappingList"
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        });
        requestData.push({
          "Key": "PageNo",
          "Value": event.eventDetail.pageIndex + 1
        });
        requestData.push({
          "Key": "PageSize",
          "Value": event.eventDetail.pageSize
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.CompanyMappingList?.CompanyMapping });
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
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }

}
