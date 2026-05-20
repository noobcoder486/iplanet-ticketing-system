import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { Filter } from "ng2-smart-table";
import { Columns } from "src/app/models/column.metadata";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { PaginationMetaData } from "src/app/models/pagination.metadata";
import * as glob from "src/app/config/global";
import { ACTIONENUM } from "src/app/config/comman.const";

@Component({
  selector: "app-profile-master",
  templateUrl: "./profile-master.component.html",
  styleUrls: ["./profile-master.component.sass"],
})
export class ProfileMasterComponent implements OnInit {
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;

  ProfileName: any = "";
  ProfileId: any;
  ProfileDescription: any = "";

  columns: Columns[] = [
    { datatype: "STRING", field: "ProfileId", title: "Profile Id" },
    { datatype: "STRING", field: "ProfileName", title: "Profile Name" },
    {
      datatype: "STRING",
      field: "ProfileDescription",
      title: "Profile Description",
    },
  ];

  toolBarAction: any[] = [];
  breadCumbList: any[];
  actionDetails: any[] = [{ code: "EDIT", icon: "edit", title: "Edit" }];

  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  isChoose: boolean = false;
  editNumRangeForm: FormGroup;
  jobPagination: PaginationMetaData;

  constructor(
    private dynamicService: DynamicService,
    private ngxservice: NgxSpinnerService,
    private route: Router
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({
      code: "ADD",
      icon: "add_circle_outline",
      title: "Add",
    });
  }

  ngOnInit(): void {
    this.GetProfile("", "");
  }

  add() {
    this.route.navigate([
      "/auth/" + glob.getCompanyCode() + "/add-profile-master",
    ]);
  }
  actionEvent = (act: any) => {
    switch (act.code) {
      case ACTIONENUM.ADD:
        this.add();
        break;
    }
  };

  actionEmit(event) {
    if (event.action == "EDIT") {
      this.route.navigate(
        ["/auth/" + glob.getCompanyCode() + "/add-profile-master"],
        {
          queryParams: {
            cc: event.row.ProfileName,
            nc: event.row.ProfileDescription,
          },
        }
      );
    }
  }



  search() {
    this.GetProfile(this.ProfileName, this.ProfileDescription);
  }

  GetProfile(ProfileName, ProfileDescription) {
    let requestData = [];
    requestData.push({
      key: "APIType",
      Value: "GetProfileList",
    });
    requestData.push({
      key: "ProfileName",
      Value: ProfileName == null || ProfileName == undefined ? "" : ProfileName,
    });
    requestData.push({
      key: "ProfileDescription",
      Value:
        ProfileDescription == null || ProfileDescription == undefined
          ? ""
          : ProfileDescription,
    });
    requestData.push({
      Key: "PageNo",
      Value: "1",
    });
    requestData.push({
      Key: "PageSize",
      Value: "10",
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response?.ExtraData);
            let results = [];
            if (Array.isArray(data?.ProfileList?.ProfileRow)) {
              results = data?.ProfileList?.ProfileRow;
            } else {
              results.push(data?.ProfileList?.ProfileRow);
            }
            this.detail.next({
              totalRecord: data?.Totalrecords,
              Data: results,
            });
            this.ngxservice.hide();
          }
        } catch (ext) {
          console.log(ext);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        let requestData = [];

        requestData.push({
          key: "APIType",
          Value: "GetProfileList",
        });
        requestData.push({
          Key: "PageNo",
          Value: event.eventDetail.pageIndex + 1,
        });
        requestData.push({
          Key: "PageSize",
          Value: event.eventDetail.pageSize,
        });

        let strRequestData = JSON.stringify(requestData);
        let contentRequest = {
          content: strRequestData,
        };
        this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
          next: (Value) => {
            try {
              let response = JSON.parse(Value.toString());
              if (response.ReturnCode == "0") {
                let data = JSON.parse(response?.ExtraData);
                this.detail.next({
                  totalRecord: data?.Totalrecords,
                  Data: data?.ProfileList?.ProfileRow,
                });
              }
            } catch (ext) {
              console.log(ext);
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
        break;
    }
    setTimeout(() => {
      this.hideSpinnerEvent.next();
    }, 1);
  }
}
