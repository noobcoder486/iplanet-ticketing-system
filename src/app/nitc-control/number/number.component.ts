import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Utilities } from 'src/app/config/util';
import { ReactivityService } from 'src/app/common/Services/dropdownService/reactivity.service';

@Component({
  selector: 'nitc-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.sass']
})
export class NumberComponent implements OnInit {

  @Input() form;
  @Input() ctrl;
  @Input() External: BehaviorSubject<any>;
  externalData: any;
  @Output() childGridEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() formSection;
  @Input() IsGrid: number = 1
  constructor(
    private eventExecuteService: ReactivityService
  ) { }

  ngOnInit(): void {
    this.form.get(this.ctrl.ControlName).valueChanges.subscribe((data: any) => {
      // let ctrlEvent = this.externalData?.Event.find(x => x.ControlName == this.ctrl.ControlName);
      // if (!Utilities.isValidObject(ctrlEvent))
      //   return;

      // let detail = this.externalData?.ActionPerform.filter(x => x.ControlName === this.ctrl.ControlName);
      // if (detail.length == 0)
      //   return;

      this.eventExecuteService.reativeProcess(this.externalData, this.ctrl, this.form, data, this.childGridEvent, this.formSection, this.IsGrid);


    });
    this.External.subscribe((data: any) => {
      if (Utilities.isValidObject(data)) {
        let detail = data.OnLoad.find(x => x.ControlName === this.ctrl.ControlName);
        this.externalData = data;
        if (!Utilities.isValidObject(detail))
          return;

        switch (detail.Action) {
          case "ACTIVATION":
            this.form.get(this.ctrl.ControlName).disable();
            break;
        }

      }
    })
  }

  onKeyPressEvent = (event) => {

  }

  onBlurEvent = (event) => {

  }

  getEmailRequired = (event) => {

  }

  getRequired = (event) => {

  }

}
