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


@Component({
  selector: 'app-contract-master',
  templateUrl: './contract-master.component.html',
  styleUrls: ['./contract-master.component.css']
})



export class ContractMasterComponent implements OnInit {
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
    ];

    actionDetails: any[] = [
      { "code": "EDIT", "icon": "edit", "title": "Edit" },
      // { "code": "DELETE", "icon": "delete", "title": "Delete Mapping" }
  
    ];


  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private ngxservice: NgxSpinnerService,
    private http: HttpClient,
    private toaster: ToastrService,
  ) {
    this.jobPagination = new PaginationMetaData();
    this.activatedRoute.data.subscribe((data: any) => {
      this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
    })
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-contract-master']);
  }

  ngOnInit(): void {
    this.getContractList('');
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
      formData.append('ApiType', 'SaveCreditRequestBulk');
      formData.append('Module', 'SaveCreditRequestBulk');
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
                  this.toaster.success('Credit Request Uploaded Successfully');
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

  actionEmit(event) {
    console.log("action Emit", event);
    if (event.action === 'EDIT') {
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-contract-master'], { queryParams: { cc: event.row.CompanyCode, nc: event.row.CustomerCode } })
    }
  }

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        // this.getContractList(event.eventDetail);
        break;
      case "Sorting":
        break;
    }
    // setTimeout(() => {
    //   this.hideSpinnerEvent.next();
    // }, 500);
  }

  search() {
    // this.getContractList(" ");
  }

  getContractList(eventDetail) {
    let requestData = [];

    requestData.push({
      Key: "ApiType",
      Value: "GetCreditRequestMasterList",
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.CustomerCode || ""
    });
    requestData.push({
      Key: "MobileNo",
      Value: this.MobileNo || ""
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

    this.ngxservice.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        this.ngxservice.hide();
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode === '0') {
            let data = JSON.parse(response.ExtraData);
            if (data?.TotalRecords < 1) {
              this.toaster.info("No Record Found");
              this.results = [];
            } else {
              this.results = Array.isArray(data?.CustomerModeofPaymentLinkList?.CustomerModeofPaymentLink)
                ? data.CustomerModeofPaymentLinkList.CustomerModeofPaymentLink
                : [data.CustomerModeofPaymentLinkList.CustomerModeofPaymentLink];
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
        this.ngxservice.hide();
        console.log(err);
      }
    });
  }

}


