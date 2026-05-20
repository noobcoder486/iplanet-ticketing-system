import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Controller } from 'src/app/config/comman.const';
import { ApiService } from 'src/app/core/service/api.service';
import { Columns } from 'src/app/models/column.metadata';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Observable } from 'rxjs';
import * as AWS from 'aws-sdk'
import * as glob from 'src/app/config/global';


@Injectable({
  providedIn: 'root'
})
export class DynamicService {

  constructor(
    private apiService: ApiService,
    private toaster: ToastrService
  ) {
    this.getAwsObject()
   }

  formControl = () => {
    let fields = JSON.parse(sessionStorage.getItem("FieldDetail"));
    return fields;
  }

  gridDetails = () => {
    let fields = JSON.parse(sessionStorage.getItem("GridModuleDetail"));
    return fields;
  }

  postDetail = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'AddDynamicData', data);
  }

  postGetData = (detail) => {
    return this.apiService.postData(Controller.Dynamic + 'GetDynamicData', detail);
  }

  postGetGridData = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetGridDetail', data);
  }


  getDropdown = (methodName) => {
    return this.apiService.getData(methodName);
  }

  getData = (spName) => {
    return this.apiService.getData(Controller.Dynamic + "GetData(spName=" + spName + ")");
  }

  uploadUserImage(param) {
    return this.apiService.upload(Controller.Register + 'UploadUserImage', param);
  }

  getActions = (mouduleName: any, moduleId: any, screenLayoutTypeId: any) => {
    let act = JSON.parse(sessionStorage.getItem("ModuleAction"))
    let moduleAction = act.filter(x => x.ModuleName == mouduleName && x.ModuleId == moduleId
      && x.ScreenLayoutTypeId == screenLayoutTypeId);
    return moduleAction;
  }

  registerUser = (user) => {
    return this.apiService.postData(Controller.Register + 'AddUser', user );
  }

  uploadFile = (param) => {
    return this.apiService.upload(Controller.Dynamic + 'AcUploadFile', param);
  }

  getImportField = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetImportDetail', data);
  }


  getDropdownData = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetDynamicDropdown', data);
  }
  getGuestQuoteData = (QuoteGuid) => {
    return this.apiService.getData(Controller.Guest + "getQuoteDetail/?QuoteGuid=" + QuoteGuid );
  }
  getGuestJobData = (CaseGuid) => {
    return this.apiService.getData(Controller.Guest + "getJobDetails/?caseguid=" + CaseGuid );
  }
 
  setGuestQuoteStatus = (QuoteGuid,QuoteStatus) => {
    return this.apiService.getData(Controller.Guest + "setQuoteStatus/?QuoteGuid=" + QuoteGuid + "&QuoteStatus=" + QuoteStatus );
  }

  getDropdownExtraData = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetDynamicDropdownExtra', data);
  }

  getComboSearch = (detail) => {
    return this.apiService.postData(detail.api, detail.data);
  }

  postDeleteData = (detail) => {
    return this.apiService.postData(Controller.Dynamic + 'DeleteDynamicData', detail);
  }
  generatePaymentLink = (detail) => {
    return this.apiService.postData(Controller.PaymentGateway + 'GetPaymentLink', detail);
  }
  
  getDropdownDataExtra = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetDynamicDropdownExtra', data);
  }
  getDynamicDetaildata = (data) => {
    return this.apiService.postData(Controller.Dynamic + 'GetDynamicDetaildata', data);
  }
  // Reset Password:- 
  sendResetPasswordRequest = (data) => {
    return this.apiService.postData(Controller.Guest + "sendResetPasswordRequest" , data );
  }  
  getResetPasswordObject = (ResetPasswordGUID) => {
    return this.apiService.getData(Controller.Guest + "getResetPasswordObject/?ResetPasswordGUID=" + ResetPasswordGUID );
  }
  SaveUserPassword = (data) => {
    return this.apiService.postData(Controller.Guest + "SaveUserPassword", data );
  }
  changeUserPassword = (data) => {
    return this.apiService.postData(Controller.Register + 'ChangeUserPassword', data);
  }

  GetLeads = (data) =>{
    return this.apiService.postData(Controller.LeadManagement + 'getOutboundCallData',  data)
  }
  makeOutboundCall = (data) => {
    return this.apiService.postData(Controller.LeadManagement + "makeOutboundCall", data );
  }
  saveCasaTokenLead = (data) => {
    return this.apiService.postData(Controller.LeadManagement + "saveCasaTokenLead", data );
  }
  saveCasaJobLead = (data) => {
    return this.apiService.postData(Controller.LeadManagement + "saveCasaJobLead", data );
  } 
  saveCasaInvoiceLead = (data) => {
    return this.apiService.postData(Controller.LeadManagement + "saveCasaInvoiceLead", data );
  }
  postToEdgistifyDirectly= (data) => {
    return this.apiService.postData(Controller.Reservation + "postToEdgistifyDirectly", data );
  }
  
  getColumn(datatyle: string, title: String, field: String): Columns {
    let cal = new Columns();
    cal.datatype = datatyle;
    cal.title = title;
    cal.field = field;
    return cal;
  }

  validateAllFormFields(formGroup: FormGroup) {
    
    let returnValue: boolean
    const fields = Object.keys(formGroup.controls);

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      let controlvalue = formGroup.get(field).value
      if (formGroup.get(field).hasValidator(Validators.required) ==true)
      {
        if (controlvalue == null || controlvalue == undefined ) {
          this.toaster.error(field + " Cannot be Empty")
          returnValue = false;
        }
        else if(field == "Email" || field == "email")
        {
          let emailValue = formGroup.get(field).value
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if(!emailPattern.test(emailValue))
          {
            this.toaster.error(field, "is not a acceptable format")
            returnValue = false;
            
          }
          
        }
      }
    }
    return returnValue == false ? false : true;
  }

  removeCommas(strPrice) {
    var strAmount = strPrice.replace(",", "");
    var fAmount = parseFloat(strAmount);
    return fAmount;
  }

  groupChildren(obj) {
    for (let prop in obj) {
      if (typeof obj[prop] === 'object') {
        this.groupChildren(obj[prop]);
      } else {
        obj['$'] = obj['$'] || {};
        obj['$'][prop] = obj[prop];
        delete obj[prop];
      }
    }
    return obj;
  }
  uploadimagefile(params) {
     ;
    return this.apiService.upload(Controller.Dynamic + 'UploadImageFile', params)
  }
  uploadFileToS3(params) {
    return this.apiService.upload(Controller.Dynamic + 'UploadFileToS3', params)
  }

  saveExcelData(params) {
    ;
   return this.apiService.upload(Controller.Dynamic + 'ImportDataFromExcel', params)
 }

  AwsObject
   async getAwsObject() {
     this.AwsObject = null
     let requestData = [];
     requestData.push({
       "Key": "APIType",
       "Value": "GetAwsBucketCredential"
     });
     requestData.push({
       "Key": "CompanyCode",
       "Value": glob.getCompanyCode()
     });
     let strRequestData = JSON.stringify(requestData);
     let contentRequest =
     {
       "content": strRequestData
     };
      const value =  await lastValueFrom (this.getDynamicDetaildata(contentRequest))
      try {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          this.AwsObject = JSON.parse(response?.ExtraData);
        }
      } catch (err) {
        console.log(err);
        this.AwsObject = null
        this.toaster.error("Please try again. " + err);
      }
   }

   async uploadFileToS3Local(file: File, filename: string): Promise<any> {
    if (this.AwsObject == null || this.AwsObject.AWS_REGION == null) {
      try {
        await this.getAwsObject();
      } catch (err) {
        throw new Error('Failed to get AWS credentials: ' + err.message);
      }
    }
    AWS.config.update({
      region: this.AwsObject.AWS_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: this.AwsObject.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AwsObject.AWS_SECRET_ACCESS_KEY
      })
    });
  
    const s3 = new AWS.S3();
    const params = {
      Bucket: this.AwsObject.BucketName,
      Key: `upload/workorder/${filename}`,
      Body: file,
      ContentType: file.type
    };
  
    return new Promise<any>((resolve, reject) => {
      s3.upload(params, (err: AWS.AWSError, data: AWS.S3.ManagedUpload.SendData) => {
        if (err) {
          console.error("Error uploading file:", err);
          reject(err); 
        } else {
          const fileUrl = data.Location;
          resolve({ dbPath: fileUrl });
        }
      });
    });
  }
  


}


