import { Component, OnInit,Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-material-master',
  templateUrl: './material-master.component.html',
  styleUrls: ['./material-master.component.css']
})
export class MaterialMasterComponent implements OnInit {

  filterList: Filter[] = [];
  erpMaterialCode: string = '';
  materialCode: string = '';
  materialName: string = '';
  eeeCode: string = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    {datatype:"STRING",field:"MaterialCode",title:"Material Code"},
    {datatype:"STRING",field:"MaterialName",title:"Material Name"},
    {datatype:"STRING",field:"MaterialDescription",title:"Material Description"},
    {datatype:"STRING",field:"PartType",title:"Part Type"},
    {datatype:"STRING",field:"LaborTier",title:"Labor Tier"},
    {datatype:"STRING",field:"EEECode",title:"EEE Code"},
    {datatype:"STRING",field:"ComponentGroup",title:"Component Group "},
    {datatype:"STRING",field:"SubstitutePart",title:"Substitute Part"},
    {datatype:"STRING",field:"SerializedModule",title:"Serialized Module"},
    {datatype:"STRING",field:"ERPMaterialCode",title:"ERPMaterial Code"},
    {datatype:"STRING", field:"PriceGroup", title:"Price Group"},
    {datatype:"STRING", field:"isDisabled", title:"Is Disabled"},

    {datatype:"STRING", field:"MatGroup1Desc", title:"Material Group 1"},
    {datatype:"STRING", field:"MatGroup2Desc", title:"Material Group 2"},
    {datatype:"STRING", field:"MatGroup3Desc", title:"Material Group 3"},
    {datatype:"STRING", field:"MatGroup4Desc", title:"Material Group 4"},
    {datatype:"STRING", field:"BrandDesc", title:"Brand"},
    {datatype:"STRING", field:"MaterialCategoryDesc", title:"Material Category"},
    
     {datatype:"STRING", field:"PriceSource", title:"Price Source"},
    {datatype:"STRING", field:"IsMarginPriceApplicable", title:"IsMarginPriceApplicable"},




  ];
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"},
    {"code": "PRICE","icon": "price","title": "Price Finder"}

  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm:FormGroup;
  jobPagination: PaginationMetaData;
  screenDetail: any;
  screen:any;
  errorMessage: string = '';

  constructor(
    private dynamicService: DynamicService,
    private route: Router,   
    private toaster: ToastrService ,
    private ngxservice: NgxSpinnerService,
    private http : HttpClient,
    private datePipe: DatePipe,
    private reportService: ReportService,
  ) { 
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add Single Material"});
    
  }

  ngOnInit(): void {
    this.GetMaterialList('', '', '', '');    
  }

  search() {
    this.GetMaterialList(this.materialCode, this.materialName, this.eeeCode, this.erpMaterialCode);
  }

  GetMaterialList(materialcode, materialname, eeecode, erpmaterialcode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetMaterialList"
    });
    requestData.push({
      "Key": "MaterialName",
      "Value": materialname
    });
    requestData.push({
      "Key": "MateriaLCode",
      "Value": materialcode
    });
    requestData.push({
      "Key": "EEECode",
      "Value": eeecode
    });
    requestData.push({
      "Key": "ERPMaterialCode",
      "Value": erpmaterialcode
    });
    
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    });
    for (let filter of this.filterList ?? []) {
      requestData.push({
        "Key": filter.type,
        "Value": filter.value
      });
    }
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
              if(Array.isArray(data?.MaterialList?.Material))
              {
                results = data?.MaterialList?.Material
              }
              else
              {
                results.push(data?.MaterialList?.Material)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-material-master']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-material-master'], { queryParams: { cc: event.row.CompanyCode, nc:event.row.MaterialCode } })
    }
    if(event.action == 'PRICE'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/material-price-details'], { queryParams: { cc: event.row.CompanyCode, nc:event.row.MaterialCode } })
    }
  }

  loadPageData(event){
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];

        requestData.push({
          "Key":"APIType",
          "Value": "GetMaterialList"
        });
        requestData.push({
          "Key":"CompanyCode",
          "Value": "NITC"
        });
        requestData.push({
          "Key": "MaterialName",
          "Value": this.materialName
        });
        requestData.push({
          "Key": "MateriaLCode",
          "Value": this.materialCode
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.MaterialList?.Material });
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

  selectedFileNameMaterial: string | null = null;

  async FileUploadMaterial(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedFileNameMaterial = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveMaterialMasterBulk');
      formData.append('Module','SaveMaterialMasterBulk');
      this.errorMessage = "";
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
                    this.toaster.success('Material/s Uploaded Successfully');
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


  downloadSampleFile(type)
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/' + type + '.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = type + '.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  selectFile(type) {
    if ( type == 'UpdateMaterialExcelFormat'){
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      fileInput.click();
    }
    else{
      const NewMaterial = document.getElementById('NewMaterial') as HTMLInputElement;
      NewMaterial.click();
    }

  }

  onSubmit() {
 
  }
  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
    var validationErrorMessage = errror[0]
    console.log(validationErrorMessage)
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
          "Value":"ExportMaterialList"
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
                const fileName = `Material_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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
    // }
    // else
    // {
    //   this.toaster.error("Please Select Start and End Date")
    // }
  
  }

  selectedUpdateMaterial : string | null = null;
  async UpdateMaterialBulk(event: any) {
    
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedUpdateMaterial = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'UpdateMaterialBulk');
      formData.append('Module','UpdateMaterialBulk');
      this.errorMessage = "";
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
                    this.toaster.success('Material/s Updated Successfully');
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



}
