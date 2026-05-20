import { Component, OnInit, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Columns } from 'src/app/models/column.metadata';
import * as glob from 'src/app/config/global'
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta' 
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import xml2js from 'xml2js';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-accessory-sales-list',
  templateUrl: './accessory-sales-list.component.html',
  styleUrls: ['./accessory-sales-list.component.css']
})
export class AccessorySalesListComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  docTypeData: any;
  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  results :any [] = []
  MobileNo:string = ''
  invoiceCode:string = ''
  InvoiceDocType: DropDownValue = DropDownValue.getBlankObject();
  Location: DropDownValue = DropDownValue.getBlankObject();
  locationcodedata:string = '';
  breadCumbList: any[];
  screenDetail: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  actionDetails: any[]=[]
  screen:any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isApproverPermission = false
  userName: string 
  selectedFileName
  selectedResetName
  errorMessage

    allowedUsers = [
    'sarathnesh@consolidated.one',
    'parthasarathys@consolidated.one',
    'lakshminarayanan.intern@consolidated.one'
  ];


  columns: Columns[] = [
    {datatype:"STRING",field:"InvoiceCode",title:"Invoice Code"},
    {datatype:"STRING",field:"InvoiceDocType",title:"Invoice DocType"},
    {datatype:"STRING",field:"InvoiceDate",title:"Invoice Date"},
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
    {datatype:"STRING",field:"RetailCustomerCode",title:"Customer Code"},
    {datatype:"STRING",field:"FirstName",title:"Customer First Name"},
    {datatype:"STRING",field:"LastName",title:"Customer Last Name"},
    {datatype:"STRING",field:"GSTRegistrationNo",title:"Customer GST RegistrationNo"},
    {datatype:"STRING",field:"MobileNo",title:"Customer MobileNo"},
    {datatype:"STRING",field:"TotalBaseAmount",title:"Total BaseAmount"},
    {datatype:"STRING",field:"TotalDiscountAmount",title:"Total DiscountAmount"},
    {datatype:"STRING",field:"TotalTaxableAmount",title:"Total TaxableAmount"},
    {datatype:"STRING",field:"TotalTaxAmount",title:"Total TaxAmount"},
    {datatype:"STRING",field:"TotalNetAmount",title:"Total NetAmount"},
    {datatype:"STRING",field:"InvoiceStatus",title:"Invoice Status"},
  ];

  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private http : HttpClient,

  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    this.jobPagination = new PaginationMetaData();
  }
  currentDate: Date = new Date();


  ngOnInit(): void {
    this.onInvoiceDocTypeSearch({ term: "", item: [] });
    this.onLocationSearch({ term: "", item: [] });
    this.GetAccessorySalesList('','','')
    this.userName = glob.getLogedInUser().UserDetails.UserName.toString();
    this.userName = this.userName.toLowerCase()
    this.checkLocalPermission()
  }

   checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    
    if ( this.allowedUsers.includes(this.userName) ){
      this.actionDetails =[
        {"code": "EDIT","icon": "edit","title": "Edit"},
        {"code": "DELETE","icon": "delete","title": "Delete Invoice"},
        {"code": "UPDATE","icon": "update","title": "Change Payment/s"}
      ];
    }
    else if ( !this.allowedUsers.includes(this.userName) && this.isApproverPermission == true) {
      this.actionDetails =[
        {"code": "EDIT","icon": "edit","title": "Edit"},
        {"code": "UPDATE","icon": "update","title": "Change Payment/s"}
      ]
    }
    else if (this.isApproverPermission == false){
      this.actionDetails =[
        {"code": "EDIT","icon": "edit","title": "Edit"},
      ];
    }

    return resp != undefined && resp?.View ? true : false;
  }


  // checkLocalPermission() {
  //   let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
  //   console.log("Permissions ", allPermision)
  //   let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
  //   console.log("Data Local Approver Permissions ", resp)
    
  //   if(resp?.View == true){
  //     this.isApproverPermission = true;
  //   }
  //   
  //   if ( this.userName == 'sarathnesh@consolidated.one' ){
  //     this.actionDetails =[
  //       {"code": "EDIT","icon": "edit","title": "Edit"},
  //       {"code": "DELETE","icon": "delete","title": "Delete Invoice"},
  //       {"code": "UPDATE","icon": "update","title": "Change Payment/s"}
  //     ];
  //   }
  //   else if ( this.userName != 'sarathnesh@consolidated.one' && this.isApproverPermission == true) {
  //     this.actionDetails =[
  //       {"code": "EDIT","icon": "edit","title": "Edit"},
  //       {"code": "UPDATE","icon": "update","title": "Change Payment/s"}
  //     ]
  //   }
  //   else if (this.isApproverPermission == false){
  //     this.actionDetails =[
  //       {"code": "EDIT","icon": "edit","title": "Edit"},
  //     ];
  //   }

  //   return resp != undefined && resp?.View ? true : false;
  // }  

  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/accessory-sales'], { queryParams: { headerguid: event.row.InvoiceGuid,doctype:event.row.InvoiceDocType,customercode:event.row.RetailCustomerCode,locationcode:event.row.LocationCode} })
    }
    if(event.action == 'DELETE'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/cancel-invoice'], { queryParams: { headerguid: event.row.InvoiceGuid,doctype:event.row.InvoiceDocType,customercode:event.row.RetailCustomerCode,locationcode:event.row.LocationCode} })
    }
    if(event.action == 'UPDATE'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/invoice-payment-change'], { queryParams: { headerguid: event.row.InvoiceGuid,doctype:event.row.InvoiceDocType,customercode:event.row.RetailCustomerCode,locationcode:event.row.LocationCode} })
    }
  }

  GetAccessorySalesList(mobileNo,locationcode,invoicecode) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetAccessorySalesList"
    });
    requestData.push({
      "Key": "DocumentType",
      "Value": this.docTypeData == null || this.docTypeData == undefined ? '':this.docTypeData
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": mobileNo == null || mobileNo == undefined?'':mobileNo
    });
    requestData.push({
      "Key": "InvoiceCode",
      "Value": invoicecode == null || invoicecode == undefined?'':invoicecode
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": locationcode == null || locationcode == undefined?'':locationcode
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
          this.ngxservice.hide()
          this.results = []
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              this.toast.success("Records Found")
              let data = JSON.parse(response?.ExtraData);
              let results = []
              if(Array.isArray(data?.AccessorySalesList?.AccessorySalesRow))
              {
                results = data?.AccessorySalesList?.AccessorySalesRow
                console.log(results)
              }
              else
              {
                results.push(data?.AccessorySalesList?.AccessorySalesRow)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
          this.toast.error(err)
          this.ngxservice.hide()
        }
      }
    );
  }

  loadPageData(event){
     
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];
        requestData.push({
          "Key":"APIType",
          "Value": "GetAccessorySalesList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.AccessorySalesList?.AccessorySalesRow });
                }
              }catch(ext){
                console.log(ext);
                this.toast.error(ext)
              }
            },
            error : err =>
            {
              console.log(err);
              this.toast.error(err)
            }
          }
        );
        break;
    }  
    setTimeout(()=>{  this.hideSpinnerEvent.next(); }, 1);
  }

  redirectToSalesPage(item)
  {
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/accessory-sales'], { queryParams: { customercode: item?.RetailCustomerCode, locationcode:item?.LocationCode, doctype:item.InvoiceDocType, headerguid:item?.InvoiceGuid,caseguid:item?.CaseGuid} })
  }

  onInvoiceDocTypeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.InvoiceDocType, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {

          this.InvoiceDocType = value;
        }
      },
      error: (err) => {
        this.InvoiceDocType = DropDownValue.getBlankObject();
      }
    });
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Location = value;
        }
      },
      error: (err) => {
        this.Location = DropDownValue.getBlankObject();
      }
    });
  }

  
  selectFile() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  selectResetFile() {
    const fileInput = document.getElementById('resetName') as HTMLInputElement;
    fileInput.click();
  }
  
  async Reset_SAPPosting4Invoice(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedResetName = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'ResetSAPPosting4Invoice');
      formData.append('Module','ResetSAPPosting4Invoice');
      this.errorMessage = "";
      this.ngxservice.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            try {
                
                this.ngxservice.hide();  
                event.target.value = null; 
                let response = JSON.parse(JSON.stringify(value));
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  if (response.ReturnCode == '0') {
                    this.toast.success('Reset Successful!');
                  }
                  else {
                    console.log("Error Response: " , response)
                    let errorMessage = response.ErrorMessage;
                    this.toast.error(errorMessage);
                     const parser = new xml2js.Parser({ strict: false, trim: true });
                     parser.parseString( errorMessage, (error, result) => {
                       const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                       console.log("Messages : " ,errorMessages)
                       errorMessages.forEach((errorMessage) => {
                         console.log("Error Message: " , error)
                         this.toast.error(errorMessage.ERRORMESSAGE);
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                this.ngxservice.hide();  
                console.log(ext);
              }
          },
          error: err => {
            
            this.ngxservice.hide()
            event.target.value = null; 
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toast.error("Error:-  " + message);
              } else {
                this.toast.error("Error parsing the error message.");
              }
            });
          }
      })
    }
  }

  async FileUploadInvoicePGI(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveInvoicePGIBulk');
      formData.append('Module','SaveInvoicePGIBulk');
      this.errorMessage = "";
      this.ngxservice.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            try {
                
                this.ngxservice.hide();  
                event.target.value = null; 
                let response = JSON.parse(JSON.stringify(value));
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  if (response.ReturnCode == '0') {
                    this.toast.success('Invoice PGI Uploaded Successfully');
                  }
                  else {
                    console.log("Error Response: " , response)
                    let errorMessage = response.ErrorMessage;
                    this.toast.error(errorMessage);
                     const parser = new xml2js.Parser({ strict: false, trim: true });
                     parser.parseString( errorMessage, (error, result) => {
                       const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                       console.log("Messages : " ,errorMessages)
                       errorMessages.forEach((errorMessage) => {
                         console.log("Error Message: " , error)
                         this.toast.error(errorMessage.ERRORMESSAGE);
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                this.ngxservice.hide();  
                console.log(ext);
              }
          },
          error: err => {
            
            this.ngxservice.hide()
            event.target.value = null; 
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toast.error("Error:-  " + message);
              } else {
                this.toast.error("Error parsing the error message.");
              }
            });
          }
      })
    }
  }

  downloadSampleFile()
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/InvoicePGISampleFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'LeadManagementExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  hidePopUp = true
  RestrictionList : any[] =[]
  onSubmit() {

    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveRestriction"
    }),
    requestData.push({
      "Key": "Data",
      "Value": this.saveRestrictionXml()
    })


    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        let response = JSON.parse(value.toString());
        if (response.ReturnCode === '0') {
          this.toast.success("Success");
          this.hidePopUp = true;
        }
        else {
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            if (err) {
              console.error("Error parsing XML:", err);
            } else {
              response['errorMessageJson'] = result;
              this.handleError(response);
            }
          });
        }
      },
      error: (err) => {
        console.error("HTTP Error:", err);
        this.toast.error("There was an error submitting the form.");
      }
    });
  }


  saveRestrictionXml() {
    let rawData = {
      "rows": []
    };

    for (let item of this.RestrictionList) {
      rawData.rows.push({
        "row": {
          "RestrictionType": item.RestrictionType,
          "RestrictionName": item.RestrictionName,
          "RestrictionFlag": item.RestrictionFlag
        }
      });
    }

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Part XML:- ", xml);
    return xml;
  }  

  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetRestrictionObject"
    }),
    requestData.push({
      "Key": "RestrictionType",
      "Value": "INVOICE"
    })       
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("res",response)
          if (response.ReturnCode === '0') {
            let data = JSON.parse(response.ExtraData)?.RestrictionMaster;
            
            this.RestrictionList=[];
            Array.isArray(data.RestrictionMaster) ? this.RestrictionList = data.RestrictionMaster : this.RestrictionList =[data.RestrictionMaster]
            this.RestrictionList.forEach( item => item.RestrictionFlag == "1" ? item.RestrictionFlag = true : item.RestrictionFlag = false)
            console.log('restriction', this.RestrictionList)
          } else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  public newslide(event: any): void {
    if (event.checked) {
      console.log('true')
    } else {
      console.log('false')
    }
  }

  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
    error.forEach(err => {
      this.toast.error("Error:- ", err)
    })
  }
 


}
