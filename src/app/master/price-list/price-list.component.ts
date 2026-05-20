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
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';



@Component({
  selector: 'app-Price-list',
  templateUrl: './Price-list.component.html',
  styleUrls: ['./Price-list.component.css']
})
export class PriceListComponent implements OnInit {


  filterList: Filter[] = [];
  companyCode: string = '';
  LocationPriceGroup: string = '';
  MaterialPriceGroup: string = '';
  PricingOption: string = '';
  pricingOption: string = '';
  productCategory: string = '';
  effectiveDate: Date | null = null;  
  priceRangeApplicable: string = '';
  priceRangeStart: string = '';
  priceRangeEnd: string = '';
  MarginType: string = '';
  margin: number = 0;  
  unitPrice: number = 0;  
  searchForm: FormGroup;

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;
  columns: Columns[] = [
    
      
      // {datatype:"STRING",field:"CompanyCode",title:"Company Code"},
      // {datatype:"STRING",field:"LocationPriceGroup",title:"Location Price Group"},
      {datatype:"STRING",field:"MaterialPriceGroup",title:"Material Code"},
      // {datatype:"STRING",field:"CustomerPriceGroup",title:"Customer Price Group"},
      {datatype:"STRING",field:"PricingOption",title:"Pricing Option"},
      // {datatype:"STRING",field:"ProductCategory",title:"Product Category"},
      {datatype:"DATE",field:"EffectiveDate",title:"Effective Date"},
      // {datatype:"STRING",field:"PriceRangeApplicable",title:"Price Range Applicable"},
      // {datatype:"STRING",field:"PriceRangeStart",title:"Price Range Start"},
      // {datatype:"STRING",field:"PriceRangeEnd",title:"Price Range End"},
      // {datatype:"STRING",field:"MarginType",title:"Margin Type"},
      {datatype:"NUMBER",field:"Margin",title:"Margin"},
      {datatype:"NUMBER",field:"UnitPrice",title:"Unit Price"},
      { datatype: "STRING", field: "CostPrice", title: "Cost Price" },
      { datatype: "STRING", field: "PriceRangeApplicable", title: "PriceRangeApplicable" },
      { datatype: "STRING", field: "PriceRangeStart", title: "PriceRangeStart" },
      { datatype: "STRING", field: "PriceRangeEnd", title: "PriceRangeEnd" },
    ]
    
  
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"},
    {"code": "DELETE","icon": "delete","title": "Delete"},

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
    private dropdownDataService: DropdownDataService,
    private toaster: ToastrService ,
    private ngxservice: NgxSpinnerService,
    private http : HttpClient
  ) { 
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({code:"ADD", icon:"add_circle_outline",title:"Add"});
    
    
  }
  LocationPriceGroupDropDown: DropDownValue = this.getBlankObject();
  PricingOptionDD: DropDownValue = this.getBlankObject();
  MarginTypeDropDown: DropDownValue = this.getBlankObject();

  
  ngOnInit(): void {
    this.GetPriceList();   
    
    this.onlocationPriceGroup({ term: "", items: [] });
    this.onPricingOption({ term: "", items: [] });
    // this.onMarginType({ term: "", items: [] });
  }

  search() {
    this.GetPriceList();
  }

  GetPriceList() {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetPriceListDetails"
    });  
    requestData.push({
       "Key": "CompanyCode", 
       "Value": glob.getCompanyCode()
       });
    requestData.push({
       "Key": "PricingOption",
        "Value": this.pricingOption==null || this.pricingOption==undefined ?'':this.pricingOption 
       });
    requestData.push({ 
      "Key": "MaterialPriceGroup", 
      "Value": this.MaterialPriceGroup==null || this.MaterialPriceGroup==undefined ?'':this.MaterialPriceGroup 
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
              if(Array.isArray(data?.PriceList?.Price))
              {
                results = data?.PriceList?.Price
              }
              else
              {
                results.push(data?.PriceList?.Price)
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
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-price-list']);
  }

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-price-list'], { queryParams: {  nc:event.row.PriceListGUID } })
    }
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
          "Value": "DeleteTransaction"
        });
        requestData.push({
          "Key": "TransactionGUID",
          "Value": event.row.PriceListGUID
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        });
        requestData.push({
          "Key": "TransactionType",
          "Value": 'PriceListDetails'
        });
        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        
        // return
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') 
                { 
                  this.toaster.success("Deleted Successfully")
                  this.GetPriceList();
                }
                else
                {
                  this.toaster.warning('No such Entry Found')
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
          "Value": "GetPriceListDetails"
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
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  let results = []
                  if(Array.isArray(data?.PriceList?.Price))
                  {
                    results = data?.PriceList?.Price
                  }
                  else
                  {
                    results.push(data?.PriceList?.Price)
                  }
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
                  this.ngxservice.hide()
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

  selectedFileNamePriceList: string | null = null;
  selectedFileNameCompany: string | null = null;
  selectedFileNamePriceOption: string | null = null;

  async FileUploadMaterial(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedFileNamePriceList = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SavePriceListDetailsBulk');
      formData.append('Module','SavePriceListDetailsBulk');
      // formData.append('ApiType', 'SaveCompanyMaterialResourceMappingBulk');
      // formData.append('Module','SaveCompanyMaterialResourceMappingBulk');
      // formData.append('ApiType', 'SavePriceListDetailsBulk');
      // formData.append('Module','SavePriceListDetailsBulk');
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
                    this.toaster.success('price-list Uploaded Successfully');
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
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/MaterialMasterExcelFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'PriceListExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onSubmit() {
 
  

  }

  onPricingOption($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.PriceGroup, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.PricingOptionDD = value;
          }
        },
        error: (err) => {
          this.PricingOptionDD = this.getBlankObject();
        },
      });
  }
  // onMarginType($event: { term: ""; items: [] }) {
  //   this.dropdownDataService
  //     .fetchDropDownData(DropDownType.MarginType, $event.term)
  //     .subscribe({
  //       next: (value) => {
  //         if (value != null) {
  //           this.MarginTypeDropDown = value;
  //         }
  //       },
  //       error: (err) => {
  //         this.MarginTypeDropDown = this.getBlankObject();
  //       },
  //     });
  // }
 

  onlocationPriceGroup($event: { term: ""; items: [] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.LocationPriceGroup, $event.term)
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.LocationPriceGroupDropDown = value;
          }
        },
        error: (err) => {
          this.LocationPriceGroupDropDown = this.getBlankObject();
        },
      });
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}

