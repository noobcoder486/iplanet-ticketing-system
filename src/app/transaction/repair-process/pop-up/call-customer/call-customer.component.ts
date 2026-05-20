import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'
import { NgxSpinnerService } from 'ngx-spinner';
import { CaseDetail } from '../../repair-process.metadata';

@Component({
  selector: 'app-call-customer',
  templateUrl: './call-customer.component.html',
  styleUrls: ['./call-customer.component.sass']
})
export class CallCustomerComponent implements OnInit {

  @Input() repa : CaseDetail
  @Output() CancelBtn = new EventEmitter<any>();

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
    this.LocationMobileNo = Array.isArray(this.repa.CASADETAILS.Details) 
      ? this.repa.CASADETAILS.Details[0].CasaLocation.MobileNo    : this.repa.CASADETAILS.Details.CasaLocation.MobileNo    

  }

  CancelBtn1(){
    this.CancelBtn.emit(false)  
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
        CustomerMobileNo : this.repa.CUSTOMER.MobileNo,
        party_id : this.repa.CaseId,
        crm : 'Workscan',
        LeadType : "REPAIR"
      };
      console.log("Before post ", obj);
      // this.toastMessage.error("Calling disabled!", "Error: ");
      // return
      this.ngxSpinnerService.show()
      this.dynamicService.makeOutboundCall(obj).subscribe(
        {
          next: (value) => {
            ;
            this.ngxSpinnerService.hide();
            let response = JSON.parse(value.toString());
              this.toastMessage.success(response.message, "Call Forwarded successfully!");
              this.CancelBtn.emit(false)  
          },
          error: err => {
            
            this.ngxSpinnerService.hide();
            console.log(err);
          }
        });
    }
  
  
}