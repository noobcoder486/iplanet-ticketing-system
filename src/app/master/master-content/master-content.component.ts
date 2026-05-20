import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { ACTIONENUM } from 'src/app/config/comman.const';
import { CommonMessage } from 'src/app/config/global';
import { Utilities } from 'src/app/config/util';
import { ProfileModuleMetaData } from 'src/app/core/models/profilemodule.metadata';
import { CommonService } from 'src/app/core/service/common.service';
import { LoadScriptService } from 'src/app/core/service/load-script.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service'; 
import { Columns } from 'src/app/models/column.metadata';
import { PaginationMetaData } from 'src/app/models/pagination.metadata';
import { GridFormComponent } from 'src/app/nitc-control/grid-form/grid-form.component';
import { SubSink } from 'src/app/shared/sub-sink';

@Component({
  selector: 'app-master-content',
  templateUrl: './master-content.component.html',
  styleUrls: ['./master-content.component.sass']
})
export class MasterContentComponent implements OnInit {

  formDetail: FormGroup;
  formControl: any;
  Header: any = ""
  showCtrl: boolean = false;
  postSpName: string = "";
  screenDetail: any;
  fromEditData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private subs = new SubSink();

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
  externalJson: any;
  setInvalid: Subject<any> = new Subject<any>();

  @ViewChildren('gridViewDetail') gridComponent: QueryList<GridFormComponent>;

  breadCumbList: any[];
  actions: any[] = [];
  submitted: boolean = false;

  screen: any;
  gridDetailColumns: any[] = [];
  columns: Columns[] = [];
  pagination: PaginationMetaData;
  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actionDetails = [];
  isChoose: boolean = false;
  rowAdd: boolean = false;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dynamicService: DynamicService,
    private commonService: CommonService,
    private route: Router,
    private toastr: ToastrService,
    
    private scriptService: LoadScriptService,
  ) {
    this.breadCumbList = this.commonService.getBreadCumbList(this.route.url);
    this.permission = new ProfileModuleMetaData();
    this.pagination = new PaginationMetaData();

    this.subs.sink = combineLatest([
      this.activatedRoute.data,
      this.activatedRoute.params,
      this.activatedRoute.queryParams
    ]).subscribe((resp: any) => {

      this.respData = resp[0];
      this.param = resp[1];
      this.qryString = resp[2];
      this.isEdit = Object.keys(this.param).length === 0 ? false : true;

      let ctrl = this.dynamicService.formControl().find(x => x.ScreenName === this.respData.ScreenCode);
      this.screenDetail = ctrl;
      this.Header = ctrl.Title;
      this.sections = ctrl.Section;
      this.formControl = ctrl;
      this.createForm();

      this.bindAllControl();
      this.getUserPermission();

      this.columnFormat();
      this.gridColumnFormat();

      setTimeout(() => {

        if (Utilities.isValidObject(ctrl.ExternalJs)) {
          this.subs.sink = this.scriptService.loadJsScript(ctrl.ExternalJs)
            .subscribe((data: any) => {
              let screen = data.find(x => x.ScreenCode === this.respData.ScreenCode);
              this.externalJson = screen;
              this.external.next(screen);
            },
              error => {
                //console.log(error);
              });
        }

        this.getAction();

      }, 200)
    });
  }

  formRow: any;
  ngOnInit(): void {
    this.rowAdd = this.route.url.includes('/gridrowadd') ? true : false;
    //if (this.isEdit == true) {
    let paramDetail = {};
    let params = JSON.parse(this.screenDetail.Parameter);

    params.forEach(element => {
      if (element.Type === "PARAM") {
        paramDetail[element.PropName] = this.qryString["code"];
      }
      else if (element.Type === "QUERYSTRING") {
        paramDetail[element.PropName] = this.qryString[element.PName];
      }
    });

    let data = {
      Data: JSON.stringify(paramDetail),
      ScreenCode: this.screenDetail.ScreenName
    }

    this.subs.sink = this.dynamicService.postGetData(data)
      .subscribe((data: any) => {
        let detail = data;
        if (detail != null && detail != undefined) {
          let detailObj = JSON.parse(detail);
          if (detailObj != null && detailObj != undefined) {

            if (detailObj["NumrangeType"] == "I") {
              let formSectionDetail = this.formControl.Section.filter(x => x.SectionType == "FORM");
              let dependanceyCtrl = [];
              formSectionDetail.forEach(frm => {
                frm.FormDetail = frm.FormDetail.filter(x => x.ControlName != "Code");
              })
            }
            this.createForm();
          }
        }
      },
        error => {
          this.toastr.error(CommonMessage.ErrorMessge);
        })
    //}
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

      //this.obserable = from(map);
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
          });

        });
        ctrl["MasterCode"] = this.qryString["code"];
        let mainData = {
          Data: JSON.stringify(ctrl),
          ScreenCode: this.screenDetail.ScreenName
        }
        this.saveFinal(mainData);
      }
      else {
        ctrl["MasterCode"] = this.qryString["code"];
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
    this.submitted = true;
    this.dynamicService.postDetail(data)
    this.subs.sink = this.dynamicService.postDetail(data)
      .subscribe((data: any) => {
        if (this.isEdit) {
          this.toastr.success('Record updated successfully');
        }
        else {
          this.toastr.success('Record added successfully');
        }
        //this.backToList();
        this.getDetail();
      },
        error => {
          this.submitted = false;
          // this.toastr.error(error.message);
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
    if (ctrl.ControlType === "COMBO") {
      if (ctrl.ApiUrl.MethodName != "" && ctrl.ApiUrl.MethodName != null && ctrl.ApiUrl.MethodName != undefined) {

        this.subs.sink = this.dynamicService.getDropdown(ctrl.ApiUrl.MethodName)
          .subscribe((resp: any) => {
            ctrl.Data = resp;
          }, error => {
            console.log(error);
          })
      }
    }

    if (ctrl.ControlType === "COMBOSEARCH") {
      this.bindComboSearch(ctrl);
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

  }

  dependancyLoad = (ctrl, mailCtrl) => {
    if (Utilities.isValidObject(ctrl.ApiUrl.MethodName)) {
      this.subs.sink = this.dynamicService.getDropdown(ctrl.ApiUrl.MethodName)
        .subscribe((resp: any) => {
          this.formDetail.get(ctrl.ControlName).setValue("", { emitEvent: false })
          mailCtrl.Data = resp;
        }, error => {
          console.log(error);
        })
    }
  }

  ngOnChange() {

  }

  private gridApi;
  private gridColumnApi;


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
    //console.log(e.rowData)
  }

  deleteRow = (data, index) => {
    let row = this.gridData[index];
    let rows = [];
    rows.push(row);
    this.gridApi.applyTransaction({ remove: rows });

  }

  backToList() {
    this.commonService.backURL();
  }

  getUserPermission() {
    this.permission = this.commonService.getPermissionByScreenCode(this.respData.ModuleId);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

  getAction() {

    let act = this.dynamicService.getActions(this.screenDetail.ScreenName, this.screenDetail.ModuleId, 1);
    if (act != null && act != undefined) {
      act.forEach(element => {
        switch (element.Code) {
          case "SAVE":
            if (this.permission.Edit == true || this.permission.Create == true) {
              this.actions.push({ code: element.Code, icon: element.Icon, title: element.Title });
            }
            break;
          case "CANCEL":
            this.actions.push({ code: element.Code, icon: element.Icon, title: element.Title });
            break;
        }
      });


    }
  }

  actionEvent(act) {

    switch (act.code) {
      case "SAVE":
        this.saveForm();
        break;
      case "CANCEL":
        this.backToList();
        break;
    }

  }

  loadDropdownData = (event) => {
    let param;
    if (event.control.PostParam != "" && event.control.PostParam != null && event.control.PostParam != undefined) {
      param = JSON.parse(event.control.PostParam);
      if (param.param != undefined) {
        param.param.forEach(element => {
          let row = element;
          let ctrlDetail = this.allControls.find(x => x.ControlName == element.Key);
          if (ctrlDetail != undefined) {
            let formVal = this.formDetail.get(row.Key).value;
            if (ctrlDetail.ControlType == "MULTISELECT"
              || ctrlDetail.ControlType == "COMBO"
              || ctrlDetail.ControlType == "COMBOSEARCH") {
              if (formVal != null && formVal != undefined) {
                if (Array.isArray(formVal)) {
                  row.Value = formVal.map(x => x.id);
                }
                else if (typeof formVal === 'object') {
                  row.Value = formVal.id;
                }
                else {
                  row.Value = formVal;
                }

              }
            }
            else {
              row.Value = formVal;
            }
          }

        });
      }

    }

    let data = {
      Code: param != undefined ? param.Code : "",
      EntityCode: param != undefined ? param.entityid : "",
      Content: param != undefined ? JSON.stringify(param.param) : null,
      Search: event.search == undefined ? "" : event.search
    }

    let detail = {
      api: event.control.ApiUrl.MethodName,
      data: data
    }

    this.subs.sink = this.dynamicService.getComboSearch(detail)
      .subscribe((resp: any) => {
        if (resp != null && resp != undefined && resp != "") {
          let respDetail = JSON.parse(resp);
          if (respDetail.Data != undefined) {
            event.control.Data = JSON.parse(respDetail.Data);
          }
          else {
            event.control.Data = respDetail;
          }

        }
      }, error => {
        console.log(error);
      })
  }

  bindComboSearch = (ctrl) => {
    let param;
    if (ctrl.PostParam != "" && ctrl.PostParam != null && ctrl.PostParam != undefined) {
      param = JSON.parse(ctrl.PostParam);
      if (param.param != undefined) {
        param.param.forEach(element => {
          let row = element;
          let ctrlDetail = this.allControls.find(x => x.ControlName == element.Key);
          if (ctrlDetail != undefined) {
            let formVal = this.formDetail.get(row.Key).value;
            if (ctrlDetail.ControlType == "MULTISELECT"
              || ctrlDetail.ControlType == "COMBO"
              || ctrlDetail.ControlType == "COMBOSEARCH") {
              if (formVal != null && formVal != undefined) {
                row.Value = formVal.map(x => x.id);
              }
            }
            else {
              row.Value = formVal;
            }
          }
        });
      }

    }

    let data = {
      Code: param != undefined ? param.Code : "",
      EntityCode: param != undefined ? param.entityid : "",
      Content: param != undefined ? JSON.stringify(param.param) : "",
      Search: ctrl.search == undefined ? "" : ctrl.search
    }

    let detail = {
      api: ctrl.ApiUrl.MethodName,
      data: data
    }

    this.subs.sink = this.dynamicService.getComboSearch(detail)
      .subscribe((resp: any) => {
        if (resp != null && resp != undefined && resp != "") {
          let respDetail = JSON.parse(resp);
          if (respDetail.Data != undefined) {
            ctrl.Data = JSON.parse(respDetail.Data);
          }
        }
      }, error => {
        console.log(error);
      })
  }

  validateChildGrid = (event) => {
    if (Utilities.isValidObject(event)) {
      if (event.AssignControl.length > 0) {
        for (let c = 0; c < event.AssignControl.length; c++) {
          let row = event.AssignControl[c];
          let sec = this.sections.find(x => x.SectionType === 'GRID' && x.SectionName == row.Control);
          if (Utilities.isValidObject(sec)) {
            this.setInvalid.next(sec);
          }
        }
      }
    }
  }

  gridColumnFormat = () => {
    this.screen = this.dynamicService.gridDetails().find(x => x.ScreenName === this.respData.ScreenCode);
    this.gridDetailColumns = this.screen.Columns;

    this.gridDetailColumns.forEach(x => {
      let isExist = this.columns.find(z => z.field == x.ColumnName);
      if (isExist == undefined) {
        let col = {
          title: x.LabelName,
          datatype: x.DataType,
          field: x.ColumnName,
          tdwidth: x.TDWidth
        }
        this.columns.push(col);
      }

    })

    this.getDetail();
    this.getGridAction();

  }

  totalRecord = 0;
  getDetail = () => {
    let paramDetail = {};
    let params = JSON.parse(this.screenDetail.Parameter);

    params.forEach(element => {
      if (element.Type === "PARAM") {
        paramDetail[element.PropName] = this.qryString["code"];
      }
      else if (element.Type === "QUERYSTRING") {
        paramDetail[element.PropName] = this.qryString[element.PName];
      }
    });

    let data = {
      Fields: JSON.stringify(paramDetail),
      ScreenCode: this.screenDetail?.ScreenName,
      Pagination: this.pagination
    }
    this.subs.sink = this.dynamicService.postGetGridData(data)
      .subscribe((resp: any) => {
        let respDetail = JSON.parse(resp);
        let details = JSON.parse(respDetail.Data)
        this.detail.next({ totalRecord: respDetail.TotalRecord, Data: details });
        this.totalRecord = respDetail.TotalRecord;
      },
        error => {
          this.toastr.error(CommonMessage.ErrorMessge);
        })
  }

  getGridAction() {

    let act = this.dynamicService.getActions(this.screen.ScreenName, this.screen.ModuleId, 2);
    if (act != null && act != undefined) {
      act.forEach(element => {
        switch (element.Code) {
          case ACTIONENUM.EDIT:
            if (this.permission.Edit == true) {
              this.actionDetails.push({ code: element.Code, icon: element.Icon, title: element.Title });
            }
            break;
          case ACTIONENUM.DELETE:
            if (this.permission.Delete == true) {
              this.actionDetails.push({ code: element.Code, icon: element.Icon, title: element.Title });
            }
            break;
          case ACTIONENUM.GRIDROWADD:
            if (this.permission.Delete == true) {
              this.actionDetails.push({ code: element.Code, icon: element.Icon, title: element.Title });
            }
            break;
          case "ADD":
            if (this.permission.Create == true) {
              //this.toolBarAction.push({ code: element.Code, icon: element.Icon, title: element.Title })
            }
            break;
          case "EXPORT":
            if (this.permission.Export == true) {
              //this.toolBarAction.push({ code: element.Code, icon: element.Icon, title: element.Title })
            }
            break;
          case "IMPORT":
            if (this.permission.Import == true) {
              //this.toolBarAction.push({ code: element.Code, icon: element.Icon, title: element.Title })
            }
            break;
          case "SELECT":
            this.isChoose = true;
            break;
        }
      });


    }
  }

  actionEmit(event) {
    switch (event.action.code) {
      case ACTIONENUM.EDIT:
        //this.editMasterContentList(event.row);
        break;
      case ACTIONENUM.GRIDROWADD:
        //this.griRowAdd(event.row);
        break;
      case ACTIONENUM.DELETE:
        this.deleteDataById(event?.row);
        break;
    }
  }

  loadPageData(details) {
    switch (details.eventType) {
      case "PageChange":
        this.pagination.PageNumber = details.eventDetail.pageIndex;
        this.pagination.PageSize = details.eventDetail.pageSize;
        //this.isPageChanges = true;
        break;
      case "Sorting":
        this.pagination.SortOrder = details.eventDetail.direction;
        let result = this.columns.find(x => x.title == details.eventDetail.active)
        this.pagination.Sorting = result != undefined ? result.field : '';
        break;
    }

    this.getDetail();
  }

  deleteDataById = (row) => {
    let paramDetail = {};
    let params = JSON.parse(this.screenDetail.DelParameter);

    params.forEach(element => {
      if (element.Type === "PARAM") {
        paramDetail[element.PropName] = row[element.PropName];
      }
      else if (element.Type === "QUERYSTRING") {
        paramDetail[element.PropName] = row[element.PName];
      }
    });

    let data = {
      Data: JSON.stringify(paramDetail),
      ScreenCode: this.screenDetail.ScreenName
    }

    this.subs.sink = this.dynamicService.postDeleteData(data)
      .subscribe((data: any) => {
        this.toastr.success(CommonMessage.DeleteMessge);
        this.getDetail();
      },
        error => {
          this.toastr.error(CommonMessage.ErrorMessge);
        })
  }

  editMasterContentList(row) {
    let frm = {};
    let keys = Object.keys(row);
    keys.forEach((key) => {
      frm[key] = row[key];
    })
    this.formDetail.patchValue(frm);
  }



}
