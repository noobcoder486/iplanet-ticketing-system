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
  selector: 'app-customer-jounery-report',
  templateUrl: './customer-journey-report.component.html',
  styleUrls: ['./customer-journey-report.component.css']
})
export class CustomerJourneyReportComponent implements OnInit {


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
  isStartDateSelected: boolean;
  isEndDateSelected: boolean;
  fromDatePicker: any;
  toDatePicker: any;
  maxDate : Date

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
    // {datatype:"STRING",field:"",title:"Device Purchase Date "},
    //  {datatype:"STRING",field:"",title:"GSX repair Type"},
     {datatype:"STRING",field:"TechnicianName",title:"Repair Created by (tech Name or id)"},
     {datatype:"STRING",field:"ReadyForPickupFromGSX",title:"Ready fro Pickup from GSX "},
     {datatype:"STRING",field:"ReadyForPickupInCRM",title:"Ready fro pickup in CRM"},
     {datatype:"STRING",field:"RepairMarkCompleteInGSX",title:"Repair Mark complete in GSX "},
     {datatype:"STRING",field:"RepairCloseInCRM",title:"Repair close in CRM"},
    //  {datatype:"STRING",field:"",title:"GSX Invoice Number"},
     {datatype:"STRING",field:"",title:"GSX inv Value "},
    //  {datatype:"STRING",field:"",title:"Job  Current Ageing"},
    //  {datatype:"STRING",field:"",title:"Job Ageing Slab"},
    //  {datatype:"STRING",field:"",title:"Days to take to Job Completion"},
     {datatype:"STRING",field:"PartReceiveddatefromBluedartTrackingNumber",title:"Part Received date from Bluedart tracking number"},
    //  {datatype:"STRING",field:"",title:"KBB Defective Part PN serial "},
    // {datatype:"STRING",field:"",title:"KBB return date"},
    //  {datatype:"STRING",field:"",title:"KBB return AWB"},
    //  {datatype:"STRING",field:"",title:"GSX Repair Closed and Complete"},
    //  {datatype:"STRING",field:"",title:"Repair Processed through CRM"},
    {datatype:"STRING",field:"CallType ",title:" CallType "},
    {datatype:"STRING",field:"ConnectDisposition ",title:" ConnectDisposition "},
    {datatype:"STRING",field:"InvoiceNumber",title:"Invoice Number"},
    {datatype:"STRING",field:"InvoiceTimeStamp",title:"Invoice TimeStamp"},
    {datatype:"STRING",field:"ItemCode",title:"Item Code  "},
    // {datatype:"STRING",field:"",title:"Item description"},
    {datatype:"STRING",field:"TotalNetAmount",title:"Net Amount"},
    // {datatype:"STRING",field:"",title:"GP"},
    // {datatype:"STRING",field:"",title:"Apple Labour Reimbument code"},
    // {datatype:"STRING",field:"",title:"Apple Labour Reimbursement amount"},
  

  ];

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.maxDate = new Date()
  }

  ValidateDateRange() {
    if (this.StartDate && this.EndDate && this.StartDate > this.EndDate) {
      this.toast.warning('From Date cannot be greater than To Date')  
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
  onFromDateSelected() {
    this.isStartDateSelected = false;
    this.isEndDateSelected = true;
  }

  onToDateSelected() {
    this.isStartDateSelected = true;
    this.isEndDateSelected = false;
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
          "Value":"ExportCustomerJourneyReportList"
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
        

        // EXPORTPAYMENT Should be change for advance payment report
        this.reportService.downloadServiceReport('ADVANCEPAYMENT',contentRequest).subscribe(
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
                const fileName = `Customer_Journey_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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
      if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
      {     
        {
          let requestData = []
          this.ngxSpinnerService.show();
          requestData.push({
            "Key":"APIType",
            "Value":"GetCustomerJourneyReportList"
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
          "Key": "CaseId",
          "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
        })
        requestData.push({
          "Key":"InvoiceFlag",
          "Value":this.InvoiceFlag == null || this.InvoiceFlag == undefined ? '' : this.InvoiceFlag
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
