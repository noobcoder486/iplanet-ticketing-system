import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from 'xml2js';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';



@Component({
  selector: 'app-second-repair-popup',
  templateUrl: './second-repair-popup.component.html',
  styleUrls: ['./second-repair-popup.component.css']
})
export class SecondRepairPopupComponent implements OnInit {


  @Input() repa: any;
  @Output() CancelBtn = new EventEmitter<any>();
  @Output() SaveSecondRepairPopUp = new EventEmitter<any>();

  Reason: any;
  Remarks: any;
  SecondRepairReasonDD: DropDownValue = this.getBlankObject();




  constructor(
    private NgxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,


  ) { }

  ngOnInit(): void {
    console.log('repa from second repair ', this.repa)
    this.OnSecondRepairReasonSearch({ term: "", items: [] });
  }

  onSubmit() {
    
    
     this.NgxSpinnerService.show()
     this.Remarks = this.Remarks.trim();
    
    if (this.Reason == null || this.Reason == undefined || this.Reason == '') {
      this.toastMessage.error('Please Select Reson ! ')
      return
    }
    if (this.Remarks == null || this.Remarks == undefined || this.Remarks == '') {
      this.toastMessage.error('Please Enter Remarks !')
      return
    }
    if (this.repa?.REPAIR?.GSXRepairStatus == null || this.repa?.REPAIR?.GSXRepairStatus == undefined || this.repa?.REPAIR?.GSXRepairStatus == '') {
      this.toastMessage.error('Cannot Proceed without Repair Status !')
      return
    }
   
    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value": "SecondRepair"
    })
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa?.CaseGUID
    })
    requestData.push({
      "Key": "RepairGUID",
      "Value": this.repa?.REPAIR?.RepairGUID
    })
    requestData.push({
      "Key": "GSXRepairStatus",
      "Value": this.repa?.REPAIR?.GSXRepairStatus
    })
    requestData.push({
      "Key": "Reason",
      "Value": this.Reason
    })
    requestData.push({
      "Key": "Remarks",
      "Value": this.Remarks == null || this.Remarks == undefined ? '' : this.Remarks
    })

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          this.NgxSpinnerService.hide()
          try {
            
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);

              this.SaveSecondRepairPopUp.emit(data)
            }
            else {
              

              let errorMessage = response.ErrorMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(errorMessage, (error, result) => {
                const errorMessages = result.ERRORLIST.ERRORMESSAGE;
                errorMessages.forEach((errorMessage) => {
                  this.toastMessage.error(errorMessage.ERRORMESSAGE, "Error:-", { closeButton: true, disableTimeOut: true });
                });
              });
            }
          }
          catch (ext) {
            
            console.log("Error ", ext)
            this.toastMessage.error(ext, "Error:-", { closeButton: true, disableTimeOut: true });
            this.NgxSpinnerService.hide()
          }
        },
        error: err => {
          this.NgxSpinnerService.hide()
          console.log(err)
        }
      }
    );

  }

  onCancel() {
    this.CancelBtn.emit(false)
  }

  OnSecondRepairReasonSearch($event: { term: string; items: any[] }) {
    
    this.dropdownDataService
      .fetchDropDownData(DropDownType.SecondRepairReason, $event.term, {})
      .subscribe({
        next: (value) => {

          if (value != null) {
            this.SecondRepairReasonDD = value;
          }

          console.log('SecondRepairReasonDD', this.SecondRepairReasonDD);
        },

        error: (err) => {
          this.SecondRepairReasonDD = this.getBlankObject();
        },

      });

  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }


}