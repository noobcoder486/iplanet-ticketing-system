import { Component,OnInit,ViewChild , Input, Output, EventEmitter, TemplateRef} from '@angular/core';
import xml2js from 'xml2js';
import * as glob from "../../../config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import { ImgUpload } from './image-upload.metadata';
import { CaseDetail } from '../repair-process.metadata';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {

  

cancle: boolean;
CancelBtn1(){
  this.cancle = false; 
  this.CancelBtn.emit(this.cancle)  
}

Dropdowngetvalues="";
OptionValus:any=['Image','Pdf/Doc','Zip/RAR']
OriginValue: any=['POP' , 'DIAGNOSIS' , 'HANDOVER' , 'REPAIR']
imgupload: ImgUpload;
UpdatedData: any[] = []
imgForm: FormGroup;

@Input() repap: CaseDetail;
errorMessage: any;
  


ngOnInit(): void { 
  this.imgupload = new ImgUpload()
  this.imgForm = this.formBuilder.group({
    OriginType: [null, Validators.required],
    FileType: [null, Validators.required],
  });

  this.SetImage()
}

@Input() repa:CaseDetail;
@Output() CancelBtn = new EventEmitter<any>();

imageList: any[]= []

async OnFileUploadClick(event: any) {
  for (var i = 0; i <= event.target.files.length - 1; i++) {
    let fileToUpload = <File>event.target.files[0];
    // const formData = new FormData();
    // var filename = uuidv4() + "_" + fileToUpload.name ;
    // formData.append('file', fileToUpload, filename);
    var ext =  fileToUpload.name.split('.').pop();
    var filename = uuidv4() +"." +  ext;
    const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename)
    // this.dynamicService.uploadFileToS3Local(formData).subscribe(
    //   {
    //     next: (value) => {
    //        ;
          
          let uploadedimage: any;
          uploadedimage = value;
          const imgform = this.imgForm.value
          this.PostToGsx({ "FileName" : filename ,"AttachmentOriginType":imgform.OriginType,"AttachmentFile":uploadedimage?.dbPath, "CloudFlag":"1"})
      //   }
        
      // });
      
  }
  
}


removeSelectedFile(item) {
  let index = this.imgupload.UploadedImageLists.indexOf(item);
  this.imgupload.UploadedImageLists.splice(index, 1);
}
  
// getImagePath() {
//   console.log("my Image File:", this.imgupload.UploadedImageLists)
//   let rowsDataValue = {
//     "rows": []
//   }
//   for (let StoreImage of this.imgupload.UploadedImageLists) {
//     rowsDataValue.rows.push({
//       "row": {
//         "AttachmentFile": StoreImage.AttachmentFile
//       }
//     })
//   }
//   console.log("rawData", rowsDataValue);
//   var builder = new xml2js.Builder();
//   var xml = builder.buildObject(rowsDataValue);
//   xml = xml.toString().replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
//   xml = xml.toString().replace(/(\r\n|\n|\r|\t)/gm, "");
//   //xml = xml.split(' ').join('')
//   console.log("xml", xml);
//   return xml;
// }

constructor(private  dynamicService: DynamicService,
  private toaster : ToastrService, 
  private formBuilder: FormBuilder, 
  private route: Router,    
  private dialogRef: MatDialog,
  private spinner: NgxSpinnerService,
  private gsxService: GsxService){
}



PostToGsx(objAttachment)
{
    var GSXCode = ""
    if(this.repa?.REPAIR?.GSXCode == null || this.repa?.REPAIR?.GSXCode==undefined )
    {
      GSXCode = ""
    }
    else
    {
      GSXCode = this.repa?.REPAIR?.GSXCode ;
    }
    if(objAttachment.AttachmentOriginType.toUpperCase() != 'REPAIR' && objAttachment.AttachmentOriginType.toUpperCase() != 'POP'   )
    {
      objAttachment.GsxAssetId=""
      this.onSubmit(objAttachment)
      return;
    }
    '';
    var attachments=[]
    attachments.push(objAttachment);
    var objData = {
      "GSXCode":GSXCode,
      "CaseGUID":this.repa?.CaseGUID,
      "notes": null,
      "attachments": attachments,
      "device":{"id":this.repa?.SerialNo1}
    };
  
  let strRequestData = JSON.stringify(objData);
  console.log(strRequestData);
  let contentRequest = {
    "content": strRequestData
  };
  ;
  this.spinner.show();
  this.gsxService.UpdateRepairNotesAndAttachmentsForIPlanet(contentRequest).subscribe(
    {
      
      next: (value) => {
        
        let response = JSON.parse(value.toString());
        if ((!(response.repairResult == undefined || response.repairResult == null) ) && (!(response.repairResult?.errors == undefined || response.repairResult?.errors == null))) {
          '';
          this.errorMessage = "";
          for( let iCtr = 0 ; iCtr < response.repairResult?.errors.length ; iCtr++)
          {
              this.errorMessage =  response.repairResult?.errors[iCtr].code + ' - ' + response.repairResult.errors[iCtr].message ;
              this.toaster.error(this.errorMessage,"Error",{closeButton:true,disableTimeOut:true})
          }
          //this.toastr.error(this.errorMessage);
          this.spinner.hide();
          

        }
        else if ((!(response.repairResult == undefined || response.repairResult == null) ) && (!(response.repairResult?.outcome == undefined || response.repairResult?.outcome == null))) {
        
          let erroraction="";
          this.errorMessage = response.repairResult?.outcome.action.toString() ;
          //this.toastr.error(errorMessage1);
          for( let iCtr = 0 ; iCtr < response.repairResult?.outcome.reasons.length ; iCtr++)
          {
            let errorType = "" ;
            errorType = response.repairResult?.outcome.reasons[iCtr].type.toString() ;
            //this.toastr.error(errorMessage1);
            for (let lCtr=0 ; lCtr < response.repairResult?.outcome.reasons[iCtr].messages.length; lCtr++)
            {
              var e1 = response.repairResult?.outcome.reasons[iCtr].messages[lCtr].description.toString() ;
              if(errorType.toUpperCase()=='WARNING')
              {
                this.toaster.warning(erroraction + ' - ' + errorType + ' - ' +  e1,"Warning",{closeButton:true,disableTimeOut:true});
              }
              else
              {
                this.toaster.error(erroraction + ' - ' + errorType + ' - ' +  e1,"Error",{closeButton:true,disableTimeOut:true});
              }
            }

          }
          if(response.attachments == undefined || response.attachments == null)
          {
            '';
            this.spinner.hide();
            this.toaster.error("Error While Uploading in GSX","Error",{closeButton:true,disableTimeOut:true});
          }
          else
          {
            '';
            
            this.toaster.success("Uploaded successfully to GSX","Success",{closeButton:true,disableTimeOut:true});
            this.spinner.hide();
            objAttachment.GsxAssetId=response.attachments[0].id
            this.onSubmit(objAttachment)
          }
    
        }
        else
        {
          if(response.attachments == undefined || response.attachments == null)
          {
            '';
            this.spinner.hide();
            this.toaster.error("Error While Uploading in GSX","Error",{closeButton:true,disableTimeOut:true});
          }
          else
          {
            '';
            
            this.toaster.success("Uploaded successfully to GSX","Success",{closeButton:true,disableTimeOut:true});
            this.spinner.hide();
            objAttachment.GsxAssetId=response.attachments[0].id
            this.onSubmit(objAttachment)
          }
        }
      },
        error: err => {
          
          console.log(err);
          this.spinner.hide();
          this.toaster.error(err.toString());
          return objAttachment;
        }
    });

}

onSubmit(objAttachment) {
  
  ''
  let AttachmentGuid = uuidv4();
  const imgform = this.imgForm.value
  let requestData = [];
    requestData.push({
      "Key": "ApiType",
      "Value": "SaveJobAttachment"
    });
    requestData.push({
      "Key": "AttachmentGUID",
      "Value": AttachmentGuid
    });
    requestData.push({
      "Key": "CaseId",
      "Value": this.repa?.CaseId
    });
    requestData.push({
      "Key": "GsxAssetId",
      "Value": objAttachment?.GsxAssetId == undefined || objAttachment?.GsxAssetId==null ?"":objAttachment?.GsxAssetId
    });
    
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.repa?.CaseGUID
    });
    requestData.push({
      "Key": "AttachmentOriginType",
      "Value": imgform.OriginType
    });
    requestData.push({
      "Key": "AttachmentFile",
      "Value": objAttachment.AttachmentFile
    });
    requestData.push({
      "Key": "AttachmentType",
      "Value": imgform.FileType
    });
    requestData.push({
      "Key": "CloudFlag",
      "Value": "1"
    });
    ;
    let strRequestData = JSON.stringify(requestData);
    console.log(strRequestData);
    let contentRequest = {
      "content": strRequestData
    };
    ;
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
      {
        next: (value) => {
          let response = JSON.parse(value.toString());

          if (response.ReturnCode == '0') {
            console.log("sucess");
            
            var objAttachment = JSON.parse(response.ExtraData);
            this.toaster.success('Submitted Succesfully')
            console.log("Image Data" , this.imgupload.UploadedImageLists)
            this.imgupload.UploadedImageLists.push({
            "src":   objAttachment.JobAttachment?.CloudFlag == "1" ? objAttachment.JobAttachment.AttachmentFile:  glob.GLOBALVARIABLE.SERVER_LINK+objAttachment.JobAttachment.AttachmentFile,
            "FileOrigin" :objAttachment.JobAttachment.AttachmentOriginType,
            "FileType": objAttachment.JobAttachment.AttachmentType,
            "CloudFlag" : objAttachment.JobAttachment?.CloudFlag ??  "0"
           });

          }
          else {
            this.errorMessage = response.ReturnMessage;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            parser.parseString(response.ErrorMessage, (err, result) => {
              response['errorMessageJson'] = result;

            });
          }
        },
        error: err => {
          console.log(err);
        }
      });
    
  }

  onDelete(item) {
  
  console.log("Data from item" , item)
  ''
    let requestData = [];
      requestData.push({
        "Key": "ApiType",
        "Value": "SaveJobAttachment"
      });
      requestData.push({
        "Key": "AttachmentGUID",
        "Value": item.AttachmentGUID
      });
      requestData.push({
        "Key": "CaseId",
        "Value": this.repa?.CaseId
      });
      requestData.push({
        "Key": "GsxAssetId",
        "Value": item?.GsxAssetId == undefined || item?.GsxAssetId==null ?"":item?.GsxAssetId
      });
      
      requestData.push({
        "Key": "CaseGuid",
        "Value": this.repa?.CaseGUID
      });
      requestData.push({
        "Key": "AttachmentOriginType",
        "Value": item.FileOrigin
      });
      requestData.push({
        "Key": "AttachmentFile",
        "Value": item.AttachmentFile
      });
      requestData.push({
        "Key": "AttachmentType",
        "Value": item.FileType
      });
      requestData.push({
        "Key": "IsDeleted",
        "Value": 1
      });
      ;
      let strRequestData = JSON.stringify(requestData);
      console.log(strRequestData);
      let contentRequest = {
        "content": strRequestData
      };
      ;
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            '';
            let response = JSON.parse(value.toString());
  
            if (response.ReturnCode == '0') {
              console.log("sucess");
              this.removeSelectedFile(item)
              var objAttachment = JSON.parse(response.ExtraData);
              this.toaster.success('Submitted Succesfully')
              console.log("Image Data" , this.imgupload.UploadedImageLists)
              this.imgupload.UploadedImageLists.push({
                "src": glob.GLOBALVARIABLE.SERVER_LINK+objAttachment.JobAttachment.AttachmentFile,
                "FileOrigin" :objAttachment.JobAttachment.AttachmentOriginType,
                "FileType": objAttachment.JobAttachment.AttachmentType });
            }
            else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                response['errorMessageJson'] = result;
  
              });
            }
          },
          error: err => {
            console.log(err);
          }
        });
      
    }

  SetImage(){
    console.log("Data" , this.repa?.JOBATTACHMENT?.ATTACHMENT)
      if(Array.isArray(this.repa?.JOBATTACHMENT?.ATTACHMENT))
      {
        for ( var item of this.repa?.JOBATTACHMENT?.ATTACHMENT)
        {
          this.imgupload.UploadedImageLists.push({
            "src":  item?.CloudFlag == "1" ? item.AttachmentFile : glob.GLOBALVARIABLE.SERVER_LINK+item.AttachmentFile,
            "FileOrigin" :item.AttachmentOriginType,
            "FileType": item.AttachmentType,
            "AttachmentGUID":item.AttachmentGUID,
            "AttachmentFile": item.AttachmentFile,
            "CreateDateTime" : item.CreatedDate
          })
        }
      }
  }

  url: string = glob.GLOBALVARIABLE.SERVER_LINK
  openImage(item){
    this.url = item?.CloudFlag == "1"  ? item.AttachmentFile :  glob.GLOBALVARIABLE.SERVER_LINK+item.AttachmentFile
  }

  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>;
  
  callAPI(item) {
    let dialogRef = this.dialogRef.open(this.callAPIDialog);
    dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
            if (result === 'yes') {
               this.onDelete(item) 
            } else if (result === 'no') {
              
            }
        }
    })
}
}


