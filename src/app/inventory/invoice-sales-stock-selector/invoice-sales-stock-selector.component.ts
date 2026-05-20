import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';


@Component({
  selector: 'app-invoice-sales-stock-selector',
  templateUrl: './invoice-sales-stock-selector.component.html',
  styleUrls: ['./invoice-sales-stock-selector.component.css']
})
export class InvoiceSalesStockSelectorComponent implements OnInit {
  invoiceStockData: any[] = [];
  selectedStockData: any[] = [];
  searchedSerialNumber: string = '';
  showAllRows: boolean ;
  typeSelected = 'ball-clip-rotate';
  CustomerObject

  constructor(
    private gsxService: GsxService,
    private toast: ToastrService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
    public dialogRef: MatDialogRef<InvoiceSalesStockSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.getInvoiceSalesPart()
  }


  addInvoiceSalesStocks()
  {
    this.selectedStockData=[]
    for(let item of this.invoiceStockData)
    {
      if(item.isSelected == true)
      {
        this.selectedStockData.push(item)
      }
    }
    this.dialogRef.close(this.selectedStockData)
  }

  filterData() {
    if (this.searchedSerialNumber === '') {
      this.showAllRows = true;
    } else {
      this.showAllRows = false;
    }
  }


  getInvoiceSalesPart() {
    
    this.ngxSpinnerService.show()
    this.gsxService.getInvoiceStock(this.data.SAPPlantCode, this.data.SAPStorageLocation).subscribe({
      next: (response: any) => {
       // this.ngxSpinnerService.hide()
        
        if (Array.isArray(response.d.results)) {
          this.invoiceStockData = response.d.results
          for(let item of this.invoiceStockData)
          {
            delete item.__metadata
          }
          const uniqueItems = this.invoiceStockData.filter((item, index, self) =>
            index === self.findIndex((t) => (
              t.Material === item.Material
            )))
          console.log("SAP invoiceStockData ", this.invoiceStockData)
          this.getInvoiceMaterialName(uniqueItems)
        }
        else {
          this.invoiceStockData.push(response.d.results)
          this.getInvoiceMaterialName(this.invoiceStockData) 
        }
        this.GetResourceList()
      },
      error: (err) => {
        this.ngxSpinnerService.hide()
        console.log(err)
      }
    })
  }


  getInvoiceMaterialName(materialcodearray: any[]) {
    
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "GetInvoiceMaterialDetails"
    })
    requestData.push({
      "Key": "InvoiceMaterialDetail",
      "Value": this.getMaterialCodeXML(materialcodearray)
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.ngxSpinnerService.show()

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            
            //this.ngxSpinnerService.hide()
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log('data.InvoiceSalesMaterialDetail', data.InvoiceSalesMaterialDetail)
              if(Array.isArray(data.InvoiceSalesMaterialDetail))
              {
                for(let item of this.invoiceStockData)
                {
                  const matchingIndex = data.InvoiceSalesMaterialDetail.findIndex(obj => obj.MaterialCode == item.Material)
                  if(matchingIndex > -1)
                  {
                    const matchingElement = data.InvoiceSalesMaterialDetail[matchingIndex]
                    item.MaterialName = matchingElement.MaterialName
                    item.isSelected = false;
                    item.ItemType=matchingElement.ItemType;
                    item.InventoryStockType= matchingElement?.PartType;
                    item.PriceSource = matchingElement?.PriceSource
                    if ( item?.MaterialCode == '6490' )
                      console.log("Resource ", data.Resource.Resource)
                  } 
                  
                }
              }
              else
              {
                for(let item of this.invoiceStockData)
                {
                  item.MaterialName = data.InvoiceSalesMaterialDetail.MaterialName
                  item.ItemType=data.InvoiceSalesMaterialDetail.ItemType;
                    item.InventoryStockType= data.InvoiceSalesMaterialDetail?.PartType;
                    item.PriceSource =data.InvoiceSalesMaterialDetail?.PriceSource


                }
              }

       
            }
            this.ngxSpinnerService.hide()
          } catch (ext) {
              this.ngxSpinnerService.hide()
          }
        },
        error: err => {
          this.ngxSpinnerService.hide()
          console.log(err)
        }
      }
    );
  }

  getMaterialCodeXML(data: any[]) {
    let rawData = {
      "rows": []
    }
    for (let item of data) {

      rawData.rows.push({
        "row": {
          "MaterialCode": item.Material
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }
  GetResourceList() {
    
    let requestData = [];
    requestData.push({
        "Key": "APIType",
        "Value": "GetResourcePriceList"
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
        "content": strRequestData
    };
    //this.ngxSpinnerService.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (Value) => {
            try {
                  
                
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') {
                    let data = JSON.parse(response?.ExtraData);
                    let ResourceList = data?.Resource?.Resource;
                    if (Array.isArray(ResourceList)) {
                        for (let item of ResourceList) {
                            this.invoiceStockData.push({
                                "MaterialName": item.MaterialName,
                                "Material": item.MaterialCode,
                                "SerialNumber": "",
                                "Batch": "",
                                "SerializedModule": item?.SerializedModule,
                                "InventoryStockType": item?.PartType,
                                "isSelected": false,
                                "ItemType": item?.ItemType,
                                "PriceSource" : item?.PriceSource
                            });
                        }

                        this.invoiceStockData.forEach(element => {
                            let matchedItem = ResourceList.find(item => item.MaterialCode === element.Material);
                            if (matchedItem) {
                                element.InventoryStockType = matchedItem?.PartType;
                            }
                        });
                    } else {
                        this.invoiceStockData.push({
                            "MaterialName": data?.Resource?.Resource?.MaterialName,
                            "Material": data?.Resource?.Resource?.MaterialCode,
                            "SerialNumber": data?.Resource?.Resource?.SerialNumber ?? "000000",
                            "Batch": data?.Resource?.Resource?.Batch ?? "",
                            "SerializedModule": data?.Resource?.Resource?.SerializedModule,
                            "InventoryStockType": data?.Resource?.Resource?.PartType,
                            "isSelected": false,
                            "ItemType": data?.Resource?.Resource?.ItemType,
                            "PriceSource" : data?.Resource?.Resource?.PriceSource

                        });
                    }

                    if (this.data.DocType === 'DSALES') {
                          
                        this.CustomerObject = this.data.CustomerObject
                        console.log("** Customer Object ", this.CustomerObject )
                        let excludedCTPLCustomers = new Set(['123909265', '123909277', '123909247', '123909249','E2500000021' ,'E2500000365','E2500000535','12324889135','C2500088312','C2500073671','E2500001298']);
                        if (!excludedCTPLCustomers.has(this.CustomerObject.CustomerCode) && this.CustomerObject.CustAccGroupCode !== 'ALLSTAFF') {
                              this.invoiceStockData = this.invoiceStockData.filter(item =>  
                                ['3PP', 'EXTWAR', 'PROTECTPLUS', 'ACPLUS', 'WARCLAIMS', 'APPLE ACC','Other'].includes(item.InventoryStockType)
                              );
                        }
                    }
                }
                this.ngxSpinnerService.hide()
            } catch (ext) {
                this.ngxSpinnerService.hide()
                console.log(ext);
            }
        },
        error: err => {
            this.ngxSpinnerService.hide()
            console.log(err);
        }
    });
}


}
