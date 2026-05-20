import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { GridComponent } from '../spotn-shared/grid/grid.component';
import { TilesComponent } from '../spotn-shared/tiles/tiles.component';
import {HeaderDetailsPanelComponent} from '../spotn-shared/header-details-panel/header-details-panel.component'
import { ComboSelectorComponent } from '../spotn-shared/combo-selector/combo-selector.component';
import { TabComponent}  from '../spotn-shared/tabs/tab.component';
import { TabsComponent  } from '../spotn-shared/tabs/tabs.component';
import { CreateTabComponent } from '../spotn-shared/createtabs/createtab.component';
import {CreateTabsComponent} from '../spotn-shared/createtabs/createtabs.component';
import {tileSvgComponent} from '../spotn-shared/svg-icon/tiles-svg.compontent';
import {NgSelectModule} from '@ng-select/ng-select'
import { DisplaygridComponent } from '../spotn-shared/displaygrid/displaygrid.component';
import { NitccheckboxvoneComponent } from '../spotn-shared/nitccheckboxvone/nitccheckboxvone.component';
import { NitcDatePickerComponent } from '../spotn-shared/datepickerV/datepickerV.components';
import { NitcInputText } from '../spotn-shared/input-control/input.components';
 @NgModule({
  declarations: [
    GridComponent,
    TilesComponent,
    HeaderDetailsPanelComponent,
    ComboSelectorComponent,
    TabComponent,
    TabsComponent,
    tileSvgComponent,
    CreateTabComponent,
    CreateTabsComponent,
    DisplaygridComponent,
    NitccheckboxvoneComponent,
    NitcDatePickerComponent,
    NitcInputText
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    GridComponent,
    TilesComponent,
    HeaderDetailsPanelComponent,
    ComboSelectorComponent,
    TabsComponent,
    TabComponent,
    tileSvgComponent,
    CreateTabComponent,
    CreateTabsComponent,
    DisplaygridComponent,
    NitccheckboxvoneComponent,
    NitcDatePickerComponent,
    NitcInputText
  ]
})
export class SptonSharedModule { }
