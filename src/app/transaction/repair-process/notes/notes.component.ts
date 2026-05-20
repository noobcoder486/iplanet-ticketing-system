import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import xml2js from 'xml2js';
import * as glob from "../../../config/global";
import { CaseDetail } from '../repair-process.metadata';
import { Notes } from './notes.metadata';
import { v4 as uuidv4 } from 'uuid';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.sass']
})
export class NotesComponent implements OnInit {

  @Input() sendFunction;
  @Input() selectedNotesTemplate;
  notesForm: FormGroup;
  notes: Notes;
  errorMessage: String;
  isAddNotes: boolean = false;
  selectedTemp
  NoteTypeVal: any = ['Technician' , 'Hold For Review'] 
  notesviewlist: any[] = []
  selectedNotesTemplateFinal: any[] = []
  panelOpenState: boolean = false;
  isDeletshover: '';
  showDeleteButton: boolean = false


  WorkingSpinner(){
    this.spinner.show()
  setTimeout(() => {
      this.spinner.hide()
    }, 5000);
  }
  
  ngOnChanges(changes: SimpleChanges): void{
    if(changes['repa'])
    {
      if(this.repa!= null && this.repa != undefined  ){
         // Delete Notes 
         if ( this.repa?.RepairFlag == 0 || this.repa?.JobStatus == 'GX02'){
          this.showDeleteButton = true
        }
        this.notesviewlist=[];
        if(Array.isArray(this.repa?.NOTESLIST?.Notes))
        {
          for ( var item of this.repa?.NOTESLIST?.Notes)
          {
            if(item.NotesType != "Customer")
            {
              this.notesviewlist.push({
                "NotesGuid":  item.NotesGuid,
                "NotesType":  item.NotesType,
                "Notes":      item.Notes,
                "CreatedBy":  item.CreatedBy,
                "CreatedDate":item.CreatedDate,
                "CaseID":     item.CaseID
              })
            } 
          }
        }
        else
        {
          var lstNotesList=[];
          lstNotesList.push(this.repa?.NOTESLIST?.Notes);
          if(lstNotesList[0].NotesType != "Customer")
          {
            this.notesviewlist.push({
              "NotesGuid":lstNotesList[0]?.NotesGuid,
              "NotesType": lstNotesList[0]?.NotesType,
              "Notes": lstNotesList[0]?.Notes,
              "CreatedBy": lstNotesList[0]?.CreatedBy,
              "CreatedDate": lstNotesList[0]?.CreatedDate,
              "CaseID": lstNotesList[0]?.CaseID
          })
          }
        }
      }
    }

    if(changes['selectedNotesTemplate']){
      if(this.selectedNotesTemplate!= null && this.selectedNotesTemplate != undefined  ){
        for(let item of this.selectedNotesTemplate){
          this.selectedNotesTemplateFinal.push(item.notes)
        }
      }
      this.selectedTemp = this.selectedNotesTemplateFinal.toString().replace(/,/g, "\n");
    }
  }

  @Input() repa: CaseDetail;
  @Output() NotesUpdated = new EventEmitter<any>();
  @Output() ADDNotesTemplate = new EventEmitter<any>();
  @Output() spinnerFlag = new EventEmitter<any>();


  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.notes = new Notes();
    this.notesForm = this.formBuilder.group({
      NotesType: [null, Validators.required],
      NotesText: [null, Validators.required],
    });
  }
  
  addNotesList() {
    if (this.isAddNotes == true) {
      this.isAddNotes = false;
    } else {
      this.isAddNotes = true;
    }
  }

  onSubmit() {
    this.spinner.show();
    
    Object.keys(this.notesForm.controls).forEach(field => {
      let control = this.notesForm.get(field).value
      if (control == null || control == undefined) {
        this.toast.error(field + " Cannot be Empty")
      }
    })
    const notesform = this.notesForm.value
    let newNotesGuid = uuidv4();
    let requestData = [];
    this.dynamicService.validateAllFormFields(this.notesForm);
    if (this.notesForm.valid) {
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveNotes"
      });
      requestData.push({
        "Key": "NoteType",
        "Value": notesform.NotesType
      });
      // Remove Special Characters from Notes 
      this.selectedTemp = this.selectedTemp.toString().replace(/[^\x20-\x7E]/g, ''); // Match characters outside the printable ASCII range
      requestData.push({
        "Key": "Notes",
        "Value": this.selectedTemp
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
      ;
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
              this.addNotesList()
              this.toast.success('Submitted Succesfully')
              var getval = JSON.parse(response.ExtraData);
              this.NotesUpdated.emit(getval)
              this.spinnerFlag.emit(this.panelOpenState)
              this.spinner.hide()
              this.onReset()
              this.toast.success('Submitted Succesfully')
              this.spinner.hide();
              
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
    } else {
      console.log("Enter Required Fields")
    }

  }

  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>;
  
  callAPI() {
    let dialogRef = this.dialog.open(this.callAPIDialog);
    dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
            if (result === 'yes') {
                
            } else if (result === 'no') {
              
            }
        }
    })
}

  

  onReset() {
    this.notesForm.reset();
    this.selectedTemp = " "
    this.toast.info('Form Reset')
  }

  openNotesTemplate(){
   let add = true
    this.ADDNotesTemplate.emit(add)
  }


  onDeleteItem(item) {
     
    this.spinner.show();
    let requestData = [];
  
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveNotes"
      });
      requestData.push({
        "Key": "NoteType",
        "Value": item.NotesType
      });
      requestData.push({
        "Key": "Notes",
        "Value": item.Notes
      });
      requestData.push({
        "Key": "CompanyCode",
        "Value": glob.getCompanyCode()
      });
      requestData.push({
        "Key": "NotesGuid",
        "Value": item.NotesGuid
      });
      requestData.push({
        "Key": "CaseID",
        "Value": this.repa.CaseId
      });
      requestData.push({
        "Key": "CaseGUID",
        "Value": this.repa.CaseGUID
      });
      requestData.push({
        "Key": "IsDeleted",
        "Value": 1
      });
      ;
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
              var getval = JSON.parse(response.ExtraData);
              this.NotesUpdated.emit(getval)
              this.spinnerFlag.emit(this.panelOpenState)
              this.spinner.hide()
              this.toast.success('Submitted Succesfully Deleted')
              this.spinner.hide();
              
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
}
