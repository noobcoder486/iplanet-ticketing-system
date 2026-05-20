import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ToastPackage, ToastrService } from 'ngx-toastr';
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
  selector: 'app-dropoff-management',
  templateUrl: './dropoff-management.component.html',
  styleUrls: ['./dropoff-management.component.css']
})
export class DropoffManagementComponent implements OnInit {

  constructor(
    private toastMessage: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private reportService: ReportService,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private datePipe: DatePipe
  ) { }
  LocationCode: string
  ToLocationCode: string;
  isDeliveryChallanType: boolean = false;
  DeliveryChallanType: String;
  isShipmentDone: string;
  LocationObject: any[] = []
  ToLocationObject: any[] = []
  PartQuantityCount: number = 0;
  isDropoffType: boolean = false;
  partList: any[] = [];
  readData: boolean = true;
  transportationCarrierData: string = '';
  Length: string;
  params: any;
  Breadth: string = '';
  typeSelected = 'ball-clip-rotate';
  Height: string = '';
  noOfBoxes: number = 0;
  Weight: string = '';
  deliveryChallanGUID: string;
  NewDropoffStatus: string;
  DropoffHeaderGUID: string;
  DropoffStatus: string;
  selectedItem: any;
  DropoffType: string;
  CompanyCode: string;



  selectedStatus: string;

  onStatusChange(event: any) {
    
    //  this.selectedItem = this.statusOptions.find(option => option.id === this.selectedStatus);
    console.log('Selected item:', this.selectedItem.id);

  }

  TotalUnitPrice: number = 0;
  returnAddress: string = '';
  returnOrderPartList: any[] = [];
  finalSelectedParts: any[] = [];
  Ship_to_GSX: string;
  hideSaveButton: boolean = false;
  isLocationDisabled: boolean = false;
  disableDropoffType: boolean = false;
  selectedCallForm: any;
  selectedLocationCode;
  errorMessage: string;
  deliveryChallanNo: string = ''; // Default value
  addedPartCount: any;
  bulkPartSelectorView: any[] = [];
  ReceivedStatusDD: DropDownValue = this.getBlankObject();

  OverPackBox: any[] = []
  DropoffTypeArray: any[] = ["Parts-Pending", "Mail-In"];
  printTypeArray: any[] = ["Delivery Challan"];
  returnRemark: string;
  printTypeData: string;
  isLocationDDshow: boolean = true;
  OverPackBoxDataObj: DropDownValue;
  totalUnitPrice: number = 0;
  IsShipmentDisabled: boolean = true;
  isReceivedButton: boolean = false;
  fileType: string;
  trackingUrl: string;
  ButtonName: string
  DropoffDD: DropDownValue = this.getBlankObject();
  // DropoffType: string
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
  CreatedDate: Date;
  DeliveryChallanStatusDesc
  // For Add Part and Save Buttons
  isApproverPermission: boolean = false
  submitClicked = false
  isReturnAddress: boolean = true;

  ngOnInit(): void {
    this.DropoffType = 'PRODUCT'
    this.DropoffHeaderGUID = uuidv4()
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      this.getData()
      this.isReturnAddress = true
      this.isLocationDDshow = false;
    }
    else if (Object.keys(this.params).length == 0) {
      this.deliveryChallanGUID = uuidv4()
      this.DropoffStatus = 'NEW'
      this.IsShipmentDisabled = false
    }
     this.onLocationSearch({ term: "", item: [] });
    this.onParentLocationSearch({ term: "", item: [] })
    this.onDeliveryChallanStatus({ term: '', items: [] })
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
                this.finalSelectedParts.push({
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

  CalculateTotalUnitPrice() {
    this.totalUnitPrice = 0;
    this.PartQuantityCount = 0;
    this.finalSelectedParts.forEach(currentItem => {
      // console.log("Current Item ", currentItem)
      if (currentItem.UnitPrice != null && currentItem.UnitPrice != undefined && currentItem.UnitPrice != '') {
        if (currentItem.IsDeleted == "0") {
          this.totalUnitPrice += parseFloat(currentItem.UnitPrice.toString())
          this.PartQuantityCount += 1;
        }
      }
    })
    this.totalUnitPrice = parseFloat(this.totalUnitPrice.toFixed(2));
    console.log("Final Parts : ", this.finalSelectedParts)
  }


  locationDetails: any[] = []


  checkStatusChanges(isApproverPermission, isShipmentDone) {
    
    this.IsShipmentDisabled = true
    console.log("Approver  : ", isApproverPermission)

    if (isApproverPermission == true) {

      if (this.DropoffStatus == 'NEW') {
        this.ButtonName = 'Confirm Shipment'
        this.NewDropoffStatus = 'INTP'

      }

      else if (this.DropoffStatus == 'INTP') {
        this.ButtonName = 'Recive at parent'
        this.NewDropoffStatus = 'RAP'
        console.log('INTP');
      }


      else if (this.DropoffStatus == 'RAP') {
        this.ButtonName = 'Ship to  Dropoff'
        this.NewDropoffStatus = 'INTD'

      }
      else if (this.DropoffStatus == 'INTD') {
        this.ButtonName = 'Recieve at Dropoff'
        this.NewDropoffStatus = 'RAD'

      }
      else if (this.DropoffStatus == 'RAD') {
        this.ButtonName = 'Mark completed';
        this.NewDropoffStatus = 'SHPCF';

      }
      else if (this.DropoffStatus = 'SHPCF') {
        this.toastMessage.success('Sucessfull');
        this.route.navigate(["auth/" + glob.getCompanyCode() + "/dropoff-management"])
      }


    }
    console.log('from checkStatusChanges ', this.NewDropoffStatus)

  }



  ValidateParts() {

    // ***********************************************  Validation for Parts ***********************************************  
    // After adding parts, check if at least one part is selected



    if (this.finalSelectedParts.length > 0) {

      if(this.DropoffStatus == 'RAP' &&  !this.finalSelectedParts.every(a=> a.ReceivedStatus !== '' && a.ReceivedStatus !== null)){
          this.toastMessage.error('Select the Status ')
          return false
      }
      this.finalSelectedParts = this.finalSelectedParts.filter(item => item.IsDeleted == 0)


      this.isLocationDisabled = true;
    }


    console.log("Final Selected Parts  ", this.finalSelectedParts);
    return true
  }






  onSubmit() {

    const today = new Date();
    let ShipmentTodayDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    let ValidateParts = this.ValidateParts()
    if (ValidateParts) {
  
  
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
        "Value": ''
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
        "Value": ''
      });
      requestData.push({
        "Key": "Breadth",
        "Value": ''
      });
      requestData.push({
        "Key": "Height",
        "Value": ''
      });

      requestData.push({
        "Key": "Weight",
        "Value": ''
      });
      requestData.push({
        "Key": "TotalUnitPrice",
        "Value": this.totalUnitPrice
      });
      requestData.push({
        "Key": "SealNumber",
        "Value": ''
      });

      requestData.push({
        "Key": "RegistryFrom",
        "Value": ''
      });
      requestData.push({
        "Key": "PartType",
        "Value": ''
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
      console.log("Save Dropoff request data  ", requestData)
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
              this.route.navigate(["auth/" + glob.getCompanyCode() + "/dropoff-management-list"])

            }


            else {

              this.submitClicked = false
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
            this.toastMessage.error('unit price cannot be empty !');
            this.ngxSpinnerService.hide();
            console.log("Errro ", err);
            this.submitClicked = false;
            alert("Error from Database:- " + err.message[0]);
          }

        });

    }




  }
  CalculateUnitPrice() {
    this.totalUnitPrice = 0;
    this.finalSelectedParts.forEach(item => {
      this.totalUnitPrice += parseFloat(item.UnitPrice.toString());
    })
  }


  saveDropoffXml() {



    let rawData = { "rows": [] }
    
    for (let item of this.finalSelectedParts) {
      
      console.log('this is from inside the  savedropoffxml ', item)
      rawData.rows.push({
        "row": {
          "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID == null || item.DeliveryChallanDetailGUID == undefined ? uuidv4() : item.DeliveryChallanDetailGUID,
          "DeliveryChallanGUID": this.deliveryChallanGUID,
          "PartCode": item.PartCode,
          "SerialNo": item.SerialNo,
          "CaseId": item.CaseId,
          "CaseGuid": item.CaseGUID,
          "UnitPrice": item.UnitPrice,
          // "ReceivedStatus": item.ReceivedStatus == null || item.ReceivedStatus == undefined ? "" : item.ReceivedStatus,

          "ReceivedStatus": item.ReceivedStatus,
          // "ReceivedStatus": this.selectedStatus,
          "PartDescription": item.PartDescription,
          "ProductDescription": item.ProductDescription,
          "BatteryNetWeight": item.BatteryNetWeight,
          "ReturnLabelPrinted": item.ReturnLabelPrinted,
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

  // onDeliveryChallanStatus($event: { term: String, items: any[] }) {
  //   this.dropdownDataService.fetchDropDownData(DropDownType.DeliveryChallanStatus, $event.term, {
  //   }).subscribe({
  //     next: (value) => {
  //       if (value != null) {
  //         this.ReceivedStatusDD = value;
  //       }
  //     },
  //     error: (err) => {
  //       this.ReceivedStatusDD = this.getBlankObject();
  //     }
  //   })
  // }


  onLocationSearch($event: { term: string; item: any[] }) {
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


  // locationDetails: any[] = []


  GetDropoffJobList() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetDropoffProductList"
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
    requestData.push({
      "Key": "DropoffStatus",
      "Value": this.DropoffStatus
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

            this.popUpArray = []
            if (data.Totalrecords > 0) {
              Array.isArray(data.DropoffPartList.Dropoff) ?
                this.popUpArray = data.DropoffPartList.Dropoff :
                this.popUpArray = [data.DropoffPartList.Dropoff];

            }
            else {
              this.toastMessage.error("No Record Found!")
              return
            }



            this.popUpArray.forEach(item => {
              item.selected = false
              item.IsDeleted = false
            })

               // we are removing the objects which are alreading present in the finalslectedparts !
             this.popUpArray = this.popUpArray.filter(a => 
              !this.finalSelectedParts.find(b => b.CaseId === a.CaseId)
            );
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

    if (item?.DropoffDetailGUID != null || item?.DropoffDetailGUID != undefined) {
      this.finalSelectedParts[index].IsDeleted = "1"
    }
    else {
      this.finalSelectedParts.splice(index, 1);
      this.bulkPartSelectorView.splice(index, 1);
    }
    this.UpdateSelectedCount();
    // this.CalculateUnitPrice()
    this.CalculateTotalUnitPrice()
  }

  deletesaveitem(item) {
    item.IsDeleted = item.IsDeleted == 1 ? 0 : 1;
    let index = this.finalSelectedParts.indexOf(item);
    this.finalSelectedParts[index].IsDeleted = item.IsDeleted;
    // let anypartleft = this.finalSelectedParts.some(item => item.IsDeleted == 0);
    // if (anypartleft == false) {
    //   this.toastMessage.error("Atleast one Part is required!");
    //   this.finalSelectedParts[index].IsDeleted = "0";
    // }
    this.UpdateSelectedCount();
    //  this.CalculateUnitPrice();
    this.CalculateTotalUnitPrice()
  }

  printDocument() {

    var documentType = ""

    if (this.printTypeData == undefined || this.printTypeData == "") {
      this.toastMessage.error("Select Print Type", "Error", { closeButton: true, disableTimeOut: true })
      return;
    }


    {
      documentType = "downloadDropoff"
      this.downloadServiceReport(documentType)
      return
    }

  }

  downloadServiceReport(reportType: String = "") {
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetDropoffObject4Print",
    });
    PdfData.push({
      "Key": "DropoffGUID",
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

  FinalFileObjects = '';



  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)

    if (resp?.View == true) {
      this.isApproverPermission = true;
    }
    this.checkStatusChanges(this.isApproverPermission, '')
    return resp != undefined && resp?.View ? true : false;



  }



  // shipmentReceived() {


  //   const somePartReceivedStatus = this.finalSelectedParts.some(part => part.ReceivedStatus == null || part.ReceivedStatus == undefined || part.ReceivedStatus == '')
  //   console.log("Some Parts ReceivedStatus  ", somePartReceivedStatus)
  //   const isNullOrUndefinedOrEmpty = (value) => value === null || value === undefined || value === '';
  //   const somePartErrors = [
  //     { condition: part => isNullOrUndefinedOrEmpty(part.ReceivedStatus), errorMessage: "Received Status can't be empty for any Part" },
  //   ];

  //   for (const error of somePartErrors) {
  //     if (this.finalSelectedParts.some(error.condition)) {
  //       this.toastMessage.error(error.errorMessage);
  //       return false;
  //     }
  //   }

  //   this.DropoffStatus = 'SHPCF'
  //   this.onSubmit()
  // }


  // ReturnOrderdetail XML FOR RETURNORDERDETAIL

  ReturnOrderDetails() {
    let rawData = { "rows": [] }
    for (let item of this.finalSelectedParts) {
      rawData.rows.push({
        "row": {
          "DropoffGUID": this.deliveryChallanGUID,
          "DropoffDetailGUID": item.DropoffDetailGUID,
          "RepairDetailGuid": item.RepairDetailGUID,
          "ReceivedStatus": "SHIPMET COMPLATED"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }


  updateDropoff() {
    this.DropoffStatus = this.NewDropoffStatus
    this.onSubmit();
    // 
    // let ReqStatus = [];
    // ReqStatus.push({
    //   "Key": "APITYPE",
    //   "Value": "UpdateDropoffStatus"
    // })
    // ReqStatus.push({
    //   "Key": "DeliveryChallanGUID",
    //   "Value": this.params.headerguid
    // })
    // ReqStatus.push({
    //   "Key": "DeliveryChallanStatus",
    //   "Value": this.NewDropoffStatus
    // })

    // console.log("Update ReturnOrder:", ReqStatus)
    // let RequestJson = JSON.stringify(ReqStatus)
    // let RequestContent = {
    //   "content": RequestJson
    // }
    // this.dynamicService.getDynamicDetaildata(RequestContent).subscribe({
    //   next: (value) => {
    //     this.toastMessage.success("Updated SuccessFully");
    //     window.location.reload();

    //   }
    // })
  }

  // Pop Up Selector :- 
  showOnlySelected = false
  hidePopup = true
  SelectedList: any[] = []
  popUpArray: any[] = []

  onPopUpSubmit() {
    
    if (this.popUpArray.length > 0) {
      console.log("Partlist from PopUp", this.popUpArray)
      this.ngxSpinnerService.show()
      this.popUpArray.forEach((item, index) => {
        if (!(this.finalSelectedParts.find(caseItem => item.CaseId == caseItem.CaseId)) && item.selected) {
          this.finalSelectedParts.push({

            "PartCode": item.partNumber,
            "SerialNo": item.SerialNo1,
            // "UnitPrice": item.UnitPrice,
            "UnitPrice": 50,
            "productDescription": item.productDescription,
            "CaseId": item.CaseId,
            "IsDeleted": "0",
            "vendorAddress": item.vendorAddress,
            "CaseGUID": item.CaseGUID,
            // "ReceivedStatus": '',
            "ReceivedStatus": item.ReceivedStatus
          });
        }



      })


      this.CalculateTotalUnitPrice()
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



    if (this.LocationCode == null || this.LocationCode == undefined) {
      this.toastMessage.error("Please select From Location to add parts")
    }
    else {
      this.hidePopup = false;
      this.GetDropoffJobList()

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
  onSearchChange(text) {
    console.log(text);

    for (let item of this.popUpArray) {
      if (text.length > 1) {
        if (item.SerialNo1 && item.productDescription && item.CaseId) {
          item.inSearch = (item.SerialNo1.toLowerCase().includes(text.toLowerCase()) || item.productDescription.toLowerCase().includes(text.toLowerCase()) || item.CaseId.toLowerCase().includes(text.toLowerCase()));
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
    // this.SelectedPartCount = this.finalSelectedParts.filter(x => x.IsDeleted == 1).length;
  }




}
