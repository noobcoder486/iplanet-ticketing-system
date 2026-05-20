import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Utilities } from 'src/app/config/util';

@Component({
  selector: 'app-nitccheckboxvone',
  template: `
    <div [formGroup]="form">
      <input type="checkbox" class="example-margin" id="{{ctrl.ControlName}}" [formControlName]="ctrl.ControlName">
      <label for="{{ctrl.ControlName}}">{{ctrl.DisplayLabel}}</label>
  </div>      
  `
})
export class NitccheckboxvoneComponent implements OnInit {
  @Input() form;
  @Input() ctrl;
  @Input() External: BehaviorSubject<any>;
  @Input() formSection;
  @Input() IsGrid: number = 1


  constructor() { }

  ngOnInit(): void {
    this.External.subscribe((data: any) => {
      if (Utilities.isValidObject(data)) {
        let detail = data.OnLoad.find(x => x.ControlName === this.ctrl.ControlName);
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

}
