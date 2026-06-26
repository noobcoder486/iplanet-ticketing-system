import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { CaseDetail } from '../../repair-process.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-repair-pop',
  templateUrl: './repair-pop.component.html',
  styleUrls: ['./repair-pop.component.sass']
})
export class RepairPopComponent implements OnInit {
  typeSelected = 'ball-clip-rotate';
  toastr: any;
  validateAllFormFields: any;
  partList: any[] = [];
  resourceData: any[] = []
  SelectedPartList: any[] = [];
  SelectedPartCount: Number = 0;
  NormalPartList: any[] = [];
  TierPartList: any[] = [];
  AcPlusPartList: any = [];
  PartSelectionMode: String = "Normal"
  searchText: String = "";
  showonlyselected: boolean = false;
  errorMessage: string = "";

  @Output() repairPartEvent = new EventEmitter<any>();
  @Output() repairPartsVerification = new EventEmitter<any>();

  @Input() repa: CaseDetail;

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['objcasedetail']) {
      this.getPartSummaryData();
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private toast: ToastrService,
    private ngxSpinnerService: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.getPartSummaryData();
    console.log("in Quote component");

  }


  onSubmit() {
    this.SelectedPartList = [];
    for (let item of this.partList) {
      if (item.selected == true) {
        this.SelectedPartList.push(item);
      }
    }

    console.log('this.SelectedPartList', this.SelectedPartList)
    if (this.PartSelectionMode == "Normal") {
      if (this.repa.DIAG?.RepairType == "WUMS") {
        this.getTierPartDataAndEmit();
      }
      else {
        for (let item of this.SelectedPartList) {
          item.billable = true;
        }
        this.repairPartEvent.emit(this.SelectedPartList);
        this.repairPartsVerification.emit(this.SelectedPartList)
        //this.closePartSelectionEvent.emit(this.SelectedPartList);  
      }

    }
    else if (this.PartSelectionMode == "Tier") {
      for (let item of this.SelectedPartList) {

        this.NormalPartList.push(item);
      }
      for (let item of this.NormalPartList) {

        item.billable = true;
      }
      this.repairPartEvent.emit(this.NormalPartList);
      this.repairPartsVerification.emit(this.NormalPartList)


    }

  }


  UpdateSelectedCount() {
    this.SelectedPartCount = this.partList.filter(x => x.selected == true).length;
  }

  getPartSummaryData() {
    this.PartSelectionMode = "Normal";
    var showOnluWholeUsit = false
    if (this.repa.DIAG?.RepairType == "WUMS") {
      showOnluWholeUsit = true
    }

    this.ngxSpinnerService.show()
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
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }

        }
        else {

          this.partList = this.sortArrayOfObjects(response, "selected", "ascending");
          console.log(this.partList, "this.partList")
          this.ngxSpinnerService.hide()
          //this.GetResourceList()
        }

      },
      error: (err) => {
        console.log(err);
        this.toast.error("Please try again. " + err)
        this.ngxSpinnerService.hide()

      }
    });
  }

  getTierPartDataAndEmit() {
    this.PartSelectionMode = "Tier";
    this.ngxSpinnerService.show()


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
        iCtr = iCtr + 1;
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
        "partTypes": ["CNTC", "SHIP"],
        "repairType": this.repa.DIAG?.RepairType,
        "devices": [{ "id": this.repa?.SerialNo1 }],
        "coverageOption": this.repa.DIAG?.BillingOption,
        "componentIssues": SelectedComponentIssue
      };
    }
    else {
      requestObject = {
        "partTypes": ["SHIP"],
        "repairType": this.repa.DIAG?.RepairType,
        "devices": [{ "id": this.repa?.SerialNo1 }],
        "componentIssues": SelectedComponentIssue,
      };
    }
    var strData = JSON.stringify(requestObject);


    var data = {
      "Content": strData
    };
    this.gsxService.getPartsSummary(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide();
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }

        }
        else {
          var partlist = this.sortArrayOfObjects(response, "selected", "ascending");

          if (this.partList.length <= 1) {
            for (let item of partlist) {

              this.SelectedPartList.push(item);
            }
            for (let item of this.SelectedPartList) {
              item.billable = true;
            }
            this.repairPartEvent.emit(this.SelectedPartList);
            this.repairPartsVerification.emit(this.SelectedPartList)
            console.log(this.SelectedPartList, "this.repairpartList")
          }
          else if (this.partList.length > 1) {

            this.NormalPartList = this.SelectedPartList
            this.SelectedPartList = []
            this.partList = partlist
            this.SelectedPartCount = 0
          }

        }

      },
      error: (err) => {
        console.log(err);
        this.toast.error("Please try again. " + err)
        this.ngxSpinnerService.hide()
      }
    });
  }



  onSearchChange(text) {
    console.log(text);

    for (let item of this.partList) {
      if (text.length > 1) {
        item.inSearch = (item.description.toLowerCase().includes(text.toLowerCase()) || item.number.toLowerCase().includes(text.toLowerCase()));
      } else {
        item.inSearch = false;
      }
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



  isToShowTr(item): Boolean {
    if (this.showonlyselected == false) {
      if (this.searchText.length <= 1) {
        return true;
      } else if (item.selected == true) {
        return true;
      } else if (item.inSearch) {
        return true;
      } else {
        return false;
      }
    }
    else {
      if (item.selected == true) {
        return true;
      } else {
        return false;
      }

    }
  }


  GetResourceList() {
    let requestData = [];
    const str = this.repa?.productDescription
    const ProductCategory = str.split(' ')[0]
    requestData.push({
      "Key": "APIType",
      "Value": "GetResourcePriceList"
    });
    requestData.push({
      "Key": "ProductCategory",
      "Value": ProductCategory
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest =
    {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          try {
            let response = JSON.parse(Value.toString());
            if (response.ReturnCode == '0') {
              let data = JSON.parse(response?.ExtraData);
              console.log("Data", data?.Resource.Resource)

              if (Array.isArray(data?.Resource.Resource)) {
                for (var item of data?.Resource.Resource) {
                  this.partList.push({
                    "number": item.MaterialCode,
                    "description": item.MaterialDescription,
                    "typeDescription": item.ItemType,
                  })
                }

              }
              else {
                var results = [];
                results.push(data?.Resource.Resource);
                this.partList.push({
                  "number": results[0].ResourceCode,
                  "description": results[0].ResourceDescription,
                  "typeDescription": results[0].ResourceType,
                })
              }


            }
          } catch (ext) {
            console.log(ext);
          }
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }

  setdataInPartList() {
    for (let item of this.resourceData) {
      this.partList.push({
        "currency": 'INR',
        "description": item.ResourceName,
        "imageUrl": '',
        "number": item.ResourceCode,
        "type": item.ResourceType,
        "typeDescription": item.ResourceDescription,
        "stockPrice": item.ResourceType,
        "exchangePrice": 0,
      })
    }
  }
  getPartSummaryForRepairEligiblePart(partlist) {
    this.ngxSpinnerService.show()
    var requestObject = {
      "repairType": this.repa.DIAG?.RepairType,
      "partNumbers": partlist
    }
    var strData = JSON.stringify(requestObject);
    var data = {
      "Content": strData
    };
    this.gsxService.getPartsSummary(data).subscribe({
      next: (value) => {
        this.ngxSpinnerService.hide()
        let response = JSON.parse(value.toString());
        if (!(response.errors == undefined || response.errors == null)) {
          var errorMessage = "";
          for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
            errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
            this.toast.error(errorMessage, "Error", { closeButton: true, disableTimeOut: true })
          }
          var AllPartList = []
          for (let item of this.NormalPartList) {
            item.billable = true;
            AllPartList.push(item)
          }
          for (let item of this.SelectedPartList) {
            item.billable = true;
            AllPartList.push(item)
          }
          this.repairPartEvent.emit(AllPartList);
          this.repairPartsVerification.emit(AllPartList)

          //this.closePartSelectionEvent.emit(AllPartList);  


        }
        else {
          //
          for (let item of response) {
            var tieritem = this.AcPlusPartList.filter(x => x.number == item.number)
            if (tieritem.length > 0) {
              item.billable = tieritem[0].billable
            }
          }
          this.repairPartEvent.emit(response);
          this.repairPartsVerification.emit(response)
        }

      },
      error: (err) => {
        console.log(err);
        this.toast.error("Please try again. " + err)
        var AllPartList = []
        for (let item of this.NormalPartList) {
          item.billable = true
          AllPartList.push(item)
        }
        for (let item of this.SelectedPartList) {
          item.billable = true
          AllPartList.push(item)
        }
        this.repairPartEvent.emit(AllPartList);
        this.repairPartsVerification.emit(AllPartList)

        //this.closePartSelectionEvent.emit(AllPartList);  

        this.ngxSpinnerService.hide()


      }
    });
  }

}
