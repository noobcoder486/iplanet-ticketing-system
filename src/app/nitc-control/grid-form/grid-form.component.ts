import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilities } from 'src/app/config/util';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { SubSink } from 'src/app/shared/sub-sink';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'nitc-grid-form',
  templateUrl: './grid-form.component.html',
  styleUrls: ['./grid-form.component.scss']
})
export class GridFormComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @Input() gridSectionDetail: any;
  @Input() editData: Observable<any>;
  @Input() screenCode: any;
  @Input() InvalidGridData: Observable<any>;

  formDetail: FormGroup;
  isAddForm: boolean = false;
  @Input() ExternalAct: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  external: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actionDetails: any[] = [{ code: 'Edit', icon: 'edit', title: 'Edit' }, { code: 'Delete', icon: 'delete', title: 'Delete' }]

  detail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  columns: any[] = [];

  gridDataDetail: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dynamicService: DynamicService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit() {

    let detail = this.gridSectionDetail;

    this.columnFormat();
    this.subs.sink = this.editData.subscribe((data) => {

      if (data != null) {
        let gridData = data[this.gridSectionDetail.SectionName];
        if (gridData != undefined) {
          gridData = gridData[this.gridSectionDetail.SectionName];
          if (Array.isArray(gridData)) {
            gridData.forEach(z => {
              z.id = Utilities.getUniqId();
              z.IsChange = false;
              this.gridDataDetail.push(z);

            })
            this.detail.next(this.gridDataDetail);
          }
          else {
            let singleRow = gridData;//gridData[this.gridSectionDetail.SectionName]
            singleRow.id = Utilities.getUniqId();
            this.gridDataDetail.push(singleRow);
            this.detail.next(this.gridDataDetail);
          }
        }
      }
    })



    this.subs.sink = this.ExternalAct.subscribe((data) => {
      this.external.next(data);
    })

    this.subs.sink = this.InvalidGridData.subscribe((data: any) => {
      let grid = this.gridSectionDetail;
      if (data.SectionName == this.gridSectionDetail.SectionName) {
        this.gridDataDetail = [];
        this.detail.next([]);
      }
    })

  }

  createDetail = () => {
    let ctrl = {}
    let dependanceyCtrl = [];
    this.gridSectionDetail.FormDetail.forEach(element => {
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

    this.formDetail = new FormGroup(ctrl);
  }

  loadDropDown = (ctrl) => {

    if (ctrl.ApiUrl.MethodName != "" && ctrl.ApiUrl.MethodName != null && ctrl.ApiUrl.MethodName != undefined) {
      if (ctrl.ControlType == 'COMBO') {
        this.subs.sink = this.dynamicService.getDropdown(ctrl.ApiUrl.MethodName)
          .subscribe((resp: any) => {
            ctrl.Data = resp;
          }, error => {
            console.log(error);
          })
      }

      if (ctrl.ControlType == 'COMBOSEARCH') {
        this.bindComboSearch(ctrl);
      }

    }
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  showForm() {

    this.createDetail();
    this.isAddForm = !this.isAddForm;
  }

  saveForm = () => {
    if (this.formDetail.valid) {
      var id = Utilities.getUniqId();
      let detail = this.formDetail.value;


      let selectedVal = {};
      for (let ctrl = 0; ctrl < this.gridSectionDetail.FormDetail.length; ctrl++) {
        let field = this.gridSectionDetail.FormDetail[ctrl];

        if (field.ControlType == "COMBO") {
          let ddlSelectedVal = detail[field.ControlName]
          let val = field.Data.find(x => x.Id == ddlSelectedVal);
          selectedVal[field.ControlName] = val;
        }
        else {
          selectedVal[field.ControlName] = detail[field.ControlName];
        }

      }
      selectedVal["id"] = id

      if (this.viewEdit != undefined) {
        this.gridDataDetail = this.gridDataDetail.filter(x => x.id !== this.viewEdit.id);
      }
      selectedVal["IsChange"] = true;
      this.gridDataDetail.push(selectedVal);

      this.detail.next(this.gridDataDetail);
      this.showForm();
      this.viewEdit = undefined;
    }
  }

  cancel = () => {
    this.isAddForm = !this.isAddForm;

  }

  viewEdit: any;
  actionEmit = (event) => {
    if (event.action.code == 'Edit') {
      this.showForm();
      this.viewEdit = event.row;
      let val = {};
      for (let c = 0; c < this.columns.length; c++) {
        let row = this.columns[c];
        let valDetail = event.row[row.field];
        if (typeof valDetail === 'object') {
          val[row.field] = valDetail.Id;
        }
        else {
          val[row.field] = valDetail;
        }
      }
      this.formDetail.patchValue(val);
    }
    else {
      this.gridDataDetail = this.gridDataDetail.filter(x => x.id !== event.row.id);
      this.detail.next(this.gridDataDetail);
    }

  }

  loadPageData = (event) => {

  }

  columnFormat = () => {
    this.gridSectionDetail.FormDetail.forEach(x => {
      let col = {
        title: x.DisplayLabel,
        datatype: "STRING",
        field: x.ControlName
      }
      this.columns.push(col);
    })

  }

  addFormGroup = () => {

    const dialogRef = this.dialog.open(PopUpComponent, {
      panelClass: ['col-md-12', "h-screen"],
      disableClose: true,
      position: { top: '0', right: '0', bottom: '0' },
      data: {

        screenCode: this.screenCode,
        addType: "GROUP"
      }
    });

    this.subs.sink = dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
    //this.open = !this.open;
  }

  bindComboSearch = (ctrl) => {
    let param;
    if (ctrl.PostParam != "" && ctrl.PostParam != null && ctrl.PostParam != undefined) {
      param = JSON.parse(ctrl.PostParam);
      if (param.param != undefined) {
        param.param.forEach(element => {
          let row = element;
          let ctrlDetail = this.gridSectionDetail.FormDetail.find(x => x.ControlName == element.Key);
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
          else {
            ctrl.Data = respDetail;
          }
        }

      }, error => {
        console.log(error);
      })
  }


  actionPerform = () => {

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


}
