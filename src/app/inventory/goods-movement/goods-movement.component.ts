import { Component, OnInit } from '@angular/core';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from "../../config/global";
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';

@Component({
  selector: 'app-goods-movement',
  templateUrl: './goods-movement.component.html',
  styleUrls: ['./goods-movement.component.css']
})
export class GoodsMovementComponent implements OnInit {

  constructor(
    private router: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
  ) { }

  typeSelected = 'ball-clip-rotate';
  isOpeningStockSelector: boolean = false;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  GMDocType: DropDownValue = DropDownValue.getBlankObject();
  GMDocTypeData: string;
  locationData: string;
  results: any[] = [];
  stockType: any[] = ["Consignment", "Company Stock"];
  stockTypeData: string;
  visible: boolean = false;
  rotate: boolean = true;
  params:any;
  isEdit : boolean = false;


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.doctype != null || this.params.doctype != undefined)
    {
      this.GMDocTypeData = this.params.doctype.toUpperCase()
    }
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      this.isEdit = true; 
      this.getGoodsMovementObject()
    }
    this.onLocationSearch({ term: "", item: [] });
    this.onGMDocType({ term: "", item: [] });
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


  onGMDocType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DocumentType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GMDocType = value;
        }
      },
      error: (err) => {
        this.GMDocType = DropDownValue.getBlankObject();
      }
    });
  }


  addOpenStock() {
    if (this.locationData != undefined || this.locationData != null) {
      if (this.stockTypeData != null || this.stockTypeData != undefined) {
        if (this.isOpeningStockSelector == false) {
          this.isOpeningStockSelector = true
        }
        else if (this.isOpeningStockSelector == true) {
          this.isOpeningStockSelector = false;
        }
      }
      else {
        this.toast.error("Please select Stock")
      }
    }
    else {
      this.toast.error("Please select Location")
    }
  }


  addQuantity(item) {
    item.ArrayList = []
    for (let i = 0; i < item.Quantity; i++) {
      item.ArrayList.push({
        "MaterialCode": item.MaterialCode,
        "MaterialDescription": item.MaterialDescription,
        "SerializedModule": item.SerializedModule,
        "SerialNumber": item.SerialNumber
      })
    }
  }


  toggleCollapse(item) {

    if (!(item.Quantity == null || !item.Quantity == undefined)) {
      item.visible = !item.visible;
      //item.rotate= !item.rotate;
      this.rotate = !this.rotate;
    }
    else {
      this.toast.error("Please Add Stocks")
    }
  }


  removeItem(item) {
    let index = this.results.indexOf(item)
    this.results.splice(index, 1)
  }


  materialList($event) {
    for (let item of $event) {
      if (this.results.some(m => m.MaterialCode === item.MaterialCode)) {
        this.toast.error("Stock Already Exist")
      }
      else {
        item.Quantity = 0;
        item.detailGUID = uuidv4()
        this.results.push(item)
      }
    }
  }


  validateStockAdded() {
     
    for (let item of this.results) {
      if (item.Quantity == null || item.Quantity == undefined || item.Quantity == 0) {
        return false;
      }
      else if (item.SerializedModule == "1") {
        for (let objectdata of item.ArrayList) {
          if (objectdata.SerialNumber == null || objectdata.SerialNumber == undefined) {
            return false
          }
        }
      }
    }
    if (this.GMDocTypeData == null || this.GMDocTypeData == undefined) {
      return false;
    }
    else if (this.locationData == null || this.locationData == undefined) {
      return false;
    }
    else if (this.stockTypeData == null || this.stockTypeData == undefined) {
      return false;
    }
    else {
      return true;
    }
  }


  saveStock() {
    if (this.validateStockAdded()) {
      this.ngxSpinnerService.show()
      let requestdata = []
      requestdata.push({
        "Key": "ApiType",
        "Value": "SaveGoodsMovement"
      })
      requestdata.push({
        "Key": "GoodsMovementHeaderGUID",
        "Value": uuidv4()
      })
      requestdata.push({
        "Key": "DocumentDate",
        "Value": new Date()
      })
      requestdata.push({
        "Key": "DocumentType",
        "Value": this.GMDocTypeData
      })
      requestdata.push({
        "Key": "LocationCode",
        "Value": this.locationData
      })
      requestdata.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      })
      requestdata.push({
        "Key": "DocumentStatus",
        "Value": ""
      })
      requestdata.push({
        "Key": "CancelDocumentCode",
        "Value": ""
      })
      requestdata.push({
        "Key": "RefDocumentCode",
        "Value": ""
      })
      requestdata.push({
        "Key": "RefDocumentType",
        "Value": ""
      })
      requestdata.push({
        "Key": "GoodsMovementDetail",
        "Value": this.saveOpenStockOrderXml()
      })
      requestdata.push({
        "Key": "GoodsMovementSerializedDetail",
        "Value": this.saveSerializedOpenStockXml()
      })
      let strRequestData = JSON.stringify(requestdata);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.toast.success("Successfully Parts Added")
              this.ngxSpinnerService.hide();
              this.router.navigateByUrl('/auth/' + glob.getCompanyCode() + '/goods-movement-list')
              
            }
            else {
              this.toast.error(response.ReturnMessage)
            }
          },
          error: err => {
            console.log(err);
            this.ngxSpinnerService.hide();
          }
        });
    }
    else {
      this.toast.error("Please add stocks to save or add serial numbers for serialized stocks")
    }
  }

  saveSerializedOpenStockXml() {
    let rawData = { "rows": [] }
    for (let item of this.results) {
      if (item.SerializedModule == "1") {
        for (let objectdata of item.ArrayList)
          rawData.rows.push({
            "row": {
              "GoodsMovementSerializedDetailGUID": uuidv4(),
              "GoodsMovementDetailGUID": item.detailGUID,
              "MaterialCode": objectdata.MaterialCode,
              "StockType": this.stockTypeData,
              "SerializedFlag": item.SerializedModule,
              "SerialNumber": objectdata.SerialNumber,
              "MovementType": "DEBIT"
            }
          })
      }
    }
    if (rawData.rows.length > 0) {
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(rawData);
      xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
      xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
      console.log("xml", xml);
    }
    else {
      xml = '';
    }

    return xml;
  }

  saveOpenStockOrderXml() {
    this.saveSerializedOpenStockXml()
    let rawData = { "rows": [] }
    let count = 0;
    for (let item of this.results) {
      count = count + 1;
      rawData.rows.push({
        "row": {
          "GoodsMovementDetailGUID": item.detailGUID,
          "ItemNumber": count,
          "MaterialCode": item.MaterialCode,
          "StockType": this.stockTypeData,
          "SerializedFlag": item.SerializedModule,
          "Quantity": item.Quantity,
          "CostPrice": 0,
          "Price": 0,
          "TaxPercentage": 0,
          "TaxAmount": 0,
          "BaseAmount": 0,
          "Discount": 0,
          "TaxableAmount": 0,
          "NetAmount": 0,
          "RefDocumentCode": "",
          "RefDocumentType": "",
          "MovementType": "DEBIT"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("xml", xml);
    return xml;

  }

  getGoodsMovementObject()
  {
      this.ngxSpinnerService.show()
      let requestdata = []
      requestdata.push({
        "Key":"ApiType",
        "Value":"GetGoodsMovementObject"
      })
      requestdata.push({
        "Key":"GoodsMovementHeaderGUID",
        "Value":this.params.headerguid
      })
      let strRequestData = JSON.stringify(requestdata);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.ngxSpinnerService.hide(); 
              let data = JSON.parse(response?.ExtraData)
              
              this.locationData = data.LocationCode
              if(Array.isArray(data.GoodsMovementDetail))
              {
                this.results = data.GoodsMovementDetail
              }
              else
              {
                this.results.push(data.GoodsMovementDetail)
              }
              let singleGoodsDetailObject = data.GoodsMovementDetail[0]
              this.stockTypeData = singleGoodsDetailObject.StockType
              this.results.forEach(element => {
                if(element.SerializedFlag == "1")
                {
                  element.ArrayList = []
                  if(Array.isArray(element.GoodsMovementSerializedDetail))
                  {
                    element.ArrayList = element.GoodsMovementSerializedDetail
                  }
                  else
                  {
                    element.ArrayList.push(element.GoodsMovementSerializedDetail)
                  }
                }
              });
              console.log(this.results)
            }
            else {
              this.toast.error(response.ReturnMessage)
            }
          },
          error: err => {
            console.log(err);
            this.ngxSpinnerService.hide();
          }
        });
  }
}
