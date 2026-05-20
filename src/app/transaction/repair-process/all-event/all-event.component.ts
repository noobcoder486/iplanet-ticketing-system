import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CaseDetail } from '../repair-process.metadata';
import { FormBuilder, FormGroup, Validators ,FormControl } from '@angular/forms';
import xml2js from 'xml2js';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import * as glob from "../../../config/global";
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { POSDTA } from 'src/app/transaction/repair-process/invoice/posdta.metadata'
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-all-event',
  templateUrl: './all-event.component.html',
  styleUrls: ['./all-event.component.css']
})
export class AllEventComponent implements OnInit {

  @Input() repa :CaseDetail;
  allEventDetail:any[]=[]
  panelOpenState:boolean=false;

  constructor(
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private gsxService :GsxService ,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    
  }

  getRepairSummary()
  {
    console.log(this.repa,"case")
    var deviceid = this.repa?.SerialNo1
    var device ={"device": {
      "id":deviceid
    }
  }
    let contentRequest = {
      "Content": JSON.stringify(device)
    };
    this.gsxService.getRepairSummary(false,contentRequest).subscribe({
      next:(value)=>{
         
        let response = JSON.parse(value.toString());
        if(response.errors == null && response.errors == undefined)
        {
          if(Array.isArray(response))
          {
            this.allEventDetail = response
          }
          else
          {
            this.allEventDetail.push(response)
          }
          
        }
        else
        {
          
          this.toaster.error(response.errors[0].code + " " + response.errors[0].message,"All Event")
        }
        
      },
      error:(err)=>{
        console.log(err)
        this.toaster.error(err.toString())
      }
    })
  }

  
ngOnChanges(changes: SimpleChanges): void{
  if(changes['repa'])
  {
    if(this.repa!= null && this.repa != undefined ){
      this.getRepairSummary()
    }
  }
    
}

}

