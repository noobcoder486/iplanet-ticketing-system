import { Component, EventEmitter, Input, OnChanges, ElementRef, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { v4 as uuidv4 } from 'uuid';
import * as glob from "../../../config/global";
import { DignosisMetaData } from './Diagnosis.metadeta';
import xml2js from 'xml2js';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute } from '@angular/router';
import { CaseDetail, Diag } from '../repair-process.metadata';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeedbackComponent } from '../feedback/feedback.component';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css']
})

export class DiagnosisComponent implements OnInit, OnChanges {

  isDiagEdit: boolean = false
  isDiagDisplay: boolean = false
  isCheckBox: boolean = false;
  isDiagUpdate: boolean = false;
  updateButton: boolean = false;
  objDiagnosis: DignosisMetaData;
  BillableRepair: string;
  errorMessage: string;
  isComponentIssuesPop: boolean = false
  SerialNo2;
  typeSelected = 'ball-clip-rotate';
  NoOfDays: DropDownValue = DropDownValue.getBlankObject();
  RepairType: DropDownValue = DropDownValue.getBlankObject();
  BillingOption: DropDownValue = DropDownValue.getBlankObject();
  Component: DropDownValue = DropDownValue.getBlankObject();
  Issue: DropDownValue = DropDownValue.getBlankObject();
  DiagStatus: DropDownValue = this.getBlankObject();
  SubmissionType: DropDownValue = this.getBlankObject();
  SNRepairType: DropDownValue = this.getBlankObject();
  PaymentTerms: DropDownValue = this.getBlankObject();
  selectedDate: string = ''
  selectedTime: string = '';
  selectedFile: File;
  ArrayOfSelectedFile = new Array<string>();
  diagForm: FormGroup;
  ComponentIssueList: any[] = [];
  ComponentList: any[] = [];
  IssuesList: any[] = [];
  DIAG: any[] = [];
  form: FormGroup;
  @ViewChild('picker') datepicker!: MatDatepicker<any>;
  @ViewChild('timeInput') timeInput!: ElementRef;
  formattedDate: string = '';
  @ViewChild('attachments') attachment: any;
  FileUpload = { filepath: '', message: '' }
  compissuehoverguid: String;
  addDiagnosisForm: FormGroup;
  imagePreviewSrc: string | ArrayBuffer | null | undefined = '';
  isImageSelected: boolean = false;
  selectedFiles: any;
  componentIssuesStore = [];
  GSXCode: string = '';


  @Input() repa: CaseDetail;
  @Input() compoissuelist: any[];
  @Output() openComponentIssuePopupEvent = new EventEmitter<any>();
  @Output() DiagUpdated = new EventEmitter<any>();
  selectedpartlist: any[];
  repairQuestions: any;



  @Output() openResetDiagnosisPopupComponent = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private activatedRoute: ActivatedRoute,
    private datepipe: DatePipe,
    private toasty: ToastrService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) {
    this.diagForm = this.fb.group({
      component: [null, [Validators.required]],
      issues: [null, [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repa']) {
      if (this.repa?.DIAG != null && this.repa?.DIAG != undefined) {
        this.objDiagnosis.DiagnosisGUID = this.repa?.DIAG?.DiagnosisGUID;
        this.objDiagnosis.RepairType = this.repa?.DIAG?.RepairType;
        this.objDiagnosis.DiagnosisCode = this.repa?.DIAG?.DiagnosisCode;
        this.objDiagnosis.DiagnosisDate = this.repa?.DIAG?.DiagnosisDate;
        this.objDiagnosis.ServiceNRepairType = this.repa?.DIAG?.ServiceNRepairType;
        this.objDiagnosis.RepairTypeDesc = this.repa?.DIAG?.RepairTypeDesc;
        this.objDiagnosis.BillingOption = this.repa?.DIAG?.BillingOption;
        this.objDiagnosis.BillingOptionDesc = this.repa?.DIAG?.BillingOptionDescription;
        this.objDiagnosis.SubmissionType = this.repa?.DIAG?.SubmissionType;
        this.objDiagnosis.SubmissionTypeDesc = this.repa?.DIAG?.SubmissionTypeDesc;
        this.objDiagnosis.DiagStatus = this.repa?.DIAG?.DiagnosisStatus;
        this.objDiagnosis.LaborCovered = this.repa?.DIAG?.LaborCovered;
        this.objDiagnosis.PartsCovered = this.repa?.DIAG?.PartsCovered;
        this.objDiagnosis.NoOfDays = this.repa?.DIAG?.NoOfDaysToComplete;
        // this.objDiagnosis.CompanyName = this.repa?.DIAG?.CompanyName;
        this.objDiagnosis.NoOfDaysDesc = this.repa?.DIAG?.NoOfDaysToCompleteDesc;
        this.objDiagnosis.BillableRepair = this.repa?.DIAG?.BillableRepair == 1 ? true : false;
        this.objDiagnosis.PaymentTerms = this.repa?.DIAG?.PaymentTerms
        this.isCheckBox = this.repa?.DIAG?.BillableRepair == 1 ? true : false;

        this.diagForm = this.fb.group({
          RepairType: [this.objDiagnosis.RepairType, Validators.required],
          SNRepairType: [this.objDiagnosis.ServiceNRepairType],
          BillingOption: [this.objDiagnosis.BillingOption, Validators.required],
          NoOfDays: [this.objDiagnosis.NoOfDays, Validators.required],
          // CompanyName:[this.objDiagnosis.CompanyName],
          PaymentTerms: [this.objDiagnosis.PaymentTerms],
          billableRepair: [this.objDiagnosis.BillableRepair],
          SubmissionType: [this.objDiagnosis.SubmissionType]
        });
        this.objDiagnosis.SelectedComponentIssue = [];
        if (this.repa?.DIAG?.DIAGLIST != null && this.repa?.DIAG?.DIAGLIST != undefined) {
          if (Array.isArray(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL)) {
            for (var item of this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL) {
              this.objDiagnosis.SelectedComponentIssue.push({
                "DiagnosisDetailGUID": item.DiagnosisDetailGUID,
                "ComponentCode": item.ComponentCode,
                "ComponentDesc": item.ComponentDesc,
                "IssueCode": item.IssueCode,
                "IssueDesc": item.IssueDesc,
                "ReproducibilityCode": item.ReproducibilityCode,
                "ReproducibilityDescription": item.ReproducibilityDescription,
                "IsDeleted": item.IsDeleted
              })
            }

          }
          else {
            var lstDiagDetail = [];
            lstDiagDetail.push(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL);
            this.objDiagnosis.SelectedComponentIssue.push({
              "DiagnosisDetailGUID": lstDiagDetail[0].DiagnosisDetailGUID,
              "ComponentCode": lstDiagDetail[0].ComponentCode,
              "ComponentDesc": lstDiagDetail[0].ComponentDesc,
              "IssueCode": lstDiagDetail[0].IssueCode,
              "IssueDesc": lstDiagDetail[0].IssueDesc,
              "ReproducibilityCode": lstDiagDetail[0].ReproducibilityCode,
              "ReproducibilityDescription": lstDiagDetail[0].ReproducibilityDescription,
              "IsDeleted": lstDiagDetail[0].IsDeleted
            })
          }
        }

      }

      this.objDiagnosis.SelectedComponentIssue =
    this.objDiagnosis.SelectedComponentIssue.filter(item =>
    item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != ''
  )



    }
    if (changes['compoissuelist']) {
      if (this.compoissuelist != null && this.compoissuelist != undefined) {
        var object4 = this.compoissuelist[0];
        if (this.validateComponents(object4)) {
          this.objDiagnosis.SelectedComponentIssue.push(object4);
        }
      }
    }

    if (this.objDiagnosis.DiagStatus == 'RELEASED') {
      this.editDiagForm();
      this.isDiagUpdate = true;
    }


    this.objDiagnosis.SelectedComponentIssue =
    this.objDiagnosis.SelectedComponentIssue.filter(item =>
    item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != ''
    
  )

  
  }

  ngOnInit(): void {
    this.repa;
    this.objDiagnosis = new DignosisMetaData();
    this.diagForm = this.fb.group({
      RepairType: [null, Validators.required],
      SNRepairType: [],
      BillingOption: [null, Validators.required],
      component: [null, Validators.required],
      issues: [null, Validators.required],
      SelectImage: [null, Validators.required],
      NoOfDays: [null, Validators.required],
      // CompanyName: [''],
      SubmissionType: [null, Validators.required],
      billableRepair: [],
      PaymentTerms: [],
    });
    
    // this.getRepairDetails('G639049142')

    if (this.repa.JobType == 'SNR') {
      this.isCheckBoxFunc()
      this.diagForm.controls["PaymentTerms"].setValue("ADV100");
    }

    this.get_Component_Issue();
    this.onSelectComponent({ term: "", items: [] });
    this.onSelectIssue({ term: "", items: [] })
    this.onRepairType({ term: "", items: [] });
    this.onSNRepairType({ term: "", items: [] });
    this.onDiagStatus1({ term: "", items: [] });
    this.onBillingOption({ term: "", items: [] });
    this.onNoOfDays({ term: "", items: [] });
    this.onPaymentTerms({ term: "", item: [] });
    this.onSubmissionType({ term: "", item: [] });
    this.setDataFunction()
    if (this.objDiagnosis.DiagStatus == 'RELEASED') {
      this.editDiagForm();
      this.isDiagEdit = true;
      this.isDiagUpdate = true;
    }
    const dateString = this.repa.DIAG.SubmissionDateTime.toString()
    const date = new Date(dateString + 'Z');
    this.selectedDate = date.toISOString().slice(0, 10);
    this.selectedTime = dateString.split('T')[1].substring(0, 5);


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
          
        }

      })
  };


  showPreview(event: Event) {
    let selectedFile = (event.target as HTMLInputElement).files?.item(0)

    if (selectedFile) {
      if (["image/jpeg", "image/png", "image/svg+xml"].includes(selectedFile.type)) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(selectedFile);

        fileReader.addEventListener('load', (event) => {
          this.imagePreviewSrc = event.target?.result;
          this.isImageSelected = true
        })
      }
    } else {
      this.isImageSelected = false
    }
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }


  async OnFileUploadClick(event: any) {
    for (var i = 0; i <= event.target.files.length - 1; i++) {
      let fileToUpload = <File>event.target.files[0];
      // const formData = new FormData();
      // formData.append('file', fileToUpload, fileToUpload.name);
      try {
        const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, fileToUpload.name)

        // this.dynamicService.uploadFileToS3Local(fileToUpload, fileToUpload.name).subscribe(
        //   {
        //     next: (value) => {

        let uploadedimage: any;
        uploadedimage = value;
        this.objDiagnosis.UploadedImageList.push({
          "AttachmentGUID": uuidv4(),
          "dbPath": uploadedimage?.dbPath,
          "AttachmentFile": uploadedimage?.dbPath, // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath,
          "CloudFlag": "1"
        })

        //   },
        //   error: (err) => {
        //     this.spinner.hide()
        //     this.toasty.error(err)
        //   },
        // });
      }
      catch (err) {
        this.toasty.error(err.message || err);
      }
    }
  }

  getComponentIssueXml() {
    let rawData = {
      "rows": []
    }
    for (let item of this.objDiagnosis.SelectedComponentIssue) {
      if(item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != undefined && item.DiagnosisDetailGUID != '')
      {
      rawData.rows.push({
        "row": {
          "DiagnosisDetailGUID": item.DiagnosisDetailGUID,
          "ComponentCode": item.ComponentCode,
          "ComponentDesc": item.ComponentDesc,
          "IssueCode": item.IssueCode,
          "IssueDesc": item.IssueDesc,
          "ReproducibilityCode": item.ReproducibilityCode,
          "ReproducibilityDescription": item.ReproducibilityDescription,
          "isDeleted": item.isDeleted
        }
      })
    }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    return xml;
  }

  getImageDetailsXml() {
    let rowsDataValue = {
      "rows": []
    }
    for (let StoreImage of this.objDiagnosis.UploadedImageList) {
      rowsDataValue.rows.push({
        "row": {
          "AttachmentFile": StoreImage.dbPath,
          "CloudFlag": "1"
        }
      })
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rowsDataValue);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    return xml;
  }


  validateComponents(com: any) {
    for (let item of this.objDiagnosis.SelectedComponentIssue) {
      if (item.ComponentCode == com.ComponentCode && item.IssueCode == com.IssueCode) {
        this.toasty.error("Component & Issues already exists")
        return false;
      }
    }
    return true;
  }

  editDiagForm() {


    if (this.isDiagEdit == true) {
      this.isDiagEdit = false;
    } else {
      this.isDiagEdit = true;
    }
  }


  removeComponent(item) {

    item.isDeleted = 1;
    this.updateComponentIssueXml()
  }

  updateComponentIssueXml() {
    let rawData = {
      "rows": []
    }
    for (let item of this.objDiagnosis.SelectedComponentIssue) {

      if(item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != undefined && item.DiagnosisDetailGUID != '')
      {
      rawData.rows.push({
        "row": {
          "DiagnosisDetailGUID": item.DiagnosisDetailGUID,
          "ComponentCode": item.ComponentCode,
          "ComponentDesc": item.ComponentDesc,
          "IssueCode": item.IssueCode,
          "IssueDesc": item.IssueDesc,
          "ReproducibilityCode": item.ReproducibilityCode,
          "ReproducibilityDescription": item.ReproducibilityDescription,
          "isDeleted": item.isDeleted
        }
      })
    }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    xml = xml.split(' ').join('')
    return xml;
  }

  isCheckBoxFunc() {
    
    if (this.isCheckBox == true) {
      this.isCheckBox = false;
      this.diagForm.controls["PaymentTerms"].setValue("");
      this.BillableRepair = '0';
    } else {
      this.isCheckBox = true;
      this.BillableRepair = '1';
    }
  }

  updateDate(dateString: string) {
    this.selectedDate = dateString;
  }



  PostTOGSX() {

      this.objDiagnosis.SelectedComponentIssue =
    this.objDiagnosis.SelectedComponentIssue.filter(item =>
    item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != ''
  )
    
    var componentIssue = []
    let iCtr = 0
    for (let item of this.objDiagnosis.SelectedComponentIssue) {
     
      if (iCtr == 0) {
        componentIssue.push({
          "componentCode": item.ComponentCode,
          "priority": iCtr + 1,
          "type": "CUST",
          "issueCode": item.IssueCode,
          "order": iCtr + 1
        })

      }

      componentIssue.push({
        "componentCode": item.ComponentCode,
        "priority": iCtr + 1,
        "type": "TECH",
        "issueCode": item.IssueCode,
        "order": iCtr + 1
      })
      iCtr += 1;
    }
    var objData = {
      "CaseGUID": this.repa.CaseGUID,
      "RepairType": this.diagForm.controls["RepairType"].value,
      "repairClassification": this.diagForm.controls["SubmissionType"].value,
      "CompanyCode": glob.getCompanyCode(),
      "SubmissionDateTime": this.selectedDate + ' ' + this.selectedTime,
      "serviceNonRepairType": this.diagForm.controls["SNRepairType"].value == null || this.diagForm.controls["SNRepairType"].value == undefined ? '' : this.diagForm.controls["SNRepairType"].value,
      "repairQuestions": this.repairQuestions == null || this.repairQuestions == undefined ? null : this.repairQuestions,
      "isGSXPosted": 0,
      "GSXCode": "",
      "componentissue": componentIssue

    };

    let strRequestData = JSON.stringify(objData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("SVNR Data ", objData)
    console.log("SVNR contentRequest ", contentRequest)

    this.spinner.show();
    this.gsxService.CreateNRepair(contentRequest).subscribe(
      {
        next: (value) => {
          

          let response = JSON.parse(value.toString());
          console.log("Repsonse ", response)
          if (!(response.errors == undefined || response.errors == null)) {

            this.errorMessage = "";
            for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
              this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
              this.toasty.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
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
                  this.toasty.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toasty.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }

            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              this.GSXCode = repairid
              this.SaveDiagnosis()
            }
          }

          else {
            var repairid = response.repairId;
            this.GSXCode = repairid
            this.SaveDiagnosis()
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err)
        }
      });

  }


  onSubmit() {

    this.dynamicService.validateAllFormFields(this.diagForm);
    let object = {
      "component": this.diagForm.get("component").value,
      "issues": this.diagForm.get("issues").value
    };
    if (this.diagForm.valid) {
      if (this.validateComponents(object)) {

        var object1 = {
          "DiagnosisDetailGUID": uuidv4(),
          "ComponentCode": object.component.componentCode,
          "ComponentDesc": object.component.componentDescription,
          "IssueCode": object.issues.code,
          "IssueDesc": object.issues.description,
          "isDeleted": 0
        }
        this.objDiagnosis.SelectedComponentIssue.push(object1);


        this.diagForm.reset();
      }
      else {
        this.toasty.error("Component and defect already exist.");
        this.diagForm.reset();
      }
    }
    else {
      this.toasty.error("Please select required field");
    }


    var object1 = {
      "DiagnosisDetailGUID": uuidv4(),
      "ComponentCode": object.component.componentCode,
      "ComponentDesc": object.component.componentDescription,
      "IssueCode": object.issues.code,
      "IssueDesc": object.issues.description,
      "isDeleted": 0
    }
    this.objDiagnosis.SelectedComponentIssue.push(object1);
     
    this.objDiagnosis.SelectedComponentIssue =
    this.objDiagnosis.SelectedComponentIssue.filter(item =>
    item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != ''
  )

  }

  onDiagStatus($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DiagStatus, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.DiagStatus = value;
        }
      },
      error: (err) => {
        this.DiagStatus = DropDownValue.getBlankObject();
      }

    });
  }

  onSubmissionType($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.SubmissionType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.SubmissionType = value;
        }
      },
      error: (err) => {
        this.SubmissionType = DropDownValue.getBlankObject();
      }

    });
  }

  onPaymentTerms($event: { term: string; item: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.PaymentTerm, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.PaymentTerms = value;
        }
      },
      error: (err) => {
        this.PaymentTerms = DropDownValue.getBlankObject();
      }

    });
  }

  onBillingOption($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CovarageOption, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.BillingOption = value;
        }
      },
      error: (err) => {
        this.BillingOption = this.getBlankObject();
      }
    });
  }

  onNoOfDays($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.NoOfDays, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.NoOfDays = value;
          if (this.repa.JobType == 'SNR') {
            let snrObj = this.NoOfDays.Data.find(item => item.Id == '0')
            this.diagForm.controls['NoOfDays'].setValue(snrObj.Id);
          }
        }
      },
      error: (err) => {
        this.NoOfDays = this.getBlankObject();
      }
    });
  }
  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }


  onSelectComponent($event) {
    this.IssuesList = $event.issues;
  }

  onSelectIssue($event: { term: string; items: any[] }) {
  }

  get_Component_Issue() {
    let searchData = { device: { "id": this.repa?.SerialNo1 } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.getComponentIssue(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          this.ComponentIssueList = response.componentIssues;
          this.ComponentList = this.ComponentIssueList;
        }
      });
  }

  onTimeInput(event: any) {
    if (this.timeInput && this.timeInput.nativeElement) {
      this.selectedTime = this.timeInput.nativeElement.value;
    }
  }


  SaveDiagnosis() {

    /*if(this.repa?.HandoverFlag == '1'){
      this.toasty.error("Cannot Proceed As the Job is Already Closed...")
      return
    }*/


    this.spinner.show()
    Object.keys(this.diagForm.controls).forEach(field => {
      if (field != 'SNRepairType') {
        let control = this.diagForm.get(field).value
        if (control == null || control == undefined) {
          this.toasty.error(field + " Cannot be Empty")
        }
      }
    })
    const diagform = this.diagForm.value
    if (this.timeInput && this.timeInput.nativeElement) {
      this.selectedTime = this.timeInput.nativeElement.value;
    }
    let newDiagGuid = uuidv4();
    if (this.isDiagUpdate == true) {
      newDiagGuid = this.objDiagnosis.DiagnosisGUID;
    }

    let RequestAddProduct = [];
    if (this.diagForm.valid) {
      RequestAddProduct.push({
        "Key": "ApiType",
        "Value": "SaveDiagnosis"
      });
      RequestAddProduct.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });

      RequestAddProduct.push({
        "Key": "DiagnosisDate",
        "Value": this.objDiagnosis.DiagnosisDate
      });
      RequestAddProduct.push({
        "Key": "CaseGUID",
        "Value": this.repa.CaseGUID
      });
      if (this.isDiagUpdate == true) {
        RequestAddProduct.push({
          "Key": "DiagnosisCode",
          "Value": this.objDiagnosis.DiagnosisCode
        });

      }
      else {
        RequestAddProduct.push({
          "Key": "DiagnosisCode",
          "Value": "New"
        });

      }

      RequestAddProduct.push({
        "Key": "GSXCode",
        "Value": this.GSXCode
      });
      RequestAddProduct.push({
        "Key": "RepairType",
        "Value": diagform.RepairType,
      });
      RequestAddProduct.push({
        "Key": "ServiceNRepairType",
        "Value": diagform.SNRepairType == null || diagform.SNRepairType == undefined ? '' : diagform.SNRepairType,
      });
      RequestAddProduct.push({
        "Key": "DiagnosisStatus",
        "Value": "RELEASED",
      });
      RequestAddProduct.push({
        "Key": "BillingOption",
        "Value": diagform.BillingOption,
      });
      RequestAddProduct.push({
        "Key": "SubmissionType",
        "Value": diagform.SubmissionType,
      });
      RequestAddProduct.push({
        "Key": "SubmissionDateTime",
        "Value": this.selectedDate + ' ' + this.selectedTime
      })
      RequestAddProduct.push({
        "Key": "Remark",
        "Value": " ",
      });
      RequestAddProduct.push({
        "Key": "PartsCovered",
        "Value": this.repa?.PartCovered == null || this.repa?.PartCovered == undefined ? 0 : this.repa?.PartCovered
      });
      RequestAddProduct.push({
        "Key": "LaborCovered",
        "Value": this.repa?.LaborCovered == null || this.repa?.LaborCovered == undefined ? 0 : this.repa?.LaborCovered,
      });
      RequestAddProduct.push({
        "Key": "DiagnosisGUID",
        "Value": newDiagGuid,
      });

      RequestAddProduct.push({
        "Key": "BillableRepair",
        "Value": this.BillableRepair,

      });
      RequestAddProduct.push({
        "Key": "NoOfDaysToComplete",
        "Value": diagform.NoOfDays,
      });
      // RequestAddProduct.push({
      //   "Key": "CompanyName",
      //   "Value": diagform.CompanyName,
      // });  

      RequestAddProduct.push({
        "Key": "PaymentTerms",
        "Value": diagform.PaymentTerms == null || diagform.PaymentTerms == undefined ? "" : diagform.PaymentTerms,
      });

      RequestAddProduct.push({
        "Key": "Attachment",
        "Value": this.getImageDetailsXml()
      });

      RequestAddProduct.push({
        "Key": "DiagnosisDetail",
        "Value": this.getComponentIssueXml(),
      });
      let strRequestData = JSON.stringify(RequestAddProduct);
      let contentRequest = {
        "content": strRequestData
      };
           console.log('RequestAddProduct', RequestAddProduct)

       
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {

            let response = JSON.parse(value.toString());
            console.log("Repsonse Diag", response)
            if (response.ReturnCode == '0') {
              var data = JSON.parse(response.ExtraData)
              this.toasty.success("Form Submitted Succesfully");
              this.updateButton = true
              this.DiagUpdated.emit(data)
              this.spinner.hide()
            }
            else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
                this.spinner.hide()
              });
            }

          },
          error: err => {
            console.log(err);
            this.toasty.error(err)
            this.spinner.hide()
          }
        });
    } else {
      for (const controlName in this.diagForm.controls) {
        if (this.diagForm.controls.hasOwnProperty(controlName)) {
          const control = this.diagForm.controls[controlName];

          if (control.invalid) {
            console.log(`Field '${controlName}' is invalid:`, control.errors);
          }
        }
      }
      this.spinner.hide()
    }

  }



  onRepairType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.RepairType, $event.term, {

    }).subscribe({
      next: (value) => {

        if (value != null) {
          
          this.RepairType = value;
          if (this.repa.JobType == 'SNR') {
            let snrObj = this.RepairType.Data.find(item => item.Id == 'SVNR')
            this.diagForm.controls['RepairType'].setValue(snrObj.Id);
          }
          if (this.repa?.TableReplacement == "YES") {
            console.log('this.repa?.TableReplacement == "YES"', this.RepairType?.Data)
            this.RepairType.Data = this.RepairType.Data.filter(x => x.Id == 'CIN');
          }
        }
      },
      error: (err) => {
        this.RepairType = this.getBlankObject();
      }
    });
  }

  onSNRepairType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.ServiceNonRepairType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.SNRepairType = value;
        }
      },
      error: (err) => {
        this.SNRepairType = this.getBlankObject();
      }
    });
  }

  onDiagStatus1($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.DiagStatus, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.DiagStatus = value;
        }
      },
      error: (err) => {
        this.DiagStatus = this.getBlankObject();
      }
    });

  }



  UpdateDiagnosis() {

    /*if(this.repa?.HandoverFlag == '1'){
      this.toasty.error("Cannot Proceed As the Job is Already Closed...")
      return
    }*/

    this.spinner.show()
    const diagform = this.diagForm.value
    if (this.timeInput && this.timeInput.nativeElement) {
      this.selectedTime = this.timeInput.nativeElement.value;
    }
    let RequestAddProduct = [];
    RequestAddProduct.push({
      "Key": "ApiType",
      "Value": "SaveDiagnosis"
    });
    RequestAddProduct.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    });

    RequestAddProduct.push({
      "Key": "DiagnosisDate",
      "Value": this.objDiagnosis.DiagnosisDate
    });
    RequestAddProduct.push({
      "Key": "CaseGUID",
      "Value": this.repa.CaseGUID
    });
    RequestAddProduct.push({
      "Key": "DiagnosisCode",
      "Value": this.objDiagnosis.DiagnosisCode
    });
    RequestAddProduct.push({
      "Key": "GSXCode",
      "Value": this.GSXCode
    });
    RequestAddProduct.push({
      "Key": "RepairType",
      "Value": diagform.RepairType
    });
    RequestAddProduct.push({
      "Key": "ServiceNRepairType",
      "Value": diagform.SNRepairType == null || diagform.SNRepairType == undefined ? '' : diagform.SNRepairType
    });
    RequestAddProduct.push({
      "Key": "DiagnosisStatus",
      "Value": "RELEASED",
    });

    RequestAddProduct.push({
      "Key": "BillingOption",
      "Value": diagform.BillingOption,
    });
    RequestAddProduct.push({
      "Key": "SubmissionType",
      "Value": diagform.SubmissionType,
    });
    RequestAddProduct.push({
      "Key": "SubmissionDateTime",
      "Value": this.selectedDate + ' ' + this.selectedTime
    })
    RequestAddProduct.push({
      "Key": "Remark",
      "Value": " ",
    });
    RequestAddProduct.push({
      "Key": "PartsCovered",
      "Value": this.repa?.PartCovered == null || this.repa?.PartCovered == undefined ? 0 : this.repa?.PartCovered,
    });
    RequestAddProduct.push({
      "Key": "DiagnosisGUID",
      "Value": this.objDiagnosis.DiagnosisGUID,
    });

    RequestAddProduct.push({
      "Key": "LaborCovered",
      "Value": this.repa?.LaborCovered == null || this.repa?.LaborCovered == undefined ? 0 : this.repa?.LaborCovered,

    });
    RequestAddProduct.push({
      "Key": "NoOfDaysToComplete",
      "Value": diagform.NoOfDays,
    });
    // RequestAddProduct.push({
    //   "Key": "CompanyName",
    //   "Value": diagform.CompanyName,
    // });

    RequestAddProduct.push({
      "Key": "BillableRepair",
      "Value": diagform.billableRepair == true ? "1" : "0",
    });
    RequestAddProduct.push({
      "Key": "PaymentTerms",
      "Value": diagform.PaymentTerms,

    });
    RequestAddProduct.push({
      "Key": "Attachment",
      "Value": this.getImageDetailsXml()

    });
    RequestAddProduct.push({
      "Key": "DiagnosisDetail",
      "Value": this.updateComponentIssueXml(),
    });

    let strRequestData = JSON.stringify(RequestAddProduct);
    let contentRequest = {
      "content": strRequestData
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            var data = JSON.parse(response.ExtraData)
            this.toasty.success("Form Submitted Succesfully");
            this.DiagUpdated.emit(data)
            this.spinner.hide();
            this.editDiagForm();
          }
          else {

            this.errorMessage = response.ReturnMessage;

            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.spinner.hide();

            });
          }

        },
        error: err => {
          console.log(err);
          this.toasty.error(err);
          this.spinner.hide();
        }
      });

  }

  setDataFunction() {

    if (this.repa != null && this.repa != undefined) {
      this.objDiagnosis.DiagnosisGUID = this.repa?.DIAG?.DiagnosisGUID;
      this.objDiagnosis.RepairType = this.repa?.DIAG?.RepairType;
      this.objDiagnosis.DiagnosisCode = this.repa?.DIAG?.DiagnosisCode;
      this.objDiagnosis.DiagnosisDate = this.repa?.DIAG?.DiagnosisDate;
      this.objDiagnosis.RepairType = this.repa?.DIAG?.RepairType;
      this.objDiagnosis.ServiceNRepairType = this.repa?.DIAG?.ServiceNRepairType;
      this.objDiagnosis.RepairTypeDesc = this.repa?.DIAG?.RepairTypeDesc;
      this.objDiagnosis.BillingOption = this.repa?.DIAG?.BillingOption;
      this.objDiagnosis.BillingOptionDesc = this.repa?.DIAG?.BillingOptionDescription;
      this.objDiagnosis.SubmissionType = this.repa?.DIAG?.SubmissionType;
      this.objDiagnosis.SubmissionTypeDesc = this.repa?.DIAG?.SubmissionTypeDesc;
      this.objDiagnosis.DiagStatus = this.repa?.DIAG?.DiagnosisStatus;
      this.objDiagnosis.LaborCovered = this.repa?.DIAG?.LaborCovered;
      this.objDiagnosis.PartsCovered = this.repa?.DIAG?.PartsCovered;
      this.objDiagnosis.NoOfDays = this.repa?.DIAG?.NoOfDaysToComplete;
      // this.objDiagnosis.CompanyName = this.repa?.DIAG?.CompanyName;
      this.objDiagnosis.NoOfDaysDesc = this.repa?.DIAG?.NoOfDaysToCompleteDesc;
      this.objDiagnosis.BillableRepair = this.repa?.DIAG?.BillableRepair == 1 ? true : false;
      this.objDiagnosis.PaymentTerms = this.repa?.DIAG?.PaymentTerms
      this.isCheckBox = this.repa?.DIAG?.BillableRepair == 1 ? true : false;
      this.diagForm = this.fb.group({
        RepairType: [this.objDiagnosis.RepairType, Validators.required],
        SNRepairType: [this.objDiagnosis.ServiceNRepairType],
        BillingOption: [this.objDiagnosis.BillingOption, Validators.required],
        NoOfDays: [this.objDiagnosis.NoOfDays, Validators.required],
        // CompanyName: [this.objDiagnosis.CompanyName],
        PaymentTerms: [this.objDiagnosis.PaymentTerms],
        billableRepair: [this.objDiagnosis.BillableRepair],
        SubmissionType: [this.objDiagnosis.SubmissionType]
      });

      this.objDiagnosis.SelectedComponentIssue = [];

      if (Array.isArray(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL)) {
        for (var item of this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL) {
          this.objDiagnosis.SelectedComponentIssue.push({
            "DiagnosisDetailGUID": item.DiagnosisDetailGUID,
            "ComponentCode": item.ComponentCode,
            "ComponentDesc": item.ComponentDesc,
            "IssueCode": item.IssueCode,
            "IssueDesc": item.IssueDesc,
            "ReproducibilityCode": item.ReproducibilityCode,
            "ReproducibilityDescription": item.ReproducibilityDescription,
            "IsDeleted": item.IsDeleted
          })
        }

      }
      else {
        var lstDiagDetail = [];
        lstDiagDetail.push(this.repa?.DIAG?.DIAGLIST?.DIAGDETAIL);
        this.objDiagnosis.SelectedComponentIssue.push({
          "DiagnosisDetailGUID": lstDiagDetail[0]?.DiagnosisDetailGUID,
          "ComponentCode": lstDiagDetail[0]?.ComponentCode,
          "ComponentDesc": lstDiagDetail[0]?.ComponentDesc,
          "IssueCode": lstDiagDetail[0]?.IssueCode,
          "IssueDesc": lstDiagDetail[0]?.IssueDesc,
          "ReproducibilityCode": lstDiagDetail[0]?.ReproducibilityCode,
          "ReproducibilityDescription": lstDiagDetail[0]?.ReproducibilityDescription,
          "IsDeleted": lstDiagDetail[0]?.IsDeleted
        })
      }
    }
    if (this.objDiagnosis.DiagStatus == 'RELEASED') {
      this.editDiagForm();
      this.isDiagEdit = true;
      this.isDiagUpdate = true;
    }


    this.objDiagnosis.SelectedComponentIssue =
    this.objDiagnosis.SelectedComponentIssue.filter(item =>
    item.DiagnosisDetailGUID != null && item.DiagnosisDetailGUID != ''
  )

  }

  getRepairQuestionRequestData() {
    ;

    var repairType = this.diagForm.get('RepairType').value;
    var CoverageOption = this.diagForm.get('BillingOption').value;
    var objData

    var ComponentIssueList = [];
    var iCtr = 1
    for (let item of this.objDiagnosis.SelectedComponentIssue) {
      ComponentIssueList.push({
        "componentCode": item.ComponentCode,
        "issueCode": item.IssueCode,
        "type": "TECH",
        "order": iCtr,
        "priority": iCtr
      });
      iCtr = iCtr + 1
    };

    objData = {
      "repairType": repairType,
      "componentIssues": ComponentIssueList,
      "device": {
        "id": this.repa.SerialNo1
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
              this.toasty.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            return;
          }
          else {
            var questions = response.questionDetails;
            console.log("SVNR ques ", questions)
            if (questions.length > 0) {
              const dialogRef = this.dialog.open(FeedbackComponent, {
                data: questions,
                width: '90%',
                height: '80%'

              });
              dialogRef.afterClosed().subscribe(result => {
                
                console.log("Results SVNR ", result)
                if (result) {
                  this.repairQuestions = result;
                  //  this.PostTOGSX();
                  if (this?.repa?.DIAG?.GSXCode == '' || this?.repa?.DIAG?.GSXCode == undefined || this?.repa?.DIAG?.GSXCode == null) {
                    this.PostTOGSX();
                  }
                  else {
                    this.SaveDiagnosis()
                  }

                }

              });

            }
            else {
              if (this?.repa?.DIAG?.GSXCode == '' || this?.repa?.DIAG?.GSXCode == undefined || this?.repa?.DIAG?.GSXCode == null) {
                this.PostTOGSX();
              }
              else {
                this.SaveDiagnosis()
              }
            }


          }


        }
      }
    );
  }



  openQuestionPopup() {
    if (this.diagForm.get('RepairType').value == "SVNR") {

      if (this.objDiagnosis.SelectedComponentIssue == null || this.objDiagnosis.SelectedComponentIssue == undefined || this.objDiagnosis.SelectedComponentIssue.length == 0) {
        this.toasty.error("Please Add Component Issue")
        return;

      }
      if (this.repa.NOTESLIST == null || this.repa.NOTESLIST == undefined) {
        this.toasty.error("Kindly Add Notes")
        return;
      }

      var data = this.getRepairQuestionRequestData();
      this.getQuestions(data);
      ;
    }
  }


  SaveForLater() {

    var isGsxPosted = this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0;
    // if(isGsxPosted==0)
    // {

    //     let isReviewByApple = this.CheckReviewByApple()
    //     if (isReviewByApple == true){
    //       if (this.requestReviewByApple != true ){
    //         this.toasty.error("Please Check Review By Apple!")
    //         return
    //       }
    //     }
    // }

    var Partlist = [];
    // for (let item of this.selectedpartlist) {
    //   Partlist.push({
    //     "ComponentCode": item.ComponentCode,
    //     "PartType": item.Type,
    //     "IssueCode": item.IssueCode,
    //     "ReproducibilityCode": item.ReproducibilityCode,
    //     "ConsignmentStockUsed": item.ConsignmentStockUsed,
    //     "PartCode": item.PartCode,
    //     "PartUsed": item.PartUsed,
    //     "PartSerialized": item.PartSerialized,
    //     "KGB": item.KGB == undefined || item.KGB == null || item.KGB == "" ? null : item.KGB,
    //     "KBB": item.KBB == undefined || item.KBB == null || item.KBB == "" ? null : item.KBB,
    //     "CoverageOption": item.CoverageOption,
    //     "PricingOption": item.PricingOption == null || item.PricingOption == undefined ? null : item.PricingOption.code,
    //     "ReturnStatusCode": "",
    //     "isGSXPosted": item.isGSXPosted == null || item.isGSXPosted == undefined ? 0 : item.isGSXPosted == true ? 1 : 0,
    //     "IsDeleted": item.IsDeleted,
    //     "sequenceNumber": item.SequenceNumber == "0" || item.SequenceNumber == undefined || item.SequenceNumber == null ? null : +item.SequenceNumber

    //   });
    // };
    // var strRepairStatus = this.SelectedRepairStatus == undefined || this.SelectedRepairStatus == null || this.GSXRepairStatus == undefined || this.GSXRepairStatus == null || this.GSXRepairStatus == "" ? null : this.SelectedRepairStatus.RepairStatusCode;
    // if (strRepairStatus == null || strRepairStatus == this.GSXRepairStatus) {
    //     strRepairStatus=null
    // }
    // else {
    //   strRepairStatus = this.SelectedRepairStatus.RepairStatusCode
    // }
    var objData = {

      "CaseGUID": this.repa.CaseGUID,
      "repairType": this.repa.DIAG.RepairType,
      "repairClassification": this.repa.DIAG.SubmissionType,
      "CompanyCode": glob.getCompanyCode(),
      "isGSXPosted": this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? 0 : this.repa?.REPAIR?.isGSXPosted == "1" ? 1 : 0,
      "requestReviewByApple": false, // this.requestReviewByApple == undefined || this.requestReviewByApple == null ? false : this.requestReviewByApple,
      "markComplete": false, // this.markComplete == undefined || this.markComplete == null ? false : strRepairStatus == "SPCM" ? true : this.markComplete,
      "GSXCode": this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode == undefined ? "" : this.repa?.REPAIR?.GSXCode,
      "PartList": Partlist,
      "repairQuestions": this.repairQuestions == null || this.repairQuestions == undefined ? null : this.repairQuestions,
      "repairStatus": null //  this.repa?.REPAIR?.isGSXPosted == null || this.repa?.REPAIR?.isGSXPosted == undefined ? null : strRepairStatus
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
              this.toasty.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
            }
            //this.toasty.error(this.errorMessage);
            this.spinner.hide();

          }
          else if (!(response.outcome == undefined || response.outcome == null)) {

            let erroraction = "";
            this.errorMessage = response.outcome.action.toString();
            //this.toasty.error(errorMessage1);
            for (let iCtr = 0; iCtr < response.outcome.reasons.length; iCtr++) {
              let errorType = "";
              errorType = response.outcome.reasons[iCtr].type.toString();
              //this.toasty.error(errorMessage1);
              for (let lCtr = 0; lCtr < response.outcome.reasons[iCtr].messages.length; lCtr++) {
                var e1 = response.outcome.reasons[iCtr].messages[lCtr].description.toString();
                if (errorType.toUpperCase() == 'WARNING') {
                  this.toasty.warning(erroraction + ' - ' + errorType + ' - ' + e1, "Warning", { closeButton: true, disableTimeOut: true });
                }
                else {
                  this.toasty.error(erroraction + ' - ' + errorType + ' - ' + e1, "Error", { closeButton: true, disableTimeOut: true });
                }
              }

            }
            if (response.repairId == undefined || response.repairId == null) {
              this.spinner.hide();
            }
            else {
              var repairid = response.repairId;
              // this.getRepairDetails(repairid);
            }
          }
          else {
            var repairid = response.repairId;
            // this.getRepairDetails(repairid);
          }
        }
      });
  }

  ResetDiagnosisPopupComponent() {
    
    this.openResetDiagnosisPopupComponent.emit(true)
  }


}