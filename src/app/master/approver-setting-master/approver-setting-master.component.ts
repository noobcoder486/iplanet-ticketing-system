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
import xml2js from 'xml2js';
import { HttpClient } from '@angular/common/http';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';


@Component({
  selector: 'app-approver-setting-master',
  templateUrl: './approver-setting-master.component.html',
  styleUrls: ['./approver-setting-master.component.sass']
})
export class ApproverSettingMasterComponent implements OnInit {

  filterList: Filter[] = [];
  ApprovalPerson: String;
  Location: String ;
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"Process",title:"Process"},
    {datatype:"STRING",field:"ApprovalLevel",title:"Approval Level"},
    {datatype:"STRING",field:"ApprovalPerson",title:"ApprovalPerson"},
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
  ];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"},
    {"code": "DELETE","icon": "delete","title": "Delete"}
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen:any;
  processDD:any=['DiscountApproval' , 'RefundApproval' , 'SalesReturnApproval']
  process: any;


  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private route: Router,    
    private ngxservice: NgxSpinnerService,
    private toaster: ToastrService,
    private http : HttpClient
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
  }

  ngOnInit(): void {
    this.GetApprovalSettingList('', '', ''); 
    this.onLocationSearch({ term: "", item: [] });
  }

  search() {
    this.GetApprovalSettingList(this.ApprovalPerson, this.Location, this.process);
  }


 
  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  GetApprovalSettingList(ApprovalPerson, locationcode, Process) {
    
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetApprovalSettingList"
    });
    requestData.push({
      "Key": "ApprovalPerson",
      "Value": ApprovalPerson == null || ApprovalPerson == undefined ? '' : ApprovalPerson
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.Location == null || this.Location  == undefined ? '' : this.Location 
    });
    requestData.push({
      "Key": "Process",
      "Value": Process == null || Process == undefined ? '' : Process
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
              console.log("da", data)
              let results = []
              if(Array.isArray(data?.ApprovalList?.ApprovalRow))
              {
                results = data?.ApprovalList?.ApprovalRow
              }
              else
              {
                results.push(data?.ApprovalList?.ApprovalRow)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-approval-setting-master']);
  }

  actionEmit(event){
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-approval-setting-master'], { queryParams: { nc:event.row.ApprovalPerson,locationcode:event.row.LocationCode } })
    }

    // DELETE FUNCTION
    if(event.action == 'DELETE'){
    return
    
    const shouldContinue = confirm("Are you sure, you want to Delete?")
    //cancel
    if (shouldContinue == false) 
    {
      return
    }
    //ok
    else
    {
      //delete
      this.ngxservice.show();
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": ""
      });
      requestData.push({
        "Key": "ApprovalPerson",
        "Value": event.row.ApprovalPerson
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": event.row.LocationCode
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
              if (response.ReturnCode == '0') 
              { 
                this.toaster.success("Deleted Successfully")
                this.GetApprovalSettingList('','', '');
              }
              else
              {
                this.toaster.warning('No User Mapping Found')
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

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetApprovalSettingList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.UserLocationList?. UserLocation });
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

  selectedFileNameApproval: string | null = null;
  async FileUploadApproval(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedFileNameApproval = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveApprovalSettingMaster');
      formData.append('Module','SaveApprovalSettingMaster');
      this.ngxservice.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            try {
                
                event.target.value = null; 

                let response = JSON.parse(JSON.stringify(value));
                console.log('Response:', response);
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  console.log('Data:', data);
                  if (response.ReturnCode == '0') {
                    this.toaster.success('Approval Setting Uploaded Successfully');
                  }
                  else {
                    console.log("Error Response: " , response)
                    let errorMessage = response.ErrorMessage;
                    this.toaster.error(errorMessage);
                     const parser = new xml2js.Parser({ strict: false, trim: true });
                     parser.parseString( errorMessage, (error, result) => {
                       const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                       console.log("Messages : " ,errorMessages)
                       errorMessages.forEach((errorMessage) => {
                         console.log("Error Message: " , error)
                         this.toaster.error(errorMessage.ERRORMESSAGE);
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                console.log(ext);
              }
          },
          error: err => {
            event.target.value = null; 
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toaster.error("Error:-  " + message);
              } else {
                this.toaster.error("Error parsing the error message.");
              }
            });
          }
      })
    }
  }

  downloadSampleFile()
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/ApprovalSettingExcelFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'ApprovalSettingExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

}
