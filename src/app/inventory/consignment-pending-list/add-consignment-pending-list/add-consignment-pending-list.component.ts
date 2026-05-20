import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ACTIONENUM } from 'src/app/config/comman.const';
import * as glob from 'src/app/config/global'
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';


@Component({
  selector: 'app-add-consignment-pending-list',
  templateUrl: './add-consignment-pending-list.component.html',
  styleUrls: ['./add-consignment-pending-list.component.css']
})
export class AddConsignmentPendingListComponent implements OnInit {

  
    constructor(
      private route: Router,
      private gsxService: GsxService,
      private dropdownDataService: DropdownDataService,
      private ngxSpinnerService: NgxSpinnerService,
      private toast: ToastrService,
      private dynamicService: DynamicService,
  
    ) {
  
    }
  
    LocationForJob: DropDownValue = DropDownValue.getBlankObject();
    SelectedLocation: any[] = []
    Ship_to_GSX: string;
    pendingAcknowlegdeList: any[] = [];
    NotFoundLocations: any[] = [];
    IsAllLocationSelected: boolean = false;
    NotFoundLocationsString: any;
    isShowSaveButton: boolean = false;
  
    ngOnInit(): void {
      this.onLocationSearch({ term: "", item: [] });
    }
  
     
    
    goBack(){
   this.route.navigate(['auth/' + glob.getCompanyCode() + '/consignment-pending-list'])
    }
    selectAllLocation() {
      if (this.IsAllLocationSelected) {
        this.pendingAcknowlegdeList = [];
        this.SelectedLocation = [];
        this.toast.success("All location selected")
        this.SelectedLocation = this.LocationForJob.Data.map(location => location.Id);
        console.log('inside selectAllLocation', this.SelectedLocation)
  
        this.getPendingAcknowledgeMent('')
      }
      else {
        this.SelectedLocation = [];
        console.log(this.SelectedLocation)
        this.pendingAcknowlegdeList = [];
        this.isShowSaveButton = false
      }
  
    }
 
  
    async getPendingAcknowledgeMent($event) {
      
      this.pendingAcknowlegdeList = [];
      this.isShowSaveButton = false
      this.NotFoundLocations = [];
      this.NotFoundLocationsString = "";
      this.ngxSpinnerService.show();
      console.log('selected location ', this.SelectedLocation);
  
      const requests = this.SelectedLocation.map(async (loc) => {
        const shipToGsx = this.LocationForJob.Data.find(item => item.Id === loc)?.extraDataJson.Data.SHIP_TO_GSX[0];
        const objData = { deliveryStatusGroupCode: "OPEN", shipTo: shipToGsx };
        const strRequestData = JSON.stringify(objData);
        const data = { Content: strRequestData };
  
        try {
          const value = await lastValueFrom(this.gsxService.getConsignmentDeliveryLookup(data));
          const response = JSON.parse(value.toString());
  
          if (response.errors) {
            this.NotFoundLocationsString = this.NotFoundLocationsString + loc + ',';
            this.NotFoundLocations.push(loc);
            // response.errors.forEach(error => {
            //   const errorMessage = `${error.code} - ${error.message}`;
            //   this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true });
            // });
          } else {
            let result: any[] = response;
            result.forEach(item => {
              item.Ship_to_GSX = shipToGsx
              item.LocationCode = loc
            }
            );
  
            this.pendingAcknowlegdeList = [
              ...this.pendingAcknowlegdeList,
              ...result
            ].filter((item, index, self) =>
              index === self.findIndex(t =>
                t.deliveryNumber === item.deliveryNumber &&
                t.Ship_to_GSX === item.Ship_to_GSX
              )
            );
          }
        } catch (err) {
          console.log(err);
          this.toast.error("Please try again. " + err);
        }
      });
  
      await Promise.all(requests);
      
  
      if (this.NotFoundLocationsString.length > 0) {
        this.toast.error(this.NotFoundLocationsString, "Not found for the location/s", { closeButton: true, disableTimeOut: true });
      }
  
      this.isShowSaveButton = this.pendingAcknowlegdeList.length > 0 ? true : false
  this.ngxSpinnerService.hide();
    }
  
  
    onLocationSearch($event: { term: string; item: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
      }).subscribe({
        next: (value) => {
          if (value != null) {
            this.Ship_to_GSX = value.Data[0].extraDataJson.Data.SHIP_TO_GSX[0]
  
            this.LocationForJob = value;
            console.log('this.LocationForJob', this.LocationForJob);
          }
        },
        error: (err) => {
          this.LocationForJob = DropDownValue.getBlankObject();
        }
      });
    }
  
    // Saving Data to the DataBase
  
    saveConsignmentList() {
  
      this.ngxSpinnerService.show()
      
      let requestData = [];
         
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveConsignmentPendingList"
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "ConsignmentHeaderData",
        "Value": this.pendingAcknowlegdeListIntoXML()
      });
  
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      console.log('contentRequest' , contentRequest);
      const alertResponse = confirm('Are you Sure to Continue ?');
      if (!alertResponse) {
        return
      }
       
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            this.ngxSpinnerService.hide()
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == '0') {

              this.toast.success("Saved Successfully");
               this.route.navigate(['auth/' + glob.getCompanyCode() + '/consignment-pending-list'])
            }
            else {
              this.toast.error("Error While Saving !")
            }
          },
          error: err => {
  
            this.ngxSpinnerService.hide();
            console.log("Error Message:- ", err)
            this.toast.error("Error While Saving !", err)
  
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
  
          }
        });
  
    }
  
  
  
  
    pendingAcknowlegdeListIntoXML() {
      let rawData = {
        "rows": {
          "row": this.pendingAcknowlegdeList.map(item => ({
            "ConsignmentPendingHeaderGUID": uuidv4(),
            "DeliveryCode": item.deliveryNumber,
            "DeliveryDate": item.deliveredDate,
            "StatusCode": item.statusCode,
            "StatusDescription": item.statusDescription,
            "Ship_to_GSX": item.Ship_to_GSX,
            "LocationCode": item.LocationCode,
            "IsLocked": 0
          }))
        }
      };
  
      const builder = new xml2js.Builder({
        headless: true,
        renderOpts: { pretty: false }
      });
      let xml = builder.buildObject(rawData);
      xml = xml.replace(/<\/row>/g, '</row>\n');
      console.log("Part XML:- ", xml);
      return xml;
    }

}
