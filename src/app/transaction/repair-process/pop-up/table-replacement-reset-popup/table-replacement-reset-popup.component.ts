import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CaseDetail, type } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import xml2js from "xml2js";

@Component({
  selector: 'app-table-replacement-reset-popup',
  templateUrl: './table-replacement-reset-popup.component.html',
  styleUrls: ['./table-replacement-reset-popup.component.css']
})
export class TableReplacementResetPopupComponent implements OnInit {

  constructor(
    private toaster: ToastrService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private ngxSpinnerService: NgxSpinnerService,

  ) { }


  typeSelected = 'ball-clip-rotate';
  @Input() repa: CaseDetail;

  @Output() CloseResetTableReplacementPopupEvent = new EventEmitter<any>();



  ngOnInit(): void {

    console.log('repa from TableReplacementResetPopupComponent ', this.repa)
    this.CaseId = this.repa?.CaseId
  }


  TableReplacementFlagList = [
    { Id: "NO", TEXT: "NO" },
    { Id: "YES", TEXT: "YES" }
  ]
  SelectedTBRFlag: any;
  CaseId: any;
  Remark: any;


  ResetTableReplacement() {

    if (this.SelectedTBRFlag == null || this.SelectedTBRFlag == undefined || this.SelectedTBRFlag == '') {
      this.toaster.error('Select Table Replacement')
      return
    }

    this.ngxSpinnerService.show()
    
    let requestData = [];
    requestData.push({
      Key: "ApiType",
      Value: "ResetTableReplacement",
    });
    requestData.push({
      Key: "CaseGUID",
      Value: this.repa?.CaseGUID,
    });
    requestData.push({
      Key: "CaseId",
      Value: this.repa?.CaseId,
    });
    requestData.push({
      Key: "TableReplacement",
      Value: this.SelectedTBRFlag,
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

  CloseResetTableReplacementPopup() {
    
    this.CloseResetTableReplacementPopupEvent.emit(false);
  }



}
