import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';

@Component({
  selector: 'app-incoming-invoice-report',
  templateUrl: './incoming-invoice-report.component.html',
  styleUrls: ['./incoming-invoice-report.component.css']
})
export class IncomingInvoiceReportComponent implements OnInit {

 

  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  IncomingInvStatusDD: DropDownValue = DropDownValue.getBlankObject();

  InvoiceCode: string;
  LocationCode: string;
  SAPGrnCode: string;
  breadCumbList: any[];
  toolBarAction: any[] = [];
  InvoiceStatusData:string[]= ['OPEN', 'SERIALNOUPDATED', 'GRPOCOMPLETED']
  InvoiceStatus: string; 
  errorMessage: string;
  StartDate:any;
  EndDate:any;
  maxDate : Date
  IncomingInvoiceList: any[] =[]
  @ViewChild('callUpdateDialog') callUpdateDialog: TemplateRef<any>;


  constructor(
    private route: Router,
    private gsxService: GsxService ,
    private dialog: MatDialog,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private reportService : ReportService,
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.onIncomingStatusSearch({ term: "", item: [] });
    this.GetIncomingInvoiceList()
    this.maxDate = new Date()

  }


  exportReportData()
  {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    // this.results = []
    if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
    {
      {
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportIncomingInvoiceReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
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
          "Key": "InvoiceCode",
          "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? "" : this.InvoiceCode
        })
        requestData.push({
          "Key": "InvoiceStatus",
          "Value": this.InvoiceStatus == null || this.InvoiceStatus == undefined ? "" : this.InvoiceStatus
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
                const startformattedDate = this.datePipe.transform(this.StartDate, 'dd-MM-yyyy');
                const endformattedDate = this.datePipe.transform(this.EndDate, 'dd-MM-yyyy');
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `Incoming_Invoice_Report_${startformattedDate}_to_${endformattedDate}.xls`;
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



  GetIncomingInvoiceList() {
    // if (this.LocationCode== null || this.LocationCode == undefined || this.LocationCode == '' ){
    //   this.toast.error("Please select a Location");
    //   return;
    // }
    //  
    this.IncomingInvoiceList = []
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetIncomingInvoiceList"
    })
    requestdata.push({
      "Key":"InvoiceCode",
      "Value": this.InvoiceCode == null || this.InvoiceCode == undefined ? '' : this.InvoiceCode
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key": "InvoiceStatus",
      "Value": this.InvoiceStatus == null || this.InvoiceStatus == undefined ? '' : this.InvoiceStatus
    });
    // requestdata.push({
    //   "Key":"PageNo",
    //   "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    // });
    // requestdata.push({
    //   "Key":"PageSize",
    //   "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    // });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    console.log("Before Request SP:", requestdata)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                return
              }
              if( Array.isArray(data.IncomingInvoiceList?.IncomingInvoice) ) {
                this.IncomingInvoiceList = data.IncomingInvoiceList?.IncomingInvoice;
              }
              else{
                this.IncomingInvoiceList.push(data.IncomingInvoiceList?.IncomingInvoice)
              }

            }
          } catch (ext) {
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }

      }
    );
  }
  
  onIncomingStatusSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.IncomingInvoiceStatus, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.IncomingInvStatusDD = value;
        }
      },
      error: (err) => {
        this.IncomingInvStatusDD = DropDownValue.getBlankObject();
      }
    });
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
