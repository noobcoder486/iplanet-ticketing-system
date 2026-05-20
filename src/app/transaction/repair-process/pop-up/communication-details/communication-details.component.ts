import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { CaseDetail } from '../../repair-process.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import xml2js from 'xml2js';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid'; 
import { Router } from '@angular/router';


@Component({
  selector: 'app-communication-details',
  templateUrl: './communication-details.component.html',
  styleUrls: ['./communication-details.component.css']
})
export class CommunicationDetailsComponent implements OnInit {





  States: any;
  Countries: any;
  customer: any;
  errorMessage: string;
  @Input() repa : CaseDetail
  CommunicationDetailsGUID:string;
    technicians: DropDownValue = DropDownValue.getBlankObject();
  

  constructor(
    private formBuilder: FormBuilder,
    private dropdownDataService:DropdownDataService,
    private dynamicService :DynamicService,
    private spinner : NgxSpinnerService,
    private toastMessage : ToastrService,
    private router: Router
  ) { }

  selectedOption: string = 'yes';

  callTypes = [
    { Id: 'outbound', TEXT: 'Outbound' },
    { Id: 'inbound', TEXT: 'Inbound' }, 
  ];

  DispositionDD: DropDownValue = this.getBlankObject();

  
  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  @Output() CancelBtn = new EventEmitter<any>();
  @Output() CommDetailsUpdated = new EventEmitter<any>();

  cancle: boolean;
  communicationForm : FormGroup



  CancelBtn1(){
  this.cancle = false; 
  this.CancelBtn.emit(this.cancle)  
}

  ngOnInit(): void {
    this.CommunicationDetailsGUID=uuidv4(),
    
    this.communicationForm = this.formBuilder.group({
      CallType: [null, Validators.required],
      selectedOption: [null], 
      AgentName: [null, Validators.required],
      ConnectDisposition:[null, Validators.required],
      Remark: [null, Validators.required],
    });

    this.onDispositionSearch({ term: "", items: [] });
    this.onTechnicianSearch({ term: "", item: null })

  }


  onDispositionSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Disposition4Communication, $event.term,{Parameter : this.selectedOption }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log("DD Value ", this.DispositionDD)
          this.DispositionDD = value; 
        }
      },
      error: err => {
        this.DispositionDD = this.getBlankObject();
      }
    });
  }


  SaveCommunicationDetails(){

    let returnTrue = false
    const remark = this.communicationForm.get('Remark')?.value?.trim() || '';
    this.communicationForm.patchValue({ Remark: remark });

    Object.keys(this.communicationForm.controls).forEach(field => {
      let control = this.communicationForm.get(field).value
      console.log('control' , control)
      if (control == null || control == undefined || control == '') {
        this.toastMessage.error(field + " Cannot be Empty")
        returnTrue = true
      }
    })
    if(returnTrue){
      return
    }

    let requestData = []
    requestData.push({
      "Key": "APIType",
      "Value" : "SaveCommunicationDetails"
    })
    requestData.push({
      "Key": "CaseGUID",
      "Value" : this.repa.CaseGUID
    })

    requestData.push({
      "Key": "CommunicationDetailsGUID",
      "Value" : this.CommunicationDetailsGUID
    })

    requestData.push({
      "Key": "CallType",
      "Value" : this.communicationForm.value.CallType
    })
    requestData.push({
      "Key": "Connect",
      "Value" : this.selectedOption =='yes'? 1 : 0
    })
    requestData.push({
      "Key": "AgentName",
      "Value" : this.communicationForm.value.AgentName
    })
    requestData.push({
      "Key": "ConnectDisposition",
      "Value" : this.communicationForm.value.ConnectDisposition
    })
    requestData.push({
      "Key": "Remark",
      "Value" : this.communicationForm.value.Remark
    })
    
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    console.log("Before Save " , requestData);
    this.spinner.show();
  
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) =>{
          this.spinner.hide();
          console.log("After Saving" , value);
          let response = JSON.parse(value.toString());

          if(response.ReturnCode == '0' ){
              console.log("==After Saving===",response)
              var getval = JSON.parse(response.ExtraData);
              this.toastMessage.success("Saved Successfully!")
              console.log("==After Saving===",getval)
              this.CommDetailsUpdated.emit(getval)
              // Reload the current route
              // window.location.reload(); 
              this.CancelBtn1()
          }
          else{
               console.log("Error Response: " , response)
               this.spinner.hide()
               this.errorMessage = response.ErrorMessage;
               const parser = new xml2js.Parser({ strict: false, trim: true });
               parser.parseString( this.errorMessage , (error, result) => {
                 const errorMessages = result.ERRORLIST.ERRORMESSAGEROW;
                 // console.log("Messages : " ,errorMessages)
                 errorMessages.forEach((errorMessage) => {
                   // console.log("Error Message: " , error)
                   this.toastMessage.error(errorMessage.ERRORMESSAGE);
                 });
               });  
          }

        },
        error: (err) =>{
            this.spinner.hide();
            console.log("Error :- ", err)
            const errors = err.split("Error Code:").slice(1); // Split the error string into separate error segments
            errors.forEach(error => {
              const messageIndex = error.indexOf("Message: ");
              if (messageIndex !== -1) {
                const messageSubstring = error.substring(messageIndex + 9).trim();
                const message = JSON.parse(messageSubstring).message;
                this.toastMessage.error("Error:-  " + message);
              } else {
                this.toastMessage.error("Error parsing the error message.");
              }
            });
        }
    })


  }

 onTechnicianSearch($event: { term: string; item: any[] }) {
    console.log($event.term);
    this.dropdownDataService.fetchDropDownData(DropDownType.Technician, $event.term, {
      LocationCode: this.repa.LocationCode
    }).subscribe({
      next: (value) => {
        console.log("New A", value);
        if (value != null) {
          console.log("New B", value);
          this.technicians = value;
        }
      },
      error: (err) => {
        this.technicians = DropDownValue.getBlankObject();
      }
    });
  }


onOptionChange(value) {
  
  console.log('Selected value:', value);

  if (value == 'yes') {
     this.selectedOption = 'yes'

    this.communicationForm.patchValue({ ConnectDisposition: null });
     
    this.onDispositionSearch({ term: "", items: [] });
    
  } else {
     this.selectedOption = 'no'
    this.communicationForm.patchValue({ ConnectDisposition: null });
    this.onDispositionSearch({ term: "", items: [] });
     
  }

  
}

}
