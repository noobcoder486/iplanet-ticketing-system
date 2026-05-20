import { Component, Input } from '@angular/core';

@Component({
  selector: 'my-tab',
  styles: [
  ],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input('tabTitle') title: string;
  @Input('gridicon') gridicon : string;
  @Input() active = false;
}