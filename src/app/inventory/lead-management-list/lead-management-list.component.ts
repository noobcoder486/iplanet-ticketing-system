import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { HttpClient } from '@angular/common/http';
import { Columns } from 'src/app/models/column.metadata';

@Component({
  selector: 'app-lead-management-list',
  templateUrl: './lead-management-list.component.html',
  styleUrls: ['./lead-management-list.component.css']
})
export class LeadManagementListComponent implements OnInit {

 
  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  IncomingInvStatusDD: DropDownValue = DropDownValue.getBlankObject();

  EmailId: string;
  MobileNo: string;
  UniqueId
  LocationCode: string;
  SAPGrnCode: string;
  breadCumbList: any[];
  toolBarAction: any[] = [];
  StatusDD:string[]= ['OPEN', 'FOLLOW-UP', 'CLOSED']
  LeadStatus: string 
  InvoiceStatus: string;
  Ship_to_GSX: string;
  selectedCallForm:string;
  LeadManagementList: any[]= [];
  LeadsList: any[]= [];
  errorMessage: string;
  isApproverPermission = false
  submitClicked= false 

  //Incoming Invoice
  
  Remark: string
  StartDate:any;
  EndDate:any;
  StartTime
  EndTime
  IsSerialNoExists : boolean = true
  selectedFileName: string | null = null;
  maxDate : Date
  ExportStartDate:any;
  ExportEndDate:any;
  // Toggle Page Number 
  pageSize : number = 10; 
  pageIndex = 0 
  pageCount: number; 
  ErrorList: any[] = [];
  UpdatedpageSize: number=10;
  Spinner = false
  TotalRecords: number = 0
  currentRange
  gridDetailColumns: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  columns: Columns[] =
    [
      { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
      { datatype: "STRING", field: "UniqueId", title: "Lead UniqueId" },
      { datatype: "STRING", field: "CallDate", title: "Call Date" },
      { datatype: "STRING", field: "CreatedDate", title: "Created Date" },
      { datatype: "STRING", field: "LocationCode", title: "Location Code" },
      { datatype: "STRING", field: "LeadStatus", title: "Lead Status" },
      { datatype: "STRING", field: "ParentDetails", title: "Parent Details" },
      { datatype: "STRING", field: "CallType", title: "Call Type" },
      { datatype: "STRING", field: "CallCategory", title: "Call Category" },
      { datatype: "STRING", field: "CustomerName", title: "Customer Name" },
      { datatype: "STRING", field: "LeadDisposition", title: "Lead Disposition" },
      { datatype: "STRING", field: "Notes", title: "Notes" },
   
    ];
  


  @ViewChild('callUpdateDialog') callUpdateDialog: TemplateRef<any>;


  constructor(
    private route: Router,
    private dialog: MatDialog,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private reportService : ReportService,
    private http : HttpClient,
    private gsxService : GsxService
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    // this.onIncomingStatusSearch({ term: "", item: [] });
    this.GetLeadManagementList('')
    this.checkLocalPermission()
    this.maxDate = new Date()

  }

  options: number[] = [5, 10, 20, 50 ];
selectedOption: string;

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }
 


  actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"}
  ];

 


  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'EDIT'){
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/lead-management'], { queryParams: { leadguid: event.row.LeadManagementGUID } })
    }
  }
  PageChange( event){
    switch(event.eventType){
      case "PageChange":
        this.GetLeadManagementList(event.eventDetail )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;

      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }
 
  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  async FileUploadSAPGrn(event: any) {
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
      formData.append('ApiType', 'SaveLeadManagementBulk');
      formData.append('Module','SaveLeadManagementBulk');
      this.errorMessage = "";
      this.ngxSpinnerService.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            try {
                
                this.ngxSpinnerService.hide();  
                event.target.value = null; 
                let response = JSON.parse(JSON.stringify(value));
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  if (response.ReturnCode == '0') {
                    this.toast.success('SAP Grn Code/s Uploaded Successfully');
                    this.GetLeadManagementList('')
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
                         this.toast.error("Error:- ", errorMessage.ERRORMESSAGE,{closeButton:true,disableTimeOut:true});
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                this.ngxSpinnerService.hide();  
                console.log(ext);
              }
          },
          error: err => {
            
            this.ngxSpinnerService.hide()
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
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/LeadManagementSampleFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'LeadManagementExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }


  GetLeads(){
    if (!(this.StartDate && this.EndDate )) {
      this.toast.error("Kindly enter Start - End Date");
      return;
    }

    if (new Date(this.StartDate) > new Date(this.maxDate) || new Date(this.EndDate) > new Date(this.maxDate)) {
      this.toast.error("Start or End Date can't be greater than current Date");
      return;
    }

    const obj = {
      "StartDate": this.StartDate,
      "EndDate": this.EndDate
    };

    if(this.submitClicked == true)
    {
      return;
    }
    this.submitClicked=true
    this.Spinner = true
    this.ngxSpinnerService.show()
    this.LeadsList =[]
    this.dynamicService.GetLeads(obj).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        this.submitClicked= false 
    

        // console.log("Response from GSX ",response)
        if ( response?.code != null && response?.code != undefined){
          
          if (response.code == '0'){
            let dataArray = JSON.parse(response.message);
            console.log("dataArray ", dataArray)
            if (Array.isArray(dataArray)){
              // dataArray.forEach( lead => {
              //   if ( lead.STORETYPE == 'Service' && 
              //     (lead.CALLCATEGORY == 'General Enquiry' || lead.CALLCATEGORY == 'General Enquiry Lead')
              //   ){
              //     this.LeadsList.push(lead)
              //     console.log("lead ", lead)
              //   }
              // })
              this.LeadsList = dataArray
            }
            else{
              this.LeadsList.push(dataArray)
            }
            this.onSaveLeadManagement()
          }
          else{
            this.Spinner = false
            this.ngxSpinnerService.hide()
            this.toast.error(response.message)
          }
        }
        
      },
      error: (err) => {
        this.submitClicked= false 
        this.Spinner = false
        this.ngxSpinnerService.hide()
        console.log(err);
        this.toast.error("Please try again. " + err , "Error", { closeButton: true, disableTimeOut: true })
        this.ngxSpinnerService.hide()
      }
    });

  }

  combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }


  onSaveLeadManagement() {

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SaveLeadManagement"
    })
    requestData.push({
      "Key": "Data",
      "Value": this.GetLeadManagementXML()
    });    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    // // TODO:- 
    // alert("Return On ")
    // return
    
    this.Spinner = true
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next:(value) =>{ 
          
          this.Spinner = false
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let ExtraData = JSON.parse(response.ExtraData);
            this.toast.success("Leads saved successfully!")
            this.GetLeadManagementList('')
            // window.location.reload();
          }
          else {
            this.Spinner = false
            this.ngxSpinnerService.hide()
            console.log("Messages : " ,response)
            this.errorMessage = response.ErrorMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString( this.errorMessage , (error, result) => {
              console.log("Error Message: " , error)
              const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
              errorMessages.forEach((errorMessage) => {
                this.toast.error("Error :- ", errorMessage.ERRORMESSAGE,{closeButton:true,disableTimeOut:true});
              });
            });     
          }
      } 
      ,error:(err) => {
        console.log(err);
      }
    })


  }

  GetLeadManagementXML (){
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.LeadsList) {
        count += 1
        rawData.rows.push({
          "row": {
            "CustomerName": item.name,
            "EmailId": item.email,
            "MobileNo": item.src,
            "StoreType": item.STORETYPE,
            "LocationCode": item.STORECODE,
            "CallCategory": item.CALLCATEGORY,
            "ParentDetails": item.PARENTDETAILS,
            "CallDetails": item.CALLDETAILS,
            "Notes": item.notes,
            "CallType": item.calltype,
            "CallDate": item.calldate,
            "UniqueId": item.unique_id,
            "UserDesposition": item.user_disposition,
            "AgentNumber": item.dst
          }
        })

    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("XML is:- ", xml)
    return xml;
  }


  // exportReportData()
  // {
  //   const startformattedDate = this.datePipe.transform(this.ExportStartDate, 'yyyy-MM-dd');
  //   const endformattedDate = this.datePipe.transform(this.ExportEndDate, 'yyyy-MM-dd');
  //   // this.results = []
  //   if((this.ExportStartDate != null || this.ExportStartDate != undefined) && (this.ExportEndDate != null || this.ExportEndDate != undefined ))
  //   {
  //     {
  //       let requestData = []
  //       this.ngxSpinnerService.show();
  //       requestData.push({
  //         "Key":"APIType",
  //         "Value":"ExportLeadManagementReportList"
  //       })
  //       requestData.push({
  //         "Key":"LocationCode",
  //         "Value":this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
  //       })
        
  //       requestData.push({
  //         "Key":"StartDate",
  //         "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
  //       })
  //       requestData.push({
  //         "Key":"EndDate",
  //         "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
  //       })
  //       requestData.push({
  //         "Key": "InvoiceCode",
  //         "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? "" : this.InvoiceCode
  //       })
  //       requestData.push({
  //         "Key": "InvoiceStatus",
  //         "Value": this.InvoiceStatus == null || this.InvoiceStatus == undefined ? "" : this.InvoiceStatus
  //       })
  //       let strRequestData = JSON.stringify(requestData);
  //       let contentRequest =
  //       {
  //         "content": strRequestData
  //       };
  //       
  //       this.reportService.downloadServiceReport('UNIVERSAL',contentRequest).subscribe(
  //         {
  //           next: (Value) => {
  //             try {
  //               let response = JSON.parse(Value.toString());
  //               const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
  //               var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
  //               var url = URL.createObjectURL(blob);
  //               window.open(url);
  //               this.ngxSpinnerService.hide()

  //             } catch (ext) {
  //               console.log(ext);
  //             }
  //           },
  //           error: err => {
  //             console.log(err);
  //             this.ngxSpinnerService.hide()
  //           }
  //         }
  //       );
  //     }
  //   }
  //   else
  //   {
  //     this.toast.error("Please Select Start and End Date")
  //   }
  // }



  GetLeadManagementList(eventDetail) {
    // if (this.LocationCode== null || this.LocationCode == undefined || this.LocationCode == '' ){
    //   this.toast.error("Please select a Location");
    //   return;
    // }
    //  
    this.LeadManagementList = []
    this.Spinner = true
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetLeadManagementList"
    })
    requestdata.push({
      "Key":"LeadType",
      "Value": "LEAD"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key": "UniqueId",
      "Value": this.UniqueId == null || this.UniqueId == undefined ? '' : this.UniqueId
    });
    requestdata.push({
      "Key": "MobileNo",
      "Value": this.MobileNo == null || this.MobileNo == undefined ? '' : this.MobileNo
    });
    requestdata.push({
      "Key": "LeadStatus",
      "Value": this.LeadStatus == null || this.LeadStatus == undefined ? '' : this.LeadStatus
    });
    
    requestdata.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestdata.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.Spinner= true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          
          try {
            this.Spinner = false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.TotalRecords == "0"){
                this.toast.error("No Data Found")
                return
              }
              if( Array.isArray(data.LeadManagementList?.LeadRow) ) {
                this.LeadManagementList = data.LeadManagementList?.LeadRow;
              }
              else{
                this.LeadManagementList.push(data.LeadManagementList?.LeadRow)
              }
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.LeadManagementList });
              this.ngxSpinnerService.hide()
            
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.Spinner = false
          this.Spinner = false
          console.log(err)
        }

      }
    );
  }
  onPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.GetLeadManagementList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
    this.updateCurrentRange()
  }
  updateCurrentRange() {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.TotalRecords);
    this.currentRange = `${start} – ${end} of ${this.TotalRecords}`;
  }

  togglePageSize() {
    if (this.UpdatedpageSize == null) {
      this.UpdatedpageSize = 10;
    }
    this.pageSize = this.UpdatedpageSize;
    this.pageIndex = 0; // Reset to the first page when page size changes
    this.GetLeadManagementList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    this.updateCurrentRange()
  }

  onNextPages() {
    
    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      this.GetLeadManagementList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      this.updateCurrentRange()
    }
  }



  onClick(item)
  {
    
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/incoming-invoice'], {queryParams: {invoiceguid:item.InvoiceGuid}})
  }

  
  // onIncomingStatusSearch($event: { term: string; item: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.LeadManagementStatus, $event.term, {
  //     CompanyCode: glob.getCompanyCode().toString(),
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.IncomingInvStatusDD = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.IncomingInvStatusDD = DropDownValue.getBlankObject();
  //     }
  //   });
  // }


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

 


}
