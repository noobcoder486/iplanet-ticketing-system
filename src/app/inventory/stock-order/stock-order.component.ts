import { Component, OnInit, SimpleChanges } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "../../config/global";
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-stock-order',
  templateUrl: './stock-order.component.html',
  styleUrls: ['./stock-order.component.css']
})


export class StockOrderComponent implements OnInit {

addedPartCount:number=0;
typeSelected = 'ball-clip-rotate';
isPartSelector: boolean = false;
partList: any[] = []; 
partSelectorView: any[] = [];
finalSelectedElements: any[] = []
shipmentList: any[] = []
invoiceList: any[] =[]
shippingPartList: any[] = []
stockPrice: number=0;
stockData: any; 
PONumber: any;
purchaseOrderNumber: string
locationCode: string;
Ship_to_GSX: string;
netPrice: number;
taxPrice: number;
stockOrderForm: FormGroup;
LocationForJob: DropDownValue = DropDownValue.getBlankObject();
orderId
  errorMessage: any;


constructor(
  private dynamicService : DynamicService,
  private dropdownDataService: DropdownDataService,
  private toasty: ToastrService,
  private activatedRoute: ActivatedRoute,
  private gsxService: GsxService,
  private ngxSpinnerService:NgxSpinnerService
) { }


 

ngOnInit(): void {
  this.onLocationSearch({ term: "", item: [] });
  this.orderId = this.activatedRoute.snapshot.queryParams.orderId;
  this.locationCode = this.activatedRoute.snapshot.queryParams.locationCode;
  if(this.orderId != null && this.orderId != undefined ){
  this.getStockOrderData()
  }
}


openPartSelector(){
  if (this.isPartSelector == true) {
    this.isPartSelector = false;
  } else {
    this.isPartSelector = true;
  }
}
  

partSelector($event){
   ;
  this.partList = $event
  if(this.partList!= null && this.partList != undefined  ){
  
    if(Array.isArray(this.partList))
    {
      for ( var item of this.partList)
      {
        
        this.partSelectorView.push({
          "currency":  item.currency,
          "imageUrl": item.imageUrl,
          "description":  item.description,
          "stockPrice":this.dynamicService.removeCommas(item.stockPrice==null|| item.stockPrice==undefined?"0" : item.stockPrice),
          "partNumber":item.partNumber,
          "type": item.type,
          "typeDescription":  item.typeDescription,
          "quantity": item.quantity==null|| item.quantity==undefined?1 : item.quantity,
          "IsDeleted":"0",
          "IsGSXPosted":"0"
        })
        
      }

    }
    else
    {
      var lstpartSelector=[];
        lstpartSelector.push(this.partList);
      this.partSelectorView.push({
          "currency":lstpartSelector[0]?.currency,
          "description": lstpartSelector[0]?.description,
          "stockPrice": this.dynamicService.removeCommas(lstpartSelector[0]?.stockPrice),
          "partNumber": lstpartSelector[0]?.partNumber,
          "type": lstpartSelector[0]?.type,
          "typeDescription": lstpartSelector[0]?.typeDescription,
          "quantity":  item.quantity==null|| item.quantity==undefined?1 : item.quantity,
          "IsDeleted":"0",
          "IsGSXPosted":"0"
      })
    
    }
   
const uniqueIds = [];
this.finalSelectedElements =  this.partSelectorView.filter(partNumber => {
  const isDuplicate = uniqueIds.includes(partNumber.partNumber);
  if (!isDuplicate) {
    uniqueIds.push(partNumber.partNumber);
    return true;
  }
  this.toasty.error("Part is already exists")
  return false;
});

  this.UpdateSelectedCount()
}
}

getBlankObject(): DropDownValue {
  const ddv = new DropDownValue();
  ddv.TotalRecord = 0;
  ddv.Data = [];
  return ddv;
}

UpdateSelectedCount(){
  this.addedPartCount=0
  for(let item of this.finalSelectedElements){
    this.addedPartCount == null || this.addedPartCount == undefined?1 : this.addedPartCount =  parseFloat((this.addedPartCount == null || this.addedPartCount == undefined?1 : this.addedPartCount ).toString()) + parseFloat((item.quantity==null || item.quantity==undefined?1 : item.quantity).toString())
  }
  this.TotalNetAmount()
}

TotalNetAmount(){
  this.stockPrice = 0
  for(let price of this.finalSelectedElements){
    this.stockPrice = this.round(this.stockPrice + price.stockPrice*parseFloat(price.quantity.toString()))
  }
  console.log("Price" , typeof this.stockPrice)
}

onPriceType(item) {
  var q = item.quantity
  this.UpdateSelectedCount()
}

onLocationSearch($event: { term: string; item: any[] }) {
  this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
    CompanyCode: glob.getCompanyCode().toString(),
  }).subscribe({
    next: (value) => {
      if (value != null) {
        this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
        this.LocationForJob = value;
      }
    },
    error: (err) => {
      this.LocationForJob = DropDownValue.getBlankObject();
    }
  });
}


closePartSelector($event){
  this.isPartSelector = $event
}


getStockOrderData() {
 ;
this.ngxSpinnerService.show()
var objData = {"orderId": this.orderId}
var strRequestData = JSON.stringify(objData);
  var data = {
    "Content":strRequestData
  };
  this.gsxService.getStockingPartsDetails(data).subscribe({
    next: (value) => {
       ;
      this.ngxSpinnerService.hide()
      let response = JSON.parse(value.toString());
      if (!(response.errors == undefined || response.errors == null)) {
         ;
        var errorMessage = "";
        for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
        {
            errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
            this.toasty.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
        }
      }
      else
      {
        this.stockData = response
        this.partList = response.parts
        console.log(this.stockData ,"this.partList")
        this.orderIDData()
      }
    },
    error:(err) => {
      console.log(err);
      this.toasty.error("Please try again. "+ err)
      this.ngxSpinnerService.hide()

    }
  });
}

 

orderIDData(){
  console.log('Location' , this.locationCode)
  this.netPrice = this.dynamicService.removeCommas(this.stockData?.price?.totalAmount)
  this.taxPrice = this.dynamicService.removeCommas(this.stockData?.price?.tax)
  this.purchaseOrderNumber = this.stockData?.purchaseOrderNumber

  if(Array.isArray(this.partList))
      {
        for ( var item of this.partList)
        {
          
          this.partSelectorView.push({
            "imageUrl": item.imageURL,
            "description":  item.description,
            "stockPrice":this.dynamicService.removeCommas(item.netPrice==null|| item.netPrice==undefined?"0" : item.netPrice),
            "partNumber":item.number,
            "quantity": item.quantity==null|| item.quantity==undefined?1 : item.quantity,
            "IsDeleted":"0",
            "IsGSXPosted":"1"
          })
          this.UpdateSelectedCount()
        }

      }
      else
      {
        var lstpartSelector=[];
          lstpartSelector.push(this.partList);
        this.partSelectorView.push({
            "imageUrl":lstpartSelector[0]?.imageURL,
            "description": lstpartSelector[0]?.description,
            "stockPrice": this.dynamicService.removeCommas(lstpartSelector[0]?.netPrice),
            "partNumber": lstpartSelector[0]?.number,
            "quantity":  lstpartSelector[0]?.quantity,
            "IsDeleted":"0",
            "IsGSXPosted":"1"
        })
        this.UpdateSelectedCount()
      } 
      this.finalSelectedElements =  this.partSelectorView

     
      if(Array.isArray(this.stockData?.shipments))
      {
        for ( var item of this.stockData?.shipments)
        {
          this.shipmentList.push({
            "number": item.number,
            "totalQuantityDelivered":  item.totalQuantityDelivered,
            "parts":item.parts
          })
          this.UpdateSelectedCount()
        }

      }else
      {

        var ShippingstpartSelector=[];
        this.shippingPartList =  item.parts
        ShippingstpartSelector.push(this.stockData?.shipments?.parts);
        this.shipmentList.push({
            "number":ShippingstpartSelector[0]?.number,
            "totalQuantityDelivered": ShippingstpartSelector[0]?.totalQuantityDelivered,
            "parts":item.parts
        })
        this.UpdateSelectedCount()
      } 

      if(Array.isArray(this.stockData?.invoices))
      {
        for ( var item of this.stockData?.invoices)
        {
          this.invoiceList.push({
            "id": item.id,
            "downloadUrl":  item.downloadUrl,
            
          })
          this.UpdateSelectedCount()
        }

      }else
      {

        var invoicePartSelector=[];
        invoicePartSelector.push(this.stockData?.invoices);
        this.invoiceList.push({
            "id":invoicePartSelector[0]?.id,
            "downloadUrl": invoicePartSelector[0]?.downloadUrl,
            
        })
        this.UpdateSelectedCount()
      }
      
}

round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
} 

StockOrderGuid= ''

onSubmit() {
  this.ngxSpinnerService.show();
  this.StockOrderGuid = uuidv4();
  let requestData = [];
  
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveStockOrder"
    });
    requestData.push({
      "Key": "StockOrderHeaderGUID",
      "Value": this.StockOrderGuid
    });
    requestData.push({
      "Key": "PurchaseOrderNumber",
      "Value": this.purchaseOrderNumber
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.locationCode
    });
    requestData.push({
      "Key": "SubTotalAmount",
      "Value": this.stockPrice
    });
    requestData.push({
      "Key": "TaxAmount",
      "Value": this.taxPrice==null|| this.taxPrice==undefined?0 : this.taxPrice
    });
    requestData.push({
      "Key": "NetAmount",
      "Value": this.netPrice==null|| this.netPrice==undefined?0 : this.netPrice
    });
    requestData.push({
      "Key": "StockOrderDetail",
      "Value": this.saveStockOrderXml()
    });
    requestData.push({
      "Key": "ShippingDetail",
      "Value": this.getStockOrderShippingXml(this.shipmentList)
    });
    requestData.push({
      "Key": "InvoiceDetail",
      "Value": this.getStockOrderInvoiceXml(this.invoiceList)
    });
    requestData.push({
      "Key": "OrderId",
      "Value": this.stockData?.orderId
    });
    requestData.push({
      "Key": "OrderCreateDate",
      "Value":  this.stockData?.orderCreateDate
    });
    requestData.push({
      "Key": "OrderStatusCode",
      "Value":  this.stockData?.orderStatusCode
    });
    requestData.push({
      "Key": "OrderStatusDescription",
      "Value":  this.stockData?.orderStatusDescription
    });
    requestData.push({
      "Key": "ServiceOrderNumber",
      "Value": this.stockData?.serviceOrderNumber
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
           ;
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            console.log("sucess");
            this.toasty.success("Saved Successfully")
            this.ngxSpinnerService.hide();
          }
          else {
            this.errorMessage = response.ReturnMessage;
            this.toasty.error(response.ReturnMessage)
          }
        },
        error: err => {
           ;
          console.log(err);
          this.toasty.error(err)
          this.ngxSpinnerService.hide();
        }
      });
}

saveStockOrderXml(){
  let rawData = {
    "rows": []
  }
  for (let items of this.finalSelectedElements) {
    rawData.rows.push({
      "row": {
        "StockOrderDetailGUID" :uuidv4(),
        "Image": items.imageUrl,  
        "PartCode":items.partNumber,
        "PartDescription":items.description,
        "Price": items.stockPrice,
        "Quantity": items.quantity,
        "Isdeleted":items.IsDeleted
        }
    })
  }
  console.log("rawData++", rawData);
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(rawData);
  xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //xml = xml.split(' ').join('')
  console.log("xml", xml);
  return xml;
}


getStockOrderShippingXml(shippinglist){
   
  let rawData = {
    "shippings": []
  }
  for (let items of shippinglist) {
    rawData?.shippings?.push({
      "shipping": items
    })
  }
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(rawData);
  xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //xml = xml.split(' ').join('')
  console.log("xml", xml);
  return xml;
}
 
getStockOrderInvoiceXml(invoicelist){
  let rawData = {
    "invoices": []
  }
  for (let items of invoicelist) {
    rawData.invoices.push({
      "invoice": {
        "id": items.id,
        "downloadUrl":  items.downloadUrl,
        }
    })
  }
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(rawData);
  xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
  //xml = xml.split(' ').join('')
  console.log("xml", xml);
  return xml;
}

deleteitem(item)
{
  if(item.IsGSXPosted=="1")
  {
    item.IsDeleted = "1"
  }
  else{
    let index = this.finalSelectedElements.indexOf(item)
    this.finalSelectedElements.splice(index,1)
  }
  this.UpdateSelectedCount()
  this.saveStockOrderXml()
}

removeItem(item) {
  item.isDeleted = item.isDeleted==1?0:1;
    }

getOrderSummaryData() {

   
  this.ngxSpinnerService.show()
 
  var objData = {
    "notes": {
          "content": "Remark"
        },
    "purchaseOrderNumber": this.purchaseOrderNumber,
    "shipToCode": this.Ship_to_GSX,
    "parts": [
      
    ],
    "action": "SAVE"
    }

    for (let items of this.finalSelectedElements) {
      objData.parts.push({
        "number": items.partNumber,
        "quantity": items.quantity,
        "delete": true
      })
    }
 
console.log('Data' , objData)
  var strRequestData = JSON.stringify(objData);
    var data = {
      "Content":strRequestData
    };
    this.gsxService.getOrderStockingSummary(data).subscribe({
      next: (value) => {
         ;
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
           ;
          var errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
          {
              errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
              this.toasty.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
        }
        else
        {
 
        
        }
      },
      error:(err) => {
        console.log(err);
        this.toasty.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()

      }
    });
  }


  getInvoicePdf() {
     ;
    for (let items of this.invoiceList) {
      var objData = {
        "id": items.id,
        "downloadUrl" : items.downloadUrl
    }
    }
     
    this.ngxSpinnerService.show()
    
    var strRequestData = JSON.stringify(objData);
      var data = {
        "Content":strRequestData
      };
      
    
      this.gsxService.getInvoiceLink(data).subscribe({
        next: (value) => {
           ;
          this.ngxSpinnerService.hide()
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
             ;
            var errorMessage = "";
            for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
            {
                errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
                this.toasty.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
            }
          }
          else
          {
  
            const byteArray = new Uint8Array(atob(response.FileContents).split('').map(char => char.charCodeAt(0)));
            var blob = new Blob([byteArray], { type: 'application/pdf' });
            var url = URL.createObjectURL(blob);
            window.open(url);
          }
        },
        error:(err) => {
           ;
          console.log(err);
          this.toasty.error("Please try again. "+ err)
          this.ngxSpinnerService.hide()
  
        }
      });
    }
}
