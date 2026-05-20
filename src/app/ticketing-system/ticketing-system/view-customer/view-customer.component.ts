import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from "src/app/config/global";

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.css']
})
export class ViewCustomerComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: Router,
    private toaster: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
  ) { }

  customerObject: any[] = [];
  locationObject: any[] = [];
  techObject: any[] = [];
  activeTab: 'customer' | 'location' = 'customer';

  ngOnInit(): void {
    this.getCustomerData();
    this.getData();
  }

  close() {
    this.dialogRef.close();
  }

  getCustomerData() {
    if (this.data?.data.CustomerCode == null || this.data?.data.CustomerCode == '')
      return;
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "GetRtlCustomerObject",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CustomerCode",
      Value: this.data?.data.CustomerCode,
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == "0") {
          this.customerObject.push(JSON.parse(response.ExtraData)?.Customer);
        } else {
          console.log("error");
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getData() {
    if (this.data?.data.LocationCode == null || this.data?.data.LocationCode == '')
      return;
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetLocationObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.data.data?.LocationCode
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.locationObject.push(JSON.parse(response.ExtraData)?.Location);
            console.log(this.locationObject)
          }
          else {
            console.log("error");
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }


}
