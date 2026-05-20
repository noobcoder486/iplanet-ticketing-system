import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import { Resource } from '../add-resource-master/resource-master.metadata';
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'

@Component({
  selector: 'app-add-resource-master',
  templateUrl: './add-resource-master.component.html',
  styleUrls: ['./add-resource-master.component.sass']
})
export class AddResourceMasterComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route : Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService
  ) { }

  resourceForm: FormGroup;
  params:any;
  isEdit:boolean = false;
  resource: Resource;
  formTitle: string = "Add"
  errorMessage: String;
  ResourceType: DropDownValue = this.getBlankObject();
  ProductCategory: DropDownValue = this.getBlankObject();

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.resource = new Resource();
    this.resourceForm = this.formBuilder.group({
      ResourceCode: [null, Validators.required],
      ResourceName: [null, Validators.required],
      ResourceDescription: [null, Validators.required],
      ResourceType: [null, Validators.required],
      ProductCategory: [null, Validators.required],
      DivisionCode: [],
      BaseUOM: [],
      SalesUOM: [],

    });
    this.resource.resourceForm = this.resourceForm;
    this.onResourceType({ term: '', items: [] })
    this.onProductCategory({ term: '', items: [] })
  }

  controlValidations() {
    Object.keys(this.resourceForm.controls).forEach(field => {
      let controlValue = this.resourceForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }

  getData(){ 
    let requestData= [];

    requestData.push({
      "Key":"ApiType",
      "Value": "GetResourceObject"
    });

    requestData.push({
      "Key": "CompanyCode",
      "Value": this.params.cc
    });
    requestData.push({
      "Key": "ResourceCode",
      "Value": this.params.nc

    });
    

    let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      ;

      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next :(value) => {
            let response = JSON.parse(value.toString());
            ;
            if(response.ReturnCode =='0')
            {
              let data = JSON.parse(response.ExtraData)?.Resource;
              this.resourceForm.patchValue({
                ResourceCode : data.ResourceCode,
                ResourceName :data.ResourceName,
                ResourceDescription : data.ResourceDescription,
                ResourceType : data.ResourceType,
                ProductCategory: data.ProductCategory,
                DivisionCode: data.DivisionCode,
                BaseUOM: data.BaseUOM,
                SalesUOM: data.SalesUOM
              })
                         
            }
            else{
              console.log("error");
            }
  
          },
          error :err =>{
            console.log(err);
          }
          });
  }

  returnPrevious()
  {
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/resource-master')
  }

  onSubmit() {
    this.controlValidations()

    let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveResourceMaster"
    });
    requestData.push({
      "Key": "ResourceCode",
      "Value": this.resourceForm.controls["ResourceCode"].value
    });
    requestData.push({
      "Key": "ProductCategory",
      "Value": this.resourceForm.controls["ProductCategory"].value
    });
    requestData.push({
      "Key": "ResourceDescription",
      "Value": this.resourceForm.controls["ResourceDescription"].value
    });
    requestData.push({
      "Key": "ResourceName",
      "Value": this.resourceForm.controls["ResourceName"].value
    });
    requestData.push({
      "Key": "ResourceType",
      "Value": this.resourceForm.controls["ResourceType"].value
    })
    requestData.push({
      "Key": "DivisionCode",
      "Value": this.resourceForm.controls["DivisionCode"].value
    });
    requestData.push({
      "Key": "BaseUOM",
      "Value": this.resourceForm.controls["BaseUOM"].value
    });
    requestData.push({
      "Key": "SalesUOM",
      "Value": this.resourceForm.controls["SalesUOM"].value
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
    let formControl = this.resourceForm.controls[control];
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

  onProductCategory($event: { term: String, items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ProductCategory, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ProductCategory = value;
        }
      },
      error: (err) => {
        this.ProductCategory = this.getBlankObject();
      }
    })
  }

  onResourceType($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.ResourceType, $event.term, {

    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.ResourceType = value;
        }
      },
      error: (err) => {
        this.ResourceType = this.getBlankObject();
      }
    });
  }


}
