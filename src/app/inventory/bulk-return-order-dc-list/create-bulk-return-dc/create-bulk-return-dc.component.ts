import { Component, OnInit } from '@angular/core';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from 'src/app/config/global';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { findIndex } from 'rxjs';
import { DatePipe } from '@angular/common'
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagePopupComponent } from 'src/app/custom-components/create-job-customer/image-popup/image-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from 'src/app/common/Services/gsxService/report.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';




@Component({
  selector: 'app-create-bulk-return-dc',
  templateUrl: './create-bulk-return-dc.component.html',
  styleUrls: ['./create-bulk-return-dc.component.css']
})
export class CreateBulkReturnDcComponent implements OnInit {

  constructor(
    private dropdownDataService: DropdownDataService,
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private DatePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private route: Router,
    private reportService: ReportService,
    private gsxService: GsxService,



  ) { }

  ModeofTransport: DropDownValue = DropDownValue.getBlankObject();
  VehicleType: DropDownValue = DropDownValue.getBlankObject();
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  TransportationCarrier: DropDownValue = this.getBlankObject()
  BulkReturnTypeDD: DropDownValue = this.getBlankObject();
  VendorTypeDD: DropDownValue = this.getBlankObject()
  ToteList: any[] = [];
  isTotePopUpShow: boolean = false;
  SelectedToteList: any[] = [];
  SelectedTransportationCarrier: any


  // 
  Header: any[] = []
  Details: any[] = []
  ToteDetails: any[] = []

  LocationCode: any;
  LocationObject: any[] = [];
  Ship_to_GSX: any;

  VendorObject: any[] = [];
  VendorCode: any

  BulkReturnType = 'KBB'
  PopUpArray: any[] = [];
  isPopShow: boolean = false;

  SelectedParts: any[] = [];
  FinalSelectedParts: any[] = [];
  FinalSelectedPartDetails: any[] = [];

  SelectedPartsCount: any

  CreatedDate: any
  Status: any
  DeliveryChallanNo: any
  // Shipment Details
  Length: any
  Breadth: any
  Width: any
  Height: any
  NoOfBoxes: any
  TransortationCarrier: any
  TrackingNo: any
  SealNo: any

  ShowPartDetails: boolean = false
  ShowPart: boolean = true
  PartButtonName = 'Parts'
  BulkReturnOrderDCHeaderGUID: any
  params: any

  // E-way bill details
  DistanceInKm: any;
  ModeOfTransportData: any
  VehicleNumber: any
  VehicleTypeData: any

  isShipmentDone: string = '0';

  // Image details
  isFileUploaded = true;
  FileUploadList = [];
  UploadedFileList = [];
  FinalFileObjects = '';
  FinalFileNames = '';
  FinalFileTypes = '';
  isFileUploads = true;
  frontImageList: any = [];
  noOfFilesToUpload = 6;
  showFileUploadOptions = true;
  showFileButtons = true;
  AddFiles = true;
  fileOptions: boolean

  isApproverPermission: boolean = false
  ApproverRemark: any


  BulkReturnIdGuids: any[] = [];

  printTypeArray: any[] = ["E-Way Bill"];
  printTypeData: string;

  EWayBillFlag:any;
  QRData: any;
  EWayBillDate: any;
  EWayBillNo: any;
  EWayValidUpto: any;
  ewayerrorcode: any;
  ewayerrormessage: any;
  Response: any;
  TrackingURL: any;
  TrackingNumber:any;
   ReturnAddress:any;


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
  ngOnInit(): void {
    this.CreatedDate = this.DatePipe.transform(new Date || 'yyyy-MM-dd')
    this.Status = 'NEW'
    this.BulkReturnOrderDCHeaderGUID = uuidv4()
    this.onLocationSearch({ term: "", item: [] });
    this.onBulkReturnType({ term: "", item: [] });
    this.onTransportationCarrier({ term: '', items: [] })
    this.onModeofTransportSearch({ term: "", item: [] });
    this.onVehicleTypeSearch({ term: "", item: [] });


    
    this.params = this.activatedRoute.snapshot.queryParams;
    console.log('this.params', this.params)

    if (this.params.BulkReturnOrderDCHeaderGUID != null || this.params.BulkReturnOrderDCHeaderGUID != undefined) {
      this.BulkReturnOrderDCHeaderGUID = this.params.BulkReturnOrderDCHeaderGUID

      for (let i = 0; i < this.noOfFilesToUpload; i++) {
        this.FileUploadList[i] = { AttachmentFile: null, src: null, filename: '', type: '' };
        this.UploadedFileList[i] = { AttachmentFile: null, src: null, filename: '', type: '' };
      }
      this.getData()

    }

    this.showFileUploadOptions = true;

    this.checkLocalPermission()
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


  getData() {
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnOrderDCObject"
    });
    requestData.push({
      "Key": 'BulkReturnOrderDCHeaderGUID',
      "Value": this.params.BulkReturnOrderDCHeaderGUID
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          console.log('response', response)
          if (response.ReturnCode == '0') {
            let data = JSON.parse((response.ExtraData).toString())
            console.log('data', data)

            this.DeliveryChallanNo = data?.DeliveryChallanNo
            this.BulkReturnType = data?.BulkReturnType
            this.LocationCode = data?.LocationCode
            this.Status = data?.Status
            this.DistanceInKm = data?.DistanceInKm
            this.ModeOfTransportData = data?.ModeOfTransportData
            this.VehicleNumber = data?.VehicleNumber
            this.VehicleTypeData = data?.VehicleTypeData
            this.TrackingNumber = data?.TrackingNumber
            // eway bill details
            this.EWayBillFlag = data?.EWayBillFlag
            this.QRData = data?.QRData
            this.EWayBillDate = data?.EWayBillDate
            this.EWayBillNo = data?.EWayBillNo
            this.EWayValidUpto = data?.EWayValidUpto
            this.ewayerrorcode = data?.ewayerrorcode
            this.ewayerrormessage = data?.ewayerrormessage
            this.Response = data?.Response
            this.TrackingURL = data?.TrackingURL

            this.FinalSelectedParts = [];
            this.FinalSelectedParts = Array.isArray(data?.DetailList?.BulkReturnDetail)
              ? data?.DetailList?.BulkReturnDetail
              : [data?.DetailList?.BulkReturnDetail];

            this.FinalSelectedParts.forEach(item => {
              item.Selected = true;
              item.IsDeleted = false;
            })

            this.FinalSelectedPartDetails = [];
            this.FinalSelectedPartDetails = Array.isArray(data?.PartDetailList?.BulkReturnPartDetail)
              ? data?.PartDetailList?.BulkReturnPartDetail
              : [data?.PartDetailList?.BulkReturnPartDetail];

            this.FinalSelectedPartDetails.forEach(item => {
              item.Selected = true;
              item.IsDeleted = false;
            })

            this.FinalFileObjects = data?.FilesList?.FilesList?.ApprovalFile
            this.FinalFileNames = data?.FilesList?.FilesList?.FileNames
            this.FinalFileTypes = data?.FilesList?.FilesList?.FileTypes

            if (!(this.FinalFileObjects == null || this.FinalFileObjects == undefined)) {
              this.extractFileSrc(this.FinalFileObjects, this.FinalFileNames, this.FinalFileTypes);
            }


            this.getLocationData()
            this.GetToteListForHeaderGUID()
            this.UpdateSelectedCount()
            this.getVendorData()

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

  ShowTotePopUp() {
    if (this.LocationCode == null || this.LocationCode == undefined || this.LocationCode == '') {
      this.toastMessage.error("Please Select Location Code To Proceed !");
      return
    }
    this.isTotePopUpShow = true;
    this.getToteList('')
  }

  ChangePartButtonName(type) {

    if (type == 'PART') {
      this.ShowPart = true;
      this.ShowPartDetails = false;
    }
    if (type == 'PARTDETAILS') {
      this.ShowPart = false;
      this.ShowPartDetails = true;
    }

  }

  CloseTotePopUp() {
    this.isTotePopUpShow = false
  }

  ShowAddPopUp() {
    if (this.BulkReturnType == null || this.BulkReturnType == undefined || this.BulkReturnType == '') {
      this.toastMessage.error("Please Select Return Type To Proceed !");
      return
    }
    this.isPopShow = true;
    this.GetBulkReturnOrderDCList('')
  }
  ClosePopUp() {
    this.isPopShow = false;
  }
  onPopUpSubmit() {
    
    // if any item Already Selected 
    if (this.FinalSelectedParts.length > 0) {
      const TempTrackingNumber = this.FinalSelectedParts[0]?.TrackingNumber
      if (TempTrackingNumber) {
        this.PopUpArray.forEach(item => {
          if (
            item.Selected === true &&
            item.IsDeleted === false &&
            !this.FinalSelectedParts.some(
              (x: any) =>
                x.VendorCode === item.VendorCode &&
                x.BulkReturnId === item.BulkReturnId
            )

          ) {
            if (item.TrackingNumber === TempTrackingNumber) {
              this.FinalSelectedParts.push(item);
              this.FinalSelectedPartDetails.push(item.DetailsList.BulkReturnOrderDetails)

              this.FinalSelectedPartDetails = this.FinalSelectedPartDetails.reduce((acc, curr) => {
                return acc.concat(Array.isArray(curr) ? curr : [curr]);
              }, []);
              console.log('FinalSelectedPartDetails', this.FinalSelectedPartDetails)

            }
            else {
              this.toastMessage.error('Trackinig No Should Be same for all the Bulk Return ID selected ! ');
            }
          }
        });
      }

      this.UpdateSelectedCount()
      console.log('this.FinalSelectedParts', this.FinalSelectedParts);
      this.isPopShow = false;
      this.GetToteListForHeaderGUID()
    }
    // if no item seletected
    else {
      let TempArray = [];
      this.PopUpArray.forEach(item => {
        if (item.Selected === true && item.IsDeleted === false) {
          TempArray.push(item)
        }
      })
      const isAllTrackingNumberSame = TempArray.every(item => item.TrackingNumber === TempArray[0].TrackingNumber);
      if (!isAllTrackingNumberSame) {
        this.toastMessage.error('All the Bulk Return ID selected must have same Tracking Number')
        this.isPopShow = false;
        return
      }
      else {

        this.PopUpArray.forEach(item => {
          if (
            item.Selected === true &&
            item.IsDeleted === false &&
            !this.FinalSelectedParts.some(
              (x: any) =>
                x.VendorCode === item.VendorCode &&
                x.BulkReturnId === item.BulkReturnId
            )
          ) {
            this.FinalSelectedParts.push(item);
            this.FinalSelectedPartDetails.push(item.DetailsList.BulkReturnOrderDetails)

            this.FinalSelectedPartDetails = this.FinalSelectedPartDetails.reduce((acc, curr) => {
              return acc.concat(Array.isArray(curr) ? curr : [curr]);
            }, []);
            console.log('FinalSelectedPartDetails', this.FinalSelectedPartDetails)

          }
        });

      }

      this.UpdateSelectedCount()
      console.log('this.FinalSelectedParts', this.FinalSelectedParts);
      this.isPopShow = false;
      this.GetToteListForHeaderGUID()
    }

  }
  RemoveItem(item) {
    
    let tempBRI = item.BulkReturnId;
    if (this.Status == 'NEW' && (this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined || this.DeliveryChallanNo == '')) {
      let index = this.FinalSelectedParts.indexOf(item)
      if (index !== -1) {
        this.FinalSelectedParts.splice(index, 1)
      }


    }
    else {
      let TempDel = item.IsDeleted == '0' ? '1' : '0'
      let TempSel = item.Selected == '0' ? '1' : '0'
      item.IsDeleted = TempDel
      item.Selected = TempSel
    }

    this.UpdateSelectedCount()
    this.GetToteListForHeaderGUID()

  }
  // RemoveToteItem(item) {
  //   if (this.Status == 'NEW' && (this.DeliveryChallanNo == null || this.DeliveryChallanNo == undefined || this.DeliveryChallanNo == '')) {
  //     let index = this.SelectedToteList.indexOf(item)
  //     if (index !== -1) {
  //       this.SelectedToteList.splice(index, 1)
  //     }
  //   }
  //   else {
  //        let TempDel = item.IsDeleted  ==  '0' ? '1' : '0'
  //        let TempSel = item.Selected  == '0' ? '1' : '0'
  //        item.IsDeleted = TempDel
  //        item.Selected =TempSel
  //   }
  // }


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
  GetVehicleData() {
    
    if (this.ModeOfTransportData == 'ROAD') {
      this.VehicleTypeData = 'R'
      this.getVendorData()
    }
    else {
      this.VehicleTypeData = null
      this.VehicleTypeData = null
    }


  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          console.log("Location Data ", this.LocationForJob)
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }
  getLocationData() {
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
            console.log(this.LocationObject);
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
  onTransportationCarrier($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TransportationCarrier, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TransportationCarrier = value;
          console.log('TransportationCarrier', this.TransportationCarrier);
        }
      },
      error: (err) => {
        this.TransportationCarrier = this.getBlankObject();
      }
    })
  }

  changeVendor() {
    this.getLocationData()
    this.getVendorData()
  }
  getVendorData() {
    if (this.LocationCode) {

      this.VendorObject = []
      this.VendorTypeDD = DropDownValue.getBlankObject();

      let index = this.LocationForJob.Data.findIndex(loc => loc.Id == this.LocationCode)
      if (index != -1) {
        this.Ship_to_GSX = this.LocationForJob.Data[index].extraDataJson.Data.SHIP_TO_GSX[0]
        console.log("Location Code ship to GSX ", this.Ship_to_GSX)
      }
      else {
        console.log("LC ", this.LocationCode)
        this.toastMessage.error("Location's Ship To not found!")
        return
      }

      let requestData = [];
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
        "Value": this.LocationCode,
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
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              
              let data = JSON.parse(response.ExtraData)
              console.log("Vendor Object", data)
              if (data?.Totalrecords != "0") {
                
                if (Array.isArray(data?.VendorDDList?.Vendor)) {
                  this.VendorTypeDD.Data = data?.VendorDDList?.Vendor
                  let km = data?.VendorDDList?.Vendor?.DistanceInKm
                  this.DistanceInKm = km != null || km != undefined ? km : 0;

                }
                else {
                  let km = data?.VendorDDList?.Vendor?.DistanceInKm
                  this.DistanceInKm = km != null || km != undefined ? km : 0;


                  this.VendorTypeDD.Data.push(data?.VendorDDList?.Vendor)
                  this.VendorCode = this.VendorTypeDD.Data[0].Id
                  this.VendorObject = this.VendorTypeDD.Data
                }
              }
              console.log('this.VendorObject', this.VendorObject)
            }

          },
          error: err => {
            console.log(err);
            this.VendorTypeDD = DropDownValue.getBlankObject();
          }
        });
    }
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
      "Value": this.LocationCode
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
  onSearchInput($event) {
    const SearchTerm = ($event.target as HTMLInputElement).value;
    this.GetBulkReturnOrderDCList(SearchTerm);
  }

  GetBulkReturnOrderDCList(SearchTerm) {

    if(this.LocationCode == null || this.LocationCode == undefined || this.LocationCode == ''){
         this.toastMessage.error('Please Select Location To Proceed !')
         return
    } 
    this.ngxSpinnerService.show()
    
    this.PopUpArray = [];
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnOrderDCList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "ReturnType",
      "Value": this.BulkReturnType
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    });
    requestData.push({
      "Key": "SearchTerm",
      "Value": SearchTerm
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
              this.toastMessage.error('No Records Found')
              this.ngxSpinnerService.hide()
              return
            }
            this.PopUpArray = [];
            this.PopUpArray = Array.isArray(data.BulkReturnOrderList.BulkReturnOrder)
              ? data.BulkReturnOrderList.BulkReturnOrder : [data.BulkReturnOrderList.BulkReturnOrder];
            this.ngxSpinnerService.hide()
          }
          this.PopUpArray.forEach(item => {
            item.IsDeleted = false;
            item.Selected = false;
          });

          console.log('PopUpArray', this.PopUpArray);
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide()
        }
      });

  }


  UpdateSelectedCount() {
    this.SelectedPartsCount = 0;
    this.FinalSelectedParts.filter(item => {
      if (item.Selected == true && item.IsDeleted == false) {
        this.SelectedPartsCount = this.SelectedPartsCount + 1;
      }
    }
    )
  }
  onSubmit(newstatus) {
    


    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkReturnOrderDC"
    });
    requestData.push({
      "Key": "DeliveryChallanNo",
      "Value": this.DeliveryChallanNo == undefined || this.DeliveryChallanNo == null ? '' : this.DeliveryChallanNo
    });
    requestData.push({
      "Key": "BulkReturnOrderDCHeaderGUID",
      "Value": this.BulkReturnOrderDCHeaderGUID
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "BulkReturnType",
      "Value": this.BulkReturnType
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.LocationCode
    });
    requestData.push({
      "Key": "VendorCode",
      "Value": this.VendorCode == null || this.VendorCode == undefined ? '' : this.VendorCode
    });
    requestData.push({
      "Key": "ReturnAddress",
      "Value": this.VendorObject[0].extraData.VendorName
    });
    requestData.push({
      "Key": "ShipTo",
      "Value": this.Ship_to_GSX == null || this.Ship_to_GSX == undefined ? '' : this.Ship_to_GSX
    });
   
    requestData.push({
      "Key": "Status",
      "Value": newstatus
    });

    requestData.push({
      "Key": "VehicleTypeData",
      "Value": this.VehicleTypeData == null || this.VehicleTypeData == undefined ? '' : this.VehicleTypeData
    });
    requestData.push({
      "Key": "VehicleNumber",
      "Value": this.VehicleNumber == null || this.VehicleNumber == undefined ? '' : this.VehicleNumber
    });
    requestData.push({
      "Key": "ModeOfTransportData",
      "Value": this.ModeOfTransportData == null || this.ModeOfTransportData == undefined ? '' : this.ModeOfTransportData.trim()
    });
    requestData.push({
      "Key": "DistanceInKm",
      "Value": this.DistanceInKm == null || this.DistanceInKm == undefined ? '' : this.DistanceInKm
    });
    requestData.push({
      "Key": "BulkReturnOrderDCDetails",
      "Value": this.BulkReturnOrderDCDetails()
    });

    requestData.push({
      "Key": "BulkReturnOrderDCPartDetails",
      "Value": this.BulkReturnOrderDCPartDetailsIntoDetail()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log('contentRequest', contentRequest);



    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toastMessage.success('Saved Successfully !! ');
            this.route.navigate(['/auth/' + glob.getCompanyCode() + '/bulk-return-order-dc-list/']);

            this.ngxSpinnerService.hide();

          }
          else {
            this.toastMessage.success('Error while saving !');
            this.toastMessage.error(response.ReturnMessage)
          }
        },
        error: err => {
          this.ngxSpinnerService.hide();
          console.log("After SP error ", err);
          console.log("Error Message:- ", err)
          const errors = err.split("Error Code:").slice(1);
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

  BulkReturnOrderDCDetails() {
    console.log("Bulk Return List DC ", this.FinalSelectedParts)
    let rawData = { "rows": [] }
    for (let item of this.FinalSelectedParts) {
      rawData.rows.push({
        "row": {
          "BulkReturnOrderDCHeaderGUID": this.BulkReturnOrderDCHeaderGUID,
          "BulkReturnOrderDCDetailGUID": item.BulkReturnOrderDCDetailGUID == null || item.BulkReturnOrderDCDetailGUID == undefined ? uuidv4() : item.BulkReturnOrderDCDetailGUID,
          "BulkReturnId": item.BulkReturnId,
          "VendorCode": item.VendorCode,
          "TrackingNumber": item.TrackingNumber,
          "TransportationCarrier" :item.TransportationCarrier,
          "TotalStockPrice": item.TotalStockPrice == null || item.TotalStockPrice == undefined ? item.TotalStockPrice : 0.00,
          "IsDeleted": item.IsDeleted
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


  // ToteIntoXml() {
  //   let rawData = { "rows": [] }
  //   for (let item of this.SelectedToteList) {
  //     rawData.rows.push({
  //       "row": {
  //         "BulkReturnOrderDCHeaderGUID": this.BulkReturnOrderDCHeaderGUID,
  //         "ToteGuid": item.ToteGuid,
  //         "ToteNo": item.ToteNo,
  //         "DCNo": item.DCNo,
  //         "AWBNo": item.AWBNo,
  //         "IsDeleted": item.IsDeleted
  //       }
  //     })
  //   }
  //   var builder = new xml2js.Builder();
  //   var xml = builder.buildObject(rawData);
  //   xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  //   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //   xml = xml.toString().replace(/[^\x20-\x7E]/g, '');
  //   console.log("tote xml", xml);
  //   return xml;
  // }

  BulkReturnOrderDCPartDetailsIntoDetail() {
    let rawData = { "rows": [] }
    
  
    for (let item of this.FinalSelectedPartDetails) {
      rawData.rows.push({
        "row": {
         "BulkReturnOrderDCHeaderGUID": this.BulkReturnOrderDCHeaderGUID,
          "BulkReturnOrderDCPartDetailGUID": item.BulkReturnOrderDCPartDetailGUID == null || item.BulkReturnOrderDCPartDetailGUID == undefined ? uuidv4() : item.BulkReturnOrderDCPartDetailGUID,
          "BulkReturnId": item.BulkReturnId ==null || item.BulkReturnId ==undefined ?'' : item.BulkReturnId,
          "GSTGroupCode":item.GSTGroupCode == null || item.GSTGroupCode == undefined ? '' : item.GSTGroupCode,
          "HSNSACCode":item.HSNSACCode == null || item.HSNSACCode == undefined ?'' :item.HSNSACCode, 
          "IsGSXPosted" :item.IsGSXPosted == null || item.IsGSXPosted == undefined ? '' : item.IsGSXPosted,
          "OverPackBox" : item.OverPackBox == null || item.OverPackBox == undefined ? '' : item.OverPackBox,
          "PartCode": item.PartCode == null || item.PartCode == undefined ? '' : item.PartCode,
          "PartDescription": item.PartDescription == null  || item.PartDescription == undefined ?'':item.PartDescription,
          "ProductDescription": item.ProductDescription ==null  || item.ProductDescription == undefined ? '' :item.ProductDescription ,
          "SerialNo": item.SerialNo,
          "Recieved" :item.Recieved,
          "RepairId":item.RepairId,
          "ReturnLabelPrinted":item.ReturnLabelPrinted,
          "ReturnOrderNumber":item.ReturnOrderNumber,
          "StockPrice": item.StockPrice,
          "ToteNumber":item.ToteNumber == null || item.ToteNumber == undefined ? '' : item.ToteNumber ,
          "dangerousGoods": item.dangerousGoods==null || item.dangerousGoods == undefined ? '' : item.dangerousGoods,
          "issueCode": item.issueCode == null || item.issueCode == undefined ? '' : item.issueCode,
          "sequenceNumber": item.sequenceNumber == null || item.sequenceNumber == undefined ? '' : item.sequenceNumber,
          "PurchaseOrderNumber":item.PurchaseOrderNumber == null || item.PurchaseOrderNumber == undefined ? '' : item.PurchaseOrderNumber,
          "BatteryNetWeight":item.BatteryNetWeight == null || item.BatteryNetWeight == undefined ? '' : item.BatteryNetWeight,
          "IsDeleted": item.IsDeleted,
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



  // Images 

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

  async ChangeStatus(newstatus) {
    
    const shouldContinue = confirm("Are you sure, Do you want to Continue?");
    if (shouldContinue === false) {
      return
    }


    // Send Files to the server and get the src path from server and set Status accordingly
    if (this.showFileUploadOptions == true) {

      if (this.FileUploadList.some(file => file.filename == null || file.filename == '')) {
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
      "Value": "SaveBulkDCApprovalStatus"
    });
    requestData.push({
      "Key": "ChallanNo",
      "Value": this.DeliveryChallanNo
    });
    requestData.push({
      "Key": "BulkReturnOrderDCHeaderGUID",
      "Value": this.BulkReturnOrderDCHeaderGUID
    });
    requestData.push({
      "Key": "ApprovalGUID",
      "Value": uuidv4()
    });
    requestData.push({
      "Key": "ApprovalStatus",
      "Value": newstatus
    });
    requestData.push({
      "Key": "ApprovalRemark",
      "Value": this.ApproverRemark == null || this.ApproverRemark == undefined ? '' : this.ApproverRemark
    });
    requestData.push({
      "Key": "ApprovalFile",
      "Value": this.FinalFileObjects == null || this.FinalFileObjects == undefined ? '' : this.FinalFileObjects
    });
    requestData.push({
      "Key": "FileNames",
      "Value": this.FinalFileNames == null || this.FinalFileNames == undefined ? '' : this.FinalFileNames
    });
    requestData.push({
      "Key": "FileTypes",
      "Value": this.FinalFileTypes == null || this.FinalFileTypes == undefined ? '' : this.FinalFileTypes
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before BulkApprovalStatus SP:-", this.FinalFileObjects.toString())

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.toastMessage.success("Status Changed Successfully")
          window.location.reload()
        }
        else {
          this.toastMessage.error("Error:- ", response.errorMessage)
        }
      },
      error: (err) => {
        console.log("Error in Fetching  Data:-  ", err)
      }
    });
  }


  GetToteListForHeaderGUID() {
    
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetToteListForHeaderGUID"
    });
    requestData.push({
      "Key": "HeaderGuidList",
      "Value": 'NA'
    });
    requestData.push({
      "Key": "BulkReturnIdList",
      "Value": this.BulkReturnIDListIntoxml()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
console.log('strRequestData from GetToteListForHeaderGUID' , strRequestData)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log('response', response);
            let data = JSON.parse(response.ExtraData)
            if (data.TotalRecords <= 0) {
              this.SelectedToteList = [];
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




  BulkReturnIDListIntoxml() {
    let rawData = { "rows": [] }
    for (let item of this.FinalSelectedParts) {
      rawData.rows.push({
        "row": {
          "BulkReturnId": item.BulkReturnId
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


  // Print Document 

  PrintDocument() {
    if (this.printTypeData == 'E-Way Bill') {

      this.downloadEWayBill('downloadBulkReturnDCEwayBill')
    }
  }

  downloadEWayBill(reportType: String) {
    this.ngxSpinnerService.show()
    let PdfData = [];
    PdfData.push({
      "Key": "ApiType",
      "Value": "GetBulkReturnDCEWayDCBill4Print",
    });
    PdfData.push({
      "Key": "BulkReturnOrderDCHeaderGUID",
      "Value": this.params.BulkReturnOrderDCHeaderGUID,
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


  validateEwayBill() {

    
    let requiredFields = {
      DistanceInKm: "Distance In Km",
      ModeOfTransportData: "Mode Of Transport"
    };

    for (const field in requiredFields) {
      if (!this[field]) {
        this.toastMessage.error(`${requiredFields[field]} can't be empty`);
        return;
      }
    }

    if (this.ModeOfTransportData == 'ROAD') {
      if (!this.VehicleNumber || !this.VehicleTypeData) {
        this.toastMessage.error("Please enter Vehicle Number and Vehicle Type for this mode of transport!")
        return
      }
      if (this.VehicleNumber.length < 10) {
        this.toastMessage.error("Please enter valid Vehicle Number!")
        return
      }
    }


    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveBulkDCEWayBill"
    })
    requestData.push({
      "Key": "BulkReturnOrderDCHeaderGUID",
      "Value": this.BulkReturnOrderDCHeaderGUID
    });
    requestData.push({
      "Key": "VehicleTypeData",
      "Value": this.VehicleTypeData == null || this.VehicleTypeData == undefined ? '' : this.VehicleTypeData.trim()
    });
    requestData.push({
      "Key": "VehicleNumber",
      "Value": this.VehicleNumber == null || this.VehicleNumber == undefined ? '' : this.VehicleNumber.trim()
    });
    requestData.push({
      "Key": "ModeOfTransportData",
      "Value": this.ModeOfTransportData == null || this.ModeOfTransportData == undefined ? '' : this.ModeOfTransportData.trim()
    });
    requestData.push({
      "Key": "DistanceInKm",
      "Value": this.DistanceInKm == null || this.DistanceInKm == undefined ? '' : this.DistanceInKm.trim()
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before EWay Bill Details", requestData)

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          console.log("Confirm DB Response ", response)
          if (response.ReturnCode == '0') {
            // this.GenerateEWayBill()
            this.toastMessage.success('E-Way Bill Details updated')
            this.ngxSpinnerService.hide();

          }
          else {

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

    GenerateEWayBill(){
    const shouldConfirm = confirm("Are you sure you want to continue?")
    if ( !shouldConfirm ){
      return
    }

    var data = {
      "BulkReturnOrderDCHeaderGUID": this.params.BulkReturnOrderDCHeaderGUID
    }
    let strContentRequest = JSON.stringify(data)
    let contentRequest = {
      "content": strContentRequest
    };
    
    this.ngxSpinnerService.show()
    this.gsxService.generateDCEwayBill(contentRequest).subscribe(
      {
        next: (value) => {
          this.ngxSpinnerService.hide()
          console.log("EWAYBILL VALUE :" , value)
          var objEwaybill = JSON.parse(value.toString());
          console.log("EWAYBILL RESULT :" , objEwaybill)
          if( objEwaybill.ResponseCode == '0' || objEwaybill.code == "0"){
            this.toastMessage.success("E-Way Bill generated successfully!")
            window.location.reload()
          }
          else{
            const errorMessage = JSON.parse(objEwaybill.message).error.message;
            this.toastMessage.error("Error: " + errorMessage);
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err);

        }
      });
  }

}