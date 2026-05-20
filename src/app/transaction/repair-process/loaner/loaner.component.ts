import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import xml2js from 'xml2js';
import * as glob from "../../../config/global";
import { CaseDetail } from '../repair-process.metadata';
import { v4 as uuidv4 } from 'uuid';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';


@Component({
  selector: 'app-loaner',
  templateUrl: './loaner.component.html',
  styleUrls: ['./loaner.component.css']
})
export class LoanerComponent implements OnInit {

  @Input() selectedItems;
  @Input() repa: CaseDetail;
  @Input() compoissuelist;
  componentIssueList:any[] = []
  PartSelectionMode: String = "Normal"
  partList: any[] = [];
  SelectedPartCount: number = 0;
  @Output() openComponentIssuePopupEvent = new EventEmitter<any>();
  showonlyselected: boolean = false;
  searchText: String = "";
  typeSelected = 'ball-clip-rotate';
  serialNumber:string = ''
  @Output() loanerItemChange = new EventEmitter<any[]>();
  
  isVisible:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private gsxService: GsxService,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.isVisible = true;
    this.getPartSummaryData();
  }
  
  getPartSummaryData() {
    this.PartSelectionMode = "Normal";
    var showOnluWholeUsit = false
    if (this.repa.DIAG?.RepairType == "WUMS") {
      showOnluWholeUsit = true
    }
    this.spinner.show()
    var iCtr = 1
    var SelectedComponentIssue = [];
    if (Array.isArray(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL)) {
      for (var item of this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL) {
        SelectedComponentIssue.push({
          "componentCode": item.ComponentCode,
          "issueCode": item.IssueCode,
          "type": "TECH",
          "reproducibility": this.repa.DIAG?.RepairType == "WUMS" ? item.ReproducibilityCode : null,
          "order": iCtr,
          "priority": iCtr
        })
        iCtr = iCtr + 1
      }
    }
    else {
      var lstDiagDetail = [];
      lstDiagDetail.push(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL);
      SelectedComponentIssue.push({
        "componentCode": lstDiagDetail[0].ComponentCode,
        "issueCode": lstDiagDetail[0].IssueCode,
        "type": "TECH",
        "reproducibility": this.repa.DIAG?.RepairType == "WUMS" ? lstDiagDetail[0].ReproducibilityCode : null,
        "order": 1,
        "priority": 1
      })
    }
    var requestObject
    if (this.repa.DIAG?.RepairType == "WUMS") {
      requestObject = {
        "wholeUnitPartsOnly": showOnluWholeUsit,
        "repairType": this.repa.DIAG?.RepairType,
        "devices": [{ "id": this.repa?.SerialNo1 }],
        "coverageOption": this.repa.DIAG?.RepairType == "WUMS" ? this.repa.DIAG?.BillingOption : null,
        "componentIssues": this.repa.DIAG?.RepairType == "WUMS" ? SelectedComponentIssue : null
      }
    }
    else {
      requestObject = {
        "repairType": this.repa.DIAG?.RepairType,
        "devices": [{ "id": this.repa?.SerialNo1 }],
      }

    }

    var strData = JSON.stringify(requestObject);
    var data = {
      "Content": strData
    };
    this.gsxService.getPartsSummary(data).subscribe({
      next: (value) => {
        this.spinner.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          '';
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
        }
        else {
          this.partList = this.sortArrayOfObjects(response, "selected", "ascending");
          this.partList.splice(1,this.partList.length-1)
          console.log(this.partList,"loaner partlist")
        }
      },
      error: (err) => {
        console.log(err);
        this.toast.error("Please try again. " + err)
        this.spinner.hide()
      }
    });
  }

  deleteLoaner()
  {
    this.partList = []
  }

  markDOA()
  {
    if(this.serialNumber == null || this.serialNumber == undefined || this.serialNumber == '')
    {
      this.toast.error("Serial Number cannot be empty")
      return
    }
    else
    {
      var Loaner = {
        "number":this.partList[0]?.number,
        "PartUsed":this.partList[0]?.number,
        "returnStatusCode":null,
        "fromConsignedStock":true,
        "componentIssue":{
          "componentCode":this.compoissuelist[0].ComponentCode,
          "reproducibility":this.compoissuelist[0].ReproducibilityCode,
          "issueCode":this.compoissuelist[0].IssueCode
        },
        "device":{
          "id":this.serialNumber,
        }
      }
    }
  }

  saveLoaner()
  {
    if(this.serialNumber == '')
    {
      this.toast.error("Serial Number/IMEI cannot be empty")
      return
    }
    else
    {
      var Loaner = {
        "number":this.partList[0]?.number,
        "PartUsed":this.partList[0]?.number,
        "returnStatusCode":null,
        "fromConsignedStock":true,
        "componentIssue":{
          "componentCode":this.compoissuelist[0].ComponentCode,
          "reproducibility":this.compoissuelist[0].ReproducibilityCode,
          "issueCode":this.compoissuelist[0].IssueCode
        },
        "device":{
          "id":this.serialNumber,
        }
      }
    }
  }


  addLoaner()
  {
    if(this.partList.length > 0)
    {
      this.toast.error("Loaner Already Added")
      return
    }
    else
    {
      this.getPartSummaryData()
    }
  }

  sortArrayOfObjects = <T>(
    data: T[],
    keyToSort: keyof T,
    direction: 'ascending' | 'descending' | 'none',
  ) => {
    if (direction === 'none') {
      return data
    }
    const compare = (objectA: T, objectB: T) => {
      const valueA = objectA[keyToSort]
      const valueB = objectB[keyToSort]

      if (valueA === valueB) {

        return 0
      }

      if (valueA > valueB) {
        return direction === 'ascending' ? 1 : -1
      } else {
        return direction === 'ascending' ? -1 : 1
      }
    }

    return data.slice().sort(compare)
  }
}
