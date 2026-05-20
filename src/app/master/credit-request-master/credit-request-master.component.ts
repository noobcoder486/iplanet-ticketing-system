import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from "src/app/config/global"
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { Filter } from 'src/app/custom-components/call-login-dashboard/filter.meta'
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';


@Component({
  selector: 'app-credit-request-master',
  templateUrl: './credit-request-master.component.html',
  styleUrls: ['./credit-request-master.component.css']
})
export class CreditRequestMasterComponent implements OnInit {

  EmailId: string;
  CustomerCode: string;
  CustomerName: string;
  MobileNo: string;
  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  JobList: any[];
  searchForm: FormGroup;
  JobColumns: Columns[] = [];
  toolBarAction: any[] = [];
  results: any[] = [];
  breadCumbList: any[];
  gridDetailColumns: any[] = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  selectedFileName: string | null = null;
  errorMessage: string;
  typeSelected = "ball-clip-rotate";




  columns: Columns[] =
    [
      { datatype: "STRING", field: "CustomerCode", title: "Customer Code" },
      { datatype: "STRING", field: "LocationCode", title: "Location Code" },
      { datatype: "STRING", field: "ModeOfPayment", title: "Mode Of Payment" },
      { datatype: "STRING", field: "MobileNo", title: "Mobile No" },
      { datatype: "STRING", field: "TransactionType", title: "Transaction Type" },
      { datatype: "STRING", field: "CreditLimit", title: "Credit Limit" },
      { datatype: "STRING", field: "CreditRemaining", title: "Credit Remaining" },
      { datatype: "DATE", field: "ExpiryDate", title: "Expiry Date" }

    ];
  ngxSpinnerService: any;
  toast: any;


  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private ngxservice: NgxSpinnerService,
    private http: HttpClient,
    private toaster: ToastrService,
    private datePipe: DatePipe,
    private reportService: ReportService
  ) {
    this.jobPagination = new PaginationMetaData();
    this.activatedRoute.data.subscribe((data: any) => {
      this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    })
  }


  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" },
    { "code": "DELETE", "icon": "delete", "title": "Delete" }

  ];

  ngOnInit() {
    this.getCreditList(" ");
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-credit-request-master']);
  }

  actionEmit(event) {
    console.log("action Emit", event);

    if (event.action === 'EDIT') {
        this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-credit-request-master'], { 
            queryParams: { 
                cc: event.row.CreditRequestGUID, 
                nc: event.row.CustomerCode 
            } 
        });
        return; 
    }

    // Delete functionality
    if (event.action === 'DELETE') {
        const shouldContinue = confirm("Are you sure you want to delete?");
        
        if (!shouldContinue) {
            return;
        }

        let requestData = [];
        requestData.push({
          Key: "ApiType",
          Value: "SaveCreditRequestMaster",
        });
        requestData.push({
          Key: "CreditRequestGUID",
          Value: event.row.CreditRequestGUID
        });
        requestData.push({
          Key: "CustomerCode",
          Value: event.row.CustomerCode
        });
        requestData.push({
          Key: "LocationCode",
          Value: event.row.LocationCode
        });
        requestData.push({
          Key: "ModeOfPayment",
          Value: event.row.ModeOfPayment
        });
        requestData.push({
          Key: "MobileNo",
          Value: event.row.MobileNo
        });
        requestData.push({
          Key: "TransactionType",
          Value: event.row.TransactionType
        });
        requestData.push({
          Key: "CompanyCode",
          Value: glob.getCompanyCode(),
        });
        requestData.push({
          Key: "isDeleted",
          Value: '1'
        });

        console.log("Request Data:", requestData);

        const contentRequest = {
            "content": JSON.stringify(requestData)
        };

        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
          next: (value) => {
              console.log('Response:', value);
              try {
                  const response = JSON.parse(value.toString());
                  console.log('Parsed Response:', response);
      
                  if (response.ReturnCode === '0') {
                      this.toaster.success("Deleted Successfully");
      
                      this.getCreditList('');  
                  } else {
                      this.toaster.warning(response.ReturnMessage);
                  }
              } catch (ext) {
                  console.error('Error parsing response:', ext);
                  this.toaster.error("Unexpected error occurred while processing response.");
              } finally {
                  this.ngxservice.hide();
                  this.getCreditList('');
              }
          },
          error: (err) => {
              console.error('Error in deletion request:', err);
              this.toaster.error("Error in deletion, please try again."); 
              this.ngxservice.hide();
          }
      });
      
    }
}


  StartDate = '2000-01-01'
  EndDate = new Date()
  exportReportData(){
    let requestData = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.ngxservice.show();
    requestData.push({
          "Key":"APIType",
          "Value":"ExportCreditRequestList"
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
        
        this.reportService.downloadServiceReport('UNIVERSAL',contentRequest).subscribe(
          {
            next: (Value) => {
              try {

                let results = []
                const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
                const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `CreditRequest_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.getCreditList(event.eventDetail);
        break;
      case "Sorting":
        break;
    }
    // setTimeout(() => {
    //   this.hideSpinnerEvent.next();
    // }, 500);
  }

  search() {
    this.getCreditList(" ");
  }

  getCreditList(eventDetail) {
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetCreditRequestMasterList",
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.CustomerCode == null || this.CustomerCode == undefined ? "" : this.CustomerCode
    });
    requestData.push({
      Key: "MobileNo",
      Value: this.MobileNo == null || this.MobileNo == undefined ? "" : this.MobileNo
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "PageNo",
      Value: eventDetail.pageIndex ? eventDetail.pageIndex + 1 : '1'
    });
    requestData.push({
      Key: "PageSize",
      Value: eventDetail.pageSize || '10'
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    // this.ngxservice.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        // this.ngxservice.hide();
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode === '0') {
            let data = JSON.parse(response.ExtraData);
            ;
            if (data?.TotalRecords < 1) {
              this.toaster.info("No Record Found");
              this.results = [];
            } else {
              this.results = Array.isArray(data?.CreditRequestList?.CreditRequest)
                ? data.CreditRequestList.CreditRequest
                : [data.CreditRequestList.CreditRequest];
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });

            }
          } else {
            this.toaster.error(response.ReturnMessage);
          }
        } catch (ext) {
          console.log(ext);
        }
      },
      error: (err) => {
        // this.ngxservice.hide();
        console.log(err);
      }
    });
  }


  downloadSampleFile() {
    const fileUrl = glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/CreditRequestExcelFormat.xlsx';
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'MaterialMasterExcelFormat.xlsx';
      a.click();
      window.URL.revokeObjectURL(a.href);
    });
  }

  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }




  async FileUploadMaterial(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if (shouldContinue == false) {
      return
    }

    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ", file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveCreditRequestBulk');
      formData.append('Module', 'SaveCreditRequestBulk');
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
                  this.toaster.success('Credit Request Uploaded Successfully');
                  this.getCreditList('')
                }
                else {
                  console.log("Error Response: ", response)
                  let errorMessage = response.ErrorMessage;
                  this.toaster.error(errorMessage);
                  const parser = new xml2js.Parser({ strict: false, trim: true });
                  parser.parseString(errorMessage, (error, result) => {
                    const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                    console.log("Messages : ", errorMessages)
                    errorMessages.forEach((errorMessage) => {
                      console.log("Error Message: ", error)
                      this.toaster.error("Error:- ", errorMessage.ERRORMESSAGE, { closeButton: true, disableTimeOut: true });
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



}
