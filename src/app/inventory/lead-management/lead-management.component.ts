import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-lead-management',
  templateUrl: './lead-management.component.html',
  styleUrls: ['./lead-management.component.css']
})
export class LeadManagementComponent implements OnInit {

  caseID: any;

  constructor(
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService,
    private ngxSpinnerService : NgxSpinnerService
  ) { }

  params: any;
  isEdit: boolean = false;
  formTitle: string ;
  errorMessage: String;
  LeadObject: any;
  LocationMobileNo: string 
  LeadDispositionDD: DropDownValue = DropDownValue.getBlankObject();
  
  ID: string | null = null;
  CreatedDate: Date | null = null;
  finalSelectedElements: any[] = [];

    // Remarks Part
    isRemarkUpload= false;
    RemarkLevel: number;
    RemarkUploadList: any[] = [] // Remark in request is object and in Approval is List
    ProcessTotalRecords: number =0;
    Spinner = false;

  LeadDisposition: string = '';
  Remarks: string = '';

  ngOnInit(): void {
    this.onLeadDisposition({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.leadguid != null || this.params.leadguid != undefined) {
      this.getData();
      
    }
  }

  controlValidations() {
    
    if (this.LeadDisposition == null || this.LeadDisposition == undefined || this.LeadDisposition == '') {
      this.toastMessage.error("Select a Disposition first!")
      return false;
    }
    if (this.Remarks == null || this.Remarks == undefined || this.Remarks == '') {
      this.toastMessage.error("Remarks can't be empty!")
      return false;
    }
    return true;
  }

  getData() {
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetLeadManagementObject"
    });
    requestData.push({
      "Key": "LeadManagementGUID",
      "Value": this.params.leadguid
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          
          let data = JSON.parse(response.ExtraData);
          if (data.Totalrecords != '0') {
            
            console.log('Leads Return Object', data);
            this.LeadObject = data.LeadManagement  
            this.LeadDisposition = data?.LeadDisposition 
            this.Remarks = data?.Remark
            this.LocationMobileNo = this.LeadObject?.CasaLocation?.MobileNo
            if (!this.LocationMobileNo || this.LocationMobileNo == '' )
              this.toastMessage.warning("No Mobile No for Location found!")
            this.LeadObject.LeadStatus  == 'CLOSED' ? this.isEdit = false :  this.isEdit = true
            }
            else {
              this.toastMessage.error("No records found")
            }
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

  returnPrevious() {
    this.route.navigateByUrl('/auth/' + glob.getCompanyCode() + '/leads-management-list');
  }

  onClose() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateLeadManagement"
    });
    requestData.push({
      "Key": "LeadManagementGUID",
      "Value": this.params.leadguid
    });
    requestData.push({
      "Key": "LeadStatus",
      "Value": 'CLOSED'
    });
    requestData.push({
      "Key": "LeadDisposition",
      "Value": this.LeadDisposition
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.Remarks
    });
    

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.toastMessage.success("Form Submitted Successfully");
          this.route.navigate(['/auth/'+glob.getCompanyCode()+'/lead-management-list'])

        } else {
          this.errorMessage = response.ReturnMessage;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            response['errorMessageJson'] = result;
            this.handleError(response);
          });
        }
      },
      error: err => {
       console.log("Error ", err)
      }
    });
  }
  onLeadDisposition($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.LeadDisposition, $event.term, {
      
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LeadDispositionDD = value;
        }
      },
      error: (err) => {
        this.LeadDispositionDD = DropDownValue.getBlankObject();
      }
    });
  }

  getErrorMessage(control: string): string {
    return "";
  }

  handleError(response: any) {
    let error = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(error);
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onCall() {
         
      var obj = {
        LocationMobileNo : this.LocationMobileNo, 
        CustomerMobileNo : this.LeadObject.MobileNo,
        party_id : this.LeadObject.UniqueId,
        crm : 'Workscan',
        LeadType : "LEAD"
      };
      console.log("Before post ", obj);
      this.ngxSpinnerService.show()
      this.dynamicService.makeOutboundCall(obj).subscribe(
        {
          next: (value) => {
            ;
            this.ngxSpinnerService.hide();
            let response = JSON.parse(value.toString());
              this.toastMessage.success(response.message, "Call Forwarded successfully!");
              // window.location.reload()
          },
          error: err => {
            
            this.ngxSpinnerService.hide();
            console.log(err);
          }
        });
    }
  
  onFollowUp() {
    if (this.controlValidations()){
          let requestData = [];
          requestData.push({
            "Key": "ApiType",
            "Value": "UpdateLeadManagement"
          });
          requestData.push({
            "Key": "LeadManagementGUID",
            "Value": this.params.leadguid
          });
          requestData.push({
            "Key": "LeadStatus",
            "Value": 'FOLLOW-UP'
          });
          requestData.push({
            "Key": "LeadDisposition",
            "Value": this.LeadDisposition
          });
          requestData.push({
            "Key": "Remark",
            "Value": this.Remarks
          });
          
          let strRequestData = JSON.stringify(requestData);
          let contentRequest = { "content": strRequestData };
      
          this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
            next: (value) => {
              let response = JSON.parse(value.toString());
              if (response.ReturnCode == '0') {
                this.toastMessage.success("Form Submitted Successfully");
                this.route.navigate(['/auth/'+glob.getCompanyCode()+'/lead-management-list'])
              } else {
                this.errorMessage = response.ReturnMessage;
                const parser = new xml2js.Parser({ strict: false, trim: true });
                parser.parseString(response.ErrorMessage, (err, result) => {
                  response['errorMessageJson'] = result;
                  this.handleError(response);
                });
              }
            },
            error: err => {
              console.log("Error ", err)
            }
          });

    }
  }
  
}