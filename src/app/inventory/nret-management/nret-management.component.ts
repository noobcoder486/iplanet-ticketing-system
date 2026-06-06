import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';
import { v4 as uuidv4 } from 'uuid';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global';
import { lastValueFrom } from 'rxjs';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-nret-management',
  templateUrl: './nret-management.component.html',
  styleUrls: ['./nret-management.component.css']
})
export class NretManagementComponent implements OnInit {

  constructor(
    private toastMessage: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private datePipe:DatePipe
  ) { }
  NRETId: string;
  NRETStatus: string;
  isDeliveryChallanType:boolean = false;
  partList: any[] = [];
  readData: boolean = true;
  transportationCarrierData: string;
  length: string;
  params: any;
  breadth: string;
  typeSelected = 'ball-clip-rotate';
  height: string;
  noOfBoxes: string;
  SealNo: string;
  weight: string;
  deliveryChallanGUID: string;
  LocationCode: string
  ToLocationCode: string;
  LocationObject: any[] = []
  ToLocationObject: any[] = []
  returnAddress: string = '';
  isShipmentDone: string;
  returnOrderPartList: any[] = [];
  finalSelectedParts: any[] = [];
  Ship_to_GSX: string;
  hideSaveButton: boolean = false;
  // disableDeliveryChallanType: boolean = false;
  selectedCallForm: any;
  selectedLocationCode;
  errorMessage: string;
  deliveryChallanNo: string = ''; // Default value
  addedPartCount: any;
  bulkPartSelectorView: any[] = [];
  // CountOverPack: any = [];  
  ReceivedStatusDD: DropDownValue = this.getBlankObject();
  OverPackBox: any[] = []
  DeliveryChallanTypeArray: any[] = ["Parts-Pending", "Mail-In"];
  printTypeArray: any[] = ["Delivery Challan"];
  DeliveryChallanType: String;
  returnRemark: string;
  printTypeData: string;
  isLocationDDshow:boolean=true;
  OverPackBoxDataObj: DropDownValue;
  totalUnitPrice:number=0;
  IsShipmentDisabled:boolean=true;
  isReceivedButton:boolean  = false;
  fileType: string;
  trackingUrl: string;
  TransportationCarrier: DropDownValue = this.getBlankObject();
  DeliveryChallanDD: DropDownValue = this.getBlankObject();
  // DeliveryChallanType: string
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationToJob: DropDownValue = DropDownValue.getBlankObject();
  Spinner: string
  // Image Variables
  isFileUploads = true;
  frontImageList: any = [];
  // Define the number of file to be uploaded
  noOfFilesToUpload = 5;
  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  DeliveryChallanStatusDesc
  ApprovalStatus: string;
  CreatedDate: Date;

  // For Add Part and Save Buttons
  isApproverPermission: boolean = false
  submitClicked = false
  isReturnAddress: boolean = false;

  ngOnInit(): void {

    this.DeliveryChallanType = 'NRET'
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
     this.getData()
      this.isReturnAddress = true
      this.isLocationDDshow=false;

    }
    else if (Object.keys(this.params).length == 0) {
      this.deliveryChallanGUID = uuidv4() 
      this.ApprovalStatus = 'NEW'
      this.isShipmentDone = '0'
      this.IsShipmentDisabled = false
    }

    // this.onDeliveryChallanType({ term: '', items: [] })
    this.onTransportationCarrier({ term: '', items: [] })
    this.onDeliveryChallanStatus({ term: '', items: [] })
    this.onLocationSearch({ term: "", item: [] });
    // this.onToLocationSearch ( { term: "", item: []})
  }


  showToLocation() {
    this.ToLocationCode = 'CBE'
    this.getToLocationData()
    this.getLocationData()
  }
  // saveConfirmedShipment() {
  //   this.ngxSpinnerService.show()
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "SaveConfirmShipment"
  //   })
  //   requestData.push({
  //     "Key": "DeliveryChallanNo",
  //     "Value": this.deliveryChallanNo
  //   })
  //   requestData.push({
  //     "Key": "DeliveryChallanGUID",
  //     "Value": this.deliveryChallanGUID
  //   })
  //   requestData.push({
  //     "Key": "TrackingUrl",
  //     "Value": this.trackingUrl
  //   })
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         let response = JSON.parse(value.toString());
  //         if (response.ReturnCode == '0') {
  //           this.toastMessage.success("Successfully Parts Added")
  //           this.ngxSpinnerService.hide();
  //         }
  //         else {
  //           this.errorMessage = response.ReturnMessage;
  //           this.toastMessage.error(response.ReturnMessage)
  //         }
  //       },
  //       error: err => {
  //         console.log(err);
  //         this.ngxSpinnerService.hide();
  //       }
  //     });
  // }

  

  getData() {
    debugger
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
          debugger
          let response = JSON.parse(value.toString());
          let data = JSON.parse(response.ExtraData.toString())
          if (response.ReturnCode == '0') {
            console.log("Get DeliveryChallanHeader List",data)
            this.ApprovalStatus = data?.DeliveryChallanStatus;
            this.DeliveryChallanStatusDesc = data?.DeliveryChallanStatusDesc
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
            this.FinalFileObjects = data.ApprovalFile
            // this.FinalFileNames = data.BulkStatusList?.FileNames
            // this.FinalFileTypes = data.BulkStatusList?.FileTypes
            // this.returnRemark = data.BulkStatusList?.ApprovalRemark
            this.getToLocationData()
            this.getFromLocationData()
            var result = []
            Array.isArray(data.DeliveryChallanDetailList.DeliveryChallanDetail) ? 
              result = data.DeliveryChallanDetailList.DeliveryChallanDetail :
                result = [data.DeliveryChallanDetailList.DeliveryChallanDetail]

            for (let item of result) {
             this.totalUnitPrice = item.NetAmount
              if(item.PartDescription == null || item.PartDescription == undefined || item.PartDescription ==  ""  && item.ProductDescription == null || item.ProductDescription == undefined || item.ProductDescription == "" ){
                this.finalSelectedParts.push({
                  "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID,
                  "DeliveryChallanGUID":item.DeliveryChallanGUID,
                  "PartCode": item.PartCode,
                  "SerialNo": item.SerialNo ,
                  "CaseId":item.CaseId,
                  "CaseGUID":item.CaseGuid,
                  "PartDescription":item.PartDescription,
                  "ReceivedStatus":item.ReceivedStatus ,   
                  "UnitPrice":item.UnitPrice ,               
                  "IsDeleted": item.IsDeleted,
                })
              }
              else{
              }
            }
            this.CalculateUnitPrice()
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

  getFromLocationData() {
    if (this.LocationCode == null || this.LocationCode == undefined) {
      this.LocationObject = []
      return
    }

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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          this.LocationObject = []
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            this.LocationObject.push(data)
            const latestItem = this.LocationObject[this.LocationObject.length - 1];
            this.returnAddress = latestItem.LocationName + ', ' + (latestItem.Address1 || '') + ', ' + (latestItem.Address2 || '') + ', ' + latestItem.City + ', ' + (latestItem.ZipCode || '') + ', ' + latestItem.StateCode + ', ' + latestItem.CountryCode;
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

  CalculateTotalUnitPrice(){
    this.totalUnitPrice = 0
    this.finalSelectedParts.forEach( currentItem =>{
      // console.log("Current Item ", currentItem)
      if (currentItem.UnitPrice != null && currentItem.UnitPrice != undefined && currentItem.UnitPrice != '') {
        if(currentItem.IsDeleted == "0" ){
          this.totalUnitPrice += parseFloat(currentItem.UnitPrice.toString())
        }
      }
    })
    this.totalUnitPrice = parseFloat(this.totalUnitPrice.toFixed(2));
    console.log("Final Parts : ", this.finalSelectedParts)
  }

  checkStatusChanges(isApproverPermission, isShipmentDone) {
    this.IsShipmentDisabled = true
    console.log("Approver  : ", isApproverPermission)
    if (isApproverPermission == true) {
      
      if (this.ApprovalStatus == 'INTR') {
        this.isReceivedButton = true
      }
      else if (this.ApprovalStatus == 'SHPCF') {
      }

    }
    else if (this.ApprovalStatus == 'NEW') {
      this.IsShipmentDisabled = false
    }
    else  if (this.ApprovalStatus == 'INTR') {
    }
    else if (this.ApprovalStatus == 'SHPCF') {
    }
  }


  // checkStatusChanges(isApproverPermission, isShipmentDone) {
  //   this.showFileUploadOptions = true;
  //   this.showFileButtons = false;
  //   this.isEdit = false;
  //   this.showRemarkButton = false
  //   this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
  //   this.disableRemarkButton = true
  //   if (isApproverPermission == true) {
  //     if (this.ApprovalStatus == 'NEED MORE INFORMATION') {
  //       this.showRemarkButton = true
  //     }
  //     else if (this.ApprovalStatus == 'SENT FOR APPROVAL') {
  //       this.fileOptions = false
  //       this.showFileButtons = true;
  //       this.showRemarkButton = true;
  //       this.disableRemarkButton = false
  //     }
  //     else if (this.ApprovalStatus == 'NEW') {
  //       if (this.FileUploadList.some(file => { file?.src != null || file?.src != undefined })) {
  //         this.showFileButtons = true    
  //         this.fileOptions = false;
  //       }
  //     }
  //     else if (this.ApprovalStatus == 'APPROVED' || this.ApprovalStatus == 'REJECTED') {
  //       this.showFileButtons = false
  //       this.showRemarkButton = true
  //     }
  //   }
  //   else if (this.ApprovalStatus == 'NEW') {
  //     this.fileOptions = true
  //     this.showFileButtons = true
  //   }
  //   else if (this.ApprovalStatus == 'SENT FOR APPROVAL') {
  //   }
  //   else if (this.ApprovalStatus == 'APPROVED' || this.ApprovalStatus == 'REJECTED') {
  //     this.showFileButtons = false
  //     this.disableRemarkButton = true
  //     if (this.ApprovalStatus == 'APPROVED') {
  //       this.showRemarkButton = true
  //       isShipmentDone == 0 ? this.hideShipmentButton = false : this.hideShipmentButton = true // Enable Confirm Shipment Button
  //     }
  //   }
  //   else if (this.ApprovalStatus == 'NEED MORE INFORMATION') {
  //     this.showFileButtons = true
  //     // this.isEdit= true;
  //     // Show Remark but disable it
  //     this.showRemarkButton = true
  //     this.disableRemarkButton = true
  //   }
  //   else {
  //     // this.toastMessage.error("Error in Status, contact IT")
  //     this.showFileUploadOptions = false;
  //     // Disable Shipment Details and hide buttons:- 
  //     this.forShipmentDetails.nativeElement.parentElement.classList.add('disabled-select')
  //     // Show Remark but disable it
  //     this.disableRemarkButton = true
  //   }

  //   if (isShipmentDone == 0) {
  //     // Hide Add Parts and Save Buttonst
  //     this.isEdit = true;
  //     this.showRemarkButton = false
  //   }
  //   else if (isShipmentDone == 1) {
  //     // Hide Add Parts and Save Buttons
  //     this.isEdit = false;
  //     this.showRemarkButton = false
  //   }
  // }

  ValidateDeliveryChallan(){

    // ***********************************************  Validation for Parts ***********************************************  
    console.log("Final Selected Parts  ", this.finalSelectedParts)
    const somePartUnitPrice = this.finalSelectedParts.some(part => part.UnitPrice == null || part.UnitPrice == undefined || part.UnitPrice == 0)
    console.log("Some Parts StockPrice  ", somePartUnitPrice)
    // const somePartHSNCode = this.finalSelectedParts.some(part => part.HSNSACCode == null || part.HSNSACCode == undefined || part.HSNSACCode == '')
    // console.log("Some Parts HSNSACCode  ", somePartHSNCode)


    const isNullOrUndefinedOrEmpty = (value) => value === null || value === undefined || value === '';
    const somePartErrors = [
      { condition: part => isNullOrUndefinedOrEmpty(part.UnitPrice), errorMessage: "Unit Price can't be empty for any Part" },
      // { condition: part => isNullOrUndefinedOrEmpty(part.HSNSACCode), errorMessage: "HSNSACCode can't be empty for any Part" }
    ];
  
    for (const error of somePartErrors) {
      if (this.finalSelectedParts.some(error.condition)) {
        this.toastMessage.error(error.errorMessage);
        return false;
      }
    }

    // ***********************************************  Validation for Shipment Details ***********************************************  

    let requiredFields = {
      LocationCode: "Location",
      ToLocationCode: "To Location",
      transportationCarrierData: "Transportation Carrier",
      noOfBoxes: "No Of Boxes",
    };

    for (const field in requiredFields) {
        if (!this[field]) {
            this.toastMessage.error(`${requiredFields[field]} can't be empty`);
            return false; 
        }
    }
 
  
    if (this.finalSelectedParts.length < 1 ) {
      this.toastMessage.error("No Parts Selected");
      return false; 
    }
    else{
      return true; 
    }
  }

  onSubmit() {
    debugger
    const today = new Date();
    let ShipmentTodayDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    let validateDeliveryChallan: boolean = this.ValidateDeliveryChallan()
    if (validateDeliveryChallan){
    
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
        "Value": this.ApprovalStatus  
      });
      requestData.push({
        "Key": "DeliveryChallanType",
        "Value": this.DeliveryChallanType
      })
      requestData.push({
        "Key": "TransportationCarrier",
        "Value": this.transportationCarrierData
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      // requestData.push({
      //   "Key": "TotalQty",
      //   "Value": this.finalSelectedParts.length
      // });
      requestData.push({
        "Key": "TotalUnitPrice",
        "Value": this.totalUnitPrice
      });
      requestData.push({
        "Key": "isShipmentDone",
        "Value": this.isShipmentDone
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
        "Key": "SealNumber",
        "Value": this.SealNo 
      });
      requestData.push({
        "Key": "NoOfBoxes",
        "Value": this.noOfBoxes == null || this.noOfBoxes == undefined ? "" : this.noOfBoxes
      });
        requestData.push({
      "Key": "DocType",
      "Value": ''
    });
      requestData.push({
        "Key": "DeliveryChallanDetail",
        "Value": this.saveDeliveryChallanXml()
      });
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log("Save DC ", requestData)
      //  return
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            this.ngxSpinnerService.show();
            let response = JSON.parse(value.toString());
            this.submitClicked = false
            if (response.ReturnCode == '0') {
              this.toastMessage.success("Successfully Parts Added")
              this.route.navigate(["auth/" + glob.getCompanyCode() + "/nret-management-list"], { queryParams: { headerguid: this.deliveryChallanGUID } })
              this.ngxSpinnerService.hide();
            }
            else {
              this.errorMessage = response.ReturnMessage;
              this.toastMessage.error(response.ReturnMessage)
            }
          },
          error: err => {
            console.log("Errro ", err);
            this.submitClicked = false;
            this.ngxSpinnerService.hide();
            alert("Error from Database:- " + err.message[0]);
          }
        });
    
    }

  }

  CalculateUnitPrice(){
    this.totalUnitPrice = 0;
    this.finalSelectedParts.forEach( item =>{
      this.totalUnitPrice  += parseFloat(item.UnitPrice.toString());
    })
  }

  saveDeliveryChallanXml() {
    
    let rawData = { "rows": [] }
    for (let item of this.finalSelectedParts) {
      rawData.rows.push({
        "row": {
          "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID == null || item.DeliveryChallanDetailGUID == undefined ? uuidv4() : item.DeliveryChallanDetailGUID,
          "DeliveryChallanGUID": this.deliveryChallanGUID,
          "PartCode":item.PartCode == null || item.PartCode == undefined ?"" : item.PartCode,
          "SerialNo": item.SerialNo,
          "PartDescription": item.PartDescription,
          "CaseId": item.CaseId,
          "CaseGuid":item.CaseGUID,
          "UnitPrice":item.UnitPrice,
          "HSNSACCode":item.HSNSACCode == null || item.HSNSACCode == undefined ? "" : item.HSNSACCode,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode ? "" : item.GSTGroupCode,
          "ReceivedStatus": item.ReceivedStatus == null || item.ReceivedStatus == undefined ? "" : item.ReceivedStatus, 
          "IsDeleted": item.IsDeleted ,
          // "ReceivedFlag":"0",
        }
      })

    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("xml ", xml)
    return xml;
  }

  // onDeliveryChallanType($event: { term: String, items: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanType, $event.term, {
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.DeliveryChallanDD = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.DeliveryChallanDD = this.getBlankObject();
  //     }
  //   })
  // }

  onTransportationCarrier($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DCTransportationCarrier, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TransportationCarrier = value;
        }
      },
      error: (err) => {
        this.TransportationCarrier = this.getBlankObject();
      }
    })
  }
  onDeliveryChallanStatus($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanPartStatus, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ReceivedStatusDD = value;
        }
      },
      error: (err) => {
        this.ReceivedStatusDD = this.getBlankObject();
      }
    })
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {

        if (value != null) {
          this.LocationForJob = value;
          console.log('this.LocationForJob',this.LocationForJob)

        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }

  onToLocationSearch($event: { term: string; item: any[] }) {
    debugger
    this.dropdownDataService.fetchDropDownData(DropDownType.BindNretToLocation, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      LocationCode: this.LocationCode

    }).subscribe({
      next: (value) => {
          debugger
        if (value != null) {
          
          this.LocationToJob = value;
           this.ToLocationCode = this.LocationToJob.Data[0].Id
           this.getToLocationData()
          
        }
      },
      error: (err) => {
        this.LocationToJob = DropDownValue.getBlankObject();
      }
    });
  }

  getLocationData() {
    if (this.LocationCode == null || this.LocationCode == undefined) {
      this.LocationObject = []
      return
    }

    if (this.params?.headerguid == null || this.params?.headerguid == undefined){
     this.onToLocationSearch ( { term: "", item: []})
         
    }

    this.LocationObject =[]
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.Location;
            this.LocationObject.push(data)
            console.log("To LocationCode:", this.LocationObject)
            const latestItem = this.LocationObject[this.LocationObject.length - 1];
            this.returnAddress = latestItem.LocationName + ', ' + (latestItem.Address1 || '') + ', ' + (latestItem.Address2 || '') + ', ' + latestItem.City + ', ' + (latestItem.ZipCode || '') + ', ' + latestItem.StateCode + ', ' + latestItem.CountryCode;
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

  locationDetails:any[]=[]
  getToLocationData() {
    debugger
    if (this.ToLocationCode == null || this.ToLocationCode == undefined) {
      this.ToLocationObject = []
      return
    }
    this.ToLocationObject = []
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetNretLocationObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    requestData.push({
      "Key": "ToLocationCode",
      "Value": this.ToLocationCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          debugger
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') { 
            this.ToLocationObject = []
            let data = JSON.parse(response.ExtraData)?.Location;
            this.ToLocationObject.push(data);
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


  GetNretManagementList() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetNretManagementList"
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
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') { 
            let data = JSON.parse(response.ExtraData);
            
            this.popUpArray =[]
            if ( data.Totalrecords > 0 ){
                Array.isArray(data.NretManagementList.NretManagement) ?
                  this.popUpArray = data.NretManagementList.NretManagement :
                      this.popUpArray = [data.NretManagementList.NretManagement]
            }
            else{
              this.toastMessage.error("No Record Found!")
              return
            }

            this.popUpArray.forEach( item => {
              item.selected = false
              item.IsDeleted = false
            })

            // this.ToLocationObject.push(data);
            // const latestItem = this.ToLocationObject[this.ToLocationObject.length - 1];
            // this.locationDetails.push(latestItem)
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


  removeItem(item) {
    
    item.isDeleted = item.isDeleted == 1 ? 0 : 1;
    let index = this.finalSelectedParts.indexOf(item)
   
    if (item?.DeliveryChallanDetailGUID != null || item?.DeliveryChallanDetailGUID != undefined) {
      this.finalSelectedParts[index].IsDeleted = "1"
    }
    else {
      this.finalSelectedParts.splice(index, 1);
      this.bulkPartSelectorView.splice(index, 1);
    }
    this.UpdateSelectedCount();
    this.CalculateUnitPrice();
  }

  deletesaveitem(item) {
    item.IsDeleted = item.IsDeleted == 1 ? 0 : 1;
    let index = this.finalSelectedParts.indexOf(item);
    this.finalSelectedParts[index].IsDeleted = item.IsDeleted;
    let anypartleft = this.finalSelectedParts.some(item => item.IsDeleted == 0);
    if (anypartleft == false) {
      this.toastMessage.error("Atleast one Part is required!");
      this.finalSelectedParts[index].IsDeleted = "0";
    }
    this.UpdateSelectedCount();
     this.CalculateUnitPrice();
  }

  printDocument() {
  
    var documentType = ""

    if(this.printTypeData==undefined || this.printTypeData=="")
    {
      this.toastMessage.error("Select Print Type","Error",{closeButton:true,disableTimeOut:true})
      return;
    }

    else if(this.printTypeData=="Delivery Challan")
    {
      documentType="downloadDeliveryChallan"
      this.downloadServiceReport(documentType)
      return
    }
   
    }

  downloadServiceReport(reportType: String="") {
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetDeliveryChallanObject4Print",
    });
    PdfData.push({
      "Key": "DeliveryChallanGUID",
      "Value": this.params.headerguid,
    });
    let pdfRequestData = JSON.stringify(PdfData);
    let contentRequest =
    {
      "content": pdfRequestData
    };
    this.reportService.downloadServiceReport(reportType, contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
          var blob = new Blob([byteArray], { type: 'application/pdf' });
          var url = URL.createObjectURL(blob);
          window.open(url);

        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });
  }

  // Key Press Validations
  onKeyPress(event: KeyboardEvent, validationType: string, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which || event.keyCode;
    const charStr = String.fromCharCode(charCode);
    if (validationType === 'int') {
      if (!/^[0-9]*$/.test(charStr)) {
        event.preventDefault();
      }
    } else if (validationType === 'alpha') {
      if (!/^[a-zA-Z]*$/.test(charStr)) {
        event.preventDefault();
      }
    }
    if (input.value.length >= maxLength && charCode !== 8) {
      event.preventDefault();
    }
  }

  isFileUploaded = false;
  FileUploadList = [];
  UploadedFileList = [];
  FinalFileObjects = '';
  FinalFileNames = '';
  FinalFileTypes = '';

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    
    if (resp?.View == true) {
      this.isApproverPermission = true;
    }
    this.checkStatusChanges(this.isApproverPermission, this.isShipmentDone)
    return resp != undefined && resp?.View ? true : false;

  }

  ConfirmShipment(){
    if(this.transportationCarrierData == null || this.transportationCarrierData == undefined ){
      this.toastMessage.error('Kindly select a Transportation Carrier')
        return
      }

    if(this.noOfBoxes == null || this.noOfBoxes == undefined || this.noOfBoxes ==""){
      this.toastMessage.error('Kindly Enter No Of Boxes')
        return
    }
    this.ApprovalStatus = 'INTR'
    this.isShipmentDone = '1'
    this.onSubmit()
  }

  shipmentReceived() {
    if(this.transportationCarrierData == null || this.transportationCarrierData == undefined ){
      this.toastMessage.error('Kindly select a Transportation Carrier')
        return
      }

    if(this.noOfBoxes == null || this.noOfBoxes == undefined || this.noOfBoxes ==""){
      this.toastMessage.error('Kindly Enter No Of Boxes')
        return
    }

    const somePartReceivedStatus = this.finalSelectedParts.some(part => part.ReceivedStatus == null || part.ReceivedStatus == undefined || part.ReceivedStatus == '')
    console.log("Some Parts ReceivedStatus  ", somePartReceivedStatus)
    const isNullOrUndefinedOrEmpty = (value) => value == null || value == undefined || value == '';
    const somePartErrors = [
      // { condition: part => isNullOrUndefinedOrEmpty(part.ReceivedStatus), errorMessage: "Received Status can't be empty for any Part" },
    ];
  
    for (const error of somePartErrors) {
      if (this.finalSelectedParts.some(error.condition)) {
        this.toastMessage.error(error.errorMessage);
        return false;
      }
    }

    this.ApprovalStatus = 'SHPCF'
    this.isShipmentDone = '1'
    this.onSubmit()
  }


  // ReturnOrderdetail XML FOR RETURNORDERDETAIL
  SaveReturnOrderDetails() {
    let rawData = { "rows": [] }
    for (let item of this.finalSelectedParts) {
      rawData.rows.push({
        "row": {
          "DeliveryChallanGUID": this.deliveryChallanGUID,
          "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID,
          "RepairDetailGuid":item.RepairDetailGUID,
          "ReceivedStatus":"SHIPMET COMPLATED"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  UpdateTrackingNumbet(){
    let ReqStatus=[];
    ReqStatus.push({
      "Key":"APITYPE",
      "Value":"UpdateDeliveryChallanHeader"
    })
    ReqStatus.push({
      "Key":"DeliveryChallanGUID",
      "Value": this.params.headerguid
    })
    ReqStatus.push({
      "Key":"TrackingNumber",
      "Value":this.noOfBoxes
    })
    console.log("Update ReturnOrder:",ReqStatus)
    let RequestJson = JSON.stringify(ReqStatus)
    let RequestContent = {
      "content":RequestJson
    }
    this.dynamicService.getDynamicDetaildata(RequestContent).subscribe({
      next:(value)=>{ 
        this.toastMessage.success("Updated SuccessFully");
        window.location.reload();
      }
    })
  }

  // Pop Up Selector :- 
  showOnlySelected = false
  hidePopup = true
  SelectedList: any[] =[]
  popUpArray: any[] =[]

  onPopUpSubmit(){
    
      if (this.popUpArray.length  > 0 ) {
        console.log("Partlist from PopUp", this.popUpArray)
        this.ngxSpinnerService.show()
        this.popUpArray.forEach( item => {
          if( !(this.finalSelectedParts.find(caseItem => item.CaseId == caseItem.CaseId)) && item.selected)
          {
            this.finalSelectedParts.push({

              "PartCode": item.PartCode,
              "SerialNo": item.SerialNo1,
              "UnitPrice": 50,
              "PartDescription": item.PartDescription,
              "CaseId": item.CaseId,
              "IsDeleted": "0",
              "vendorAddress": item.vendorAddress,
              "CaseGUID":item.CaseGUID,
              "ReceivedStatus": '', 
            })
          }
        })
        this.CalculateTotalUnitPrice()
        this.ngxSpinnerService.hide()
      }
      this.hidePopup = true  
  }

  showItem(item): Boolean{
    if(this.showOnlySelected == false){
      if(item.isSelected == true){
        return true
      }
      else{
        return false
      }
    }
    else{
      if(item.isSelected == true){
        return true
      }
      else{
        return false
      }
    }
  }

  showAddParts(){
    if (this.DeliveryChallanType == null || this.DeliveryChallanType == undefined) {
      this.toastMessage.error("Please Select Return Type to add parts")
    }
    else if (this.LocationCode == null || this.LocationCode == undefined) {
        this.toastMessage.error("Please select From Location to add parts")
      }
    else {
      this.hidePopup = false;
      this.GetNretManagementList() 
      // if (this.finalSelectedParts.length != 0){
      //   this.popUpArray.forEach((item) => item.isSelected = false);
      // }
    }
  }

  hideAddParts(){
    this.hidePopup = !this.hidePopup;
    this.SelectedList.forEach((item) => {
      item.isSelected = false;
      this.popUpArray.push(item);
    });
    
    this.SelectedList = [];
  }

  searchText: String = "";
  showonlyselected = false
  SelectedPartCount = 0
  onSearchChange(text) {
    console.log(text);

    for (let item of this.popUpArray) {
      if (text.length > 1) {
        if(item.SerialNo1 && item.PartDescription && item.CaseId){
          item.inSearch = (item.SerialNo1.toLowerCase().includes(text.toLowerCase()) || item.PartDescription.toLowerCase().includes(text.toLowerCase()) || item.CaseId.toLowerCase().includes(text.toLowerCase()));
        }
      } else {
        item.inSearch = false;
      }
    }
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



