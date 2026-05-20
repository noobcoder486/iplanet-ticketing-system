import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'ng2-smart-table';

import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { Columns } from 'src/app/models/column.metadata';
import * as glob from "src/app/config/global"
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-company-master', 
  templateUrl: './company-master.component.html',
  styleUrls: ['./company-master.component.sass']
})
export class CompanyMasterComponent implements OnInit {

  filterList: Filter[] = [];
  companyaddress: string = '';
  companyCode: string = '';
  companyName: string = '';
  city: string = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"CompanyCode",title:"Company Code"},
    {datatype:"STRING",field:"CompanyName",title:"Company Name"},
    {datatype:"STRING",field:"CompanyAddress",title:"Company Address"},
    {datatype:"STRING",field:"City",title:"City"},
    {datatype:"STRING",field:"Phone",title:"Phone No"},
    {datatype:"STRING",field:"EmailID",title:"Email ID"},
    {datatype:"STRING",field:"CompanyPrintName",title:"Company Print Name"},
    
  ];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm:FormGroup;
  
  screenDetail: any;
  screen:any;
  jobPagination: PaginationMetaData;

  constructor(
    private dynamicService: DynamicService,
    private route: Router,    
    private formBuilder: FormBuilder,  
    private toastr: ToastrService,
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
   }  
  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      CompanyCode: [''],
      CompanyName: [''],
      CompanyAddress : [''],
      City: ['']
    });
    this.GetCompanyList( '' , '', '','', '');    
  }

  search() {
    const formValues = this.searchForm.value
    // console.log("Form values: " , this.searchForm)
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 500);
    this.GetCompanyList( '' , formValues.CompanyCode, formValues.CompanyName, formValues.CompanyAddress, formValues.City);
  }
  
  GetCompanyList( eventDetails , companycode, companyname,companyaddress, city) {
   
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCompanyList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": companycode
    });
    requestData.push({
      "Key": "CompanyName",
      "Value": companyname
    });
    requestData.push({
      "Key": "City",
      "Value": city
    });
    requestData.push({
      "Key": "CompanyAddress",
      "Value":companyaddress
    });
    
    requestData.push({
      "Key": "PageNo",
      "Value": eventDetails.pageIndex == null || eventDetails.pageIndex == undefined?  "1" : eventDetails.pageIndex+ 1
    });
    requestData.push({
      "Key": "PageSize",
      "Value": eventDetails.pageSize == null || eventDetails.pageSize == undefined?  "10" : eventDetails.pageSize 
    });
    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before SP:- ", requestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              let results = []
              console.log("sp",data)
              if (data.Totalrecords == '0'){
                this.toastr.error("No Data Found");
                this.GetCompanyList( '' , '', '','', '');    
                return
              }
              if(Array.isArray(data?.CompanyList?.Company))
              {
                results = data?.CompanyList?.Company
              }
              else
              {
                results.push(data?.CompanyList?.Company)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
              // this.toastr.success("Company Data Found");
              console.log("Detail:- ",this.detail)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-company-master']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-company-master'], { queryParams: { companycode: event.row.CompanyCode, companyname:event.row.CompanyName } })
    }
  }

   
  // For Page Changes
  PageChange(event) {
    switch (event.eventType) {
      case "PageChange":
          const formValues = this.searchForm.value
          this.GetCompanyList(
            event.eventDetail
          ,  formValues.CompanyCode
          , formValues.CompanyName
          , formValues.CompanyAddress
          , formValues.City
          );
          setTimeout(() => { this.hideSpinnerEvent.next(); }, 500);
          break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next(); }, 500);
        break;
    }
  }
}
    
  
  
  








