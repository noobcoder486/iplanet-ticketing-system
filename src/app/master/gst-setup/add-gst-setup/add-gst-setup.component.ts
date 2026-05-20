import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import * as glob from 'src/app/config/global'
import { v4 as uuidv4} from 'uuid'
import { ActivatedRoute, Router } from '@angular/router';
import { GSTSetup } from './gst-setup.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';

@Component({
  selector: 'app-add-gst-setup',
  templateUrl: './add-gst-setup.component.html',
  styleUrls: ['./add-gst-setup.component.sass']
})
export class AddGstSetupComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) { }

  params: any;
  formTitle: string = "Add"
  gstSetupForm: FormGroup
  gstCountry: DropDownValue = this.getBlankObject();
  gstState: DropDownValue = this.getBlankObject();
  gstJuridictionCode: DropDownValue = this.getBlankObject();
  GSTGroupCode: DropDownValue = this.getBlankObject();
  GSTComponentCode: DropDownValue = this.getBlankObject();
  gstsetup: GSTSetup
  errorMessage : string;
  isEdit:boolean = false;


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.onGSTJuridictionType({term:'', items:[]})
    this.onGSTComponentCode({ term: '', items: []})
    this.onGSTGroupCode({ term: '', items: []})
    this.gstsetup = new GSTSetup()
    this.gstSetupForm = this.formBuilder.group({
      CountryCode: [null, Validators.required],
      GSTStateCode: [{value: this.gstsetup?.countryCode == null ? null : this.gstsetup.gstStateCode },Validators.required],
      GSTGroupCode: [null, Validators.required],
      GSTJuridictionCode: [null, Validators.required],
      EffectiveDate: [null, Validators.required],
      CalculationOrder: [null, Validators.required],
      GSTComponentCode: [null, Validators.required],
      GSTPercentage: [null, Validators.required]
    })
    this.onCountrySearch({ term: "", items: [] });
    this.gstsetup.gstSetup = this.gstSetupForm
  }

  controlValidations() {
    Object.keys(this.gstSetupForm.controls).forEach(field => {
      let controlValue = this.gstSetupForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  getData(){
    let requestData = [];

    requestData.push({
      "Key": "ApiType",
      "Value": "GetGSTSetupObject"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": this.params.cc
    });
    requestData.push({
      "Key": "GSTGUID",
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
            let data = JSON.parse(response.ExtraData)?.GSTSetup;
            
            this.gstSetupForm.patchValue({
              GSTGUID: data.GSTGUID,
              CountryCode: data.CountryCode,
              GSTStateCode: data.GSTStateCode,
              GSTGroupCode: data.GSTGroupCode,
              GSTJuridictionCode: data.GSTJuridictionCode,
              EffectiveDate: data.EffectiveDate,
              CalculationOrder: data.CalculationOrder,
              GSTComponentCode: data.GSTComponentCode,
              GSTPercentage: data.GSTPercentage,
            })
            this.onStatesSearch({term:"",items:[]})

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
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/gst-setup')
  }

  onCountrySearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Country, $event.term).subscribe({
      next: (value) => {
        if (value != null) {
          this.gstCountry = value;
          this.gstState = this.getBlankObject();
          this.onStatesSearch({ term: "", items: [] });
        }
      },
      error: err => {
        this.gstCountry = this.getBlankObject();
        this.gstState = this.getBlankObject();
        this.gstsetup.countryCode = null;
        this.gstsetup.gstStateCode = null;
      }
    });

  }


  onStatesSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.State, $event.term, {
      CountryCode: this.gstsetup?.countryCode
    }).subscribe({
      next: (value) => {

        if (value != null) {
          this.gstState = value;
        }
      },
      error: err => {
        this.gstState = this.getBlankObject();
      }
    });
  }

  onGSTGroupCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.GSTGroupCode, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GSTGroupCode = value;
          console.log(this.GSTGroupCode.Data)
        }
      },
      error: (err) => {

        this.GSTGroupCode = this.getBlankObject();
      }
    });
  }

  onGSTComponentCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.GSTComponentCode, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GSTComponentCode = value;
        }
      },
      error: (err) => {
        this.GSTComponentCode = this.getBlankObject();
      }
    });
  }

  onSubmit() {
    this.controlValidations()
    let requestData = [];
    let gstguid = uuidv4();
    requestData.push({
      "Key": "APIType",
      "Value": "SaveGSTSetup"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value": glob.getCompanyCode()
    })
    requestData.push({
      "Key": "GSTGUID",
      "Value": gstguid
    });
    requestData.push({
      "Key": "CountryCode",
      "Value": this.gstSetupForm.controls["CountryCode"].value
    });
    requestData.push({
      "Key": "GSTStateCode",
      "Value": this.gstSetupForm.controls["GSTStateCode"].value
    });
    requestData.push({
      "Key": "GSTGroupCode",
      "Value": this.gstSetupForm.controls["GSTGroupCode"].value
    });
    requestData.push({
      "Key": "GSTJuridictionCode",
      "Value": this.gstSetupForm.controls["GSTJuridictionCode"].value
    });
    requestData.push({
      "Key": "EffectiveDate",
      "Value": this.gstSetupForm.controls["EffectiveDate"].value
    });
    requestData.push({
      "Key": "GSTComponentCode",
      "Value": this.gstSetupForm.controls["GSTComponentCode"].value
    });
    requestData.push({
      "Key": "CalculationOrder",
      "Value": this.gstSetupForm.controls["CalculationOrder"].value
    })
    requestData.push({
      "Key": "GSTPercentage",
      "Value": this.gstSetupForm.controls["GSTPercentage"].value
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
            // this.controlValidations()
          }
        }
      });
  }

  getErrorMessage(control: string): string {
    let formControl = this.gstSetupForm.controls[control];
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
          this.gstJuridictionCode = value;
        }
      },
      error: (err) => {
        this.gstJuridictionCode = this.getBlankObject();
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
