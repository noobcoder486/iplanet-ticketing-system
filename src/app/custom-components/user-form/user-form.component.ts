import { Component, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { BehaviorSubject, combineLatest, filter, from, of } from 'rxjs';
import { CommonMessage } from 'src/app/config/global';
import { Utilities } from 'src/app/config/util';
import { ModuleFieldMetaData, ProfileModuleMetaData } from 'src/app/core/models/profilemodule.metadata';
import { CommonService } from 'src/app/core/service/common.service';
import { DynamicScriptLoaderService } from 'src/app/core/service/dynamic-script-loader.service';
import { EncryptDecryptService } from 'src/app/core/service/encrypt-decrypt.service';
import { LoadScriptService } from 'src/app/core/service/load-script.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service'; 
import { GridFormComponent } from 'src/app/nitc-control/grid-form/grid-form.component';
import { CustomComponentService } from '../custom-component.service';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  formDetail: FormGroup;
  formControl: any;
  Header: any = ""
  showCtrl: boolean = false;
  postSpName: string = "";
  screenDetail: any;
  fromEditData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @ViewChild('fileInput') fileInput;

  editInProgress: boolean = false;

  sections: any[] = [];
  hidden: boolean = false;
  columnDefs = [];
  isEdit: boolean = false;
  param: any;
  qryString: any;
  respData: any;
  rowDataClicked = {};

  private obserable: any;
  private allControls: any[] = [];
  frameworkComponents: any;
  public gridData: LocalDataSource = new LocalDataSource();


  permission: ProfileModuleMetaData;
  external: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @ViewChild('smartTable') smartTable;
  @ViewChildren('gridViewDetail') gridComponent: QueryList<GridFormComponent>;
  settings = {
    hideSubHeader: true,
    actions: {
      delete: true,
      add: false,
      position: 'right'
    },
    add: {
      addButtonContent: '<i class="material-icons add">add_circle_outline</i>',
      createButtonContent: '<i class="material-icons">save</i>',
      cancelButtonContent: '<i class="material-icons">cancel</i>',
    },
    edit: {
      editButtonContent: '<i class="material-icons">mode_edit</i>',
      saveButtonContent: '<i class="material-icons">save</i>',
      cancelButtonContent: '<i class="material-icons">cancel</i>',
    },
    delete: {
      deleteButtonContent: '<i class="material-icons">delete</i>',
      confirmDelete: true,
    },
    columns: {}
  };

  breadCumbList: any[];
  imageSrc: any;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private commonService: CommonService,
    private route: Router,
    private toastr: ToastrService,
    private loadScript: DynamicScriptLoaderService,
    private renderer: Renderer2,
    private scriptService: LoadScriptService,
    private encryptDecryptService: EncryptDecryptService,
  ) {
    this.breadCumbList = this.commonService.getBreadCumbList(this.route.url);

    //this.frameworkComponents.buttonRenderer.displayButton(["EDIT"]);
    this.permission = new ProfileModuleMetaData();


    combineLatest([
      this.activatedRoute.data,
      this.activatedRoute.params,
      this.activatedRoute.queryParams
    ]).subscribe((resp: any) => {

      this.respData = resp[0];
      this.param = resp[1];
      this.qryString = resp[2];
      //this.isEdit = this.respData.IsEdit;
      this.isEdit = Object.keys(this.param).length === 0 ? false : true;

      let ctrl = this.dynamicService.formControl().find(x => x.ScreenName === this.respData.ScreenCode);
      this.screenDetail = ctrl;
      this.Header = ctrl.Title;
      this.sections = ctrl.Section;
      this.sections.pop();
      this.formControl = ctrl;
      this.createForm();

      this.bindAllControl();
      this.getUserPermission();

      this.columnFormat();

      setTimeout(() => {
        if (Utilities.isValidObject(ctrl.ExternalJs)) {
          this.scriptService.loadJsScript(ctrl.ExternalJs)
            .subscribe((data: any) => {
              let screen = data.find(x => x.ScreenCode === this.respData.ScreenCode);
              this.external.next(screen);
            },
              error => {
                console.log(error);
              });
        }

      }, 200)
    });
  }

  formRow: any;
  ngOnInit(): void {
    if (this.isEdit == true) {
      let paramDetail = {};
      let params = JSON.parse(this.screenDetail.Parameter);

      params.forEach(element => {
        if (element.Type === "PARAM") {
          paramDetail[element.PropName] = this.param[element.PName];
        }
        else if (element.Type === "QUERYSTRING") {
          paramDetail[element.PropName] = this.qryString[element.PName];
        }
      });



      let data = {
        Data: JSON.stringify(paramDetail),
        ScreenCode: this.screenDetail.ScreenName
      }

      this.dynamicService.postGetData(data)
        .subscribe((data: any) => {

          let detail = data;
          if (detail != null && detail != undefined) {
            let detailObj = JSON.parse(detail);
            if (detailObj != null && detailObj != undefined) {
              this.formRow = detailObj;
              this.fromEditData.next(detailObj);
              let rowDetail = detailObj;
              let formSectionDetail = this.formControl.Section.filter(x => x.SectionType == "FORM");
              var formObj = {};
              this.imageSrc = 'upload/userimage/' + detailObj.ImageName;

              formSectionDetail.forEach(frm => {
                frm.FormDetail.forEach(element => {
                  formObj[element.ControlName] = rowDetail[element.ControlName];
                });
              });

              formObj['OldUserName'] = rowDetail['UserName'];

              this.formDetail.patchValue(formObj);

              let gridSectionDetail = this.formControl.Section.filter(x => x.SectionType == "GRID");
              if (gridSectionDetail.length > 0) {
                for (let k = 0; k < gridSectionDetail.length; k++) {
                  let sectionName = gridSectionDetail[k].SectionName;
                  let val = rowDetail[sectionName];
                  let rowData = val[sectionName];
                  let gRow = []
                  if (Array.isArray(rowData)) {
                    for (let i = 0; i < rowData.length; i++) {
                      gRow.push(rowData[i]);
                    }
                  }
                  else {
                    gRow.push(rowData);
                  }

                  this.gridData.load(gRow);

                }
                //this.gridApi.setRowData(this.gridData);               
              }
            }
          }
        },
          error => {

          })
    }

  }

  ctrlsForm(ctrlName) {
    return this.formDetail.get(ctrlName) as FormArray;
  }

  bindAllControl() {
    this.formControl.Section.forEach(element => {
      let ctrls = element.FormDetail
      ctrls.forEach(ctrl => {
        this.allControls.push(ctrl);
      });

    });

  }

  createForm = () => {
    let ctrl = {}
    let formSectionDetail = this.formControl.Section.filter(x => x.SectionType == "FORM");
    let dependanceyCtrl = [];
    formSectionDetail.forEach(frm => {
      frm.FormDetail.forEach(element => {
        if (element.ControlType == 'MAIL' && element.IsRequired == true) {
          ctrl[element.ControlName] = new FormControl(null, [Validators.required, Validators.email]);
        }
        else if (element.ControlType == 'MAIL' && element.IsRequired != true) {
          ctrl[element.ControlName] = new FormControl(null, Validators.email);
        }
        else if (element.IsRequired == true) {
          ctrl[element.ControlName] = new FormControl(null, Validators.required);
        }
        else {
          ctrl[element.ControlName] = new FormControl(null);
        }

        if (element.Dependancy != null && element.Dependancy != "" && element.Dependancy != undefined) {
          dependanceyCtrl.push(element);
        }

        this.loadDropDown(element);
      });
    });

    let gridSectionDetail = this.formControl.Section.filter(x => x.SectionType == "GRID");

    this.formDetail = new FormGroup(ctrl);
    if (gridSectionDetail.length > 0) {
      this.formatGrid(gridSectionDetail[0].FormDetail);
    }

    if (dependanceyCtrl.length > 0) {
      let valChange = []
      const map = new Map();
      dependanceyCtrl.forEach(x => {
        map.set(of(x.ControlName), this.formDetail.get(x.ControlName).valueChanges);
      });

      this.obserable = from(map);
    }

    setTimeout(() => {
      this.showCtrl = true;
    })

  }

  onKeyPressEvent(ctrl, event) {
    if (ctrl.ControlType == 'PHONE') {
      return this.commonService.phoneNumberRegex(event);
    }
  }

  onBlurEvent(ctrl, event) {
  }

  getRequired(ctrl) {
    let name = ctrl.ControlName;
    let control = this.formDetail.controls[name];
    return control.touched && control.errors?.required ? true : false;
  }

  getEmailRequired(ctrl) {
    if (ctrl.ControlType == 'MAIL') {
      let name = ctrl.ControlName;
      return this.formDetail.controls[name].errors?.email;
    }
  }

  saveForm = () => {

    this.formDetail.markAllAsTouched();
    if (this.formDetail.valid) {
      let ctrl = this.formDetail.value;

      let grids = this.formControl.Section.filter(x => x.SectionType == "GRID");
      if (grids.length > 0) {

        grids.forEach(element => {
          let field = element.SectionName;
          ctrl[field] = [];
          let componetDetail = this.gridComponent.forEach(x => {
            if (x.gridSectionDetail.SectionName == field) {
              x.gridDataDetail.forEach(z => {
                ctrl[field].push(z);
              })
            }
          })
          // this.gridData.getAll().then((data) => {

          //   if (data != undefined && data != null) {
          //     for (let d = 0; d < data.length; d++) {
          //       ctrl[field].push(data[d]);
          //     }
          //   }

          //   //this.saveFinal(mainData);
          // })

        });
        let mainData = {
          Data: JSON.stringify(ctrl),
          ScreenCode: this.screenDetail.ScreenName
        }
        this.saveFinal(mainData);
      }
      else {
        let data = {
          Data: JSON.stringify(ctrl),
          ScreenCode: this.screenDetail.ScreenName
        }
        this.saveFinal(data);
      }

    }
    else {
      //this.commonService.showFormValidationMsg(this.formDetail, this.sections);
    }


  }

  saveFinal = (data) => {
    this.submitted=true;
    this.dynamicService.postDetail(data)
      .subscribe((data: any) => {
        if (this.isEdit) {
          this.toastr.success('User updated successfully');
          this.uploadUserImage();
        }
        else {
          this.toastr.success('User added successfully');
        }
        this.backToList();
      },
        error => {
          this.submitted=false;
          this.toastr.error(CommonMessage.ErrorMessge);
        })
  }

  getDropdownValue = (ctrlName, opt) => {

  }

  getDropdownDetail = (name) => {

  }

  getDropdownText = (ctrlName, opt) => {

  }

  log = (detail) => {
    console.log(detail);
  }

  getChildCtrl = (detail) => {
    const entries = {
      row: detail
    }

    return entries;
  }

  remove(i, grid) {

    let rows = this.ctrlsForm(grid.Name) as FormArray;
    //rows.removeAt(i)
    grid.ctrls.splice(i, 1);
  }

  add = (ctrl) => {

    let str = JSON.stringify(ctrl.Controls[0].Controls)
    let newRow = JSON.parse(str);
    let grid = {}
    newRow.forEach(el => {
      let rows = el;

      if (rows.IsMandatory == true) {
        grid[rows.ControlName] = new FormControl(null, Validators.required)
      }
      else {
        grid[rows.ControlName] = new FormControl(null)
      }

    });
    ctrl.Controls.push({
      Controls: ctrl.Controls[0].Controls
    })
    this.ctrlsForm(ctrl.ControlName).push(this.fb.group(grid));
  }

  loadDropDown = (ctrl) => {
    if (ctrl.ApiUrl.MethodName != "" && ctrl.ApiUrl.MethodName != null && ctrl.ApiUrl.MethodName != undefined) {

      this.dynamicService.getDropdown(ctrl.ApiUrl.MethodName)
        .subscribe((resp: any) => {
          ctrl.Data = resp;
        }, error => {
          console.log(error);
        })
    }
  }

  loadDependentCtrl = (event) => {

    if (Utilities.isValidObject(event)) {
      let ctrl = this.allControls.find(x => x.ControlName == event.ctrl);
      let ctrlDetail = JSON.parse(JSON.stringify(ctrl));
      let rpalce = "[" + event.ctrl + "]"
      let rpl = ctrlDetail.ApiUrl.MethodName.replace(rpalce, event.selectedVal);
      ctrlDetail.ApiUrl.MethodName = rpl;

      this.dependancyLoad(ctrlDetail, ctrl);
    }
    //let ctrl = this.
  }

  dependancyLoad = (ctrl, mailCtrl) => {
    if (Utilities.isValidObject(ctrl.ApiUrl.MethodName)) {
      this.dynamicService.getDropdown(ctrl.ApiUrl.MethodName)
        .subscribe((resp: any) => {
          mailCtrl.Data = resp;
        }, error => {
          console.log(error);
        })
    }
  }

  ngOnChange() {
    //console.log(this.field.value);
    // this.field.value.
  }

  private gridApi;
  private gridColumnApi;
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }



  formatGrid = (formDetails) => {


    formDetails.forEach(z => {
      let row = {}
      switch (z.ControlType) {
        case "TEXTAREA":
          row = {
            headerName: z.DisplayLabel, field: z.ControlName, editable: true
          }
          break;
        case "COMBO":
          row = {
            headerName: z.DisplayLabel, field: z.ControlName, editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 30,
              values: z.Data
            }
          }
          break;
        case "TEXT":
          row = {
            headerName: z.DisplayLabel, field: z.ControlName, editable: true
          }
          break;
      }
      this.columnDefs.push(row)
    })

    this.columnDefs.push({
      headerName: "Action",
      minWidth: 150,
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.clickedEvent.bind(this),
        label: '',
        buttons: ["DELETE"]
      }
    })
  }

  clickedEvent(e) {

    switch (e.action) {
      case "EDIT":

        break;
      case "DELETE":
        this.rowDataClicked = e.rowData;
        this.deleteRow(e.rowData, e.index);
        break;
    }

    console.log(e.rowData)
  }

  deleteRow = (data, index) => {

    let row = this.gridData[index];
    let rows = [];
    rows.push(row);
    this.gridApi.applyTransaction({ remove: rows });
    //  this.gridApi.redrawRows({ rowNodes: this.rowData });
    //  this.rowData.splice(index, 1);

  }

  onAddRow() {


    // let grid = this.formControl.Section.filter(x => x.SectionType === "GRID");
    // this.editInProgress = true;

    // let row = {};
    // this.columnDefs.forEach(z => {
    //   row[z.field] = ''
    // })

    // let action = {
    //   headerName: "Action",
    //   minWidth: 150,
    //   editable: false,
    //   colId: "action",
    //   cellRenderer: 'buttonRenderer',
    //   cellRendererParams: {
    //     onClick: this.clickedEvent.bind(this),
    //     label: ''
    //   }
    // }

    // row["Action"] = action;


    // this.gridApi.updateRowData(
    //   { add: [row], addIndex: 0 }
    // )
    // this.gridApi.startEditingCell({ rowIndex: 0, colKey: this.columnDefs[0].field });

    this.smartTable.grid.createFormShown = true;
    this.smartTable.grid.getNewRow();
  }

  backToList() {
    // let prevUrl = sessionStorage.getItem('PrevUrl');
    // this.route.navigate([prevUrl]);
    this.commonService.backURL();
  }

  getUserPermission() {
    this.permission = this.commonService.getPermissionByScreenCode(this.respData.ModuleId);
  }


  ngOnDestroy() {
    this.commonService.removeScript(this.respData.ScreenCode);
  }

  columnFormat = () => {
    let gridRows = this.formControl.Section.filter(x => x.SectionType == "GRID");
    let col = {}

    gridRows.forEach(elements => {
      elements.FormDetail.forEach(x => {
        col[x.ControlName] = {
          title: x.DisplayLabel,
          type: x.ControlType,
          filter: false
        }
      });
    });

    this.settings.columns = col;

  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  onDropdownSelection = (event) => {

  }

  breadCumbClick(url) {
    this.route.navigate([url]);
  }

  onFileChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    var pattern = /image-*/;
    var reader = new FileReader();

    if (!file.type.match(pattern)) {
      this.toastr.error("Only Image allowed");
      return;
    }

    reader.onload = this.handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  handleReaderLoaded(e) {
    var reader = e.target;
    this.imageSrc = reader.result;
  }

  removeImage() {
    this.imageSrc = "null";
  }

  uploadUserImage() {
    if (this.fileInput.nativeElement.files.length > 0) {
      let formData = new FormData();
      formData.append('image', this.fileInput.nativeElement.files[0]);
      formData.append('UserName', this.formDetail.controls.UserName.value);
      this.dynamicService.uploadUserImage(formData)
        .subscribe((response: any) => {
        },
          error => {
            this.toastr.error("Image not uploaded");
          })
    }
  }

  // checkPassword() {
  //   let pass = this.formDetail.controls["Password"].value;
  //   let confirm = this.formDetail.controls["ConfirmPassword"].value;
  //   if (pass == confirm) {
  //     let result = this.encryptDecryptService.isEncrypted(pass);
  //     if (result == false) {
  //       let encrypt = this.encryptDecryptService.encrypt(pass);
  //       this.formDetail.controls["Password"].patchValue(encrypt);
  //       let dec = this.encryptDecryptService.decrypt(encrypt);
  //       let asd = dec;
  //     }
  //     result = this.encryptDecryptService.isEncrypted(confirm);
  //     if (result == false) {
  //       let encrypt = this.encryptDecryptService.encrypt(confirm);
  //       this.formDetail.controls["ConfirmPassword"].patchValue(encrypt);
  //       let dec = this.encryptDecryptService.decrypt(encrypt);
  //       let asd = dec;
  //     }
  //     return true;
  //   } else {
  //     this.toastr.error('Password and Confirm Password does not match');
  //     return false;
  //   }
  // }










}
