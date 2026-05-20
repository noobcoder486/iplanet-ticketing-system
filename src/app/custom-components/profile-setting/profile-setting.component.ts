import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommonMessage } from 'src/app/config/global';
import { AddEditProfileModuleMetaData, ProfileListMetaData, ProfileModuleMetaData } from 'src/app/core/models/profilemodule.metadata';
import { CommonService } from 'src/app/core/service/common.service';
import { CustomComponentService } from '../custom-component.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})
export class ProfileSettingComponent implements OnInit {

  profileForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  profileModuleList: ProfileModuleMetaData[];
  addProfileModule: AddEditProfileModuleMetaData;

  profileId: number = 0;
  isEdit: boolean = false;
  profileInfo: ProfileListMetaData;
  permission: ProfileModuleMetaData;

  allViewChecked: boolean = false;
  allCreateChecked: boolean = false;
  allEditChecked: boolean = false;
  allDeleteChecked: boolean = false;
  allImportChecked: boolean = false;
  allExportChecked: boolean = false;
  
  breadCumbList: any[];

  constructor(
    private renderer: Renderer2,
    private messageService: ToastrService,
    private router: Router,
    private customService: CustomComponentService,
    private route: ActivatedRoute,
    private commonService: CommonService,
  ) {
    this.addProfileModule = new AddEditProfileModuleMetaData();
    this.profileInfo = new ProfileListMetaData();

    this.breadCumbList = this.commonService.getBreadCumbList(this.router.url);

    this.route.params.subscribe(params => {
      this.profileId = +params['id'];
      this.profileId = this.profileId > 0 ? this.profileId : 0;
      this.isEdit = this.profileId > 0 ? true : false;
    });

    this.route.data.subscribe((data: any) => {
      this.permission = this.commonService.getPermissionByScreenCode(data.ModuleId);
    })

  }

  ngOnInit(): void {
    this.createForm();
    this.getAllModules();
    if (this.isEdit) {
      this.getProfileById();
    }
  }

  createForm() {
    this.profileForm = new FormGroup({
      profilename: new FormControl(null),
      description: new FormControl(null),
    });
    this.setFormValidation();
  }

  setFormValidation() {
    for (var field in this.profileForm.controls) {
      const validators = [];
      if (field == "profilename") {
        validators.push(Validators.required);
      }
      if (field == "description") {
        validators.push(Validators.required);
      }

      this.profileForm.get(field).setValidators(validators);
      this.profileForm.get(field).updateValueAndValidity();
    }
  }

  getControlName(name) {
    switch (name) {
      case "profilename":
        return "profile Name";
        break;
      case "description":
        return "Description";
        break;
      default:
        return name;
        break;
    }
  }

  getProfileById() {
    this.customService.getProfileById(this.profileId)
      .subscribe((resp: any) => {
        this.profileInfo = resp;
        this.setFormData();
      },
        error => {
          this.messageService.error(CommonMessage.ErrorMessge);
        });
  }

  setFormData() {
    this.profileForm.patchValue({
      profilename: this.profileInfo.ProfileName,
      description: this.profileInfo.ProfileDescription,
    })
  }

  getAllModules() { 
    this.loading = true;
    this.customService.getProfileModuleList(this.profileId)
      .subscribe((resp: any) => {
        this.profileModuleList = resp;
        this.loading = false;
        this.setAllChecked();
      },
        error => {
          this.messageService.error(error.error);
        });
  }

  onChange(event, moduleId, type) {
    let result = this.profileModuleList.find(x => x.ModuleId == moduleId);
    if (result != undefined) {
      if (type == "View") {
        result.View = event.checked;
      }
      else if (type == "Create") {
        result.Create = event.checked;
      }
      else if (type == "Edit") {
        result.Edit = event.checked;
      }
      else if (type == "Delete") {
        result.Delete = event.checked;
      }
      else if (type == "Import") {
        result.Import = event.checked;
      }
      else if (type == "Export") {
        result.Export = event.checked;
      }
    }
    this.setAllChecked();
  }

  onAllChange(event, type) {
    for (let result of this.profileModuleList) {
      if (type == "View") {
        result.View = event.checked;
      }
      else if (type == "Create") {
        result.Create = event.checked;
      }
      else if (type == "Edit") {
        result.Edit = event.checked;
      }
      else if (type == "Delete") {
        result.Delete = event.checked;
      }
      else if (type == "Import") {
        result.Import = event.checked;
      }
      else if (type == "Export") {
        result.Export = event.checked;
      }
    }
  }

  setAllChecked() {
    let all = this.profileModuleList.length;
    let allView = this.profileModuleList.filter(x => x.View == true).length;
    this.allViewChecked = all == allView ? true : false;
    let allCreate = this.profileModuleList.filter(x => x.Create == true).length;
    this.allCreateChecked = all == allCreate ? true : false;
    let allEdit = this.profileModuleList.filter(x => x.Edit == true).length;
    this.allEditChecked = all == allEdit ? true : false;
    let allDelete = this.profileModuleList.filter(x => x.Delete == true).length;
    this.allDeleteChecked = all == allDelete ? true : false;
    let allImport = this.profileModuleList.filter(x => x.Import == true).length;
    this.allImportChecked = all == allImport ? true : false;
    let allExport = this.profileModuleList.filter(x => x.Export == true).length;
    this.allExportChecked = all == allExport ? true : false;
  }

  saveProfileModule() {
    if (this.profileForm.valid) {
      this.loading = true;
      var formData = this.profileForm.value;
      this.addProfileModule.ProfileId = this.profileId;
      this.addProfileModule.ProfileName = formData.profilename;
      this.addProfileModule.Description = formData.description;
      this.addProfileModule.ProfileModuleList = this.profileModuleList;

      this.customService.addEditProfileModule(this.addProfileModule)
        .subscribe((resp: any) => {
          this.loading = false;
          if (this.isEdit) {
            this.messageService.success('Profile setting updated successfully');
          }
          else {
            this.messageService.success('Profile setting added successfully');
          }
          this.commonService.backURL();
        },
          error => {
            this.loading = false;
            this.messageService.error(CommonMessage.ErrorMessge);
          });
    }
  }

  backToProfileList() {
    this.commonService.backURL();
  }

  onKeyPressEvent(event) {

  }

  onBlurEvent(event) {

  }

  breadCumbClick(url) {
    this.router.navigate([url]);
  }




}

