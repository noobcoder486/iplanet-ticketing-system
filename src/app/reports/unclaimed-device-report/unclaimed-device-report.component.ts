import { Component, OnInit } from '@angular/core';
import { Columns } from 'src/app/models/column.metadata';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { BehaviorSubject } from 'rxjs';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DatePipe } from '@angular/common';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-unclaimed-device-report',
  templateUrl: './unclaimed-device-report.component.html',
  styleUrls: ['./unclaimed-device-report.component.sass']
})
export class UnclaimedDeviceReportComponent implements OnInit {


  DeliveryChallanNo: any;
  DeliveryChallanStatus: any;
  LocationCode: any;
  ToLocationCode: any;


  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  StartDate: any;
  EndDate: any;
  jobPagination: PaginationMetaData;
  results = [];
  DeliveryChallanStatusDD: DropDownValue = this.getBlankObject();
  DeliveryChallanType: String;


  isChoose: boolean = false;

  columns: Columns[] = [
    { datatype: "STRING", field: "CompanyCode", title: "Company Code" },
    { datatype: "STRING", field: "DeliveryChallanNo", title: "Delivery Challan No" },
    { datatype: "STRING", field: "DeliveryChallanStatus", title: "Delivery ChallanS tatus" },
    { datatype: "STRING", field: "LocationCode", title: "From LocationCode" },
    { datatype: "STRING", field: "ToLocationCode", title: "To LocationCode" },
    { datatype: "STRING", field: "NoOfBoxes", title: "NoOfBoxes" },
    { datatype: "STRING", field: "isShipmentDone", title: "isShipmentDone" },
    { datatype: "STRING", field: "TransportationCarrier", title: "Transportation Carrier" },
    // { datatype: "STRING", field: "ReturnType", title: "ReturnType" },
    { datatype: "STRING", field: "TotalUnitPrice", title: "TotalUnitPrice" },
    // { datatype: "STRING", field: "SealNumber", title: "SealNumber" },
    // { datatype: "STRING", field: "RegistryFrom", title: "RegistryFrom" },
    // { datatype: "STRING", field: "SalesPersonName", title: "SalesPersonName" },
    { datatype: "STRING", field: "CreatedBy", title: "CreatedBy" },
    { datatype: "STRING", field: "CreatedDate", title: "CreatedDate" },
    { datatype: "STRING", field: "LastUpdatedBy", title: "LastUpdatedBy" },
    { datatype: "STRING", field: "LastUpdatedDate", title: "LastUpdatedDate" },

  ]

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }


  constructor(private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
  ) { this.onLocationSearch({ term: "", item: [] });
    this.jobPagination = new PaginationMetaData();
 }

  ngOnInit(): void {
    this.DeliveryChallanType = 'UNCLAIMED'
    this.onLocationSearch({ term: "", item: [] });
    this.onDeliveryChallanStatus({ term: '', item: [] })
  }

  onDeliveryChallanStatus($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanStatus, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.DeliveryChallanStatusDD = value;
          console.log("DeliveryChallan Type ", this.DeliveryChallanStatusDD)
        }
      },
      error: (err) => {
        this.DeliveryChallanStatusDD = DropDownValue.getBlankObject();
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




  getUnclaimedDeviceReport() {
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');


    this.results = [];
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetUnclaimedDevicesReport"
    })

    requestData.push({
      "Key": "DeliveryChallanNo",
      "Value": this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined ? '' : this.DeliveryChallanNo.trim()
    })

    requestData.push({
      "Key": "DeliveryChallanStatus",
      "Value": this.DeliveryChallanStatus == null || this.DeliveryChallanStatus == undefined ? '' : this.DeliveryChallanStatus
    })

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })

    requestData.push({
      "Key": "ToLocationCode",
      "Value": this.ToLocationCode == null || this.ToLocationCode == undefined ? '' : this.ToLocationCode
    })

    requestData.push({
      "Key": "StartDate",
      "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
    })
    requestData.push({
      "Key": "EndDate",
      "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
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
    console.log('contentRequest getUnclaimedDeviceReport' ,contentRequest)

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              
              if (Array.isArray(data.UnclaimedChallanList.Device)) {
                this.results = data.UnclaimedChallanList.Device
              }
              else {
                this.results.push(data.UnclaimedChallanList.Device)
              }
              this.detail.next({ totalRecord: data?.TotalRecords, Data: this.results });
              console.log('this.results', this.results)
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


  loadPageData(event) {
    
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        

        let requestData = []
        requestData.push({
          "Key": "APIType",
          "Value": "GetUnclaimedDevicesReport"
        })


        requestData.push({
          "Key": "DeliveryChallanNo",
          "Value": this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined ? '' : this.DeliveryChallanNo.trim()
        })

        requestData.push({
          "Key": "DeliveryChallanStatus",
          "Value": this.DeliveryChallanStatus == null || this.DeliveryChallanStatus == undefined ? '' : this.DeliveryChallanStatus
        })

        requestData.push({
          "Key": "LocationCode",
          "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
        })

        requestData.push({
          "Key": "ToLocationCode",
          "Value": this.ToLocationCode == null || this.ToLocationCode == undefined ? '' : this.ToLocationCode
        })

        requestData.push({
          "Key": "StartDate",
          "Value": startformattedDate == null || startformattedDate == undefined ? '' : startformattedDate
        })
        requestData.push({
          "Key": "EndDate",
          "Value": endformattedDate == null || endformattedDate == undefined ? '' : endformattedDate
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

                  this.detail.next({ totalRecord: data?.TotalRecords, Data: data.UnclaimedChallanList.Device });
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





  ExportUnclaimedDeviceReport() {


    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');


    if (startformattedDate == null || startformattedDate == undefined || startformattedDate == '') {
      this.toast.error('StartDate  cannot be empty !')
      return
    }
    if (endformattedDate == null || endformattedDate == undefined || endformattedDate == '') {
      this.toast.error('End Date cannot be empty !')
      return
    }


    if (endformattedDate < startformattedDate) {
      this.toast.error('End Date Cannot Be Less Than Start Date')
      return
    }

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ExportUnclaimedDevice"
    })
    requestData.push({
      "Key": "DeliveryChallanNo",
      "Value": this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined ? '' : this.DeliveryChallanNo
    })

     requestData.push({
      "Key": "DeliveryChallanStatus",
      "Value": this.DeliveryChallanStatus == null || this.DeliveryChallanStatus == undefined ? '' : this.DeliveryChallanStatus
    })

    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })

    requestData.push({
      "Key": "ToLocationCode",
      "Value": this.ToLocationCode == null || this.ToLocationCode == undefined ? '' : this.ToLocationCode
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
            const fileName = `Unclaimed_Device_Report_${startformattedDate}_to_${endformattedDate}.xls`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
            // this.ngxSpinnerService.hide();
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
          // this.ngxSpinnerService.hide()
        }
      }
    );
  }





}
