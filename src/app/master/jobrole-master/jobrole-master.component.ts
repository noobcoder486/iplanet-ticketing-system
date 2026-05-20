import { Component, OnInit } from "@angular/core";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { BehaviorSubject } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";
import { FormGroup } from "@angular/forms";
import { Columns } from "src/app/models/column.metadata";
import { PaginationMetaData } from "src/app/models/pagination.metadata";
import { ACTIONENUM } from "src/app/config/comman.const";
import { Input } from "@angular/core";
import { Observable } from "rxjs";
import { Filter } from "src/app/custom-components/call-login-dashboard/filter.meta";
import { Router } from "@angular/router";
import * as glob from "src/app/config/global";
import { DatePipe } from "@angular/common";


@Component({
  selector: "app-jobrole-master",
  templateUrl: "./jobrole-master.component.html",
  styleUrls: ["./jobrole-master.component.sass"],
})
export class JobroleMasterComponent implements OnInit {
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() filters: Observable<Filter[]>;

  JobRoleId: any;
  JobRoleName: any = "";
  JobRoleDescription: any;
  columns: Columns[] = [
    { datatype: "STRING", field: "JobRoleId", title: "JobRole Id" },
    { datatype: "STRING", field: "JobRoleName", title: "JobRole Name" },
    { datatype: "STRING", field: "JobRoleDescription", title: "JobRole Description",},
    { datatype: "STRING", field: "ProfileId", title: "Profile Id" },
    { datatype: "STRING", field: "StartTime", title: "Start Time"},
    { datatype: "STRING", field: "EndTime", title: "End Time" }
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
    private route: Router,
    private datePipe: DatePipe
  ) {
    this.jobPagination = new PaginationMetaData();
    this.toolBarAction.push({
      code: "ADD",
      icon: "add_circle_outline",
      title: "Add",
    });
  }

  ngOnInit(): void {
    this.GetJobRoleId("", "");
  }

  add() {
    this.route.navigate([
      "/auth/" + glob.getCompanyCode() + "/add-jobrole-master",
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
        ["/auth/" + glob.getCompanyCode() + "/add-jobrole-master"],
        {
          queryParams: {
            cc: event.row.JobRoleName,
            nc: event.row.JobRoleDescription,
          },
        }
      );
    }
  }

  search() {
    this.GetJobRoleId(this.JobRoleName, this.JobRoleDescription);
  }

  // convertTo12HourFormat(time: string): string {
  //   if (!time) return '';
  //   let [hours, minutes] = time.split(':');
  //   let period = +hours >= 12 ? 'PM' : 'AM';
  //   hours = (+hours % 12 || 12).toString().padStart(2, '0');
  //   return `${hours}:${minutes} ${period}`;
  // }
  

  GetJobRoleId(JobRoleName, JobRoleDescription) {
    let requestData = [];
    requestData.push({
      key: "APIType",
      Value: "GetJobRoleIdList",
    });
    requestData.push({
      key: "JobRoleName",
      Value: JobRoleName == null || JobRoleName == undefined ? "" : JobRoleName,
    });
    requestData.push({
      key: "JobRoleDescription",
      Value:
        JobRoleDescription == null || JobRoleDescription == undefined
          ? ""
          : JobRoleDescription,
    });
    requestData.push({
      Key: "PageNo",
      Value: "1",
    });
    requestData.push({
      Key: "PageSize",
      Value: "10",
    });
    console.log("DataJOBROLEID****", requestData);
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
            if (Array.isArray(data?.JobRoleSetup?.JobRoleList)) {
              results = data?.JobRoleSetup?.JobRoleList;
            } else {
              results.push(data?.JobRoleSetup?.JobRoleList);
            }

            // Convert StartTime and EndTime to 12-hour format
            results = results.map((jobRole) => ({
              ...jobRole,
              StartTime: jobRole.StartTime ? this.datePipe.transform(`1970-01-01T${jobRole.StartTime}`, 'hh:mm a') : '',
              EndTime: jobRole.EndTime ? this.datePipe.transform(`1970-01-01T${jobRole.EndTime}`, 'hh:mm a') : ''
            }));
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
          Value: "GetJobRoleIdList",
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
                  Data: data?.JobRoleSetup?.JobRoleList,
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
