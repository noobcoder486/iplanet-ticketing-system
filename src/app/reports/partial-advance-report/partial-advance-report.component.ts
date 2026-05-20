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
import xml2js from 'xml2js';

@Component({
  selector: 'app-partial-advance-report',
  templateUrl: './partial-advance-report.component.html',
  styleUrls: ['./partial-advance-report.component.css']
})
export class PartialAdvanceReportComponent implements OnInit {

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

  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  actionDetails: any[]=[];
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
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
    {datatype:"STRING",field:"LocationCode",title:"Location Code"},
    {datatype:"STRING",field:"SAPPlantCode",title:"SAPPlant Code"},
    {datatype:"STRING",field:"LocationName",title:"Location Name"},
    {datatype:"STRING",field:"LocationState",title:"Location State"},
    {datatype:"STRING",field:"SupplierGSTNo",title:"Supplier GSTNo"},
    {datatype:"STRING",field:"CustomerCode",title:"Customer Code"},
    {datatype:"STRING",field:"CustomerName",title:"Customer Name"},
    {datatype:"STRING",field:"CustomerState",title:"Customer State"},
    {datatype:"STRING",field:"BuyerGSTNo",title:"Buyer GSTNo"},
    {datatype:"STRING",field:"EmployeeCode",title:"Employee Code"},
    {datatype:"STRING",field:"SalesPersonName",title:"Sales Person Name"},
    {datatype:"STRING",field:"ItemType",title:"Item Type"},
    {datatype:"STRING",field:"ItemNo",title:"Item No"},
    {datatype:"STRING",field:"ItemDescription",title:"Item Description"},
    {datatype:"STRING",field:"SAC_HSNCode",title:"SAC_HSN Code"},
    {datatype:"STRING",field:"CGSTPercentage",title:"CGST Percentage"},
    {datatype:"STRING",field:"CGSTAmount",title:"CGST Amount"},
    {datatype:"STRING",field:"SGSTPercentage",title:"SGST Percentage"},
    {datatype:"STRING",field:"SGSTAmount",title:"SGST Amount"},
    {datatype:"STRING",field:"IGSTPercentage",title:"IGST Percentage"},
    {datatype:"STRING",field:"IGSTAmount",title:"IGST Amount"},
    {datatype:"STRING",field:"Quantity",title:"Quantity"},
    {datatype:"STRING",field:"UnitPrice",title:"UnitPrice"},
    {datatype:"STRING",field:"NetAmount",title:"NetAmount"},
    {datatype:"STRING",field:"SAPSOCode",title:"SAPSO Code"},
    {datatype:"STRING",field:"SAPDeliveryCode",title:"SAPDelivery Code"},
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
            "Value":"GetPartialAdvanceReportList"
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
                    
                    if(Array.isArray(data?.ReportData?.SalesReport))
                    {
                      this.results = data?.ReportData?.SalesReport
                    }
                    else
                    {
                      this.results.push(data?.ReportData?.SalesReport)
                    }
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
          // "Value":"GetSalesReportList"
          "Value":"GetPartialAdvanceReportList"
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
                  this.detail.next({totalRecord:data?.Totalrecords , Data: data?.ReportData?.SalesReport });
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


  MultipleLocationData: any[] =[]
  GetLocationCodeXML() {
  
    let rawData = {
      "rows": []
    }
    for (let item of this.MultipleLocationData) {
      rawData.rows.push({
        "row": {
          "LocationCode": item,
        }
      })

    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Part XML:- ",xml);
    return xml;
  }

  // exportReportData()
  // {
  //   const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
  //   const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
  //   this.results = []
  //   if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
  //   {
  //     {
  //       let requestData = []
  //       this.ngxSpinnerService.show();
  //       requestData.push({
  //         "Key":"APIType",
  //         "Value":"ExportPartialAdvanceReportList"
  //       })
  //       requestData.push({
  //         "Key":"LocationCode",
  //         "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
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
  //         "Key": "PageNo",
  //         "Value": "1"
  //       });
  //       requestData.push({
  //         "Key": "PageSize",
  //         "Value": "10"
  //       });
  //       
  //       let strRequestData = JSON.stringify(requestData);
  //       let contentRequest =
  //       {
  //         "content": strRequestData
  //       };
                
  //       
  //       // this.reportService.downloadServiceReport('SALES',contentRequest).subscribe(
  //       this.reportService.downloadServiceReport('UNIVERSAL',contentRequest).subscribe(
  //         {
  //           next: (Value) => {
  //             try {
  //               const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
  //               const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
  //               let response = JSON.parse(Value.toString());
  //               const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
  //               var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                
  //               // Create a download link
  //               const link = document.createElement('a');
  //               const url = URL.createObjectURL(blob);
  //               link.href = url;
  //               const fileName = `Sales_Report_${startformattedDate}_to_${endformattedDate}.xls`;
  //               link.download = fileName;
  //               link.click();
  //               URL.revokeObjectURL(url);
  //               this.ngxSpinnerService.hide();
  //             } catch (ext) {
  //               console.log(ext);
  //             }
  //           },
  //         }
  //       );
  //     }
  //   }
  //   else
  //   {
  //     this.toast.error("Please Select Start and End Date")
  //   }
  
  // }

  
  exportReportData() {
    const startformattedDate = this.StartDate ? this.datePipe.transform(this.StartDate, 'yyyy-MM-dd') : '0';
    const endformattedDate = this.EndDate ? this.datePipe.transform(this.EndDate, 'yyyy-MM-dd') : '0';
  
    if (this.StartDate && this.EndDate) {
      this.results = [];
      let requestData = [];
      this.ngxSpinnerService.show();
  
      requestData.push({ "Key": "APIType", "Value": "ExportPartialAdvanceReportList" });
      requestData.push({ "Key": "LocationCode", "Value": this.LocationData ?? '' });
      requestData.push({ "Key": "StartDate", "Value": startformattedDate });
      requestData.push({ "Key": "EndDate", "Value": endformattedDate });
      requestData.push({ "Key": "PageNo", "Value": "1" });
      requestData.push({ "Key": "PageSize", "Value": "10" });
  
      ;
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = { "content": strRequestData };
  
      ;
  
      // Make the API call
      this.reportService.downloadServiceReport('UNIVERSAL', contentRequest).subscribe({
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
            const fileName = `Partial_Advance_Report_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
            this.ngxSpinnerService.hide();
          } catch (ext) {
            console.log('Error parsing the response:', ext);
          }
        },
        error: (err) => {
          console.error('API error:', err);
          this.ngxSpinnerService.hide();
        }
      });
    } else {
      this.toast.error("Please Select Start and End Date");
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
