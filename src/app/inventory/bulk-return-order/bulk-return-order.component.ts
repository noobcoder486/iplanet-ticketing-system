import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2,ChangeDetectorRef } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { DatePipe, Location } from '@angular/common'
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { v4 as uuidv4 } from 'uuid';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global';
import { ImagePopupComponent } from 'src/app/custom-components/create-job-customer/image-popup/image-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { element } from 'protractor';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
// import { ImagePopupComponent } from './image-popup/image-popup.component';

@Component({
  selector: 'app-bulk-return-order',
  templateUrl: './bulk-return-order.component.html',
  styleUrls: ['./bulk-return-order.component.css']
})
export class BulkReturnOrderComponent implements OnInit {

  constructor(
    private toastMessage: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private gsxService: GsxService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private sanitizer: DomSanitizer,
    private reportService: ReportService,
    private location: Location,
    private datePipe: DatePipe,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private dialog: MatDialog,
    // private renderer: Renderer2
    private cdr: ChangeDetectorRef,

  ) { }

  isReturnOrderPartSelector: boolean = false;
  partList: any[] = [];
  readData: boolean = true;
  transportationCarrierData: string;
  length: string;
  params: any;
  breadth: string;
  hideShipmentButton: boolean;
  typeSelected = 'ball-clip-rotate';
  Spinner: boolean = false
  height: string;
  trackingNumber: string;
  sealNumber: string;
  weight: string;
  bulkReturnHeaderGUID: string;
  locationData: string;
  returnAddress: string;
  isShipmentDone: string = '0';
  returnOrderPartList: any[] = [];
  finalSelectedElements: any[] = [];
  Ship_to_GSX: string;
  hideSaveButton: boolean = false;
  disableReturnType: boolean = false;
  disableRemarkButton: boolean = true; // Default: true
  showRemarkButton: boolean = false; // Default: false
  hideEwayButton: boolean = true; // Default: false
  selectedCallForm: any;
  selectedLocationCode;
  errorMessage: string;
  IsBulkReturnCreated: boolean = false
  bulkReturnId: string = ''; // Default value
  addedPartCount: any;
  bulkPartSelectorView: any[] = [];
  CountOverPack: any = [];
  OverPackBoxData: any = ['Ind', '1'];
  OverPackBox: any[] = []
  BulkReturnTypeDD: DropDownValue = this.getBlankObject();
  BulkReturnType: string = ''
  // returnTypeArray: any[] = ["Parts-Pending", "Mail-In"];
  printTypeArray: any[] = ["All-Return-Labels", "Packing-List", "Delivery Challan", "E-Way Bill"];
  // returnTypeData: string;
  returnRemark: string;
  printTypeData: string;
  fileType: string;
  trackingUrl: string;
  totalStockPrice: number = 0
  originalTotalStockPrice: number = 0
  TransportationCarrier: DropDownValue = this.getBlankObject()
  changeTrackingURL: boolean = false


  @ViewChild('forShipmentDetails', { static: true }) forShipmentDetails: ElementRef;
  @ViewChild('forEWayDetails', { static: true }) forEWayDetails: ElementRef;
  // For Add Part and Save Buttons
  isEdit: boolean = false; // Default is true
  isHSNChangeAllowed: boolean = false; // Default is true
  fileOptions: boolean // Default is Send for Approval Button
  isApproverPermission: boolean = false
  DeliveryChallanNo: string

  // Image Variables
  isFileUploads = true;
  frontImageList: any = [];
  // Define the number of file to be uploaded
  noOfFilesToUpload = 6;

  // ReturnOrderStatus Value
  ApprovalGUID = '';
  showFileUploadOptions = false;
  showFileButtons = false;
  AddFiles = false;
  // For Status = Rejected  or Approved
  ApprovalStatus: string;
  CreatedDate: Date;

  // E Way Bill:-
  // TransporterDropdown: DropDownValue = DropDownValue.getBlankObject();
  // transporterDropdownData: any ;
  ModeofTransport: DropDownValue = DropDownValue.getBlankObject();
  VehicleType: DropDownValue = DropDownValue.getBlankObject();
  hidePopup: boolean = true
  DistanceInKm: number;
  modeofTransportData: string = ''
  vehicleNumber: string = '';
  vehicleTypeData: string = '';
  transporterDocNo: string = "";
  // @ViewChild('isEWayBillDone', { static: true }) isEWayBillDone: ElementRef;
  EWayBillFlag: boolean = false
  QRData: string;
  EWayBillNo: string;
  EWayBillDate: string;
  EWayValidUpto: string;
  DistinctHSNSACCode: any

  // Vendor
  VendorTypeDD: DropDownValue = this.getBlankObject()
  VendorObject: any[] = []
  VendorCode: string
  VendorStateCode: string;
  // Location 
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationObject: any[] = []
  LocationStateCode: string;

  NoOfBoxes: any;

  // Tote
  ToteList: any[] = [];
  isTotePopUpShow: boolean = false;
  SelectedToteList: any[] = [];

  ngOnInit(): void {




    this.hideShipmentButton = true; // Default hide Shipment Button
    this.showFileUploadOptions = true;
    this.forShipmentDetails.nativeElement.parentElement.classList.remove('disabled-select') // Default Editable Shipment Details
    this.forEWayDetails.nativeElement.parentElement.classList.remove('disabled-select')

    this.fileOptions = true // Default is Send for Approval Button

    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      // Get a list of 5 integer indexes for File Upload List and After Upload to Server List:-
      for (let i = 0; i < this.noOfFilesToUpload; i++) {
        this.FileUploadList[i] = { AttachmentFile: null, src: null, filename: '', type: '' };
        this.UploadedFileList[i] = { AttachmentFile: null, src: null, filename: '', type: '' };
      }
      this.getData()
      this.GetToteListForHeaderGUID();
    }
    else if (Object.keys(this.params).length == 0) {
      this.showFileUploadOptions = false;
      this.AddFiles = true;
      this.ApprovalStatus = 'NEW'
      this.isEdit = true;
    }

    this.onTransportationCarrier({ term: '', items: [] })
    this.onBulkReturnType({ term: "", item: [] });
    this.onLocationSearch({ term: "", item: [] });
    this.UpdateCountOverPack()
    // For E-Way Bill:- 
    this.onModeofTransportSearch({ term: "", item: [] });
    this.onVehicleTypeSearch({ term: "", item: [] });

  }

  // onVendorCodeSearch($event: { term: string; item: any[] }) {
  //   console.log("Return Type ", this.BulkReturnType, "\nLocation ",this.locationData)
  //   if( this.BulkReturnType && this.locationData){
  //     this.dropdownDataService.fetchDropDownData(DropDownType.Vendor4Bulk, $event.term, {
  //       CompanyCode: glob.getCompanyCode().toString(),
  //       LocationCode: this.locationData,
  //       BulkReturnType: this.BulkReturnType
  //     }).subscribe({
  //       next: (value) => {
  //         //  
  //         if (value != null) {
  //           console.log("Vendor response ",value)
  //           this.VendorTypeDD = value;
  //           this.VendorCode = this.VendorTypeDD.Data[0].Id
  //           let extraDataXML = this.VendorTypeDD.Data[0].extraDataXML;
  //           // console.log("Vendor Object  ", extraDataXML); 
  //           console.log("Vendor Object  ",this.VendorTypeDD.Data[0].extraDataXML)
  //           let data = JSON.parse(this.VendorTypeDD.Data[0].extraDataXML)
  //           this.VendorObject= data
  //           // console.log("Vendor Object  ",this.VendorObject)
  //         }
  //       },
  //       error: (err) => {
  //         this.VendorTypeDD = DropDownValue.getBlankObject();
  //       }
  //     });
  //   }
  // }

  ChangeVendor() {
    this.showShipTo()
    this.getVendorData()
    // this.onVendorCodeSearch({ term: '', item: [] })
  }

  getVendorData() {
    if (this.BulkReturnType && this.locationData) {
      let requestData = [];
      this.VendorObject = []
      this.VendorTypeDD = DropDownValue.getBlankObject();

      if (this.params.headerguid == null || this.params.headerguid == undefined) { // To run only on new Bulk Return Creations 
        let index = this.LocationForJob.Data.findIndex(loc => loc.Id == this.locationData)
        if (index != -1) {
          this.Ship_to_GSX = this.LocationForJob.Data[index].extraDataJson.Data.SHIP_TO_GSX[0]
          console.log("Location Data ", this.Ship_to_GSX)
        }
        else {
          console.log("LC ", this.locationData)
          this.toastMessage.error("Location's Ship To not found!")
          return
        }
      }

      requestData.push({
        "Key": "ApiType",
        "Value": "GetVendorDDList"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": this.locationData,
      });
      requestData.push({
        "Key": "BulkReturnType",
        "Value": this.BulkReturnType
      });
      requestData.push({
        "Key": "SearchTerm",
        "Value": '',
      });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Before Sp ", requestData)
      this.Spinner = true
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            this.Spinner = false
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              
              let data = JSON.parse(response.ExtraData)
              console.log("Vendor Object", data)
              if (data?.Totalrecords != "0") {

                let recentBulkReturnObject = data?.BulkReturnList?.BulkReturn
                // Check if Recent (3 days for now) Bulk Returns already exists which have not confirmed the Shipment yet, for NEW bulk returns
                if (recentBulkReturnObject && !this.params.headerguid) {
                  if (Array.isArray(recentBulkReturnObject)) {
                    recentBulkReturnObject.forEach(item => {
                      this.toastMessage.error("Shipment not confirmed for Bulk Return Id " + item.BulkReturnId + ". Kindly first confirm it and then create a new Bulk Return")
                    })
                  }
                  else {
                    this.toastMessage.error("Shipment not confirmed for Bulk Return Id " + recentBulkReturnObject.BulkReturnId + ". Kindly first confirm it and then create a new Bulk Return")
                  }
                  this.locationData = null
                  this.Ship_to_GSX = null
                  return
                }

                if (Array.isArray(data?.VendorDDList?.Vendor)) {
                  // Incomplete as right now there's only a single vendor record for each Return Value
                  this.VendorTypeDD.Data = data?.VendorDDList?.Vendor
                }
                else {
                  this.VendorTypeDD.Data.push(data?.VendorDDList?.Vendor)
                  this.VendorCode = this.VendorTypeDD.Data[0].Id
                  let km = data?.VendorDDList?.Vendor?.DistanceInKm
                  this.DistanceInKm ? this.DistanceInKm : km ? km : 0
                  if (this.modeofTransportData) {
                    this.vehicleNumber = data?.VendorDDList?.Vendor?.VehicleNo
                  }
                  this.VendorStateCode = data?.VendorDDList?.Vendor?.extraData?.StateCode
                  console.log("Vendor StateCode   ", this.VendorStateCode);
                  this.VendorObject = this.VendorTypeDD.Data
                  if (this.DistanceInKm == null || this.DistanceInKm == undefined) {
                    this.toastMessage.info("No Distance in Km data found for this Location Code! Kindly enter the distance.")
                  }
                  // console.log("Vendor Object  ",this.VendorObject)
                }
              }
            }

          },
          error: err => {
            this.Spinner = false
            console.log(err);
            this.VendorTypeDD = DropDownValue.getBlankObject();
          }
        });
    }
  }

  GetVehicleData() {
    if (this.modeofTransportData == 'ROAD') {
      this.vehicleTypeData = 'R'
      this.getVendorData()
    }
    else {
      this.vehicleNumber = null
      this.vehicleTypeData = null
    }
    console.log("Vehicle No", this.vehicleNumber)
    console.log("Vehicle Type", this.vehicleTypeData)

  }

  onModeofTransportSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ModeOfTransport, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ModeofTransport = value;
        }
      },
      error: (err) => {
        this.ModeofTransport = DropDownValue.getBlankObject();
      }
    });
  }

  onVehicleTypeSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.VehicleType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.VehicleType = value;
          console.log("Vehcile Type Data ", this.VehicleType)
        }
      },
      error: (err) => {
        this.VehicleType = DropDownValue.getBlankObject();
      }
    });
  }

  openPartSelector() {

    if (this.SelectedToteList.length <= 0) {
      this.toastMessage.error('Please Add Tote To Proceed !');
      return
    }

    if (this.BulkReturnType == null || this.BulkReturnType == undefined) {
      this.toastMessage.error("Please Select Return Type to add parts")
    }
    else if (this.locationData == null || this.locationData == undefined) {
      this.toastMessage.error("Please select Location To add parts")
    }
    else {
      if (this.isReturnOrderPartSelector == true) {
        this.isReturnOrderPartSelector = false;
      } else {
        this.isReturnOrderPartSelector = true;
      }
    }

  }
  closeReturnOrderPartSelector($event) {
    this.isReturnOrderPartSelector = $event
  }


  UpdateCountOverPack() {
    if (this.CountOverPack.length == 0) {
      this.CountOverPack.push("Individual");
      this.CountOverPack.push("1");

    }
    else {
      var tmpcntpack = 0;
      for (let item of this.bulkPartSelectorView) {

        var cp = item.CountPack == "Individual" ? 0 : item.CountPack == undefined || item.CountPack == null ? 0 : parseInt(item.CountPack.toString())
        tmpcntpack = tmpcntpack < cp ? cp : tmpcntpack

      }
      this.CountOverPack = []
      this.CountOverPack.push("Individual");
      this.CountOverPack.push("1");
      for (let i = 2; i <= tmpcntpack + 1; i++) {
        this.CountOverPack.push(i.toString());
      }

    }
  }

  validateReturnItem(com: any) {
    for (let item of this.finalSelectedElements) {
      if (item.repairId == com.repairId && item.sequenceNumber == com.sequenceNumber && item.partNumber == com.partNumber) {
        this.toastMessage.error("Part Code: " + item.partNumber + " Repair Id: " + "" + " already exists")
        return false;
      }
    }
    return true;
  }

  async returnOrderPartSelector($event) {
    //  ;
    this.partList = $event
    if (this.partList != null && this.partList != undefined) {
      this.disableReturnType = true
      console.log("Partlist from PopUp", this.partList)
      this.ngxSpinnerService.show()
      const stockPrices = await this.getStockPrice(this.partList);
      // console.log("Stock Prices ", stockPrices)
      this.showSpinner()
      for (var item of stockPrices) {
        if (this.validateReturnItem(item) == true) {
          this.finalSelectedElements.push({
            "StockPrice": item.StockPrice,  // TODO
            "partNumber": item.partNumber,
            "sequenceNumber": item.sequenceNumber,
            "serialNumber": item.repairDevice?.identifiers?.serial,
            "partDescription": item.partDescription,
            "productDescription": item.productDescription,
            "repairId": item.repairId,
            "returnOrderNumber": item.returnOrderNumber,
            "purchaseOrderNumber": item.purchaseOrderNumber,
            "batteryNetWeight": item.batteryNetWeight,
            "returnLabelPrinted": item.returnLabelPrinted,
            "received": item.received == null || item.received == undefined ? '...' : item.received,
            "quantity": item.quantity == null || item.quantity == undefined ? 1 : item.quantity,
            "CountPack": "Individual",
            "ToteNumber": "",
            "IsGSXPosted": "0",
            "IsDeleted": "0",
            "wareHouseAddress": item.wareHouseAddress,
            "vendorAddress": item.vendorAddress,
            "issueCode": item.issueCode == null || item.issueCode == undefined ? '' : item.issueCode,
            "dangerousGoods": item.dangerousGoods == null || item.dangerousGoods == undefined ? '' : item.dangerousGoods,

          })
          this.finalSelectedElements[0].vendorAddress = item.vendorAddress
          this.finalSelectedElements[0].wareHouseAddress = item.wareHouseAddress
        }
      }
      this.hideSpinner()
      console.log("Final Parts after Validation and Stock updation ", this.finalSelectedElements)
      this.GetPartHSNCodes()
      this.CalculateTotalStockPrice()
      this.ngxSpinnerService.hide()
    }
    //  ;
    if (this.finalSelectedElements.length > 0) {
      if (!(this.finalSelectedElements[0].wareHouseAddress == undefined || this.finalSelectedElements[0].wareHouseAddress == null)) {
        let address = this.finalSelectedElements[0].wareHouseAddress
        this.returnAddress = address.warehouseName + ", " + address.street + ", " + address.city + ", " + address.countryName + ", " + address.postalCode

      }
      else if (!(this.finalSelectedElements[0].vendorAddress == undefined || this.finalSelectedElements[0].vendorAddress == null)) {
        let address = this.finalSelectedElements[0].vendorAddress
        this.returnAddress = address.vendorName + ", " + address.street + ", " + address.city + + ", " + address.countryName + ", " + address.postalCode

      }
      else {
        this.returnAddress = ""
      }

    }
  }

  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }

  // async getStockPrice() {
  //   var requestdata
  //   this.ngxSpinnerService.show()
  //   var partlist = []
  //   let i = 0;
  //    
  //   console.log("GSX Posted Parts ", this.finalSelectedElements)
  //   var tempSelectedElements = this.finalSelectedElements.slice().filter(item => item.IsGSXPosted == '0' || (item.BulkReturnOrderDetailGUID == undefined || item.BulkReturnOrderDetailGUID == null) )
  //   console.log("Not GSX Posted Parts only", tempSelectedElements)
  //   while (i < tempSelectedElements.length) {
  //     if (tempSelectedElements.length > 5) {
  //       for (let j = 0; j < 5; j++) {
  //         partlist.push(tempSelectedElements[j]?.partNumber)
  //       }
  //       tempSelectedElements.splice(0, 5)
  //     }
  //     else {
  //       for (let j = 0; j < tempSelectedElements.length; j++) {
  //         partlist.push(tempSelectedElements[j]?.partNumber)
  //       }
  //     }
  //     requestdata = { "partNumbers": partlist }
  //     var strRequestData = JSON.stringify(requestdata);
  //     var data = {
  //       "Content": strRequestData
  //     };
  //     this.gsxService.getPartsSummary(data).subscribe({
  //       next: (value) => {
  //         this.ngxSpinnerService.hide()
  //         let response = JSON.parse(value.toString());
  //         if (!(response.errors == undefined || response.errors == null)) {
  //           var errorMessage = "";
  //           for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
  //             errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
  //             this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
  //           }
  //         }
  //         else {
  //           console.log("Get Stocke Price response ",response)
  //           response.forEach((object, index) => {
  //             for (let i = 0; i < this.finalSelectedElements.length; i++) {
  //               const item = this.finalSelectedElements[i];
  //               if (item.partNumber == object.number && item.IsGSXPosted == '0') {
  //                   item.StockPrice = this.dynamicService.removeCommas(object.stockPrice == undefined || object.stockPrice == null ? "0" : object.stockPrice);
  //                   // console.log(index, " : PartNo ", item.partNumber, " : ", item.StockPrice);
  //                 }
  //               }
  //           });
  //           this.totalStockPrice = this.finalSelectedElements.reduce((total, currentItem) => {
  //             let SP: number = 0
  //             if (currentItem.StockPrice || currentItem.StockPrice != null || currentItem.StockPrice != undefined || currentItem.StockPrice != '') {
  //                 SP = parseFloat(currentItem.StockPrice.toString())
  //             }
  //             return total + SP
  //             // if(currentItem.StockPrice){
  //             //   return total + parseFloat(currentItem.StockPrice.toString());
  //             // }
  //           }, 0);
  //         }
  //       },
  //       error: (err) => {
  //         this.ngxSpinnerService.hide()
  //         console.log(err);
  //         this.toastMessage.error("Please try again. " + err)
  //         this.ngxSpinnerService.hide()
  //       }
  //     })

  //     partlist = []
  //     i++;
  //   }


  //   console.log("List : ", this.finalSelectedElements)
  //   console.log("Total Stock Price: ", this.totalStockPrice)
  // }


  async getStockPrice(PartList) {

    this.ngxSpinnerService.show();
    let i = 0;
    // console.log("Parts ", PartList);
    let responseStockPrices: any[] = []
    // Make it a set as duplicate PartNumbers get a single response from GSX for Stock Price
    let uniquePartNumbers = new Set();
    PartList.forEach(item => {
      uniquePartNumbers.add(item.partNumber);
    });
    this.ngxSpinnerService.show()
    let uniquePartNumbersArray = Array.from(uniquePartNumbers);
    // Send in a pack of 5 each time 
    while (i < uniquePartNumbersArray.length) {
      this.showSpinner()
      const remainingPartCount = uniquePartNumbersArray.length - i;
      const sliceSize = remainingPartCount < 5 ? remainingPartCount : 5;
      const tempPartList = uniquePartNumbersArray.slice(i, i + sliceSize);
      console.log("Parts to be sent to GSX ", tempPartList);

      const requestdata = { "partNumbers": tempPartList };
      const strRequestData = JSON.stringify(requestdata);
      const data = {
        "Content": strRequestData
      };
      console.log("Parts before SP ", requestdata)
      try {

        const value = await lastValueFrom(this.gsxService.getPartsSummary(data));
        this.ngxSpinnerService.hide();
        let response = JSON.parse(value.toString());
        this.hideSpinner()
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true });
          }
        } else {
          console.log("Stock Price response", response);
          response.forEach((object, index) => {
            if (tempPartList.find(item => item == object.number)) {
              object.StockPrice = this.dynamicService.removeCommas(object.stockPrice == undefined || object.stockPrice == null ? "0" : object.stockPrice);
              console.log("Object ", object)
              responseStockPrices.push(object);
            }
          });
        }
      } catch (err) {
        this.hideSpinner()
        this.ngxSpinnerService.hide();
        console.log(err);
        this.toastMessage.error("Please try again. " + err);
        this.ngxSpinnerService.hide();
      }
      i += sliceSize;
    }
    console.log("Response List: ", responseStockPrices);
    // console.log("List: ", this.finalSelectedElements);
    // console.log("Total Stock Price: ", this.totalStockPrice);
    console.log("Stock Price before matching ", PartList);
    if (responseStockPrices != null || responseStockPrices != undefined) {
      PartList.forEach(item => {
        const matchingResponseItems = responseStockPrices.filter(responseItem => responseItem.number === item.partNumber);
        if (matchingResponseItems.length > 0) {
          matchingResponseItems.forEach(matchingResponseItem => {
            item.StockPrice = matchingResponseItem.StockPrice;
          });
        }
      });
    }
    console.log("Stock Price after matching ", PartList);
    this.ngxSpinnerService.hide()
    return PartList;
  }




  GetPartHSNCodes() {
    //  
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetHSNCodeForMaterial",
    });
    requestData.push({
      Key: "Data",
      Value: this.GetPartHSNCodeXML()
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode()
    });
    console.log("before hsn ", requestData)
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData
    };
    this.showSpinner()
    this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          // console.log("getdata",response)
          this.hideSpinner()
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData);
            // console.log("Obj:",data)

            if (Array.isArray(data.PartList.Part)) {
              data.PartList.Part.forEach(part => {
                this.finalSelectedElements
                  .filter(item => item.partNumber === part.ItemCode)
                  .forEach(item => {
                    item.HSNSACCode = part.HSNSACCode;
                    item.GSTGroupCode = part.GSTGroupCode;
                  });
              })
            }
            else {
              const index = this.finalSelectedElements.findIndex(item => item.partNumber === data.PartList.Part.ItemCode);
              if (index !== -1) {
                this.finalSelectedElements[index].HSNSACCode = data.PartList.Part.HSNSACCode;
                this.finalSelectedElements[index].GSTGroupCode = data.PartList.Part.GSTGroupCode;;
              }
            }
            // console.log("Part with HSNSACCode ", this.finalSelectedElements)
            this.ngxSpinnerService.hide()
          }
          else {
            console.log("error");
          }

        },
        error: err => {
          this.hideSpinner()
          console.log(err);
        }
      });
  }

  GetPartHSNCodeXML() {
    let rawData = {
      "rows": []
    }
    for (let item of this.finalSelectedElements) {
      rawData.rows.push({
        "row": {
          "ItemCode": item.partNumber,
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("Part XML:- ", xml);
    return xml;
  }


  // async getStockPriceAsync() {
  //   this.ngxSpinnerService.show();
  //   const tempSelectedElements = this.finalSelectedElements
  //     .filter(item => item.IsGSXPosted == '0' || (!item.BulkReturnOrderDetailGUID));
  //   const totalStockPrice = 0;
  //    
  //   console.log("Temp ", tempSelectedElements)
  //   for (let i = 0; i < tempSelectedElements.length; i += 5) {
  //     const partlist = tempSelectedElements
  //       .slice(i, i + 5)
  //       .map(item => item.partNumber);

  //     const requestData = { partNumbers: partlist };
  //     const strRequestData = JSON.stringify(requestData);
  //     const data = { Content: strRequestData };
  //     console.log("Get Stoc Before ", requestData)
  //     try {
  //       const response: any = await lastValueFrom(this.gsxService.getPartsSummary(data))
  //         .catch(error => {
  //           console.error(error);
  //           this.toastMessage.error('Please try again. ' + error);
  //           throw error;
  //         });

  //       // Process response
  //       if (response.errors) {
  //         for (const error of response.errors) {
  //           const errorMessage = `${error.code} - ${error.message}`;
  //           this.toastMessage.error(errorMessage, 'Error', { closeButton: true, disableTimeOut: true });
  //         }
  //       } else {
  //         console.log("Response  ", response)
  //         for (const object of response) {
  //           for (const item of this.finalSelectedElements) {
  //             console.log("Fianl Stock ", item)
  //             if (item.partNumber === object.number && item.IsGSXPosted === '0') {
  //               item.StockPrice = this.dynamicService.removeCommas(object.stockPrice || '0');
  //               console.log('PartNo', item.partNumber, 'StockPrice', item.StockPrice);
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       // Error handling
  //     }
  //   }

  //   console.log("Final Parts ", this.finalSelectedElements)
  //   this.totalStockPrice = this.finalSelectedElements.reduce((total, currentItem) => {
  //     let SP: number = 0
  //     if (currentItem.StockPrice || currentItem.StockPrice != null || currentItem.StockPrice != undefined || currentItem.StockPrice != '') {
  //         SP = parseFloat(currentItem.StockPrice.toString())
  //     }
  //     return total + SP
  //     // return total + parseFloat(currentItem.StockPrice.toString());
  //   }, 0);

  //   console.log('List:', this.finalSelectedElements);
  //   console.log('Total Stock Price:', this.totalStockPrice);
  // }

  updateCodesForPart(part, hsnsacCode, gstGroupCode) {
    this.finalSelectedElements
      .filter(item => item.partNumber === part.ItemCode)
      .forEach(item => {
        item.HSNSACCode = hsnsacCode;
        item.GSTGroupCode = gstGroupCode;
      });
  }


  CalculateTotalStockPrice() {
    // console.log("Item ", item)
    this.totalStockPrice = 0
    this.finalSelectedElements.forEach(currentItem => {
      // console.log("Current Item ", currentItem)
      if (currentItem.StockPrice != null && currentItem.StockPrice != undefined && currentItem.StockPrice != '') {
        if (currentItem.IsDeleted == "0") {
          this.totalStockPrice += parseFloat(currentItem.StockPrice.toString())
        }
      }
    })
    this.totalStockPrice = parseFloat(this.totalStockPrice.toFixed(2));
    console.log("Final Parts : ", this.finalSelectedElements)
    console.log("Total Stock Price: ", this.totalStockPrice)

      this.finalSelectedElements.forEach(item =>{
      item.toteList = [];
      this.SelectedToteList.forEach(obj=>{
        item.toteList.push(obj?.ToteNo)
      })
    })
  }

  showShipTo() {
    if (this.locationData != null || this.locationData != undefined) {
      this.readData = false;
    }
    else {
      this.readData = true;
    }
  }

  //This functions confirms the Shipment on GSX
  confirmShipment() {
    const shouldConfirm = confirm("Are you sure you want to continue?")
    if (!shouldConfirm) {
      return
    }

    this.ngxSpinnerService.show();
    var objData = {
      "bulkReturn": this.bulkReturnId,
      "shipmentDetails": {
        "notes": "Bulk Shipment",
        "packageMeasurements": {
          "length": this.length,
          "width": this.breadth,
          "weight": this.weight,
          "height": this.height
        },
        "carrierCode": this.transportationCarrierData,
        "trackingNumber": this.trackingNumber
      },
      "shipTo": this.Ship_to_GSX
    }
    var strRequestData = JSON.stringify(objData)
    var data = {
      "Content": strRequestData
    }
    console.log("Before Confirm shipment Data:- ", data)

    // // TODO 
    // this.trackingUrl = ''
    // this.saveConfirmedShipment()
    // alert("Return On")
    // return
    this.gsxService.returnConfirmShipment(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        console.log("Confirm Value ", value)
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
        else {
          console.log("Confirm Shipment response ", response)
          this.trackingUrl = response?.trackingUrl == null || response?.trackingUrl == undefined ? '' : response?.trackingUrl
          if (this.trackingUrl != '') {
            this.toastMessage.info(this.trackingUrl, "Kindly write down the Tracking URL before closing this message:- ", { closeButton: true, disableTimeOut: true })
          }
          else {
            this.toastMessage.error(this.trackingUrl, "No Tracking URL found, kindly contact Admin...", { closeButton: true, disableTimeOut: true })
          }
          this.saveConfirmedShipment()
        }
      },
      error: (err) => {
        console.log(err);
        this.toastMessage.error("Please try again. " + err)
        this.ngxSpinnerService.hide()
      }
    });
  }

  //this function saves the confirmed shipment from GSX to NITC Database
  saveConfirmedShipment() {
    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkShipment"
    })
    requestData.push({
      "Key": "BulkReturnId",
      "Value": this.bulkReturnId
    })
    requestData.push({
      "Key": "ReturnOrderStatus",
      "Value": "SHIPMENT CONFIRMED"
    })
    requestData.push({
      "Key": "TrackingUrl",
      "Value": this.trackingUrl
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Confirmations", requestData)
    // // TODO
    // alert("Return On")
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("Confirm DB Response ", response)
          if (response.ReturnCode == '0') {
            
            this.toastMessage.success("Shipment confirmed successfully!")
            let responseJSON = JSON.parse(response.ExtraData)
            this.ApprovalStatus = responseJSON?.BulkReturnOrderHeader?.ReturnOrderStatus
            this.trackingUrl = responseJSON?.BulkReturnOrderHeader?.TrackingURL
            if (!this.trackingUrl || this.trackingUrl == '') {
              this.toastMessage.error(this.trackingUrl, "Tracking URL not found, kindly contact Admin...", { closeButton: true, disableTimeOut: true })
            }
            else {
              this.changeTrackingURL = false
            }
            this.isShipmentDone = responseJSON?.BulkReturnOrderHeader?.isShipmentDone
            this.checkStatusChanges(this.isApproverPermission, this.isShipmentDone)
            this.hideShipmentButton = true
            this.ngxSpinnerService.hide();
          }
          else {
            this.errorMessage = response.ReturnMessage;
            this.toastMessage.error(response.ReturnMessage)
          }
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide();
        }
      });
  }

  //This function gets the detail of existing Bulk Return
  getData() {
    this.ngxSpinnerService.show()
    //  
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnOrderObject"
    });
    requestData.push({
      "Key": "BulkReturnOrderHeaderGUID",
      "Value": this.params.headerguid
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    // console.log("Before GetData SP:-", requestData )
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          //  
          let response = JSON.parse(value.toString());
          let data = JSON.parse(response.ExtraData.toString())
          if (response.ReturnCode == '0') {
            
            console.log("After Get Data Funct, SP Response:- ", data)
            //Set Status in the Header
            this.ApprovalStatus = data?.ReturnOrderStatus;
            // console.log("Status:- ", this.ApprovalStatus)
            // Disbale Location Dropdown Value for isEdit mode:-
            this.disableReturnType = true
            this.CreatedDate = data.CreatedDate
            this.readData = false;
            this.bulkReturnHeaderGUID = data.BulkReturnOrderHeaderGUID
            this.bulkReturnId = data.BulkReturnId
            this.transportationCarrierData = data.TransportationCarrier
            this.locationData = data.LocationCode
            this.BulkReturnType = data.ReturnType
            this.length = data.Length
            this.breadth = data.Breadth
            this.height = data.Height
            this.weight = data.Weight
            this.trackingNumber = data.TrackingNumber
            this.sealNumber = data.SealNumber
            this.Ship_to_GSX = data.ShipTo
            this.returnAddress = data.ReturnAddress
            this.isShipmentDone = data.isShipmentDone
            this.ApprovalStatus = data.ReturnOrderStatus
            this.ApprovalGUID = data.ApprovalGUID
            this.FinalFileObjects = data.ApprovalFile
            this.FinalFileNames = data.BulkStatusList?.FileNames
            this.FinalFileTypes = data.BulkStatusList?.FileTypes
            this.returnRemark = data.BulkStatusList?.ApprovalRemark
            this.totalStockPrice = data.TotalStockPrice
            this.originalTotalStockPrice = data.TotalStockPrice
            this.trackingUrl = data.TrackingURL
            this.DeliveryChallanNo = data.DeliveryChallanNo
            this.DistanceInKm = data?.DistanceInKm
            this.modeofTransportData = data?.ModeOfTransport
            this.vehicleNumber = data?.VehicleNo
            this.vehicleTypeData = data?.VehicleType
            this.QRData = data?.QRData
            this.EWayBillNo = data?.EWayBillNo
            this.EWayBillDate = data?.EWayBillDate
            this.EWayValidUpto = data?.EWayValidUpto
            this.DistinctHSNSACCode = data?.DistinctHSNSACCode
            this.NoOfBoxes = data?.NoOfBoxes


            // If Files are available then show them:-
            // console.log("Final Files ", this.FinalFileObjects)
            if ((this.FinalFileObjects == null || this.FinalFileObjects == undefined) && this.isApproverPermission == false) {
              this.ApprovalStatus == 'NEW' || this.ApprovalStatus == 'NEED MORE INFORMATION' ? this.toastMessage.info("Upload/Edit Files") : ''
            }
            else {
              this.extractFileSrc(this.FinalFileObjects, this.FinalFileNames, this.FinalFileTypes);
            }

            let xmldata = data.BulkReturnDetailList.BulkReturnDetail
            var result = []
            if (Array.isArray(xmldata)) {
              result = xmldata
            }
            else {
              result.push(xmldata)
            }
            for (let item of result) {
              this.finalSelectedElements.push({
                // GSX Api Data
                "CountPack": item.OverPackBox,
                "IsDeleted": "0",
                "IsGSXPosted": "1",
                "ToteNumber": item.ToteNumber == undefined || item.ToteNumber == null ? "" : item.ToteNumber,
                "batteryNetWeight": item.BatteryNetWeight,
                "partDescription": item.PartDescription,
                "partNumber": item.PartCode,
                "productDescription": item.ProductDescription,
                "purchaseOrderNumber": item.PurchaseOrderNumber,
                "quantity": item.quantity == undefined || item.quantity == null ? 1 : item.quantity,
                "received": item.Recieved,
                "repairId": item.RepairId,
                "StockPrice": item.StockPrice,
                "returnLabelPrinted": item.returnLabelPrinted == undefined || item.returnLabelPrinted == null ? "No" : item.returnLabelPrinted,
                "returnOrderNumber": item.ReturnOrderNumber,
                "sequenceNumber": item.sequenceNumber == undefined || item.sequenceNumber == null ? "" : item.sequenceNumber,
                "serialNumber": item.SerialNo,
                "vendorAddress": item.vendorAddress == undefined || item.vendorAddress == null ? undefined : item.vendorAddress,
                "HSNSACCode": item.HSNSACCode == undefined || item.HSNSACCode == null ? "" : item.HSNSACCode,
                "GSTGroupCode": item.GSTGroupCode == undefined || item.GSTGroupCode == null ? "" : item.GSTGroupCode,
                // For CRM DBx
                "BulkReturnOrderDetailGUID": item.BulkReturnOrderDetailGUID,
                "issueCode": item.issueCode == null || item.issueCode == undefined ? '' : item.issueCode,
                "dangerousGoods": item.dangerousGoods == null || item.dangerousGoods == undefined ? '' : item.dangerousGoods,

              })
            }

            // E Way Bill
            data?.EWayBillFlag == '1' ? this.EWayBillFlag = true : this.EWayBillFlag = false

            this.ngxSpinnerService.hide()
            this.getVendorData()
            this.getLocationData()
            this.CalculateTotalStockPrice()
            if (this.originalTotalStockPrice != this.totalStockPrice) {
              let bothPrices = ("Original: " + this.originalTotalStockPrice + " Calculated: " + this.totalStockPrice).toString()
              this.toastMessage.error(bothPrices, "Total Stock Price mismatch error, contact Admin!", { closeButton: true, disableTimeOut: true })
            }
            this.checkLocalPermission() // Check if Local Appprover
            this.checkStatusChanges(this.isApproverPermission, data.isShipmentDone)
          }
          else {
            this.ngxSpinnerService.hide()
            this.toastMessage.error("Something Went Wrong")
          }
        },
        error: err => {
          this.toastMessage.error(err)
        }
      });
  }

  checkStatusChanges(isApproverPermission, isShipmentDone) {
    // First Check all the Parameters
    console.log("Status- ", this.ApprovalStatus, "\n ApproverPermission- ", isApproverPermission, "\nShipment Done?- ", isShipmentDone)
    this.showFileUploadOptions = true;
    this.showFileButtons = false;
    this.isEdit = false;
    this.showRemarkButton = false
    this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
    this.forEWayDetails.nativeElement.parentElement.classList.remove('disabled-select')
    this.disableRemarkButton = true

    // When Local Approver Views
    if (isApproverPermission == true) {
      this.forShipmentDetails.nativeElement.parentElement.classList.remove('disabled-select') // Default Editable Shipment Details
      this.forEWayDetails.nativeElement.parentElement.classList.add('disabled-select')
      if (this.ApprovalStatus == 'NEED MORE INFORMATION') {
        this.showRemarkButton = true
      }
      else if (this.ApprovalStatus == 'SENT FOR APPROVAL') {
        this.fileOptions = false
        this.showFileButtons = true;
        this.showRemarkButton = true;
        this.disableRemarkButton = false
      }
      else if (this.ApprovalStatus == 'NEW') {
        // Hide Remark Button
        if (this.FileUploadList.some(file => { file?.src != null || file?.src != undefined })) {
          this.showFileButtons = true
          this.fileOptions = false
        }
      }
      else if (this.ApprovalStatus == 'APPROVED' || this.ApprovalStatus == 'REJECTED' || this.ApprovalStatus == 'SHIPMENT CONFIRMED') {
        this.showFileButtons = false
        this.showRemarkButton = true
        if (this.ApprovalStatus == 'SHIPMENT CONFIRMED') {
          this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
        }
        // Change Tracking URL
        if ((this.ApprovalStatus == 'SHIPMENT CONFIRMED' || this.ApprovalStatus == 'APPROVED')
          && (this.trackingUrl == null || this.trackingUrl == undefined || this.trackingUrl == '')) {
          this.changeTrackingURL = true
        }

      }
    }
    else if (this.ApprovalStatus == 'NEW') {
      this.forShipmentDetails.nativeElement.parentElement.classList.remove('disabled-select') // Default Editable Shipment Details
      this.fileOptions = true
      this.showFileButtons = true
      this.AddFiles = true

      // this.isEdit= true;
      // this.showFileUploadOptions= true;
    }
    else if (this.ApprovalStatus == 'SENT FOR APPROVAL') {
      // this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
      this.showRemarkButton = true;
    }
    else if (this.ApprovalStatus == 'APPROVED' || this.ApprovalStatus == 'REJECTED') {
      // this.showFileUploadOptions= false; // Hide file upload options
      // Show Remark but disable it
      this.showFileButtons = false
      this.disableRemarkButton = true
      if (this.ApprovalStatus == 'APPROVED') {
        this.showRemarkButton = true
        isShipmentDone == 0 ? this.hideShipmentButton = false : this.hideShipmentButton = true // Enable Confirm Shipment Button
      }
    }
    else if (this.ApprovalStatus == 'SHIPMENT CONFIRMED') {
      this.isEdit = false;
      this.showRemarkButton = true
      if (this.totalStockPrice >= 50000 && this.EWayBillFlag == false) {
        this.hideEwayButton = false
      }
    }
    else if (this.ApprovalStatus == 'NEED MORE INFORMATION') {
      this.showFileButtons = true
      this.AddFiles = true
      // this.isEdit= true;
      // Show Remark but disable it
      this.showRemarkButton = true
      this.disableRemarkButton = true
    }
    else {
      this.toastMessage.error("Error in Status, contact IT")
      this.showFileUploadOptions = false;
      // Disable Shipment Details and hide buttons:- 
      this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
      // Show Remark but disable it
      this.disableRemarkButton = true
    }

    if (isShipmentDone == 0 && this.ApprovalStatus != 'REJECTED') {
      // Hide Add Parts and Save Buttons
      this.isEdit = true;
    }
    else if (isShipmentDone == 1) {
      // this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select') // Cant edit after Shipment Confirmation
      // Hide Add Parts and Save Buttons
      this.isEdit = false;
      this.showRemarkButton = true
      if (this.totalStockPrice >= 50000 && this.EWayBillFlag == false) {
        this.hideEwayButton = false
        this.isHSNChangeAllowed = true
        this.toastMessage.info(this.DistinctHSNSACCode, "Distinct HSN Codes are: ", { disableTimeOut: true, tapToDismiss: false, closeButton: true });
      }
    }
    if (this.EWayBillFlag == true) {
      this.forEWayDetails.nativeElement.parentElement.classList.add('disabled-select')
    }
    else {
      this.forEWayDetails.nativeElement.parentElement.classList.remove('disabled-select')
    }
    console.log("HSN Allowed ", this.isHSNChangeAllowed)
  }

  //this function saves the bulk return to NITC database once its saved in GSX
  async onSubmit() {
    ;
    try {
      this.CalculateTotalStockPrice()
    }
    catch (err) {
      this.toastMessage.info("Error:-", err)
    }

    if (this.bulkReturnId == null || this.bulkReturnId == undefined) {
      this.toastMessage.error("No Bulk Return Id found")
      return
    }

    let validateBulkReturn: boolean = this.ValidateBulkReturn()
    if (!validateBulkReturn) {
      // this.toastMessage.error("Bulk Return Validation Error")
      return
    }

     let validateToteCount: boolean = this.validateToteCount()
    if (!validateToteCount) {
      return
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkReturnOrder"
    });
    requestData.push({
      "Key": "BulkReturnId",
      "Value": this.bulkReturnId == null || this.bulkReturnId == undefined ? '' : this.bulkReturnId
    });
    this.bulkReturnHeaderGUID = this.params.headerguid == null || this.params.headerguid == undefined ? uuidv4() : this.params.headerguid
    requestData.push({
      "Key": "BulkReturnOrderHeaderGUID",
      "Value": this.bulkReturnHeaderGUID
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "ReturnType",
      "Value": this.BulkReturnType
    })
    requestData.push({
      "Key": "TransportationCarrier",
      "Value": this.transportationCarrierData
    });
    requestData.push({
      "Key": "Length",
      "Value": this.length
    });
    requestData.push({
      "Key": "Breadth",
      "Value": this.breadth
    });
    requestData.push({
      "Key": "Height",
      "Value": this.height
    });
    requestData.push({
      "Key": "Weight",
      "Value": this.weight
    });
    requestData.push({
      "Key": "TrackingNumber",
      "Value": this.trackingNumber
    });
    requestData.push({
      "Key": "SealNumber",
      "Value": this.sealNumber
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    });
    requestData.push({
      "Key": "TotalStockPrice",
      "Value": this.totalStockPrice.toFixed(2)
    });

    requestData.push({
      "Key": "ShipTo",
      "Value": this.Ship_to_GSX
    });
    requestData.push({
      "Key": "ReturnAddress",
      "Value": this.returnAddress == null || this.returnAddress == undefined ? "" : this.returnAddress
    });
    requestData.push({
      "Key": "BulkReturnOrderDetail",
      "Value": this.saveBulkReturnOrderXml()
    });
    requestData.push({
      "Key": "ReturnOrderStatus",
      "Value": this.ApprovalStatus == null || this.ApprovalStatus == undefined || this.ApprovalStatus == '' ? 'NEW' : this.ApprovalStatus
    });

    requestData.push({
      "Key": "ApprovalGUID",
      "Value": this.ApprovalGUID == null || this.ApprovalGUID == undefined || this.ApprovalGUID == '' ? '00000000-0000-0000-0000-000000000000' : this.ApprovalGUID
      // "Value": this.ApprovalStatus == 'SHIPMENT CONFIRMED' ||  this.ApprovalStatus == 'APPROVED' ? this.ApprovalStatus : '00000000-0000-0000-0000-000000000000'
    });
    requestData.push({
      "Key": "ApprovalFile",
      "Value": this.FinalFileObjects == null || this.FinalFileObjects == undefined ? '' : this.FinalFileObjects
      // "Value":this.ApprovalStatus == 'SHIPMENT CONFIRMED' ||  this.ApprovalStatus == 'APPROVED' ?  this.FinalFileObjects : ''
    });
    requestData.push({
      "Key": "VendorCode",
      "Value": this.VendorCode == null || this.VendorCode == undefined ? '' : this.VendorCode
    });
    requestData.push({
      "Key": "DistanceInKm",
      "Value": this.DistanceInKm == null || this.DistanceInKm == undefined ? 0 : this.DistanceInKm
    });
    requestData.push({
      "Key": "ModeOfTransport",
      "Value": this.modeofTransportData == null || this.modeofTransportData == undefined ? '' : this.modeofTransportData
    });
    requestData.push({
      "Key": "VehicleNo",
      "Value": this.vehicleNumber == null || this.vehicleNumber == undefined ? '' : this.vehicleNumber
    });
    requestData.push({
      "Key": "VehicleType",
      "Value": this.vehicleTypeData == null || this.vehicleTypeData == undefined ? '' : this.vehicleTypeData
    });
    requestData.push({
      "Key": "NoOfBoxes",
      "Value": this.NoOfBoxes == null || this.NoOfBoxes == undefined ? '' : this.NoOfBoxes
    });
    requestData.push({
      "Key": "ToteDetails",
      "Value": this.ToteIntoXml()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Whole Data before Sending to Save:- ", requestData)

    // // Checking if the DetailGUID is the same each time when editing the existing Parts in the Detail Table 
    // const xml = requestData.find(item => item.Key === 'BulkReturnOrderDetail').Value;
    // // console.log("XML Dumb is :- ", xml)
    // xml2js.parseString(xml, (err, result) => {
    //   const rows = result.rows.row;
    //   const detailGUIDs = rows.map(row => row.BulkReturnOrderDetailGUID);
    //   // Log the resulting XML string
    //   // console.log("Before sending to DB the Details GUIDs :-", detailGUIDs);
    // });

    // // TODO:- 
    // alert("Return On")
    // return
    this.ngxSpinnerService.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          console.log("After OnSubmit BulkReturn Header SP :- ", response)
          if (response.ReturnCode == '0') {
            this.isHSNChangeAllowed == false ? this.toastMessage.success("Successfully Parts Added") : this.toastMessage.success("Successfully Updated HSN Codes")
            this.ngxSpinnerService.hide();
            // this.toastMessage.info("Upload Files Now!")
            this.route.navigate(["auth/" + glob.getCompanyCode() + "/bulk-return-order"], { queryParams: { headerguid: this.bulkReturnHeaderGUID } })
          }
          else {
            this.errorMessage = response.ReturnMessage;
            this.toastMessage.error(response.ReturnMessage)
          }
        },
        error: err => {
          this.ngxSpinnerService.hide();
          console.log("After SP error ", err);
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- ", message, { closeButton: true, disableTimeOut: true });
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });
  }
  // async onSaveHSNChange() {
  //    ;

  //   if(this.bulkReturnId== null || this.bulkReturnId == undefined){
  //     this.toastMessage.error("No Bulk Return Id found")
  //     return
  //   }
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "SaveBulkReturnHSNChange"
  //   });
  //   requestData.push({
  //     "Key": "BulkReturnId",
  //     "Value": this.bulkReturnId == null || this.bulkReturnId == undefined ? '' : this.bulkReturnId
  //   });
  //   this.bulkReturnHeaderGUID = this.params.headerguid == null || this.params.headerguid == undefined ? uuidv4() : this.params.headerguid 
  //   requestData.push({
  //     "Key": "BulkReturnOrderHeaderGUID",
  //     "Value": this.bulkReturnHeaderGUID
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   })
  //   requestData.push({
  //     "Key": "ReturnType",
  //     "Value": this.BulkReturnType
  //   })
  //   requestData.push({
  //     "Key": "TransportationCarrier",
  //     "Value": this.transportationCarrierData
  //   });
  //   requestData.push({
  //     "Key": "Length",
  //     "Value": this.length
  //   });
  //   requestData.push({
  //     "Key": "Breadth",
  //     "Value": this.breadth
  //   });
  //   requestData.push({
  //     "Key": "Height",
  //     "Value": this.height
  //   });
  //   requestData.push({
  //     "Key": "Weight",
  //     "Value": this.weight
  //   });
  //   requestData.push({
  //     "Key": "TrackingNumber",
  //     "Value": this.trackingNumber
  //   });
  //   requestData.push({
  //     "Key": "SealNumber",
  //     "Value": this.sealNumber
  //   });
  //   requestData.push({
  //     "Key": "LocationCode",
  //     "Value": this.locationData
  //   });
  //   requestData.push({
  //     "Key": "TotalStockPrice",
  //     "Value":this.totalStockPrice.toFixed(2)
  //   });

  //   requestData.push({
  //     "Key": "ShipTo",
  //     "Value": this.Ship_to_GSX
  //   });
  //   requestData.push({
  //     "Key": "ReturnAddress",
  //     "Value": this.returnAddress == null || this.returnAddress == undefined ? "" : this.returnAddress
  //   });
  //   requestData.push({
  //     "Key": "BulkReturnOrderDetail",
  //     "Value": this.saveBulkReturnOrderXml()
  //   });

  //   // Set Status NEW for the first time 
  //   requestData.push({
  //     "Key": "ReturnOrderStatus",
  //     "Value": 'NEW'
  //   });
  //   requestData.push({
  //     "Key": "ApprovalGUID",
  //     "Value": '00000000-0000-0000-0000-000000000000'
  //     // "Value": this.ApprovalGUID == null || this.ApprovalGUID == undefined ? '00000000-0000-0000-0000-000000000000' : this.ApprovalGUID
  //   });
  //   requestData.push({
  //     "Key": "ApprovalFile",
  //     "Value": ''
  //   });
  //   requestData.push({
  //     "Key": "VendorCode",
  //     "Value": this.VendorCode == null || this.VendorCode== undefined ? '' : this.VendorCode
  //   });
  //   requestData.push({
  //     "Key": "DistanceInKm",
  //     "Value": this.DistanceInKm ==  null || this.DistanceInKm == undefined ? '' : this.DistanceInKm
  //   });
  //   requestData.push({
  //     "Key": "ModeOfTransport",
  //     "Value": this.modeofTransportData == null || this.modeofTransportData == undefined ? '' : this.modeofTransportData
  //   });
  //   requestData.push({
  //     "Key": "VehicleNo",
  //     "Value": this.vehicleNumber == null || this.vehicleNumber== undefined ? '' : this.vehicleNumber
  //   });
  //   requestData.push({
  //     "Key": "VehicleType",
  //     "Value": this.vehicleTypeData == null || this.vehicleTypeData == undefined ? '' : this.vehicleTypeData
  //   });

  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   console.log("Whole Data before Sending to Save:- ",requestData)

  //   // // Checking if the DetailGUID is the same each time when editing the existing Parts in the Detail Table 
  //   // const xml = requestData.find(item => item.Key === 'BulkReturnOrderDetail').Value;
  //   // // console.log("XML Dumb is :- ", xml)
  //   // xml2js.parseString(xml, (err, result) => {
  //   //   const rows = result.rows.row;
  //   //   const detailGUIDs = rows.map(row => row.BulkReturnOrderDetailGUID);
  //   //   // Log the resulting XML string
  //   //   // console.log("Before sending to DB the Details GUIDs :-", detailGUIDs);
  //   // });

  //   // // TODO:- 
  //   // alert("Return On")
  //   // return
  //   this.ngxSpinnerService.show();
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         let response = JSON.parse(value.toString());
  //         console.log("After OnSubmit BulkReturn Header SP :- ",response)
  //         if (response.ReturnCode == '0') {
  //           this.toastMessage.success("Successfully Parts Added")
  //           this.ngxSpinnerService.hide();
  //           // this.toastMessage.info("Upload Files Now!")
  //           this.route.navigate(["auth/" + glob.getCompanyCode() + "/bulk-return-order"], {queryParams: {headerguid : this.bulkReturnHeaderGUID}})
  //         }
  //         else {
  //           this.errorMessage = response.ReturnMessage;
  //           this.toastMessage.error(response.ReturnMessage)
  //         }
  //       },
  //       error: err => {
  //         this.ngxSpinnerService.hide();
  //         console.log("After SP error ",err);
  //         console.log("Error Message:- ", err)
  //         const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
  //         errors.forEach(error => {
  //           const messageIndex = error.indexOf("Message: ");
  //           if (messageIndex !== -1) {
  //             const messageSubstring = error.substring(messageIndex + 9).trim();
  //             const message = JSON.parse(messageSubstring).message;
  //             this.toastMessage.error("Error:- " + message);
  //           } else {
  //             this.toastMessage.error("Error parsing the error message.");
  //           }
  //         });
  //       }
  //     });
  // }

  //this function saves the bulk returns to the GSX


  gsxSubmit() {
    
    let validateBulkReturn: boolean = this.ValidateBulkReturn()
    if (validateBulkReturn) {

      var objData
      if (this.bulkReturnId == null || this.bulkReturnId == undefined || this.bulkReturnId == '') {

        objData = {
          "shipmentDetails": {
            "notes": "Bulk Returns",
            "packageMeasurements": {
              "length": this.length,
              "width": this.breadth,
              "weight": this.weight,
              "height": this.height
            },
            "carrierCode": this.transportationCarrierData,
            "trackingNumber": this.trackingNumber
          },
          "parts": [],
          "shipTo": this.Ship_to_GSX
        }
      }
      else {
        objData = {
          "bulkReturn": this.bulkReturnId,
          "shipmentDetails": {
            "notes": "Bulk Returns",
            "packageMeasurements": {
              "length": this.length,
              "width": this.breadth,
              "weight": this.weight,
              "height": this.height
            },
            "carrierCode": this.transportationCarrierData,
            "trackingNumber": this.trackingNumber
          },
          "parts": [],
          "shipTo": this.Ship_to_GSX
        }
      }
      for (let item of this.finalSelectedElements) {
        objData.parts.push({
          "returnOrderNumber": item.returnOrderNumber,
          "sequenceNumber": parseInt(item.sequenceNumber),
          "overPackId": item.CountPack,
          "action": item.IsGSXPosted == "1" ? item.IsDeleted == "1" ? "DELETE" : "UPDATE" : "CREATE",
          "partNumber": item.partNumber,
          "repairId": item.repairId
        }
        )
      }
      
      var strRequestData = JSON.stringify(objData)
      var data = {
        "Content": strRequestData
      }
      const shouldConfirm = confirm("Are you sure you want to continue?")
      if (!shouldConfirm) {
        return
      }
      console.log("Obj Data ", objData)
      // ********************************************************************************************************************************************************************************
      // // TODO:- Change this when sending to Sir
      // console.log("Final Parts ", this.finalSelectedElements)
      // // this.onSubmit()
      // alert("Return On")
      // this.saveBulkReturnOrderXml()
      // return
      // ********************************************************************************************************************************************************************************

      this.ngxSpinnerService.show()
      this.gsxService.ReturnsManage(data).subscribe({
        next: (value) => {
          
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          console.log("GSX reponse ", response)
          if (!(response.errors == undefined || response.errors == null)) {
            this.toastMessage.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
            var errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
          }
          else {
            if (response.bulkReturn != null || response.bulkReturn != undefined) {
              console.log("Response from GSX ", response)
              this.toastMessage.info(response.bulkReturn, "Bulk Return ID: ", { closeButton: true, disableTimeOut: true })
              this.toastMessage.info(response.shipTo, "Ship To: ", { closeButton: true, disableTimeOut: true })
              this.bulkReturnId = response.bulkReturn
              this.IsBulkReturnCreated = true
              this.onSubmit()
            }
            // If Errors occur 
            else if (response?.outcome?.action == "STOP" && response?.outcome?.reasons.length > 0) {
              const reasons = response.outcome.reasons;
              // Loop through reasons
              reasons.forEach((reason, reasonIndex) => {
                const messages = reason.messages;
                console.log("Error Messages ", messages)
                messages.forEach((message, messageIndex) => {
                  this.toastMessage.error(message, "Error", { closeButton: true, disableTimeOut: true })
                });
              });
            }

          }
        },
        error: (err) => {
          console.log(err);
          this.toastMessage.error("Please try again. " + err)
          this.ngxSpinnerService.hide()
        }
      });
    }
  }

  ValidateBulkReturn() {

    if (this.NoOfBoxes == null || this.NoOfBoxes == undefined || this.NoOfBoxes == '') {
      this.toastMessage.error("No of Boxes Cannot be empty!")
      return false
    }
    if (this.SelectedToteList.length <= 0) {
      this.toastMessage.error("Please Add Atleast one Tote To Proceed !")
      return false
    }


    // ***********************************************  Validation for Parts ***********************************************  
    console.log("Final Selected Parts  ", this.finalSelectedElements)
    const somePart = this.finalSelectedElements.some(part => part.ToteNumber == null || part.ToteNumber == undefined || part.ToteNumber == '')
    console.log("Some Parts  ", somePart)
    const somePartStockPrice = this.finalSelectedElements.some(part => part.StockPrice == null || part.StockPrice == undefined || part.StockPrice == '')
    console.log("Some Parts StockPrice  ", somePartStockPrice)
    const somePartHSNCode = this.finalSelectedElements.some(part => part.HSNSACCode == null || part.HSNSACCode == undefined || part.HSNSACCode == '')
    console.log("Some Parts HSNSACCode  ", somePartHSNCode)


    const isNullOrUndefinedOrEmpty = (value) => value === null || value === undefined || value === '';
    const somePartErrors = [
      { condition: part => isNullOrUndefinedOrEmpty(part.ToteNumber), errorMessage: "Tote Number can't be empty for any Part" },
      { condition: part => isNullOrUndefinedOrEmpty(part.StockPrice), errorMessage: "Stock Price can't be empty for any Part" },
      { condition: part => isNullOrUndefinedOrEmpty(part.HSNSACCode), errorMessage: "HSNSACCode can't be empty for any Part" }
    ];

    for (const error of somePartErrors) {
      if (this.finalSelectedElements.some(error.condition)) {
        this.toastMessage.error(error.errorMessage);
        return false;
      }
    }

    // ***********************************************  Validation for Shipment Details ***********************************************  

    let requiredFields = {
      BulkReturnType: "Bulk Return Type",
      locationData: "Location",
      transportationCarrierData: "Transportation Carrier",
      trackingNumber: "Tracking Number",
      length: "Length",
      breadth: "Breadth",
      height: "Height",
      weight: "Weight",
      sealNumber: "Seal Number",
      // DistanceInKm: "Distance In Km",
      // modeofTransportData: "Mode Of Transport"
    };

    for (const field in requiredFields) {
      if (!this[field]) {
        this.toastMessage.error(`${requiredFields[field]} can't be empty`);
        return false;
      }
    }


    if (this.finalSelectedElements.length < 1) {
      this.toastMessage.error("No Parts Selected");
      return false;
    }
    else {


      return true;
    }


    // else if( somePart ){
    //   this.toastMessage.error("Tote Number can't be empty for any Part");
    //   return false; 
    // }
    // else if( somePartStockPrice ){
    //   this.toastMessage.error("Stock Price can't be empty for any Part");
    //   return false; 
    // }
    // else if( somePartHSNCode ){
    //   this.toastMessage.error("HSNSACCode cant be empty for any Part");
    //   return false; 
    // }

  }


  UpdateSelectedCount() {
    this.addedPartCount = 0
    for (let item of this.bulkPartSelectorView) {
      this.addedPartCount = parseFloat(this.addedPartCount.toString()) + parseFloat(item.quantity.toString())
    }
  }

  saveBulkReturnOrderXml() {

    console.log("Bulk Return List ", this.finalSelectedElements)
    let rawData = { "rows": [] }
    for (let item of this.finalSelectedElements) {
      rawData.rows.push({
        "row": {
          // GSX Api Data
          "OverPackBox": item.CountPack,
          "IsDeleted": item.IsDeleted,
          "IsGSXPosted": "1",
          "ToteNumber": item.ToteNumber == undefined || item.ToteNumber == null ? "" : item.ToteNumber,
          "BatteryNetWeight": item.batteryNetWeight,
          "PartDescription": item.partDescription,
          "PartCode": item.partNumber,
          "ProductDescription": item.productDescription,
          "PurchaseOrderNumber": item.purchaseOrderNumber,
          "quantity": item.quantity == undefined || item.quantity == null ? 1 : item.quantity,
          "Recieved": item.received,
          "RepairId": item.repairId,
          "StockPrice": item.StockPrice,
          "ReturnLabelPrinted": item.returnLabelPrinted == undefined || item.returnLabelPrinted == null ? "No" : item.returnLabelPrinted,
          "ReturnOrderNumber": item.returnOrderNumber,
          "sequenceNumber": item.sequenceNumber == undefined || item.sequenceNumber == null ? "" : item.sequenceNumber,
          "SerialNo": item.serialNumber,
          "vendorAddress": item.vendorAddress == undefined || item.vendorAddress == null ? undefined : item.vendorAddress,
          // For CRM DBx
          "BulkReturnOrderDetailGUID": item.BulkReturnOrderDetailGUID == null || item.BulkReturnOrderDetailGUID == undefined ? uuidv4() : item.BulkReturnOrderDetailGUID,
          "HSNSACCode": item.HSNSACCode == null || item.HSNSACCode == undefined ? '' : item.HSNSACCode,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? '' : item.GSTGroupCode,
          "issueCode": item.issueCode == null || item.issueCode == undefined ? '' : item.issueCode,
          "dangerousGoods": item.dangerousGoods == null || item.dangerousGoods == undefined ? '' : item.dangerousGoods,

        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log("xml", xml);
    return xml;
  }


  onTransportationCarrier($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TransportationCarrier, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TransportationCarrier = value;
          // this.TransporterDropdown = value
        }
      },
      error: (err) => {
        this.TransportationCarrier = this.getBlankObject();
        // this.TransporterDropdown = this.getBlankObject();
      }
    })
  }


  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
    }).subscribe({
      next: (value) => {
        if (value != null) {
          // this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
          this.LocationForJob = value;
          console.log("Location Data ", this.LocationForJob)
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  onBulkReturnType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.BulkReturnType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.BulkReturnTypeDD = value;
          console.log("Bulk Return Type ", this.BulkReturnTypeDD)
        }
      },
      error: (err) => {
        this.BulkReturnTypeDD = DropDownValue.getBlankObject();
      }
    });
  }

  removeItem(item) {
    // item.IsDeleted = item.IsDeleted == 1 ? 0 : 1;
    console.log("Item to be Deleted ", item)
    let index = this.finalSelectedElements.indexOf(item)
    console.log("Item Index to be Deleted ", index)
    if (item.IsGSXPosted == "1") {
      let shouldConfirm = item.IsDeleted == "0" ? confirm("Are you sure you want to delete this Part?") : confirm("Are you sure you want to undo the delete?")
      if (shouldConfirm == true) {
        item.IsDeleted == "0" ? this.finalSelectedElements[index].IsDeleted = "1" : this.finalSelectedElements[index].IsDeleted = "0"
      }
      else {
        return
      }
    }
    else {
      this.finalSelectedElements.splice(index, 1)
      this.bulkPartSelectorView.splice(index, 1)
    }
    console.log("After Delete ", this.finalSelectedElements)
    // this.UpdateSelectedCount()
    this.CalculateTotalStockPrice()
  }


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  printDocument() {
    ;
    var objData = { "identifiers": [] }
    objData.identifiers.push({
      "bulkReturnId": this.bulkReturnId,
      "shipTo": this.Ship_to_GSX
    })
    //  
    var documentType = ""

    if (this.printTypeData == undefined || this.printTypeData == "") {
      this.toastMessage.error("Select Print Type", "Error", { closeButton: true, disableTimeOut: true })
      return;
    }
    // if( this.isShipmentDone == '0' ){
    //   this.toastMessage.error("Shipment is not yet confirmed","Error",{closeButton:true,disableTimeOut:true})
    //   return;
    // }
    if (this.printTypeData == "All-Return-Labels") {
      documentType = "bulkReturnLabel"
      if (this.finalSelectedElements.length > 1) {
        this.fileType = "application/zip"
      }
      else {
        this.fileType = "application/pdf"
      }
    }
    else if (this.printTypeData == "Packing-List") {
      documentType = "returnsPackingList"
      this.fileType = "application/pdf"
    }
    else if (this.printTypeData == "Delivery Challan") {
      documentType = "downloadBulkReturnDC"
      this.downloadDeliveryChallan(documentType)
      return
    }
    else if (this.printTypeData == "E-Way Bill") {
      if (this.EWayBillFlag == false) {
        this.toastMessage.error("No E-Way Bill generated yet!")
        return
      }
      documentType = "downloadBulkReturnEwayBill"
      this.downloadEWayBill(documentType)
      return
    }

    this.ngxSpinnerService.show()
    var strRequestData = JSON.stringify(objData);
    var data = {
      "Content": strRequestData
      };
    this.gsxService.downloadDocument(documentType, data).subscribe(value => {
      ;
      this.ngxSpinnerService.hide()
      let response = JSON.parse(value.toString());
      if (!(response.errors == undefined || response.errors == null)) {
        ;
        var errorMessage = "";
        for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
          errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
          this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
        }
      }
      else {
        ;
        const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
        var blob = new Blob([byteArray], { type: this.fileType });
        var url = URL.createObjectURL(blob);
        window.open(url);
      }
    },
      err => {
        ;
        console.log(err);
        this.toastMessage.error("Please try again. " + err)
        this.ngxSpinnerService.hide()

      }
    );
  }

  downloadDeliveryChallan(reportType: String) {
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnOrderObject4Print",
    });
    PdfData.push({
      "Key": "BulkReturnOrderHeaderGUID",
      "Value": this.params.headerguid,
    });
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    console.log("Object ", contentRequest)
    this.reportService.downloadServiceReport(reportType, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.ngxSpinnerService.hide()
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });
  }

  downloadEWayBill(reportType: String) {
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnEWayBill4Print",
    });
    PdfData.push({
      "Key": "BulkReturnOrderHeaderGUID",
      "Value": this.params.headerguid,
    });
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    console.log("Object ", contentRequest)
    this.reportService.downloadServiceReport(reportType, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);
          this.ngxSpinnerService.hide()
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });
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
      "Value": this.locationData
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          // console.log("Location Object ",response )
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            console.log("Location Data ", data)
            this.LocationStateCode = data?.StateCode
            console.log("Location StateCode ", this.LocationStateCode)
            this.LocationObject.push(data)
          }
          else {
            console.log("error");
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  // Key Press Validations
  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // When Keypresses should only be integers
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }

    // Max Value of the Key Presses, charCode 8 is for backspaces I guess
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }


  isFileUploaded = false;
  // Initialize the file upload list with length as number of files
  FileUploadList = [];
  UploadedFileList = [];
  FinalFileObjects = '';
  FinalFileNames = '';
  FinalFileTypes = '';

  // Handle file uploads
  UploadFile(event: any, index: number) {
    // Initialize Default for this index
    this.FileUploadList[index] = {
      AttachmentFile: null, // Its of Type blob
      src: null,
      filename: '',
      type: '',
    };

    // console.log("File Data:- ",  (event.target).files);
    // Check if a file is selected
    if (event.target.files.length == 0) {
      return
    }
    let fileData = (event.target).files[0];
    // console.log("File Data :- ",fileData);

    // Check if the file is an jpeg,jpg,png  or pdf file
    if (fileData.type.match(/\/jpg|\/jpeg|\/png|\/heic|\/pdf/) == null) {
      this.toastMessage.error("Please select a jpg, jpeg, png, heic or pdf file type");
      return;
    }
    else if (fileData.size > 5 * 1024 * 1024) {
      this.toastMessage.error("File size should be less than 5MB");
      return;
    }
    const fileNameRegex = /[A-Za-z0-9_-]*/;
    const fileName = fileData.name.split('.')[0]
    if (!/^[a-zA-Z0-9-_]*$/.test(fileName)) {
      this.toastMessage.error("File name should contain only alphabets, numbers, dashes(-) or underscores(_)");
      return;
    }

    // Store the File in the exact index of FileUploadList
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    // console.log("File Reader:-", reader);
    // console.log("File Blob is:- ",fileData);
    reader.onload = (e) => {
      
      if (reader.result) {
        this.FileUploadList[index].AttachmentFile = fileData;
        this.FileUploadList[index].src = reader.result as string;
        this.FileUploadList[index].filename = fileData.name;
        this.FileUploadList[index].type = fileData.type;

        console.log("File Uploaded List:- ", this.FileUploadList);
      } else {
        this.toastMessage.error("Error: Invalid File Issue, delete and upload again!");
      }
    };
  }

  // To view the image at the specified index
  viewImage(file: any, index: number): void {
    // If Image then view else show in new tab:- 
    if (file.type.includes('image/')) {
      this.dialog.open(ImagePopupComponent, {
        data: { Imagesrc: file.src }
      });
    }
    else {
      window.open(file.src, '_blank');
    }
  }
  removeFile(file: any, index: number) {
    // Empty the Local List, the Server List and the FinalFileObjects
    this.FileUploadList[index] = {
      AttachmentFile: null, // Its of Type blob/File
      src: null,
      filename: '',
      type: '',
    }
    this.UploadedFileList[index] = {
      AttachmentFile: null,
      src: null,
      filename: '',
      type: ''
    };
  }

  // // Send to server files and get back their src paths. As server response is slow so subscribe will wait as its an async method
  // // so to make the for loop wait while subscribe results an output ie value or error, I have used async and await 
  // async sendFilesToServer(){
  //   // console.log("sendFilesToServer:- ", this.FileUploadList)

  //   this.ngxSpinnerService.show();
  //   // First Empty whole FinalFileObjects 
  //   this.FinalFileObjects ='';
  //   this.FinalFileNames ='';
  //   this.FinalFileTypes = '';

  //   // Create an array to hold all the observables for file uploads
  //   const uploadObservables = [];

  //   for (var file_index = 0; file_index < this.FileUploadList.length ; file_index++) {
  //       // If File exists in the "to be uploaded List" then get src path from server else default values from ngOnInit
  //       if (this.FileUploadList[file_index].AttachmentFile != null) { //For Sending New Files to Server
  //         // console.log("File Uploaded List:- ",this.UploadedFileList[file_index].src)
  //         // Only when file_index has no File in the Server, then send the new file to the server else do nothing
  //         if (this.UploadedFileList[file_index].src == null) { 
  //             // Create a new FormData object to Upload it in Server
  //             let fileToUpload = this.FileUploadList[file_index];
  //             let formData = new FormData();
  //             var filename = uuidv4() + "_" + fileToUpload.filename ;
  //             formData.append('file', fileToUpload.AttachmentFile, filename);

  //             const result = await lastValueFrom(this.dynamicService.uploadimagefile(formData));
  //             // Change src in the File Object:- 
  //             fileToUpload.src =  glob.GLOBALVARIABLE.SERVER_LINK + result['dbPath']              
  //             const reader = new FileReader();
  //             reader.readAsDataURL(fileToUpload.AttachmentFile);
  //             // As onload is a Async operation which sometimes leads to slow operation
  //             await new Promise((resolve, reject) => {
  //               reader.onload = (e) => {
  //                 this.UploadedFileList[file_index] = {
  //                   "AttachmentFile": reader.result as string,
  //                   "src": fileToUpload.src ,
  //                   "filename": fileToUpload.filename,
  //                   "type": fileToUpload.type,
  //                 }
  //                 // console.log("File Object from Reader inside onload:- ", this.UploadedFileList[file_index]);
  //                 resolve(e);
  //               };
  //              });
  //             console.log("index:- ",file_index, "\n The whole File Object:- ", this.UploadedFileList[file_index].AttachmentFile, "\n Actaul File Object:- ", fileToUpload.AttachmentFile);
  //         }
  //       }
  //       // Use Template literal `` instaed of '' and add ? for the condition in Ternary Operator
  //       // console.log("STRINGIFY FILE OBJECT:- ", JSON.stringify(this.UploadedFileList[file_index].AttachmentFile))
  //       if (file_index < this.UploadedFileList.length - 1) {
  //         this.FinalFileObjects += this.UploadedFileList[file_index].src == null || this.UploadedFileList[file_index].src == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].src)},`;
  //         this.FinalFileNames += this.UploadedFileList[file_index].filename == null || this.UploadedFileList[file_index].filename == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].filename)},`;
  //         this.FinalFileTypes += this.UploadedFileList[file_index].type == null || this.UploadedFileList[file_index].type == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].type)},`;
  //       } else {
  //         // No , in case it's the last index
  //         this.FinalFileObjects += this.UploadedFileList[file_index].src == null || this.UploadedFileList[file_index].src == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].src)}`;
  //         this.FinalFileNames += this.UploadedFileList[file_index].filename == null || this.UploadedFileList[file_index].filename == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].filename)}`;
  //         this.FinalFileTypes += this.UploadedFileList[file_index].type == null || this.UploadedFileList[file_index].type == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].type)}`;
  //       }        
  //     }
  //     this.ngxSpinnerService.hide();
  //     return true; // for Confirm Box, send true if user wants to continue with fewer files than noOfFilesToUpload
  // }
  async sendFilesToServer() {

    this.ngxSpinnerService.show();
    // First Empty whole FinalFileObjects 
    this.FinalFileObjects = '';
    this.FinalFileNames = '';
    this.FinalFileTypes = '';

    // Create an array to hold all the observables for file uploads
    const uploadObservables = [];

    for (var file_index = 0; file_index < this.FileUploadList.length; file_index++) {
      if (this.FileUploadList[file_index].AttachmentFile != null) {
        // Only when file_index has no File in the Server, then send the new file to the server else do nothing
        if (this.UploadedFileList[file_index].src == null) {
          // Create a new FormData object to Upload it in Server
          let fileToUpload = this.FileUploadList[file_index];
          // let formData = new FormData();
          // formData.append('file', fileToUpload.AttachmentFile, filename);
          var ext = fileToUpload.filename.split('.').pop();
          var filename = uuidv4() + "." + ext;
          const result = await this.dynamicService.uploadFileToS3Local(fileToUpload.AttachmentFile, filename)
          // Change src in the File Object:- 
          fileToUpload.src = result['dbPath']   //   glob.GLOBALVARIABLE.SERVER_LINK + result['dbPath']              
          const reader = new FileReader();
          reader.readAsDataURL(fileToUpload.AttachmentFile);
          await new Promise((resolve, reject) => {
            reader.onload = (e) => {
              
              this.UploadedFileList[file_index] = {
                "AttachmentFile": reader.result as string,
                "src": fileToUpload.src,
                "filename": fileToUpload.filename,
                "type": fileToUpload.type,
              }
              // console.log("File Object from Reader inside onload:- ", this.UploadedFileList[file_index]);
              resolve(e);
            };
          });
          console.log("index:- ", file_index, "\n The whole File Object:- ", this.UploadedFileList[file_index].AttachmentFile, "\n Actaul File Object:- ", fileToUpload.AttachmentFile);
        }
      }
      // Use Template literal `` instaed of '' and add ? for the condition in Ternary Operator
      // console.log("STRINGIFY FILE OBJECT:- ", JSON.stringify(this.UploadedFileList[file_index].AttachmentFile))
      if (file_index < this.UploadedFileList.length - 1) {
        this.FinalFileObjects += this.UploadedFileList[file_index].src == null || this.UploadedFileList[file_index].src == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].src)},`;
        this.FinalFileNames += this.UploadedFileList[file_index].filename == null || this.UploadedFileList[file_index].filename == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].filename)},`;
        this.FinalFileTypes += this.UploadedFileList[file_index].type == null || this.UploadedFileList[file_index].type == '' ? `NULL,` : `${JSON.stringify(this.UploadedFileList[file_index].type)},`;
      } else {
        // No , in case it's the last index
        this.FinalFileObjects += this.UploadedFileList[file_index].src == null || this.UploadedFileList[file_index].src == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].src)}`;
        this.FinalFileNames += this.UploadedFileList[file_index].filename == null || this.UploadedFileList[file_index].filename == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].filename)}`;
        this.FinalFileTypes += this.UploadedFileList[file_index].type == null || this.UploadedFileList[file_index].type == '' ? `NULL` : `${JSON.stringify(this.UploadedFileList[file_index].type)}`;
      }
    }
    this.ngxSpinnerService.hide();
    return true; // for Confirm Box, send true if user wants to continue with fewer files than noOfFilesToUpload
  }

  extractFileSrc(filesrc, filenames, filetypes) {
    // Split the String using Regex as normal Split wont work:- 
    const regex = /,(?![^{]*\})/; // Split using , and {}
    if (filenames == null || filenames == undefined) {
      this.isShipmentDone == '0' ? this.toastMessage.error("Invalid Files Uploaded") : '';
      return
    }
    const fileSrcArray = filesrc.split(regex);
    const fileNamesArray = filenames.split(regex);
    const fileTypesArray = filetypes.split(regex)
    // console.log("Files are:- ",fileNamesArray)


    fileSrcArray.forEach((file, index) => {
      const src = file !== "NULL" ? file.toString().slice(1, -1) : null;
      // console.log("File Names:- ", index)
      const filename = fileNamesArray[index] != "NULL" ? fileNamesArray[index].toString().slice(1, -1) : '';
      const type = fileTypesArray[index] != "NULL" ? fileTypesArray[index].toString().slice(1, -1) : '';

      this.FileUploadList[index] = {
        AttachmentFile: null,
        src: src,
        filename: filename,
        type: type
      };
      this.UploadedFileList[index] = {
        AttachmentFile: null,
        src: src,
        filename: filename,
        type: type
      };
    });

  }


  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)

    if (resp?.View == true) {
      this.isApproverPermission = true;
      this.showFileUploadOptions = true
      this.fileOptions = false
    }
    return resp != undefined && resp?.View ? true : false;
  }

  async ChangeStatus(statusClicked: string) {
    const shouldContinue = confirm("Are you sure, Do you want to Continue?");
    if (shouldContinue === false) return  // stop execution

    // Send Files to the server and get the src path from server and set Status accordingly
    if (this.showFileUploadOptions == true && statusClicked == 'SENT FOR APPROVAL') {

      if (this.FileUploadList.some(file => file.filename == null)) {
        this.toastMessage.error("Please upload all the files, if you want to continue...");
        return
      }
      if (await this.sendFilesToServer() == false) {
        this.toastMessage.error("Error in Uploading Files to Server")
        return;
      }
    }

    let requestData = []
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkApprovalStatus"
    });
    requestData.push({
      "Key": "BulkReturnId",
      "Value": this.bulkReturnId
    });
    requestData.push({
      "Key": "BulkReturnOrderHeaderGUID",
      "Value": this.bulkReturnHeaderGUID
    });
    // Always create a new ApprovalGUID
    requestData.push({
      "Key": "ApprovalGUID",
      "Value": uuidv4()
    });
    requestData.push({
      "Key": "ApprovalStatus",
      "Value": statusClicked
    });
    requestData.push({
      "Key": "ApprovalRemark",
      "Value": this.returnRemark
    });
    requestData.push({
      "Key": "ApprovalFile",
      "Value": this.FinalFileObjects
    });
    requestData.push({
      "Key": "FileNames",
      "Value": this.FinalFileNames
    });
    requestData.push({
      "Key": "CloudFlag",
      "Value": "1"
    });
    requestData.push({
      "Key": "FileTypes",
      "Value": this.FinalFileTypes
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before BulkApprovalStatus SP:-", this.FinalFileObjects.toString())
    // console.log("Before names SP:-", this.FinalFileNames )
    // console.log("Before types SP:-", this.FinalFileTypes )

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        // console.log("After BulkApprovalStatus SP:- ", response);
        if (response.ReturnCode == '0') {
          this.toastMessage.success("Status Changed Successfully")
          this.route.navigate(['auth/' + glob.getCompanyCode() + '/bulk-return-list'])
        }
        else {
          this.errorMessage = response.errorMessage
          this.toastMessage.error("Error:- ", this.errorMessage)
        }
      },
      error: (err) => {
        console.log("Error in Fetching BulkApprovalStatus Data:-  ", err)
      }
    });
  }

  validateEwayBill() {
    if (this.transportationCarrierData == null || this.transportationCarrierData == undefined || this.transportationCarrierData == '') {
      this.toastMessage.error("Transporter Id Not Found")
      return;
    }
    if (this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined || this.DeliveryChallanNo == '') {
      this.toastMessage.error("Please Transporter Document Number/ Delivery Challan No")
      return;
    }
    let requiredFields = {
      DistanceInKm: "Distance In Km",
      modeofTransportData: "Mode Of Transport"
    };

    for (const field in requiredFields) {
      if (!this[field]) {
        this.toastMessage.error(`${requiredFields[field]} can't be empty`);
        return;
      }
    }

    if (this.modeofTransportData == 'ROAD') {
      if (!this.vehicleNumber || !this.vehicleTypeData) {
        this.toastMessage.error("Please enter Vehicle Number and Vehicle Type for this mode of transport!")
        return
      }
      if (this.vehicleNumber.length < 10) {
        this.toastMessage.error("Please enter valid Vehicle Number!")
        return
      }
    }

    console.log("Vendor Object ", this.VendorObject)
    console.log("Location Object ", this.LocationObject)
    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkEWayBill"
    })
    requestData.push({
      "Key": "BulkReturnHeaderGUID",
      "Value": this.bulkReturnHeaderGUID
    })
    requestData.push({
      "Key": "DistanceInKm",
      "Value": this.DistanceInKm
    })
    requestData.push({
      "Key": "ModeOfTransport",
      "Value": this.modeofTransportData
    })
    requestData.push({
      "Key": "VehicleNo",
      "Value": this.modeofTransportData == 'ROAD' ? this.vehicleNumber : ''
    })
    requestData.push({
      "Key": "VehicleType",
      "Value": this.modeofTransportData == 'ROAD' ? this.vehicleTypeData : ''
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before EWay Bill Details", requestData)
    // // TODO
    // alert("Return On")
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          console.log("Confirm DB Response ", response)
          if (response.ReturnCode == '0') {
            this.ngxSpinnerService.hide();
            this.toastMessage.info("Bulk Return EWay Bill Details successfully updated!")
            let responseJSON = JSON.parse(response.ExtraData)

            // Same State & >= 2 Lakh plus, only then generate EWay
            if (this.VendorStateCode == this.LocationStateCode && this.totalStockPrice >= 50000) {
              this.GenerateEWayBill()
            }
            else if (this.VendorStateCode == this.LocationStateCode && this.totalStockPrice < 50000) {
              this.toastMessage.error('Eway Bill Error', "Can't generate E-Way Bill as for Same State, the Amount should be greater or equal to 2 Lakh Rs.", { closeButton: true, disableTimeOut: true })
            }

            // Different State & >= 50k plus, only then generate EWay
            if (this.VendorStateCode != this.LocationStateCode && this.totalStockPrice >= 50000) {
              this.GenerateEWayBill()
            }
            else if (this.VendorStateCode != this.LocationStateCode && this.totalStockPrice < 50000) {
              this.toastMessage.error('Eway Bill Error', "Can't generate E-Way Bill as for Different States, the Amount should be greater or equal to 50,000 Rs.", { closeButton: true, disableTimeOut: true })
            }
          }
          else {
            this.errorMessage = response.ReturnMessage;
            this.toastMessage.error(response.ReturnMessage)
          }
        },
        error: err => {
          this.ngxSpinnerService.hide();
          console.log("After SP error ", err);
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
          errors.forEach(error => {
            const messageIndex = error.indexOf("Message: ");
            if (messageIndex !== -1) {
              const messageSubstring = error.substring(messageIndex + 9).trim();
              const message = JSON.parse(messageSubstring).message;
              this.toastMessage.error("Error:- " + message);
            } else {
              this.toastMessage.error("Error parsing the error message.");
            }
          });
        }
      });

  }

  GenerateEWayBill() {
    const shouldConfirm = confirm("Are you sure you want to continue?")
    if (!shouldConfirm) {
      return
    }

    var data = {
      "BulkReturnOrderHeaderGUID": this.bulkReturnHeaderGUID
    }
    let strContentRequest = JSON.stringify(data)
    let contentRequest = {
      "content": strContentRequest
    };
    
    this.ngxSpinnerService.show()
    this.gsxService.generateEwayBill(contentRequest).subscribe(
      {
        next: (value) => {
          this.ngxSpinnerService.hide()
          console.log("EWAYBILL VALUE :", value)
          var objEwaybill = JSON.parse(value.toString());
          console.log("EWAYBILL RESULT :", objEwaybill)
          if (objEwaybill.ResponseCode == '0' || objEwaybill.code == "0") {
            this.toastMessage.success("E-Way Bill generated successfully!")
            window.location.reload()
            this.hideEwayButton = true
          }
          else {
            const errorMessage = JSON.parse(objEwaybill.message).error.message;
            this.toastMessage.error("Error: " + errorMessage);
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err);
          // this.route.navigate(['auth/' + glob.getCompanyCode() + '/bulk-return-list'])
        }
      });
  }

  ShowTotePopUp() {
    if (this.locationData == null || this.locationData == undefined || this.locationData == '') {
      this.toastMessage.error("Please Select Location Code To Proceed !");
      return
    }
    if (this.BulkReturnType == null || this.BulkReturnType == undefined || this.BulkReturnType == '') {
      this.toastMessage.error("Please Select Bulk Return Type  !");
      return
    }
    this.isTotePopUpShow = true;
    this.getToteList('')
  }
  getToteList(SearchTerm) {
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetUnusedToteList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationData
    });
    requestData.push({
      "Key": "BulkReturnType",
      "Value": this.BulkReturnType
    });
    requestData.push({
      "Key": "SearchTerm",
      "Value": ''
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.ToteList = [];
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log('response', response);
            let data = JSON.parse(response.ExtraData)
            if (data.TotalRecords <= 0) {
              this.toastMessage.error('No Tote Records Found')
              this.ngxSpinnerService.hide()
              return
            }

            this.ToteList = Array.isArray(data.ToteList.Tote)
              ? data.ToteList.Tote : [data.ToteList.Tote];
            this.ngxSpinnerService.hide()
          }
          this.ToteList.forEach(item => {
            item.IsDeleted = false;
            item.Selected = false;
          });

          console.log('ToteList', this.ToteList);
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });

  }
  
    RemoveToteItem(item) {
      
    //   remove if bulk id is not generated 
    if (this.bulkReturnId == null || this.bulkReturnId == undefined || this.bulkReturnId == '') {

      let index = this.SelectedToteList.indexOf(item)
      if (index !== -1) {
        this.SelectedToteList.splice(index, 1)
        this.finalSelectedElements.forEach(a => {
          if (a.ToteNumber === item.ToteNo) {
            a.ToteNumber = null;
          }
        })
      }
      this.sealNumber = '';
      this.sealNumber = this.SelectedToteList.map(item => item.SealNo).join(',');
      this.finalSelectedElements.forEach(x => {
        x.toteList = [];
      })
      if (this.SelectedToteList.length > 0) {
        this.finalSelectedElements.forEach(item => {
          item.toteList = this.SelectedToteList.map(obj => obj.ToteNo)
        })
      }
      else {
        this.finalSelectedElements.forEach(item => {
          item.toteList = [];
        })
      }
    }
    // change deleted flag = 1 if bulk return id is created !!
    else {

      let index = this.SelectedToteList.indexOf(item)
      if (index !== -1) {
        this.SelectedToteList[index].IsDeleted = this.SelectedToteList[index].IsDeleted == 0 ? 1 : 0
        this.finalSelectedElements.forEach(a => {
          if (a.ToteNumber === item.ToteNo) {
            a.ToteNumber = null;
          }
        })

      }
      this.finalSelectedElements.forEach(b => {
        b.toteList = this.SelectedToteList.filter(c => c.IsDeleted == 0)
      })

      // this.sealNumber = '';

      this.sealNumber = this.SelectedToteList.filter(x => x.IsDeleted == 0).map(x => x.SealNo).join(',');

    }


  }

   onTotePopUpSubmit() {
    this.ToteList.forEach(item => {
      if (
        item.Selected === true &&
        item.IsDeleted === false &&
        !this.SelectedToteList.some(
          (x: any) => x.ToteNo === item.ToteNo
        )
      ) {
        this.SelectedToteList.push(item);

        if (this.finalSelectedElements.length > 0) {
          this.finalSelectedElements.forEach(obj => {
            if (!obj.toteList) obj.toteList = []; // Ensure it's an array

            // Only add if not already present
            if (!obj.toteList.includes(item.ToteNo)) {
              obj.toteList = [...obj.toteList, item.ToteNo]; // Trigger change detection
            }
          });
        }
      }
    });
    console.log(this.finalSelectedElements)
    this.cdr.detectChanges()
    this.isTotePopUpShow = false
    this.sealNumber = '';
    this.sealNumber = this.SelectedToteList.map(item => item.SealNo).join(',');
    this.ToteIntoXml()

  }



  CloseTotePopUp() {
    this.isTotePopUpShow = false
  }


  ToteIntoXml() {
    let rawData = { "rows": [] }
    for (let item of this.SelectedToteList) {
      rawData.rows.push({
        "row": {
          "BulkReturnOrderHeaderGUID": this.bulkReturnHeaderGUID,
          "ToteGuid": item.ToteGuid,
          "ToteNo": item.ToteNo,
          "DCNo": item.DCNo,
          "AWBNo": item.AWBNo,
          "SealNo": item.SealNo,
          "IsDeleted": item.IsDeleted
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
    console.log("tote xml", xml);
    return xml;
  }

  GetToteListForHeaderGUID() {
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetToteListForHeaderGUID"
    });
    requestData.push({
      "Key": "HeaderGuidList",
      "Value": this.HeaderGuidListIntoxml()
    });
    requestData.push({
      "Key": "BulkReturnIdList",
      "Value": 'NA'
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log('response', response);
            let data = JSON.parse(response.ExtraData)
            if (data.TotalRecords <= 0) {
              this.toastMessage.error('No Tote Records Found')
              this.ngxSpinnerService.hide()
              return
            }

            this.SelectedToteList = Array.isArray(data.ToteList.Tote)
              ? data.ToteList.Tote : [data.ToteList.Tote];
            this.ngxSpinnerService.hide()
          }


          console.log('HeaderGuidListIntoxml', this.ToteList);
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });

  }




  HeaderGuidListIntoxml() {
    let rawData = { "rows": [] }
    rawData.rows.push({
      "row": {
        "BulkReturnOrderHeaderGUID": this.params.headerguid
      }
    })
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
    console.log("tote xml", xml);
    return xml;
  }

  // validation before  creating bulk return order

  ValidateBulkReturnOrder() {

    let validateBulkReturn: boolean = this.ValidateBulkReturn()
    
    if (validateBulkReturn) {

      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "ValidateBulkReturnOrder"
      });
      requestData.push({
        "Key": "BulkReturnId",
        "Value": this.bulkReturnId == null || this.bulkReturnId == undefined ? '' : this.bulkReturnId
      });
      this.bulkReturnHeaderGUID = this.params.headerguid == null || this.params.headerguid == undefined ? uuidv4() : this.params.headerguid
      requestData.push({
        "Key": "BulkReturnOrderHeaderGUID",
        "Value": this.bulkReturnHeaderGUID
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestData.push({
        "Key": "ReturnType",
        "Value": this.BulkReturnType
      })
      requestData.push({
        "Key": "TransportationCarrier",
        "Value": this.transportationCarrierData
      });
      requestData.push({
        "Key": "Length",
        "Value": this.length
      });
      requestData.push({
        "Key": "Breadth",
        "Value": this.breadth
      });
      requestData.push({
        "Key": "Height",
        "Value": this.height
      });
      requestData.push({
        "Key": "Weight",
        "Value": this.weight
      });
      requestData.push({
        "Key": "TrackingNumber",
        "Value": this.trackingNumber
      });
      requestData.push({
        "Key": "SealNumber",
        "Value": this.sealNumber
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": this.locationData
      });
      requestData.push({
        "Key": "TotalStockPrice",
        "Value": this.totalStockPrice.toFixed(2)
      });

      requestData.push({
        "Key": "ShipTo",
        "Value": this.Ship_to_GSX
      });
      requestData.push({
        "Key": "ReturnAddress",
        "Value": this.returnAddress == null || this.returnAddress == undefined ? "" : this.returnAddress
      });
      requestData.push({
        "Key": "BulkReturnOrderDetail",
        "Value": this.saveBulkReturnOrderXml()
      });
      requestData.push({
        "Key": "ReturnOrderStatus",
        "Value": this.ApprovalStatus == null || this.ApprovalStatus == undefined || this.ApprovalStatus == '' ? 'NEW' : this.ApprovalStatus
      });

      requestData.push({
        "Key": "ApprovalGUID",
        "Value": this.ApprovalGUID == null || this.ApprovalGUID == undefined || this.ApprovalGUID == '' ? '00000000-0000-0000-0000-000000000000' : this.ApprovalGUID
      });
      requestData.push({
        "Key": "ApprovalFile",
        "Value": this.FinalFileObjects == null || this.FinalFileObjects == undefined ? '' : this.FinalFileObjects
      });
      requestData.push({
        "Key": "VendorCode",
        "Value": this.VendorCode == null || this.VendorCode == undefined ? '' : this.VendorCode
      });
      requestData.push({
        "Key": "DistanceInKm",
        "Value": this.DistanceInKm == null || this.DistanceInKm == undefined ? 0 : this.DistanceInKm
      });
      requestData.push({
        "Key": "ModeOfTransport",
        "Value": this.modeofTransportData == null || this.modeofTransportData == undefined ? '' : this.modeofTransportData
      });
      requestData.push({
        "Key": "VehicleNo",
        "Value": this.vehicleNumber == null || this.vehicleNumber == undefined ? '' : this.vehicleNumber
      });
      requestData.push({
        "Key": "VehicleType",
        "Value": this.vehicleTypeData == null || this.vehicleTypeData == undefined ? '' : this.vehicleTypeData
      });
      requestData.push({
        "Key": "NoOfBoxes",
        "Value": this.NoOfBoxes == null || this.NoOfBoxes == undefined ? '' : this.NoOfBoxes
      });
      requestData.push({
        "Key": "ToteDetails",
        "Value": this.ToteIntoXml()
      });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Data sent to WSP_SAVE_ValidateBulkReturnOrder SP", requestData)
      this.ngxSpinnerService.show();
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            
            let response = JSON.parse(value.toString());
            console.log("Response from the ValidateBulkReturnOrder ", response)
            if (response.ReturnCode == '0') {
              console.log('Success from ValidateBulkReturnOrder')
                this.gsxSubmit()
              
            }
            else {
              this.errorMessage = response.ReturnMessage;
              this.toastMessage.error(response.ReturnMessage)
              this.ngxSpinnerService.hide();

            }
          },
          error: err => {
            this.ngxSpinnerService.hide();
            console.log("After SP error ", err);
            console.log("Error Message:- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toastMessage.error("Error:- ", message, { closeButton: true, disableTimeOut: true });
              } else {
                this.toastMessage.error("Error parsing the error message.");
              }
            });
          }
        });
    }
  }

    validateToteCount() {
    
    const SelectedToteSet = new Set<number>();  // for SelectedToteList
    const ItemToteSet = new Set<number>(); // // for ItemToteSet
    this.SelectedToteList.forEach(item => {
      if (item.IsDeleted == 0) {
        console.log(' item.IsDeleted', item.IsDeleted)
        SelectedToteSet.add(item.ToteNo)
      }

    })
    this.finalSelectedElements.forEach(item => {
      if (item.IsDeleted == 0) {
        console.log(' item.IsDeleted', item.IsDeleted)
        ItemToteSet.add(item.ToteNumber);
      }

    })

    console.log('SelectedToteSet', SelectedToteSet)
    console.log('SelectedToteSet length', SelectedToteSet.size)

    console.log('ItemToteSet', ItemToteSet)
    console.log('ItemToteSet length', ItemToteSet.size)

    if (ItemToteSet.size != SelectedToteSet.size) {
      this.toastMessage.error('Tote Count Mismatch !! ');

    }

    for (let tote of SelectedToteSet) {
      if (!ItemToteSet.has(tote)) {
        this.toastMessage.error(`Tote  is present in Tote Details but not added in Parts  : ${tote} `);
        return false;
      }
    }

    for (let item of ItemToteSet) {
      if (!SelectedToteSet.has(item)) {
        this.toastMessage.error('The Tote Numbers  do not match!');
        return false;
      }
    }

    return true;
  }

}