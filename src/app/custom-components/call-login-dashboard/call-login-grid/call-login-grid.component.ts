import { Component, Input, OnInit } from '@angular/core';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import * as glob from "../../../config/global";
import { Filter } from '../filter.meta';
import { DropDownType } from '../../call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-call-login-grid',
  templateUrl: './call-login-grid.component.html',
  styleUrls: ['./call-login-grid.component.css']
})

export class CallLoginGridComponent implements OnInit {
  [x: string]: any;
  caseid = "";
  firstname = "";
  phonenumber = "";
  Emailid = "";
  Serialno = "";
  callType: any;
  JobStatustype: any;
  JobStatusTitle: any;
  jobPagination: PaginationMetaData;
  JobList: any[];
  JobColumns: Columns[] = [];
  actionDetails: any[] = [];
  @Input() filters: Observable<Filter[]>;
  callForm: DropDownValue = DropDownValue.getBlankObject();
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  JobStatus: DropDownValue = DropDownValue.getBlankObject();
  JobDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  gsxCode: string = ''
  hideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  toolBarAction: any[] = [];
  breadCumbList: any[];
  typeSelected = "ball-clip-rotate";
  jobListHideSpinnerEvent: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  createdDates: any[] = [];

  constructor(
    private dynamicService: DynamicService,
    private router: Router,
    private toaster: ToastrService,
    private ngxservice: NgxSpinnerService,
    private dropdownDataService: DropdownDataService
  ) {
    this.pagination = new PaginationMetaData();
    this.jobPagination = new PaginationMetaData();

  }

  ngOnInit(): void {
    this.userName = glob.getLogedInUser().UserDetails.UserName.toString();
    this.userName = this.userName.toLowerCase()
    this.injobTable();
    this.filters.subscribe({
      next: (value) => {
        this.filterList = value;
        for (let filter of this.filterList) {
          if (filter.title == "Walk-In" || filter.title == "Pick-up" || filter.title == "Service Non-Repair") {
            this.callType = filter.value
          }
          else {
            this.JobStatustype = filter.value;
          }
        }
        this.getJobDetail(this.caseid, this.firstname, this.phonenumber, this.Emailid, this.Serialno, this.callType, this.JobStatustype, this.gsxCode, 1, 10);

      },
      error: (error) => {
        console.log(error)
      }
    });
    this.onJobType({ term: "", item: null });
    this.onJobStatus({ term: "", item: null })
    this.checkLocalPermission()
  }



  injobTable() {  
         
    // if(this.checkLocalPermission()  &&  this .JobStatustype == 'GSX01'){
    //   this.actionDetails.push({ code: 'AssignToMe', icon: 'build_circle' ,title : "Assign to Me" });
    //    }

  if ( this.userName == 'parthasarathys@consolidated.one' || this.userName == 'sarathnesh@consolidated.one' ){
    this.actionDetails.push({ code: 'Repair', icon: 'build_circle' });
    this.actionDetails.push({ code: 'ResetView', icon: 'refresh', title : "Reset View" });
  }
  else{
    this.actionDetails.push({ code: 'Repair', icon: 'build_circle'  });
    

  }

    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Case Id", "CaseId"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Repair CreatedDate", "RepairCreatedDate"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "First Name", "FirstName"));
    if (this.checkLocalPermission()) {
      this.JobColumns.push(this.dynamicService.getColumn("STRING", "Repair Time", "RepairTime"));
    }
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Mobile No", "MobileNo"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Email Id", "EmailId"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Technician Name", "AssignedTechCode"));

    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Approver Name", "ApprovedBy"));
    
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Serial No", "SerialNo1"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Material Desc", "productDescription"));;
    this.JobColumns.push(this.dynamicService.getColumn("DATE", "Case Id Date", "CreatedDate"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Remark", "Remark"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Fault Description", "ComplainDesc"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Status", "JobStatus"));
    this.JobColumns.push(this.dynamicService.getColumn("STRING", "Job Type", "JobType"));
  }



  SearchCallLogin() {
    this.getJobDetail(this.caseid, this.firstname, this.phonenumber, this.Emailid, this.Serialno, this.callType, this.JobStatustype, this.gsxCode, 1, 10);

  }

  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("Permissions ", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14); // 14 is Local Approver
    console.log("Data Local Approver Permissions ", resp)
    if (resp?.View == true) {
      this.isApproverPermission = true;
    }
    return resp != undefined && resp?.View ? true : false;
  }

 // Function to calculate repair time 
 calculateRepairTime(repairDateTime: string, GSX_LocalApprovalDatetime: string): string {
  const repairDate = new Date(repairDateTime); // Convert repair date string to Date object

  let timeDifference;
  if (!GSX_LocalApprovalDatetime) {
    const currentDate = new Date(); // Get the current date
    timeDifference = currentDate.getTime() - repairDate.getTime();     // Calculate the difference in milliseconds

  } else {
    const LocalApprovalDatetime = new Date(GSX_LocalApprovalDatetime)
    timeDifference = LocalApprovalDatetime.getTime() - repairDate.getTime();     // Calculate the difference in milliseconds

  }

  // Convert the difference to seconds
  const totalSeconds = Math.floor(timeDifference / 1000);

  // Calculate days, hours, and minutes
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days}d ${this.Number(hours)}h ${this.Number(minutes)}m`;
}



  // Function to add zero before h/m (05,09) 
  Number(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
  getJobDetail(caseid, firstname, phonenumber, Emailid, Serialno, callType, JobStatustype, gsxcode, pageno, pagesize) {
      
    if(this.JobStatustype ==  "GX01" && this.checkLocalPermission())
    {
      
        this.actionDetails.push({ code: 'AssignToMe', icon: 'build_circle' ,title : "Assign to Me" });
         
    }


    if(JobStatustype == 'S19'){
        this.router.navigate(['/auth/' + glob.getCompanyCode() + '//tradein-list']);
    }
    
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "GetJobDetails"
    });
    requestData.push({
      "Key": "CaseId",
      "Value": caseid
    });
    requestData.push({
      "Key": "SerialNo",
      "Value": Serialno
    });
    requestData.push({
      "Key": "FirstName",
      "Value": firstname
    });
    requestData.push({
      "Key": "MobileNo",
      "Value": phonenumber
    });
    requestData.push({
      "Key": "EmailId",
      "Value": this.Emailid
    });
    requestData.push({
      "Key": "GID",
      "Value": gsxcode
    });

    requestData.push({
      "Key": "JobStatus",
      "Value": JobStatustype
    });
    requestData.push({
      "Key": "JobType",
      "Value": callType
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "PageNo",
      "Value": pageno
    });
    requestData.push({
      "Key": "PageSize",
      "Value": pagesize
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.ngxservice.show()
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.ngxservice.hide()
          try {
            let response = JSON.parse(Value.toString());
            
            if (response.ReturnCode == '0') {
              response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
              let jobListData = response['ExtraDataJSON']['JobList']['JobData']
              var JobFindData: any = [];
              this.toaster.success("RECORD FOUND IN" + " " + JobStatustype)
              if (Array.isArray(jobListData)) {

                JobFindData = jobListData.map(job => {
                  if (!job.GSX_LocalApprovalRequestDatetime || isNaN(new Date(job.GSX_LocalApprovalRequestDatetime).getTime())) {
                    job.RepairTime = 'N/A';
                  } else {
                    job.RepairTime = this.calculateRepairTime(job.GSX_LocalApprovalRequestDatetime, job.GSX_LocalApprovalDatetime);
                  }
                  return job;
                });
              } else {

                if (!jobListData.GSX_LocalApprovalRequestDatetime || isNaN(new Date(jobListData.GSX_LocalApprovalRequestDatetime).getTime())) {
                  jobListData.RepairTime = 'N/A';
                } else {
                  jobListData.RepairTime = this.calculateRepairTime(jobListData.GSX_LocalApprovalRequestDatetime, jobListData.GSX_LocalApprovalDatetime);
                }

                JobFindData.push(jobListData);
              }

              this.JobDetail.next({ totalRecord: response['ExtraDataJSON']['Totalrecords'], Data: JobFindData });
            }
            else {
              this.toaster.error(response)
            }
          } catch (ext) {
            console.log(ext);
            this.JobList = [];
            this.toaster.warning("NO RECORD FOUND" + " " + JobStatustype)
            this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
          }
        },
        error: err => {
          this.ngxservice.hide()
          console.log(err);
          this.JobList = [];
          this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
        }
      });
  }

  // getJobDetail(caseid, firstname, phonenumber, Emailid, Serialno, callType, JobStatustype, gsxcode, pageno, pagesize) {
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "APIType",
  //     "Value": "GetJobDetails"
  //   });
  //   requestData.push({
  //     "Key": "CaseId",
  //     "Value": caseid
  //   });
  //   requestData.push({
  //     "Key": "SerialNo",
  //     "Value": Serialno
  //   });
  //   requestData.push({
  //     "Key": "FirstName",
  //     "Value": firstname
  //   });
  //   requestData.push({
  //     "Key": "MobileNo",
  //     "Value": phonenumber
  //   });
  //   requestData.push({
  //     "Key": "EmailId",
  //     "Value": this.Emailid
  //   });
  //   requestData.push({
  //     "Key": "GID",
  //     "Value": gsxcode
  //   });

  //   requestData.push({
  //     "Key": "JobStatus",
  //     "Value": JobStatustype
  //   });
  //   requestData.push({
  //     "Key": "JobType",
  //     "Value": callType
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "PageNo",
  //     "Value": pageno
  //   });
  //   requestData.push({
  //     "Key": "PageSize",
  //     "Value": pagesize
  //   });
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest =
  //   {
  //     "content": strRequestData
  //   };
  //   this.ngxservice.show()
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (Value) => {
  //         this.ngxservice.hide()
  //         try {
  //           let response = JSON.parse(Value.toString());
  //           
  //           if (response.ReturnCode == '0') {
  //             response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
  //             let jobListData = response['ExtraDataJSON']['JobList']['JobData']
  //             var JobFindData: any = [];

  //             //clear the array
  //             this.createdDates = [];

  //             this.toaster.success("RECORD FOUND IN" + " " + JobStatustype)
  //             if (Array.isArray(jobListData)) {
  //               // console.log("jobListData", jobListData)
  //               JobFindData = jobListData.map(job => {
  //                 job.RepairTime = this.calculateRepairTime(job.RepairCreatedDate);
  //                 return job;
  //               });
  //               // console.log("JobFindData", JobFindData)

  //             }
  //             else {
  //               jobListData.RepairTime = this.calculateRepairTime(jobListData.RepairCreatedDate)
  //               // console.log("JobFindData2", JobFindData)

  //               JobFindData.push(jobListData)
  //             }
  //             this.JobDetail.next({ totalRecord: response['ExtraDataJSON']['Totalrecords'], Data: JobFindData });
  //           }
  //           else {
  //             this.toaster.error(response)
  //           }
  //         } catch (ext) {
  //           console.log(ext);
  //           this.JobList = [];
  //           this.toaster.warning("NO RECORD FOUND" + " " + JobStatustype)
  //           this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
  //         }
  //       },
  //       error: err => {
  //         this.ngxservice.hide()
  //         console.log(err);
  //         this.JobList = [];
  //         this.JobDetail.next({ totalRecord: this.JobList.length, Data: this.JobList });
  //       }
  //     });
  // }



  onJobType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.callForm, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.callForm = value;
        }
      },
      error: (err) => {
        this.callForm = DropDownValue.getBlankObject();
      }

    });
  }

  onJobStatus($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.JobStatus, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.JobStatus = value;
        }
      },
      error: (err) => {
        this.JobStatus = DropDownValue.getBlankObject();
      }
    });
    
  }

  actionEmit(event) {
    switch (event.action) {
      case "ROWSELECT":
        break;
      case "Delete":
        break;
      case "Repair":
        this.router.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: event.row.CaseGUID } });
        break;
      case "ResetView":
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/cancellation-view'], { queryParams: { guid: event.row.CaseGUID } });
      break; 
      case "AssignToMe":
       
      this.router.navigate(['/auth/' + glob.getCompanyCode() + '/assign-to-me'],{ queryParams: { guid: event.row.CaseGUID , LocationCode : event.row.LocationCode  } });
      break; 

    }
  }


  loadPageData(event) {
    switch (event.eventType) {
      case "PageChange":
        this.jobPagination.PageNumber = event.eventDetail.pageIndex + 1;
        var pageno = event.eventDetail.pageIndex + 1;
        var pagesize = event.eventDetail.pageSize;
        this.getJobDetail(this.caseid, this.firstname, this.phonenumber, this.Emailid, this.Serialno, this.callType, this.JobStatustype, this.gsxCode, pageno, pagesize);
        break;
    }
    setTimeout(() => { this.jobListHideSpinnerEvent.next(); }, 500);
  }

  onAssignTechnician() {
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/assign-technician']);
  }

}
