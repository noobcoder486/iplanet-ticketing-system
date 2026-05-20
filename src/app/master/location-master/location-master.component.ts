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
import xml2js from 'xml2js';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-location-master',
  templateUrl: './location-master.component.html',
  styleUrls: ['./location-master.component.css']
})
export class LocationMasterComponent implements OnInit {

  filterList: Filter[] = [];
  emailId: string = '';
  locationCode: string = '';
  locationName: string = '';
  MobileNumber: string = '';
  searchForm: FormGroup;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;

  columns: Columns[] = [
    { datatype: "STRING", field: "LocationAccGroupCode", title: "Location Acc Group Code" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "LocationName", title: "Location Name" },
    { datatype: "STRING", field: "SearchName", title: "Search Name" },
    { datatype: "STRING", field: "Address1", title: "Address 1" },
    { datatype: "STRING", field: "Address2", title: "Address 2" },
    { datatype: "STRING", field: "City", title: "City" },
    { datatype: "STRING", field: "ZipCode", title: "Zip Code" },
    { datatype: "STRING", field: "StateCode", title: "State Code" },
    { datatype: "STRING", field: "CountryCode", title: "Country Code" },
    { datatype: "STRING", field: "ContactPerson", title: "Contact Person" },
    { datatype: "STRING", field: "MobileNo", title: "Mobile No" },
    { datatype: "STRING", field: "PhoneNo", title: "Phone No" },
    { datatype: "STRING", field: "EmailId", title: "Email Id" },
    { datatype: "STRING", field: "TaxType", title: "Tax Type" },
    { datatype: "STRING", field: "SHIP_TO_GSX", title: "Ship To GSX" },
    { datatype: "STRING", field: "SOLD_TO_GSX", title: "Sold to GSX" },
    { datatype: "STRING", field: "GSTRegistrationNo", title: "GST Registration No" },
    { datatype: "STRING", field: "GSTRegistrationType", title: "GST Registration Type" },
    
  ];
  
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm: FormGroup;
  jobPagination: PaginationMetaData;
  constructor(
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private route: Router,
    private toaster : ToastrService,
    private http: HttpClient,
    private datePipe : DatePipe,
    private reportService: ReportService

  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.GetLocationList('', '', '', '');
  }


  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-location-master']);
  }

  actionEmit(event) {
    if (event.action == 'EDIT') {
      this.route.navigate(['/auth/'+glob.getCompanyCode()+'/add-location-master'], { queryParams: { cc: event.row.CompanyCode, nc: event.row.LocationCode } })
    }
  }

  search() {
    this.GetLocationList(this.locationCode, this.locationName, this.MobileNumber, this.emailId);
  }

  GetLocationList(locationcode, locationname, mobilenumber, emailId) {
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetLocationList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationName",
      "Value": locationname
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": locationcode
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": mobilenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": emailId
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
              if(Array.isArray(data?.LocationList?.Location))
              {
                results = data?.LocationList?.Location
              }
              else
              {
                results.push(data?.LocationList?.Location)
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
          "Value": "GetLocationList"
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.LocationList?.Location });
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

  
  selectedFileName: string | null = null;
  errorMessage

  async FileUploadTarget(event: any) {
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
      formData.append('ApiType', 'SaveTargetMasterBulk');
      formData.append('Module','SaveTargetMasterBulk');
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
                    this.toaster.success('Target/s Uploaded Successfully');
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
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/TargetMasterExcelFormat.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'TargetMasterExcelFormat.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
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
          "Value":"ExportLocationData"
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
                const fileName = `Location_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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
  }

}
