import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CaseDetail } from '../repair-process.metadata';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import xml2js from 'xml2js';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import * as glob from "../../../config/global";
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { POSDTA } from 'src/app/transaction/repair-process/invoice/posdta.metadata'
import { Router } from '@angular/router';



@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})

export class InvoiceComponent implements OnInit {

  invoiceList: any []=[];
  isShowTotal: boolean = false
  InvoiceGuid= uuidv4()
  errorMessage: any;
  DocTypeData: string = 'InvoiceRepair'
  PosDtaVal
  objPosDta :POSDTA;
  showButton: boolean = true;

  @Input()   repa :CaseDetail;
  @Output() InvoiceFlag = new EventEmitter<any>();
  @Output() InvoiceSet = new EventEmitter<any>();
  

  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private route: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

ngOnChanges(changes: SimpleChanges): void{
    if(changes['repa'])
    {
      
       ;
      this.invoiceList = []
      if(this.repa!= null && this.repa != undefined ){ 
        if(Array.isArray(this.repa?.INVOICE?.INVOICEDETAILS?.InvoiceItem))
        {
  for (let item of this.repa?.INVOICE?.INVOICEDETAILS?.InvoiceItem)
        {
          this.invoiceList.push({
            "ItemNo": item.ItemNo, 
            "ItemCode":item.ItemCode,
            "ItemDescription": item.ItemDescription,
            "UnitPrice": item.UnitPrice,
            "TotalNetPrice":item.TotalNetPrice,
            "TotalTaxPrice":item.TotalTaxPrice,
            "ImageUrl":item.imageUrl,
            "Type":item.type,
            "NetAmount" : item.NetAmount
            
          })
      }
}else {
  var lstInvoiceList=[];
  lstInvoiceList.push(this.repa?.INVOICE?.INVOICEDETAILS?.InvoiceItem);
  this.invoiceList.push({
      "ItemCode":lstInvoiceList[0]?.ItemCode,
      "ItemDescription": lstInvoiceList[0]?.ItemDescription,
      "UnitPrice": lstInvoiceList[0]?.UnitPrice,
      "TotalNetPrice":lstInvoiceList[0]?.TotalNetPrice,
      "TotalTaxPrice":lstInvoiceList[0]?.TotalTaxPrice,
      "ImageUrl":lstInvoiceList[0]?.imageUrl,
      "Type":lstInvoiceList[0]?.type,
      "NetAmount": lstInvoiceList[0]?.NetAmount
     
})
}
    }
  }
}

  ngOnInit(): void {
  }

  routeToAccessorySales(){
    // this.showButton = true;
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/accessory-sales'], { queryParams: { doctype: "RSALES", locationcode: this.repa.LocationCode, customercode:this.repa.RetailCustomerCode, caseguid:this.repa.CaseGUID} })
  }


generateInvoice(){
  if(Array.isArray(this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem))
        {
  for (let item of this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem)
        {
          this.invoiceList.push({
            "ItemNo": item.ItemNo, 
            "ItemCode":item.ItemCode,
            "ItemDescription": item.ItemDescription,
            "UnitPrice": item.UnitPrice,
            "TotalNetPrice":item.TotalNetPrice==undefined?0:item.TotalNetPrice,
            "TotalTaxPrice":item.TotalTaxPrice==undefined?0:item.TotalTaxPrice,
            "ImageUrl":item.imageUrl,
            "Type":item.type,
          })
      }
}else {
  var lstInvoiceList=[];
  lstInvoiceList.push(this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem);
  this.invoiceList.push({
      "ItemNo": lstInvoiceList[0]?.ItemNo,
      "ItemCode":lstInvoiceList[0]?.ItemCode,
      "ItemDescription": lstInvoiceList[0]?.ItemDescription,
      "UnitPrice": lstInvoiceList[0]?.UnitPrice,
      "TotalNetPrice":lstInvoiceList[0]?.TotalNetPrice,
      "TotalTaxPrice":lstInvoiceList[0]?.TotalTaxPrice,
      "ImageUrl":lstInvoiceList[0]?.imageUrl,
      "Type":lstInvoiceList[0]?.type,
})
}
 this.saveInvoiceListXml()
 this.onSubmit()
}


showTotal()
{
    if (this.isShowTotal == true) {
      this.isShowTotal = false;
    } else {
      this.isShowTotal = true;
    } 
}


onSubmit() {
  let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveInvoice4Job"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "InvoiceCode",
      "Value": ""
    });
    requestData.push({
      "Key": "InvoiceGuid",
      "Value": this.InvoiceGuid
    });
    requestData.push({
      "Key": "InvoiceDate",
      "Value": new Date(),
    });
    requestData.push({
      "Key": "InvoiceDocType",
      "Value": this.DocTypeData
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.repa.LocationCode
    });
    requestData.push({
      "Key": "RetailCustomerCode",
      "Value": this.repa.CUSTOMER.CustomerCode
    });
    requestData.push({
      "Key": "TotalBaseAmount",
      "Value": this.repa.QUOTE.TotalBaseAmount
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "TotalDiscountAmount",
      "Value": this.repa.QUOTE.TotalDiscountAmount
    });
    requestData.push({
      "Key": "TotalTaxableAmount",
      "Value": this.repa.QUOTE.TotalTaxableAmount
    });
    requestData.push({
      "Key": "TotalTaxAmount",
      "Value": this.repa.QUOTE.TotalTaxAmount
    });
    requestData.push({
      "Key": "TotalNetAmount",
      "Value": this.repa.QUOTE.TotalNetAmount
    });
    requestData.push({
      "Key": "InvoiceStatus",
      "Value": "RELEASED"
    });
    requestData.push({
      "Key": "InvoiceDetails",
      "Value": this.saveInvoiceListXml()
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
           
          this.spinner.hide();
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");
             this.PosDtaVal = JSON.parse(response.ExtraData);
             console.log("sucess", this.PosDtaVal.INVOICE.INVOICE.InvoiceCode);
             if(Array.isArray(this.PosDtaVal.INVOICE.INVOICE.INVOICEDETAILS.InvoiceItem))
             {
               for (let item of this.PosDtaVal.INVOICE.INVOICE.INVOICEDETAILS.InvoiceItem)
               {
                   this.invoiceList.push({
                    "ItemNo": item.ItemNo, 
                    "ItemCode":item.ItemCode,
                    "ItemDescription": item.ItemDescription,
                    "UnitPrice": item.UnitPrice,
                    "TotalNetPrice":item.TotalNetPrice,
                    "TotalTaxPrice":item.TotalTaxPrice,
                    "ImageUrl":item.imageUrl,
                    "Type":item.type,
                   })
               }
             }else {
                var lstInvoiceList=[];
                lstInvoiceList.push(this.PosDtaVal.INVOICE.INVOICE.INVOICEDETAILS.InvoiceItem);
                this.invoiceList.push({
                  "ItemCode":lstInvoiceList[0]?.ItemCode,
                  "ItemDescription": lstInvoiceList[0]?.ItemDescription,
                  "UnitPrice": lstInvoiceList[0]?.UnitPrice,
                  "TotalNetPrice":lstInvoiceList[0]?.TotalNetPrice,
                  "TotalTaxPrice":lstInvoiceList[0]?.TotalTaxPrice,
                  "ImageUrl":lstInvoiceList[0]?.imageUrl,
                  "Type":lstInvoiceList[0]?.type,
          
              })
            }
            this.toaster.success('Submitted Succesfully')
            var Invoiceflag = 1
            this.InvoiceFlag.emit(Invoiceflag)
            var Data = {"INVOICE":this.PosDtaVal.INVOICE.INVOICE}
            this.InvoiceSet.emit(this.PosDtaVal.INVOICE)
            
          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              console.log("response" , response)
              this.toaster.error("")
            });
          }
        },
        error: err => {
          this.spinner.hide();
          console.log(err);
        }
    });
}


saveInvoiceListXml() {
   ;
  let rawData = {
    "rows": []
  }
  let count = 0;
  var InvoiceArray  = []

  if(Array.isArray(this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem)){
    InvoiceArray = this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem
  }else{
    InvoiceArray.push(this.repa?.QUOTE?.QUOTEDETAILS?.QuoteItem)
  }

  for (let item of InvoiceArray) {
    count += 1
    rawData.rows.push({
      "row": {
        "InvoiceDetailGuid": uuidv4(),
        "InvoiceGUID": this.InvoiceGuid,
        "ItemType": item.ItemType,
        "ItemNo": count,
        "SerialNo":item.SerialNo,
        "ItemCode": item.ItemCode,
        "ItemDescription": item.ItemDescription,
        "GSTGroupCode": item.GSTGroupCode == null || item.GSTGroupCode == undefined ? "" : item.GSTGroupCode,
        "SAC_HSNCode": item.SAC_HSNCode == null || item.SAC_HSNCode == undefined ? "" : item.SAC_HSNCode,
        "Quantity": 1,
        "UnitPrice": item.UnitPrice,
        "BaseAmount": item.BaseAmount,
        "DiscountAmount": item.DiscountAmount,
        "TaxableAmount": item.TaxableAmount,
        "TaxPercentage": item.TaxPercentage,
        "CGSTPercentage":item.CGSTPercentage,
        "SGSTPercentage":item.SGSTPercentage,
        "IGSTPercentage":item.IGSTPercentage,
        "LavyPercentage":item.LavyPercentage == null || item.LavyPercentage == undefined? 0 :item.LavyPercentage,
        "CGSTAmount":item.CGSTAmount,
        "SGSTAmount":item.SGSTAmount,
        "IGSTAmount":item.IGSTAmount,
        "LavyAmount":item.LavyAmount == null || item.LavyAmount ==  undefined? 0 :item.LavyAmount,
        "NetAmount": item.NetAmount,
        "TaxAmount": item.TaxAmount,
        "isDeleted": 0
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

check(){
  console.log("Length" , this.invoiceList)
}


   
   

POSDTA(){

  var InvoiceArray  = []

  if(Array.isArray(this.PosDtaVal.INVOICE.InvoiceItem)){
    InvoiceArray = this.PosDtaVal.INVOICE.InvoiceItem
  }else{
    InvoiceArray.push(this.PosDtaVal.INVOICE.InvoiceItem)
  }

  var importparameters = {
    "i_commit": "X",
    "i_lockwait": "",
    "i_sourcedocumentlink": {
    "key": "",
    "logicalsystem": "",
    "type": ""

  }
}
for(let item of InvoiceArray){
  var posdta= {
    
      "importparameters": {
      "i_commit": "X",
      "i_lockwait": "",
      "i_sourcedocumentlink": {
      "key": "",
      "logicalsystem": "",
      "type": ""
      }
      },
      "requesttables": {
      "additionals": [
           {
             "businessdaydate": new Date(),
             "retailstoreid": "8905",
             "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
             "transactiontypecode": "1211",
             "workstationid": "C1"
      }
     
     
      ],
      "creditcard": [
      ],
      "customerdetails": [
      {
      "businessdaydate": new Date(),
      "customerdetailssequencenumber": this.PosDtaVal.INVOICE.RetailCustomerCode,
      "customerinformationtypecode": "CUST",
      "dataelementid": "CUSTREGION",
      "dataelementvalue": "MAH",
      "retailstoreid": "2008",
      "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
      "transactiontypecode": "1211",
      "workstationid": "C1"
      }
      ],
      "directdebit": [
      ],
      "lineitemdiscount": [
      ],
      "lineitemext": [],
      "lineitemtax": [
     {
            "businessdaydate": new Date(),
             "retailstoreid": "2008",
             "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
             "transactiontypecode": "1211",
             "retailsequencenumber": "1",
             "taxsequencenumber": "1",
             "taxtypecode": "4303",
             "taxamount": "404.23",
             "workstationid": "C1"
     },
     {
            "businessdaydate": new Date(),
             "retailstoreid": "2008",
             "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
             "transactiontypecode": "1211",
             "retailsequencenumber": "1",
             "taxsequencenumber": "2",
             "taxtypecode": "4304",
             "taxamount": "404.23",
             "workstationid": "C1"
     },
     {
            "businessdaydate": new Date(),
             "retailstoreid": "2008",
             "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
             "transactiontypecode": "1211",
             "retailsequencenumber": "2",
             "taxsequencenumber": "3",
             "taxtypecode": "4303",
             "taxamount": "90.00",
             "workstationid": "C1"
     },
     {
            "businessdaydate": new Date(),
             "retailstoreid": "2008",
             "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
             "transactiontypecode": "1211",
              "retailsequencenumber": "2",
               "taxsequencenumber": "4",
               "taxtypecode": "4304",
               "taxamount": "90.00",
               "workstationid": "C1"
     }
     ],

     
      "retaillineitem": [
     {
      "actualunitprice": item.UnitPrice,
      "batchid": "",
      "businessdaydate": new Date(),
      "cost": item.NetAmount,
      "enteredean": "",
      "itemid": item.ItemCode,
      "itemid_LONG": item.ItemDescription,
      "itemidentrymethodcode": "",
      "itemidqualifier": "1",
      "logsys": "",
      "retailquantity": item.Quantity,
      "retailsequencenumber": item.ItemNo,
      "retailstoreid": "2008",
      "retailtypecode": "2001",
      "salesamount": item.BaseAmount,
      "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
      "transactiontypecode": "1211",
      "units": "1",
      "workstationid": "C1"
      }
     
      ],
      "tender": [
      {
      "accountnumber": "",
      "businessdaydate": new Date(),
      "referenceid": "",
      "retailstoreid": "2008",
      "tenderamount": "6479.99",
      "tendercurrency": "",
      "tendercurrency_iso": "",
      "tenderid": "",
      "tendersequencenumber": "1",
      "tendertypecode": "6044",
      "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
      "transactiontypecode": "1211",
      "workstationid": "C1"
      }
      ],
      "tenderext": [
      {
      "businessdaydate": new Date(),
      "fieldgroup": "ACTNO",
      "fieldname": "ACCOUNTNO",
      "fieldvalue": this.PosDtaVal.INVOICE.CaseId,
      "retailstoreid": "2008",
      "tendersequencenumber": "1",
      "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
      "transactiontypecode": "1211",
      "workstationid": "C1"
      }
     ],
      "transaction": [
      {
      "activitytime": "0.000",
      "begindatetimestamp": "20230315160600",
      "businessdaydate": new Date(),
      "customerage": "0",
      "customerentrymethod": "",
      "customeridpos": "",
      "department": "1",
      "enddatetimestamp": "20230315160600",
      "logsys": "",
      "operatorid": "",
      "operatorqualifier": "",
      "origbegintimestamp": "",
      "origbusinessdaydate": "",
      "origlineitemnumber": "",
      "origreasoncode": "",
      "origretailstoreid": "",
      "origtransnumber": "",
      "origworkstationid": "",
      "partnerid": "",
      "partnerqualifier": "",
      "pausetime": "0.000",
      "registertime": "0.000",
      "retailstoreid": "2008",
      "tendertime": "",
      "tillid": "",
      "trainingtime": "0.000",
      "transactioncurrency": "INR",
      "transactioncurrency_iso": "INR",
      "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
      "transactiontypecode": "1211",
      "workstationid": "C1"
      }
      ],
      "transactiondiscount": [
       ],
      "transactionext": [
       {
         "businessdaydate": new Date(),
          "fieldgroup": "ECOM",
          "fieldname": "ORDERID",
          "fieldvalue": this.PosDtaVal.INVOICE.CaseId,
          "retailstoreid": "2008",
          "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
          "transactiontypecode": "1211",
          "workstationid": "C1"
       } ,
       {
         "businessdaydate": new Date(),
          "fieldgroup": "GST",
          "fieldname": "TAXINVC",
          "fieldvalue": this.PosDtaVal.INVOICE.InvoiceCode,
          "retailstoreid": "2008",
          "transactionsequencenumber": this.PosDtaVal.INVOICE.InvoiceCode,
          "transactiontypecode": "1211",
          "workstationid": "C1"
       }
      ],
      "transactionloyalty": [
      
      ]
      }
     } 
  }
}

}

/*{
                         "businessdaydate": "",
                         "keyedofflineflag": "",
                         "retailstoreid": "",
                          "trainingflag": "",
                          "transactionsequencenumber": "",
                          "transactiontypecode": "",
                          "transreasoncode": "",
                          "workstationid": ""
                        } */


