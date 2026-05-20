import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { GSTGroup } from './gst-group.metadata';
import { ToastrService } from 'ngx-toastr';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-add-gst-group',
  templateUrl: './add-gst-group.component.html',
  styleUrls: ['./add-gst-group.component.sass']
})
export class AddGstGroupComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  gstGroupForm: FormGroup
  formTitle: string = "Add"
  params: any;
  isEdit:boolean = false;
  gstgroup: GSTGroup
  errorMessage: string;


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.gstgroup = new GSTGroup()
    this.gstGroupForm = this.formBuilder.group({
      GSTGroupCode: [null, Validators.required],
      Description: [null, Validators.required],
      HSNSACCode: [null, Validators.required],
    })
    this.gstgroup.gstGroup = this.gstGroupForm
  }

  controlValidations() {
    Object.keys(this.gstGroupForm.controls).forEach(field => {
      let controlValue = this.gstGroupForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetGSTGroupObject"
    });
    requestData.push({
      "Key": "GSTGroupCode",
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
            let data = JSON.parse(response.ExtraData)?.GSTGroup;
            
            this.gstGroupForm.patchValue({
              GSTGroupCode: data.GSTGroupCode,
              Description: data.Description,
              HSNSACCode: data.HSNSACCode,
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

  returnPrevious() {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/gst-group')
  }

  onSubmit() {
    this.controlValidations()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveGSTGroup"
    });
    requestData.push({
      "Key": "GSTGroupCode",
      "Value": this.gstGroupForm.controls["GSTGroupCode"].value
    });
    requestData.push({
      "Key": "Description",
      "Value": this.gstGroupForm.controls["Description"].value
    });
    requestData.push({
      "Key": "HSNSACCode",
      "Value": this.gstGroupForm.controls["HSNSACCode"].value
    });
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
            // this.controlValidations()
          }
        }
      });
  }

  getErrorMessage(control: string): string {
    let formControl = this.gstGroupForm.controls[control];
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

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
