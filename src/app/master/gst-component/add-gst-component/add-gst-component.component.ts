import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import * as glob from 'src/app/config/global'
import { ActivatedRoute, Router } from '@angular/router';
import { GSTComponent } from './gst-component.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';

@Component({
  selector: 'app-add-gst-component',
  templateUrl: './add-gst-component.component.html',
  styleUrls: ['./add-gst-component.component.sass']
})
export class AddGstComponentComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) { }
  params: any;
  isEdit:boolean = false;
  formTitle: string = "Add"
  gstComponentForm: FormGroup
  gstJuridictionType: DropDownValue = this.getBlankObject();
  gstcomponent: GSTComponent
  errorMessage : string;


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.onGSTJuridictionType({term:'', items:[]})
    this.gstcomponent = new GSTComponent()
    this.gstComponentForm = this.formBuilder.group({
      GSTComponentCode: [null, Validators.required],
      ERPGSTComponentCode: [null, Validators.required],
      GSTComponentName: [null, Validators.required],
      GSTJuridictionType: [null, Validators.required],
      CalculationOrder: [null, Validators.required]
    })
    this.gstcomponent.gstComponent = this.gstComponentForm
  }

  controlValidations() {
    Object.keys(this.gstComponentForm.controls).forEach(field => {
      let controlValue = this.gstComponentForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  getData(){
    
    console.log(this.params)
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetGSTComponentObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": this.params.cc
    });
    requestData.push({
      "Key": "GSTComponentCode",
      "Value": this.params.nc

    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };

    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (Value) => {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response.ExtraData)?.GSTComponent;
            this.gstComponentForm.patchValue({
              GSTComponentCode: data.GSTComponentCode,
              ERPGSTComponentCode: data.ERPGSTComponentCode,
              GSTComponentName: data.GSTComponentName,
              GSTJuridictionType: data.GSTJuridictionType,
              CalculationOrder: data.CalculationOrder
            })

          }
          else {
            console.log("error");
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }

  returnPrevious()
  {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/gst-component')
  }

  onSubmit() {
    this.controlValidations()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveGSTComponent"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "GSTComponentCode",
      "Value": this.gstComponentForm.controls["GSTComponentCode"].value
    });
    requestData.push({
      "Key": "ERPGSTComponentCode",
      "Value": this.gstComponentForm.controls["ERPGSTComponentCode"].value
    });
    requestData.push({
      "Key": "GSTComponentName",
      "Value": this.gstComponentForm.controls["GSTComponentName"].value
    });
    requestData.push({
      "Key": "GSTJuridictionType",
      "Value": this.gstComponentForm.controls["GSTJuridictionType"].value
    });
    requestData.push({
      "Key": "CalculationOrder",
      "Value": this.gstComponentForm.controls["CalculationOrder"].value
    })
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      "content": strRequestData
    };
    
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {

          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toastMessage.success("Form Submitted Successfully");
            this.returnPrevious()
          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;
              this.handleError(response);
            });
          }

        },
        error: err => {
          if (err.includes('"message":"Cannot')) {
            this.controlValidations()
          }
        }
      });
  }

  getErrorMessage(control: string): string {
    let formControl = this.gstComponentForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
  }

  onGSTJuridictionType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.GSTJuridictionType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.gstJuridictionType = value;
        }
      },
      error: (err) => {
        this.gstJuridictionType = this.getBlankObject();
      }
    });
  }




  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
