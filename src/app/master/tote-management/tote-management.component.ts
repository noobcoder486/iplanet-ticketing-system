import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from 'src/app/config/global';
import { NgxSpinnerService } from 'ngx-spinner';
import { getCompanyCode } from 'src/app/config/global';
import { ActivatedRoute, Router } from '@angular/router';
import { Columns } from 'src/app/models/column.metadata';
import { BehaviorSubject } from 'rxjs';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';


@Component({
  selector: 'app-tote-management',
  templateUrl: './tote-management.component.html',
  styleUrls: ['./tote-management.component.css']
})
export class ToteManagementComponent implements OnInit {

  storeCode:any;
  receivedFrom:any;
  boxType: string = '';
  toteNo: string = '';
  dcNo: string = '';
  awbNo: string = '';
  receivedBy: string = '';
  pagination: PaginationMetaData;
  jobPagination: PaginationMetaData;
  isChoose: boolean = false;
  LocationForJob: DropDownValue = DropDownValue.getBlankObject();

  // columns: Columns[] = [
  //   { datatype: "STRING", field: "LocationCode", title: "Store Code" },
  //   { datatype: "STRING", field: "ToLocationCode", title: "Received From" },
  //   { datatype: "STRING", field: "ToteNo", title: "Tote No." },
  //   { datatype: "STRING", field: "BoxType", title: "Box Type" },
  //   { datatype: "STRING", field: "DCNo", title: "DC No." },
  //   { datatype: "STRING", field: "AWBNo", title: "AWB No." },
  //   { datatype: "STRING", field: "SealNo", title: "SealNo" },
  //   { datatype: "STRING", field: "BulkReturnType", title: "Type" },
  //   { datatype: "STRING", field: "ReceivedByPerson", title: "Received By" }
  // ];

  columns: Columns[] = [
    { datatype: "STRING", field: "LocationCode", title: "Store Code" },
    { datatype: "STRING", field: "BulkReturnType", title: "BulkReturnType" },
    { datatype: "STRING", field: "ToteNo", title: "Tote No." },
    { datatype: "STRING", field: "SealNo", title: "SealNo" },
    { datatype: "STRING", field: "DCNo", title: "DC No." },
    { datatype: "STRING", field: "AWBNo", title: "AWB No." },
    // { datatype: "STRING", field: "BoxType", title: "Box Type" },
    { datatype: "STRING", field: "BoxTypeDescription", title: "Box Type" },
    { datatype: "STRING", field: "ConsumedStatus", title: "Consumed Status" },
    { datatype: "DATE", field: "CreatedDate", title: " Created Date" },


  ];
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
     actionDetails: any[]=[
    {"code": "EDIT","icon": "edit","title": "Edit"},
    {"code": "DELETE","icon": "delete","title": "Delete"}
  ];
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  constructor(
    private toastrService: ToastrService,
    private dynamicService: DynamicService,
    private spinner: NgxSpinnerService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private ngxservice: NgxSpinnerService,
    private dropdownDataService: DropdownDataService,

  ) {
    this.pagination = new PaginationMetaData();
    this.jobPagination = new PaginationMetaData();

  }

  ngOnInit(): void {
    this.GetToteList('', '', '');
    this.onLocationSearch({ term: "", item: [] });

  }
 actionEmit(event) {
    
    if (event.action == 'EDIT') {
      if (event.row.IsConsumed == '1') {
        this.toastrService.error(`Tote Cannot be Edited/Deleted Once it is Consumed , ToteNo : ${event?.row?.ToteNo}`)
        return
      }
      this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-tote-management'], { queryParams: { ToteGuid: event.row.ToteGuid } })
    }

    if (event.action == 'DELETE') {
      console.log("Roew ", event.row)

      if (event.row.IsConsumed == '1') {
        this.toastrService.error(`Tote Cannot be Edited/Deleted Once it is Consumed ,ToteNo: ${event?.row?.ToteNo}`)
        return
      }
      const shouldContinue = confirm(`Are You Sure To Delete Tote : ${event?.row?.ToteNo}`)
      if (shouldContinue == false) {
        return
      }

      this.ToteUpdationDeletion(event.row)
    }
  }
 ToteUpdationDeletion(item) {
    
    this.spinner.show()


    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "ToteUpdationDeletion"
    });
    requestData.push({
      "Key": "ToteGuid",
      "Value": item.ToteGuid
    });
    requestData.push({
      "Key": "ToteNo",
      "Value": ""
    });
    requestData.push({
      "Key": "SealNo",
      "Value": ""
    });
    requestData.push({
      "Key": "BulkReturnType",
      "Value": ""
    });
    requestData.push({
      "Key": "BoxType",
      "Value": ""
    });
    requestData.push({
      "Key": "DCNo",
      "Value": ""
    });
    requestData.push({
      "Key": "AWBNo",
      "Value": ""
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": getCompanyCode()
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": ""
    });
    requestData.push({
      "Key": "Type",
      "Value": 'DELETION'
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          
          this.spinner.hide();
          console.log("Response:", value);
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.success('Deleted  Successfully !')
            this.route.navigate(['/auth/' + glob.getCompanyCode() + '/tote-management/']);
          }
          if (response.ReturnCode == '1') {
            let data = JSON.parse(response?.ExtraData);
            this.toastrService.success('Error While Deleting !')
          }
        },
        error: err => {
          this.spinner.hide();
          this.toastrService.error("Server error", "Error");
          console.error(err);
        }
      });

  }

  // Route to Add Tote Management Page
  AddTote() {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/add-tote-management/']);
  }

  onLocationSearch($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString(),
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationForJob = value;
          console.log('dropdown value', this.LocationForJob);
        }
      },
      error: (err) => {
        this.LocationForJob = DropDownValue.getBlankObject();
      }
    });
  }


  GetToteList(LocationCode, ToLocationCode, ToteNo) {
    
    this.ngxservice.show();
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetToteHeaderList"
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.storeCode == null || this.storeCode == undefined ? '' : this.storeCode
    });
    requestData.push({
      "Key": "ToLocationCode",
      "Value": this.receivedFrom == null || this.receivedFrom == undefined ? '' : this.receivedFrom
    });
    requestData.push({
      "Key": "ToteNo",
      "Value": this.toteNo == null || this.toteNo == undefined || this.toteNo.trim() == '' ? '' : this.toteNo
    });
    requestData.push({
      "Key": "BoxType",
      "Value": ''
    });
    requestData.push({
      "Key": "DCNo",
      "Value": ''
    });
    requestData.push({
      "Key": "AWBNo",
      "Value": ''
    });
    requestData.push({
      "Key": "ReceivedByPerson",
      "Value": ''
    });
    requestData.push({
      "Key": "PageNo",
      "Value": "1"
    });
    requestData.push({
      "Key": "PageSize",
      "Value": "10"
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("da", data)
              let results = []
              if (Array.isArray(data?.ToteList?.ToteList)) {
                results = data?.ToteList?.ToteList
              }
              else {
                results.push(data?.ToteList?.ToteList)
              }
              this.detail.next({ totalRecord: data?.Totalrecords, Data: results });
              this.ngxservice.hide()
            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }
  loadPageData(event) {
    
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        // this.jobPagination.pageSize = event.eventDetail.pageSize + 10;
        let requestData = [];

        requestData.push({
          "Key": "APIType",
          "Value": "GetToteHeaderList"
        });
        requestData.push({
          "Key": "LocationCode",
          "Value": this.storeCode == null || this.storeCode == undefined ? '' : this.storeCode
        });
        requestData.push({
          "Key": "ToLocationCode",
          "Value": this.receivedFrom == null || this.receivedFrom == undefined ? '' : this.receivedFrom
        });
        requestData.push({
          "Key": "ToteNo",
          "Value": this.toteNo == null || this.toteNo == undefined || this.toteNo.trim() == '' ? '' : this.toteNo
        });
        requestData.push({
          "Key": "BoxType",
          "Value": ''
        });
        requestData.push({
          "Key": "DCNo",
          "Value": ''
        });
        requestData.push({
          "Key": "AWBNo",
          "Value": ''
        });
        requestData.push({
          "Key": "ReceivedByPerson",
          "Value": ''
        });
        requestData.push({
          "Key": "PageNo",
          "Value": event.eventDetail.pageIndex + 1
        });
        requestData.push({
          "Key": "PageSize",
          "Value": event.eventDetail.pageSize 
        });

        let strRequestData = JSON.stringify(requestData);
        let contentRequest =
        {
          "content": strRequestData
        };
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
          {
            next: (Value) => {
              try {
                let response = JSON.parse(Value.toString());
                if (response.ReturnCode == '0') {
                  let data = JSON.parse(response?.ExtraData);
                  this.detail.next({ totalRecord: data?.Totalrecords, Data: data?.ToteList?.ToteList });
                }
              } catch (ext) {
                console.log(ext);
              }
            },
            error: err => {
              console.log(err);
            }
          }
        );
        break;
    }
    setTimeout(() => { this.hideSpinnerEvent.next(); }, 1);
  }

  search() {
    this.GetToteList(this.storeCode, this.receivedFrom, this.toteNo)
  }

}
