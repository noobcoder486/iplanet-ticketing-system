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
import { Onsite } from '../onsite.metadata';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { HttpClient } from '@angular/common/http';
import { Columns } from 'src/app/models/column.metadata';

@Component({
  selector: 'app-onsite-process-list',
  templateUrl: './onsite-process-list.component.html',
  styleUrls: ['./onsite-process-list.component.css']
})
export class OnsiteProcessListComponent implements OnInit {


  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  RepairId: string;
  OnsiteStatus: string;
  LocationCode: string;
  breadCumbList: any[];
  toolBarAction: any[] = [];
  OnsiteStatusDD:string[]= ['NEW', 'SERIALNOUPDATED', 'GRPOCOMPLETED']
  Ship_to_GSX: string;
  selectedCallForm:string;
  errorMessage: string;
  isApproverPermission = false
  submitClicked= false 

  //Incoming Invoice
  OnsiteList : Onsite[] =[]
  Remark: string
  StartDate:any;
  EndDate:any;
  StartTime
  EndTime
  IsSerialNoExists : boolean = true
  selectedFileName: string | null = null;
  maxDate : Date
  ExportStartDate:any;
  ExportEndDate:any;
  // Toggle Page Number 
  pageSize : number = 10; 
  pageIndex = 0 
  pageCount: number; 
  ErrorList: any[] = [];
  UpdatedpageSize: number=10;
  Spinner = false
  TotalRecords: number = 0
  currentRange
  TotalPages: number = 0
  CurrentPage: number 
  @ViewChild('callUpdateDialog') callUpdateDialog: TemplateRef<any>;

  // Enable Invoice Pop Up
  hideCashEnablePopUp: boolean = true;
  ReasonForUnlock: string 
  selectAll: boolean = false;
  MultipleLocationCode: any[] =[];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actionDetails: any[]=[
    {"code": "VIEW","icon": "remove_red_eye","title": "View Reservation"},
  ];
  // columns: Columns[] = [
  //   { datatype: "STRING", field: "repairId", title: "Repair Id" },
  //   { datatype: "STRING", field: "repairStatusDescription", title: "Repair Status Description" },
  //   { datatype: "STRING", field: "repairTypeDescription", title: "Repair Type Description" },
  //   { datatype: "STRING", field: "customer.primaryPhone", title: "Customer Mobile No" },
  //   { datatype: "STRING", field: "customer.firstName", title: "Customer First Name" },
  //   { datatype: "STRING", field: "customer.lastName", title: "Customer Last Name" },
  //   { datatype: "STRING", field: "customer.emailAddress", title: "Customer Email Address" },
  //   { datatype: "STRING", field: "device.productName", title: "Product Name" },
  //   { datatype: "STRING", field: "repairCreatedOnDate", title: "Repair CreatedOnDate" },
  // ];
  columns: Columns[] = [
    { datatype: "STRING", field: "ReservationCode", title: "Reservation Code" },
    { datatype: "STRING", field: "RepairId", title: "Repair Id" },
    { datatype: "STRING", field: "CustomerFirstName", title: "Customer First Name" },
    { datatype: "STRING", field: "CustomerLastName", title: "Customer Last Name" },
    { datatype: "STRING", field: "CustomerMobileNo", title: "Customer Mobile No" },
    { datatype: "STRING", field: "ReservationStatusDesc", title: "Reservation Status" },
    { datatype: "STRING", field: "ReservationType", title: "Reservation Type" },
    { datatype: "STRING", field: "ProblemOrRemark", title: "Reservation Remark" },
    { datatype: "DATE", field: "ReservationDate", title: "Reservation Date" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "ServiceRefNo", title: "Service Ref No" },
  ];
  
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
    private http : HttpClient
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.GetOnsiteList('')
    this.checkLocalPermission()
    this.maxDate = new Date()
    // this.getRepairDetails('D639680340')

  }

  options: number[] = [5, 10, 20, 50 ];
  selectedOption: string;
  actionEmit(event){
    console.log("action Emit", event);
    if(event.action == 'VIEW'){ 
      this.route.navigate(['/auth/' +glob.getCompanyCode() + '/reservation/'], {queryParams: { rc:event.row.ReservationCode , rt : 'RESV'}})
    }  
  }

  getRepairDetails() {
    let searchData = { "repairId": this.RepairId };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = "CBE5"
    var CompanyCode = glob.getCompanyCode()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
    {
      next: (value) => {
        
        let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.toast.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
            var errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
          }
          else {
          this.OnsiteList.push(response)
          console.log("OnsiteList ", this.OnsiteList);
          this.OnsiteList = this.OnsiteList.map( item => this.mapColumnNames(item))
          this.detail.next({ totalRecord: this.OnsiteList.length , Data: this.OnsiteList });
          }
        },
        error: (err) => {
          this.submitClicked= false 
          this.Spinner = false
          this.ngxSpinnerService.hide()
          console.log(err);
          this.toast.error("Please try again. " + err , "Error", { closeButton: true, disableTimeOut: true })
          this.ngxSpinnerService.hide()
        }
      })
  };
  
  mapColumnNames(item: any): any {
    const mappedItem: any = { ...item };
    if (item.customer) {
        mappedItem['customer.primaryPhone'] = item.customer.primaryPhone;
        mappedItem['customer.firstName'] = item.customer.firstName;
        mappedItem['customer.lastName'] = item.customer.lastName;
        mappedItem['customer.emailAddress'] = item.customer.emailAddress;
    }
    if (item.device) {
        mappedItem['device.productName'] = item.device.productName;
    }
    return mappedItem;  
  }
  openReservation(){
    this.route.navigate(['/auth/' +glob.getCompanyCode() + '/reservation/'], {queryParams: { rt: 'DREPAIR' }})
  }

  SaveJobDetails(onsiteObj : Onsite) {
    // this.isVerification = $event;

    // if (this.isVerification == true) {
      // const secondform = this.secondFormGroup.value
      const defaultEmptyString = (value) => value == undefined || value == null ? '' : value.toString();
      const defaultZero = (value) => value == undefined || value == null ? 0 : value;
    
      
      let RequestAddProduct = [];
      RequestAddProduct.push({
        "Key": "ApiType",
        "Value": "SaveJobDetails"
      });
      RequestAddProduct.push({
        "Key": "ReservationGUID",
        "Value": '00000000-0000-0000-0000-000000000000' 
      })
      RequestAddProduct.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      RequestAddProduct.push({
        "Key": "JobType",
        "Value": 'ONSITE'
      });
     RequestAddProduct.push({
        "Key": "TokenNumber",
        "Value":  ''
      });
      RequestAddProduct.push({
        "Key": "TokenDate",
        "Value":'1900-01-01'
      });
      RequestAddProduct.push({
        "Key": "CounterNumber",
        "Value": '' 
      });
      RequestAddProduct.push({
        "Key": "PRODUCTTYPE",
        "Value": 'SERIALIZED'
      });
      RequestAddProduct.push({
        "Key": "SerialNo1",
        "Value": onsiteObj.device.identifiers.serial
      });
      RequestAddProduct.push({
        "Key": "imei",
        "Value": defaultEmptyString(onsiteObj.device.identifiers?.imei)
      });
      RequestAddProduct.push({
        "Key": "TableReplacement",
        "Value": "NO"
      });
      RequestAddProduct.push({
        "Key": "DataBackup",
        "Value": "NO"
      });
      RequestAddProduct.push({
        "Key": "meid",
        "Value": defaultEmptyString(onsiteObj.device.identifiers?.meid)
      });
      RequestAddProduct.push({
        "Key": "productDescription",
        "Value": onsiteObj.device.productName
      });
      // RequestAddProduct.push({
      //   "Key": "RetailCustomerCode",
      //   "Value": this.CustomerCode
      // });
      RequestAddProduct.push({
        "Key": "LocationCode",
        "Value": this.LocationCode
      });
      RequestAddProduct.push({
        "Key": "ConfigurationCode",
        "Value": defaultEmptyString(onsiteObj.device?.configCode)
      });
      RequestAddProduct.push({
        "Key": "ConfigurationDescription",
        "Value": defaultEmptyString(onsiteObj.device?.configDescription)
      });
      RequestAddProduct.push({
        "Key": "PurchaseCountryCode",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.purchaseCountryCode)
      });
      RequestAddProduct.push({
        "Key": "PurchaseCountryDesc",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.purchaseCountryDesc)

      });
      RequestAddProduct.push({
        "Key": "SoldToName",
        "Value": defaultEmptyString(onsiteObj.device?.soldToName)
      });
      // pending
      RequestAddProduct.push({
        "Key": "ActivationDate",
        "Value": ''

      });
      RequestAddProduct.push({
        "Key": "POPDate",
        "Value":''
      });
      RequestAddProduct.push({
        "Key": "CoverageStartDate",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.purchaseDate)
        // "Value": this.product.CoverageStartDate == undefined || this.product.CoverageStartDate == null ? null : this.product.CoverageStartDate
      });
      RequestAddProduct.push({
        "Key": "CoverageEndDate",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.coverageEndDate)
        // "Value": this.storeVa16 == undefined ? "" : this.storeVa16
      });
      RequestAddProduct.push({
        "Key": "GSXWarrantyStatusCode",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.warrantyStatusCode)
        // "Value": this.product.GsxWarrantyStatusCode == undefined ? "" : this.product.GsxWarrantyStatusCode

      });
      RequestAddProduct.push({
        "Key": "GSXWarrantyStatusDesc",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.warrantyStatusDescription)
        // "Value": this.product.GsxWarrantyStatusDescription == undefined ? "" : this.product.GsxWarrantyStatusDescription
      });
      RequestAddProduct.push({
        "Key": "deviceCoverageDetails",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.deviceCoverageDetails)
        // "Value": this.product.DeviceCoverageDetails == undefined ? "" : Array.isArray(this.product.DeviceCoverageDetails) ? this.product.DeviceCoverageDetails.toString() : this.product.DeviceCoverageDetails
      });
      RequestAddProduct.push({
        "Key": "ProductImageURL",
        "Value": defaultEmptyString(onsiteObj.device?.productImageURL)
        // "Value": this.product.ImageUrl == undefined ? "" : this.product.ImageUrl

      });
      RequestAddProduct.push({
        "Key": "ElsStatus",
        "Value": '' //  defaultEmptyString(onsiteObj.device?.productImageURL)
        // "Value": this.product.ElsStatus == undefined ? "" : this.product.ElsStatus
      });
      //pending 
      RequestAddProduct.push({
        "Key": "ComplainDesc",
        "Value": '' //  defaultEmptyString(onsiteObj.device?.productImageURL)
        // "Value": this.product.CustomerVoice == undefined ? "" : this.product.CustomerVoice
      });
      RequestAddProduct.push({
        "Key": "Remark",
        "Value": '' //  defaultEmptyString(onsiteObj.device?.productImageURL)
        // "Value": this.product.CREVoice == undefined || this.product.CREVoice == null ? "" : this.product.CREVoice        
      });
        RequestAddProduct.push({
          "Key": "CustomerCompanyName",
          "Value": '' //  defaultEmptyString(onsiteObj.device?.productImageURL)
          // "Value": this.product.CustomerCompanyName == null || this.product.CustomerCompanyName == undefined ? "" : this.product.CustomerCompanyName
        });
        RequestAddProduct.push({
          "Key": "EstimatedServiceCharges",
          "Value": 0
        });
        RequestAddProduct.push({
          "Key": "MembershipCardNo",
          "Value": ''
        });
        RequestAddProduct.push({
          "Key": "SecurityNo",
          "Value": ''
        });
        RequestAddProduct.push({
          "Key": "EstimatedPartsCost",
          "Value": 0
        });  
        RequestAddProduct.push({
          "Key": "PouchNo",
          "Value": ''
        });

      // RequestAddProduct.push({
      //   "Key": "Attachment",
      //   "Value": this.getImagePath()
      // });
      RequestAddProduct.push({
        "Key": "JobStatus",
        "Value": "S01"
      });
      RequestAddProduct.push({
        "Key": "laborCovered",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.laborCovered)
        // "Value": this.product.LaborCovered == false || this.product.LaborCovered == undefined ? 0 : 1
      });
      RequestAddProduct.push({
        "Key": "partCovered",
        "Value": defaultEmptyString(onsiteObj.device?.warrantyInfo?.partCovered)
        // "Value": this.product.PartCovered == false || this.product.PartCovered == undefined ? 0 : 1

      });
      RequestAddProduct.push({
        "Key": "BillingOption",
        "Value": 'Billable'
      });

      //Quetions 
      // RequestAddProduct.push({
      //   "Key": "JobChecklistDetails",
      //   "Value": this.ConvertObjectIntoXml()
      // });
      let strRequestData = JSON.stringify(RequestAddProduct);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Request ", RequestAddProduct)
      alert("UAT Testing Return on ")
      return
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toast.success("Form Submitted Successfully")
            var result = JSON.parse(response.ExtraData);
            let CaseGUID = result.CaseGUID;
            let CaseId = result.CaseId;
            // this.saveCasaJobLead(CaseGUID)
            this.route.navigateByUrl('auth/' + glob.CompanyCode + '/repair-process?guid=' + CaseGUID)
          }
          else {
            
            this.errorMessage = response.ReturnMessage;
            console.log("Error ", response)
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.checkvalidation(response)
            });

            let errorMessage = response.ErrorMessage;
            const parser2 = new xml2js.Parser({ strict: false, trim: true });
            parser2.parseString( errorMessage , (error, result) => {
              const errorMessages = result.ERRORLIST.ERRORMESSAGE;
              console.log("Messages : " ,errorMessages)
              errorMessages.forEach((errorMessage) => {
                console.log("Error Message: " , error)
                this.toast.error(errorMessage.ERRORMESSAGE);
              });
            });  
          }
        },
        error: err => {
          console.log(err)
        }

      });


      // this.isverificationPopup = false;
    // }
    // else {
    //   return;

    // }

  }
  
  // getImagePath() {
  //   ;
  //   let rowsDataValue = {
  //     "rows": []
  //   }
  //   for (let StoreImage of this.UploadedImageList) {

  //     rowsDataValue.rows.push({
  //       "row": {
  //         "AttachmentOriginType": "JOBCREATION",
  //         "AttachmentType": "Image",
  //         "AttachmentFile": StoreImage.AttachmentFile,
  //         "CloudFlag" : "1"
  //       }
  //     })
  //   }
  //   rowsDataValue.rows.push({
  //     "row": {
  //       "AttachmentOriginType": "JOBCREATION",
  //       "AttachmentType": "SIGNATURE",
  //       "AttachmentFile": this.SignatureFileName,
  //       "CloudFlag" : "1"
  //     }
  //   })
  //   rowsDataValue.rows.push({
  //     "row": {
  //       "AttachmentOriginType": "JOBCREATION",
  //       "AttachmentType": "AUTHSIGNATURE",
  //       "AttachmentFile": this.AuthSignatureFileName,
  //       "CloudFlag" : "1"
  //     }
  //   })
  //   var builder = new xml2js.Builder();
  //   var xml = builder.buildObject(rowsDataValue);
  //   xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //   return xml;
  // }

  // ConvertObjectIntoXml() {

  //   let rawData = {"rows": [] }
  //   for (let item of this.checklistTotalvalues) {

  //     var questions = item.ChecklistDescription;
  //     var answer = item.answer;

  //     rawData.rows.push({
  //       "row": {
  //         "question": questions,
  //         "answer": answer
  //       }
  //     });
  //   }
  // }
  checkvalidation(response: any) {
    
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    let validationMessage = errror[0]
    if (validationMessage.includes("Tag Already Created For Serial No")) {
      this.toast.error("Serial number Already Exist")
    }
  }

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    
    if(resp?.View == true){
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }

  PageChange( event){    
    switch(event.eventType){
      case "PageChange":
        this.GetOnsiteList(event.eventDetail)
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

  exportReportData()
  {
    const startformattedDate = this.datePipe.transform(this.ExportStartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.ExportEndDate, 'yyyy-MM-dd');
    // this.results = []
    if((this.ExportStartDate != null || this.ExportStartDate != undefined) && (this.ExportEndDate != null || this.ExportEndDate != undefined ))
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
          "Key": "RepairId",
          "Value": this.RepairId == null || this.RepairId == undefined ? "" : this.RepairId
        })
        requestData.push({
          "Key": "OnsiteStatus",
          "Value": this.OnsiteStatus == null || this.OnsiteStatus == undefined ? "" : this.OnsiteStatus
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
                let response = JSON.parse(Value.toString());
                const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
                var blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
                var url = URL.createObjectURL(blob);
                window.open(url);
                this.ngxSpinnerService.hide()

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



  GetOnsiteList(eventDetail) {
    // if (this.LocationCode== null || this.LocationCode == undefined || this.LocationCode == '' ){
    //   this.toast.error("Please select a Location");
    //   return;
    // }
    //  
    this.OnsiteList = []
    this.Spinner = true
    let requestdata = []
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetOnsiteList"
    })
    requestdata.push({
      "Key":"RepairId",
      "Value": this.RepairId == null || this.RepairId == undefined ? '' : this.RepairId
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key": "ReservationStatus",
      "Value": this.OnsiteStatus == null || this.OnsiteStatus == undefined ? '' : this.OnsiteStatus
    });
    requestdata.push({
      "Key":"PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined? "1": eventDetail.pageIndex + 1 
    });
    requestdata.push({
      "Key":"PageSize",
      "Value": eventDetail.pageSize== null || eventDetail.pageSize == undefined? "10": eventDetail.pageSize
    });

    let strRequestData = JSON.stringify(requestdata);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.Spinner= true
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          
          try {
            this.Spinner = false
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                return
              }
              this.OnsiteList = Array.isArray(data.ReservationList?.Reservation) ? data.ReservationList?.Reservation : [data.ReservationList?.Reservation]
              this.detail.next({ totalRecord: this.OnsiteList.length , Data: this.OnsiteList });
              this.TotalRecords = data.Totalrecords
              this.pageCount = Math.ceil(data.Totalrecords / this.pageSize)
              this.updateCurrentRange()
            }
          } catch (ext) {
          }
        },
        error: err => {
          this.Spinner = false
          this.Spinner = false
          console.log(err)
        }

      }
    );
  }
  onPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.GetOnsiteList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
    this.updateCurrentRange()
  }
  updateCurrentRange() {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.TotalRecords);
    this.currentRange = `${start} – ${end} of ${this.TotalRecords}`;
  }

  togglePageSize() {
    if (this.UpdatedpageSize == null) {
      this.UpdatedpageSize = 10;
    }
    this.pageSize = this.UpdatedpageSize;
    this.pageIndex = 0; // Reset to the first page when page size changes
    this.GetOnsiteList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    this.updateCurrentRange()
  }

  onNextPages() {
    
    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      this.GetOnsiteList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      this.updateCurrentRange()
    }
  }



  onClick(item)
  {
    
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/incoming-invoice'], {queryParams: {invoiceguid:item.InvoiceGuid}})
  }

  


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.MultipleLocationCode = []
      this.LocationForJob.Data.forEach(item => {
        this.MultipleLocationCode.push(item.Id)
      } );
    } else {
      this.MultipleLocationCode = []
    }
  }


}
