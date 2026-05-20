import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropDownValue, DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import * as glob from 'src/app/config/global'
import xml2js from 'xml2js';
import { Salesperson } from './salesperson-master.metadata';
@Component({
  selector: 'app-add-salesperson-master',
  templateUrl: './add-salesperson-master.component.html',
  styleUrls: ['./add-salesperson-master.component.css']
})
export class AddSalespersonMasterComponent {

  constructor(
    private formBuilder: FormBuilder,
    private route : Router,
    private dropdownDataService: DropdownDataService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toastMessage: ToastrService
  ) { }

  salespersonForm: FormGroup;
  params:any;
  isEdit:boolean = false;
  salesperson: Salesperson;
  formTitle: string = "Add"
  errorMessage: String;
  isDelete:boolean = false
  LocationAccGroup: DropDownValue = this.getBlankObject();


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.cc != null || this.params.cc != undefined) {
      this.getData()
      this.formTitle = "Edit"
      this.isEdit = true
    }
    this.salesperson = new Salesperson();
    this.onLocationAccGroupCode({ term: '', items: [] })

    this.salespersonForm = this.formBuilder.group({
      EmployeeCode: [null, Validators.required],
      SalesPersonName: [null, Validators.required],
      LocationCode: [null, Validators.required],
    });
  }

  controlValidations() {
    Object.keys(this.salespersonForm.controls).forEach(field => {
      let controlValue = this.salespersonForm.get(field).value
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty")
      }
    })
  }
  getDelete(){

  }
  getData(){ 
    let requestData= [];
    requestData.push({
      "Key":"APIType",  
      "Value": "GetSalesPersonObject"
    });
    requestData.push({
      "Key": "EmployeeCode",
      "Value": this.params.cc
    });  
    let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next :(value) => {
            let response = JSON.parse(value.toString());
            if(response.ReturnCode =='0')
            { 
              let data = JSON.parse(response.ExtraData)?.SalesPersonObject;
              this.salespersonForm.patchValue({
                EmployeeCode : data.EmployeeCode,
                SalesPersonName:data.SalesPersonName,
                LocationCode : data.LocationCode,
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
    this.route.navigateByUrl('/auth/'+glob.getCompanyCode()+'/salesperson-master')
  }

  onSubmit() {
    this.controlValidations()
    let requestData = [];
    requestData.push({
      "Key": "APIType",
      "Value": "SaveSalesPerson"
    });
    requestData.push({
      "Key": "EmployeeCode",
      "Value": this.salespersonForm.controls["EmployeeCode"].value
    });
    requestData.push({
      "Key": "SalesPersonName",
      "Value": this.salespersonForm.controls["SalesPersonName"].value
    });
    requestData.push({
      "Key": "LocationCode",
      "Value": this.salespersonForm.controls["LocationCode"].value
    });
    requestData.push({
      "Key":"IsDeleted",
      "Value":this.isDelete
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
    let formControl = this.salespersonForm.controls[control];
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

  
  onLocationAccGroupCode($event: { term: string; items: any[] }) {

    this.dropdownDataService.fetchDropDownData(DropDownType.Location, $event.term, {
      CompanyCode: glob.getCompanyCode().toString()
    }).subscribe({
      next: (value) => {
        if (value != null) {
          this.LocationAccGroup = value;
        }
      },
      error: (err) => {
        this.LocationAccGroup = this.getBlankObject();
      }
    });
  }


}
