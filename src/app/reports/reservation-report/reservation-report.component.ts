import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core'; 
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from 'src/app/config/global';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';



@Component({
  selector: 'app-reservation-report',
  templateUrl: './reservation-report.component.html',
  styleUrls: ['./reservation-report.component.css']
})
export class ReservationReportComponent implements OnInit {


  constructor(private dropdownDataService:DropdownDataService,
    private datePipe: DatePipe,
    private ngxSpinnerService: NgxSpinnerService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private reportService: ReportService,
    ) {  this.jobPagination = new PaginationMetaData()}

typeSelected = 'ball-clip-rotate';
StartDate: any;
hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
EndDate: any;

results = [];
LocationData: string;
CallType:string;
ConnectDisposition:string;
ServiceRefNo: string;
ReservationType: string;
ReservationCode: string;
ReservationStatus: string;
CaseIdData: string;
jobPagination: PaginationMetaData;
DispositionDD: DropDownValue = this.getBlankObject();
LocationForJob: DropDownValue = DropDownValue.getBlankObject();



columns: Columns[] = [  

  { datatype: "STRING", field: "ReservationCode", title: "Reservation Code" },
  { datatype: "STRING", field: "CaseId", title: "Case Id" },
  { datatype: "STRING", field: "ReservationStatusDesc", title: "Reservation Status" },
  { datatype: "STRING", field: "ReservationType", title: "Reservation Type" },
  { datatype: "STRING", field: "ProblemOrRemark", title: "Reservation Remark" },
  { datatype: "DATE", field: "ReservationDate", title: "Reservation Date" },
  { datatype: "STRING", field: "LocationCode", title: "Location Code" },
  { datatype: "STRING", field: "ServiceRefNo", title: "Service Ref No" }
];


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


getBlankObject(): DropDownValue {
const ddv = new DropDownValue();
ddv.TotalRecord = 0;
ddv.Data = [];
return ddv;
}


ngOnInit(): void {
  this.onLocationSearch({ term: "", item: [] });
}


// onDispositionSearch($event: { term: string; items: any[] }) {
// this.dropdownDataService.fetchDropDownData(DropDownType.Disposition, $event.term).subscribe({
// next: (value) => {
// if (value != null) {
// this.DispositionDD = value; 
// }
// },
// error: err => {
// this.DispositionDD = this.getBlankObject();
// }
// });
// }

exportReportData() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    this.results = []
    if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
    let requestData = []
    this.ngxSpinnerService.show();
    requestData.push({
    "Key": "APIType",
    "Value": "ExportReservationReportList"
    })
    requestData.push({
    "Key": "LocationCode",
    "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
    })
    requestData.push({
      "Key": "ServiceRefNo",
      "Value": this.ServiceRefNo == null || this.ServiceRefNo == undefined ? '' : this.ServiceRefNo
      })
    requestData.push({
      "Key": "ReservationType",
      "Value": this.ReservationType == null || this.ReservationType == undefined ? '' : this.ReservationType
    })
    requestData.push({
      "Key": "ReservationCode",
      "Value": this.ReservationCode == null || this.ReservationCode == undefined ? '' : this.ReservationCode
    })
    requestData.push({
      "Key": "ReservationStatus",
      "Value": this.ReservationStatus == null || this.ReservationStatus == undefined ? '' : this.ReservationStatus
    })
 requestData.push({
    "Key": "StartDate",
    "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
    })
    requestData.push({
    "Key": "EndDate",
    "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
    })


    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
    "content": strRequestData
    }; 
    console.log("Request ", requestData);
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
        const fileName = `Reservation_Report_${startformattedDate}_to_${endformattedDate}.xls`;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        this.ngxSpinnerService.hide();

      } catch (ext) {
        // console.log(ext);
      }
    },
    error: err => {
      // console.log(err);
      this.ngxSpinnerService.hide()
    }
    }
    );
    }
    else {
    this.toast.error("Please Select Start and End Date")
    }

}

// loadPageData(event) { 

// const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
// const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
// switch (event.eventType) {
// case "PageChange":
// this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
// let requestData = [];
// requestData.push({
// "Key": "APIType",
// "Value": "GetReservationReportList"
// })
// requestData.push({
// "Key": "LocationCode",
// "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
// })
// requestData.push({
// "Key": "StartDate",
// "Value": startformattedDate == null || startformattedDate == undefined ? "0" : startformattedDate
// })
// requestData.push({
// "Key": "EndDate",
// "Value": endformattedDate == null || endformattedDate == undefined ? "0" : endformattedDate
// })

// requestData.push({
// "Key": "PageNo",
// "Value": event.eventDetail.pageIndex + 1
// });
// requestData.push({
// "Key": "PageSize",
// "Value": event.eventDetail.pageSize
// });

// requestData.push({
// "Key": "CallType",
// "Value": this.CallType == null || this.CallType == undefined ? "" : this.CallType
// })
// requestData.push({
// "Key": "ConnectDisposition",
// "Value": this.ConnectDisposition == null || this.ConnectDisposition == undefined ? "" : this.ConnectDisposition
// })


// let strRequestData = JSON.stringify(requestData);
// let contentRequest =
// {
// "content": strRequestData
// };
// this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
// {
//   next: (Value) => {
//     try {
//       let response = JSON.parse(Value.toString());
//       if (response.ReturnCode == '0') {
//         let data = JSON.parse(response?.ExtraData);
//         this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.ReportData?.Report });
       
//       }
//     } catch (ext) { 
//       console.log(ext);
//     }
//   },
//   error: err => {
//     console.log(err);
//   }
// }
// );
// break;
// }
// setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
// }


getReportData(eventDetail) { 
  this.results = []
  const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
  const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
  if ((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined)) {
  {
  let requestData = []
  this.ngxSpinnerService.show();
  requestData.push({
    "Key": "APIType",
    "Value": "GetReservationReportList"
  })
  requestData.push({
    "Key": "LocationCode",
    "Value": this.LocationData == null || this.LocationData == undefined ? '' : this.LocationData
  })
  requestData.push({
    "Key": "ServiceRefNo",
    "Value": this.ServiceRefNo == null || this.ServiceRefNo == undefined ? '' : this.ServiceRefNo
    })
  requestData.push({
    "Key": "ReservationType",
    "Value": this.ReservationType == null || this.ReservationType == undefined ? '' : this.ReservationType
  })
  requestData.push({
    "Key": "ReservationCode",
    "Value": this.ReservationCode == null || this.ReservationCode == undefined ? '' : this.ReservationCode
  })
  requestData.push({
    "Key": "ReservationStatus",
    "Value": this.ReservationStatus == null || this.ReservationStatus == undefined ? '' : this.ReservationStatus
  })
  requestData.push({
    "Key": "CaseId",
    "Value": this.CaseIdData == null || this.CaseIdData == undefined ? "" : this.CaseIdData
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
    "Key":"PageNo",
    "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
  });
  requestData.push({
    "Key":"PageSize",
    "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
  });
  console.log("Request ", requestData);

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
          console.log("======",data)
          if (Array.isArray(data?.ReportData?.ReservationReport)) {
            this.results = data?.ReportData?.ReservationReport  

              this.results.forEach( item =>{
                // const DispostionObj = this.DispositionDD.Data.find( DD=>  DD.Id == item.ConnectDisposition)
                // if (DispostionObj) {
                //   item.ConnectDispositionText = DispostionObj.TEXT;
                // } else {
                //   item.ConnectDispositionText = "Unknown"; 
                // }
              })

              
            }
            else {
              this.results.push(data?.ReportData?.ReservationReport) 
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
    else {
    this.toast.error("Please Select Start and End Date")
    }
  }
  PageChange( event){    
    switch(event.eventType){
      case "PageChange":
        this.getReportData(event.eventDetail  )
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

}
