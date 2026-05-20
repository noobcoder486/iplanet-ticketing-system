import { Injectable, EventEmitter } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Controller, EVENTTYPE } from 'src/app/config/comman.const';
import { Utilities } from 'src/app/config/util';

import { ApiService } from 'src/app/core/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class ReactivityService {

  constructor(
    private apiService: ApiService
  ) { }

  reativeProcess = (externalData: any, ctrl: any, frm: any, ctrlSelected: any,
    childGridEvent: EventEmitter<any>, formSection: any, isGrid: number) => {
    let ctrlEvent = this.EventDetail(externalData, ctrl.ControlName);
    if (!Utilities.isValidObject(ctrlEvent))
      return;

    let detail = this.Actions(externalData, ctrl.ControlName);
    if (detail.length == 0)
      return;

    this.ExecuteEvent(ctrlEvent, detail, ctrl, ctrlSelected, frm, childGridEvent, formSection, externalData, isGrid);
  }

  private ExecuteEvent = (events: any, detail: any, ctrl: any, data: any, form: any, childGridEvent: EventEmitter<any>, formSection: any, externalData: any,
    isGrid: any) => {
    for (let e = 0; e < events.length; e++) {
      let rowEvent = events[e]
      switch (rowEvent.Action) {
        case EVENTTYPE.ACTIVATION:
          let conditional;
          if (rowEvent.PropertyName != "") {
            let textFilter = ctrl.Data.find(x => x.Id == data);
            if (textFilter != undefined) {
              conditional = detail.find(x => x.ConditionVal === textFilter[rowEvent.PropertyName]);
            }

            if (!Utilities.isValidObject(conditional)) {
              let ctrlDetail = detail.find(x => x.ControlName == rowEvent.ControlName);
              ctrlDetail.Action.forEach(element => {
                form.get(element.ActionControl).patchValue("");
                if (element.Value) {
                  form.get(element.ActionControl).clearValidators(); // Clear All Validators
                  form.get(element.ActionControl).updateValueAndValidity();
                  form.get(element.ActionControl).disable();
                }
                else {
                  form.get(element.ActionControl).setValidators([Validators.required]); // 5.Set Required Validator
                  form.get(element.ActionControl).updateValueAndValidity();
                  form.get(element.ActionControl).enable();
                }
              });
            }
          }
          else {
            conditional = detail.find(x => x.ConditionVal === data);
          }

          if (!Utilities.isValidObject(conditional))
            return;

          conditional.Action.forEach(element => {
            if (element.Value) {
              form.get(element.ActionControl).setValidators([Validators.required]); // 5.Set Required Validator
              form.get(element.ActionControl).updateValueAndValidity();
              form.get(element.ActionControl).enable();
            }
            else {
              form.get(element.ActionControl).clearValidators(); // Clear All Validators
              form.get(element.ActionControl).updateValueAndValidity();
              form.get(element.ActionControl).disable();
            }
          });
          break;
        case EVENTTYPE.ASSIGNTO:
          for (let i = 0; i < detail.length; i++) {
            let row = detail[0];
            if (row.API == null) {
              let asingCtrl = row.AssignControl;
              for (let a = 0; a < asingCtrl.length; a++) {
                let ctrlRow = asingCtrl[a];
                let val = ctrl.Data.find(x => x.Id == data);
                if (val != undefined) {
                  //form.patchValue({ [ctrlRow.Control]: val[ctrlRow.FieldName] });
                  form.get(ctrlRow.Control).setValue(val[ctrlRow.FieldName], { emitEvent: false });
                }
              }
            }
            else {
              this.formatUrl(row.API, ctrl, externalData, form, formSection, EVENTTYPE.ASSIGNTO, isGrid);
            }
          }
          break;
        case EVENTTYPE.RESETGRID:
          let ctrlDetail = detail.find(x => x.ControlName === rowEvent.ControlName && x.ActionType == rowEvent.Action);
          childGridEvent.emit(ctrlDetail);
          break;
      }
    }
  }

  private EventDetail = (externalData: any, controlName: any) => {
    return externalData?.Event.filter(x => x.ControlName === controlName);
  }

  private Actions = (externalData: any, controlName: any) => {
    return externalData?.ActionPerform.filter(x => x.ControlName === controlName);
  }


  private formatUrl = (detail, ctrlDetail, ext, frm, formSection, act, isGrid) => {
    let ctrl = [];
    let controls = frm.controls
    for (let c = 0; c < detail.length; c++) {
      let row = detail[c];
      ctrl.push({ [row.FieldName]: controls[row.Control].value })
    }
    let data = {
      Data: JSON.stringify(ctrl),
      ScreenCode: ext.ScreenCode,
      FieldDetail: JSON.stringify({
        FieldName: ctrlDetail.ControlName,
        Section: formSection.SectionName,
        IsGridControl: isGrid
      })
    }

    this.apiService.postData(Controller.Dynamic + 'GetDynamicFieldDetail', data)
      .subscribe((resp: any) => {
        if (Utilities.isValidObject(resp)) {
          let parseObj = JSON.parse(resp);
          if (Utilities.isValidObject(parseObj.Data)) {
            let parseData = JSON.parse(parseObj.Data);

            let patchCtrl = ext.ActionPerform.find(x => x.ControlName == ctrlDetail.ControlName
              && x.ActionType == act)
            for (let r = 0; r < parseData.length; r++) {
              let dataRpw = parseData[r];
              for (let a = 0; a < patchCtrl.AssignControl.length; a++) {
                let dRow = patchCtrl.AssignControl[a];
                if (Utilities.isValidObject(dataRpw[dRow.FieldName])) {
                  frm.get(dRow.Control).setValue(dataRpw[dRow.FieldName], { emitEvent: false });
                }
              }
            }
          }
        }
      },
        error => {
          console.log(error)
        });
  }
}

