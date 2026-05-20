import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CaseDetail } from '../../repair-process.metadata';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { Columns } from 'src/app/models/column.metadata';

@Component({
  selector: 'app-repair-logs',
  templateUrl: './repair-logs.component.html',
  styleUrls: ['./repair-logs.component.css']
})
export class RepairLogsComponent implements OnInit {

  @Output() CancelBtn = new EventEmitter<any>();
  @Input() repa : CaseDetail
  isLoading = true
  RepairList: any[] =[]


  constructor(
    private dropdownDataService:DropdownDataService,
    private dynamicService :DynamicService,
    private spinner : NgxSpinnerService,
    private toastMessage : ToastrService,
  ) { }

  // columns: Columns[] = [
  //   {datatype: "STRING", field: "", title: "Actions"},
  //   {datatype: "STRING", field: "", title: "User"},
  //   {datatype:"STRING",field:"",title:"Date & Time"},
  // ];

  

  ngOnInit(): void {
    console.log(" Repair Logs List ", this.repa.REPAIRLOGS)
    if(this.repa != null && this.repa!= undefined ){
      if( this.repa.REPAIRLOGS != null || this.repa.REPAIRLOGS != undefined ){
        if (Array.isArray(this.repa.REPAIRLOGS.RepairLog)) {
          this.RepairList = this.repa.REPAIRLOGS.RepairLog
        } 
        else {
          this.RepairList.push(this.repa.REPAIRLOGS.RepairLog)
        }  
        this.isLoading=false;
        // this.onDispositionSearch({ term: "", items: [] });
      }
    }
  }

  CancelBtn1(){
    this.CancelBtn.emit(false)  
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes['repa']){
      if(this.repa != null && this.repa!= undefined ){
        if( this.repa.REPAIRLOGS != null || this.repa.REPAIRLOGS != undefined ){
          if (Array.isArray(this.repa.REPAIRLOGS.RepairLog)) {
            this.RepairList = this.repa.REPAIRLOGS.RepairLog
          } 
          else {
            this.RepairList.push(this.repa.REPAIRLOGS.RepairLog)
          }  
          // this.onDispositionSearch({ term: "", items: [] });
        }
        else{
          this.isLoading = false
          
        }
      }
    }
  }

}
