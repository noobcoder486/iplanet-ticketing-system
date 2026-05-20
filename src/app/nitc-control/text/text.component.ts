import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Utilities } from 'src/app/config/util';
import { ApiService } from 'src/app/core/service/api.service';

@Component({
  selector: 'nitc-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.sass']
})
export class TextComponent implements OnInit {
  @Input() form;
  @Input() ctrl;
  @Input() formSection;
  @Input() External: BehaviorSubject<any> = new BehaviorSubject<any>("");
  dependancyControlEvent: EventEmitter<any> = new EventEmitter<any>();
  externalData: any;
  @Input() IsGrid: number = 1
  constructor(
    private apiService: ApiService 
  ) { }

  ngOnInit(): void {

    this.form.get(this.ctrl.ControlName).valueChanges.subscribe((data: any) => {
      if (Utilities.isValidObject(this.ctrl.Dependancy)) {
        this.dependancyControlEvent.next({ ctrl: this.ctrl.Dependancy, selectedVal: data });
      }

      if(this.externalData == undefined)
        return;

      let ctrlEvent = this.externalData.Event.find(x => x.ControlName == this.ctrl.ControlName);
      if (!Utilities.isValidObject(ctrlEvent))
        return;

      let detail = this.externalData.ActionPerform.filter(x => x.ControlName === this.ctrl.ControlName);
      if (detail.length == 0)
        return;

        
        if (detail.length > 0) {
          switch(ctrlEvent.Action){
            case "ASSIGNTO":
              detail.forEach(element => {
                  if(element.ActionType == "ASSIGNTO"){
                    let passValue = {};
                    element.ControlValue.forEach(element => {
                        passValue = {
                          [element] : this.form.get(element).value
                        }                     
                    });                   
                 
                    this.apiService.postData(element.API,passValue)
                        .subscribe((resp: any) => {
                          if(resp != null && resp != ""){
                            let detail = JSON.parse(resp);
                            element.AssignControl.forEach(element => {                             
                              this.form.patchValue({
                                [element.Control]: detail[element.FieldName]
                              })
                            });
                          }
                          
                        })
                  }
              });
              break;
              case "CALCULATE":
                break;
          }
          
        }
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
    });
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
