import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService,DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'


@Component({
  selector: 'app-consignment-order',
  templateUrl: './consignment-order-list.component.html',
  styleUrls: ['./consignment-order-list.component.css']
})
export class ConsignmentOrderListComponent implements OnInit {

  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,
    private gsxService: GsxService ,
    private toast: ToastrService,

  ) { }
  Ship_to_GSX: string;
  LocationData: string;
  typeSelected = 'ball-clip-rotate';
  selectedCallForm:string;
  consignmentOrderList: any[] =  [];
  orderStatusGroupCode: any[] = ["ALL","OPEN","CLOSED"];
  typeCode: any[] = ["INCREASE","DECREASE"]
  typeCodeData:string;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();
  orderStatusGroupCodeData:string;

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
      JobType: this.selectedCallForm
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

  getConsignmentOrder()
  {
    this.ngxSpinnerService.show()
    /*var objData = {
        "typeCode": this.typeCodeData,
        "orderStatusGroupCode":this.orderStatusGroupCodeData,
        "shipTo":this.Ship_to_GSX
        }*/
      /*var objData = {
        "filter": [
          {
            "operatorKey": "equals",
            "columnKey": "poNumber",
            "value": [
              "RLSD"
            ]
          }
        ], repairTypeCode
        "moduleName": "Repairs"
      }*/
      var objData ={
        "filter": [
          {
            "operatorKey": "equals",
            "columnKey": "repairTypeCode",
            "value": [
              "CIN"
            ]
          },
          {
            "operatorKey": "equals",
            "columnKey": "unReceivedModules",
            "value": [
              "Y"
            ]
          },
          {
            "operatorKey": "equals",
            "columnKey": "isPartShipped",
            "value": [
              "Y"
            ]
          }
        ],
        "provideInputParameter": true,
        "moduleName": "Repairs"
        
      }
    var strRequestData = JSON.stringify(objData);
    var data = {
      "Content":strRequestData
    };
    //this.gsxService.getConsignmentOrderLookup(data).subscribe({
      this.gsxService.gsxSearch(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
         ;
        
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.errors.length ; iCtr++)
          {
              errorMessage =  response.errors[iCtr].code + ' - ' + response.errors[iCtr].message ;
              this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
        }
        else{
          this.toast.success("Records Found Successfully")
          
          this.consignmentOrderList = response; 
        }
      },
      error:(err) => {
        console.log(err);
        this.toast.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()
      }
    });
  }

  validationCheck()
  {
    if(this.orderStatusGroupCodeData == null || this.orderStatusGroupCodeData == undefined)
    {
      this.toast.error("Please select Order Status")
    }
    else if(this.LocationData == null || this.LocationData == undefined)
    {
      this.toast.error("Please select Location")
    }
    else if(this.typeCodeData == null || this.typeCodeData == undefined){
      this.toast.error("Please select typecode")
    }
    else{
      this.getConsignmentOrder()
    }
  }

}
