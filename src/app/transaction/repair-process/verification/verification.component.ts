import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CaseDetail } from '../repair-process.metadata';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { v4 as uuidv4 } from 'uuid';
import * as glob from 'src/app/config/global';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.sass']
})
export class VerificationComponent implements OnInit {

  serializedPartList: any [] = []
  serializedPartListFinal: any [] = []
  UploadedImageList: any [] = []
  RepairPartList: any []= []
  attachLink: string
  notes: string
  imageUrl
  @Input() repa: CaseDetail;
  @Input() repairPartListVerification: any[]=[];
  @Output() verifiedPartsList = new EventEmitter<any>();



  constructor(
    private dynamicService: DynamicService,
    private toast: ToastrService,
  ) { }

  ngOnInit(): void {

  }

  openImage(item){
    ''
    this.imageUrl = item.KBBProof
  }

  ngOnChanges(changes: SimpleChanges): void{
    this.serializedPartListFinal = []
    this.RepairPartList = []
    if(changes['repa'])
  {
    if(this.repa != null || this.repa != undefined){
      if(this.repa?.REPAIR?.isGSXPosted == 1){
        
        for(let item of this.repa?.REPAIR?.REPAIRLIST?.REPAIRDETAIL){
          if(item.PartSerialized == true )
          {
               this.RepairPartList.push({
                "number": item.PartCode,
                "description": item.PartDescription,
                "KBB": item?.KBB,
                "KGB": item?.KGB,
                "KBBProof": item?.KBBProof,
              })
          }
        
        }
      }
    }
  }

    if(changes['repairPartListVerification'])
  {
    if(this.repairPartListVerification != null || this.repairPartListVerification != undefined){
      this.serializedPartList =this.repairPartListVerification

    for(let item of this.serializedPartList){
      if(item.serialized == true )
      {
        var rowno = 1
           this.serializedPartListFinal.push({
            "number": item.number,
            "description": item.description,
            "KBB": item?.KBB,
            "KGB": item?.KGB,
            "KBBProof": item?.KBBProof,
            "rowno":rowno
            
    
          })
          rowno=rowno+1;
      }
    
    }
  }
}


}

setFunction(item){
  console.log("Item Data" , item)
  item.KBBProof = this.image
  item.FileName = this.imageName
}

image
imageName
 async OnFileUploadClick(event: any,) {
  ''
  for (var i = 0; i <= event.target.files.length - 1; i++) {
    let fileToUpload = <File>event.target.files[0];
    var filename = uuidv4() + "_" + fileToUpload.name ;
    // const formData = new FormData();
    // formData.append('file', fileToUpload, filename);
    try{
      const value = await this.dynamicService.uploadFileToS3Local(fileToUpload, filename) 

      // this.dynamicService.uploadFileToS3Local(fileToUpload, filename).subscribe(
      //   {
      //     next: (value) => {
            let uploadedimage: any;
            uploadedimage = value;
            this.image = uploadedimage?.dbPath; // glob.GLOBALVARIABLE.SERVER_LINK + uploadedimage?.dbPath;
            this.imageName = fileToUpload.name
        //   },
        //   error: (err) => {
        //     console.log(err)
        //   },
        // });
    }
    catch (err) {
      this.toast.error(err.message || err);
    }  
  }
}
 
onSave(){

  let verification = {
    "AttachedLink": this.attachLink,
    "Notes": this.notes,
    "serializedPartList": []
  }
  for (let item of this.serializedPartListFinal) {
    verification.serializedPartList.push({
        "ItemCode": item.number,
        "ItemDescription":item.description,
        "KBB": item.KBB ,
        "KGB": item.KGB ,
        "KBBProof": item.KBBProof 
        
    })
  }
  
  console.log("Saved Data" , verification)
  this.verifiedPartsList.emit(JSON.stringify(verification))
}

  }

