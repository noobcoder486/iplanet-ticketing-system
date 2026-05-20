import xml2js from 'xml2js';
import * as glob from 'src/app/config/global'
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { CompanyResourceMapping } from './company-mapping.metadata';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-add-company-material-resource-mapping',
  templateUrl: './add-company-material-resource-mapping.component.html',
  styleUrls: ['./add-company-material-resource-mapping.component.sass']
})
export class AddCompanyMaterialResourceMappingComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) { }
  companyMappingForm: FormGroup;
  formTitle: string = "Add"
  params: any;
  isEdit:boolean = false;
  companyResourceMapping: CompanyResourceMapping;
  errorMessage: String;
  TaxType: DropDownValue = this.getBlankObject();
  GSTGroupCode: DropDownValue = this.getBlankObject();
  ItemCode: DropDownValue = this.getBlankObject();
  ItemType: any[]= [
    {"Id":"Material","TEXT":"Material"},
    {"Id":"Resource","TEXT":"Resource"}
  ]
  
  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.companyResourceMapping = new CompanyResourceMapping()
    this.companyMappingForm = this.formBuilder.group({
      ItemType: [null, Validators.required],
      ItemCode: [null, Validators.required],
      TaxType: [null, Validators.required],
      GSTGroupCode: [null, Validators.required],
      UnitPrice: [null, Validators.required],
      LocalCurrencyCode: [null, Validators.required]
    })
    this.onTaxType({ term: '', items: [] })
    this.onGSTGroupCode({ term: '', items: []})
    this.companyResourceMapping.companyMappingForm = this.companyMappingForm
  }

  controlValidations()
  {
    Object.keys(this.companyMappingForm.controls).forEach(field => {
      let controlValue = this.companyMappingForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  getData() {
    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "GetCompanyMappingObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": this.params.cc
    });
    requestData.push({
      "Key": "ItemCode",
      "Value": this.params.nc

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
            let data = JSON.parse(response.ExtraData)?.CompanyMapping;
            this.companyMappingForm.patchValue({
              ItemCode: data.ItemCode,
              ItemType: data.ItemType,
              TaxType: data.TAXType,
              GSTGroupCode: data.GSTGroupCode,
              UnitPrice: data.UnitPrice,
              LocalCurrencyCode: data.LocalCurrencyCode
            })
            this.onItemTypeSelect({term:"",items:[]})
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

  onSubmit() {

    Object.keys(this.companyMappingForm.controls).forEach(field => {
      let control = this.companyMappingForm.get(field).value
      if (control == null || control == undefined) {
        // this.toastMessage.error(field + " Cannot be Empty")
      }
    })

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveCompanyMapping"
    });
    requestData.push({
      "Key": "CompanyCode",
      "Value" : glob.getCompanyCode()
    })
    requestData.push({
      "Key": "ItemType",
      "Value": this.companyMappingForm.controls["ItemType"].value
    });
    requestData.push({
      "Key": "ItemCode",
      "Value": this.companyMappingForm.controls["ItemCode"].value
    });
    requestData.push({
      "Key": "TAXType",
      "Value": this.companyMappingForm.controls["TaxType"].value
    });
    requestData.push({
      "Key": "GSTGroupCode",
      "Value": this.companyMappingForm.controls["GSTGroupCode"].value
    });
    requestData.push({
      "Key": "UnitPrice",
      "Value": this.companyResourceMapping.UnitPrice
    });
    requestData.push({
      "Key": "LocalCurrencyCode",
      "Value": this.companyResourceMapping.LocalCurrencyCode
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
        next: (Value) => {

          let response = JSON.parse(Value.toString());

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
          console.log(err);
          if(err.includes('"message":"Cannot'))
          {
            this.controlValidations()
          }
        }
      });


  }
  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
    var validationErrorMessage  = errror[0]
    this.toastMessage.error(validationErrorMessage)
  }

  returnPrevious()
  {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/company-mapping')
  }

  onItemTypeSelect($event){
    if(this.companyMappingForm.controls["ItemType"].value=="Material")
    {
      this.onMaterialItemCode({ term:"", items:[] })
    }
    else
    {
      this.onResourceItemCode( {term:"", items:[] })
    }
  }

  
  onTaxType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.TaxType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.TaxType = value;
        }
      },
      error: (err) => {
        this.TaxType = this.getBlankObject();
      }
    });
  }

  onGSTGroupCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.GSTGroupCode, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.GSTGroupCode = value;
        }
      },
      error: (err) => {

        this.GSTGroupCode = this.getBlankObject();
      }
    });
  }

  onMaterialItemCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.MaterialItemCode, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ItemCode = value;
        }
      },
      error: (err) => {
        this.ItemCode = this.getBlankObject();
        this.companyResourceMapping.ItemCode = null;
      }
    });
  }

  onResourceItemCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.ResourceItemCode, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ItemCode = value;
        }
      },
      error: (err) => {
        this.ItemCode = this.getBlankObject();
        this.companyResourceMapping.ItemCode = null;
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
