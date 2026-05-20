
import { Component, OnInit , Input , Output , EventEmitter } from '@angular/core';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { CaseDetail } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import * as glob from "../../../../config/global";
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-assign-to-me',
  templateUrl: './assign-to-me.component.html',
  styleUrls: ['./assign-to-me.component.sass']
})
export class AssignToMeComponent implements OnInit {
  remark : string;
  jobDetailsArray:any=[];
  jobDetailsObject :any
  userName: string = '';
  params:any
  Approvers :  DropDownValue = DropDownValue.getBlankObject();

   

  JobDetail: any;
  JobList: any[];
  Approver: any;
   
  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    
        this.userName = glob.getLogedInUser().UserDetails.UserName.toString();
        this.Approver = this.userName
       console.log( 'the logged in user : ',this.userName);
       this.params = this.activatedRoute.snapshot.queryParams;
    // this.onLocationSearch({ term: "", item: null }) 
    // this.onApproverSearch({ term: "", item: null })
    // this.getJobDetail()
    this.onApproverSearch({ term: "", item: null })

  }
      
  //  getJobDetail() {
  //   
  //     let requestData = [];
  //     requestData.push({
  //       "Key": "APIType",
  //       "Value": "GetJobDetails"
  //     });
  //     requestData.push({
  //       "Key": "CaseId",
  //       "Value": this.params.CaseId
  //     });
  //     requestData.push({
  //       "Key": "SerialNo",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "FirstName",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "MobileNo",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "EmailId",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "GID",
  //       "Value": ""
  //     });
  
  //     requestData.push({
  //       "Key": "JobStatus",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "JobType",
  //       "Value": ""
  //     });
  //     requestData.push({
  //       "Key": "CompanyCode",
  //       "Value": glob.getCompanyCode()
  //     });
  //     requestData.push({
  //       "Key": "PageNo",
  //       "Value": "1"
  //     });
  //     requestData.push({
  //       "Key": "PageSize",
  //       "Value": "10"
  //     });
  //     let strRequestData = JSON.stringify(requestData);
  //     let contentRequest =
  //     {
  //       "content": strRequestData
  //     };
    
  //     this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //       {
  //         next: (Value) => {
           
  //           try {
  //             let response = JSON.parse(Value.toString());
  //             
  //             if (response.ReturnCode == '0') {
  //               response['ExtraDataJSON'] = JSON.parse(response.ExtraData);
  //               let jobListData = response['ExtraDataJSON']['JobList']['JobData']
  //                this.jobDetailsObject = jobListData;
  //               console.log( jobListData.CaseGUID)
  //               var JobFindData: any = [];
  //                console.log('jobListData',jobListData);
  //               if (Array.isArray(jobListData)) {
  //                         this.jobDetailsArray = jobListData;
                         
  //               } else {
  //                 this.jobDetailsArray = [jobListData];
  //                 console.log( 'this.jobDetailsArray',this.jobDetailsArray);
                 
  //               }
  //             }
  //             else {
  //               this.toaster.error(response)
  //             }
  //           } 
  //           catch (ext) {
              
  //             this.JobList = [];
            
             
  //           }
  //         },
  //         error: err => {
           
  //           console.log(err);
            
            
  //         }
  //       });
  //       console.log(this.jobDetailsArray);
  //   }

     onSubmit() {
      
        let requestData = [];
        requestData.push({
          "Key": "APIType",
          "Value": "SaveAssignToMe"
        });
        requestData.push({
          "Key": "AssignToApproverGUID",
          "Value": uuidv4()
                   
        });
        requestData.push({
          "Key": "CaseGUID",
          "Value":  this.params.guid
        });
        requestData.push({
          "Key": "ApproverUserName",
          "Value": this.Approver
        });
        requestData.push({
          "Key": "LocationCode",
          "Value": this.params.LocationCode
        });
        requestData.push({
          "Key": "Remark",
          "Value": (this.remark == null ||   this.remark == undefined ) ? '' :  this.remark 
        })
        
             
          let strRequestData = JSON.stringify(requestData);
          console.log(strRequestData);
          let contentRequest =
          {
            "content": strRequestData
          };
          ;
          this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
            {
              next: (Value) => {
                
                try {
                  console.log(Value);
                  let response = JSON.parse(Value.toString());
                  ;
                  if (response.ReturnCode == '0') {
                    this.toaster.success('Submitted Succesfully')
                    // this.router.navigate(['/auth/' + glob.getCompanyCode() + '/dashboard']);
                    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid:  this.params.guid } });
                    
                  }
                  else {
                    // this.toaster.error('Failed To Save')
                    this.toaster.error(response.ReturnMessage);
                   
                  }
                } catch (ext) {
                  console.log(ext);
                }
      
              },
              error: err => {
                console.log(err);
                this.ngxSpinnerService.hide()
              }
              
            }
          );
      }

      

      onApproverSearch($event: { term: string; item: any[] }) {
       console.log(' this.params.LocationCode' ,   this.params.LocationCode)
        console.log($event.term);
        this.dropdownDataService.fetchDropDownData(DropDownType.BindApprover, $event.term, {
          LocationCode: this.params.LocationCode
        }).subscribe({
          next: (value) => {
            console.log("New A", value);
            if (value != null) {
              console.log("New B", value);
              this.Approvers = value;
            }
          },
          error: (err) => {
            this.Approvers = DropDownValue.getBlankObject();
          }
        });
      }

      Back(){
               this.router.navigate(['/auth/' + glob.getCompanyCode() + '/dashboard']);
      }

  
}
