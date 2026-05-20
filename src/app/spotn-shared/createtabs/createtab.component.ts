import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'my-tab-create',
  styles: [
  ],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})

export class CreateTabComponent {
  @Input('tabTitle') title: string;
  @Input('gridicon') gridicon : string;
  @Input() active: boolean;
  @Output() activeChange = new EventEmitter();
}
