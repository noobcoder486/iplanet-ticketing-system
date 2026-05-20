import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CaseDetail } from '../../repair-process.metadata';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from "src/app/config/global";



@Component({
  selector: 'app-reset-quote-popup',
  templateUrl: './reset-quote-popup.component.html',
  styleUrls: ['./reset-quote-popup.component.sass']
})
export class ResetQuotePopupComponent implements OnInit {

  constructor(
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private toasty: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
  ) { }

  typeSelected = 'ball-clip-rotate';
  @Input() repa: CaseDetail;

  ResetQuoteReasonDD: DropDownValue = DropDownValue.getBlankObject();
  ResetQuoteReason: any;
  Remarks: any;
   RejectQuoteReasonDD: DropDownValue = DropDownValue.getBlankObject();
    RejectQuoteReason: any;
    Parameter : any; 

  ngOnInit(): void {

    this.Parameter = this.repa?.QUOTE?.RejectReason;
    this.RejectQuoteReason = this.repa?.QUOTE?.RejectReason ?? ''
    console.log('repa ResetQuotePopupComponent', this.repa)
    this.onQuoterResetReasonSearch({ term: "", items: [] });
    this.onQuoteRejectReasonSearch({ term: "", items: [] });

  }


  onQuoterResetReasonSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.QUOTERESETREASON, $event.term,{Parameter : this.Parameter }).subscribe({
      next: (value) => {
        if (value != null) {
          
          this.ResetQuoteReasonDD = value;
          console.log("ResetQuoteReasonDD ", this.ResetQuoteReasonDD)
          console.log("this.repa?.QUOTE?.RejectReason ", this.repa?.QUOTE?.RejectReason)
        }
      },
      error: (err) => {
        this.ResetQuoteReasonDD = this.getBlankObject();
      }
    });
  }


  getBlankObject(): DropDownValue {
    throw new Error('Method not implemented.');
  }


  //Reset Quote 

  ResetQuote() {
    
     if (this.RejectQuoteReason == null || this.RejectQuoteReason == undefined || this.RejectQuoteReason == '') {
      this.toasty.error('Please select Reject Quote Reason...')
      return
    }
    
    if (this.ResetQuoteReason == null || this.ResetQuoteReason == undefined || this.ResetQuoteReason == '') {
      this.toasty.error('Please select Reason to Proceed...')
      return
    }
   
    if (!this.repa.CaseGUID) {
      this.toasty.error('Invalid Case Guid...')
      return
    }
    this.ngxSpinnerService.show()
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "ResetQuotation",
    });
    requestData.push({
      Key: "CompanyCode",
      Value: glob.getCompanyCode(),
    });
    requestData.push({
      Key: "CaseGuid",
      Value: this.repa.CaseGUID
    });
    requestData.push({
      Key: "ResetReason",
      Value: this.Remarks == null || this.Remarks == undefined ? '' : this.Remarks
    });
    requestData.push({
      Key: "Reason",
      Value: this.ResetQuoteReason
    });
    requestData.push({
      Key: "RejectQuoteReason",
      Value: this.RejectQuoteReason
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log('Resest Quote contentRequest', contentRequest);
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
        
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == "0") {

          this.toasty.success("Submitted Successfully");
          window.location.reload()

          this.ngxSpinnerService.hide()

        } else {

          console.log('response.ReturnMessage', response.ReturnMessage);
          this.toasty.error("Something Went Wrong!", response.ReturnMessage);
          this.ngxSpinnerService.hide()

        }
      },
      error: (err) => {

        console.error(err);
        this.toasty.error("An error occurred while Resetting the Quote", "Error");
        this.ngxSpinnerService.hide()
      },
    });
  }


  onQuoteRejectReasonSearch($event: { term: string; items: any[] }) {
      this.dropdownDataService.fetchDropDownData(DropDownType.QUOTEREJECTREASON, $event.term).subscribe({
        next: (value) => {
          if (value != null) {
            
            this.RejectQuoteReasonDD = value;
            console.log("RejectQuoteReasonDD ", this.RejectQuoteReasonDD)
          }
        },
        error: (err) => {
          this.RejectQuoteReasonDD = this.getBlankObject();
        }
      });
    }

    onRejectQuoteReasoncChange(){
        
        this.Parameter = this.RejectQuoteReason
        this.ResetQuoteReason = null;
       this.onQuoterResetReasonSearch({ term: "", items: [] });
    }


}
