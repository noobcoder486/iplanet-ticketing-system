import { Component, ComponentFactoryResolver, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ExportExcelService } from 'src/app/common/Services/dropdownService/export-excel.service';
import { SubSink } from 'src/app/shared/sub-sink';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'nitc-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent implements OnInit, OnDestroy {

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  screenCode: any;
  screenDetail: any;
  private subs = new SubSink();

  formGroup: FormGroup;
  @ViewChild('fileInput') fileInput;
  fileDetail: any;

  constructor(
    private cfr: ComponentFactoryResolver,
    public dialogRef: MatDialogRef<PopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dynamicService: DynamicService,
    private fb: FormBuilder,
    private excel: ExportExcelService,
    private toastr: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.add();
      let ctrl = this.dynamicService.formControl().find(x => x.ScreenName === this.data.screenDetail.ScreenName);
      this.screenDetail = ctrl;

    }, 100);

  }

  add(): void {
    // create the component factory  
    // const dynamicComponentFactory = this.cfr.resolveComponentFactory<any>(this.data.component);  
    // // add the component to the view  
    // const componentRef = this.container.createComponent(dynamicComponentFactory); 
    // this.screenCode =   this.data.screenCode;
    // componentRef.instance.data = {code: this.data.screenCode,addType: this.data.addType};
  }

  saveDetail = () => {
    if (this.formGroup.valid) {
      if (this.fileInput.nativeElement.files.length > 0) {
        let formData = new FormData();
        formData.append('fileDetail', this.fileInput.nativeElement.files[0]);
        formData.append('ScreenCode', this.data.screenDetail.ScreenName);
        this.subs.sink = this.dynamicService.uploadFile(formData)
          .subscribe((response: any) => {
            this.toastr.success("Record uploaded");
            this.close(true);
          },
            error => {
              this.toastr.error("Record not uploaded");
            })
      }
    }
  }

  close = (resp: any) => {
    this.dialogRef.close(resp);
  }

  createForm = () => {
    this.formGroup = this.fb.group({
      importfile: [Validators.required]
    })

  }

  onFileChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    //var pattern = /image-*/;
    var reader = new FileReader();

    // if (!file.type.match(pattern)) {
    //   this.toastr.error("Only Image allowed");
    //   return;
    // }

    reader.onload = this.handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }


  handleReaderLoaded(e) {
    var reader = e.target;
    this.fileDetail = reader.result;
  }
  // start here
  downloadTemplate1 = () => {
    let detail = {
      Key: "ScreenCode",
      Value: this.data.screenDetail.ScreenName
    }
    this.subs.sink = this.dynamicService.getImportField(detail)
      .subscribe((response: any) => {
        if (response != null && response != undefined) {
          let resp = JSON.parse(response);
          let data = resp.Data;
          let fields = [];
          let fieldsCol = {}

          if (data != null && data != undefined) {
            let colDetail = JSON.parse(data)
            colDetail.forEach(element => {
              fieldsCol[element.FieldName] = "";
            });
            fields.push(fieldsCol);
            this.excel.exportAsExcelFile(fields, this.data.screenDetail.ScreenName);
          }

        }
      },
        error => {
          this.toastr.error(error);
        })



  }

  downloadTemplate = () => {

    let detail = {
      Key: "ScreenCode",
      Value: this.data.screenDetail.ScreenName
    }

    this.subs.sink = this.dynamicService.getImportField(detail)
      .subscribe((response: any) => {
        if (response != null && response != undefined) {
          let resp = JSON.parse(response);
          let data = resp.Data;
          let fields = [];
          let fieldsCol = {}

          if (data != null && data != undefined) {
            let colDetail = JSON.parse(data)
            colDetail.forEach(element => {
              fieldsCol[element.FieldName] = "";
            });
            fields.push(fieldsCol);
            this.excel.exportAsExcelFile(fields, this.data.screenDetail.ScreenName);
          }

        }
      },
        error => {
          this.toastr.error(error);
        })


  }



  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


}
