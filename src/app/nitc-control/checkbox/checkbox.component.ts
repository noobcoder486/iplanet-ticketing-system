import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Utilities } from 'src/app/config/util';

@Component({
  selector: 'nitc-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.sass']
})
export class CheckboxComponent implements OnInit {
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
