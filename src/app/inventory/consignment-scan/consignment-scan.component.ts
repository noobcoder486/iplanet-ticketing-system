import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import xml2js from 'xml2js';
import { Columns } from 'src/app/models/column.metadata';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-consignment-scan',
  templateUrl: './consignment-scan.component.html',
  styleUrls: ['./consignment-scan.component.css']
})
export class ConsignmentScanComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationCode: string;
  LocationObject: any[] = []
  SAPPlantCode: any;
  pageSize : number = 10; // Number of items per page
  currentPage = 1; // Current page number
  pageCount: number; 
  SAPStorageLocation: any;
  StartDate:any;
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  EndDate:any;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  jobPagination: PaginationMetaData;
  CashDepositCode: string;
  ErrorList: any[] = [];

  // GSX Variables 
  invoiceStockData: any[] = [];
  selectedStockData: any[] = [];
  SerialNo: string = '';
  MaterialCode: string ='';
  showAllRows: boolean ;
  isExport: boolean = false
  selectedFileName
  isApproverPermission = false
  // Location Stock 
  uniqueLocations: any
  errorMessage
  LocationStockData : any[] =[]
  results: any[] =[]
  SearchSerialNo: string 
  isReport = false
  columns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "MaterialCode", title: "Material Code" },
    { datatype: "STRING", field: "RegistryDocType", title: "Registry Doc Type" },
    { datatype: "STRING", field: "SerialNo", title: "Serial No" },
    { datatype: "STRING", field: "ValidationStatus", title: "Validation Status" },
    { datatype: "DATE", field: "CreatedDate", title: "Date" },
    { datatype: "STRING", field: "WeekNo", title: "Week Number" }
  ];
  
  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[] = [
    // { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];

  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
    private http : HttpClient
  ) {     
    this.jobPagination = new PaginationMetaData(); }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.checkLocalPermission()
    this.GetInwardOutwardRegistryList('')
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
        this.ngxSpinnerService.hide()
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }




checkLocalPermission() {
  let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
  console.log("Permissions ", allPermision)
  let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
  console.log("Data Local Approver Permissions ", resp)
  
  if(resp?.View == true){
    this.isApproverPermission = true;
  }
  
  return resp != undefined && resp?.View ? true : false;
}  


actionEmit(event) {
  if (event.action == 'EDIT') {
    
  }
}

  // getLocationData() {
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "GetLocationObject"
  //   });

  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "LocationCode",
  //     "Value": this.LocationCode
  //   });
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   console.log("Before Location SP ",requestData)
  //   this.ngxSpinnerService.show()
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         this.ngxSpinnerService.hide()
  //         let response = JSON.parse(value.toString());
  //         if (response.ReturnCode == '0') {
  //           let data = JSON.parse(response.ExtraData)?.Location;
  //           console.log("After SP Response ", data)
  //           this.LocationObject.push(data)
  //           this.SAPStorageLocation = this.LocationObject[0]?.SAPStorageLocation
  //           this.SAPPlantCode = this.LocationObject[0]?.SAPPlantCode
  //         }
  //         else {
  //           console.log("error");
  //         }
  //         this.invoiceStockData = []
  //       },
  //       error: err => {
  //         this.invoiceStockData = []
  //         this.ngxSpinnerService.hide()
  //         console.log(err);
  //       }
        
  //     });
  // }
  
  GetInwardOutwardRegistryList(eventDetail) {
    this.ngxSpinnerService.show()
    let requestdata = []
    this.isReport = false
    
    requestdata.push({
      "Key":"ApiType",
      "Value":"GetInwardOutwardRegistryList"
    })
    requestdata.push({
      "Key":"LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    })
    requestdata.push({
      "Key":"MaterialCode",
      "Value":this.MaterialCode == null || this.MaterialCode == undefined?'':this.MaterialCode
    })
    requestdata.push({
      "Key":"SerialNo",
      "Value": this.SearchSerialNo == null || this.SearchSerialNo == undefined ? '' : this.SearchSerialNo
    })
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    requestdata.push({
      "Key":"StartDate",
      "Value":startformattedDate
    })
    requestdata.push({
      "Key":"EndDate",
      "Value":endformattedDate
    })
    
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxSpinnerService.hide()
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData)
              console.log("Data is ", data)
              if (data.Totalrecords == "0"){
                this.toast.error("No Data Found")
                this.detail.next({ totalRecord: data?.Totalrecords, Data: '' })
                return
              }
              let ExtraData =[]
              if( Array.isArray(data.RegistryList?.RegistryRow) ) {
                ExtraData = data.RegistryList?.RegistryRow;
              }
              else{
                ExtraData.push(data.RegistryList?.RegistryRow)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: ExtraData })
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

  PageChange( event){    
    switch(event.eventType){
      case "PageChange":
        if ( this.isReport == false ){
          this.GetInwardOutwardRegistryList(event.eventDetail)
        }
        else{
          this.getReportData(event.eventDetail)
        }
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }
    
  VerifyStock(docType ) {

    if( (this.MaterialCode == null || this.MaterialCode == undefined || this.MaterialCode =='' ) && docType == 'GSX')
    {
      this.toast.error("Enter Material Code ")
      return
    }
    if(this.LocationCode == null || this.LocationCode == undefined || this.LocationCode =='' )
    {
      this.toast.error("Enter Location ")
      return
    }
    if(this.SerialNo == null || this.SerialNo == undefined || this.SerialNo =='' )
    {
      this.toast.error("Enter Serial No")
      return
    }
    
    let requestData =[];
    
    requestData.push({
      "Key":"APIType",
      "Value": "VerifyInwardOutwardRegistryBulk"
    });
    requestData.push({
      "Key":"Data",
      "Value":  this.stockXML(docType)
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content" : strRequestData
    }; 

    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next : (Value) =>
        {
          try{
            
            this.ngxSpinnerService.hide()
            let response = JSON.parse(Value.toString());
            if(response.ReturnCode =='0')
            {
              this.MaterialCode = null; 
              this.SerialNo = null 
              this.LocationCode = null 
              let data = JSON.parse(response?.ExtraData);
              this.toast.success('Inward Outward Registry Verified Successfully');
            }
          }catch(ext){
            this.ngxSpinnerService.hide()
            console.log(ext);
          }
        },
        error : err =>
        {
          this.ngxSpinnerService.hide()
          console.log(err);
        }
      }
    );
  }

  stockXML(docType) {
    let rawData = {
      "rows": []
    }
    rawData.rows.push({
      "row": {
        "CompanyCode" :glob.getCompanyCode(),
        "RegistryDocType" :  docType,
        "MaterialCode": this.MaterialCode == null || this.MaterialCode == undefined ? "" : this.MaterialCode,
        "LocationCode": this.LocationCode,
        "SerialNo": this.SerialNo,
      }
    })

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  
  GetLocationList(locationcode, locationname, mobilenumber, emailId) {
    this.ngxSpinnerService.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetLocationList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationName",
      "Value": locationname
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": locationcode
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": mobilenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": emailId
    });
    
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "100"
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
              let results = []
              if(Array.isArray(data?.LocationList?.Location))
              {
                results = data?.LocationList?.Location
              }
              else
              {
                results.push(data?.LocationList?.Location)
              }
              
              for ( let item of results){
                let locExists = this.uniqueLocations.has(item.SAPPlantCode)
                locExists ? this.LocationStockData.push(item) : ''
              }
              console.log(" locations" , this.LocationStockData)
              this.ngxSpinnerService.hide()
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
  }


  selectFile() {
    // Trigger the hidden file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  async FileUploadStock(event: any) {
    const shouldContinue = confirm("Are you sure you want to continue")
    if( shouldContinue == false){
      return
    }
    
    const file = event.target.files[0];
    if (file) {
      
      this.selectedFileName= file.name;
      let formData = new FormData();
      var filename = file.filename;
      console.log("File ",file);
      formData.append('file', file, filename);
      this.isApproverPermission == true ? formData.append('ApiType', 'SaveInwardOutwardRegistryBulk') :  formData.append('ApiType', 'VerifyInwardOutwardRegistryBulk');
      this.isApproverPermission == true ? formData.append('Module', 'SaveInwardOutwardRegistryBulk') :  formData.append('Module', 'VerifyInwardOutwardRegistryBulk');
      this.errorMessage = "";
      this.ngxSpinnerService.show();
      this.dynamicService.saveExcelData(formData).subscribe(
        {
          next: (value) => {
            event.target.value = null; 
            try {
              this.ngxSpinnerService.hide();
              let response = JSON.parse(JSON.stringify(value));
              console.log('Response:', response);
                if (response) {
                  let data = JSON.parse(response.ExtraData);
                  console.log('Data:', data);
                  
                  if (response.ReturnCode == '0') {
                      
                      if (this.isApproverPermission == true ) this.toast.success('Inward Outward Registry Uploaded Successfully') 
                      else{      
                          if ( data?.InwardOutwardRegistry == undefined  )
                            this.toast.error('No Serial No from the excel has been verified...')
                          else{
                            let VerifiedList =[]
                            Array.isArray( data?.InwardOutwardRegistry) ? VerifiedList= data.InwardOutwardRegistry : VerifiedList =[data?.InwardOutwardRegistry]
                            this.toast.success(response?.ReturnMessage);
                          }
                      }
                      
                  }
                  else {
                    console.log("Error Response: " , response)
                    let errorMessage = response.ErrorMessage;
                    this.toast.error(errorMessage);
                     const parser = new xml2js.Parser({ strict: false, trim: true });
                     parser.parseString( errorMessage, (error, result) => {
                       const errorMessages = result.ERRORMESSAGEROW.ERRORMESSAGE;
                       console.log("Messages : " ,errorMessages)
                       errorMessages.forEach((errorMessage) => {
                         console.log("Error Message: " , error)
                         this.toast.error(errorMessage.ERRORMESSAGE);
                       });
                     }); 
                  }
                }
              }
              catch (ext) {
                this.ngxSpinnerService.hide();
                console.log(ext);
              }
          },
          error: err => {
            
            event.target.value = null; 
            this.ngxSpinnerService.hide();
            event.target.value = null; 
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toast.error("Error:-  " + message);
              } else {
                this.toast.error("Error parsing the error message.");
              }
            });
          }
      })
    }
  }

  downloadSampleFile()
  { 
    const fileUrl =  glob.GLOBALVARIABLE.SERVER_LINK + 'upload/Formats/InwardOutwardRegistryUpload.xlsx'; 
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'InwardOutwardRegistryUpload.xlsx';   
      a.click(); 
      window.URL.revokeObjectURL(a.href);
    });
  }



  getMaterialCodeXML(data: any[]) {
    let rawData = {
      "rows": []
    }
    for (let item of data) {

      rawData.rows.push({
        "row": {
          "MaterialCode": item.Material
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  

  filterData() {
    if (this.SerialNo == '' && this.MaterialCode == '') {
      this.showAllRows = true;
    } else {
      this.showAllRows = false;
    }
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
          "Value":"ExportRegistryReportList"
        })
        requestData.push({
          "Key":"LocationCode",
          "Value":this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
        })
        requestData.push({
          "Key":"MaterialCode",
          "Value":this.MaterialCode == null || this.MaterialCode == undefined?'':this.MaterialCode
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

  getReportData(eventDetail)
  {
    this.results = []
    const startformattedDate = this.datePipe.transform(this.StartDate, 'yyyy-MM-dd');
    const endformattedDate = this.datePipe.transform(this.EndDate, 'yyyy-MM-dd');
    if((this.StartDate != null || this.StartDate != undefined) && (this.EndDate != null || this.EndDate != undefined ))
    {
        this.isReport = true
        {
          let requestData = []
          this.ngxSpinnerService.show();
          requestData.push({
            "Key":"APIType",
            "Value":"GetRegistryReportList"
          })
          requestData.push({
            "Key":"LocationCode",
            "Value":this.LocationCode == null || this.LocationCode == undefined?'':this.LocationCode
          })
          requestData.push({
            "Key":"MaterialCode",
            "Value":this.MaterialCode == null || this.MaterialCode == undefined?'':this.MaterialCode
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
            "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1 
          });
          requestData.push({
            "Key": "PageSize",
            "Value": eventDetail.pageSize== null ||  eventDetail.pageSize== undefined ? "10" :  eventDetail.pageSize
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
                  
                this.ngxSpinnerService.hide()

                  let response = JSON.parse(Value.toString());
                  if (response.ReturnCode == '0') {
                    let data = JSON.parse(response?.ExtraData)
                    console.log("Data is ", data)
                    if (data.Totalrecords == "0"){
                      this.toast.error("No Data Found")
                      this.detail.next({ totalRecord: data?.Totalrecords, Data: '' })
                      return
                    }
                    let ExtraData =[]
                    if( Array.isArray(data.RegistryList?.RegistryRow) ) {
                      ExtraData = data.RegistryList?.RegistryRow;
                    }
                    else{
                      ExtraData.push(data.RegistryList?.RegistryRow)
                    }
                    this.detail.next({ totalRecord: data?.Totalrecords, Data: ExtraData })
                  }
                } catch (ext) {
                this.ngxSpinnerService.hide()

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




  StockXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.invoiceStockData) {
      count += 1
      rawData.rows.push({
        "row": {
          "Batch":item.Batch,
          "Equipment":item.Equipment ,
          "InventoryStockType":item.InventoryStockType,
          "ItemType":item.ItemType ,
          "Material":item.Material ,
          "MaterialName":item.MaterialName ,
          "Plant":item.Plant ,
          "SerialNumber":item.SerialNumber ,
          "StorageLocation" :item.StorageLocation
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log( xml)
    return xml;
  }


}