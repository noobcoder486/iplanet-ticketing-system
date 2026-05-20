import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-details-panel',
  templateUrl: './header-details-panel.component.html',
  styleUrls: ['./header-details-panel.component.sass']
})
export class HeaderDetailsPanelComponent implements OnInit {

  @Input() headertitle = "";
  constructor() { }

  ngOnInit(): void {
  }

}
