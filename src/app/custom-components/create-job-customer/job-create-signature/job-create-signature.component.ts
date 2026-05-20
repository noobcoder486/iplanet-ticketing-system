import { Component, OnInit, ViewChild , ElementRef , Input, Output, EventEmitter} from '@angular/core';
import SignaturePad from "signature_pad";
import { v4 as uuidv4 } from 'uuid';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';

@Component({
  selector: 'app-job-create-signature',
  templateUrl: './job-create-signature.component.html',
  styleUrls: ['./job-create-signature.component.sass']
})
export class JobCreateSignatureComponent implements OnInit {

  SignatureFileName:String ;
  sig: SignaturePad;

  @Output() signatureValidate = new EventEmitter<any>();
  @Output() CloseEvent = new EventEmitter<any>();


  @ViewChild("canvas", { static: true }) canvas: ElementRef;
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
     ;
    console.log( this.sig.toDataURL());

    var filename = uuidv4() + "_signature.png" ;
    
    // const formDataSig = new FormData();
    // formDataSig.append('file', this.dataURLtoBlob(this.sig.toDataURL()),filename);

    const signatureBlob = this.dataURLtoBlob(this.sig.toDataURL());
    const signatureFile = new File([signatureBlob], filename, { type: "image/png" });  
    try{
      const value = await this.dynamicService.uploadFileToS3Local(signatureFile, filename) 

      // this.dynamicService.uploadFileToS3Local( signatureFile, filename).subscribe(
      //   {
      //     next: (value) => {
            let uploadedimage: any;
            uploadedimage = value;
            var close = false 
            this.SignatureFileName =  uploadedimage?.dbPath;
            this.signatureValidate.emit(this.SignatureFileName)
            console.log("Sig" ,this.SignatureFileName )
            this.CloseEvent.emit(close)
        //   },
        //     error: (err) => {
        //       this.toaster.error(err)
        //     },
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


}
