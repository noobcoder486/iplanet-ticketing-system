import { Component,OnInit,ViewChild , Input, Output, EventEmitter, TemplateRef} from '@angular/core';
import xml2js from 'xml2js';
import * as glob from "../../../config/global";
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit {

  @Input() isEdit: boolean;
  @Input() FileList : any[];
  @Output() FileListChanged = new EventEmitter<any[]>();
  @Output() CancelBtn = new EventEmitter<any>();
  FileName: string;
  FilteredFileList: any[] =[]
  FileType:string;


  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private toastMessage: ToastrService,
    private dynamicService: DynamicService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // this.params = this.activatedRoute.snapshot.params;
    if(!this.isEdit) {
      this.extractFileSrc();
      this.FilteredFileList = [...this.FileList];
    }
    else{
      this.FilteredFileList = [...this.FileList]
    }
    console.log("Filter Files  ",this.FilteredFileList)
  }


  Cancel(){
      this.CancelBtn.emit(false)  
  }

  DeleteFile(item){
    const index  = this.FileList.indexOf(item)
    this.FileList.splice(index, 1)
    this.FilteredFileList= this.FileList
  }

  // Handle file adding
  onFileAdd(event: any) {
    // console.log("File Data:- ",  (event.target).files);
    // Check if a file is selected
    if(event.target.files.length == 0){
      return
    }    
    // console.log("File Data :- ",fileData);
    let fileData = (event.target).files[0];
    // Check if the file is an jpeg,jpg,png  or pdf file
    if( fileData.type.match(/\/jpg|\/jpeg|\/png|\/pdf/) == null ){
      this.toastMessage.error("Please select a jpg, jpeg, png or pdf file type");
      return;
    }
    else if (fileData.size > 5 * 1024 * 1024) {
      this.toastMessage.error("File size should be less than 5MB");
      return;
    }
    const fileNameRegex = /[A-Za-z0-9_-]*/;
    const fileName = fileData.name.split('.')[0]
    // console.log(" File Name ", fileData.name.split('.')[0])
    // console.log(" File Name ", !/^[a-zA-Z0-9-_]*$/.test(fileName))
    if (  !/^[a-zA-Z0-9-_]*$/.test(fileName)) {
      this.toastMessage.error("File name should contain only alphabets, numbers, dashes(-) or underscores(_)");
      return;
    }

    
    let index = this.FileList.length; 
    this.FileList[index] = {
      AttachmentFile: null, // Its of Type blob
      src: null,
      filename: '',
      type: '',
      createdDateTime: '',
    };
    // Store the File in the exact index of FileList
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    // console.log("File Reader:-", reader);
    // console.log("File Blob is:- ",fileData);
    reader.onload = (e) => {
        // Get Files Details
        let time = new Date();
        this.FileList[index].AttachmentFile = fileData;
        this.FileList[index].src = reader.result as string;
        this.FileList[index].filename = fileData.name
        this.FileList[index].type = fileData.type;
        this.FileList[index].createdDateTime = time;
      };
    console.log("File Uploaded List:- ", this.FileList);
    this.FilteredFileList= this.FileList;
  }


  search(){
    if( !this.FileName && !this.FileType){
      this.FilteredFileList = this.FileList;
    }
    console.log(this.FileType)
    const filteredFiles = this.FileList.filter(file => {
      const fileNameMatch = this.FileName ?  file.filename.toLowerCase().includes(this.FileName.toLowerCase()) : true
      const fileTypeMatch = this.FileType ?  file.type.toLowerCase().includes(this.FileType.toLowerCase()) : true
      return fileNameMatch && fileTypeMatch;
    });
  
    // Update the FileList with the filtered files
    this.FilteredFileList = filteredFiles;
    if (this.FilteredFileList.length == 0 ){
      this.toastMessage.error("No Files Found")
    }
  }

  extractFileSrc(){
      console.log("Files are:- ",this.FileList)
      if (this.FileList.length == 0 || this.FileList == null || this.FileList == undefined){
        this.toastMessage.error("No Files Found")
        return
      }
      this.FileList.forEach((file, index) => {
          const newFile = {
            ...file, // Keep existing file properties
            src: file.AttachmentFile,
            filename: file.FileName,
            type: file.FileType,
            createdDateTime: file.CreatedDateTime,
          };
      
          // Replace the file in the array with the new file object
          this.FileList[index] = newFile;
        });
        
    }

  onSubmit(){
    this.FileListChanged.emit(this.FileList);
    this.CancelBtn.emit(false) ;
  }
  viewFiles(src: any): void {
      window.open(src, '_blank');
  }

}
