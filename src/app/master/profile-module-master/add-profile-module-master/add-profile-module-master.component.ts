import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { DynamicService } from "src/app/common/Services/dynamicService/dynamic.service";
import { ToastrService } from "ngx-toastr";
import * as glob from "src/app/config/global";
import xml2js from "xml2js";
import { DropDownValue } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DropdownDataService } from "src/app/common/Services/dropdownService/dropdown-data.service";
import { DropDownType } from "src/app/custom-components/call-login/metadata/request.metadata";

@Component({
  selector: "app-add-profile-module-master",
  templateUrl: "./add-profile-module-master.component.html",
  styleUrls: ["./add-profile-module-master.component.css"],
})
export class AddProfileModuleMasterComponent implements OnInit {
  BindModuleId: DropDownValue = this.getBlankObject();
  BindProfileId: DropDownValue = this.getBlankObject();

  ModuleId:any;
  ProfileId:any;
  SelectedModule = [];
  viewAllowed: boolean = false;
  createAllowed: boolean = false;
  edit: boolean = false;
  deleteAllowed: boolean = false;
  import: boolean = false;
  export: boolean = false;
  showAllRows: boolean = true;
  searchedTerm: string = "";
  profileName: any;
  selectAll: boolean = false;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private dropdownDataService: DropdownDataService
  ) {}

  Serialized = "";
  formTitle: string = "Add";
  isEdit: boolean = false;
  params: any;
  errorMessage: String;

  ngOnInit(): void {
    this.onModuleIdSearch({ term: "", items: [] });
    this.onProfileIdSearch({ term: "", items: [] });

    this.params = this.activatedRoute.snapshot.queryParams;
    if (this.params.moduleid != null || this.params.moduleid != undefined) {
      this.getData();
      this.formTitle = "Edit";
      this.isEdit = true;
    }
    if (this.params.profileid != null || this.params.profileid != undefined) {
      this.ProfileId = this.params.profileid;
    }
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  filterData() {
    if (this.searchedTerm === "") {
      this.showAllRows = true;
    } else {
      this.showAllRows = false;
    }
  }

  onModuleIdSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.BindModuleId, $event.term, {})
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.BindModuleId = value;
            if (this.isEdit != true) {
              this.SelectedModule = value.Data;
            }
          }
        },
        error: (err) => {
          this.BindModuleId = this.getBlankObject();
        },
      });
  }

  SelectAllCheckBox() {
    for (let i = 0; i < this.SelectedModule.length; i++) {
      this.SelectedModule[i].SelectedModule = this.selectAll;
    }
  }

  onProfileIdSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService
      .fetchDropDownData(DropDownType.BindProfileId, $event.term, {})
      .subscribe({
        next: (value) => {
          if (value != null) {
            this.BindProfileId = value;
            for (let item of this.BindProfileId.Data) {
              if (item.Id == this.params.profileid) {
                this.profileName = item.TEXT;
              }
            }
          }
        },
        error: (err) => {
          this.BindProfileId = this.getBlankObject();
        },
      });
  }

  returnPrevious() {
    this.route.navigateByUrl(
      "/auth/" + glob.getCompanyCode() + "/profile-module-master"
    );
  }

  onSubmit() {
    let requestData = [];
    requestData.push({
      Key: "APIType",
      Value: "SaveProfileModuleMaster",
    });
    requestData.push({
      key: "ProfileId",
      Value: this.params.profileid,
    });
    requestData.push({
      key: "ProfileIdData",
      Value: this.saveProfileModuleXml(),
    });
    console.log("requestData",requestData)
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value) => {
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
        
      },
      error: (err) => {
        if (err.includes('"message":"Cannot')) {
        }
      },
    });
  }

  saveProfileModuleXml() {
    
    let rawData = { rows: [] };
    for (let item of this.SelectedModule) {
      rawData.rows.push({
        row: {
          ProfileId: this.params.profileid,
          ModuleId: item.Id,
          viewAllowed: item.viewAllowed  ==null || item.viewAllowed== undefined? false:item.viewAllowed,
          createAllowed: item.createAllowed == null || item.createAllowed == undefined ?false:item.createAllowed,
          edit: item.edit == null || item.edit== undefined ?false:item.edit,
          deleteAllowed: item.deleteAllowed == null || item.deleteAllowed == undefined?false:item.deleteAllowed,
          import: item.import == null || item.import == undefined ?false:item.import,
          export: item.export == null || item.export == undefined?false:item.export,
        },
      });
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(rawData);
    xml = xml
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
    xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
    console.log("xml", xml);
    return xml;
  }

  getData() {
    let requestData = [];
    requestData.push({
      Key: "APIType",
      Value: "GetProfileModuleObject",
    });
    requestData.push({
      Key: "ModuleId",
      Value: this.params.moduleid,
    });
    requestData.push({
      Key: "ProfileId",
      Value: this.params.profileid,
    });
    let strRequestData = JSON.stringify(requestData);
    let contentRequest = {
      content: strRequestData,
    };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value) => {
        let response = JSON.parse(Value.toString());
        if (response.ReturnCode == "0") {
          let data = JSON.parse(response.ExtraData)?.ProfileModule;
          console.log("After Get SP:- ",data)
          data.createAllowed = parseInt(data.createAllowed);
          data.deleteAllowed = parseInt(data.deleteAllowed);
          data.edit = parseInt(data.edit);
          data.export = parseInt(data.export);
          data.import = parseInt(data.import);
          data.viewAllowed = parseInt(data.viewAllowed);
          data.TEXT = data.ModuleName
          this.SelectedModule.push(data);
        } else {
          console.log("error");
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  handleError(response: any) {
    let errror =
      response.errorMessageJson.ERRORLIST.ERRORMESSAGE[0]["ERRORMESSAGE"];
    console.log(errror);
    var validationErrorMessage = errror[0];
    console.log(validationErrorMessage);
  }
}
