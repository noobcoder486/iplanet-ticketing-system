import { Component, OnInit } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global';
import { Columns } from 'src/app/models/column.metadata';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';

@Component({
  selector: 'app-job-report',
  templateUrl: './job-report.component.html',
  styleUrls: ['./job-report.component.css']
})
export class JobReportComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  actionDetails: any[] = [];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  StartDate: any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate: any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  results = [];
  CaseIdData: string;
  screenDetail: any;
  GSXStatusDD: DropDownValue = DropDownValue.getBlankObject();
  GSXStatus: string

  columns: Columns[] = [
    { datatype: "STRING", field: "TokenCode", title: "TokenCode" },
    { datatype: "STRING", field: "TokenDate", title: "TokenDate" },
    { datatype: "STRING", field: "VisitPurpose", title: "VisitPurpose" },
    { datatype: "STRING", field: "RemarksForEnquiry", title: "RemarkForEnquiry" },
    { datatype: "STRING", field: "EnquirySerialNo", title: "EnquirySerialNo" },
    { datatype: "STRING", field: "AssignedToCREdate", title: "AssignedToCREdate" },
    { datatype: "STRING", field: "TokenDateToCaseId", title: "TokenDateToCaseId" },
    { datatype: "STRING", field: "CREName", title: "CREName" },
    { datatype: "STRING", field: "CaseId", title: "CaseId" },
    { datatype: "STRING", field: "CaseDate", title: "CaseDate" },
    { datatype: "STRING", field: "TechCode", title: "Technician Name" },
    { datatype: "STRING", field: "AssignedDate", title: "Technician AssignDate" },
    { datatype: "STRING", field: "TimeTakenForDiagnosis", title: "TimeTakenForDiagnosis" },
    { datatype: "STRING", field: "GSXWarrantyStatusCode", title: "GSXWarrantyStatusCode" },
    { datatype: "STRING", field: "GSXWarrantyStatusDesc", title: "GSXWarrantyStatusDesc" },
    { datatype: "STRING", field: "QuoteNumber", title: "QuoteNumber" },
    { datatype: "STRING", field: "QuoteDate", title: "QuoteDate" },
    { datatype: "STRING", field: "CustomerApproveDate", title: "CustomerApproveDate" },
    { datatype: "STRING", field: "GSXCode", title: "GSXCode" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "SHIP_TO_GSX", title: "Ship To" },
    { datatype: "STRING", field: "SOLD_TO_GSX", title: "Sold To" },
    { datatype: "STRING", field: "LocationCity", title: "Location City" },
    { datatype: "STRING", field: "StateCode", title: "State Code" },
    { datatype: "STRING", field: "PhoneNo", title: "PhoneNo" },
    { datatype: "STRING", field: "ZipCode", title: "ZipCode" },
    { datatype: "STRING", field: "GSTRegistrationNo", title: "GSTRegistration" },
    { datatype: "STRING", field: "CustomerCode", title: "CustomerCode" },
    { datatype: "STRING", field: "FirstName", title: "FirstName" },
    { datatype: "STRING", field: "LastName", title: "LastName" },
    { datatype: "STRING", field: "MobileNo", title: "MobileNo" },
    { datatype: "STRING", field: "EmailID", title: "EmailId" },
    { datatype: "STRING", field: "RepairClassification", title: "RepairClassification" },
    { datatype: "STRING", field: "Address1", title: "Address1" },
    { datatype: "STRING", field: "CustomerCity", title: "CustomerCity" },
    { datatype: "STRING", field: "CustomerZipCode", title: "CustomerZipCode" },
    { datatype: "STRING", field: "CustomerGSTRegistrationNo", title: "GSTRegistrationNo" },
    { datatype: "STRING", field: "productDescription", title: "ProductDescription" },
    { datatype: "STRING", field: "ProductType", title: "ProductType" },
    { datatype: "STRING", field: "SerialNo1", title: "ProductSerialNo" },
    { datatype: "STRING", field: "imei1", title: "IMEI" },
    { datatype: "STRING", field: "meid", title: "MEID" },
    { datatype: "STRING", field: "purchaseCountryCode", title: "PurchaseCountryCode" },
    { datatype: "STRING", field: "ServiceType", title: "ServiceType" },
    { datatype: "STRING", field: "ProductGSXWarrantyStatusCode", title: "ProductGSXWarrantyStatusCode" },
    { datatype: "STRING", field: "ProductGSXWarrantyStatusDesc", title: "ProductGSXWarrantyStatusDesc" },
    { datatype: "STRING", field: "RepairDocType", title: "RepairDocType" },
    { datatype: "STRING", field: "ServiceNotificationNumber", title: "ServiceNotificationNumber" },
    { datatype: "STRING", field: "GSXRepairStatus", title: "GSXRepairStatus" },
    { datatype: "STRING", field: "GSXRepairStatusDescription", title: "GSXRepairStatusDescription" },
    { datatype: "STRING", field: "ItemNo", title: "ItemNo" },
    { datatype: "STRING", field: "ComponentCode", title: "ComponentCode" },
    { datatype: "STRING", field: "ComponentDescription", title: "ComponentDescription" },
    { datatype: "STRING", field: "IssueCode", title: "IssueCode" },
    { datatype: "STRING", field: "IssueDescription", title: "IssueDescription" },
    { datatype: "STRING", field: "ReproducibilityCode", title: "ReproducibilityCode" },
    { datatype: "STRING", field: "ReproducibilityDescription", title: "ReproducibilityDescription" },
    { datatype: "STRING", field: "fromConsignment", title: "fromConsignment" },
    { datatype: "STRING", field: "PartType", title: "PartType" },
    { datatype: "STRING", field: "PartCode", title: "PartCode" },
    { datatype: "STRING", field: "PartDescription", title: "PartDescription" },
    { datatype: "STRING", field: "PartUsed", title: "PartUsed" },
    { datatype: "STRING", field: "PartUsedDescription", title: "PartUsedDescription" },
    { datatype: "STRING", field: "CoverageCode", title: "CoverageCode" },
    { datatype: "STRING", field: "CoverageCodeDescription", title: "CoverageCodeDescription" },
    { datatype: "STRING", field: "CoverageOption", title: "CoverageOption" },
    { datatype: "STRING", field: "CoverageOptionDescription", title: "CoverageOptionDescription" },
    { datatype: "STRING", field: "ReturnStatusCode", title: "ReturnStatusCode" },
    { datatype: "STRING", field: "ReturnStatusDescription", title: "ReturnStatusDescription" },
    { datatype: "STRING", field: "billable", title: "billable" },
    { datatype: "STRING", field: "OrderStatusCode", title: "OrderStatusCode" },
    { datatype: "STRING", field: "OrderStatusDescription", title: "OrderStatusDescription" },
    { datatype: "STRING", field: "OrderStatusDate", title: "OrderStatusDate" },
    { datatype: "STRING", field: "ReturnOrderNumber", title: "ReturnOrderNumber" },
    { datatype: "STRING", field: "DeliveryNumber", title: "DeliveryNumber" },
    { datatype: "STRING", field: "DeliveryDate", title: "DeliveryDate" },
    { datatype: "STRING", field: "DeliveryTrackingNumber", title: "DeliveryTrackingNumber" },
    { datatype: "STRING", field: "HandOverCode", title: "HandOverCode" },
    { datatype: "STRING", field: "HandOverDate", title: "HandOverDate" },
    { datatype: "STRING", field: "Remark", title: "Remark" },

  ];
  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onGSXStatusSearch({ term: "", item: [] });
  }

  actionEmit($event) {

  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
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

  onGSXStatusSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.GSXRepairStatus, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.GSXStatusDD = value;
        }
      },
      error: (err) => {
        this.GSXStatusDD = DropDownValue.getBlankObject();
      }
    });
  }

  getReportData() {
     
    this.results = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key": "APIType",
          "Value": "GetJobReportList"
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
        })
        requestData.push({
          "Key": "GSXRepairStatus",
          "Value": this.GSXStatus == null || this.GSXStatus == undefined ? '' : this.GSXStatus
        })

        requestData.push({
          "Key": "StartDate",
          "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
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
                  
                  if (Array.isArray(data?.ReportData?.JobReport)) {
                    this.results = data?.ReportData?.JobReport
                  }
                  else {
                    this.results.push(data?.ReportData?.JobReport)
                  }
                  console.log(this.results)
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
                  this.ngxSpinnerService.hide()
                }
              } catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              console.log(err);
              this.ngxSpinnerService.hide()
            }
          }
        );
      }
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }


  }


  loadPageData(event) {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];
        requestData.push({
          "Key": "APIType",
          "Value": "GetJobReportList"
        })
        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
        })
        requestData.push({
          "Key": "GSXRepairStatus",
          "Value": this.GSXStatus == null || this.GSXStatus == undefined ? '' : this.GSXStatus
        })
        requestData.push({
          "Key": "StartDate",
          "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
        })
        requestData.push({
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
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
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.ReportData?.JobReport });
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



  exportReportData() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      let requestData = []
      this.ngxSpinnerService.show();
      requestData.push({
        "Key": "APIType",
        "Value": "ExportJobReportList"
      })
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
      })
      requestData.push({
        "Key": "GSXRepairStatus",
        "Value": this.GSXStatus == null || this.GSXStatus == undefined ? '' : this.GSXStatus
      })
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestData.push({
        "Key": "StartDate",
        "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
      })
      requestData.push({
        "Key": "EndDate",
        "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
      })
      requestData.push({
        "Key": "CaseId",
        "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
      })
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
      
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
        {
          next: (Value) => {
            this.ngxSpinnerService.hide()
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
              const fileName = `Job_Report_${startformattedDate}_to_${endformattedDate}.xls`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();

            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
          }
        }
      );
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }

  }
// download summary Report

    DownloadSummary(){
        
      const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
      const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
        let PdfData = [];
        if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
          {
        PdfData.push({
          "Key": "ApiType",
          "Value": "DownLoadJobReportSummary",
        });
      PdfData.push({
        "Key": "LocationCode",
        "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
      })
      PdfData.push({
        "Key": "GSXRepairStatus",
        "Value": this.GSXStatus == null || this.GSXStatus == undefined ? '' : this.GSXStatus
      })
      PdfData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      PdfData.push({
        "Key": "StartDate",
        "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
      })
      PdfData.push({
        "Key": "EndDate",
        "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
      })
      PdfData.push({
        "Key": "CaseId",
        "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
      })
      PdfData.push({
        "Key": "PageNo",
        "Value": "1"
      });
      PdfData.push({
        "Key": "PageSize",
        "Value": "10"
      });
      
        let pdfRequestData = JSON.stringify(PdfData);
        let contentRequest =
        {
          "content": pdfRequestData
        };
        console.log('the request data ' , pdfRequestData);
        this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
          {
            next: (value) => {
              let response = JSON.parse(value.toString());
              const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
              
              var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });

              const filename = `jobReportSummary_${startformattedDate}_to_${endformattedDate}.xlsx`;
              var link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = filename;
              document.body.appendChild(link);
              link.click(); 
              document.body.removeChild(link); 
              this.ngxSpinnerService.hide()
            },
            error: err => {
              console.log(err);
              this.ngxSpinnerService.hide()
    
            }
          });
         }
          else
          {
            this.toast.error("Please Select Start and End Date")
          }
  }



// decline service report
  exportReportData_Declined() {
      
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
      let requestData = []
      this.ngxSpinnerService.show();
      requestData.push({
        "Key": "APIType",
        "Value": "ExportJobReportList_Declined"
      })
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
      })
      requestData.push({
        "Key": "GSXRepairStatus",
        "Value": this.GSXStatus == null || this.GSXStatus == undefined ? '' : this.GSXStatus
      })
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestData.push({
        "Key": "StartDate",
        "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
      })
      requestData.push({
        "Key": "EndDate",
        "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
      })
      requestData.push({
        "Key": "CaseId",
        "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
      })
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
      
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe(
        {
          next: (Value) => {
            this.ngxSpinnerService.hide()
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
              const fileName = `Job_Report_Declined_${startformattedDate}_to_${endformattedDate}.xls`;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);
              this.ngxSpinnerService.hide();

            } catch (ext) {
              console.log(ext);
            }
          },
          error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
          }
        }
      );
    }
    else {
      this.toast.error("Please Select Start and End Date")
    }

  }

}