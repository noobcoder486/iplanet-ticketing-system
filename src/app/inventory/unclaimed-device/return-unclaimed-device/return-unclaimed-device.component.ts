import { Component, OnInit } from '@angular/core';
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
  selector: 'app-return-unclaimed-device',
  templateUrl: './return-unclaimed-device.component.html',
  styleUrls: ['./return-unclaimed-device.component.css']
})
export class ReturnUnclaimedDeviceComponent implements OnInit {


  noOfBoxes: any;
  transportationCarrierData: any
  TransportationCarrier: DropDownValue = this.getBlankObject();
  FromLocationCode: string
  ToLocationCode: string;
  LocationObject: any[] = []
  ToLocationObject: any[] = []
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  LocationToJob: DropDownValue = DropDownValue.getBlankObject();
  ReceivedStatusDD: DropDownValue = this.getBlankObject();

  returnAddress: string = '';

  ButtonName: any;

  SelectedPartsForReturn: any[] = [];
  popUpArray: any[] = [];
  ShowAddPopup: boolean = false;
  FinalSelectedPartsForReturn: any[] = [];


  deliveryChallanNo: any
  totalUnitPrice: number = 0;
  isShipmentDone: any
  deliveryChallanGUID: string
  ApprovalStatus: any
  params: any;
  CreatedDate;
  isLocalApprover: boolean = false;
  PartQuantity: number;


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }
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

  ngOnInit(): void {
    this.onTransportationCarrier({ term: '', items: [] })
    this.onLocationSearch({ term: '', item: [] })
    this.onToLocationSearch({ term: '', item: [] })
    this.onDeliveryChallanStatus({ term: '', items: [] })
    this.checkLocalPermission();

    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      this.deliveryChallanGUID = this.params.headerguid
      this.getData()

    }
    else if (Object.keys(this.params).length == 0) {
      this.deliveryChallanGUID = uuidv4()
      this.ApprovalStatus = 'NEW'
      this.isShipmentDone = '0'
      this.CreatedDate = new Date()

      this.deliveryChallanNo = 'NA'
    }
  }

  checkLocalPermission() {
    
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    if (resp.ProfileId == 14) {
      this.isLocalApprover = true
      console.log('true')
    }

  }
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
  CalculateTotalUnitPrice() {
    
    this.totalUnitPrice = 0
    this.FinalSelectedPartsForReturn.forEach(currentItem => {
      if (currentItem.UnitPrice != null && currentItem.UnitPrice != undefined && currentItem.UnitPrice != '') {
        if (currentItem.IsDeleted == "0") {
          this.totalUnitPrice += parseFloat(currentItem.UnitPrice.toString())
        }
      }
    })
    this.totalUnitPrice = parseFloat(this.totalUnitPrice.toFixed(2));

  }
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

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
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

  onToLocationSearch($event: { term: string; item: any[] }) {
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

  getLocationData() {
    
    this.LocationObject = []
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
      "Value": this.FromLocationCode
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

  locationDetails: any[] = []
  getToLocationData() {

    this.ToLocationObject = []
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
      "Value": this.ToLocationCode
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

  onSearchInput($event) {
    const searchTerm = ($event.target as HTMLInputElement).value;
    this.getUnclaimedDeviceReturnList(searchTerm);
  }

  getUnclaimedDeviceReturnList(searchTerm) {
    
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetUnclaimedDeviceReturnList"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.FromLocationCode == null || this.FromLocationCode == undefined ? '' : this.FromLocationCode
    });
    requestData.push({
      "Key": "searchTerm",
      "Value": (searchTerm == null || searchTerm == undefined || searchTerm.trim() == '') ? '' : searchTerm.trim()
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
              Array.isArray(data.UnclaimedDeviceReturnList.UnclaimedDeviceReturnList) ?
                this.popUpArray = data.UnclaimedDeviceReturnList.UnclaimedDeviceReturnList :
                this.popUpArray = [data.UnclaimedDeviceReturnList.UnclaimedDeviceReturnList]
              console.log('this is the return list ', this.popUpArray);
           this.ngxSpinnerService.hide()

            }
            else {
              this.toastMessage.error("No Record Found!")
           this.ngxSpinnerService.hide()

              return
            }

            this.popUpArray = this.popUpArray.filter((item, index, self) =>
              index === self.findIndex(t =>
                t.CaseId === item.CaseId && t.SerialNo === item.SerialNo
              )
            );
            
            this.popUpArray.forEach(item => {
              item.selected = false
              item.IsDeleted = false
              item.ReturnFlag = true
            })
           this.ngxSpinnerService.hide()
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

  ClosePopUp() {
    this.ShowAddPopup = false;
  }
  showPopUp() {
   
    if (!this.isLocalApprover) {
      this.toastMessage.error('Only Local Approvers are Authorised')
      return
    }
    if (this.FromLocationCode == null || this.FromLocationCode == undefined || this.FromLocationCode == '') {
      this.toastMessage.error('Please Select the Location Code to Proceed !');
      return
    }
    if (this.ToLocationCode == null || this.ToLocationCode == undefined || this.ToLocationCode == '') {
      this.toastMessage.error('Please Select the Location Code to Proceed !');
      return
    }
    this.ShowAddPopup = true;
    this.getUnclaimedDeviceReturnList('');
  }
  selectPartForReturn($event: any, item: any) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      const exists = this.SelectedPartsForReturn.some(
        (x: any) => x.SerialNo === item.SerialNo && x.CaseId === item.CaseId
      );
      if (!exists) {
        this.SelectedPartsForReturn.push(item);
      }
    } else {
      this.SelectedPartsForReturn = this.SelectedPartsForReturn.filter(
        (x: any) => !(x.SerialNo === item.SerialNo && x.CaseId === item.CaseId)
      );
    }

    console.log('Checked:', isChecked);
    console.log('this.SelectedPartsForReturn:', this.SelectedPartsForReturn);
  }
  isSelected(item: any): boolean {
    return this.SelectedPartsForReturn.some(
      (x: any) => x.SerialNo === item.SerialNo && x.CaseId === item.CaseId
    );
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

  onPopUpSubmit() {
    
    this.SelectedPartsForReturn.forEach(selectedItem => {
      const alreadyExists = this.FinalSelectedPartsForReturn.some(finalItem =>
        finalItem.CaseId === selectedItem.CaseId &&
        finalItem.SerialNo === selectedItem.SerialNo
      );
      if (!alreadyExists) {
        this.FinalSelectedPartsForReturn.push(selectedItem);
      }
    });
    this.ShowAddPopup = false;
    this.CalculateTotalUnitPrice()
    this.UpdateSelectedCount()
  }

  RemoveItem(item) {
    
    if (this.ApprovalStatus == 'NEW' && this.deliveryChallanNo == 'NA') { // directly delete it as it is not saved in the database
      let index = this.FinalSelectedPartsForReturn.indexOf(item)
      this.FinalSelectedPartsForReturn.splice(index, 1)

      this.CalculateUnitPrice()
      this.UpdateSelectedCount()
    }
    else {
      let tempDeleted = item.IsDeleted == 0 ? 1 : 0
      let tempReturnFlag = item.ReturnFlag == 0 ? 1 : 0
      const index = this.FinalSelectedPartsForReturn.findIndex(x =>
        x.CaseId === item.CaseId && x.SerialNo === item.SerialNo);
      if (index !== -1) {
        this.FinalSelectedPartsForReturn[index].IsDeleted = tempDeleted;
        this.FinalSelectedPartsForReturn[index].ReturnFlag = tempReturnFlag;
      }

      this.CalculateUnitPrice()
      this.UpdateSelectedCount()
    }

  }

  UpdateSelectedCount() {
    this.PartQuantity = 0;
    this.FinalSelectedPartsForReturn.forEach(currentItem => {
      if (currentItem.IsDeleted == "0") {
        this.PartQuantity += 1;
      }
    }
    )
  }


  getData() {
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
            this.ApprovalStatus = data?.DeliveryChallanStatus;
            this.CreatedDate = data.CreatedDate
            this.totalUnitPrice = data.TotalUnitPrice
            this.deliveryChallanGUID = data.DeliveryChallanGUID
            this.deliveryChallanNo = data.DeliveryChallanNo
            this.transportationCarrierData = data.TransportationCarrier
            this.FromLocationCode = data.LocationCode
            this.ToLocationCode = data.ToLocationCode
            this.noOfBoxes = data.NoOfBoxes
            this.isShipmentDone = data.isShipmentDone
            var result = []
            Array.isArray(data.DeliveryChallanDetailList.DeliveryChallanDetail) ?
              result = data.DeliveryChallanDetailList.DeliveryChallanDetail :
              result = [data.DeliveryChallanDetailList.DeliveryChallanDetail]

            for (let item of result) {
              if (item.PartDescription == null || item.PartDescription == undefined || item.PartDescription == "" && item.ProductDescription == null || item.ProductDescription == undefined || item.ProductDescription == "") {
                this.FinalSelectedPartsForReturn.push({
                  "DeliveryChallanDetailGUID": item.DeliveryChallanDetailGUID,
                  "DeliveryChallanGUID": item.DeliveryChallanGUID,
                  "PartCode": item.PartCode,
                  "SerialNo": item.SerialNo,
                  "CaseId": item.CaseId,
                  "CaseGuid": item.CaseGuid,
                  "UnitPrice": item.UnitPrice,
                  "ReceivedStatus": item.ReceivedStatus,
                  "IsDeleted": item.IsDeleted,
                  "ReturnFlag":item.ReturnFlag
                })
              }
              else {
              }
            }
            this.getToLocationData()
            this.getLocationData()
            this.CalculateUnitPrice()
            this.UpdateSelectedCount()
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
  ValidateReceivedStatus() {
    for (let item of this.FinalSelectedPartsForReturn) {
      if (item.ReceivedStatus == null || item.ReceivedStatus == undefined || item.ReceivedStatus == '') {
        return false
      }
    }
    return true;
  }
  ValidateUnitPrice() {
    for (let item of this.FinalSelectedPartsForReturn) {
      if (item.UnitPrice == null || item.UnitPrice == undefined || item.UnitPrice == '') {
        return false
      }
    }
    return true;
  }

  onSubmit(status) {
 
    if (!this.isLocalApprover) {
      this.toastMessage.error('Only Local Approvers are Authorised !')
      return
    }
    if (this.noOfBoxes == null || this.noOfBoxes == undefined || this.noOfBoxes == '') {
      this.toastMessage.error('No. Of Boxes Cannot be Empty');
      return
    }
    if (this.transportationCarrierData == null || this.transportationCarrierData == undefined || this.transportationCarrierData == '') {
      this.toastMessage.error('Transportation Carrier Cannot Be Empty');
      return
    }

    if (!this.ValidateUnitPrice()) {
        this.toastMessage.error('Unit Price Cannot be Empty for any Part')
        return
      }
      
      if(this.PartQuantity <=0 ){
 this.toastMessage.error('You should Select atleast One Part to Proceed')
        return
      }
    this.ngxSpinnerService.show()


    if (status == 'CREATE') {
      this.ApprovalStatus = 'NEW'
    }
    if (status == 'CONFIRMSHIPMENT') {
      this.ApprovalStatus = 'INTR'
    }
    if (status == 'RECIEVESHIPMENT') {
      if (!this.ValidateReceivedStatus()) {
        this.toastMessage.error('Select Recieved Status for Each Parts')
        return
      }
      this.ApprovalStatus = 'SHPCF'
    }

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
      "Value": 'UNCLAIMED'
    })
    requestData.push({
      "Key": "TransportationCarrier",
      "Value": this.transportationCarrierData
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
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
      "Value": this.FromLocationCode
    });
    requestData.push({
      "Key": "ToLocationCode",
      "Value": this.ToLocationCode
    });
    requestData.push({
      "Key": "NoOfBoxes",
      "Value": this.noOfBoxes == null || this.noOfBoxes == undefined ? "" : this.noOfBoxes
    });
    requestData.push({
      "Key": "DeliveryChallanDetail",
      "Value": this.UnclaimedDeviceListIntoXML()
    });
    requestData.push({
      "Key": "DocType",
      "Value": 'UNCRET'
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Save DC ", requestData)
     
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.ngxSpinnerService.show();
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == "0") {
            this.toastMessage.success("Saved Successfully")
            this.route.navigate(["auth/" + glob.getCompanyCode() + "/unclaimed-device-list"])
            this.ngxSpinnerService.hide();
          }
          else {
            this.toastMessage.error(response.ReturnMessage)
            this.route.navigate(["auth/" + glob.getCompanyCode() + "/unclaimed-device-list"])
                   
          }
        },
        error: err => {
          console.log("Errro ", err);
          this.ngxSpinnerService.hide();
          alert("Error from Database:- " + err.message[0]);
        }
      });
  }

  UnclaimedDeviceListIntoXML() {
    let rawData = { "rows": [] }
    for (let item of this.FinalSelectedPartsForReturn) {
      console.log('FinalSelectedPartsForReturn', this.FinalSelectedPartsForReturn)
      rawData.rows.push({
        "row": {
          "DeliveryChallanDetailGUID": this.ApprovalStatus == 'NEW' ? uuidv4() : item.DeliveryChallanDetailGUID,
          "DeliveryChallanGUID": this.deliveryChallanGUID,
          "PartCode": item.PartCode == null || item.PartCode == undefined ? "" : item.PartCode,
          "SerialNo": item.SerialNo,
          "CaseId": item.CaseId,
          "CaseGuid": item.CaseGuid,
          "UnitPrice": item.UnitPrice,
          "HSNSACCode": item.HSNSACCode == null || item.HSNSACCode == undefined ? "" : item.HSNSACCode,
          "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode ? "" : item.GSTGroupCode,
          "ReceivedStatus": item.ReceivedStatus == null || item.ReceivedStatus == undefined ? "" : item.ReceivedStatus,
          "IsDeleted": item.IsDeleted == null || item.IsDeleted == undefined ? "0" : item.IsDeleted,
          "ReturnFlag":  this.ApprovalStatus == 'NEW' ? "1" : item.ReturnFlag
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
  CalculateUnitPrice() {

    this.totalUnitPrice = 0;
    this.FinalSelectedPartsForReturn.forEach(item => {
      if (item.UnitPrice != null && item.UnitPrice != undefined && item.UnitPrice != '') {
        if (item.IsDeleted == "0") {
          this.totalUnitPrice += parseFloat(item.UnitPrice.toString())
        }
      }
    })
    this.totalUnitPrice = parseFloat(this.totalUnitPrice.toFixed(2));

  }


}



