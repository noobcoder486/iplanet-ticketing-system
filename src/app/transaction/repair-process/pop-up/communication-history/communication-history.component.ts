import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { CaseDetail } from '../../repair-process.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-communication-history',
  templateUrl: './communication-history.component.html',
  styleUrls: ['./communication-history.component.css']
})
export class CommunicationHistoryComponent implements OnInit {


  @Output() CancelBtn = new EventEmitter<any>();
  @Input() repa : CaseDetail
  isLoading = true
  CommunicationList: any[] =[]

  constructor(
    private dropdownDataService:DropdownDataService,
    private dynamicService :DynamicService,
    private spinner : NgxSpinnerService,
    private toastMessage : ToastrService,
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

  communicationForm : FormGroup



  CancelBtn1(){
  this.CancelBtn.emit(false)  
}

  ngOnChanges(changes: SimpleChanges){
    if(changes['repa']){
      if(this.repa != null && this.repa!= undefined ){
        if( this.repa.COMMDETAILS != null || this.repa.COMMDETAILS != undefined ){
          if (Array.isArray(this.repa.COMMDETAILS.CommunicationDetails)) {
            this.CommunicationList = this.repa.COMMDETAILS.CommunicationDetails
          } 
          else {
            this.CommunicationList.push(this.repa.COMMDETAILS.CommunicationDetails)
          }  
          this.onDispositionSearch({ term: "", items: [] });
        }
        else{
          this.isLoading = false
          
        }
      }
    }
  }
  ngOnInit(): void {
    console.log(" Communicatiion History List ", this.repa.COMMDETAILS)
  }


  onDispositionSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Disposition, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.DispositionDD = value; 
          console.log("Disposition Value ", this.DispositionDD)
          this.CommunicationList.forEach( item =>{
            const DispostionObj = this.DispositionDD.Data.find(DD => DD.Id == item.ConnectDisposition);
            if (DispostionObj) {
              item.ConnectDispositionText = DispostionObj.TEXT;
            } else {
              item.ConnectDispositionText = "Unknown"; 
            }
          })
          this.isLoading = false
          console.log("Disposition List ", this.CommunicationList)
        }
      },
      error: err => {
        this.isLoading = false
        this.DispositionDD = this.getBlankObject();
      }
    });
  }



}
 
