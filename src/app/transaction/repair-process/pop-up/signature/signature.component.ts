import { Component, OnInit, ViewChild , ElementRef , Input, Output, EventEmitter} from '@angular/core';
import SignaturePad from "signature_pad";
import { v4 as uuidv4 } from 'uuid';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { CaseDetail } from '../../repair-process.metadata';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})
export class SignatureComponent implements OnInit {

  SignatureFileName:String ;
  sig: SignaturePad;
  SignatureType: any = ['JOBCLOSESIGNATURE', 'AUTHORISED PERSON'] 
  SignatureTypeValue
  @Output() signatureValidate = new EventEmitter<any>();
  @Output() authorisedSignature = new EventEmitter<any>();


  @ViewChild("canvas", { static: true }) canvas: ElementRef;
  @Input() repa: CaseDetail;
  errorMessage: any;


  constructor(
    private  dynamicService: DynamicService,
    private toaster: ToastrService
  ) {
   
   }

   dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

  async SaveSignature()
  {
    '';
    console.log( this.sig.toDataURL());

    // const formDataSig = new FormData();
    // formDataSig.append('file', this.dataURLtoBlob(this.sig.toDataURL()),filename);
    var filename = uuidv4() + "_signature.png" ;   
    
    const signatureBlob = this.dataURLtoBlob(this.sig.toDataURL());
    const signatureFile = new File([signatureBlob], filename, { type: "image/png" });  
    try{
      const value = await this.dynamicService.uploadFileToS3Local(signatureFile, filename) 

      // this.dynamicService.uploadFileToS3Local( signatureFile, filename).subscribe(
      //   {
      //     next: (value) => {
            let uploadedimage: any;
            uploadedimage = value;
            this.SignatureFileName =  uploadedimage?.dbPath;
            this.onSubmit()
        //   },
        //   error: (err) => {
        //     this.toaster.error(err)
        //   },
        // });
    }
    catch (err) {
      this.toaster.error(err.message || err);
    }
  }



ClearSignature()
{
    this.sig.clear();
    this.SignatureFileName = "";
}

ngOnInit(): void {
  this.sig = new SignaturePad(this.canvas.nativeElement);
  this.SignatureFileName="";
}



onSubmit() {
  let AttachmentGuid = uuidv4();
  if(this.SignatureTypeValue != null || this.SignatureTypeValue != undefined){
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
      "Value": this.repa.CaseId
    });
    requestData.push({
      "Key": "CaseGuid",
      "Value": this.repa.CaseGUID
    });
    requestData.push({
      "Key": "AttachmentOriginType",
      "Value": this.SignatureTypeValue
    });
    requestData.push({
      "Key": "AttachmentFile",
      "Value": this.SignatureFileName
    });
    requestData.push({
      "Key": "AttachmentType",
      "Value": "Signature"
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
            
            this.toaster.success('Submitted Succesfully')
            var getval = JSON.parse(response.ExtraData);
            if(this.SignatureTypeValue == 'JOBCLOSESIGNATURE'){
            this.signatureValidate.emit(this.SignatureFileName)
            }

            if(this.SignatureTypeValue == 'AUTHORISED PERSON'){
              this.authorisedSignature.emit(this.SignatureFileName)
              }
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
    }else{
      this.toaster.error('Please Select Signature Type')
    }
  }
}

 

