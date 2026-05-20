import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CaseDetail, type } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from "xml2js";

@Component({
  selector: 'app-reset-diagnosis-popup',
  templateUrl: './reset-diagnosis-popup.component.html',
  styleUrls: ['./reset-diagnosis-popup.component.css']
})
export class ResetDiagnosisPopupComponent implements OnInit {

  constructor(
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
  ) { }

  typeSelected = 'ball-clip-rotate';
  @Input() repa: CaseDetail;

  @Output() CloseResetDiagnosisPopupComponentEvent = new EventEmitter<any>();

   DiagnosisBillableFlagList = [
    { Id: '0', TEXT: "false" },
    { Id: '1', TEXT: "true" }
  ]
  SelectedBillableRepair: any;
  DiagnosisCode: any;
  Remark:any;

  ngOnInit(): void {
    this.DiagnosisCode =  this.repa?.DIAG?.DiagnosisCode
  }

    

   ResetDiagnosisBillableFlag() {
           
      if (this.SelectedBillableRepair == null || this.SelectedBillableRepair == undefined || this.SelectedBillableRepair == '') {
        this.toaster.error('Select Billable Flag ...')
        return
      }
  
      this.ngxSpinnerService.show()
      
      let requestData = [];
      requestData.push({
        Key: "ApiType",
        Value: "ResetDiagnosisBillableFlag",
      });
      requestData.push({
        Key: "CaseGUID",
        Value: this.repa?.CaseGUID,
      });
      requestData.push({
        Key: "DiagnosisGUID",
        Value: this.repa?.DiagGUID,
      });
      requestData.push({
        Key: "BillableRepair",
        Value: this.SelectedBillableRepair ?? '' ,
      });
      requestData.push({
        Key: "Remark",
        Value: this.Remark ? this.Remark.trim() :  '',
      });
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        content: strRequestData,
      };
      console.log("Diagnosis Billable reset request data", contentRequest)
       
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            var data = JSON.parse(response.ExtraData);
            this.toaster.success("Submitted Succesfully");
            window.location.reload()
          }
          else {
            this.ngxSpinnerService.hide()
            console.log("Error Response: ", response)
            let errorMessage = response.ErrorMessage;
          
            const parser = new xml2js.Parser({
              explicitArray: false, 
              trim: true
            });
  
            parser.parseString(response.ErrorMessage, (err, result) => {
              if (err) {
                console.error("XML Parse Error", err);
                return;
              }
              const errorNode = result?.errorList?.errorMessage;
              if (!errorNode) {
                console.error("Invalid XML structure", result);
                return;
              }
              const errorArray = Array.isArray(errorNode) ? errorNode : [errorNode];
              errorArray.forEach(errItem => {
                this.toaster.error(errItem.ErrorMessage);
              });
            });
  
  
            this.ngxSpinnerService.hide()
  
          }
        },
        error: (err) => {
  
          console.log(err);
          this.ngxSpinnerService.hide()
  
        },
      });
    }



    CloseResetDiagnosisBillableFlagPopup(){
      
         this.CloseResetDiagnosisPopupComponentEvent.emit(false)
    }

}
