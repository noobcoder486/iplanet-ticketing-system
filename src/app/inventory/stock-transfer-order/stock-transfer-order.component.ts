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
  selector: 'app-stock-transfer-order',
  templateUrl: './stock-transfer-order.component.html',
  styleUrls: ['./stock-transfer-order.component.css']
})
export class StockTransferOrderComponent implements OnInit {

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
  STODocType: DropDownValue = DropDownValue.getBlankObject();
  STODocTypeData: string;
  sourceLocationData: string;
  DestintionLocationData: string;
  results: any[] = [];
  visible: boolean = false;
  rotate: boolean = true;
  params:any;
  transferOrderHeaderGUID:any;
  isEdit : boolean = false;
  stockType: any[] = ["Consignment", "Company Stock"];
  stockTypeData: string;


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.doctype != null || this.params.doctype != undefined)
    {
      this.STODocTypeData = this.params.doctype.toUpperCase()
    }
    if (this.params.headerguid != null || this.params.headerguid != undefined) {
      this.isEdit = false
      this.getTransferOrderObject()
    }
    this.onLocationSearch({ term: "", item: [] });
    this.onSTODocType({ term: "", item: [] });
    
  }
  

  onLocationSearch($event: { term: string; item: any[] }) {
    console.log(glob.getCompanyCode())
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

  onSTODocType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.StoDocType, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.STODocType = value;
        }
      },
      error: (err) => {
        this.STODocType = DropDownValue.getBlankObject();
      }
    });
  }

  addOpenStock() {
    if (this.sourceLocationData != undefined || this.sourceLocationData != null) {
      if (this.DestintionLocationData != undefined || this.DestintionLocationData != null) {
        if(this.stockTypeData != undefined || this.stockTypeData != null)
        {      
          if (this.isOpeningStockSelector == false) {
            this.isOpeningStockSelector = true
          }
          else if (this.isOpeningStockSelector == true) {
            this.isOpeningStockSelector = false;
          }
          else {
            this.toast.error("Please select Stock")
          }
        }
        else
        {
          this.toast.error("Please select Stock Type")
        }
      }
      else
      {
        this.toast.error("Please Select Destination Location")
      }
    }
    else 
    {
      this.toast.error("Please select Source Location")
    }
  }

  changeColor(item)
  {
    if(item.DeleteFlag == 1)
    {
      return {'background-color':'#FFCCCB'}
    }
  }


  removeItem(item) {
     
    if(item.DeleteFlag != undefined || item.DeleteFlag != null)
    {
      if(item?.DeleteFlag == 0)
      {
        item.DeleteFlag = 1
      }
      else
      {
        item.DeleteFlag = 0
      }
    }
    else
    {
      let index = this.results.indexOf(item)
      this.results.splice(index, 1)
    }
  }

  materialList($event) {
    for (let item of $event) {
      if (this.results.some(m => m?.MaterialCode === item?.MaterialCode)) {
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
      if (item?.Quantity == null || item?.Quantity == undefined || item?.Quantity == 0) {
        return false;
      }
    }
    if (this.STODocTypeData == null || this.STODocTypeData == undefined) {
      return false;
    }
    else if (this.sourceLocationData == null || this.sourceLocationData == undefined) {
      return false;
    }
    else if (this.DestintionLocationData == null || this.DestintionLocationData == undefined) {
      return false;
    }
    else if (this.stockTypeData == null || this.stockTypeData == undefined) {
      return false;
    }
    else {
      return true;
    }
  }

  saveTransferOrderXml() {
     
    let rawData = { "rows": [] }
    let count = 0;
    for (let item of this.results) {
       
      count = count + 1;
      rawData.rows.push({
        "row": {
          "TransferOrderDetailGUID": item.TransferOrderDetailGUID != undefined || item.TransferOrderDetailGUID != null ? item.TransferOrderDetailGUID : uuidv4(),
          "MaterialCode": item.MaterialCode,
          "SerializedFlag": item.SerializedModule,
          "StockType":this.stockTypeData,
          "Quantity": item.Quantity,
          "CostPrice": 0,
          "Price": 0,
          "TaxPercentage": 0,
          "TaxAmount": 0,
          "BaseAmount": 0,
          "Discount": 0,
          "TaxableAmount": 0,
          "NetAmount": 0,
          "DeleteFlag":item.DeleteFlag == null || item.DeleteFlag == undefined ? 0 :item.DeleteFlag
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

  validateLocation()
  {
    if(this.sourceLocationData == this.DestintionLocationData)
    {
      this.toast.error("Source and Destination Location cannot be same")
      this.DestintionLocationData = null
    }
  }

  saveStock() {
     
    this.transferOrderHeaderGUID = this.transferOrderHeaderGUID != null || this.transferOrderHeaderGUID != undefined? this.transferOrderHeaderGUID : uuidv4()
    if(this.sourceLocationData != this.DestintionLocationData)
    {
      if (this.validateStockAdded()) {
        this.ngxSpinnerService.show()
        let requestdata = []
        console.log(this.transferOrderHeaderGUID)
        requestdata.push({
          "Key": "ApiType",
          "Value": "SaveTransferOrder"
        })
        requestdata.push({
          "Key": "TransferOrderHeaderGUID",
          "Value": this.transferOrderHeaderGUID
        })
        requestdata.push({
          "Key": "DocumentStatus",
          "Value": "Order Created"
        })
        requestdata.push({
          "Key": "StockType",
          "Value": this.stockTypeData
        })
        requestdata.push({
          "Key": "DocumentDate",
          "Value": new Date()
        })
        requestdata.push({
          "Key": "DocumentType",
          "Value": this.STODocTypeData
        })
        requestdata.push({
          "Key": "SourceLocationCode",
          "Value": this.sourceLocationData
        })
        requestdata.push({
          "Key": "DestinationLocationCode",
          "Value": this.DestintionLocationData
        })
        requestdata.push({
          "Key": "CompanyCode",
          "Value": glob.getCompanyCode()
        })
        requestdata.push({
          "Key": "TransferOrderDetail",
          "Value": this.saveTransferOrderXml()
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
                this.router.navigate(['/auth/' + glob.getCompanyCode() + '/transfer-order'],{queryParams:{doctype:this.STODocTypeData}})
                
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
        this.toast.error("Please add Stocks and Quantity")
      }
    }
    else
    {
      this.toast.error("Source and Destination Location cannot be same")
      this.DestintionLocationData = null;
    }
  }

  getTransferOrderObject()
  { 
      this.ngxSpinnerService.show()
      let requestdata = []
      requestdata.push({
        "Key":"ApiType",
        "Value":"GetTransferOrderObject"
      })
      requestdata.push({
        "Key":"TransferOrderHeaderGUID",
        "Value":this.params.headerguid
      })
      let strRequestData = JSON.stringify(requestdata);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
             
            console.log(this.results)
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {
              this.ngxSpinnerService.hide(); 
              let data = JSON.parse(response?.ExtraData)
              this.sourceLocationData = data.SourceLocationCode
              this.transferOrderHeaderGUID = data.TransferOrderHeaderGUID
              this.DestintionLocationData = data.DestinationLocationCode
              if(data?.TransferOrderList?.TransferOrderDetail)
              { 
                if(Array.isArray(data?.TransferOrderList?.TransferOrderDetail))
                {
                  let singleDetailObject = data?.TransferOrderList?.TransferOrderDetail[0]
                  this.stockTypeData = singleDetailObject.StockType
                  this.results = data?.TransferOrderList?.TransferOrderDetail

                }
                else
                {
                  this.results.push(data?.TransferOrderList?.TransferOrderDetail)
                  this.stockTypeData = data?.TransferOrderList?.TransferOrderDetail?.StockType
                }
              }
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
