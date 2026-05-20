import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
import { lastValueFrom, BehaviorSubject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { element } from 'protractor';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { Material } from 'src/app/master/material-master/add-material-master/material-master.metadata';

@Component({
  selector: 'app-dropoff-management-parts',
  templateUrl: './dropoff-management-parts.component.html',
  styleUrls: ['./dropoff-management-parts.component.css']
})
export class DropoffManagementPartsComponent implements OnInit {


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
  ) { }

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  MaterialName: string = '';
  MaterialCode: string = '';
  MaterialDescription: string = '';
  DropoffStatus: string;
  isPopUpActive: boolean = false;
  popUpArray: any[] = [];
  DropoffLocationCode: string = '';
  ParentLocationCode: string = '';
  DropoffLocationObject: any[] = []
  ParentLocationObject: any[] = []
  finalSelectedElements: any[] = [];
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
  PartType: string;
  weight: string;
  bulkReturnHeaderGUID: string;
  VendorData: string;
  locationData: string;
  returnAddress: string;
  isShipmentDone: string = '0';
  returnOrderPartList: any[] = [];
  // finalSelectedElements: any[] = [];
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
  CaseId: string = ''; // Default value
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


  currentRange;
  pageSize: number = 10;
  pageIndex = 0
  pageCount: number;
  ErrorList: any[] = [];
  UpdatedpageSize: number = 10;
  TotalPages: number = 0
  TotalRecords: number = 0

  @ViewChild('forShipmentDetails', { static: true }) forShipmentDetails: ElementRef;
  @ViewChild('forEWayDetails', { static: true }) forEWayDetails: ElementRef;
  // For Add Part and Save Buttons
  isEdit: boolean = false; // Default is true
  isHSNChangeAllowed: boolean = false; // Default is true
  fileOptions: boolean // Default is Send for Approval Button
  isApproverPermission: boolean = false
  DeliveryChallanNo: string = '';
  deliveryChallanGUID: string;
  totalUnitPrice: number = 0;
  deliveryChallanNo: string = '';
  isDeliveryChallanType: boolean = false;
  DeliveryChallanType: String;


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
  DeliveryChallanStatusDesc;


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
  VendorTypeDD: DropDownValue = DropDownValue.getBlankObject()
  VendorObject: any[] = []
  VendorCode: string
  VendorStateCode: string;
  // Location 
  LocationCode: string
  ToLocationCode: string;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationToJob: DropDownValue = DropDownValue.getBlankObject();
  LocationObject: any[] = []
  ToLocationObject: any[] = []
  LocationStateCode: string;
  DropoffType: string;
  DropoffHeaderGUID: string;
  noOfBoxes: number = 0;

  ngOnInit(): void {

    this.DropoffType = 'PART'
    this.DropoffHeaderGUID = uuidv4()
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      this.getData()

      // this.isLocationDDshow = false;
    }
    else if (Object.keys(this.params).length == 0) {
      this.deliveryChallanGUID = uuidv4()
      this.DropoffStatus = 'NEW'

    }
    this.onDropoffLocationSearch({ term: "", item: [] });
    this.onParentLocationSearch({ term: "", item: [] })
    // this.onDeliveryChallanStatus({ term: '', items: [] })






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
    }
    else if (Object.keys(this.params).length == 0) {
      this.showFileUploadOptions = false;
      this.AddFiles = true;
      this.ApprovalStatus = 'NEW'
      this.isEdit = true;
    }

    this.onTransportationCarrier({ term: '', items: [] })
    this.onBulkReturnType({ term: "", item: [] });
    this.onDropoffLocationSearch({ term: "", item: [] });
    this.UpdateCountOverPack()
    // For E-Way Bill:- 
    // this.onModeofTransportSearch({ term: "", item: [] });
    // this.onVehicleTypeSearch({ term: "", item: [] });



  }

  options: number[] = [5, 10, 20, 50];
  selectedOption: string;


  ChangeVendor() {
    this.getLocationData('Dropoff')
    this.getLocationData('parent')

    this.showShipTo()
    // this.getLocationData('dropIff')
    this.getVendorData()


  }

  getVendorData() {

    if (this.locationData) {
      let requestData = [];
      this.VendorObject = []
      this.VendorTypeDD = DropDownValue.getBlankObject();

      if (this.params.headerguid == null || this.params.headerguid == undefined) { // To run only on new Bulk Return Creations 
        let index = this.LocationForJob.Data.findIndex(loc => loc.Id == this.locationData)
        if (index != -1) {
          this.Ship_to_GSX = this.LocationForJob.Data[index].extraDataJson.Data.SHIP_TO_GSX[0]
        }
        else {
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
                      this.toastMessage.error("Shipment not confirmed for Bulk Return Id " + item.CaseId + ". Kindly first confirm it and then create a new Bulk Return")
                    })
                  }
                  else {
                    this.toastMessage.error("Shipment not confirmed for Bulk Return Id " + recentBulkReturnObject.CaseId + ". Kindly first confirm it and then create a new Bulk Return")
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
    else {
      this.toastMessage.error("Please select location")
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

  // onModeofTransportSearch($event: { term: string; item: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.ModeOfTransport, $event.term, {
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.ModeofTransport = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.ModeofTransport = DropDownValue.getBlankObject();
  //     }
  //   });
  // }

  // onVehicleTypeSearch($event: { term: string; item: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.VehicleType, $event.term, {
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.VehicleType = value;
  //         console.log("Vehcile Type Data ", this.VehicleType)
  //       }
  //     },
  //     error: (err) => {
  //       this.VehicleType = DropDownValue.getBlankObject();
  //     }
  //   });
  // }

  // closeReturnOrderPartSelector($event) {
  //   this.isReturnOrderPartSelector = $event
  // }

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


  showSpinner() {
    this.Spinner = true;
  }

  hideSpinner() {
    this.Spinner = false;
  }

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
                  .filter(item => item.MaterialCode === part.ItemCode)
                  .forEach(item => {
                    item.HSNSACCode = part.HSNSACCode;
                    item.GSTGroupCode = part.GSTGroupCode;
                  });
              })
            }
            else {
              const index = this.finalSelectedElements.findIndex(item => item.MaterialCode === data.PartList.Part.ItemCode);
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
          "ItemCode": item.MaterialCode,
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
      "bulkReturn": this.CaseId,
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
      "Value": this.CaseId
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
  async getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDeliveryChallanObject"
    });
    requestData.push({
      "Key": "DeliveryChallanGUID",
      "Value": this.params.headerguid
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          let data = JSON.parse(response.ExtraData.toString())
          if (response.ReturnCode == '0') {

            console.log("Get DeliveryChallanHeader List", data)
            this.DropoffStatus = data?.DeliveryChallanStatus;
            this.DeliveryChallanStatusDesc = data?.DeliveryChallanStatusDesc
            console.log("from inside the get object", this.DeliveryChallanStatusDesc);
            this.CreatedDate = data?.CreatedDate
            this.totalUnitPrice = data.TotalUnitPrice
            this.deliveryChallanGUID = data.DeliveryChallanGUID
            this.deliveryChallanNo = data.DeliveryChallanNo
            this.DeliveryChallanType = data?.DeliveryChallanType
            this.transportationCarrierData = data.TransportationCarrier
            this.LocationCode = data.LocationCode
            this.ToLocationCode = data.ToLocationCode
            this.noOfBoxes = data.NoOfBoxes
            this.isShipmentDone = data.isShipmentDone
            // this.FinalFileObjects = data.ApprovalFile
            this.LocationObject.push(data.LOCATION)
            this.ToLocationObject.push(data.TOLOCATION)

            // console.log("LocationObject ", this.LocationObject)
            // console.log("ToLocationObject ", this.ToLocationObject)
            var result = []
            Array.isArray(data.DeliveryChallanDetailList.DeliveryChallanDetail) ?
              result = data.DeliveryChallanDetailList.DeliveryChallanDetail :
              result = [data.DeliveryChallanDetailList.DeliveryChallanDetail]

            for (let item of result) {

              this.totalUnitPrice = item.NetAmount
              if (item.PartDescription == null || item.PartDescription == undefined || item.PartDescription == "" && item.ProductDescription == null || item.ProductDescription == undefined || item.ProductDescription == "") {
                this.finalSelectedElements.push({

                  "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID,
                  "DeliveryChallanGUID": item.DeliveryChallanGUID,
                  "PartCode": item.PartCode,
                  "SerialNo": item.SerialNo,
                  "CaseId": item.CaseId,
                  "CaseGUID": item.CaseGuid,
                  "PartDescription": item.PartDescription,
                  "ReceivedStatus": item.ReceivedStatus,
                  "UnitPrice": item.UnitPrice,
                  "IsDeleted": item.IsDeleted,

                })
              }
              else {
              }
            }
            // this.CalculateUnitPrice()
            this.ngxSpinnerService.hide()
            // this.toLocationSearch({ term: "", item: [] })
            this.checkLocalPermission()

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
    console.log("checkStatusChanges fucntion called from dropoff management parts!");
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

  onSubmit() {



    let validateBulkReturn = this.ValidateBulkReturn()
    if (validateBulkReturn) {

      this.ngxSpinnerService.show();
      let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveDeliveryChallan"
      });
      requestData.push({
        "Key": "DeliveryChallanNo",
        "Value": this.deliveryChallanNo == null || this.deliveryChallanNo == undefined ? '' : this.deliveryChallanNo
      });
      requestData.push({
        "Key": "DeliveryChallanGUID",
        "Value": this.deliveryChallanGUID
      });
      requestData.push({
        "Key": "DeliveryChallanStatus",
        "Value": this.DropoffStatus
      });
      requestData.push({
        "Key": "DeliveryChallanType",
        "Value": 'DROPOFF'
      });

      requestData.push({
        "Key": "TransportationCarrier",
        "Value": this.transportationCarrierData
      });

      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });


      requestData.push({
        "Key": "NoOfBoxes",
        "Value": 0
      });

      requestData.push({
        "Key": "isShipmentDone",
        "Value": '0'
      });
      requestData.push({
        "Key": "LocationCode",
        "Value": this.LocationCode
      });
      requestData.push({
        "Key": "ToLocationCode",
        "Value": this.ToLocationCode
      });
      requestData.push({
        "Key": "ReturnType",
        "Value": ''
      });
      requestData.push({
        "Key": "VendorCode",
        "Value": ''
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
        "Key": "TotalUnitPrice",
        "Value": 0
      });
      requestData.push({
        "Key": "SealNumber",
        "Value": this.sealNumber
      });

      requestData.push({
        "Key": "RegistryFrom",
        "Value": ''
      });
      requestData.push({
        "Key": "PartType",
        "Value": this.PartType
      });
      requestData.push({
        "Key": "SalesPersonName",
        "Value": ''
      });

      requestData.push({
        "Key": "DeliveryChallanSubType",
        "Value": ''
      });
      requestData.push({
        "Key": "DeliveryChallanDetail",
        "Value": this.saveDropoffXml()
      });
        requestData.push({
      "Key": "DocType",
      "Value": ''
    });
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Save Dropoff  ", requestData)
      //  return

      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (Value) => {
            
            let results = []
            this.ngxSpinnerService.hide();
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);

              if (Array.isArray(data?.DeliveryChallanHeader?.DeliveryChallan)) {
                results = data?.DeliveryChallanHeader?.DeliveryChallan

              }
              else {
                results.push(data?.DeliveryChallanHeader?.DeliveryChallan)
              }
              this.toastMessage.success("Saved Successfully!");

              this.params = this.activatedRoute.snapshot.queryParams;
            
              this.route.navigate(
                ['/auth', glob.getCompanyCode(), 'dropoff-management-parts'],
                { queryParams: { headerguid: this.params.headerguid } }
              );


            }


            else {


              this.ngxSpinnerService.hide();
              console.log("Messages : ", response)
              this.errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(this.errorMessage, (error, result) => {
                console.log("Error Message: ", error)
                const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
                errorMessages.forEach((errorMessage) => {
                  this.toastMessage.error(errorMessage.ERRORMESSAGE);
                });
              });
            }
          },
          error: (err) => {
            this.toastMessage.error('error from save challan ');
            this.ngxSpinnerService.hide();
            console.log("Errro ", err);

            alert("Error from Database:- " + err.message[0]);
          }

        });

    }




  }


  saveDropoffXml() {
    let rawData = { "rows": [] }
    for (let item of this.finalSelectedElements) {
      

      console.log('this is from inside the  savedropoffxml ', item)
      rawData.rows.push({
        "row": {
          "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID == null || item.DeliveryChallanDetailGUID == undefined ? uuidv4() : item.DeliveryChallanDetailGUID,
          "DeliveryChallanGUID": this.deliveryChallanGUID,
          "PartCode": item.MaterialCode,
          "SerialNo": item.SerialNo,
          "CaseId": item.CaseId,
          "CaseGuid": item.CaseGUID,
          "UnitPrice": item.UnitPrice,
          // "ReceivedStatus": item.ReceivedStatus == null || item.ReceivedStatus == undefined ? "" : item.ReceivedStatus,
          "ReceivedStatus": item.ReceivedStatus,
          "PartDescription": item.PartDescription,
          "BatteryNetWeight": item.BatteryNetWeight,
          "OverPackBox": item.OverPackBox,
          "ToteNumber": item.ToteNumber,
          "sequenceNumber": item.sequenceNumber,
          "HSNSACCode": item.HSNSACCode,
          "GSTGroupCode": item.GSTGroupCode,
          "IsDeleted": item.IsDeleted,
        }
      })

    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log(xml, 'Dropoffxml')
    return xml;
  }

  // gsxSubmit() {

  //   let validateBulkReturn: boolean = this.ValidateBulkReturn()
  //   if (validateBulkReturn) {

  //     var objData
  //     if (this.CaseId == null || this.CaseId == undefined || this.CaseId == '') {

  //       objData = {
  //         "shipmentDetails": {
  //           "notes": "Bulk Returns",
  //           "packageMeasurements": {
  //             "length": this.length,
  //             "width": this.breadth,
  //             "weight": this.weight,
  //             "height": this.height
  //           },
  //           "carrierCode": this.transportationCarrierData,
  //           "trackingNumber": this.trackingNumber
  //         },
  //         "parts": [],
  //         "shipTo": this.Ship_to_GSX
  //       }
  //     }
  //     else {
  //       objData = {
  //         "bulkReturn": this.CaseId,
  //         "shipmentDetails": {
  //           "notes": "Bulk Returns",
  //           "packageMeasurements": {
  //             "length": this.length,
  //             "width": this.breadth,
  //             "weight": this.weight,
  //             "height": this.height
  //           },
  //           "carrierCode": this.transportationCarrierData,
  //           "trackingNumber": this.trackingNumber
  //         },
  //         "parts": [],
  //         "shipTo": this.Ship_to_GSX
  //       }
  //     }
  //     for (let item of this.finalSelectedElements) {
  //       objData.parts.push({
  //         "returnOrderNumber": item.returnOrderNumber,
  //         "sequenceNumber": parseInt(item.sequenceNumber),
  //         "overPackId": item.CountPack,
  //         "action": item.IsGSXPosted == "1" ? item.IsDeleted == "1" ? "DELETE" : "UPDATE" : "CREATE",
  //         // "partNumber": item.partNumber,
  //         "MaterialCode": item.MaterialCode,
  //         "repairId": item.repairId
  //       }
  //       )
  //     }
  //     var strRequestData = JSON.stringify(objData)
  //     var data = {
  //       "Content": strRequestData
  //     }
  //     const shouldConfirm = confirm("Are you sure you want to continue?")
  //     if (!shouldConfirm) {
  //       return
  //     }
  //     console.log("Obj Data ", objData)

  //     this.ngxSpinnerService.show()
  //     this.gsxService.ReturnsManage(data).subscribe({
  //       next: (value) => {
  //         this.ngxSpinnerService.hide()
  //         let response = JSON.parse(value.toString());
  //         console.log("GSX reponse ", response)
  //         if (!(response.errors == undefined || response.errors == null)) {
  //           this.toastMessage.error(response.errors, "Error", { closeButton: true, disableTimeOut: true })
  //           var errorMessage = "";
  //           for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
  //             errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
  //             this.toastMessage.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
  //           }
  //         }
  //         else {
  //           if (response.bulkReturn != null || response.bulkReturn != undefined) {
  //             console.log("Response from GSX ", response)
  //             this.toastMessage.info(response.bulkReturn, "Bulk Return ID: ", { closeButton: true, disableTimeOut: true })
  //             this.toastMessage.info(response.shipTo, "Ship To: ", { closeButton: true, disableTimeOut: true })
  //             this.CaseId = response.bulkReturn
  //             this.IsBulkReturnCreated = true
  //             this.onSubmit()
  //           }
  //           // If Errors occur 
  //           else if (response?.outcome?.action == "STOP" && response?.outcome?.reasons.length > 0) {
  //             const reasons = response.outcome.reasons;
  //             // Loop through reasons
  //             reasons.forEach((reason, reasonIndex) => {
  //               const messages = reason.messages;
  //               console.log("Error Messages ", messages)
  //               messages.forEach((message, messageIndex) => {
  //                 this.toastMessage.error(message, "Error", { closeButton: true, disableTimeOut: true })
  //               });
  //             });
  //           }

  //         }
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         this.toastMessage.error("Please try again. " + err)
  //         this.ngxSpinnerService.hide()
  //       }
  //     });
  //   }
  // }

  ValidateBulkReturn() {

    // ***********************************************  Validation for Parts ***********************************************  
    console.log("Final Selected Parts  ", this.finalSelectedElements)
    const somePart = this.finalSelectedElements.some(part => part.ToteNumber == null || part.ToteNumber == undefined || part.ToteNumber == '')
    console.log("Some Parts  ", somePart)
    // const somePartStockPrice = this.finalSelectedElements.some(part => part.StockPrice == null || part.StockPrice == undefined || part.StockPrice == '')
    // console.log("Some Parts StockPrice  ", somePartStockPrice)
    const somePartHSNCode = this.finalSelectedElements.some(part => part.HSNSACCode == null || part.HSNSACCode == undefined || part.HSNSACCode == '')
    console.log("Some Parts HSNSACCode  ", somePartHSNCode)



    const isNullOrUndefinedOrEmpty = (value) => value === null || value === undefined || value === '';
    const somePartErrors = [
      { condition: part => isNullOrUndefinedOrEmpty(part.ToteNumber), errorMessage: "Tote Number can't be empty for any Part" },
      // { condition: part => isNullOrUndefinedOrEmpty(part.StockPrice), errorMessage: "Stock Price can't be empty for any Part" },
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
      // BulkReturnType: "Bulk Return Type",
      // locationData: "Location",
      transportationCarrierData: "Transportation Carrier",
      trackingNumber: "Tracking Number",
      length: "Length",
      breadth: "Breadth",
      height: "Height",
      weight: "Weight",
      sealNumber: "Seal Number",
      // PartType : 'PartType'
      // DistanceInKm: "Distance In Km",
      // modeofTransportData: "Mode Of Transport"
    };

    for (const field in requiredFields) {
      if (!this[field]) {
        console.log('from the field ', field);
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
  onDropoffLocationSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.LocationDropoff, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      DocType: 'DROPOFF'
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log("Drop off ", value);
          this.LocationForJob = value;
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  onParentLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {

        if (value != null) {
          this.LocationToJob = value;

        }
      },
      error: (err) => {
        this.LocationToJob = DropDownValue.getBlankObject();
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


  locationDetails: any[] = []


  onPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      // this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      this.GetDropoffJobList('', '', this.pageIndex, this.pageSize)
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
    // this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    this.GetDropoffJobList('', '', this.pageIndex, this.pageSize)
    this.updateCurrentRange()
  }

  onNextPages() {

    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      // this.GetIncomingInvoiceList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      this.GetDropoffJobList('', '', this.pageIndex, this.pageSize)

      this.updateCurrentRange()
    }
  }

  GetDropoffJobList(MaterialCode, MaterialName, pageIndex, pageSize) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetMaterialList"
    });
    requestData.push({
      "Key": "MaterialName",
      "Value": this.MaterialName
    });
    requestData.push({
      "Key": "MateriaLCode",
      "Value": this.MaterialCode
    });
    requestData.push({
      "Key": "EEECode",
      "Value": ''
    });
    requestData.push({
      "Key": "ERPMaterialCode",
      "Value": ''
    });

    requestData.push({
      "Key": "PageNo",
      // "Value": this.pageIndex
      "Value": this.pageIndex == null || this.pageIndex == undefined ? "1" : this.pageIndex + 1
    });
    requestData.push({
      "Key": "PageSize",
      // "Value": this.pageSize
      "Value": this.pageSize == null || this.pageSize == undefined ? "10" : this.pageSize
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let results = []
          this.popUpArray = []
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);

              if (Array.isArray(data?.MaterialList?.Material)) {
                this.popUpArray = data?.MaterialList?.Material
              }
              else {
                this.popUpArray.push(data?.MaterialList?.Material)
              }



              this.detail.next({ totalRecord: data?.Totalrecords, Data: this.popUpArray });
              this.TotalRecords = data.Totalrecords
              this.pageCount = Math.ceil(data.Totalrecords / this.pageSize)
              this.updateCurrentRange()


            }
            // we are removing the objects which are alreading present in the finalslectedparts !
            this.popUpArray = this.popUpArray.filter(a =>
              !this.finalSelectedElements.find(b => b.CaseId === a.CaseId)
            );
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
  getLocationData(locationType) {
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
      "Value": locationType == 'parent' ? this.ToLocationCode : this?.LocationCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());


          locationType == 'parent' ? this.LocationObject = [] : this.ToLocationObject = []
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            if (this.ToLocationCode != data?.ParentLocationCode && data?.ParentLocationCode) {
              this.ToLocationCode = data?.ParentLocationCode;
              this.getLocationData('parent')
            }
            locationType == 'parent' ? this.LocationObject.push(data) : this.ToLocationObject.push(data)
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

    const regex = /,(?![^{]*\})/;
    if (filenames == null || filenames == undefined) {
      this.isShipmentDone == '0' ? this.toastMessage.error("Invalid Files Uploaded") : '';
      return
    }
    const fileSrcArray = filesrc.split(regex);
    const fileNamesArray = filenames.split(regex);
    const fileTypesArray = filetypes.split(regex)


    fileSrcArray.forEach((file, index) => {
      const src = file !== "NULL" ? file.toString().slice(1, -1) : null;

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
      "Value": this.CaseId
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




  /////added
  showOnlySelected = false
  // hidePopup = true
  SelectedList: any[] = []
  // popUpArray: any[] =[]

  onPopUpSubmit() {

    console.log("reached! in side the pop submit ");
    console.log(this.popUpArray);


    if (this.popUpArray.length > 0) {
      console.log("Partlist from PopUp", this.popUpArray)
      this.ngxSpinnerService.show()
      this.popUpArray.forEach(item => {
        
        if (!(this.finalSelectedElements.find(partitem => item.MaterialCode == partitem.MaterialCode)) && item.selected) {
          this.finalSelectedElements.push({

            "MaterialCode": item.MaterialCode,
            "PartCode": item.MaterialCode,
            "MaterialName": item.MaterialName,
            "PartType": item.PartType,
            "MaterialDescription": item.MaterialDescription,
            "SerialNo": '',
            "UnitPrice": 50,
            "productDescription": item.MaterialDescription,
            "PartDescription": item.MaterialDescription,
            "CaseId": '',
            "IsDeleted": "0",
            "vendorAddress": '',
            "CaseGUID": '00000000-0000-0000-0000-000000000000',
            "ReceivedStatus": item.ReceivedStatus



          })
        }
      })

      this.GetPartHSNCodes();
      console.log('finalselected ! ', this.finalSelectedElements);
      // this.CalculateTotalUnitPrice()
      this.ngxSpinnerService.hide()
    }
    this.hidePopup = true
  }

  showItem(item): Boolean {
    if (this.showOnlySelected == false) {
      if (item.isSelected == true) {
        return true
      }
      else {
        return false
      }
    }
    else {
      if (item.isSelected == true) {
        return true
      }
      else {
        return false
      }
    }
  }

  showAddParts() {

    this.isPopUpActive = true;



    if (this.LocationCode == null || this.LocationCode == undefined) {
      this.toastMessage.error("Please select  Location to add parts")
    }
    else {
      this.hidePopup = false;
      this.GetDropoffJobList('', '', '', '')

    }
  }

  hideAddParts() {
    this.hidePopup = !this.hidePopup;
    this.SelectedList.forEach((item) => {
      item.isSelected = false;
      this.popUpArray.push(item);
    });
    this.SelectedList = [];

  }

  searchText: String = "";
  showonlyselected = false;
  SelectedPartCount = 0


  callSearchChange() {

    this.GetDropoffJobList(document.getElementById('materialCodeID'), document.getElementById('MaterialNameID'), '', '')

  }


  isToShowTr(item): Boolean {

    if (this.showonlyselected == false) {
      if (this.searchText.length <= 1) {
        return true;
      } else if (item.selected == true) {
        return true;
      } else if (item.inSearch) {
        return true;
      } else {
        return false;
      }
    }
    else {
      if (item.selected == true) {
        return true;
      } else {
        return false;
      }

    }
  }

  UpdateSelectedCount() {
    this.SelectedPartCount = this.popUpArray.filter(x => x.selected == true).length;
  }


}
