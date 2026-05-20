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
  selector: "app-add-profile-master",
  templateUrl: "./add-profile-master.component.html",
  styleUrls: ["./add-profile-master.component.sass"],
})
export class AddProfileMasterComponent implements OnInit {
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
  params: any;
  ProfileForm: FormGroup;
  errorMessage: String;

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.nc != null || this.params.nc != undefined) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true;
    }

    this.ProfileForm = this.formBuilder.group({
      ProfileName: [null, Validators.required],
      ProfileDescription: [null, Validators.required],
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
      "/auth/" + glob.getCompanyCode() + "/profile-master"
    );
  }

  onSubmit() {
    let isFormValid = this.dynamicService.validateAllFormFields(
      this.ProfileForm
    );
    if (isFormValid) {
      this.controlValidations();
      let requestData = [];
      requestData.push({
        Key: "APIType",
        Value: "SaveProfileMaster",
      });
      requestData.push({
        key: "ProfileName",
        Value: this.ProfileForm.controls["ProfileName"].value,
      });
      requestData.push({
        key: "ProfileDescription",
        Value: this.ProfileForm.controls["ProfileDescription"].value,
      });
      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        content: strRequestData,
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
        next: (value) => {
          if (this.params.nc != null || this.params.nc != undefined) {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode == "0") {
              let data = JSON.parse(response.ExtraData);
              this.toastMessage.success("Form Submitted Successfully");
              this.route.navigate(
                [
                  "/auth/" +
                    glob.getCompanyCode() +
                    "/add-profile-module-master",
                ],
                {
                  queryParams: {
                    profileid: data?.ProfileMaster?.ProfileId,
                  },
                }
              );
            } else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response["errorMessageJson"] = result;
                this.handleError(response);
              });
            }
          }
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == "0") {
            let data = JSON.parse(response.ExtraData);
            this.toastMessage.success("Form Submitted Successfully");
            this.route.navigate(
              ["/auth/" + glob.getCompanyCode() + "/add-profile-module-master"],
              {
                queryParams: {
                  profileid: data?.ProfileMaster?.ProfileId,
                },
              }
            );
          }
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
    Object.keys(this.ProfileForm.controls).forEach((field) => {
      let controlValue = this.ProfileForm.get(field).value;
      if (controlValue === null || controlValue === undefined) {
        this.ProfileForm.get(field).setErrors({ incorrect: true });
        this.toastMessage.error(field + " Cannot be Empty");
      }
    });
  }

  getData() {
    let params = this.activatedRoute.snapshot.queryParams;
    let requestData = [];
    requestData.push({
      Key: "APIType",
      Value: "GetProfileObject",
    });
    requestData.push({
      Key: "ProfileName",
      Value: params.cc,
    });
    requestData.push({
      Key: "ProfileDescription",
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
          let data = JSON.parse(response.ExtraData)?.ProfileObject;
          this.ProfileForm.patchValue({
            ProfileName: data.ProfileName,
            ProfileDescription: data.ProfileDescription,
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
    let formControl = this.ProfileForm.controls[control];
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
