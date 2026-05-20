import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { ToastrService } from "ngx-toastr";
import { FormGroup } from "@angular/forms";
import * as glob from "src/app/config/global";
import xml2js from "xml2js";



@Component({
  selector: "app-add-jobrole-master",
  templateUrl: "./add-jobrole-master.component.html",
  styleUrls: ["./add-jobrole-master.component.css"],
})
export class AddJobroleMasterComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService
  ) {}

  Serialized = "";
  formTitle: string = "Add";
  isEdit: boolean = false;
  MyFunction_T() {
    this.Serialized;

    let tgl = this.Serialized;
    if (tgl == "") {
      console.log(1);
    } else {
      console.log(0);
    }
  }

  params: any;
  jobRoleForm: FormGroup;
  errorMessage: String;

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true;
    }

    this.jobRoleForm = this.formBuilder.group({
      // JobRoleId:[null],
      JobRoleName: [null, Validators.required],
      JobRoleDescription: [null, Validators.required],
      ReportToJobRoleId: [null, Validators.required],
      ProfileId: [null, Validators.required],
      startTime: [null],
      endTime: [null] 
    });
  }

  slideval = false;

  public newslide(event: any): void {
    if (event.checked) {
      console.log("true");
    } else {
      console.log("false");
    }
  }

  returnPrevious() {
    this.route.navigateByUrl(
      "/auth/" + glob.getCompanyCode() + "/jobrole-master"
    );
  }

  onSubmit() {
    let isFormValid = this.dynamicService.validateAllFormFields(
      this.jobRoleForm
    );
    console.log("Check if Valid", isFormValid);
    if (isFormValid) {
      this.controlValidations();
      let requestData = [];
      requestData.push({
        Key: "APIType",
        Value: "SaveJobRoleMaster",
      });
      requestData.push({
        key: "JobRoleName",
        Value: this.jobRoleForm.controls["JobRoleName"].value,
      });
      requestData.push({
        key: "JobRoleDescription",
        Value: this.jobRoleForm.controls["JobRoleDescription"].value,
      });
      requestData.push({
        key: "ReportToJobRoleId",
        Value: this.jobRoleForm.controls["ReportToJobRoleId"].value,
      });
      requestData.push({
        key: "ProfileId",
        Value: this.jobRoleForm.controls["ProfileId"].value,
      });
      requestData.push({
        key: "StartTime",
        Value: this.jobRoleForm.controls["startTime"].value,
      });
      requestData.push({
        key: "EndTime",
        Value: this.jobRoleForm.controls["endTime"].value,
      });
      console.log("SAVE****JB", requestData);
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        content: strRequestData,
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          if (this.params.nc != null || this.params.nc != undefined) {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == "0") {
              this.toastMessage.success("Form Submitted Successfully");
              this.returnPrevious();
            } else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response["errorMessageJson"] = result;
                this.handleError(response);
              });
            }
          }
          this.toastMessage.success("Form Submitted Successfully");
          this.returnPrevious();
        },
        error: (err) => {
          if (err.includes('"message":"Cannot')) {
            this.controlValidations();
          }
        },
      });
    }
  }

  controlValidations() {
    Object.keys(this.jobRoleForm.controls).forEach((field) => {
      let controlValue = this.jobRoleForm.get(field).value;
      if (controlValue === null || controlValue === undefined) {
        this.jobRoleForm.get(field).setErrors({ incorrect: true });
        this.toastMessage.error(field + " Cannot be Empty");
      }
    });
  }

  getData() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];
    requestData.push({
      Key: "APIType",
      Value: "GetJobRoleIdObject",
    });
    requestData.push({
      Key: "JobRoleName",
      Value: params.cc,
    });
    requestData.push({
      Key: "JobRoleDescription",
      Value: params.nc,
    });

    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == "0") {
          let data = JSON.parse(response.ExtraData)?.JobRole;
          ;
          this.jobRoleForm.patchValue({
            JobRoleId: data.JobRoleId,
            JobRoleName: data.JobRoleName,
            JobRoleDescription: data.JobRoleDescription,
            ReportToJobRoleId: data.ReportToJobRoleId,
            ProfileId: data.ProfileId,
            startTime: data.StartTime,
            endTime: data.EndTime
          });
        } else {
          console.log("error");
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getErrorMessage(control: string): string {
    let formControl = this.jobRoleForm.controls[control];
    if (formControl.valid) {
      return "";
    } else {
      console.log(formControl.errors);
      return formControl.errors?.Message;
    }
  }

  handleError(response: any) {
    let errror =
      response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(errror);
    var validationErrorMessage = errror[0];
    console.log(validationErrorMessage);
  }
}
