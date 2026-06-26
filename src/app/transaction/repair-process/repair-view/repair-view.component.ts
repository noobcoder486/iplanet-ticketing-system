import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from "../../../config/global";
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { CaseDetail } from '../repair-process.metadata';
import { RepairMetaData } from './repair.metadata';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Repair, RepairItem } from './repair.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { FeedbackComponent } from '../feedback/feedback.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-repair-view',
  templateUrl: './repair-view.component.html',
  styleUrls: ['./repair-view.component.scss']
})
export class RepairViewComponent implements OnInit {

  ConsignmentStatusPartList: any[] = [];

  errorMessage: any;
  handleError: any;
  selected = '';
  newrepairGuid = uuidv4();
  repairview: RepairMetaData;
  compIssueForm: FormGroup;
  repairstatus = '';
  coveragehover: String;
  issueshover: String;
  reproducibilityhover: String;
  repairstatushover: '';
  isDeletshover: '';
  requestReviewByApple: boolean = false
  markComplete: boolean = false
  isRejectReason: boolean = false
  coverages: DropDownValue = DropDownValue.getBlankObject();
  reproducibility: DropDownValue = DropDownValue.getBlankObject();
  repairStatus: DropDownValue = DropDownValue.getBlankObject();
  repairStatusForm: FormGroup
  displayedColumns: string[] = ['number', 'description'];
  returnOptions: string
  returnOption: string[] = ['Dead On Arrival', 'Good Parts Return', 'Convert to Stock', 'Stock DOA'];
  IssuesList: any[] = [];
  selectedList = [] = [];
  selectedpartlist: any[] = [];
  ComponentList: any[] = [];
  ComponentIssueList: any[] = [];
  SelectedComponentIssue: any[] = [];
  selectedcomponentissuelist: any[] = [];
  //FinalRepairList: any[] = [];
  compoissuelist: any[] = [];
  rplist: any[] = [];
  objRepair: Repair
  isComponentIssuesPop: boolean = false;
  isFormGroupCreated: boolean = false;
  RepairStatusList: any[] = [];
  username: String = "";

  GSXRepairStatusDescription: String;
  GSXRepairStatus: String;
  JobStatus: String;
  GSXRepairStatusDateTime: Date
  RepairDate: Date = new Date();
  RepairDocCode: String;
  GSXCode: string;
  shipments: any;
  accounts: any;
  ServiceNotificationNumber: String;
  SubTotalAmount: Number = 0;
  TaxAmount: Number = 0;
  TotalAmount: Number = 0;
  InvoiceAvailable: boolean;
  SelectedRepairStatus: any;
  repairQuestions: any;
  // Part Constraint 
  PartConstraintNotes: string
  today: any;
  isPartConstraint: boolean = false
  noOfDaysFromCreation: number;
  isApprover: boolean = false;

  @Output() PopEvent = new EventEmitter();
  @Input() repa: CaseDetail;
  @Input() repairpartlist: any[] = [];
  @Input() verifiedPartList
  @Output() RepairUpdated = new EventEmitter<any>();
  @Output() RepairRejectReason = new EventEmitter<any>();
  @Output() RepairHoldReason = new EventEmitter<any>();
  @Output() RepairOption = new EventEmitter<any>();
  @Output() RepairOptionValue = new EventEmitter<any>();
  @Output() toggleLoaner = new EventEmitter<void>();

  @Output() NotesUpdated = new EventEmitter<any>();
  @Output() HoldUpdated = new EventEmitter<any>();
  @Output() Un_HoldUpdated = new EventEmitter<any>();
  @Output() getRepairQuestions = new EventEmitter<any>();
  @Input() receivedGidNumber: string;
  @Output() PartConstraintStatusChange = new EventEmitter<any>();



  RepairReject() {
    var Reject = true;
    this.RepairRejectReason.emit(Reject)
  }

  RepairHold() {
    var Hold = true;
    this.RepairHoldReason.emit(Hold)
  }

  RepairUnHold() {

    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false) {
      return
    }

    this.spinner.show();
    let newGuid = uuidv4();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveJobUnHold"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    console.log("Before Un Hold ", requestData);
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    // // TODO 
    // alert("Return ")
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.spinner.hide();

          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {

            var getval = JSON.parse(response.ExtraData);
            this.JobStatus = getval?.CaseDetail?.JobStatus
            console.log("ExtraData ", getval);
            this.Un_HoldUpdated.emit(getval?.CaseDetail);
          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
            });
          }
        },
        error: err => {
          this.spinner.hide();

          console.log(err);
        }
      });

  }


  RepairQuestions() {
    //this.getRepairQuestions.emit()
    this.openQuestionPopup();

  }

  constructor(private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private gsxService: GsxService,
    public dialog: MatDialog,
  ) {

  }

  CreateFormGroupObject() {

    if (this.isFormGroupCreated == false) {
      this.compIssueForm = this.formBuilder.group({
        requestReviewByApple: [null],
        markComplete: [null],
      });

      this.repairStatusForm = this.formBuilder.group({
        RepairStatus: [""],
        consignmentStock: [null],
      })
    }

  }

  UpdateRepairStatusList() {
    this.RepairStatusList = [];
    if (this.repa?.DIAG.RepairType == "CIN" || this.repa?.DIAG.RepairType == "CRBR") {
      if (this.GSXRepairStatus == "RLSD") {
        this.RepairStatusList.push({
          "RepairStatusCode": "RLSD",
          "RepairStatusDescription": "Repair released from processing"
        })
      }
      if (this.GSXRepairStatus == "RLSD" || this.GSXRepairStatus == "AWTP" || this.GSXRepairStatus == "AWTR" || this.GSXRepairStatus == "BEGR" || this.GSXRepairStatus == "RFPU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "AWTP",
          "RepairStatusDescription": "Awaiting Parts"
        })

        this.RepairStatusList.push({
          "RepairStatusCode": "AWTR",
          "RepairStatusDescription": "Parts Allocated"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "BEGR",
          "RepairStatusDescription": "In Repair"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "RFPU",
          "RepairStatusDescription": "Ready for Pickup"
        })


        this.RepairStatusList.push({
          "RepairStatusCode": "SPCM",
          "RepairStatusDescription": "Repair Marked Complete"
        })


      }
    }
    else if (this.repa?.DIAG.RepairType == "WUMS" || this.repa?.DIAG.RepairType == "WUMC") {

      if (this.GSXRepairStatus == "RABU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RABU",
          "RepairStatusDescription": "Unit Returned Abuse"
        })
      }

      if (this.GSXRepairStatus == "RBER") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RBER",
          "RepairStatusDescription": "Unit Returned BER"
        })
      }
      if (this.GSXRepairStatus == "RCND") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RCND",
          "RepairStatusDescription": "Unit Returned Could Not Duplicate Failure"
        })
      }
      if (this.GSXRepairStatus == "RPOP") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RPOP",
          "RepairStatusDescription": "Returned - No Proof of Purchase"
        })
      }

      if (this.GSXRepairStatus == "RRPL") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPL",
          "RepairStatusDescription": "Unit Returned Replaced"
        })

      }
      if (this.GSXRepairStatus == "RRPP") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPP",
          "RepairStatusDescription": "Unit Returned Partially Repaired"
        })

      }

      if (this.GSXRepairStatus == "RRPR") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRPR",
          "RepairStatusDescription": "Unit Returned Repaired"
        })

      }


      if (this.GSXRepairStatus == "RRTN") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RRTN",
          "RepairStatusDescription": "Returned - Tampered"
        })

      }


      if (this.GSXRepairStatus == "RVFU") {

        this.RepairStatusList.push({
          "RepairStatusCode": "RVFU",
          "RepairStatusDescription": "Component Check Failure - Returned Unrepaired"
        })

      }


      if (this.GSXRepairStatus == "URPL") {

        this.RepairStatusList.push({
          "RepairStatusCode": "URPL",
          "RepairStatusDescription": "Unit to be Replaced"
        })

      }
      if (this.RepairStatusList.length > 0 || this.GSXRepairStatus == "RFPU") {
        this.RepairStatusList.push({
          "RepairStatusCode": "RFPU",
          "RepairStatusDescription": "Ready for Pickup"
        })

        this.RepairStatusList.push({
          "RepairStatusCode": "SPCM",
          "RepairStatusDescription": "Repair Marked Complete"
        })


      }

    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['repa']) {
      if (this.repa != null && this.repa != undefined) {
        this.JobStatus = this.repa?.JobStatus
        this.newrepairGuid = this.repa?.REPAIR?.RepairGUID ?? uuidv4()
        this.GSXRepairStatusDescription = this.repa?.REPAIR?.GSXRepairStatusDescription
        this.GSXRepairStatus = this.repa?.REPAIR?.GSXRepairStatus;
        this.GSXCode = this.repa?.REPAIR?.GSXCode;
        this.RepairDate = this.repa?.REPAIR?.RepairDate;
        this.ServiceNotificationNumber = this.repa?.REPAIR?.ServiceNotificationNumber ?? '';
        this.SubTotalAmount = this.repa?.REPAIR?.SubTotalAmount;
        this.repairQuestions = this.repa.RepairFlag == 0 || this.repa?.REPAIR?.RepairQuestions == null || this.repa?.REPAIR?.RepairQuestions == "" ? null : JSON.parse(this.repa?.REPAIR?.RepairQuestions);
        this.TaxAmount = this.repa?.REPAIR?.TaxAmount;
        this.TotalAmount = this.repa?.REPAIR?.TotalAmount;
        this.SelectedRepairStatus = {
          "RepairStatusCode": this.GSXRepairStatus,
          "RepairStatusDescription": this.GSXRepairStatusDescription
        }
        if (this.repa?.REPAIR) {


          this.UpdateRepairStatusList();
          var order = Math.max(...this.selectedpartlist.map(o => o.order), 0);
          var rowno = Math.max(...this.selectedpartlist.map(o => o.rowno, 0));
          order = order == Infinity ? 1 : order
          rowno = rowno == -Infinity ? 1 : rowno + 1
          var lstRepairList = [];
          if (Array.isArray(this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL)) {
            for (let item of this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL) {
              lstRepairList.push(item)
            }
          }
          else {
            lstRepairList.push(this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL);
          }
          this.CreateFormGroupObject();
          this.selectedpartlist = []
          for (let item of lstRepairList) {

            var objPart = this.getPartObject(item, "DB");
            objPart.rowno = rowno
            objPart.order = order + 1
            objPart.order = order + 1
            objPart.priority = order + 1
            this.selectedpartlist.push(objPart);


            var formcontrolname = 'component' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ComponenyCode, Validators.required));
            formcontrolname = 'issues' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.IssueCode, Validators.required));
            formcontrolname = 'reproducibility' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ReproducibilityCode, Validators.required));
            formcontrolname = 'coverageOption' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.CoverageOption, Validators.required));
            formcontrolname = 'IsConsignmentStockUsed' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(objPart.ConsignmentStockUsed));
            /*if(objPart.PartSerialized==true)
            {
              formcontrolname = 'KGB' + rowno.toString()
              this.compIssueForm.addControl(formcontrolname ,new FormControl(objPart.KGB) );
  
              formcontrolname = 'KBB' + rowno.toString()
              this.compIssueForm.addControl(formcontrolname ,new FormControl(objPart.KBB) );
            }*/
            //formcontrolname = 'ConsignmentStockUsed' + rowno.toString()
            //this.compIssueForm.addControl(formcontrolname ,new FormControl(null) );

            order = order + 1;
            rowno = rowno + 1
          }
        }

        // Check if Unclaimed 
        if (this.repa.RepairFlag == '1' && this.repa.RFPFlag == '0') {
          let createdDate = new Date(this.repa.REPAIR.CreatedDate);
          createdDate.setHours(0, 0, 0, 0);
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          let differenceInMs = today.getTime() - createdDate.getTime();
          this.noOfDaysFromCreation = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
          if (this.noOfDaysFromCreation > 10) {
            this.isPartConstraint = true;
          }
        }

      }
    }

    if (changes['repairpartlist']) {


      this.selectedpartlist = (this.selectedpartlist ?? []).filter(p =>
        p?.PartCode != null && String(p.PartCode).trim() !== ''
      );

      let repairpartlist = {
        "rows": []
      }
      if (this.repairpartlist != null && this.repairpartlist != undefined && this.repairpartlist.length > 0) {

        this.repairview.coverageOption = this.repa?.DIAG?.BillingOption;

        var order = Math.max(...this.selectedpartlist.map(o => o.order), 0);
        if (order == Infinity) {
          order = 1;
        }
        var rowno = Math.max(...this.selectedpartlist.map(o => o.rowno, 0));
        if (rowno == -Infinity) {
          rowno = 0;
        }
        rowno = rowno + 1;
        for (let item of this.repairpartlist) {
          var result = this.selectedpartlist.filter(p => p.PartCode == item.number && p.IsDeleted == 0);
          if (result == undefined || result == null || result.length == 0) {
            var objPart = this.getPartObject(item, "PartSelect");
            objPart.rowno = rowno
            objPart.order = order + 1
            objPart.order = order + 1
            objPart.priority = order + 1
            this.selectedpartlist.push(objPart);
            var formcontrolname = 'component' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl('', Validators.required));
            formcontrolname = 'issues' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl('', Validators.required));
            formcontrolname = 'reproducibility' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl('', Validators.required));
            formcontrolname = 'coverageOption' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname, new FormControl(this.repa?.DIAG?.BillingOption, Validators.required));
            /*if(objPart.PartSerialized==true) 
            {
            formcontrolname = 'KGB' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname ,new FormControl(null, Validators.required) );
            
            formcontrolname = 'KBB' + rowno.toString()
            this.compIssueForm.addControl(formcontrolname ,new FormControl(null, Validators.required) );
            
            }*/

            //formcontrolname = 'ConsignmentStockUsed' + rowno.toString()
            //this.compIssueForm.addControl(formcontrolname ,new FormControl(null, Validators.required) );

            order = order + 1;
            rowno = rowno + 1
          }

        }
        // this.RepairQuestions()

        this.selectedpartlist = (this.selectedpartlist ?? []).filter(p =>
          p?.PartCode != null && String(p.PartCode).trim() !== ''
        );


        if (this.repa?.DIAG.RepairType == "CIN") {

          if (this.repa.DIAG.BillingOption != 'VMI_YELLOW' && this.repa.DIAG.BillingOption != 'VMI_RED') {

            this.consignmentValidate(this.selectedpartlist)

          }
          else {
            this.RepairQuestions()
          }

        }
        else {
          this.RepairQuestions()
        }
      }
    }
  }

  consignmentValidate(parts) {

    var consignmentValidateObj = [];
    for (let item of parts) {

      consignmentValidateObj.push({
        "number": item.PartCode,
        "quantity": 1
      })
    }
    var requestData = { "parts": consignmentValidateObj };
    //requestData.push(consignmentValidateObj)
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    var ShipTo = "";
    ShipTo = this.repa.LOCATION.SHIP_TO_GSX;
    console.log('contentRequest sending in getConsignmentStatus', contentRequest)
    this.gsxService.getConsignmentStatus(ShipTo, contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());



          if ((response.errors == undefined || response.errors == null)) {

            if (Array.isArray(response?.parts)) {
              this.ConsignmentStatusPartList = response?.parts
            }
            else {
              this.ConsignmentStatusPartList.push(response?.parts)
            }
            console.log('this.ConsignmentStatusPartList', this.ConsignmentStatusPartList);

            this.selectedpartlist.forEach(item => {

              const index = this.ConsignmentStatusPartList.findIndex(x => x.number == item.PartCode)
              if (index != -1 && this.ConsignmentStatusPartList[index].statusCode == 'DEVICE_ACTIVE') {
                item.ConsignmentStockUsed = 1
                this.toastr.success(`Consignement Stock Found ${item.PartCode}`);
              }
            })

            this.RepairQuestions()

          }
          else {
            this.toastr.error(response.errors[0].message, "Error")

          }

        }
      });

  }

  isLocalPermission: boolean = false
  checkLocalPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    console.log("DaTA", allPermision)
    let resp = allPermision.find(x => x.ProfileId == 14);
    console.log("Data", resp)
    if (resp?.View == true) {
      this.isLocalPermission = true
    }
    return resp != undefined && resp?.View ? true : false;

  }

  getRepairDetails(repairid: string) {
    let searchData = { "repairId": repairid };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    var LocationCode = this.repa?.LocationCode
    var CompanyCode = glob.getCompanyCode()
    this.gsxService.getRepairDetails(LocationCode, CompanyCode, contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("Repair Object GSX")

          if ((response.errors == undefined || response.errors == null)) {
            this.selectedpartlist = []
            this.GSXRepairStatusDescription = response.repairStatusDescription
            this.GSXRepairStatus = response.repairStatus;
            this.GSXRepairStatusDateTime = response.repairStatusDateTime //ne
            this.InvoiceAvailable = response.invoiceAvailable //ne
            this.RepairDate = response.repairCreatedOnDate;
            this.GSXCode = repairid;
            this.repairQuestions = response.questionDetails == undefined || response.questionDetails == null ? null : response.questionDetails;
            this.SelectedRepairStatus = {
              "RepairStatusCode": this.GSXRepairStatus,
              "RepairStatusDescription": this.GSXRepairStatusDescription
            }
            this.UpdateRepairStatusList();

            if (response.shipments == undefined || null) {
              this.shipments = []
            }
            else {
              this.shipments = []
              for (let shipment of response.shipments) {
                this.shipments.push({
                  "ShipmentType": shipment.type,
                  "CarrierName": shipment.carrierName,
                  "CarrierUrl": shipment.carrierUrl,
                  "CarrierCode": shipment.carrierCode,
                  "DeviceShipped": shipment.DeviceShipped,
                  "TrackingNumber": shipment.trackingNumber,
                  "ShippedDate": shipment.shippedDate,
                  "ReceivedDate": shipment.receivedDate
                })
              }
            }
            this.ServiceNotificationNumber = response.serviceNotificationNumber;
            var subtotalamount = response.price?.subTotalAmount == undefined || response.price?.subTotalAmount == null ? "0.00" : response.price?.subTotalAmount
            if (!(typeof subtotalamount == 'string')) {
              subtotalamount = "0.00"
            }
            this.SubTotalAmount = this.dynamicService.removeCommas(subtotalamount);

            var taxamount = response.price?.tax == undefined || response.price?.tax == null ? "0.00" : response.price?.tax;
            if (!(typeof taxamount == 'string')) {
              taxamount = "0.00"
            }
            this.TaxAmount = this.dynamicService.removeCommas(taxamount);
            var totalamount = response.price?.totalAmount == undefined || response.price?.totalAmount == null ? "0.00" : response.price?.totalAmount
            if (!(typeof totalamount == 'string')) {
              totalamount = "0.00"
            }
            this.TotalAmount = this.dynamicService.removeCommas(totalamount);

            for (let item of response.parts) {
              var objPart = this.getPartObject(item, "GSX");
              this.selectedpartlist.push(objPart);
            }
            this.onSave(this.GSXCode);
            this.UpdateRepairStatusLogs(this.GSXRepairStatus)
          }
          else {
            this.toastr.error(response.errors[0].message, "Error")
            this.spinner.hide();
          }

        }
      });

  }

  onClickToggleLoaner() {
    this.toggleLoaner.emit();
  }

  updateApprover(repairid) {
    let requestdata = []
    requestdata.push({
      "Key": "APIType",
      "Value": "SaveApprover"
    })
    requestdata.push({
      "Key": "CaseGuid",
      "Value": this.repa?.CaseGUID
    })
    requestdata.push({
      "Key": "ApprovedBy",
      "Value": glob.getLogedInUser()?.UserDetails?.UserName
    })
    this.spinner.show();
    let strRequestData = JSON.stringify(requestdata);
    console.log(strRequestData)
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.spinner.hide();
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            var data = JSON.parse(response.ExtraData)
            this.getRepairDetails(repairid);
          }
          else {
            this.spinner.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
            });
          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide();
          this.toastr.error(err.toString());
        }
      });

  }

  mapGID(gid: string) {
    this.spinner.show()
    this.getRepairDetails(gid);
  }



  getPartObject(part: any, Method: string) {

    if (Array.isArray(this.repa.DIAG?.DIAGLIST?.DIAGDETAIL)) {
      this.rplist = this.repa.DIAG?.DIAGLIST?.DIAGDETAIL;
    }
    else {
      this.rplist.push(this.repa.DIAG?.DIAGLIST?.DIAGDETAIL);
    }

    var diag = this.repa?.DIAG;

    var result;
    if (Method == "PartSelect") {
      result = this.selectedpartlist.filter(p => p.PartCode == part.number && p.IsDeleted == 0);
    }
    else if (Method == "GSX") {
      result = this.selectedpartlist.filter(p => p.PartCode == part.number && p.SequenceNumber == part.sequenceNumber);
    }
    else {
      result = this.selectedpartlist.filter(p => p.PartCode == part.PartCode);
    }

    var objPart
    var repairDetailGuid
    if (result == undefined || result == null || result.length == 0) {
      repairDetailGuid = uuidv4()
    }
    else {
      objPart = result
      repairDetailGuid = result[0].RepairDetailGUID
    }


    objPart = {
      "RepairDetailGUID": repairDetailGuid,
      "ComponentCode": Method == "GSX" ? part?.componentIssue?.componentCode : Method == "PartSelect" ? this.rplist[0]?.ComponentCode : part?.ComponentCode,
      "IssueCode": Method == "GSX" ? part?.componentIssue?.issueCode : Method == "PartSelect" ? this.rplist[0]?.IssueCode : part?.IssueCode,
      "ComponentDescription": Method == "GSX" ? part?.componentIssue?.componentDescription : Method == "PartSelect" ? this.rplist[0]?.ComponentDesc : part?.ComponentDescription,
      "IssueDescription": Method == "GSX" ? part?.componentIssue?.issueDescription : Method == "PartSelect" ? this.rplist[0]?.IssueDesc : part?.IssueDescription,
      "ReproducibilityCode": Method == "GSX" ? part?.componentIssue?.reproducibility : Method == "PartSelect" ? this.rplist[0]?.ReproducibilityCode : part?.ReproducibilityCode,
      "ReproducibilityDescription": Method == "GSX" ? part?.componentIssue?.reproducibilityDescription : Method == "PartSelect" ? this.rplist[0]?.ReproducibilityDescription : part?.ReproducibilityDescription,
      "PartCode": Method == "GSX" ? part.number : Method == "PartSelect" ? part.number : part?.PartCode,
      "PartUsed": Method == "GSX" ? part?.partUsed : Method == "PartSelect" ? part.substitutePartNumber == undefined || part.substitutePartNumber == null || part.substitutePartNumber == '' ? part.number : part.substitutePartNumber : part?.PartUsed,
      "PartDescription": Method == "GSX" ? part?.description : Method == "PartSelect" ? part.description : part?.PartDescription,
      "PartUsedDescription": Method == "GSX" ? part?.description : Method == "PartSelect" ? part.description : part?.PartUsedDescription,
      "OrderId": Method == "GSX" ? part?.orderId : Method == "PartSelect" ? "" : part?.OrderId,
      "OrderStatusCode": Method == "GSX" ? part?.orderStatusCode : Method == "PartSelect" ? "" : part?.OrderStatusCode,
      "OrderStatusDescription": Method == "GSX" ? part?.orderStatusDescription : Method == "PartSelect" ? "" : part?.OrderStatusDescription,
      "OrderStatusDate": Method == "GSX" ? part?.orderStatusDate : Method == "PartSelect" ? "" : part?.OrderStatusDate,
      "ReturnOrderNumber": Method == "GSX" ? part?.returnOrderNumber : Method == "PartSelect" ? "" : part?.ReturnOrderNumber,
      "ReturnStatusCode": Method == "GSX" ? part?.returnStatusCode : Method == "PartSelect" ? "" : part?.ReturnStatusCode,
      "ReturnStatusDescription": Method == "GSX" ? part?.returnStatusDescription : Method == "PartSelect" ? "" : part?.ReturnStatusDescription,
      "ImageUrl": Method == "GSX" ? part?.imageUrl : Method == "PartSelect" ? part?.imageUrl : part?.ImageUrl,
      "NetPrice": Method == "GSX" ? this.dynamicService.removeCommas(part?.netPrice == undefined ? "0" : part?.netPrice) : Method == "PartSelect" ? 0 : part?.NetPrice,
      "CoverageCode": Method == "GSX" ? part.coverageCode : Method == "PartSelect" ? this.repa?.GSXWarrantyStatusCode : part?.CoverageCode,
      "CoverageCodeDescription": Method == "GSX" ? part.coverageDescription : Method == "PartSelect" ? this.repa?.GSXWarrantyStatusDesc : part?.CoverageCodeDescription,
      "CoverageOption": Method == "GSX" ? part.coverageOption : Method == "PartSelect" ? diag?.BillingOption : part?.CoverageOption,
      "CoverageOptionDescription": Method == "GSX" ? part.coverageOptionDescription : Method == "PartSelect" ? this.rplist[0]?.BillingOption : part?.CoverageOptionDescription,
      "Type": Method == "GSX" ? part?.type : Method == "PartSelect" ? part?.type : part?.Type,
      "TypeDescription": Method == "GSX" ? part?.typeDescription : Method == "PartSelect" ? part?.typeDescription : part?.TypeDescription,
      "IsDeleted": Method == "GSX" ? 0 : Method == "PartSelect" ? 0 : part?.IsDeleted == "1" ? 1 : 0,
      "IsGSXPosted": Method == "GSX" ? true : Method == "PartSelect" ? false : part?.IsGSXPosted,
      "PartSerialized": Method == "GSX" ? part?.serialized == true ? true : false : Method == "PartSelect" ? part?.serialized == true ? true : false : part?.PartSerialized,
      "DeliveryNumber": Method == "GSX" ? part?.deliveryNumber : Method == "PartSelect" ? "" : part?.DeliveryNumber,
      "DeliveryDate": Method == "GSX" ? part?.deliveryDate : Method == "PartSelect" ? null : part?.DeliveryDate,
      "DeliveryTrackingNumber": Method == "GSX" ? part?.deliveryTrackingNumber : Method == "PartSelect" ? "" : part?.DeliveryTrackingNumber,
      "KBB": Method == "GSX" ? part?.kbbDeviceDetail?.identifiers?.serial : Method == "PartSelect" ? "" : part?.KBB,
      "KGB": Method == "GSX" ? part?.kgbDeviceDetail?.identifiers?.serial : Method == "PartSelect" ? "" : part?.KGB,
      "SequenceNumber": Method == "GSX" ? part?.sequenceNumber : Method == "PartSelect" ? "0" : part?.SequenceNumber,
      "billable": Method == "GSX" ? part?.billable == true ? true : false : Method == "PartSelect" ? false : part?.billable,
      "ConsignmentStockUsed": Method == "GSX" ? part?.fromConsignedStock == true ? 1 : 0 : Method == "PartSelect" ? 0 : part?.ConsignmentStockUsed == "1" ? 1 : 0,
      "ReturnTrackingNumber": Method == "GSX" ? part?.returnTrackingNumber : Method == "PartSelect" ? "" : part?.ReturnTrackingNumber,
      "ReturnPartReceivedDate": Method == "GSX" ? part?.returnPartReceivedDate : Method == "PartSelect" ? null : part?.ReturnPartReceivedDate,
      "ReturnCarrierCode": Method == "GSX" ? part?.returnCarrierCode : Method == "PartSelect" ? null : part?.ReturnCarrierCode,
      "ReturnCarrierName": Method == "GSX" ? part?.returnCarrierName : Method == "PartSelect" ? null : part?.ReturnCarrierName,
      "ReturnCarrierUrl": Method == "GSX" ? part?.returnCarrierUrl : Method == "PartSelect" ? null : part?.ReturnCarrierUrl,
      "CarrierCode": Method == "GSX" ? part?.carrierCode : Method == "PartSelect" ? null : part?.CarrierCode,
      "CarrierName": Method == "GSX" ? part?.carrierName : Method == "PartSelect" ? null : part?.CarrierName,
      "CarrierUrl": Method == "GSX" ? part?.carrierUrl : Method == "PartSelect" ? null : part?.CarrierUrl,
      "PricingOption": Method == "GSX" ? part?.pricingOption : Method == "PartSelect" ? null : part?.PricingOption,
      "PricingOptionDescription": Method == "GSX" ? part?.pricingOptionDescription : Method == "PartSelect" ? null : part?.PricingOptionDescription,
      "PricingOptionList": Method == "GSX" ? [] : Method == "PartSelect" ? part?.pricingOptions : [],
      "SubType": Method == "GSX" ? part?.subType : Method == "PartSelect" ? null : part?.SubType,
      "RelatedSequenceNumber": Method == "GSX" ? part?.subType : Method == "PartSelect" ? null : part?.RelatedSequenceNumber,
      "SubstitutePartNumber": Method == "GSX" ? part?.substitutePartNumber : Method == "PartSelect" ? null : part?.SubstitutePartNumber
    }
    //objPart.PartSerialized=false
    return objPart;
  }



  ngOnInit(): void {

    var user = glob.getLogedInUser();
    this.checkLocalPermission()
    this.username = user.UserDetails.UserName;
    this.username = this.username.toLowerCase();
    this.isApprover = this.repa.ApprovedBy?.toString()?.toLowerCase() === this.username;
    this.CreateFormGroupObject()
    this.repairview = new RepairMetaData();
    this.getCovarage({ items: [], term: "" });
    this.getReproducibility({ items: [], term: "" });
    this.onSelectComponent({ term: "", items: [] });
    this.onSelectIssue({ term: "", items: [] });
    this.getRepairStatus({ term: "", items: [] });

    if (!(this.GSXCode == undefined || this.GSXCode == null || this.GSXCode == "")) {

      this.getRepairDetails(this.GSXCode);
    }
  }

  onSelectComponent($event) { this.IssuesList = $event.issues; }
  onSelectIssue($event: { term: string; items: any[] }) { }

  coveragehoverFunc(item) {
    console.log("**", item)
    if (item.isCoverage == true) {
      item.isCoverage = false;

    } else {
      item.isCoverage = true;
    }
  }

  IsConsignmentStockUsed(item) {
    var rowno = item.rowno
    item.ConsignmentStockUsed = item.ConsignmentStockUsed == 1 ? 0 : 1
  }

  issueshoverFunc(item) {
    if (item.isCompIssue == true) {
      item.isCompIssue = false;
    } else {
      item.isCompIssue = true;
    }
    this.get_Component_Issue();
  }

  reproducibilityhoverFunc(item) {
    if (item.isReproducibility == true) {
      item.isReproducibility = false;
    } else {
      item.isReproducibility = true;
    }
  }

  getCovarage($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CovarageOption, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log(value);
          this.coverages = value;
        }
      },
      error: (err) => {
        this.coverages = DropDownValue.getBlankObject();
      }
    });
  }

  get_Component_Issue() {
    let searchData = { device: { "id": this.repa.SerialNo1 } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.getComponentIssue(contentRequest).subscribe(
      {
        next: (value) => {
          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          this.ComponentIssueList = response.componentIssues;
          this.ComponentList = this.ComponentIssueList;
        }
      });
  }

  getRepairXml() {

    console.log("++", this.selectedpartlist)
    let rawData = {
      "rows": []
    }
    for (let item of this.selectedpartlist) {
      //var repairVal = this.compIssueForm.value
      rawData.rows.push({
        "row": item
      });
    }

    console.log("rawData", rawData);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
    console.log("xml", xml);
    return xml;
  }

  getReproducibility($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Reproducibility, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log(value);
          this.reproducibility = value;
          console.log("*", this.selectedpartlist)
        }
      },
      error: (err) => {
        this.reproducibility = DropDownValue.getBlankObject();
      }
    });
  }

  getRepairStatus($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RepairStatus, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log(value);
          this.repairStatus = value;
        }
      },
      error: (err) => {
        this.repairStatus = DropDownValue.getBlankObject();
      }
    });
  }

  getRepairEligibility() {
    var Partlist = [];
    for (let item of this.selectedpartlist) {
      Partlist.push({
        "ComponentCode": item.ComponentCode,
        "PartType": item.Type,
        "IssueCode": item.IssueCode,
        "ReproducibilityCode": item.ReproducibilityCode,
        "ConsignmentStockUsed": item.ConsignmentStockUsed,
        "PartCode": item.PartCode,
        "PartUsed": item.PartUsed,
        "PartSerialized": item.PartSerialized,
        "KGB": item.KGB == undefined || item.KGB == null || item.KGB == "" ? null : item.KGB,
        "KBB": item.KBB == undefined || item.KBB == null || item.KBB == "" ? null : item.KBB,
        "CoverageOption": item.CoverageOption,
        "PricingOption": item.PricingOption == null || item.PricingOption == undefined ? null : item.PricingOption.code,
        "ReturnStatusCode": "",
        "isGSXPosted": item.isGSXPosted == null || item.isGSXPosted == undefined ? 0 : item.isGSXPosted == true ? 1 : 0,
        "IsDeleted": item.IsDeleted,
        "sequenceNumber": item.SequenceNumber == "0" || item.SequenceNumber == undefined || item.SequenceNumber == null ? null : +item.SequenceNumber
      });
    };
    var strRepairStatus = this.SelectedRepairStatus == undefined || this.SelectedRepairStatus == null || this.GSXRepairStatus == undefined || this.GSXRepairStatus == null || this.GSXRepairStatus == "" ? null : this.SelectedRepairStatus.RepairStatusCode;
    if (strRepairStatus == null || strRepairStatus == this.GSXRepairStatus) {
      //strRepairStatus=null
    }
    else {
      strRepairStatus = this.SelectedRepairStatus.RepairStatusCode
    }
    var objData = {

      "CaseGUID": this.repa.CaseGUID,
      "repairType": this.repa.DIAG.RepairType,
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0,
      "requestReviewByApple": this.requestReviewByApple == undefined || this.requestReviewByApple == null ? false : this.requestReviewByApple,
      "markComplete": this.markComplete == undefined || this.markComplete == null ? false : strRepairStatus == "SPCM" ? true : this.markComplete,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": this.repairQuestions == null || this.repairQuestions == undefined ? null : this.repairQuestions,
      "repairStatus": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? null : strRepairStatus

    };

    let strRequestData = JSON.stringify(objData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };

    ;

    //return;
    this.spinner.show();
    this.gsxService.RepairEligibility(contentRequest).subscribe(
      {

        next: (value) => {

          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());

          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            //this.toastr.error(this.errorMessage);
            this.spinner.hide();

          }
          else if (!(response.eligibilityDetails.outcome == undefined || response.eligibilityDetails.outcome == null)) {

            let erroraction = "";
            for (let iCtr = 0; iCtr < response.eligibilityDetails.outcome.length; iCtr++) {
              //this.toastr.error(errorMessage1);
              let errorType = "";
              if (!(response.eligibilityDetails.outcome[iCtr].action == undefined)) {
                for (let lCtr = 0; lCtr < response.eligibilityDetails.outcome[iCtr].reasons.length; lCtr++) {
                  let errorType = "";
                  errorType = response.eligibilityDetails.outcome[iCtr].reasons[lCtr].type.toString();

                  for (let mCtr = 0; mCtr < response.eligibilityDetails.outcome[iCtr].reasons[lCtr].messages.length; mCtr++) {
                    var e1 = response.eligibilityDetails.outcome[iCtr].reasons[lCtr].messages[mCtr].description.toString();
                    if (errorType.toUpperCase() == 'WARNING') {
                      this.toastr.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                    }
                    else {
                      this.toastr.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                    }
                  }
                }
              }
            }
            if (response.parts == undefined) {
              this.spinner.hide();
            }
            else {
              for (let item of response.parts) {
                var result = this.selectedpartlist.filter(p => p.PartCode == item.number);
                for (let item1 of result) {
                  item1.billable = item.billable
                  item1.CoverageCode = item.coverageCode
                  item1.CoverageCodeDescription = item.coverageDescription
                }
              }
            }
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
          }
        }
      });

  }

  CheckReviewByApple() {
    // 2 Condition is PartSerialized in repa and 
    console.log("Repa ", this.repa)
    if (this.repa.ProductType == 'NONSERIALIZED' && this.requestReviewByApple == false) {
      return true
    }
    // If single HOLD FOR REVIEW Note present
    let NotesList = []
    if (Array.isArray(this.repa.NOTESLIST.Notes)) {
      for (var item of this.repa?.NOTESLIST?.Notes) {
        if (item.NotesType != "Customer") {
          NotesList.push({
            "NotesGuid": item.NotesGuid,
            "NotesType": item.NotesType,
            "Notes": item.Notes,
            "CreatedBy": item.CreatedBy,
            "CreatedDate": item.CreatedDate,
            "CaseID": item.CaseID
          })
        }
      }
    }
    else {
      NotesList.push(this.repa.NOTESLIST.Notes)
    }
    if (NotesList.some(item => item.NotesType == 'Hold For Review')) {
      return true
    }
    return false
  }

  SaveForLater() {

    var isGsxPosted = this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0;
    if (isGsxPosted == 0) {

      let isReviewByApple = this.CheckReviewByApple()
      if (isReviewByApple == true) {
        if (this.requestReviewByApple != true) {
          this.toastr.error("Please Check Review By Apple!")
          return
        }
      }
    }

    var Partlist = [];
    for (let item of this.selectedpartlist) {
      Partlist.push({
        "ComponentCode": item.ComponentCode,
        "PartType": item.Type,
        "IssueCode": item.IssueCode,
        "ReproducibilityCode": item.ReproducibilityCode,
        "ConsignmentStockUsed": item.ConsignmentStockUsed,
        "PartCode": item.PartCode,
        "PartUsed": item.PartUsed,
        "PartSerialized": item.PartSerialized,
        "KGB": item.KGB == undefined || item.KGB == null || item.KGB == "" ? null : item.KGB,
        "KBB": item.KBB == undefined || item.KBB == null || item.KBB == "" ? null : item.KBB,
        "CoverageOption": item.CoverageOption,
        "PricingOption": item.PricingOption == null || item.PricingOption == undefined ? null : item.PricingOption.code,
        "ReturnStatusCode": "",
        "isGSXPosted": item.isGSXPosted == null || item.isGSXPosted == undefined ? 0 : item.isGSXPosted == true ? 1 : 0,
        "IsDeleted": item.IsDeleted,
        "sequenceNumber": item.SequenceNumber == "0" || item.SequenceNumber == undefined || item.SequenceNumber == null ? null : +item.SequenceNumber

      });
    };
    var strRepairStatus = this.SelectedRepairStatus == undefined || this.SelectedRepairStatus == null || this.GSXRepairStatus == undefined || this.GSXRepairStatus == null || this.GSXRepairStatus == "" ? null : this.SelectedRepairStatus.RepairStatusCode;
    if (strRepairStatus == null || strRepairStatus == this.GSXRepairStatus) {
      strRepairStatus = null
    }
    else {
      strRepairStatus = this.SelectedRepairStatus.RepairStatusCode
    }
    var objData = {

      "CaseGUID": this.repa.CaseGUID,
      "repairType": this.repa.DIAG.RepairType,
      "repairClassification": this.repa.DIAG.SubmissionType,
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0,
      "requestReviewByApple": this.requestReviewByApple == undefined || this.requestReviewByApple == null ? false : this.requestReviewByApple,
      "markComplete": this.markComplete == undefined || this.markComplete == null ? false : strRepairStatus == "SPCM" ? true : this.markComplete,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": this.repairQuestions == null || this.repairQuestions == undefined ? null : this.repairQuestions,
      "repairStatus": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? null : strRepairStatus
    };

    let strRequestData = JSON.stringify(objData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    // **************************************************************
    // TODO


    this.spinner.show();
    this.gsxService.SaveForLaterRepair(contentRequest).subscribe(
      {
        next: (value) => {
          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            //this.toastr.error(this.errorMessage);
            this.spinner.hide();

          }
          else if (!(response.outcome == undefined || response.outcome == null)) {

            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            //this.toastr.error(errorMessage1);
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              //this.toastr.error(errorMessage1);
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toastr.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toastr.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }

            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              this.getRepairDetails(repairid);
            }
          }
          else {
            var repairid = response.repairId;
            this.getRepairDetails(repairid);
          }
        }
      });
  }

  // SaveToPartConstraint() {
  //   this.spinner.show();
  //   let newGuid = uuidv4();
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "SavePartConstraint"
  //   });
  //   requestData.push({
  //     "Key": "HoldGuid",
  //     "Value": newGuid
  //   });
  //   requestData.push({
  //     "Key": "Notes",
  //     "Value":  this.PartConstraintNotes
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "CaseId",
  //     "Value": this.repa.CaseId
  //   });
  //   requestData.push({
  //     "Key": "CaseGUID",
  //     "Value": this.repa.CaseGUID
  //   });
  //   console.log("Before Notes ",requestData);
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   // TODO 
  //   alert("Under UAT!")
  //   return
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {

  //         let response = JSON.parse(value.toString());
  //         console.log("Response ", response);
  //         if (response.ReturnCode == '0') {
  //           var getval = JSON.parse(response.ExtraData);
  //           this.spinner.hide()
  //           this.toastr.success('Submitted Succesfully')
  //           this.HoldUpdated.emit(getval)
  //         }
  //         else {
  //           this.errorMessage = response.ReturnMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString(response.ErrorMessage, (err, result) => {
  //             response['errorMessageJson'] = result;

  //           });
  //         }
  //       },
  //       error: err => {
  //         console.log(err);
  //       }
  //     });


  // }

  SaveToPartConstraint() {

    this.spinner.show();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SavePartConstraint"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "PartConstraintReason",
      "Value": this.PartConstraintNotes == null || this.PartConstraintNotes == undefined ? '' : this.PartConstraintNotes
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    console.log('contentRequest from save constraint ', contentRequest)
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            this.spinner.hide()
            this.PartConstraintStatusChange.emit(getval)
            this.toastr.success('Submitted Succesfully')
            window.location.reload()

          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;

            });
          }
        },
        error: err => {
          console.log(err);
        }
      });


  }
  // RemovePartConstraint()
  // {

  //   const ShouldContinue = confirm("Are you sure? Do you want to continue")
  //   if (ShouldContinue == false ){
  //     return
  //   }

  //   this.spinner.show();
  //   let newGuid = uuidv4();
  //   let requestData = [];
  //   requestData.push({
  //     "Key": "ApiType",
  //     "Value": "SaveRemovePartConstraint"
  //   });
  //   requestData.push({
  //     "Key": "CompanyCode",
  //     "Value": glob.getCompanyCode()
  //   });
  //   requestData.push({
  //     "Key": "CaseId",
  //     "Value": this.repa.CaseId
  //   });
  //   requestData.push({
  //     "Key": "CaseGUID",
  //     "Value": this.repa.CaseGUID
  //   });
  //   console.log("Before Un Hold ",requestData);
  //   let strRequestData = JSON.stringify(requestData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   // TODO 
  //   alert("Under UAT!")
  //   return
  //   this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         this.spinner.hide();

  //         let response = JSON.parse(value.toString());
  //         console.log("Response ", response);
  //         if (response.ReturnCode == '0') {

  //           var getval = JSON.parse(response.ExtraData);
  //           this.JobStatus = getval?.CaseDetail?.JobStatus
  //           console.log("ExtraData ", getval);
  //           this.Un_HoldUpdated.emit(getval?.CaseDetail);
  //         }
  //         else {
  //           this.errorMessage = response.ReturnMessage;
  //           const parser = new xml2js.Parser({ strict: false, trim: true });
  //           parser.parseString(response.ErrorMessage, (err, result) => {
  //             response['errorMessageJson'] = result;
  //           });
  //         }
  //       },
  //       error: err => {
  //         this.spinner.hide();

  //         console.log(err);
  //       }
  //     });

  // }

  RemovePartConstraint() {
    const ShouldContinue = confirm("Are you sure? Do you want to continue")
    if (ShouldContinue == false) {
      return
    }

    this.spinner.show();
    let newGuid = uuidv4();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveRemovePartConstraint"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    console.log("Before  SaveRemovePartConstraint ", requestData);
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };


    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.spinner.hide();


          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            this.spinner.hide()
            this.PartConstraintStatusChange.emit(getval)
            this.toastr.success('Submitted Succesfully')
            window.location.reload()


          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
            });
          }
        },
        error: err => {
          this.spinner.hide();

          console.log(err);
        }
      });

  }

  PostTOGSX() {

    /*if(this.repa?.HandoverFlag == '1'){
      this.toastr.error("Cannot Proceed As the Job is Already Closed...")
      return
    }*/



    var isGsxPosted = this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0;
    if (isGsxPosted == 0) {

      let isReviewByApple = this.CheckReviewByApple()
      if (isReviewByApple == true) {
        if (this.requestReviewByApple != true) {
          this.toastr.error("Please Check Review By Apple!")
          return
        }
      }
    }

    var Partlist = [];
    for (let item of this.selectedpartlist) {
      Partlist.push({
        "ComponentCode": item.ComponentCode,
        "PartType": item.Type,
        "IssueCode": item.IssueCode,
        "ReproducibilityCode": item.ReproducibilityCode,
        "ConsignmentStockUsed": item.ConsignmentStockUsed,
        "PartCode": item.PartCode,
        "PartUsed": item.PartUsed,
        "PartSerialized": item.PartSerialized,
        "KGB": item.KGB == undefined || item.KGB == null || item.KGB == "" ? null : item.KGB,
        "KBB": item.KBB == undefined || item.KBB == null || item.KBB == "" ? null : item.KBB,
        "CoverageOption": item.CoverageOption,
        "PricingOption": item.PricingOption == null || item.PricingOption == undefined ? null : item.PricingOption.code,
        "ReturnStatusCode": "",
        "isGSXPosted": item.isGSXPosted == null || item.isGSXPosted == undefined ? 0 : item.isGSXPosted == true ? 1 : 0,
        "IsDeleted": item.IsDeleted,
        "sequenceNumber": item.SequenceNumber == "0" || item.SequenceNumber == undefined || item.SequenceNumber == null ? null : +item.SequenceNumber

      });
    };
    var strRepairStatus = this.SelectedRepairStatus == undefined || this.SelectedRepairStatus == null || this.GSXRepairStatus == undefined || this.GSXRepairStatus == null || this.GSXRepairStatus == "" ? null : this.SelectedRepairStatus.RepairStatusCode;
    if (strRepairStatus == null || strRepairStatus == this.GSXRepairStatus) {
      strRepairStatus = null
    }
    else {
      strRepairStatus = this.SelectedRepairStatus.RepairStatusCode
    }
    var objData = {

      "CaseGUID": this.repa.CaseGUID,
      "repairType": this.repa.DIAG.RepairType,
      "repairClassification": this.repa.DIAG.SubmissionType,
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0,
      "requestReviewByApple": this.requestReviewByApple == undefined || this.requestReviewByApple == null ? false : this.requestReviewByApple,
      "markComplete": this.markComplete == undefined || this.markComplete == null ? false : strRepairStatus == "SPCM" ? true : this.markComplete,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": this.repairQuestions == null || this.repairQuestions == undefined ? null : this.repairQuestions,
      "repairStatus": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? null : strRepairStatus
    };

    let strRequestData = JSON.stringify(objData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    // **************************************************************
    // TODO


    this.spinner.show();
    this.gsxService.CreateUpdateRepair(contentRequest).subscribe(
      {
        next: (value) => {


          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            //this.toastr.error(this.errorMessage);
            this.spinner.hide();

          }
          else if (!(response.outcome == undefined || response.outcome == null)) {
            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            //this.toastr.error(errorMessage1);
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              //this.toastr.error(errorMessage1);
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toastr.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toastr.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }

            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              //this.onSave(repairid)     
              this.getRepairDetails(repairid);
            }
          }
          else {
            var repairid = response.repairId;
            this.getRepairDetails(repairid);
          }
        }
      });
  }



  onSave(GsxCode) {

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveRepair"
    });

    requestData.push({
      "Key": "ServiceNotificationNumber",
      "Value": this.ServiceNotificationNumber ?? ''
    });

    requestData.push({
      "Key": "SubTotalAmount",
      "Value": this.SubTotalAmount
    });

    requestData.push({
      "Key": "TaxAmount",
      "Value": this.TaxAmount
    });
    requestData.push({
      "Key": "TotalAmount",
      "Value": this.TotalAmount
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "RepairDocType",
      "Value": this.repa.DIAG.RepairType
    });
    requestData.push({
      "Key": "RepairGUID",
      "Value": this.newrepairGuid
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "RepairDocCode",
      "Value": this.RepairDocCode == undefined || this.RepairDocCode == null ? " " : this.RepairDocCode,
    });
    requestData.push({
      "Key": "RepairQuestions",
      "Value": this.repairQuestions == undefined || this.repairQuestions == null ? "" : JSON.stringify(this.repairQuestions),
    });
    requestData.push({
      "Key": "RepairDate",
      "Value": this.RepairDate
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.repa.LocationCode
    });

    requestData.push({
      "Key": "GSXRepairStatus",
      "Value": this.GSXRepairStatus
    });
    requestData.push({
      "Key": "GSXRepairStatusDescription",
      "Value": this.GSXRepairStatusDescription
    });
    requestData.push({
      "Key": "RepairRemark",
      "Value": " "
    });
    requestData.push({
      "Key": "GSXCode",
      "Value": this.GSXCode
    });
    requestData.push({
      "Key": "isGSXPosted",
      "Value": 1
    });
    requestData.push({
      "Key": "TechnicianCode",
      "Value": this.repa.ASGTECH.TechCode
    });
    requestData.push({
      "Key": "RepairDetail",
      "Value": this.getRepairXml()
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.spinner.hide();
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            this.toastr.success("Updated Successfully")
            var data = JSON.parse(response.ExtraData)
            this.RepairUpdated.emit(data)

          }
          else {
            this.spinner.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              console.log("response", response)
              this.toastr.error("")
            });
          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide();
          this.toastr.error(err.toString());
        }
      });
  }


  reproducibilityCode = ''
  reproducibilityDesc = ''
  onReproducibilitySubmit(item) {
    this.reproducibilityhoverFunc(item)
    var rowno = item.rowno;
    //item.reproducibility= this.compIssueForm.controls["reproducibility"+ rowno.toString()].value.TEXT;
    item.ReproducibilityCode = this.compIssueForm.controls["reproducibility" + rowno.toString()].value.Id;
    item.ReproducibilityDescription = this.compIssueForm.controls["reproducibility" + rowno.toString()].value.TEXT;

  }


  onCoverageSubmit(item) {
    this.coveragehoverFunc(item)
    var rowno = item.rowno;
    item.CoverageOption = this.compIssueForm.controls["coverageOption" + rowno.toString()].value.Id;
  }

  onComponentIssuesSubmit(item) {
    this.issueshoverFunc(item)
    var rowno = item.rowno;
    item.ComponentCode = this.compIssueForm.controls["component" + rowno.toString()].value.componentCode;
    item.IssueCode = this.compIssueForm.controls["issues" + rowno.toString()].value.code;
    item.ComponentDescription = this.compIssueForm.controls["component" + rowno.toString()].value.componentDescription;
    item.IssueDescription = this.compIssueForm.controls["issues" + rowno.toString()].value.description;
  }

  updateComponentIssuesSubmit(item) {
    this.issueshoverFunc(item)
    var rowno1 = item.rowno1;
    item.ComponentCode = this.compIssueForm.controls["component" + rowno1.toString()].value.componentCode;
    item.IssueCode = this.compIssueForm.controls["issues" + rowno1.toString()].value.code;
    item.ComponentDescription = this.repairStatusForm.controls["component" + rowno1.toString()].value.componentDescription;
    item.IssueDescription = this.repairStatusForm.controls["issues" + rowno1.toString()].value.description;

  }

  updateCoverageSubmit(item) {
    this.coveragehoverFunc(item)
    var rowno1 = item.rowno1;
    item.CoverageOption = this.repairStatusForm.controls["coverageOption" + rowno1.toString()].value.TEXT;
    item.CoverageDescription = this.repairStatusForm.controls["coverageOption" + rowno1.toString()].value.TEXT;
  }

  updateReproducibilitySubmit(item) {
    this.reproducibilityhoverFunc(item)
    var rowno1 = item.rowno1;
    item.ReproducibilityCode = this.repairStatusForm.controls["reproducibility" + rowno1.toString()].value.TEXT;
    item.ReproducibilityDescription = this.repairStatusForm.controls["reproducibility" + rowno1.toString()].value.TEXT;
  }


  getItemlListXml(rawData: any) {
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    return xml;
  }




  round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  RequestReviewByAppleChange() {
    this.requestReviewByApple = this.compIssueForm.controls["requestReviewByApple"].value

  }

  MarkCompleteChange() {
    this.markComplete = this.compIssueForm.controls["markComplete"].value
    if (this.markComplete == true) {
      for (let item of this.selectedpartlist) {
        if (item.PartSerialized == true) {
          var rowno = item.rowno
          var KGB = this.compIssueForm.controls["KGB" + rowno].value
          if (KGB == undefined || KGB == null || KGB == '') {
            this.toastr.error("KGB Required for PartCode :" + item.PartCode, "Error", { closeButton: true, disableTimeOut: true })
            this.compIssueForm.controls["markComplete"].setValue(false);
          }
        }
      }
    }
  }

  onSaveRejectionNotes($event) {
    this.spinner.show();
    let newNotesGuid = uuidv4();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveNotes"
    });
    requestData.push({
      "Key": "NoteType",
      "Value": 'JobRejection'
    });
    requestData.push({
      "Key": "Notes",
      "Value": $event.notes
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "NotesGuid",
      "Value": newNotesGuid
    });
    requestData.push({
      "Key": "CaseID",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    console.log("Before Notes ", requestData);
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");
            var getval = JSON.parse(response.ExtraData);
            console.log("Event after Rejection ", $event)
            this.spinner.hide()
            this.toastr.success('Submitted Succesfully')
            this.NotesUpdated.emit(getval)
            // alert("Return On")
            this.SubmitRepairReject($event)
          }
          else {

            this.errorMessage = response.ReturnMessage;

            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;

            });
          }
        },
        error: err => {
          console.log(err);
        }
      });

  }

  SubmitRepairReject($event) {

    var notes = $event.notes
    var objData = {
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "CaseGUID": this.repa?.CaseGUID,
      "notes": notes,
      "reviewAction": "REJECTED"
    };
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      "content": strRequestData
    };
    this.spinner.show();
    this.gsxService.AcceptRejectRepair(contentRequest).subscribe(
      {
        next: (value) => {
          // console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            this.spinner.hide();

          }
          else if (!(response.outcome == undefined || response.outcome == null)) {
            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toastr.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toastr.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }
            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              this.getRepairDetails(repairid);

            }
          }
          else {
            var repairid = response.repairId;
            this.getRepairDetails(repairid);
          }
        }
      });

  }

  SubmitRepairHold($event) {
    var notes = $event.notes
    // var objData = {
    //   "CompanyCode": glob.getCompanyCode(),
    //   "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted,
    //   "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
    //   "CaseGUID": this.repa?.CaseGUID,
    //   "notes": notes,
    //   "reviewAction": "REJECTED"
    // };
    // let strRequestData = JSON.stringify(objData);
    // let contentRequest = {
    //   "content": strRequestData
    // };
    this.spinner.show();

    let newGuid = uuidv4();
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveJobHold"
    });
    requestData.push({
      "Key": "HoldGuid",
      "Value": newGuid
    });
    requestData.push({
      "Key": "HoldReasonType",
      "Value": $event.holdType
    });
    requestData.push({
      "Key": "Notes",
      "Value": notes
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    console.log("Before Notes ", requestData);
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    // // TODO 
    // alert("Return ")
    // return
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            var getval = JSON.parse(response.ExtraData);
            this.spinner.hide()
            this.toastr.success('Submitted Succesfully')
            this.HoldUpdated.emit(getval)
          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;

            });
          }
        },
        error: err => {
          console.log(err);
        }
      });


  }

  ApproveLocalAuthorization() {

    let Approver = this.repa.ApprovedBy?.toString()?.toLowerCase();
    if (Approver !== this.username) {
      this.toastr.error('UnAuthorised Access')
      return
    }


    var objData = {
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "CaseGUID": this.repa?.CaseGUID,
      "notes": null,
      "reviewAction": "APPROVED"
    };
    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      "content": strRequestData
    };
    this.spinner.show();
    this.gsxService.AcceptRejectRepair(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            this.spinner.hide();
          }
          else if (!(response.outcome == undefined || response.outcome == null)) {
            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              //this.toastr.error(errorMessage1);
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toastr.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toastr.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }
            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              //this.onSave(repairid)     
              this.updateApprover(repairid);
            }
          }
          else {
            var repairid = response.repairId;
            this.updateApprover(repairid);
          }
        }
      });

  }

  removeSelectedFile(item) {
    let index = this.selectedpartlist.indexOf(item);
    this.selectedpartlist.splice(index, 1);
  }

  removeParts(item) {
    item.IsDeleted = item.IsDeleted == 1 ? 0 : 1;
  }

  deletePartsList(item) {
    if (this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined || this.repa?.REPAIR?.isGSXPosted == 0) {
      this.removeSelectedFile(item)

    } else if (this.repa?.REPAIR?.isGSXPosted == 1) {
      this.removeParts(item)
    }
  }

  openReturnOption(item) {
    this.RepairOptionValue.emit(item.returnOptions)
    this.RepairOption.emit(item)
  }
  UpdateRepairQuestions($event) {
    this.repairQuestions = $event
    console.log("repairQuestions ", this.repairQuestions)
  }

  @Input() ConvertStock
  @Input() StockDOAData
  @Input() DOAData
  @Input() GoodPartReturn

  verifiedPartListCheck($event) {
    this.verifiedPartList = $event
  }

  getRepairQuestionRequestData() {
    ;
    var Partlist = [];
    var repairType = this.repa?.DIAG?.RepairType
    var CoverageOption = this.repa?.DIAG?.BillingOption
    var objData

    for (let item of this.selectedpartlist) {
      if (!(item.Type == 'CNTC' || item.Type == 'SHIP')) {
        if (repairType == "WUMS") {
          Partlist.push({
            "number": item.PartCode,
            "componentIssue": {
              "componentCode": item.ComponentCode,
              "issueCode": item.IssueCode,
              "reproducibility": item.ReproducibilityCode
            }//,
            //"coverageOption": item.CoverageOption
          });

        }
        else {
          Partlist.push({
            "number": item.PartCode,
            "componentIssue": {
              "componentCode": item.ComponentCode,
              "issueCode": item.IssueCode

            },
            "coverageOption": item.CoverageOption
          });

        }

      }
      else {
        Partlist.push({
          "number": item.PartCode
        });


      }
    };
    var ComponentIssueList = [];
    var iCtr = 1

    var diagdetail = [];
    if (Array.isArray(this.repa.DIAG.DIAGLIST.DIAGDETAIL)) {
      diagdetail = this.repa.DIAG.DIAGLIST.DIAGDETAIL;
    }
    else {
      diagdetail.push(this.repa.DIAG.DIAGLIST.DIAGDETAIL);
    }


    for (let item of diagdetail) {
      if (repairType == "WUMS") {

        ComponentIssueList.push({
          "componentCode": item.ComponentCode,
          "issueCode": item.IssueCode,
          "reproducibility": item.ReproducibilityCode,
          "type": "TECH",
          "order": iCtr,
          "priority": iCtr
        });
      }
      else {
        ComponentIssueList.push({
          "componentCode": item.ComponentCode,
          "issueCode": item.IssueCode,
          "type": "TECH",
          "order": iCtr,
          "priority": iCtr
        });

      }
      iCtr = iCtr + 1
    };

    if (repairType == "WUMS") {


      objData = {
        "repairType": repairType,
        "componentIssues": ComponentIssueList,
        "parts": Partlist,
        "coverageOption": CoverageOption,
        "device": {
          "id": this.repa.SerialNo1
        }
      }
    }
    else {
      objData = {
        "repairType": repairType,
        "componentIssues": ComponentIssueList,
        "parts": Partlist,
        "device": {
          "id": this.repa.SerialNo1
        }
      }

    }
    return objData;


  }
  getQuestions(objData) {
    ;
    if (this.repa?.RepairFlag == 1) {
      return;
    }
    this.spinner.show()
    let searchData = objData //{ device:{"id":this.repa?.SerialNo1} };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.getRepairQuestions(contentRequest).subscribe(
      {
        next: (value) => {
          ;

          this.spinner.hide()
          let response = JSON.parse(value.toString());
          console.log("feedback", response);
          if (!(response.errors == undefined || response.errors == null)) {
            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            return;
          }
          else {
            var questions = response.questionDetails;

            if (questions.length > 0) {
              const dialogRef = this.dialog.open(FeedbackComponent, {
                data: questions,
                width: '90%',
                height: '80%'

              });
              dialogRef.afterClosed().subscribe(result => {
                if (result) {

                  this.repairQuestions = result;
                }

              });

            }

          }


        }
      }
    );
  }



  openQuestionPopup() {
    var data = this.getRepairQuestionRequestData();
    this.getQuestions(data);
    ;
  }
  onKeyPress(event: KeyboardEvent, validationType: string, field: string) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const inputFieldName = field
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Comma'];

    if (allowedKeys.includes(key)) {
      return;
    }

    if (['PartConstraintNotes'].includes(inputFieldName || '')) {
      if (!/^[a-zA-Z0-9 ,.]$/.test(key)) {
        event.preventDefault();
        this.toastr.error('Special Characters Not Allowed Except , and .');
        return;
      }
    }
    if (validationType === 'int' && !/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }

    if (validationType === 'alpha' && !/^[a-zA-Z0-9 ,.]$/.test(key)) {
      event.preventDefault();
      return;
    }
  }

  onPaste(event: ClipboardEvent, validationType: string, field: string) {
    const pasteData = event.clipboardData?.getData('text') || '';

    if (field === 'PartConstraintNotes' && !/^[a-zA-Z0-9 ,.]*$/.test(pasteData)) {
      this.toastr.error('You Cannot Paste Content with Special Character');
      event.preventDefault();
      return
    }
  }


  UpdateRepairStatusLogs(Status: any) {

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "UpdateRepairStatusLogs"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });

    requestData.push({
      "Key": "RepairHeaderGUID",
      "Value": this.repa?.RepairGUID ?? "00000000-0000-0000-0000-000000000000"
    });
    requestData.push({
      "Key": "CaseGUID",
      "Value": this.repa?.CaseGUID ?? "00000000-0000-0000-0000-000000000000"
    });
    requestData.push({
      "Key": "Status",
      "Value": Status ?? ''
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          this.spinner.hide();
          let response = JSON.parse(value.toString());
          console.log("Response ", response);
          if (response.ReturnCode == '0') {
            this.toastr.success("Updated Successfully")
            var data = JSON.parse(response.ExtraData)

          }
          else {
            this.spinner.hide();
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              console.log("response", response)
              this.toastr.error("")
            });
          }
        },
        error: err => {
          console.log(err);
          this.spinner.hide();
          this.toastr.error(err.toString());
        }
      });
  }




}
