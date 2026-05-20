import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'


@Component({
  selector: 'app-pending-acknowledge',
  templateUrl: './pending-acknowledge.component.html',
  styleUrls: ['./pending-acknowledge.component.css']
})
export class PendingAcknowledgeComponent implements OnInit {

  typeSelected = 'ball-clip-rotate';
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

  breadCumbList: any[];
  toolBarAction: any[] = [];
  Ship_to_GSX: string;
  selectedCallForm:string;
  pendingAcknowlegdeList: any[]= [];

  constructor(
    private route: Router,
    private gsxService: GsxService ,
    private dropdownDataService: DropdownDataService,
    private ngxSpinnerService: NgxSpinnerService,
    private toast: ToastrService,
  ) {
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add(){
    this.route.navigate(['/consignment-delivery/']);
  }

  getPendingAcknowledgeMent()
  {
    this.ngxSpinnerService.show()
    var objData = {"deliveryStatusGroupCode": "OPEN","shipTo":this.Ship_to_GSX}
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
          this.toast.success("Records Found Successfully")
          this.pendingAcknowlegdeList = response;   
        }
      },
      error:(err) => {
        console.log(err);
        this.toast.error("Please try again. "+ err)
        this.ngxSpinnerService.hide()
      }
    });
  }

  onClick(item)
  {
    
    this.route.navigate(['/auth/'+glob.getCompanyCode()+'/consignment-delivery'], {queryParams: {deliveryno:item.deliveryNumber,shipto:this.Ship_to_GSX}})
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

}
