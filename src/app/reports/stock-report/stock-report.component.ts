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
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrls: ['./stock-report.component.css']
})
export class StockReportComponent implements OnInit {

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
  SapLocationDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  sapMaterialDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  jobPagination: PaginationMetaData;
  CashDepositCode: string;
  ErrorList: any[] = [];
  UpdatedpageSize: number=10;

  // GSX Variables 
  sapMaterialList: any[] = [];
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
  SapLocationStockList : any[] =[]
  MaterialData : any[] =[]
  SapLocationColumns: Columns[] = [
    { datatype: "STRING", field: "SerialNumber", title: "Serial Number" },
    { datatype: "STRING", field: "Batch", title: "Batch" },
    { datatype: "STRING", field: "Equipment", title: "Equipment" },
    { datatype: "STRING", field: "LocationCode", title: "Location Code" },
    { datatype: "STRING", field: "LocationName", title: "Location Name" },
    { datatype: "STRING", field: "SerialNo", title: "Serial No" },
    { datatype: "STRING", field: "SAPPlantCode", title: "SAP Plant Code" },
    { datatype: "STRING", field: "SAPStorageLocation", title: "SAP Storage Location" },    
  ];
  
  SapMaterialColumns: Columns[] = [
    { datatype: "STRING", field: "SAPStorageLocation", title: "SAP Storage Location" },    
    { datatype: "STRING", field: "SAPPlantCode", title: "SAP Plant Code" },
    { datatype: "STRING", field: "SearchName", title: "SAP Location Description" },
    { datatype: "STRING", field: "Batch", title: "Batch" },
    { datatype: "STRING", field: "Material", title: "Material Code" },
    { datatype: "STRING", field: "MaterialName", title: "Material Name" },
    { datatype: "STRING", field: "SerialNumber", title: "Serial No" },
  ];

  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[] = [
    {}
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
    this.calculatePageCount();
    this.jobPagination = new PaginationMetaData(); }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.checkLocalPermission()
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

  displayData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.sapMaterialList.length);
    return this.sapMaterialList.slice(startIndex, endIndex);
  }

  calculatePageCount() {
    this.pageCount = Math.ceil(this.sapMaterialList.length / this.pageSize);
  }

  generatePaginationLinks() {
    return Array(this.pageCount).fill(0).map((x, i) => i + 1);

}

options: number[] = [5, 10, 20, 50 ];
selectedOption: string;


onPreviousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.displayData();
  }
}

togglePageSize()
{
  if(this.UpdatedpageSize == null)
  {
    this.UpdatedpageSize = 10
  }
  console.log(this.UpdatedpageSize)
  this.pageSize = this.UpdatedpageSize
  this.displayData()
}

// Function to handle next page
onNextPage() {
  if (this.currentPage < this.pageCount) {
    this.currentPage++;
    this.displayData();
  }
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

  getLocationData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Location SP ",requestData)
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            console.log("After SP Response ", data)
            this.LocationObject.push(data)
            this.SAPStorageLocation = this.LocationObject[0]?.SAPStorageLocation
            this.SAPPlantCode = this.LocationObject[0]?.SAPPlantCode
          }
          else {
            console.log("error");
          }
          this.sapMaterialList = []
        },
        error: err => {
          this.sapMaterialList = []
          this.ngxSpinnerService.hide()
          console.log(err);
        }
        
      });
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
      "Value": "1000"
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
              for ( let loc of results){
                let locExists = this.uniqueLocations.has(loc.SAPPlantCode)
                locExists ? this.SapLocationStockList.push(loc) : ''

                this.MaterialData.forEach( item => {
                  if ( loc.SAPPlantCode == item.Plant){
                    item.LocationCode =  loc.LocationCode,
                    item.LocationName =  loc.LocationName,
                    item.SAPPlantCode =  loc.SAPPlantCode,
                    item.SAPStorageLocation =  loc.SAPStorageLocation
                  }
                })
              }
              
              
              let materialDataFiltered = this.MaterialData.slice(0, 10)
              this.SapLocationDetails.next({ totalRecord: this.MaterialData.length , Data: materialDataFiltered });
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

  PageChange( event, type){    
    switch(event.eventType){
      case "PageChange":
        
        let pageNo = event.eventDetail.pageIndex;
        let pageSize =  event.eventDetail.pageSize
        let startIndex = (pageNo ) * pageSize;
        let filteredData = type == 'MATERIAL' ?  this.MaterialData.slice(startIndex, startIndex + pageSize) : this.sapMaterialList.slice(startIndex, startIndex + pageSize)
        type == 'MATERIAL' ?  
          this.SapLocationDetails.next({ totalRecord: this.MaterialData.length , Data: filteredData }) 
          :  this.sapMaterialDetails.next({ totalRecord: this.sapMaterialList.length , Data: filteredData });
        setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
    }
  }

   getLocationReport(option ) {

    if(this.MaterialCode == null || this.MaterialCode == undefined || this.MaterialCode =='' )
    {
      this.toast.error("Enter Material Code ")
      return
    }
    this.ngxSpinnerService.show()
    let isExportLocation = option

    this.gsxService.getAllLocationData(this.MaterialCode).subscribe({
      next: (response: any) => {
          ;
          
          this.ngxSpinnerService.hide()
          console.log("After Generate SP ",response)
          const err = response.error
          if(err != null && err != undefined){
            console.log("Error Message:- ", err)
            // console.log("Errors:- ", errorJSON)
            if (Array.isArray(err.errorMessage)) {
              this.ErrorList = err.errorMessage
              this.ErrorList.forEach(message=>{
                this.toast.error(message)
              })
            }
            else {
              this.toast.error(err.errorMessage)
            }
            return
          }
          this.sapMaterialList =[]
          console.log("SAP List ",response.d.results)
          if(response.d.results.length ==0 ){
            this.toast.error("No Stock Available at this Location")
            this.SapLocationStockList = []
            return
          }
          let loc =[]
          
          if (Array.isArray(response.d.results)) 
          {
              this.MaterialData = response.d.results
              // this.calculatePageCount();
              for(let item of this.MaterialData )
            {
              delete item.__metadata
            }
            
            this.uniqueLocations = new Set()
            this.MaterialData.forEach(item => {
                this.uniqueLocations.add(item.Plant);
            });
          }
          else {
            this.uniqueLocations.add(response.d.results.Plant)
            this.MaterialData = [response.d.results]
          }

          this.GetLocationList('', '', '', '')

          if ( isExportLocation ) {
            this.exportLocationReportData()
          }
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err)
      }
    })

  }


  getReportData(option)
  {

    if(this.LocationCode != null || this.LocationCode != undefined  )
    {
      {
        
        this.isExport = option
        this.ngxSpinnerService.show()

        this.gsxService.getInvoiceStock(this.SAPPlantCode, this.SAPStorageLocation).subscribe({
          next: (response: any) => {
            
            this.ngxSpinnerService.hide()
            console.log("After Generate SP ",response)
            const err = response.error
            if(err != null && err != undefined){
              console.log("Error Message:- ", err)
              // console.log("Errors:- ", errorJSON)
              if (Array.isArray(err.errorMessage)) {
                this.ErrorList = err.errorMessage
                this.ErrorList.forEach(message=>{
                  this.toast.error(message)
                })
              }
              else {
                this.toast.error(err.errorMessage)
              }
              return
            }
            this.SapLocationStockList =[]
            console.log("SAP List ",response.d.results)
            if(response.d.results.length ==0 ){
              this.toast.error("No Stock Available at this Location")
              this.sapMaterialList = []
              return
            }
            if (Array.isArray(response.d.results)) 
            {
              this.sapMaterialList = response.d.results
              this.calculatePageCount();
              for(let item of this.sapMaterialList)
              {
                delete item.__metadata
              }
              const uniqueItems = this.sapMaterialList.filter((item, index, self) =>
                index === self.findIndex((t) => (
                  t.Material === item.Material
                )))
              this.getInvoiceMaterialName(uniqueItems)
            }
            else {
              this.sapMaterialList.push(response.d.results)
              this.getInvoiceMaterialName(this.sapMaterialList) 
            }
            // this.GetResourceList()
          },
          error: (err) => {
            this.ngxSpinnerService.hide()
            console.log("Error Message:- ", err)
     
          }
        })
      }
    }
    else
    {
      this.toast.error("Please Select a Location")
    }
  
  }

  getInvoiceMaterialName(materialcodearray: any[]) {
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetInvoiceMaterialDetails"
    })
    requestData.push({
      "Key": "InvoiceMaterialDetail",
      "Value": this.getMaterialCodeXML(materialcodearray)
    })
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
              if(Array.isArray(data.InvoiceSalesMaterialDetail))
              {
                for(let item of this.sapMaterialList)
                {
                  item.SearchName =  this.LocationObject[0]?.SearchName
                  item.SAPPlantCode = this.SAPPlantCode
                  item.SAPStorageLocation = this.SAPStorageLocation
                  const matchingIndex = data.InvoiceSalesMaterialDetail.findIndex(obj => obj.MaterialCode == item.Material)
                  if(matchingIndex > -1)
                  {
                    const matchingElement = data.InvoiceSalesMaterialDetail[matchingIndex]
                    item.MaterialName = matchingElement.MaterialName
                    item.isSelected = false;
                    item.ItemType=matchingElement.ItemType;
                  }  
                }
              }
              else
              {
                for(let item of this.sapMaterialList)
                {
                  item.MaterialName = data.InvoiceSalesMaterialDetail.MaterialName
                  item.ItemType=data.InvoiceSalesMaterialDetail.ItemType;
                }
              }

              let filtered = this.sapMaterialList.slice(0, 10)
              this.sapMaterialDetails.next({ totalRecord: this.sapMaterialList.length , Data: filtered });
          
              if ( this.isExport )
                  this.exportReportData()
              }
          } catch (ext) {
          }
        },
        error: err => {
          console.log(err)
        }
      }
    );
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
    
    let filtered 
    if (this.SerialNo == '' && this.MaterialCode == '') {
      // this.showAllRows = true;
      filtered  = this.sapMaterialList.slice(0, 10)
    } else {
      // this.showAllRows = false;
      filtered = this.sapMaterialList.filter( item  =>{
        let serialNumber = item.SerialNumber || ''; 
        let materialCode = item.MaterialCode || ''; 
        return (serialNumber.includes(this.SerialNo) || materialCode.includes(this.MaterialCode));
      })
    }
    this.sapMaterialDetails.next({ totalRecord: this.sapMaterialList.length , Data: filtered });

  }

  exportLocationReportData()
  {
    if(this.LocationCode != null || this.LocationCode != undefined )
    {
      if( this.sapMaterialList.length < 1){
        this.toast.error("No Stock Found!")
        return
      }

      {
        
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportStockReportList"
        })
        requestData.push({
          "Key":"Data",
          "Value": this.StockXML()
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
                
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `Location_Stock_Report_${this.LocationCode}xls`;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                this.ngxSpinnerService.hide();
              } catch (ext) {
                console.log(ext);
              }
              this.isExport  = false
            },
            error: err => {
              this.isExport  = false
              console.log(err);
              this.ngxSpinnerService.hide()
            }
          }
        );
      }
    }
    else
    {
      this.toast.error("Please select a Location")
    }
  
  }


  exportReportData()
  {
    if(this.LocationCode != null || this.LocationCode != undefined )
    {
      if( this.sapMaterialList.length < 1){
        this.toast.error("No Stock Found!")
        return
      }

      {
        
        let requestData = []
        this.ngxSpinnerService.show();
        requestData.push({
          "Key":"APIType",
          "Value":"ExportStockReportList"
        })
        requestData.push({
          "Key":"Data",
          "Value": this.StockXML()
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
                
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                const fileName = `SAP_Stock_Report_${this.LocationCode}xls`;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                this.ngxSpinnerService.hide();

              } catch (ext) {
                console.log(ext);
              }
              this.isExport  = false
            },
            error: err => {
              this.isExport  = false
              console.log(err);
              this.ngxSpinnerService.hide()
            }
          }
        );
      }
    }
    else
    {
      this.toast.error("Please select a Location")
    }
  
  }

  StockXML() {
    let rawData = {
      "rows": []
    }
    let count = 0;
    for (let item of this.sapMaterialList) {
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
          "StorageLocation" :item.StorageLocation,
          "StorageLocationDescription" : this.LocationObject[0]?.SearchName == undefined ? "" : this.LocationObject[0].SearchName ,
          "SAPStorageLocation" : this.SAPStorageLocation
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