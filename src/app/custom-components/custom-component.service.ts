import { Injectable } from '@angular/core';
import { Controller } from '../config/global';
import { ApiService } from '../core/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomComponentService {

  constructor(private apiService: ApiService) { }

  userRegistration(param) {
    return this.apiService.postData(
      Controller.Register + 'AddEditUserRegistration',
      param
    );
  }

  getUserFormValidation() {
    let path = 'assets/forms-json/userForm.json';
    return this.apiService.getFileData(path);
  }


  addUser(param) {
    return this.apiService.postData(Controller.Register + 'AddUser', param);
  }

  getUserList() {
    return this.apiService.getData(Controller.Register + 'GetUserList()');
  }

  getUserById(userName) {
    return this.apiService.getData(Controller.Register + 'GetUserById(userName=' + userName + ')');
  }

  uploadUserImage(param) {
    return this.apiService.upload(Controller.Register + 'UploadUserImage', param);
  }

  getOrgRoleList() {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetOrgRoleList()');
  }

  addEditOrgRole(param) {
    return this.apiService.postData(Controller.SystemAdministrator + 'AddEditOrgRole', param);
  }

  getJobRoleList() {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetJobRoleList()');
  }

  getJobRoleById(jobRoleId) {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetJobRoleById(jobRoleId=' + jobRoleId + ')');
  }

  addEditJobRole(param) {
    return this.apiService.postData(Controller.SystemAdministrator + 'AddEditJobRole', param);
  }

  getProfileModuleList(profileId) {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetAllProfileModuleList(profileId=' + profileId + ')');
  }

  addEditProfileModule(param) {
    return this.apiService.postData(Controller.SystemAdministrator + 'AddEditProfileModule', param);
  }

  getProfileList() {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetProfileList()');
  } 

  getProfileById(profileId) {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetProfileById(profileId=' + profileId + ')');
  }

  decryptText(param) {
    return this.apiService.postData(Controller.SystemAdministrator + 'DecryptText', param);
  }






}