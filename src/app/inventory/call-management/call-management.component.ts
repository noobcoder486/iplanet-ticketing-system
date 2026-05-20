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
  selector: 'app-call-management',
  templateUrl: './call-management.component.html',
  styleUrls: ['./call-management.component.css']
})
export class CallManagementComponent implements OnInit {


  constructor(
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService,
    private ngxSpinnerService: NgxSpinnerService
  ) { }

  params: any;
  Spinner = false;
  IsShowPopup: boolean = false;

  LocationMobileNo: string
  CallDispositionDD: DropDownValue = DropDownValue.getBlankObject();
  CallDisposition: string = '';
  Remark: string = '';

  CallObject: any;

  CallCategory: any;
  ParentDetails: any;
  CallCategoryDD: DropDownValue = DropDownValue.getBlankObject();
  ParentDetailsDD: DropDownValue = DropDownValue.getBlankObject();

  IsOnlyView:boolean=false;

  ngOnInit(): void {
    this.onCallDisposition({ term: "", item: [] });
    this.onCallCategory({ term: "", item: [] });
    this.onLeadParentDetails({ term: "", item: [] });
    this.params = this.activatedRoute.snapshot.queryParams;

    if (this.params?.CallManagementDetailGUID != null || this.params?.CallManagementDetailGUID != undefined) {
      this.getData();

    }
  }


  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetCallManagementObject"
    });
    requestData.push({
      "Key": "CallManagementDetailGUID",
      "Value": this.params?.CallManagementDetailGUID
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


            this.CallObject = data?.CallManagementDetails
            this.LocationMobileNo = this.CallObject?.CasaLocation?.MobileNo

            this.Remark = this.CallObject?.Remark
            this.CallCategory = this.CallObject?.CallCategory
            this.ParentDetails = this.CallObject?.ParentDetails
            this.CallDisposition = this.CallObject?.CallDisposition

            this.IsOnlyView = (this.CallObject?.CallStatus === 'CLOSED'|| this.CallObject?.CallStatus === 'CONVERTED-TO-LEAD' ) ? true : false;

            console.log('data', data)
            console.log('CallObject', this.CallObject)
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

  onCallDisposition($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CallDisposition, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.CallDispositionDD = value;
          console.log('CallDispositionDD', this.CallDispositionDD)
        }
      },
      error: (err) => {
        this.CallDispositionDD = DropDownValue.getBlankObject();
      }
    });
  }
  onCallCategory($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CONVERTTOLEAD, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.CallCategoryDD = value;
          console.log('CallCategoryDD', this.CallCategoryDD)
        }
      },
      error: (err) => {
        this.CallCategoryDD = DropDownValue.getBlankObject();
      }
    });
  }
  onLeadParentDetails($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.LeadParentDetails, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ParentDetailsDD = value;
          console.log('ParentDetailsDD', this.ParentDetailsDD)
        }
      },
      error: (err) => {
        this.ParentDetailsDD = DropDownValue.getBlankObject();
      }
    });
  }


  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onCall() {
    
    var obj = {
      LocationMobileNo: this.LocationMobileNo,
      CustomerMobileNo: this.CallObject.MobileNo,
      party_id: this.CallObject.UniqueId,
      crm: 'Workscan',
      LeadType: "LEAD"
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


  showPopup() {
   if(this.CallDisposition == '' || this.CallDisposition == null || this.CallDisposition == undefined){
    this.toastMessage.error('Please select call disposition to proceed...')
    return
   }
   if(this.Remark == '' || this.Remark == null || this.Remark == undefined){
    this.toastMessage.error('Please Remark to proceed...')
    return
   }
    this.IsShowPopup = true;
  }

  ClosePopUp() {
    this.IsShowPopup = false;
    if(this.IsOnlyView == false){
      this.ParentDetails = null;
      this.CallCategory = null;
    }

  }

  ConvertToLead(status){
    
         if(this.CallCategory == null || this.CallCategory == undefined || this.CallCategory == '' ){
           this.toastMessage.error('Cannot Proceed Without Call Category...');
           return
         }
         if(this.ParentDetails == null || this.ParentDetails == undefined || this.ParentDetails == '' ){
           this.toastMessage.error('Cannot Proceed Without Parent Details...');
           return
         }
     this.IsShowPopup=false;
      this.UpdateStatus(status)
  }

  UpdateStatus(status) {
     
    if (this.CallDisposition == null || this.CallDisposition == '' || this.CallDisposition == undefined) {
      this.toastMessage.error('Please Select Call Disposition to proceed...');
      return
    }
    if (this.Remark == null || this.Remark == '' || this.Remark == undefined) {
      this.toastMessage.error('Please Enter Remarks to proceed...');
      return
    }

    if (status == null || status == undefined || status == '') {
      this.toastMessage.error('Cannot Proceed without the Status...')
      return
    }

    const IsConfirm =  confirm("Are you Sure ? You Want to Proceed ?")
    if(!IsConfirm){
      return
    }

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateCallManagementDetails"
    });
    requestData.push({
      "Key": "callManagementDetailGUID",
      "Value": this.params?.CallManagementDetailGUID
    });
    requestData.push({
      "Key": "CallDisposition",
      "Value": this.CallDisposition
    });
    requestData.push({
      "Key": "Remark",
      "Value": this.Remark
    });
    requestData.push({
      "Key": "CallStatus",
      "Value": status
    });
    requestData.push({
      "Key": "CallCategory",
      "Value": this.CallCategory == null || this.CallCategory == undefined ? '' : this.CallCategory
    });
    requestData.push({
      "Key": "ParentDetails",
      "Value": this.ParentDetails == null || this.ParentDetails == undefined ? '' : this.ParentDetails
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = { "content": strRequestData };
    console.log('contentRequest', contentRequest);
     
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.toastMessage.success("Form Submitted Successfully");
          this.route.navigate(['/auth/' + glob.getCompanyCode() + '/call-management-list'])
        } else {
          let errorList:any;
          const parser = new xml2js.Parser({ strict: false, trim: true });
          parser.parseString(response.ErrorMessage, (err, result) => {
            
            response['errorMessageJson'] = result;
            errorList= response['errorMessageJson']['ERRORLIST']['ERRORMESSAGEROW'][0]
          
            console.log("response['errorMessageJson']", response['errorMessageJson'])
            console.log('errorList',errorList)
             this.toastMessage.error(` ${errorList.ERRORCODE[0]} , ${errorList.ERRORMESSAGE[0]} `)


          });
        }
      },
      error: err => {
        console.log("Error ", err)
      }
    });

  }
  errorMessage(errorMessage: any, arg1: (err: any, result: any) => void) {
    throw new Error('Method not implemented.');
  }

}
