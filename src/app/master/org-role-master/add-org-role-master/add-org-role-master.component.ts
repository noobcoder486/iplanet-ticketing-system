import { OrgRole } from './org-role-master.metadata';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service'
import xml2js from 'xml2js';
import { ActivatedRoute, Router } from '@angular/router';
import * as glob from 'src/app/config/global'
import { ToastrService } from 'ngx-toastr';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';

@Component({
  selector: 'app-add-org-role-master',
  templateUrl: './add-org-role-master.component.html',
  styleUrls: ['./add-org-role-master.component.css']
})
export class AddOrgRoleMasterComponent implements OnInit {

  formTitle: string = 'Add';  //Default
  // Form Data
  orgRoleForm: FormGroup;
  // orgRole: OrgRole
  // For Edit 
  isEdit: boolean = false;
  params:any;

  errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private toaster: ToastrService,
  
  ) { }

  ngOnInit(): void {

    this.params = this.activatedRoute.snapshot.queryParams;
    // console.log("Params is :- ", this.params);
    if (this.params.orid != null || this.params.orid!= undefined ) {
      console.log("Edit Mode")
      this.isEdit = true;
      this.formTitle = 'Edit';
      this.getOrgObject();
    }

    this.orgRoleForm = this.formBuilder.group({
      OrgRoleName: [null, Validators.required],
      OrgRoleDescription: [null, Validators.required]
    });

    // this.orgRole.orgRoleForm = this.orgRoleForm
  }

  onSubmit(){
    let isFormValid = this.dynamicService.validateAllFormFields(this.orgRoleForm)
    console.log("Check if Valid", isFormValid);
    // return
    if (isFormValid) {
      let requestData =[]
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveOrgRoleMaster"
      });
      requestData.push({
        "Key": "OrgRoleName",
        "Value": this.orgRoleForm.value.OrgRoleName
      });
      requestData.push({
        "Key": "OrgRoleDescription",
        "Value": this.orgRoleForm.value.OrgRoleDescription
      });
      let strRequestData = JSON.stringify(requestData);
      let contentRequestData = {
        "Content": strRequestData
      }
      this.dynamicService.getDynamicDetaildata(contentRequestData).subscribe({
        next: (value) => {
          if (this.params.orid != null || this.params.orid!= undefined ) {       
            console.log("After SP Value is :- ", value);
            let response = JSON.parse(value.toString());
            if (response.ReturnCode === '0'){
              this.toaster.success("Data Edited Successfully");
              this.returnPrevious();
            }
            else{
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result)=>{
                response['errorMessageJson'] = result;
                this.handleError(response)
              });
            }
          }
          else{
            this.toaster.success("Data Submitted Successfully");

            this.returnPrevious();
          }
        },
        error: err => {
          console.log(err);
          if(err.includes('"message":"Cannot'))
          {
            this.controlValidations()
          }
        }
      })

    }
    else{
      console.log("Your Form Invalid");
    }
  }

  getOrgObject(){
    let requestData =[]
    requestData.push({
      "Key": "ApiType",
      "Value": "GetOrgRoleMasterObject"
    });
    requestData.push({
      "Key": "OrgRoleId",
      "Value": this.params.orid
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequestData ={
      "content": strRequestData
    }
    this.dynamicService.getDynamicDetaildata(contentRequestData).subscribe({
      next: (value) => {
        let response = JSON.parse(value.toString());
        console.log("AFTER Object Sp:-",response);
        let orgRoleObject = JSON.parse(response?.ExtraData)?.OrgRoleMasterObject;
        this.orgRoleForm.patchValue({
          OrgRoleName: orgRoleObject.OrgRoleName,
          OrgRoleDescription: orgRoleObject.OrgRoleDescription
        })
      }
    })
  }

  // Error handling
  getErrorMessage(control: string): string {
    let formControl = this.orgRoleForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }
  // Error handling
  handleError(response: any) {
    let errror = response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"]
    console.log(errror)
    var validationErrorMessage = errror[0]
    console.log(validationErrorMessage)
  }

  // Error Handling
  controlValidations() {
    Object.keys(this.orgRoleForm.controls).forEach(field => {
        let controlValue = this.orgRoleForm.get(field).value
        if (controlValue == null || controlValue == undefined) {
          this.orgRoleForm.get(field).setErrors({incorrect:true})
          this.toaster.error(field + " Cannot be Empty");
      }
    })
  }

  returnPrevious(){
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/org-role-master']);
  }

}
