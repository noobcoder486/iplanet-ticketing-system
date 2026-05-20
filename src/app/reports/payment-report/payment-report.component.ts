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
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.css']
})
export class PaymentReportComponent implements OnInit {

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
  ) {
    this.jobPagination = new PaginationMetaData();
  }

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  actionDetails: any[]=[];
  StartDate:any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate:any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isChoose: boolean = false;
  jobPagination: PaginationMetaData;
  results =[];
  screenDetail: any;
  columns: Columns[] = [
    {datatype:"STRING",field:"InvoiceCode",title:"Invoice Code"},
    {datatype:"STRING",field:"InvoiceDate",title:"Invoice Date"},
    {datatype:"STRING",field:"InvoiceDocType",title:"Invoice DocType"},
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
    {datatype:"STRING",field:"SAPPlantCode",title:"SAP Plant Code"},
    {datatype:"STRING",field:"LocationName",title:"Location Name"},
    {datatype:"STRING",field:"LocationState",title:"Location State"},
    {datatype:"STRING",field:"SupplierGSTNo",title:"Supplier GSTNo"},
    {datatype:"STRING",field:"CustomerCode",title:"Customer Code"},
    {datatype:"STRING",field:"CustomerName",title:"Customer Name"},
    {datatype:"STRING",field:"MobileNo",title:"Customer MobileNo"},
    {datatype:"STRING",field:"CustomerState",title:"Customer State"},
    {datatype:"STRING",field:"BuyerGSTNo",title:"Buyer GSTNo"},
    {datatype:"STRING",field:"EmployeeCode",title:"SalesPerson EMPCode"},
    {datatype:"STRING",field:"SalesPersonName",title:"SalesPerson Name"},
    {datatype:"STRING",field:"ModeOfPayment",title:"Mode Of Payment"},
    {datatype:"STRING",field:"Amount",title:"Amount"},
    {datatype:"STRING",field:"GLCode",title:"GLCode"},
    {datatype:"STRING",field:"SAPSOCode",title:"SAP SOCode"},
    {datatype:"STRING",field:"SAPDeliveryCode",title:"SAP DeliveryCode"},
    {datatype:"STRING",field:"PGISuccess",title:"PGI Success"},
  ];


  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
  }

  getReportData()
  {
    this.results = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
      if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
      {
        {
          let requestData = []
          this.ngxSpinnerService.show();
          requestData.push({
            "Key":"APIType",
            "Value":"GetPaymentReportList"
          })
          requestData.push({
            "Key":"LocationCode",
            "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
          })
          requestData.push({
            "Key":"StartDate",
            "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
          })
          requestData.push({
            "Key":"EndDate",
            "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
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
                    
                    if(Array.isArray(data?.ReportData?.Report))
                    {
                      this.results = data?.ReportData?.Report
                    }
                    else
                    {
                      this.results.push(data?.ReportData?.Report)
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
      else
      {
        this.toast.error("Please Select Start and End Date")
      }
  }

  loadPageData(event){
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];
        requestData.push({
          "Key":"APIType",
          "Value":"GetPaymentReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
        })
        requestData.push({
          "Key":"StartDate",
          "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
        })
        requestData.push({
          "Key":"EndDate",
          "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
        })
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.ReportData?.Report });
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
    setTimeout(()=>{  this.hideSpinnerEvent.next( ); }, 1);
  }

  exportReportData()
  {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
    {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportPaymentReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
        })
        
        requestData.push({
          "Key":"StartDate",
          "Value":startformattedDate == null || startformattedDate == undefined?"0":startformattedDate
        })
        requestData.push({
          "Key":"EndDate",
          "Value":endformattedDate == null || endformattedDate == undefined?"0":endformattedDate
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
        
        this.reportService.downloadServiceReport('EXPORTPAYMENT',contentRequest).subscribe(
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
                const fileName = `Payment_Report_${startformattedDate}_to_${endformattedDate}.xls`;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                this.ngxSpinnerService.hide();

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
    else
    {
      this.toast.error("Please Select Start and End Date")
    }
  
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

}
