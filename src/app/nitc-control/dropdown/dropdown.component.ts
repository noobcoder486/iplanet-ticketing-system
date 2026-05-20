import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CtrList } from 'ng2-completer';
import { BehaviorSubject } from 'rxjs';
import { ReactivityService } from 'src/app/common/Services/dropdownService/reactivity.service';
import { Utilities } from 'src/app/config/util';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { SubSink } from 'src/app/shared/sub-sink';


@Component({
  selector: 'nitc-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.sass']
})
export class DropdownComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @Input() form;
  @Input() ctrl;
  @Input() formSection;
  @Input() IsGrid: number = 1
  selectedId: any;
  @Output()
  dependancyControlEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() External: BehaviorSubject<any>;

  externalData: any;
  dropdownData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Output() searchDetail: EventEmitter<any> = new EventEmitter<any>();
  @Output() childGridEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private dynamicService: DynamicService,
    private eventExecuteService: ReactivityService
  ) {

  }

  ngOnInit(): void {
    this.loadDropDown();


    this.form.get(this.ctrl.ControlName).valueChanges.subscribe((data: any) => {
      if (Utilities.isValidObject(this.ctrl.Dependancy)) {
        this.dependancyControlEvent.next({ ctrl: this.ctrl.Dependancy, selectedVal: data });
      }

      this.eventExecuteService.reativeProcess(this.externalData, this.ctrl, this.form, data, this.childGridEvent, this.formSection, this.IsGrid);

      // let ctrlEvent = this.externalData?.Event.filter(x => x.ControlName == this.ctrl.ControlName);
      // if (!Utilities.isValidObject(ctrlEvent))
      //   return;

      // let detail = this.externalData?.ActionPerform.filter(x => x.ControlName === this.ctrl.ControlName);
      // if (detail.length == 0)
      //   return;

      // if (detail.length > 0) {
      //   for(let e =0; e < ctrlEvent.length; e++){
      //     let rowEvent = ctrlEvent[e]
      //     switch (rowEvent.Action) {
      //       case "ACTIVATION":
      //         let conditional;
      //         // This is for temp fix
      //         if (rowEvent.IsText == true) {
      //           let textFilter = this.ctrl.Data.find(x => x.Id == data);
      //           conditional = detail.find(x => x.ConditionVal === textFilter.Text);
      //         }
      //         else {
      //           conditional = detail.find(x => x.ConditionVal === data);
      //         }


      //         if (!Utilities.isValidObject(conditional))
      //           return;

      //         conditional.Action.forEach(element => {
      //           if (element.Value) {
      //             this.form.get(element.ActionControl).enable();
      //           }
      //           else {
      //             this.form.get(element.ActionControl).disable();
      //           }
      //         });
      //         break;
      //       case "ASSIGNTO":
      //         for(let i =0; i < detail.length;i++){
      //           let row = detail[0];
      //           if(row.API == null){
      //             let asingCtrl = row.AssignControl;
      //             for(let a =0; a < asingCtrl.length;a++){
      //               let ctrlRow  = asingCtrl[a];
      //               let val = this.ctrl.Data.find(x => x.Id == data);
      //               if(val != undefined){
      //                 this.form.patchValue({[ctrlRow.Control]:val[ctrlRow.FieldName]});
      //               }                  
      //             }
      //           }
      //         }

      //         break;
      //       case "RESETGRID":
      //           let ctrlDetail = detail.find(x => x.ControlName === rowEvent.ControlName && x.ActionType == rowEvent.Action);
      //           this.childGridEvent.emit(ctrlDetail);
      //           break
      //     }
      //   }


      // }

    })


    this.External.subscribe((data: any) => {
      if (Utilities.isValidObject(data)) {
        let detail = data.OnLoad.find(x => x.ControlName === this.ctrl.ControlName);
        this.externalData = data;
        if (!Utilities.isValidObject(detail))
          return;

        switch (detail.Action) {
          case "ACTIVATION":
            this.form.get(this.ctrl.ControlName).enable();
            break;
          case "ASSIGNTO":

            break;
        }
      }
    })


  }

  loadDropDown = () => {
    if (Utilities.isValidObject(this.ctrl.ApiUrl.MethodName)) {
      this.subs.sink = this.dynamicService.getDropdown(this.ctrl.ApiUrl.MethodName)
        .subscribe((resp: any) => {
          this.ctrl.Data = resp;
          this.dropdownData.next(resp);

        }, error => {
          console.log(error);
        })
    }
  }

  onKeyPressEvent = (event) => {

  }

  onBlurEvent = (event) => {

  }

  getEmailRequired = (event) => {

  }

  getRequired = (event) => {

  }

  onSearch(event) {
    this.searchDetail.emit({ control: this.ctrl, search: event.term });
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


}
