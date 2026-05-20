import {
    Component,
    ContentChildren,
    QueryList,
    AfterContentInit,
    ViewChild,
    ComponentFactoryResolver,
    ViewContainerRef
  } from '@angular/core';
  
  import { TabComponent } from './tab.component';
  
  @Component({
    selector: 'my-tabs',
    template: `
      <ul class="layout_icons_wrapper">
        <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active" class="tab_link">
        <span *ngIf = 'tab.gridicon != null && tab.gridicon != undefined' class="grid_svg_layout layout_icons_content" [innerHtml]=tab.gridicon> </span>  
          <a class="tab_link_content" *ngIf = 'tab.title != null && tab.title != undefined'>{{tab.title}}</a>
        </li>
      </ul> 
      <ng-content></ng-content>
    `,
    styles: [
      `
      .tab-close {
        color: gray;
        text-align: right;
        cursor: pointer;
      }
      `
    ]
  })
  export class TabsComponent implements AfterContentInit {
    
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    ngAfterContentInit() {
      let activeTabs = this.tabs.filter((tab)=>tab.active);
      if(activeTabs.length === 0) {
        this.selectTab(this.tabs.first);
      }
    }
    
    selectTab(tab: any){
      this.tabs.toArray().forEach(tab => tab.active = false);
      tab.active = true;
    }
  }
  