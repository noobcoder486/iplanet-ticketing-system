import { Component, DebugElement, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import xml2js from 'xml2js';

@Component({
  selector: 'app-amc-contract-management-list',
  templateUrl: './amc-contract-management-list.component.html',
  styleUrls: ['./amc-contract-management-list.component.sass']
})
export class AmcContractManagementListComponent implements OnInit {

 
  ContractManagementList: any = [];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  jobPagination: PaginationMetaData;
  actionDetails: any[] = [
    { "code": "CHANGESTATUS", "icon": "", "title": "Change Status" }
  ];

  ContractCode: any
  CustomerCode: any
  StartDate: any
  EndDate: any


  columns: Columns[] = [
    { datatype: "STRING", field: "ContractCode", title: "ContractCode" },
    { datatype: "STRING", field: "CustomerCode", title: "CustomerCode" },
    { datatype: "STRING", field: "Status", title: "Status" },
    { datatype: "STRING", field: "NetAmount", title: "NetAmount" },
    { datatype: "STRING", field: "SerialNo", title: "SerialNo" },
    { datatype: "STRING", field: "NoOfTimesUsed", title: "NoOfTimesUsed" },
    { datatype: "STRING", field: "ItemCode", title: "ItemCode" },
    { datatype: "STRING", field: "ItemDescription", title: "ItemDescription" },
    { datatype: "STRING", field: "ProductName", title: "ProductName" },
    { datatype: "STRING", field: "ProdcutType", title: "ProdcutType" },
    { datatype: "STRING", field: "CoverageStartDate", title: "CoverageStartDate" },
    { datatype: "STRING", field: "CoverageEndDate", title: "CoverageEndDate" },
    { datatype: "STRING", field: "InvoiceCode", title: "InvoiceCode" },
    { datatype: "STRING", field: "LocationCode", title: "LocationCode" },
    { datatype: "STRING", field: "CompanyCode", title: "CompanyCode" },
    { datatype: "STRING", field: "LastUpdatedBy", title: "LastUpdatedBy" },
    { datatype: "STRING", field: "LastUpdatedDate", title: "LastUpdatedDate" },
    { datatype: "STRING", field: "CreatedBy", title: "CreatedBy" },
    { datatype: "STRING", field: "CreatedDate", title: "CreatedDate" },

  ];
  errorMessage: any;

  constructor(
    private dynamicService: DynamicService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe,
    private reportService: ReportService,



  ) {
    this.jobPagination = new PaginationMetaData();

  }

  ngOnInit(): void {
    this.GetAmcContractManagementList()
  }

    actionEmit(event){
      
      if(event.action == 'CHANGESTATUS'){
        console.log("Roew ", event.row)
        const shouldContinue = confirm("Are you sure, you want to CHANGE STATUS ?")
        if (shouldContinue == false) 
        {
          return
        }
       this.UpdateAmcContractDetailsStatus(event.row) 
      }
    }

  GetAmcContractManagementList() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.spinner.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetAmcContractManagementList"
    });
    requestData.push({
      "Key": "ContractCode",
      "Value": this.ContractCode
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode
    });
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate
    });
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate
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
    console.log('GetAmcContractManagementList requeset date', contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              this.ContractManagementList = []
              if (Array.isArray(data?.AmcContractDetailsList?.AmcContractDetails)) {
                this.ContractManagementList = data?.AmcContractDetailsList?.AmcContractDetails
              }
              else {
                this.ContractManagementList.push(data?.AmcContractDetailsList?.AmcContractDetails)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.ContractManagementList });
              this.spinner.hide()
              console.log(' this.ContractManagementList', this.ContractManagementList)
            }
          } catch (ext) {
            console.log(ext);
            this.spinner.hide()

          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide()

        }
      }
    );
  }

  loadPageData(event) {
    
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];
        const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
        const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');

        requestData.push({
          "Key": "APIType",
          "Value": "GetAmcContractManagementList"
        });
        requestData.push({
          "Key": "ContractCode",
          "Value": this.ContractCode
        });
        requestData.push({
          "Key": "CustomerCode",
          "Value": this.CustomerCode
        });
        requestData.push({
          "Key": "StartDate",
          "Value": startformattedDate
        });
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.AmcContractDetailsList?.AmcContractDetails });
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




  ExportAmcContractManagementList() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if (startformattedDate == null || startformattedDate == undefined || startformattedDate == '') {
      this.toastrService.error('StartDate  cannot be empty !')
      return
    }
    if (endformattedDate == null || endformattedDate == undefined || endformattedDate == '') {
      this.toastrService.error('End Date cannot be empty !')
      return
    }
    if (endformattedDate < startformattedDate) {
      this.toastrService.error('End Date Cannot Be Less Than Start Date')
      return
    }
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportAmcContractManagementList"
    })
    requestData.push({
      "Key": "ContractCode",
      "Value": this.ContractCode
    });
    requestData.push({
      "Key": "CustomerCode",
      "Value": this.CustomerCode
    });
    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate
    });
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
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
            const fileName = `Amc_Contract_Management_List_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
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



  // Change status
  UpdateAmcContractDetailsStatus(row) {
    this.spinner.show();
    
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "UpdateAmcContractDetailsStatus"
    });
    requestData.push({
      "Key": "AmcContractDetailsGuid",
      "Value": row.AmcContractDetailsGuid
    });
    requestData.push({
      "Key": "ContractCode",
      "Value": row.ContractCode
    });
    requestData.push({
      "Key": "Status",
      "Value": row.IsDeleted == 0 ? row.IsDeleted = 1 : row.IsDeleted = 0
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log('request date UpdateAmcContractDetailsStatus', contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          console.log("Resposne ", response)
          if (response.ReturnCode == '0') {
            this.toastrService.success("Status Updated Successfully");
              this.GetAmcContractManagementList()
          }
          else {
            this.errorMessage = response.ReturnMessage;
            console.log('this.errorMessage ',this.errorMessage )
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });


              this.GetAmcContractManagementList()

               this.toastrService.error("Error While Saving");
                   
          }

        },
        error: err => {
          if (err.includes('"message":"Cannot')) {
            // this.controlValidations()
            this.spinner.hide();
          }
        }
      });
  }
  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log('errror',errror)
    this.toastrService.error(errror)
  }


}
