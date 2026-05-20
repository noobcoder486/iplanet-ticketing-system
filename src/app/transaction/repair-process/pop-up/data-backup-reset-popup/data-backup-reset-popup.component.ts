import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CaseDetail, type } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from "xml2js";
import * as glob from 'src/app/config/global';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
@Component({
  selector: 'app-data-backup-reset-popup',
  templateUrl: './data-backup-reset-popup.component.html',
  styleUrls: ['./data-backup-reset-popup.component.css']
})
export class DataBackupResetPopupComponent implements OnInit {

  constructor( 
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,
) { }
  
  typeSelected = 'ball-clip-rotate';

  @Input() repa: CaseDetail;
  @Output() CloseDataBackupPopupEvent = new EventEmitter<any>();
  


  Remark:any;
  CaseId:any;
  SelectedDataBackupFlag:any;


  

  ngOnInit(): void {
    console.log('DataBackupResetPopupComponent ', this.repa)
    this.CaseId = this.repa?.CaseId
    this.onBindCompanyStock({ term: "", item: [] })

  }

  BindDataBackupDD: DropDownValue = DropDownValue.getBlankObject();


 CloseCloseDataBackupPopupEventPopup() {
    
    this.CloseDataBackupPopupEvent.emit(false);
  }



   onBindCompanyStock($event: { term: string; item: any[] }) {
      
      this.dropdownDataService.fetchDropDownData(DropDownType.DataBackup, $event.term, {
        CompanyCode: glob.getCompanyCode().toString()
      }).subscribe({
        next: (value) => {
          
          if (value != null) {
            this.BindDataBackupDD = value;
            console.log("BindDataBackupDD ", this.BindDataBackupDD)
          }
        },
        error: (err) => {
          this.BindDataBackupDD = DropDownValue.getBlankObject();
          console.log("no data found BindDataBackupDD")
  
        }
      });
    }


ResetDataBackup() {
  
    if (this.SelectedDataBackupFlag == null || this.SelectedDataBackupFlag == undefined || this.SelectedDataBackupFlag == '') {
      this.toaster.error('Select DataBackup Flag')
      return
    }
    this.ngxSpinnerService.show()
    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "ResetDataBackupFlag",
    });
    requestData.push({
      Key: "CaseGUID",
      Value: this.repa?.CaseGUID,
    });
    requestData.push({
      Key: "DataBackup",
      Value: this.SelectedDataBackupFlag,
    });
    requestData.push({
      Key: "Remark",
      Value: this.Remark,
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    console.log("Reset Table Replacement Request Data  ", contentRequest)
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value:any) => {
        
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

          parser.parseString(response.ErrorMessage, (err:any, result) => {
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



}
