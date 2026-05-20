import { Component, Input, OnInit } from '@angular/core';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';

import xml2js from "xml2js";
import { ACTIONENUM } from 'src/app/config/comman.const';

@Component({
  selector: "app-discount-kitty",
  templateUrl: "./discount-kitty.component.html",
  styleUrls: ["./discount-kitty.component.css"],
})
export class DiscountKittyComponent implements OnInit {
  constructor(
    private route: Router,
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({ code: "ADD", icon: "add_circle_outline", title: "Add" });
  }

  typeSelected = "ball-clip-rotate";
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  Location: DropDownValue = DropDownValue.getBlankObject();
  jobPagination: PaginationMetaData;
  toolBarAction: any[] = [];
  actionDetails: any[] = [
    { "code": "EDIT", "icon": "edit", "title": "Edit" }
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  LocationCode: string;
  ApproverName: string;
  results: any[] = [];
  LocationData = new Set<string>();

  columns: Columns[] = [
    { datatype: "STRING", field: "ApproverName", title: "Approver Name" },
    { datatype: "DATE", field: "ExpiryDate", title: "Expiry Date" },
    { datatype: "STRING", field: "TotalDiscount", title: "Total Discount" },
    { datatype: "STRING", field: "DiscountRemaining", title: "Discount Balance" },
    { datatype: "STRING", field: "DiscountPerInvoice", title: "Discount Per Invoice" },
    { datatype: "STRING", field: "DiscountSpent", title: "Discount Spent" },
  ];

  ngOnInit(): void {
    this.onLocationSearch({ term: "", item: [] });
    this.GetDiscountKitty('');
  }

  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  }

  add() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-discount-kitty']);
  }

  GetDiscountKitty(eventDetail) {
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetDiscountKittyList"
    });

    // requestData.push({
    //   "Key": "LocationCode",
    //   "Value": this.LocationCode == null || this.LocationCode == undefined ? '' : this.LocationCode
    // });
    requestData.push({
      "Key": "ApproverName",
      "Value": this.ApproverName == null || this.ApproverName == undefined ? '' : this.ApproverName
    });
    requestData.push({
      "Key": "PageNo",
      "Value": eventDetail.pageIndex == null || eventDetail.pageIndex == undefined ? "1" : eventDetail.pageIndex + 1
    });
    requestData.push({
      "Key": "PageSize",
      "Value": eventDetail.pageSize == null || eventDetail.pageSize == undefined ? "10" : eventDetail.pageSize
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.ngxservice.show();
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxservice.hide();
          this.results = [];
          try {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("After SP:- ", data);
              if (data?.Totalrecords < 1) {
                this.toast.info("No Record Found");
                this.results = [];
                return;
              } else {
                Array.isArray(data.DiscountKittyList.DiscountKitty) 
                ? this.results = data.DiscountKittyList.DiscountKitty
                : this.results = [data.DiscountKittyList.DiscountKitty]
                this.detail.next({ totalRecord: data?.Totalrecords, Data: this.results });
                console.log("Result:-", this.results)
              }
            }
          } catch (ext) {
            this.ngxservice.hide();
            console.log(ext);
          }
        },
        error: err => {
          this.ngxservice.hide();
          console.log(err);
        }
      }
    );
  }

  GetLocationDataXML() {
    let rawData = {
      rows: [],
    };
    for (let item of this.LocationData) {
      rawData.rows.push({
        row: {
          LocationCode: item,
        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    return xml;
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.Location, $event.term, {
        CompanyCode: glob.getCompanyCode().toString(),
      })
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.Location = value;
          }
        },
        error: (err) => {
          this.Location = DropDownValue.getBlankObject();
        },
      });
  }

  search(event) {
    if (this.ApproverName == null || this.ApproverName == undefined) {
      this.toast.error("Please Select a Location");
      return;
    }
    this.GetDiscountKitty('');
  }

  PageChange(event) {
    switch (event.eventType) {
      case "PageChange":
        this.GetDiscountKitty(event.eventDetail)
        // setTimeout(() => { this.hideSpinnerEvent.next()}, 500)
        break;
      case "Sorting":
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next() }, 500)
  }

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }

  actionEmit(event): void {
    console.log("action Emit", event);
    if (event.action === 'EDIT') {
      const companyCode = glob.getCompanyCode();
      this.route.navigate(
        ['/auth', companyCode, 'add-discount-kitty'],
        { queryParams: { guid: event.row.DiscountKittyGUID } }
      );
    }
  }

}
