import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'nitc-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
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
