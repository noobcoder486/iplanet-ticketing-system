import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from 'src/app/config/global';
import { ActivatedRoute, Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import xml2js from 'xml2js';
@Component({
  selector: 'app-verification-popup',
  templateUrl: './verification-popup.component.html',
  styleUrls: ['./verification-popup.component.css']
})
export class VerificationPopupComponent implements OnInit {



  @Input() verificationArray: any={};
  @Input() questionArray: any={};
  @Input() answerArray: any={};
  @Input() imageListArray: any={};
  @Input() addcosmeticWithCondition: any={};


  isNONSERIALIZED:boolean=false;
  isWOHDMI:boolean=false;
  SignatureFileName:String ;
  authorSigFileName:String;
  AuthorizationFileName:String;
  
  @ViewChild("customerSign", { static: true }) customerSignature: ElementRef;
  customerSignPad: SignaturePad;

  @ViewChild("authorizationSign", { static: true }) authorizationSignature: ElementRef;
  authorizationSignPad:SignaturePad;
        
  questionItem:any[]=[];
  cosmeticWithConditionItem:any[]=[];
  answerItem:any[]=[];
  imageStr:any[]=[];
  signArray:any[]=[];

  close: boolean;
  CloseEvent: any;
  toaster: any;
  SignatureTypeValue: string;
  authorisedSignature: any;
  errorMessage: any;
  
  constructor(
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    private toasty: ToastrService,
  ) { }

  CustomerCode1;
  EmailID;
  MobileNo;
  CountryCode;
  CustomerName;
  FirstName;
  LastName;
  Address1;

  @Output() CancelBtn = new EventEmitter<any>();
  @Output() SaveBtn = new EventEmitter<any>();
  @Output() signatureValidate = new EventEmitter<any>();
  @Output() authorizationValidate = new EventEmitter<any>();


  async authSaveSignature()
  {
    var filename = uuidv4() + "_signature.png" ;
    
    // const authorSig = new FormData();
    // authorSig.append('file', this.dataURLtoBlob(this.authorizationSignPad.toDataURL()),filename);
       
    const signatureBlob = this.dataURLtoBlob(this.authorizationSignPad.toDataURL());
    const signatureFile = new File([signatureBlob], filename, { type: "image/png" });  
    try{
          const value = await this.dynamicService.uploadFileToS3Local(signatureFile, filename) 
          
          let uploadedimage: any;
          uploadedimage = value;
          this.authorSigFileName =  uploadedimage?.dbPath;
          this.authorizationValidate.emit(this.authorSigFileName)
          this.verificationSave()
    }
    catch (err) {
      this.toasty.error(err.message || err);
    }
  }


  async SaveSignature()
  { 

    var filename = uuidv4() + "_signature.png" ;
    
    // const customerSig = new FormData();
    // customerSig.append('file', this.dataURLtoBlob(this.customerSignPad.toDataURL()),filename);
    
    const signatureBlob = this.dataURLtoBlob(this.customerSignPad.toDataURL());
    const signatureFile = new File([signatureBlob], filename, { type: "image/png" });  
    try{
          const value = await this.dynamicService.uploadFileToS3Local(signatureFile, filename) 
          
          let uploadedimage: any;
          uploadedimage = value;
          this.SignatureFileName =  uploadedimage?.dbPath;
          this.signatureValidate.emit(this.SignatureFileName)
          this.authSaveSignature()
    }
    catch (err) {
      this.toasty.error(err.message || err);
    }
  }

  save: boolean;
verificationSave(){
  //Check The Authorization Sign
  if(this.authorizationSignPad.isEmpty())
  {
    this.toasty.error("Please Add Authorization Signature.");
    return ;
  }

  //Check The Customer Sign
  if(this.customerSignPad.isEmpty())
  {
    this.toasty.error("Please Add Customer Signature.");
    return ;
  }

  this.save = true; 
  this.SaveBtn.emit(this.save)  
}
 
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


 
  ngOnInit(): void { 
    this.getData() 
    this.imagePush()
    this.customerSignPad = new SignaturePad(this.customerSignature.nativeElement);
    this.authorizationSignPad = new SignaturePad(this.authorizationSignature.nativeElement);
   

    this.SignatureFileName="";
    this.authorSigFileName="";
  
    if(this.verificationArray.productType == 'NONSERIALIZED')
    {
      this.isNONSERIALIZED=true;
    }

    if(this.verificationArray.productType == 'WOHDMI')
    {
      this.isWOHDMI=true;
    }
  }

 //Verification PopUp close Function
isverificationPopClose()
{
  this.close = false; 
  this.CancelBtn.emit(this.close)
}

//Images Push [To HTML]
imagePush()
{ 
  for(let i=0; i<this.imageListArray.length ; i++)
  {
  //  console.log("list 1 = "+this.imageListArray[i][0]['src'])
   this.imageStr.push(this.imageListArray[i][0]['src']); 
 
  }
  
}

//This Function pass boolean value to create-job-customer for form submit


//Customer Details Function
getData() {
    
  let params = this.activatedRoute.snapshot.queryParams;
  let requestData = [];
  requestData.push({
    "Key": "ApiType",
    "Value": "GetRtlCustomerObject"
  });

  requestData.push({
    "Key": "CompanyCode",
    "Value": glob.getCompanyCode()
  });
  requestData.push({
    "Key": "CustomerCode",
    "Value": params.nc

  });
  let strRequestData = JSON.stringify(requestData);
  let contentRequest = {
    "content": strRequestData
  };

  this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
    {
      next: (value) => {
        let response = JSON.parse(value.toString());
        if (response.ReturnCode == '0') {
          

          let data = JSON.parse(response.ExtraData).Customer;
          this.CustomerCode1 = data.CustomerCode,
            this.CustomerName = data.CustomerName,
            this.FirstName= data.FirstName
            this.LastName= data.LastName
            this.EmailID = data.EmailID,
            this.MobileNo = data.MobileNo,
            this.CountryCode = data.CountryCode,
            this.Address1 = data.Address1
            // this.secondFormGroup.patchValue({
            // })
        }
        else {
          console.log("error");
        }
      },
      error: err => {
        console.log(err);
      }
    });  


    for(let item of this.addcosmeticWithCondition)
    {
      this.cosmeticWithConditionItem.push(item)
    }

     
    for(let item of this.questionArray)
    {
      this.questionItem.push(item)
    }
    // for(let item of this.answerArray)
    // {
    //  this.answerItem.push(item)
    // }
   
}

 //After Close popUp Delete All Array 
  ngOnDestroy() 
  {
    // Images Remove from Array
    while(this.imageListArray.length > 0) 
    {
      this.imageListArray.pop();    
    }

    //Question Remove from Array
    while(this.questionArray.length > 0)
    {
      this.questionArray.pop();
    }

    //Answer Remove from Array
    // while(this.answerArray.length > 0)
    // {
    //   this.answerArray.pop();
    // }

    
  }


//RESET customer sign
ClearSignature()
{
  this.customerSignPad.clear();
  this.SignatureFileName = "";
   
}

//Clear Authorization Sign 
authorizationClearSignature()
{
  this.authorizationSignPad.clear();
  this.authorSigFileName ="";
}
}
