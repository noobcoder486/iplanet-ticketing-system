import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as glob from "../../config/global";

@Component({
  selector: 'app-order-summary-list',
  templateUrl: './order-summary-list.component.html',
  styleUrls: ['./order-summary-list.component.css']
})
export class OrderSummaryListComponent implements OnInit {

  ShipTo: any;
  orderStatusEvent: any
  typeSelected = 'ball-clip-rotate';
  partList: any[] =[]
  locationCode: string;
  finalPartList: any[] = []
  Ship_to_GSX = ''
  orderStatus:any=['OPEN' , 'CLOSED' , 'CANCEL']
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private toast: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode:  glob.getCompanyCode().toString(),
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

  getOrderSummaryData() {
    console.log(this.ShipTo)
     
    this.ngxSpinnerService.show()
    var objData = {
      
      "shipTo": this.Ship_to_GSX
    }
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
                this.toast.error(errorMessage,"Error",{closeButton:true,disableTimeOut:true})
            }
          }
          else
          {
   
            this.finalPartList = this.partList =this.sortArrayOfObjects(response,"selected","ascending");
            console.log(this.partList,"this.partList")
          }
        },
        error:(err) => {
          console.log(err);
          this.toast.error("Please try again. "+ err)
          this.ngxSpinnerService.hide()
  
        }
      });
    }

    sortArrayOfObjects = <T>(
      data: T[],
      keyToSort: keyof T,
      direction: 'ascending' | 'descending' | 'none',
    ) => {
      if (direction === 'none') {
        return data
      }
      const compare = (objectA: T, objectB: T) => {
        const valueA = objectA[keyToSort]
        const valueB = objectB[keyToSort]
        
        if (valueA === valueB) {
          
          return 0
        }
    
        if (valueA > valueB) {
          return direction === 'ascending' ? 1 : -1
        } else {
          return direction === 'ascending' ? -1 : 1
        }
      }
    
      return data.slice().sort(compare)
    }

    onOrderStatusList() {
      this.finalPartList = []
     if(this.orderStatusEvent != null || this.orderStatusEvent != undefined){
      this.finalPartList = this.partList.filter((obj) => {
        return obj.statusCode === this.orderStatusEvent;
      });
     }else{
      this.getOrderSummaryData()
     }
    }

    openOrder(item){
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/stock-order'], { queryParams: { orderId: item.orderId , locationCode: this.ShipTo } });
    }

    newStockOrderGenerate(){
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/stock-order']);
    }
}
