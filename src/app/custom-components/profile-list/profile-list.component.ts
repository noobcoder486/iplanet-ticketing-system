import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { AppRouter } from 'src/app/config/comman.const';
import { ProfileListMetaData, ProfileModuleMetaData } from 'src/app/core/models/profilemodule.metadata';
import { CustomComponentService } from '../custom-component.service';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss']
})
export class ProfileListComponent implements OnInit {

  loading: boolean = false;
  profileList: ProfileListMetaData[];

  source: LocalDataSource = new LocalDataSource();
  permission: ProfileModuleMetaData;

  settings = {
    mode: 'external',
    actions: {
      add: false,
    },

    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      saveButtonContent: '<i class="ion-checkmark"></i>',
      cancelButtonContent: '<i class="ion-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      ProfileName: { title: 'Profile Name', },
      ProfileDescription: { title: 'Description', },
    },
  };

  constructor(
    private router: Router,
    private customtService: CustomComponentService,
  ) {
    this.permission = new ProfileModuleMetaData();
  }

  ngOnInit(): void {
    this.getProfileList();
  }

  getProfileList() {
    this.loading = true;
    this.customtService.getProfileList()
      .subscribe((resp: any) => {
        this.profileList = resp;
        this.source.load(this.profileList);
        this.loading = false;
      },
        error => {
          this.loading = false;
        }
      );
  }

  addProfileSetting() {
    this.router.navigate([AppRouter.SystemAdministrator + '/' + AppRouter.AddEditProfileSetting + '/' + 0]);
  }

  editPofile(profile: ProfileListMetaData) {
    this.router.navigate([AppRouter.SystemAdministrator + '/' + AppRouter.AddEditProfileSetting + '/' + profile.ProfileId]);
  }

  getUserPermission() {
    // this.permission = this.commonService.getPermissionByScreenCode(this.screen.ModuleId);
  }


  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  add(event) {
  }

  edit(event) {
    this.router.navigate([AppRouter.SystemAdministrator + '/' + AppRouter.AddEditProfileSetting + '/' + event.data.ProfileId]);
  }


}
