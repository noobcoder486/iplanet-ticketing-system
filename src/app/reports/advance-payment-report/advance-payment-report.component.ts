import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { Columns } from 'src/app/models/column.metadata';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-advance-payment-report',
  templateUrl: './advance-payment-report.component.html',
  styleUrls: ['./advance-payment-report.component.css']
})
export class AdvancePaymentReportComponent implements OnInit {


  typeSelected = 'ball-clip-rotate';
  LocationData: string;
  StartDate:any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate:any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  results =[];
  jobPagination: PaginationMetaData;
  CaseIdData: string;
  YesNoOption: string[] = ['Yes','No']
  InvoiceFlag: string;
  
  CustomerCode : any;

  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    // private gsxService: GsxService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
  ) { this.jobPagination = new PaginationMetaData(); }

  actionDetails: any[]=[
    
  ];
  columns: Columns[] = [
    {datatype:"STRING",field:"CustomerCode",title:"CustomerCode"},
     {datatype:"STRING",field:"CustomerName",title:"CustomerName"},
     {datatype:"STRING",field:"MobileNo",title:"MobileNo"},
     {datatype:"STRING",field:"TransactionCode",title:"TransactionCode"},
     {datatype:"STRING",field:"TransactionType",title:"TransactionType"},
     {datatype:"STRING",field:"AdvanceAmount",title:"AdvanceAmount"},
     {datatype:"STRING",field:"ConsumedAmount",title:"ConsumedAmount"},
     {datatype:"STRING",field:"BlockedAmount",title:"BlockedAmount"},
     {datatype:"STRING",field:"AvailableBalance",title:"AvailableBalance"},

     {datatype:"STRING",field:"LocationCode",title:"LocationCode"},
     {datatype:"STRING",field:"CompanyCode",title:"CompanyCode"},

     {datatype:"STRING",field:"CreatedBy",title:"CreatedBy"},
     {datatype:"STRING",field:"CreatedDate",title:"CreatedDate"},
     {datatype:"STRING",field:"LastUpdatedBy",title:"LastUpdatedBy"},
     {datatype:"STRING",field:"LastUpdatedDate",title:"LastUpdatedDate"},
  ];
  

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
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
          "Value":"ExportAdvancePaymentReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
        })
        requestData.push({
          "Key":"InvoiceFlag",
          "Value":this.InvoiceFlag == null || this.InvoiceFlag == undefined ? '' : this.InvoiceFlag
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
          "Key": "CustomerCode",
          "Value": this.CustomerCode == null || this.CustomerCode == undefined ? "" : this.CustomerCode
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
        

        // EXPORTPAYMENT Should be change for advance payment report
        this.reportService.downloadServiceReport('ADVANCEPAYMENT',contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                // let response = JSON.parse(Value.toString());
                // const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                // var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                // var url = URL.createObjectURL(blob);
                // window.open(url);
                // this.ngxSpinnerService.hide()

                const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
                const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `Advance_Payment_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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



  getReportData()
  {
    this.results = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    
          let requestData = []
          this.ngxSpinnerService.show();
          requestData.push({
            "Key":"APIType",
            "Value":"GetAdvancePaymentReportList"
          })
          requestData.push({
            "Key":"LocationCode",
            "Value":this.LocationData == null || this.LocationData == undefined?'':this.LocationData
          })
          requestData.push({
            "Key":"InvoiceFlag",
            "Value":this.InvoiceFlag == null || this.InvoiceFlag == undefined ? '' : this.InvoiceFlag
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
            "Key": "CustomerCode",
            "Value": this.CustomerCode == null || this.CustomerCode == undefined ? "" : this.CustomerCode
          })
          requestData.push({
            "Key": "PageSize",
            "Value": "10"
          });
          console.log("Before Sp", requestData)
          let strRequestData = JSON.stringify(requestData);
          let contentRequest =
          {
            "content": strRequestData
          };
          this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
            {
              next: (Value) => {
                
                this.ngxSpinnerService.hide()
                try {
                  let response = JSON.parse(Value.toString());
                  if (response.ReturnCode == '0') {
                    let data = JSON.parse(response?.ExtraData);
                    console.log("======",data)
                    if( data.Totalrecords == '0'){
                      this.toast.error("No Record Found!")
                      return
                    }
                    if(Array.isArray(data?.ReportData?.Report))
                    { 
                      this.results = data?.ReportData?.Report
                    }
                    else
                    { 
                      this.results.push(data?.ReportData?.Report)
                    }
                    console.log("--------",this.results)
                    this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
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

  loadPageData(event){
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch(event.eventType){
      case "PageChange":
        this.jobPagination.PageNumber  = event.eventDetail.pageIndex + 1;
        let requestData =[];
        requestData.push({
          "Key":"APIType",
          "Value":"GetAdvancePaymentReportList"
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
          "Key": "CustomerCode",
          "Value": this.CustomerCode == null || this.CustomerCode == undefined ? "" : this.CustomerCode
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
  onFlagChange(event){
    console.log("chnage ", this.InvoiceFlag)
  }


}
