import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-datepicker',
  template: `
  <ngx-datepicker [(ngModel)]="date"></ngx-datepicker>
  `
})
export class NitcDatePickerComponent implements OnInit {

    date = new Date();
    @Input() form;
    @Input() ctrl;
    selectedId: any;
    @Input() IsGrid: number = 1
    
    @Input() formSection;
    @Output()
    dependancyControlEvent: EventEmitter<any> = new EventEmitter<any>();
    @Input() External: BehaviorSubject<any>;
    constructor() { }
    
    ngOnInit(): void {
    }
    
    getRequired = (event) => {
    
    }

}












