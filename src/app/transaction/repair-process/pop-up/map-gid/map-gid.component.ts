import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core'
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import * as glob from 'src/app/config/global'
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { CaseDetail } from '../../repair-process.metadata';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-map-gid',
  templateUrl: './map-gid.component.html',
  styleUrls: ['./map-gid.component.css']
})
export class MapGidComponent implements OnInit {
  selectedpartlist: any[] = [];

  constructor(
    private dynamicService: DynamicService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private gsxService: GsxService
  ) { }

  @Input() repa: CaseDetail;
  gidNumber:string = ''
  close: boolean;
  @Output() gidnumber = new EventEmitter<any>()
  @Output() closeBtn = new EventEmitter<any>();

  ngOnInit(): void {

  }

  getRepairDetails() {
    if(this.gidNumber == null || this.gidNumber == undefined || this.gidNumber == '')
    {
      this.toastr.error("GID Number cannot be blank")
      return;
    }
    else
    {
      this.gidnumber.emit(this.gidNumber)
      this.CloseBtn()
    }
  }

  
  CloseBtn()
  {
    this.close = false; 
    this.closeBtn.emit(this.close)  
  }
}
