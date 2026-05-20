import { Component, OnInit, SimpleChanges } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { v4 as uuidv4 } from 'uuid';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ActivatedRoute } from '@angular/router';
import xml2js from 'xml2js';




@Component({
  selector: 'app-consignment-delivery',
  templateUrl: './consignment-delivery.component.html',
  styleUrls: ['./consignment-delivery.component.css']
})
export class ConsignmentDeliveryComponent implements OnInit {

  addedPartCount:number=0;
  partsObject: any[] = [];
  isdisabled:boolean = false;
  updatedAcknowledgeArray: any[] = [];
  isPartSelector: boolean = false;
  responseData: any[] = []; 
  deliveryNumber:string;
  typeSelected = 'ball-clip-rotate';
  stockPrice: number=0;
  params:any;
  Ship_to_GSX: string;
  stockOrderForm: FormGroup;
  AcknowledgeXmlData: any[]=[];
  LocationAccGroup: DropDownValue = this.getBlankObject();
  AcknowledgedData:any [] = [];
  visible:boolean=false;
  rotate:boolean=false;
  errorMessage: string;
  deliveredDate: any;


  constructor(
    private dynamicService : DynamicService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private ngxSpinnerService: NgxSpinnerService,
    private gsxService: GsxService ,
  ) { }


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.deliveryno != null || this.params.deliveryno != undefined) {
      this.deliveryNumber = this.params.deliveryno
      this.Ship_to_GSX = this.params.shipto
      this.getPendingAcknowledgeMent()
    }
    // this.onLocation({ term: "", item: [] });

  }


  getPendingAcknowledgeMent()
  {
    this.ngxSpinnerService.show()
    var objData = {"deliveryStatusGroupCode": "ALL","shipTo":this.Ship_to_GSX,"deliveryNumber":this.deliveryNumber}
    var strRequestData = JSON.stringify(objData);
    var data = {
      "Content":strRequestData
    };
    this.gsxService.getConsignmentDeliveryLookup(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
          {
              errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
              this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
        }
        else{
          this.toast.success(errorMessage,"Records Found Successfully",{closeButton:true})
          
          response[0].TotalQty = response[0].parts.map(a => a.quantityDelivered).reduce(function(a, b)
            {
              return a + b;
            });
            this.AcknowledgedData=[];
          for (let item of response[0].parts)
          {
            item.AcknowledgeRows = [];
            if(item.serialized==true)
            {
              for(let device of item.devices)
              {
                 ;
                item.AcknowledgeRows.push({
                    "Code" : item.number,
                    "Description":item.description,
                    "SerialNo":device.identifiers.serial,
                    "RowId":uuidv4(),
                    "AcknowledgeQuantity":1,
                    "PreviousAcknowldgeFlag":1
                });
                this.AcknowledgedData.push({
                  "Code" : item.number,
                  "Description":item.description,
                  "SerialNo":device.identifiers.serial,
                  "RowId":uuidv4(),
                  "AcknowledgeQuantity":1,
                  "PreviousAcknowldgeFlag":1
              })
              }
              for(let i=0  ; i < item.quantityDelivered - item.quantityAcknowledged ; i++ )
              {
        
                item.AcknowledgeRows.push({
                    "Code" : item.number,
                    "Description":item.description,
                    "SerialNo":"",
                    "RowId":uuidv4(),
                    "AcknowledgeQuantity":1,
                    "PreviousAcknowldgeFlag":0
                });
                 
                this.AcknowledgedData.push({
                  "Code" : item.number,
                  "Description":item.description,
                  "SerialNo":"",
                  "RowId":uuidv4(),
                  "AcknowledgeQuantity":1,
                  "PreviousAcknowldgeFlag":0
              });

              }


            }
            else
            {
              if(item.quantityAcknowledged>0)
              {
                item.AcknowledgeRows.push({
                  "Code" : item.number,
                  "Description":item.description,
                  "SerialNo":"",
                  "AcknowledgeQuantity":item.quantityAcknowledged,
                  "RowId":uuidv4(),
                  "PreviousAcknowldgeFlag":1
              });
              this.AcknowledgedData.push({
                "Code" : item.number,
                "Description":item.description,
                "SerialNo":"",
                "AcknowledgeQuantity":item.quantityAcknowledged,
                "RowId":uuidv4(),
                "PreviousAcknowldgeFlag":1
              });

              }
            }
            //}
            item.visible=false;
            item.rotate=false;
            item.TotalAcknowledgeQuantity=item.quantityAcknowledged;
          }
          this.responseData = response
          for(let item of this.responseData)
          {
            this.deliveredDate = item.deliveredDate
          }
        }
      },
      error:(err) => {
        console.log(err);
        this.toast.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()
      }
    });
  }


  acknowledgeValueChange(items)
  {
    if(items.acknowledgeValue > parseFloat(items.quantityDelivered))
      {
        this.toast.error("Acknowledge Quantity cannot be Greater than Total Quantity")
        items.acknowledgeValue = 0;
      }
    else if(items.acknowledgeValue < 0 || items.acknowledgeValue == undefined || items.acknowledgeValue == null){
      this.toast.error("Acknowledge Quantity Cannot be Less Than 0")
      items.acknowledgeValue = 0;
    }

  }


  saveAcknowledgeConsignment()
  {
    this.ngxSpinnerService.show()
    let requestdata = []
    requestdata.push({
      "Key":"APIType",
      "Value":"SaveAcknowledgeConsignment"
    })
    requestdata.push({
      "Key":"ConsignmentDeliveryHeaderGUID",
      "Value":uuidv4()
    })
    requestdata.push({
      "Key":"DeliveryNumber",
      "Value":this.deliveryNumber
    })
    requestdata.push({
      "Key":"AcknowledgeDate",
      "Value":Date().toString()
    })
    requestdata.push({
      "Key":"ConsignmentDeliveryDetail",
      "Value":this.getConsignmentXml()
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
          }
          else {
            this.errorMessage = response.ReturnMessage;
            this.toast.error(response.ReturnMessage)
          }
        },
        error: err => {
          console.log(err);
          this.ngxSpinnerService.hide();
        }

      });
  }

  getConsignmentXml() {
    let rawData = { "rows": [] }
    for (let item of this.AcknowledgeXmlData) {
      rawData.rows.push({
        "row": {
          "ConsignmentDetailGUID":uuidv4(),
          "PartCode":item.number,
          "PartDescription":item.description,
          "AcknowledgeQuantity":item.quantityAcknowledged,
          "SerialNo":item.serialNo
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


  deleteitem(object,part)
  {
     ;
    for(let item of part.AcknowledgeRows)
    {
      if(item.RowId == object.RowId)
      {
        part.TotalAcknowledgeQuantity = parseInt(part.TotalAcknowledgeQuantity) - parseFloat(object.AcknowledgeQuantity)
        part.AcknowledgeRows.pop(object)
        //this.isdisabled = false;

      }
    }
    console.log(part.AcknowledgeRows)
  }

SaveAcknowldge()
{

  var partlist=[];
  var item=this.responseData[0]
  var deliveryNumber=item.deliveryNumber
  for(let part of item.parts)
  {
      for (let acknowldgepart of part.AcknowledgeRows)
      {
          if(part.serialized== false)
          {
            if(acknowldgepart.PreviousAcknowldgeFlag==0)
            {

            
              partlist.push({
                "number":part.number,
                "quantity":parseInt( acknowldgepart.AcknowledgeQuantity)
              })
            }
          }
          else
          {
            if((acknowldgepart.PreviousAcknowldgeFlag==0) && acknowldgepart.SerialNo != undefined && acknowldgepart.SerialNo != null && acknowldgepart.SerialNo  != "" )
            {
              partlist.push({
                "number":part.number,
                "device":{"id":acknowldgepart.SerialNo}
              })

            }

          }
    }
  }
  if(partlist.length > 0 )
  {
     ;
    var dataToAcknowldge={"deliveryNumber":deliveryNumber,"parts":partlist}
    this.ngxSpinnerService.show()
    var strRequestData = JSON.stringify(dataToAcknowldge);
    var data = {
      "Content":strRequestData
    };
    //return
    this.gsxService.saveConsignmentAcknowldge(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
          {
              errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
              this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
        }
        else{
          this.toast.success(errorMessage,"Consignment Delivery Acknowledge successfull",{closeButton:true})
          let parts = []
          parts = response.parts
          this.AcknowledgeXmlData = []
          for(let item of parts)
          {
            if(item.statusCode == "ACKNOWLEDGE_SUCCESS")
            {
             this.AcknowledgeXmlData.push(item)
            }
          }
          this.saveAcknowledgeConsignment()

          this.getPendingAcknowledgeMent();
        }
      },
      error:(err) => {
        console.log(err);
        this.toast.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()
      }
    });



  }
  else
  {
    this.toast.error("Acknowldge items need to be selected")
  }

  


}
  


getBlankObject(): DropDownValue {
  const ddv = new DropDownValue();
  ddv.TotalRecord = 0;
  ddv.Data = [];
  return ddv;
}


toggleCollapse(item): void { 
  item.visible = !item.visible;
  item.rotate= !item.rotate;
}


updateAcknowledge(items)
{
  if(items.acknowledgeValue == null || items.acknowledgeValue == undefined || items.acknowledgeValue == 0)
  {
    this.toast.error("Acknowledge Qty cannot be empty or 0")
  }
  else{
    if(parseInt(items.TotalAcknowledgeQuantity) + parseInt(items.acknowledgeValue) >parseInt(items.quantityDelivered))
    {
      this.toast.error("All the parts has been already acknowledged");
      this.isdisabled = true;

    }
    else
    {
      items.AcknowledgeRows.push({
        "Code":items.number,
        "Description":items.description,
        "SerialNo":"",
        "AcknowledgeQuantity":items.acknowledgeValue,
        "RowId": uuidv4(),
        "PreviousAcknowldgeFlag":0
      })
      items.TotalAcknowledgeQuantity  = parseInt(items.TotalAcknowledgeQuantity) + parseInt(items.acknowledgeValue) ;
    }
  }
  
  
}


}
