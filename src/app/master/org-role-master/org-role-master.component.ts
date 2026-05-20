import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {  ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import * as glob from "src/app/config/global"
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';

@Component({
  selector: 'app-org-role-master',
  templateUrl: './org-role-master.component.html',
  styleUrls: ['./org-role-master.component.sass']
})
export class OrgRoleMasterComponent implements OnInit {


  breadCumbList: any[];
  toolBarAction: any[] = [];

  // Search for Org Role Master
  orgRoleName: string ='';
  orgRoleDescription: string ='';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // Grid for Org Role Master
  columns: Columns[] = [
    { datatype: "STRING", field: "OrgRoleId", title: "Org Role Id" },
    { datatype: "STRING", field: "OrgRoleName", title: "Org Role Name" },
    { datatype: "STRING", field: "OrgRoleDescription", title: "Org Role Description" },
  ];
  isChoose: boolean = false;
  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];
  params: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);


  // pagination
  pagination: PaginationMetaData
  jobPagination: PaginationMetaData

  constructor(
    private formBuilder: FormBuilder,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private route: Router,
    private toaster: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { 
    this.pagination = new PaginationMetaData();
    this.activatedRoute.data.subscribe((data: any) => {
      this.jobPagination = new PaginationMetaData();
      this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    })
  }

  ngOnInit(): void {
     this.searchForm = this.formBuilder.group({
      orgRoleName: [''],
      orgRoleDescription: ['']
     })

     this.GetOrgRoleList('','')

  }

  // Add Button Part:- 
  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add(){
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-org-role-master']);
  }
 

  GetOrgRoleList(orgrolename, orgroledescription){
    this.ngxservice.show();

    let requestData = [];
    requestData.push({
      "Key" : "ApiType",
      "Value": "GetOrgRoleMasterList"
    })
    requestData.push({
      "Key" : "OrgRoleName",
      "Value": orgrolename
    })
    requestData.push({
      "Key" : "OrgRoleDescription",
      "Value": orgroledescription
    })
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    })
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    })

    let requestDataJSON = JSON.stringify(requestData)
    let contentRequestData = {
      "content" : requestDataJSON
    } 
    this.dynamicService.getDynamicDetaildata(contentRequestData).subscribe(
      {
        next: (value) =>{
          try{
            console.log("After Get List SP:-", value);

            let OrgRoleData = JSON.parse(value.toString());

            if( OrgRoleData?.ReturnCode == '0'){
                let OrgRoleExtraData  = JSON.parse(OrgRoleData?.ExtraData)

                // When Data Found
                if (OrgRoleExtraData?.Totalrecords !== '0'){
                  let results = [];
                  if (Array.isArray(OrgRoleExtraData?.OrgRoleMasterList?.OrgRoleMasterRow)){
                    results = OrgRoleExtraData?.OrgRoleMasterList?.OrgRoleMasterRow
                  }
                  else{
                    results.push(OrgRoleExtraData?.OrgRoleMasterList?.OrgRoleMasterRow)
                  }
                  this.detail.next( { totalRecord: OrgRoleExtraData?.Totalrecords, Data: results  } )
                  this.ngxservice.hide();
                }
                else{
                  this.toaster.error("No such Data found");
                  this.GetOrgRoleList('','')
                }
            }
            else{
              console.log("Org role error:- ")
            }
          }
          catch(e){
            console.log(e)
          }
        },
        error: err =>{
          console.log(err)
        }
      }
    )
  }

  actionEmit(event){
    console.log("Event when clicking Edit:- ",event);
    if(event.action === 'EDIT'){
      this.route.navigate(['/auth/'+ glob.getCompanyCode() + '/add-org-role-master'], {queryParams: { orid: event.row.OrgRoleId}})
    }
  }


  loadPageData(event) {
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetOrgRoleMasterList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.OrgRoleMasterList?.OrgRoleMasterRow });
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

  // Search for Org Role Master
  search(){
    console.log("Form fields for search:-", this.searchForm);
    this.GetOrgRoleList(this.orgRoleName, this.orgRoleDescription)
  }
  
}
