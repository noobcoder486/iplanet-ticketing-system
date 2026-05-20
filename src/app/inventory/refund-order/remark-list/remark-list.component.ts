import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';

@Component({
  selector: 'app-remark-list',
  templateUrl: './remark-list.component.html',
  styleUrls: ['./remark-list.component.css']
})
export class RemarkListComponent implements OnInit {

  constructor(  
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    public dialog: MatDialog,
    ) { }

    
  @Input() isEdit : boolean;
  @Input() Level : number;
  params: any;
  @Input() RemarkList : any[];
  @Output() RemarkListChanged = new EventEmitter<any[]>();
  @Output() CancelBtn = new EventEmitter<any>();

  
  ngOnInit(): void {
    // this.params = this.activatedRoute.snapshot.params;
    console.log("Remark List ",this.RemarkList)
    
    this.RemarkList = this.RemarkList.filter( item => !item.RemarkLevel.startsWith('H') && !item.RemarkLevel.startsWith('UH'))

    if (this.isEdit){
      // console.log("ds", this.RemarkList.length, "\n", this.Level)
      if (this.RemarkList.length -1  != this.Level ){
          // Check if level is true and no remark is available for that level
          // console.log("Level", this.Level)
          if ( this.RemarkList.findIndex(item => item.RemarkLevel == this.Level) == -1) {
            // Add new remark to RemarkUploadList
            this.RemarkList.push({
              RemarkLevel: 'L' + this.Level,
              RemarkDescription: '',
              RemarkDate: new Date(),
              isEdit: true
            });
          }
      }
    }    
  }


  Cancel(){
      this.CancelBtn.emit(false)  
  }

  // DeleteFile(item){
  //   const index  = this.RemarkList.indexOf(item)
  //   this.RemarkList.splice(index, 1)
  // }

  // // Handle file adding
  // onFileAdd(event: any) {
  //   // console.log("File Data:- ",  (event.target).files);
  //   // Check if a file is selected
  //   if(event.target.files.length == 0){
  //     return
  //   }    
  //   // console.log("File Data :- ",fileData);
  //   let fileData = (event.target).files[0];
  //   // Check if the file is an jpeg,jpg,png  or pdf file
  //   if( fileData.type.match(/\/jpg|\/jpeg|\/png|\/pdf/) == null ){
  //     this.toastMessage.error("Please select a jpg, jpeg, png or pdf file type");
  //     return;
  //   }
  //   else if (fileData.size > 2 * 1024 * 1024) {
  //     this.toastMessage.error("File size should be less than 2MB");
  //     return;
  //   }
    
  //   let index = this.RemarkList.length; 
  //   this.RemarkList[index] = {
  //     AttachmentFile: null, // Its of Type blob
  //     src: null,
  //     filename: '',
  //     type: '',
  //     createdDateTime: '',
  //   };
  //   // Store the File in the exact index of RemarkList
  //   const reader = new FileReader();
  //   reader.readAsDataURL(fileData);
  //   // console.log("File Reader:-", reader);
  //   // console.log("File Blob is:- ",fileData);
  //   reader.onload = (e) => {
  //       // Get Files Details
  //       let time = new Date();
  //       this.RemarkList[index].AttachmentFile = fileData;
  //       this.RemarkList[index].src = reader.result as string;
  //       this.RemarkList[index].filename = fileData.name
  //       this.RemarkList[index].type = fileData.type;
  //       this.RemarkList[index].createdDateTime = time;
  //     };
  //   console.log("File Uploaded List:- ", this.RemarkList);
  // }

  onSubmit(){
    this.RemarkListChanged.emit(this.RemarkList);
    this.CancelBtn.emit(false) ;
  }


}
