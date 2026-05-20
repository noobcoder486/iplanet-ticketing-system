import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import * as glob from 'src/app/config/global'
import { HttpClient } from '@angular/common/http';




@Component({
  selector: 'app-company-stock-management',
  templateUrl: './company-stock-management.component.html',
  styleUrls: ['./company-stock-management.component.css']
})
export class CompanyStockManagementComponent implements OnInit {

  jobPagination: PaginationMetaData;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);



  StartDate: any
  EndDate: any

  CompanyStockList: any = [];


  MaterialCode: any
  LocationCode: any
  CompanyCode: any


  constructor(
    private toaster: ToastrService,
    private ngxservice: NgxSpinnerService,
    private dynamicService: DynamicService,
    private datePipe: DatePipe,

    private http : HttpClient,


  ) { this.jobPagination = new PaginationMetaData(); }

  ngOnInit(): void {
    this.GetCompanyStockList()
  }

  errorMessage: string = '';
  columns: Columns[] = [
    { datatype: "STRING", field: "CompanyCode", title: "CompanyCode" },
    { datatype: "STRING", field: "LocationCode", title: "LocationCode" },
    { datatype: "STRING", field: "MaterialCode", title: "MaterialCode" },
    { datatype: "STRING", field: "MaterialDescription", title: "MaterialDescription" },
    { datatype: "STRING", field: "Quantity", title: "Quantity" },
    { datatype: "STRING", field: "SerialNo", title: "SerialNo" },


  ];


  selectFile(type) {
    
    if (type == 'CompanyStockExcelFormat') {
      const fileInput = document.getElementById('NewCompanyStock') as HTMLInputElement;
      fileInput.click();
    }
  }

  selectedFileNameCompanyStock: string | null = null;
  async FileUploadCompanyStock(event: any) {
    
    const shouldContinue = confirm("Are you sure you want to continue")
    if (shouldContinue == false) {
      return
    }

    const file = event.target.files[0];
    if (file) {
      this.selectedFileNameCompanyStock = file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ", file);
      formData.append('file', file, filename);
      formData.append('ApiType', 'SaveCompanyStockBulk');
      formData.append('Module', 'SaveCompanyStockBulk');
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
                 
                  this.toaster.success('Company Stock Uploaded Successfully');
                  this.GetCompanyStockList()
                  
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
                      this.toaster.error(errorMessage.ERRORMESSAGE);
                    });
                  });
                }
              }
            }
            catch (ext) {
              console.log(ext);
              this.ngxservice.hide();

            }
          },
          error: err => {
            
            this.ngxservice.hide();

            event.target.value = null;
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1);
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


  GetCompanyStockList() {
    this.ngxservice.show();

    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetCompanyStockList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": this.CompanyCode == null || this.CompanyCode == undefined ? '' : this.CompanyCode
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    requestData.push({
      "Key": "MaterialCode",
      "Value": this.MaterialCode
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
    console.log('GetCompanyStockList requeset date', contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.CompanyStockList = []
              if (Array.isArray(data?.CompanyStockList?.CompanyStock)) {
                this.CompanyStockList = data?.CompanyStockList?.CompanyStock
              }
              else {
                this.CompanyStockList.push(data?.CompanyStockList?.CompanyStock)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.CompanyStockList });
              this.ngxservice.hide()
              console.log(' this.CompanyStockList', this.CompanyStockList)
            }
          } catch (ext) {
            console.log(ext);
            this.ngxservice.hide()

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
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];
        this.ngxservice.show();

        requestData.push({
          "Key": "APIType",
          "Value": "GetCompanyStockList"
        });
        requestData.push({
          "Key": "CompanyCode",
          "Value": this.CompanyCode
        });
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationCode
        });
        requestData.push({
          "Key": "MaterialCode",
          "Value": this.MaterialCode
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
                  this.ngxservice.hide()

                  let data = JSON.parse(response?.ExtraData);
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.CompanyStockList?.CompanyStock });

                }
              } catch (ext) {
                console.log(ext);
                this.ngxservice.hide()

              }
            },
            error: err => {
              console.log(err);
              this.ngxservice.hide()

            }
          }
        );
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }




  downloadSampleFile()
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/CompanyStockBulkUpload.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'CompanyStockBulkUpload.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }

}
