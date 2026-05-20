import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'ng2-smart-table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from "src/app/config/global"
import xml2js from 'xml2js';


@Component({
  selector: 'app-salesperson-master',
  templateUrl: './salesperson-master.component.html',
  styleUrls: ['./salesperson-master.component.sass']
})
export class SalespersonMasterComponent {
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  filterList: Filter[] = [];
  EmployeeCode: String = '';
  SalesPersonName: String = '';
  LocationCode: String = '';
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"EmployeeCode",title:"Employee Code"},
    {datatype:"STRING",field:"SalesPersonName",title:"SalesPerson Name"},
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
    {datatype:"STRING",field:"Status",title:"Active | Deactive"},

  ];

  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"},
    {"code": "DELETE","icon": "delete","title": "Delete"}
  ];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm:FormGroup;
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen:any;
  params:any;
  isEdit:boolean = false;
  salespersonForm: FormGroup;
  errorMessage: String;


  constructor(
    private formBuilder: FormBuilder,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private ngxservice: NgxSpinnerService,
    private route: Router,
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
   }

  ngOnInit(): void {
    this.GET_SalesPerson_List('', '', '');  
  }
  
  search() {
    this.GET_SalesPerson_List(this.EmployeeCode, this.SalesPersonName, this.LocationCode);
  }

  GET_SalesPerson_List(employeecode, salespersonname,locationcode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetSalesPersonList"
    });
    requestData.push({
      "Key": "EmployeeCode",
      "Value": employeecode
    });
    requestData.push({
      "Key": "SalesPersonName",
      "Value": salespersonname
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": locationcode
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
              if(Array.isArray(data?.SalesPersonList?.SalesRow))
              {
                results = data?.SalesPersonList?.SalesRow
              }
              else
              {
                results.push(data?.SalesPersonList?.SalesRow)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-salesperson-master']);
  }

  actionEmit(event){
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-salesperson-master'], { queryParams: { cc: event.row.EmployeeCode } })
    }

    if(event.action == 'DELETE'){
      console.log("Roew ", event.row)

      const shouldContinue = confirm("Are you sure, you want to Delete this entry?")
      if (shouldContinue == false) 
      {
        return
      }
     this.deleteSalesperson(event.row) 
    }
  }
  

  
  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetSalesPersonList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.SalesPersonList?.SalesRow });
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

  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
  }
  deleteSalesperson(row){
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "SaveSalesPerson"
      });
      requestData.push({
        "Key": "EmployeeCode",
        "Value": row.EmployeeCode
      });
      requestData.push({
        "Key": "SalesPersonName",
        "Value": row.SalesPersonName
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": row.LocationCode
      });
      requestData.push({
        "Key":"IsDeleted",
        "Value":'1'
      })
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            console.log("Resposne ", response)
            if (response.ReturnCode == '0') {
              this.toastMessage.success("Form Submitted Successfully");
              this.GET_SalesPerson_List('', '', '');  
            }
            else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.handleError(response);
              });
            }
  
          },
          error: err => {
            if (err.includes('"message":"Cannot')) {
              // this.controlValidations()
            }
          }
        });
  }
}


